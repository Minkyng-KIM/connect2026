/* =========================================================
   AUTH — 데모 모드 / Apps Script 모드 전환 모듈
   CONFIG.auth.appsScriptUrl 이 비어 있으면 데모 모드.
   Apps Script 계약 (README.md 참고):
     POST {action:"login", id, password}  → {ok:true, token, company:{id,name}}
     POST {action:"private", token}       → {ok:true, data:{promoUrl, calendarId, driveFolderId, linkedin, whatsapp, contactPerson}}
   Content-Type: text/plain 으로 보내 CORS preflight를 피합니다.
   ========================================================= */
window.Auth = (function () {
  const KEY = "connect2026.session";
  const url = () => (window.CONFIG.auth.appsScriptUrl || "").trim();
  const isDemo = () => !url();

  function read() {
    let s = null;
    try { s = JSON.parse(sessionStorage.getItem(KEY)) || null; } catch (e) { s = null; }
    // 데모 모드에서 로그인했던 세션이 남아 있으면 실제 로그인으로 전환 시 폐기
    if (s && !!s.demo !== isDemo()) { write(null); return null; }
    return s;
  }
  function write(s) {
    try { s ? sessionStorage.setItem(KEY, JSON.stringify(s)) : sessionStorage.removeItem(KEY); } catch (e) {}
  }

  async function call(payload) {
    const res = await fetch(url(), {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("서버 응답 오류 (" + res.status + ")");
    return res.json();
  }

  async function login(id, password) {
    id = (id || "").trim().toLowerCase();
    if (!id || !password) throw new Error("기업 ID와 비밀번호를 모두 입력하세요.");

    if (isDemo()) {
      const company = window.COMPANIES.find((c) => c.id === id);
      if (!company) throw new Error("등록되지 않은 기업 ID입니다. 기업 목록의 ID를 확인하세요.");
      if (password !== window.CONFIG.auth.demoPassword) throw new Error("비밀번호가 맞지 않습니다.");
      const s = { token: "demo-" + id, company: { id: company.id, name: company.name }, demo: true };
      write(s);
      return s;
    }

    const r = await call({ action: "login", id, password });
    if (!r.ok) throw new Error(r.error || "로그인에 실패했습니다.");
    const s = { token: r.token, company: r.company, demo: false };
    write(s);
    return s;
  }

  async function getPrivate() {
    const s = read();
    if (!s) throw new Error("로그인이 필요합니다.");
    if (s.demo) return (window.CONFIG.demoPrivate || {})[s.company.id] || {};
    const r = await call({ action: "private", token: s.token });
    if (!r.ok) {
      if (r.error === "expired") { write(null); throw new Error("세션이 만료되었습니다. 다시 로그인하세요."); }
      throw new Error(r.error || "데이터를 불러오지 못했습니다.");
    }
    return r.data || {};
  }

  async function update(fields) {
    const s = read();
    if (!s) throw new Error("로그인이 필요합니다.");
    if (s.demo) throw new Error("데모 모드에서는 저장할 수 없습니다.");
    const r = await call({ action: "update", token: s.token, fields });
    if (!r.ok) {
      if (r.error === "expired") { write(null); throw new Error("세션이 만료되었습니다. 다시 로그인하세요."); }
      throw new Error(r.error || "저장하지 못했습니다.");
    }
    return r.data || {};
  }

  return {
    isDemo,
    update,
    session: read,
    login,
    logout: () => write(null),
    getPrivate,
  };
})();
