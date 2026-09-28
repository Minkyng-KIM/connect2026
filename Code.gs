/**
 * CONNECT 2026 · 기업 로그인 & 1:1 파트너링 신청 현황 API
 * ------------------------------------------------------------
 * 이 스크립트는 "CONNECT2026 로그인 관리" 시트에서
 * [확장 프로그램 → Apps Script]로 열어 붙여넣습니다.
 *
 * 관리 시트 첫 번째 탭의 1행(헤더) 순서:
 *   id | name | password | responsesSheet | promoUrl | bookingUrl | formUrl | photoFolder | linkedin | whatsapp | contactPerson
 *
 * 사이트 → 스크립트 요청 (POST, JSON 문자열):
 *   { action: "login",   id, password } → { ok, token, company:{id,name} }
 *   { action: "private", token }        → { ok, data:{ ...링크들, responses:{headers, rows, count} } }
 *   { action: "update",  token, fields:{linkedin, whatsapp, contactPerson} } → { ok, data:{...} }
 */

const SESSION_HOURS = 6;          // 로그인 유지 시간 (최대 6시간)
const MAX_FAILS = 10;             // 10분 안에 비밀번호 10회 틀리면 잠시 잠금
const HIDE_COLUMNS = [/^I agree/i]; // 신청 현황 표에서 숨길 열 (동의 체크 열)

function doPost(e) {
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (req.action === "login") return json(login_(req.id, req.password));
    if (req.action === "private") return json(privateData_(req.token));
    if (req.action === "update") return json(updateProfile_(req.token, req.fields || {}));
    return json({ ok: false, error: "알 수 없는 요청입니다." });
  } catch (err) {
    return json({ ok: false, error: "서버 오류: " + err.message });
  }
}

// 배포 후 주소를 브라우저로 열었을 때 "ok"가 보이면 정상입니다.
function doGet() {
  return ContentService.createTextOutput("ok");
}

/* ---------- 로그인 ---------- */
function login_(id, password) {
  id = String(id || "").trim().toLowerCase();
  password = String(password || "");
  if (!id || !password) return { ok: false, error: "기업 ID와 비밀번호를 모두 입력하세요." };

  const cache = CacheService.getScriptCache();
  const failKey = "fail_" + id;
  const fails = Number(cache.get(failKey) || 0);
  if (fails >= MAX_FAILS) return { ok: false, error: "로그인 시도가 너무 많습니다. 10분 뒤 다시 시도하세요." };

  const row = findCompany_(id);
  if (!row || String(row.password) !== password) {
    cache.put(failKey, String(fails + 1), 600);
    return { ok: false, error: "ID 또는 비밀번호가 맞지 않습니다." };
  }

  cache.remove(failKey);
  const token = Utilities.getUuid();
  cache.put("tok_" + token, id, SESSION_HOURS * 3600);
  return { ok: true, token: token, company: { id: row.id, name: row.name } };
}

/* ---------- 기업 전용 데이터 ---------- */
function privateData_(token) {
  const id = CacheService.getScriptCache().get("tok_" + String(token || ""));
  if (!id) return { ok: false, error: "expired" };

  const row = findCompany_(id);
  if (!row) return { ok: false, error: "기업 정보를 찾을 수 없습니다." };

  return {
    ok: true,
    data: {
      promoUrl: row.promoUrl || "",
      bookingUrl: row.bookingUrl || "",
      formUrl: row.formUrl || "",
      photoFolder: row.photoFolder || "",
      linkedin: row.linkedin || "",
      whatsapp: row.whatsapp || "",
      contactPerson: row.contactPerson || "",
      responses: readResponses_(row.responsesSheet),
    },
  };
}

function readResponses_(url) {
  if (!url) return null;
  try {
    const sheet = SpreadsheetApp.openByUrl(url).getSheets()[0];
    const values = sheet.getDataRange().getDisplayValues();
    if (!values.length) return { headers: [], rows: [], count: 0 };

    const header = values[0].map((h) => String(h).trim());
    const keep = header.map((h, i) => (h && !HIDE_COLUMNS.some((re) => re.test(h)) ? i : -1)).filter((i) => i >= 0);
    const rows = values
      .slice(1)
      .filter((r) => r.some((c) => String(c).trim() !== ""))
      .map((r) => keep.map((i) => r[i]))
      .reverse(); // 최신 신청이 위로

    return { headers: keep.map((i) => header[i]), rows: rows, count: rows.length };
  } catch (err) {
    return { error: "신청 현황 시트를 열 수 없습니다. 시트 주소와 권한을 확인하세요." };
  }
}

/* ---------- 기업이 직접 입력하는 정보 저장 ----------
   기업은 아래 EDITABLE 에 있는 칸만 바꿀 수 있습니다. (링크·비밀번호는 운영사만 수정) */
const EDITABLE = {
  linkedin: (v) => v === "" || /^https:\/\/([a-z]{2,3}\.)?(www\.)?linkedin\.com\//i.test(v) ? "" : "LinkedIn 주소는 https://www.linkedin.com/ 으로 시작해야 합니다.",
  whatsapp: (v) => v === "" || /^\d{8,15}$/.test(v) ? "" : "WhatsApp 번호는 국가번호 포함 숫자 8~15자리로 입력하세요. (예: 821012345678)",
  contactPerson: (v) => v.length <= 80 ? "" : "담당자는 80자 이내로 입력하세요.",
};

function updateProfile_(token, fields) {
  const id = CacheService.getScriptCache().get("tok_" + String(token || ""));
  if (!id) return { ok: false, error: "expired" };

  const clean = {};
  for (const key in EDITABLE) {
    if (!(key in fields)) continue;
    let v = String(fields[key] == null ? "" : fields[key]).trim();
    if (key === "whatsapp") v = v.replace(/[^\d]/g, "");
    if (/^[=+\-@]/.test(v)) v = "'" + v; // 시트 수식 입력 방지
    const err = EDITABLE[key](v.replace(/^'/, ""));
    if (err) return { ok: false, error: err };
    clean[key] = v;
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const values = sheet.getDataRange().getDisplayValues();
    const head = values[0].map((h) => String(h).trim());
    const r = values.findIndex((row, i) => i > 0 && String(row[head.indexOf("id")]).trim().toLowerCase() === id);
    if (r < 1) return { ok: false, error: "기업 정보를 찾을 수 없습니다." };
    for (const key in clean) {
      const c = head.indexOf(key);
      if (c >= 0) sheet.getRange(r + 1, c + 1).setValue(clean[key]);
    }
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  return privateData_(token);
}

/* ---------- 관리 시트 읽기 ---------- */
function findCompany_(id) {
  const values = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].getDataRange().getDisplayValues();
  const head = values[0].map((h) => String(h).trim());
  for (let r = 1; r < values.length; r++) {
    const obj = {};
    head.forEach((h, i) => (obj[h] = String(values[r][i] || "").trim()));
    if (obj.id && obj.id.toLowerCase() === id) return obj;
  }
  return null;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- 배포 전 테스트용 ----------
   편집기 위쪽에서 testLogin 을 선택하고 ▶ 실행 → 아래 '실행 로그'에서 결과 확인 */
function testLogin() {
  const first = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].getRange(2, 1, 1, 3).getDisplayValues()[0];
  const r = login_(first[0], first[2]);
  Logger.log(JSON.stringify(r));
  if (r.ok) Logger.log(JSON.stringify(privateData_(r.token)).slice(0, 1500));
}
