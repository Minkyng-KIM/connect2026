/* =========================================================
   APP — hash router + views (GitHub Pages 호환, 빌드 불필요)
   ========================================================= */
(function () {
  const $app = document.getElementById("app");
  const C = window.CONFIG, S = window.SCHEDULE, CO = window.COMPANIES;
  const DAYS = C.event.days;

  /* ---------- helpers ---------- */
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const TBC = '<span class="tbc">업데이트 예정</span>';
  const val = (v) => (v ? esc(v) : TBC);
  const initials = (n) => n.replace(/(Co\.|Ltd\.|Inc\.|,)/g, "").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const digits = (s) => String(s || "").replace(/[^\d]/g, "");
  const tel = (s) => "tel:" + String(s || "").replace(/[^\d+]/g, "");

  // Singapore time (UTC+8) → epoch ms
  const sgt = (day, hhmm) => {
    const [y, m, d] = day.split("-").map(Number), [h, mi] = hhmm.split(":").map(Number);
    return Date.UTC(y, m - 1, d, h - 8, mi);
  };
  const nowMs = () => {
    const q = new URLSearchParams(location.search).get("now"); // 테스트용: ?now=2026-10-08T14:35
    if (q) { const [d, t] = q.split("T"); return sgt(d, t || "00:00"); }
    return Date.now();
  };
  const sgClock = () => new Date(nowMs() + 8 * 3600e3).toISOString().slice(11, 16);

  function allSlots() {
    return DAYS.flatMap((d) => S[d].slots.map((s) => ({ ...s, day: d, t0: sgt(d, s.start), t1: sgt(d, s.end) })));
  }

  function liveState() {
    const n = nowMs(), slots = allSlots();
    const first = slots[0], last = slots[slots.length - 1];
    if (n < first.t0) return { phase: "before", next: first, days: Math.ceil((first.t0 - n) / 864e5) };
    if (n >= last.t1) return { phase: "after" };
    const cur = slots.find((s) => n >= s.t0 && n < s.t1);
    const next = slots.find((s) => s.t0 > n);
    return { phase: "live", cur, next };
  }

  function pitcherNow() {
    const n = nowMs();
    return CO.find((c) => n >= sgt(DAYS[0], c.pitch) && n < sgt(DAYS[0], c.pitch) + 10 * 60e3) || null;
  }

  function typeLabel(t) {
    return { ops: "운영", session: "세션", network: "네트워킹 피크", key: "CONNECT 핵심" }[t] || "";
  }

  /* ---------- views ---------- */
  function viewHome() {
    const st = liveState();
    let live = "";
    if (st.phase === "before") {
      live = `<div class="live">
        <p class="live-k">행사 시작까지</p>
        <p class="live-big">D-${st.days}</p>
        <p class="live-s">첫 일정 · ${esc(S[st.next.day].ko)} ${st.next.start} ${esc(st.next.ko.split("—")[0])}</p>
      </div>`;
    } else if (st.phase === "live") {
      live = `<div class="live is-on">
        <p class="live-k"><span class="dot"></span>지금 · SGT ${sgClock()}</p>
        ${st.cur ? `<p class="live-now">${st.cur.pitch ? "Pitchstop 진행 중" : esc(st.cur.ko.split("—")[0])}</p><p class="live-s">${st.cur.start}–${st.cur.end} · ${typeLabel(st.cur.type)}${st.cur.pitch && pitcherNow() ? " · 발표: " + esc(pitcherNow().name) : ""}</p>` : `<p class="live-now">휴식 시간</p>`}
        ${st.next ? `<p class="live-next">다음 ${st.next.start} · ${esc(st.next.ko.split("—")[0])}</p>` : ""}
      </div>`;
    } else {
      live = `<div class="live"><p class="live-k">행사 종료</p><p class="live-now">함께해주셔서 감사합니다.</p><p class="live-s">후속 미팅 현황은 MY에서 확인하세요.</p></div>`;
    }

    const tiles = [
      ["#/guide", "안내사항", "현장 운영 가이드 (Notion)"],
      ["#/schedule", "CONNECT 전체일정", "10.8–10.9 추천 세션 · Pitchstop"],
      ["#/companies", "기업 브로슈어", `참여 스타트업 ${CO.length}개사`],
      ["#/shbc", "SHBC 전체일정", "Singapore Health & Biomedical Congress"],
      ["#/contact", "운영사 연락", "WhatsApp · 카카오톡 · 전화"],
      ["#/my", "스타트업 정보 (로그인)", "미팅현황 · 사진 · 홍보페이지"],
    ];

    return `
      <section class="hero">
        <div class="hero-ring" aria-hidden="true"></div>
        <div class="wrap">
          <h1 class="hero-title">CONNECT<br><span>2026</span></h1>
          <p class="hero-sub">Global Open Innovation Roadshow<br>at SHBC 2026 · Singapore Expo · 8–9 October</p>
          ${live}
        </div>
      </section>
      <section class="wrap">
        <div class="tiles">
          ${tiles.map(([h, t, d]) => `<a class="tile" href="${h}"><strong>${t}</strong><span>${d}</span></a>`).join("")}
        </div>
      </section>`;
  }

  function slotHTML(s, day, n) {
    const t0 = sgt(day, s.start), t1 = sgt(day, s.end);
    const on = n >= t0 && n < t1;
    return `<li class="slot t-${s.type}${on ? " is-now" : ""}">
      <div class="slot-time"><b>${s.start}</b><span>${s.end}</span></div>
      <div class="slot-body">
        <p class="slot-tag">${typeLabel(s.type)}${on ? ' <em>진행 중</em>' : ""}</p>
        <h3>${esc(s.title)}</h3>
        <p class="slot-ko">${esc(s.ko)}</p>
        ${s.recs?.length ? `<ul class="recs">${s.recs.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
        ${s.parallel ? `<div class="parallel"><p>동시 진행 세션</p>${s.parallel.map((p) => `<div class="par"><strong>${esc(p.title)}</strong><span>${esc(p.ko)}</span><em>${esc(p.rec)}</em></div>`).join("")}</div>` : ""}
        ${s.pitch ? pitchList(day, n) : ""}
      </div>
    </li>`;
  }

  function pitchList(day, n) {
    return `<ol class="pitch">${CO.map((c) => {
      const [h, m] = c.pitch.split(":").map(Number);
      const end = `${String(h + (m + 10 >= 60 ? 1 : 0)).padStart(2, "0")}:${String((m + 10) % 60).padStart(2, "0")}`;
      const on = n >= sgt(day, c.pitch) && n < sgt(day, end);
      return `<li class="${on ? "is-now" : ""}"><span>${c.pitch}</span><a href="#/company/${c.id}">${esc(c.name)}</a></li>`;
    }).join("")}</ol><p class="note">기업별 5분 발표 + 5분 Q&A</p>`;
  }

  function viewSchedule(dayParam) {
    const n = nowMs();
    let day = DAYS.find((d) => d.endsWith(dayParam)) || null;
    if (!day) { const today = new Date(n + 8 * 3600e3).toISOString().slice(0, 10); day = DAYS.includes(today) ? today : DAYS[0]; }
    return `
      <section class="wrap page">
        <h1 class="page-title">CONNECT 2026 전체일정</h1>
        <p class="lede">참여 스타트업을 위한 추천 세션과 현장 안내입니다. 시간은 모두 싱가포르 시간(SGT)입니다.</p>
        <div class="daytabs" role="tablist">
          ${DAYS.map((d) => `<a role="tab" aria-selected="${d === day}" href="#/schedule/${d.slice(-2)}" class="${d === day ? "on" : ""}"><b>${S[d].label}</b><span>${S[d].ko}</span></a>`).join("")}
          <a class="shbc-tab" href="${C.links.shbcProgramme}" target="_blank" rel="noopener"><b>SHBC 전체일정</b><span>shbc.com.sg ↗</span></a>
        </div>
        <ol class="timeline">${S[day].slots.map((s) => slotHTML(s, day, n)).join("")}</ol>
        <p class="note">전체 프로그램: <a href="${C.links.shbcProgramme}" target="_blank" rel="noopener">shbc.com.sg/programme</a></p>
      </section>`;
  }

  function viewCompanies() {
    return `
      <section class="wrap page">
        <h1 class="page-title">참여기업 브로슈어</h1>
        <p class="lede">CONNECT 2026에 참여하는 한국 스타트업 ${CO.length}개사입니다. 기업을 누르면 상세 브로슈어가 열립니다.</p>
        <ul class="cos">
          ${CO.map((c) => `<li><a class="co" href="#/company/${c.id}">
            <span class="logo-ph" aria-hidden="true">${initials(c.name)}</span>
            <span class="co-main"><strong>${esc(c.name)}</strong><span>${esc(c.summary)}</span>
            <span class="tags">${c.tags.map((t) => `<i>${esc(t)}</i>`).join("")}</span></span>
            <span class="co-pitch">Pitch<br><b>${c.pitch}</b></span>
          </a></li>`).join("")}
        </ul>
      </section>`;
  }

  function viewCompany(id) {
    const c = CO.find((x) => x.id === id);
    if (!c) return notFound();
    const s = Auth.session();
    const mine = s && s.company.id === c.id;
    const i = CO.indexOf(c), prev = CO[i - 1], next = CO[i + 1];
    return `
      <article class="wrap page brochure">
        <a class="back" href="#/companies">기업 목록</a>
        <header class="bro-head">
          <span class="logo-ph lg" aria-hidden="true">${initials(c.name)}</span>
          <div>
            <p class="bro-no">K-Startups ${String(c.no).padStart(2, "0")} / ${String(CO.length).padStart(2, "0")}</p>
            <h1>${esc(c.name)}</h1>
            ${c.legal ? `<p class="bro-legal">(of ${esc(c.legal)})</p>` : ""}
            ${c.tagline ? `<p class="bro-tag">${esc(c.tagline)}</p>` : ""}
          </div>
        </header>
        <dl class="facts">
          <div><dt>대표</dt><dd>${val(c.rep)}</dd></div>
          <div><dt>설립</dt><dd>${val(c.founded)}</dd></div>
          <div><dt>소재지</dt><dd>${val(c.location)}</dd></div>
          <div><dt>Pitchstop</dt><dd>10.8 ${c.pitch} SGT</dd></div>
        </dl>
        <div class="photo-ph" aria-label="Product / team photo placeholder">Product / team photo</div>
        <section class="bro-sec"><h2>Core Business</h2><p>${c.core ? esc(c.core) : esc(c.summary)}</p></section>
        <section class="bro-sec"><h2>Key Achievements</h2><p>${val(c.achievements)}</p></section>
        <section class="bro-sec"><h2>Global Expansion Focus</h2><p>${val(c.expansion)}</p></section>
        <section class="bro-sec"><h2>Contact</h2>
          <p>${c.website ? `<a href="${esc(c.website)}" target="_blank" rel="noopener">${esc(c.website)}</a>` : TBC}<br>
          ${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ""} ${c.contactPerson ? esc(c.contactPerson) : ""}</p>
        </section>
        ${mine ? `<a class="btn" href="#/my">스타트업 정보 열기</a>` : ""}
        <nav class="pager">
          ${prev ? `<a href="#/company/${prev.id}"><span>이전</span>${esc(prev.name)}</a>` : "<span></span>"}
          ${next ? `<a class="r" href="#/company/${next.id}"><span>다음</span>${esc(next.name)}</a>` : "<span></span>"}
        </nav>
      </article>`;
  }

  function linkCard(href, title, desc, cta) {
    return `<a class="linkcard" href="${href}" target="_blank" rel="noopener"><strong>${title}</strong><span>${desc}</span><em>${cta}</em></a>`;
  }

  function checks(items) {
    return `<ul class="checks">${items.map(([t, d]) => `<li><strong>${t}</strong><p>${d}</p></li>`).join("")}</ul>`;
  }

  function viewGuide() {
    return `
      <article class="wrap page guide">
        <h1 class="page-title">2026 싱가포르 헬스&바이오메디컬 컨퍼런스(SHBC) - Research & Innovation</h1>
        <p class="g-en">Research & Innovation @ NHG Health Exhibition at the Singapore Health & Biomedical Congress (SHBC) 2026</p>
        <p class="lede">Singapore Health & Biomedical Congress(SHBC) 2026 참가를 통해 싱가포르 대표 의료·바이오 컨퍼런스에서 글로벌 임상의, 연구기관 및 산업 관계자들과 교류하고, 국내 헬스케어 스타트업의 글로벌 사업화 및 임상 협력 기회를 확대합니다. Research & Innovation @ NHG Health Exhibition 내 스타트업 전시, 피칭 세션, NHG Health 임상의와의 1:1 미팅까지! SHBC 2026 프로그램을 한눈에 확인해 보세요. 🙌</p>

        <section class="g-sec">
          <h2>🎪 SHBC 소개</h2>
          <figure class="g-logo shbc"><img src="shbc-logo.jpg" alt="Singapore Health & Biomedical Congress 2026 로고" width="1000" height="500" loading="lazy"></figure>
          <p><strong>Singapore Health & Biomedical Congress (SHBC)</strong>는 <strong>NHG Health가 매년 개최하는 대표적인 헬스케어·바이오메디컬 컨퍼런스</strong>로, 의료·연구·산업 분야 전문가들이 한자리에 모여 최신 의료기술과 연구 성과를 공유하는 싱가포르의 대표적인 학술 및 산업 행사입니다.</p>
          ${checks([
            ["싱가포르 대표 헬스케어·바이오메디컬 컨퍼런스", "<strong>NHG Health</strong>의 연례 플래그십(Flagship) 행사로, 의료 혁신과 연구 성과를 공유하고 미래 의료 발전 방향을 논의하는 싱가포르의 대표적인 헬스케어·바이오메디컬 행사입니다."],
            ["3,600명 이상의 국내외 의료·바이오 전문가 참여", "의료진, 과학자, 연구자, 병원 관리자, 커뮤니티 케어 기관, 산업계 전문가 및 학생 등 <strong>3,600명 이상의 국내외 참가자</strong>가 참석하여 최신 연구, 임상 사례 및 혁신 기술을 공유하고 협력 네트워크를 구축합니다."],
            ["산학연 협력을 통한 의료 혁신 플랫폼", "헬스케어 산업과 연구기관, 의료기관을 연결하는 협력 플랫폼으로서 의료기술 혁신, 연구 협력, 오픈이노베이션 및 글로벌 파트너십을 촉진하며, 보다 건강하고 지속가능한 지역사회 구축을 목표로 합니다."],
          ])}
        </section>

        <section class="g-sec">
          <h2>🧬 NHG Health 소개</h2>
          <figure class="g-logo nhg"><img src="nhg-logo.png" alt="NHG Health 로고" width="500" height="323" loading="lazy"></figure>
          <p><strong>NHG Health</strong>는 싱가포르를 대표하는 공공 의료기관으로, <strong>예방 중심의 의료서비스와 환자 중심(Person-centred)의 헬스케어</strong>를 통해 국민의 건강한 삶을 지원하고 있습니다.</p>
          ${checks([
            ["예방 중심의 통합 헬스케어 제공", "우수한 임상 진료를 기반으로 예방의학, 건강증진, 맞춤형 의료서비스를 제공하며, 생애주기별 건강관리 프로그램을 통해 질병 치료를 넘어 지속 가능한 건강 증진을 실현하고 있습니다."],
            ["의료 연구·교육 및 헬스케어 혁신 선도", "대학, 연구기관 및 산업계와 협력하여 의학교육, 임상연구, 디지털 헬스케어 및 의료기술 혁신을 추진하며, 싱가포르 의료산업의 발전과 국가 보건 과제 해결에 기여하고 있습니다."],
            ["지역사회 기반 통합 건강관리 체계 운영", "싱가포르 <strong>중부(Central) 및 북부(North) 지역의 Regional Health Manager</strong>로서 지역 병·의원(General Practice), 보건기관 및 사회복지기관과 협력해 주민들의 <strong>신체적·정신적·사회적 건강</strong>을 통합적으로 관리하는 지역 기반 의료서비스를 운영하고 있습니다."],
          ])}
        </section>

        <section class="g-sec">
          <h2>🗓️ 프로그램 개요</h2>
          <dl class="overview">
            <div><dt>프로그램명</dt><dd>Singapore Health & Biomedical Congress (SHBC) 2026 - Research & Innovation</dd></div>
            <div><dt>목적</dt><dd>SHBC 참가자들을 대상으로 스타트업의 역량 및 솔루션을 홍보할 수 있는 기회 제공</dd></div>
            <div><dt>일정</dt><dd>2026년 10월 8일(목) ~ 10월 9일(금)</dd></div>
            <div><dt>장소</dt><dd>Singapore Expo<br><a href="https://www.google.com/maps/search/?api=1&query=1+Expo+Dr+Singapore+486150" target="_blank" rel="noopener">📍 1 Expo Dr, Singapore 486150</a></dd></div>
            <div><dt>참가 대상</dt><dd>헬스&바이오메디컬 스타트업 8개사</dd></div>
          </dl>
        </section>

        <section class="g-sec">
          <h2>🎁 프로그램 참여 혜택</h2>
          <ul class="benefits">
            <li><strong>Full Congress Pass 지원</strong><p>Full Congress Pass로 이틀 간 진행되는 모든 컨퍼런스 세션 참석 및 전시 구역 입장 가능<br>Tea Break 및 Lunch 제공</p></li>
            <li><strong>스타트업 쇼케이스 전시 공간 제공</strong><p>Research and Innovation @ NHG Health 전시 구역 내 8개 스타트업 개별 공간 배정<br>카운터(약 높이 1m x 길이 1m x 폭 0.5m 상당, 전면 기업 로고 인쇄 포함, 1개) 및 풀업 배너, 전원 콘센트 제공</p></li>
            <li><strong>스타트업 전용 투자 피칭 세션 운영</strong><p>Research and Innovation @ NHG Health 무대 내 약 1시간의 전용 프로그램 배정<br><span class="small">* 공용 무대를 사용하며, 전체 무대 일정 중 특정 세션을 전용으로 확보하는 방식</span><br>기업 당 발표 5분, Q&A 5분으로 총 10분 배정</p>
              <figure class="g-photo"><img src="pitchstop-2025.jpg" alt="2025 The Pitchstop 현장 사진" loading="lazy"><figcaption>&lt;2025 The Pitchstop&gt;</figcaption></figure></li>
            <li><strong>투자사 피드백 리포트 제공</strong><p>피칭 세션 종료 후 투자사 피드백 리포트(5-7건) 제공</p></li>
            <li><strong>스타트업별 맞춤형 1:1 미팅 3회 지원</strong><p>핵심 밸류 프로포지션인 NHG Health 소속 관련 임상의(Clinician)들과의 큐레이션된 1:1 미팅 3회 보장<br><span class="small">* 행사 전/후 온라인 미팅으로 진행 예정이나, 임상의 일정이 가능한 경우 현장 대면 미팅 진행 가능</span></p></li>
            <li><strong>전시 공간 예시</strong>
              <figure class="g-photo"><img src="booth-example.jpg" alt="Research & Innovation @ NHG Health 전시 공간 예시" loading="lazy"><figcaption>&lt;전시 공간 예시&gt;</figcaption></figure></li>
          </ul>
        </section>

        <p class="note">원문 및 사진: <a href="${C.links.guide}" target="_blank" rel="noopener">Notion 안내 페이지</a></p>
      </article>`;
  }

  function viewSHBC() {
    return `
      <section class="wrap page">
        <figure class="g-logo shbc"><img src="shbc-logo.jpg" alt="Singapore Health & Biomedical Congress 2026 로고" width="1000" height="500"></figure>
        <h1 class="page-title">SHBC 전체일정</h1>
        <p class="lede">Singapore Health & Biomedical Congress는 NHG Health의 연례 대표 헬스케어 컨퍼런스로, 23회째 매년 3,600명 이상이 참석합니다.</p>
        ${linkCard(C.links.shbc, "SHBC 공식 웹사이트", "세션, 연사, 전시 정보 전체", "shbc.com.sg 열기")}
        ${linkCard(C.links.shbcProgramme, "SHBC 전체 프로그램 & 시간표", "모든 트랙과 세션의 공식 일정", "프로그램 보기")}
        <dl class="stats">
          <div><dt>23</dt><dd>Editions of SHBC</dd></div>
          <div><dt>3,600+</dt><dd>Delegates annually</dd></div>
          <div><dt>1.5M</dt><dd>Residents served by NHG Health</dd></div>
        </dl>
        <figure class="g-logo nhg sm"><img src="nhg-logo.png" alt="NHG Health 로고" width="500" height="323" loading="lazy"></figure>
        <p class="note">Organised by NHG Health · Co-organised with Lee Kong Chian School of Medicine · Supported by STB, Singapore Exhibition & Convention Bureau</p>
      </section>`;
  }

  function contactButtons(p) {
    const b = [];
    if (p.whatsapp) b.push(`<a class="cbtn wa" href="https://wa.me/${digits(p.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a>`);
    if (p.kakao) b.push(`<a class="cbtn kk" href="${esc(p.kakao)}" target="_blank" rel="noopener">카카오톡</a>`);
    if (p.phone) b.push(`<a class="cbtn ph" href="${tel(p.phone)}">전화하기</a>`);
    return b.join("");
  }

  function viewContact() {
    return `
      <section class="wrap page">
        <h1 class="page-title">운영사 연락</h1>
        <p class="lede">현장에서 도움이 필요하면 바로 연락하세요. 싱가포르 현지에서는 WhatsApp이 가장 빠릅니다.</p>
        <ul class="contacts">
          ${C.contacts.map((p) => `<li class="contact">
            <div><strong>${esc(p.name)}</strong><span>${esc(p.role)}</span>${p.phone ? `<span class="num">${esc(p.phone)}</span>` : ""}</div>
            <div class="cbtns">${contactButtons(p)}</div>
          </li>`).join("")}
        </ul>
        <p class="note">WhatsApp 버튼은 대화창을 엽니다. 음성통화는 대화창 상단의 통화 버튼을 누르세요.</p>
      </section>`;
  }

  function viewLogin() {
    const s = Auth.session();
    if (s) { location.hash = "#/my"; return ""; }
    return `
      <section class="wrap page narrow">
        <h1 class="page-title">기업 로그인</h1>
        <p class="lede">미팅현황, 기업 사진, 홍보페이지는 참여기업 전용입니다. 운영사에서 받은 ID로 로그인하세요.</p>
        ${Auth.isDemo() ? `<p class="demo">데모 모드 — 기업 ID(예: <code>beyondmedicine</code>)와 데모 비밀번호로 로그인됩니다. 실제 운영 전 Apps Script로 전환하세요.</p>` : ""}
        <form id="loginForm" class="form" novalidate>
          <label>기업 ID<input name="id" autocomplete="username" autocapitalize="none" required /></label>
          <label>비밀번호<input name="password" type="password" autocomplete="current-password" required /></label>
          <p class="err" id="loginErr" role="alert"></p>
          <button class="btn" type="submit">로그인</button>
        </form>
      </section>`;
  }

  function viewMy() {
    const s = Auth.session();
    if (!s) {
      return `<section class="wrap page narrow">
        <h1 class="page-title">스타트업 정보</h1>
        <p class="lede">로그인하면 우리 기업의 미팅 일정, 현장 사진, 홍보페이지, 연락 정보를 한곳에서 볼 수 있습니다.</p>
        <a class="btn" href="#/login">로그인</a></section>`;
    }
    const c = CO.find((x) => x.id === s.company.id) || { name: s.company.name, id: s.company.id };
    setTimeout(loadPrivate, 0);
    return `
      <section class="wrap page">
        <div class="my-head">
          <div><p class="bro-no">스타트업 정보</p><h1 class="page-title">${esc(c.name)}</h1></div>
          <button class="btn ghost sm" id="logoutBtn" type="button">로그아웃</button>
        </div>
        <div id="myBody" class="my-grid"><p class="loading">불러오는 중…</p></div>
      </section>`;
  }

  async function loadPrivate() {
    const box = document.getElementById("myBody");
    if (!box) return;
    let d;
    try { d = await Auth.getPrivate(); }
    catch (e) { box.innerHTML = `<p class="err">${esc(e.message)}</p>`; return; }
    const s = Auth.session();
    const c = CO.find((x) => x.id === s.company.id) || {};
    const empty = (what) => `<p class="empty">${what}</p>`;

    const promo = d.promoUrl
      ? `<a class="linkcard in" href="${esc(d.promoUrl)}" target="_blank" rel="noopener"><strong>홍보페이지 열기</strong><span>부스 QR로 연결되는 우리 기업 온라인 페이지</span><em>새 창에서 보기</em></a>
         <button class="btn ghost sm" type="button" data-copy="${esc(d.promoUrl)}">링크 복사</button>`
      : empty("아직 연결된 홍보페이지가 없습니다. 운영사에 페이지 링크를 전달해 주세요.");

    const folderId = ((d.photoFolder || "").match(/folders\/([\w-]+)/) || [])[1] || d.driveFolderId || "";
    const bookingSrc = d.bookingUrl ? d.bookingUrl + (d.bookingUrl.includes("?") ? "&" : "?") + "gv=true" : "";

    const partnering = `
      ${d.bookingUrl && !d.bookingUrl.includes("/appointments/schedules/")
        ? `<a class="linkcard in" href="${esc(d.bookingUrl)}" target="_blank" rel="noopener"><strong>1:1 파트너링 캘린더</strong><span>예약 가능한 미팅 시간을 확인하고 예약하는 페이지</span><em>캘린더 열기</em></a>
           <div class="btnrow"><button class="btn ghost sm" type="button" data-copy="${esc(d.bookingUrl)}">링크 복사</button></div>`
        : d.bookingUrl
        ? `<div class="embed tall"><iframe title="1:1 파트너링 캘린더" loading="lazy" src="${esc(bookingSrc)}"></iframe></div>
           <div class="btnrow"><a class="btn ghost sm" href="${esc(d.bookingUrl)}" target="_blank" rel="noopener">캘린더 새 창에서 열기</a>
           <button class="btn ghost sm" type="button" data-copy="${esc(d.bookingUrl)}">링크 복사</button></div>`
        : empty("1:1 파트너링 캘린더가 아직 연결되지 않았습니다.")}
      ${d.formUrl
        ? `<a class="linkcard in" href="${esc(d.formUrl)}" target="_blank" rel="noopener"><strong>1:1 파트너링 신청</strong><span>미팅을 원하는 파트너가 작성하는 신청서</span><em>신청서 열기</em></a>
           <button class="btn ghost sm" type="button" data-copy="${esc(d.formUrl)}">링크 복사</button>`
        : empty("1:1 파트너링 신청서가 아직 연결되지 않았습니다.")}`;

    const responses = d.responsesUrl
      ? `<a class="linkcard in" href="${esc(d.responsesUrl)}" target="_blank" rel="noopener"><strong>신청 현황 시트 열기</strong><span>1:1 파트너링을 신청한 방문객의 이름, 소속, 연락처, 관심 협력 분야를 확인할 수 있습니다.</span><em>Google 스프레드시트에서 보기</em></a>
         <p class="note">방문객 개인정보가 담긴 시트라 공유받은 구글 계정으로만 열립니다. 열리지 않으면 운영사에 권한을 요청하세요.</p>`
      : empty("신청 현황 시트가 아직 연결되지 않았습니다.");

    const photos = folderId
      ? `<div class="embed tall"><iframe title="기업 사진" loading="lazy" src="https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#grid"></iframe></div>
         <div class="btnrow"><a class="btn sm" href="https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}" target="_blank" rel="noopener">사진 올리기</a></div>
         <p class="note">사진 올리기를 누르면 구글 드라이브 폴더가 열립니다. 보여주고 싶은 사진을 끌어다 놓으면 이곳에 표시됩니다.</p>`
      : empty("사진 폴더가 아직 연결되지 않았습니다.");

    const social = `<dl class="facts compact">
        <div><dt>LinkedIn</dt><dd>${d.linkedin ? `<a href="${esc(d.linkedin)}" target="_blank" rel="noopener">${esc(d.linkedin.replace(/^https?:\/\/(www\.)?/, ""))}</a>` : TBC}</dd></div>
        <div><dt>WhatsApp</dt><dd>${d.whatsapp ? `<a href="https://wa.me/${digits(d.whatsapp)}" target="_blank" rel="noopener">+${digits(d.whatsapp)}</a>` : TBC}</dd></div>
        <div><dt>담당자</dt><dd>${val(d.contactPerson)}</dd></div>
        <div><dt>Pitchstop</dt><dd>${c.pitch ? "10.8 " + c.pitch + " SGT" : TBC}</dd></div>
      </dl>`;

    box.innerHTML = `
      <section class="panel"><h2>1:1 파트너링 신청 현황</h2>${responses}</section>
      <section class="panel"><h2>1:1 파트너링</h2>${partnering}</section>
      <section class="panel"><h2>홍보페이지</h2>${promo}</section>
      <section class="panel"><h2>LinkedIn · WhatsApp</h2>${social}</section>
      <section class="panel wide"><h2>기업 사진</h2>${photos}</section>`;
  }

  function notFound() {
    return `<section class="wrap page narrow"><h1 class="page-title">페이지를 찾을 수 없습니다</h1><p class="lede">주소가 바뀌었거나 삭제된 페이지입니다.</p><a class="btn" href="#/">홈으로</a></section>`;
  }

  /* ---------- router ---------- */
  function route(keepScroll) {
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    const [p, a] = parts;
    const views = {
      "": viewHome, schedule: () => viewSchedule(a), companies: viewCompanies,
      company: () => viewCompany(a), guide: viewGuide, shbc: viewSHBC,
      contact: viewContact, login: viewLogin, my: viewMy,
    };
    const html = (views[p] || notFound)();
    if (html) $app.innerHTML = html;
    const key = p === "" ? "home" : p === "company" ? "companies" : p === "login" ? "my" : p;
    document.querySelectorAll("[data-nav]").forEach((el) => el.classList.toggle("on", el.dataset.nav === key));
    const s = Auth.session();
    const chip = document.getElementById("loginChip");
    chip.textContent = s ? s.company.name.split(/\s|,/)[0] : "로그인";
    chip.href = s ? "#/my" : "#/login";
    if (keepScroll !== true) window.scrollTo(0, 0);
    bind();
  }

  function bind() {
    const f = document.getElementById("loginForm");
    if (f) f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const err = document.getElementById("loginErr"), btn = f.querySelector("button");
      err.textContent = ""; btn.disabled = true; btn.textContent = "확인 중…";
      try { await Auth.login(f.elements.namedItem("id").value, f.elements.namedItem("password").value); location.hash = "#/my"; }
      catch (x) { err.textContent = x.message; btn.disabled = false; btn.textContent = "로그인"; }
    });
    const lo = document.getElementById("logoutBtn");
    if (lo) lo.addEventListener("click", () => { Auth.logout(); location.hash = "#/"; });
  }

  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = "복사됨"; }
    catch (x) { b.textContent = "복사 실패 — 길게 눌러 복사"; }
    setTimeout(() => (b.textContent = "링크 복사"), 1800);
  });

  window.addEventListener("hashchange", () => route());
  route();
  // 홈 화면의 '지금' 표시를 1분마다 갱신
  setInterval(() => { if (/^#?\/?$/.test(location.hash)) route(true); }, 60000);
})();
