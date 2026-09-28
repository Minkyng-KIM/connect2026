/* =========================================================
   CONFIG — 이 파일만 수정하면 대부분의 내용을 바꿀 수 있습니다.
   ⚠️ GitHub Pages 저장소는 공개됩니다. 이 파일에 적힌 모든 값은
      누구나 볼 수 있으니, 비공개 정보(비밀번호, 개인 연락처 등)는
      Apps Script 연결 후 서버 쪽으로 옮기세요.
   ========================================================= */
window.CONFIG = {
  event: {
    name: "CONNECT 2026",
    venue: "Singapore Expo",
    // Singapore time (UTC+8)
    days: ["2026-10-08", "2026-10-09"],
  },

  links: {
    guide: "https://lapis-virgo-ab6.notion.site/2026-SHBC-Research-Innovation-3a6a9bdb3d37800bac53e618f523f169",
    shbc: "https://shbc.com.sg/",
    shbcProgramme: "https://shbc.com.sg/programme",
  },

  /* 운영사 컨택포인트
     - whatsapp: 국가번호 포함 숫자만 (예: 6591234567, 821012345678)
     - kakao: 카카오톡 오픈채팅 링크 or 채널 링크 (https://open.kakao.com/o/..., https://pf.kakao.com/...)
     - phone: 국제번호 형식 (+82 10-1234-5678)
     빈 값("")이면 해당 버튼이 숨겨집니다. */
  contacts: [
    {
      name: "TBZ Partners 현장 운영 데스크",
      role: "현장 총괄 · 부스/패스/일정 문의",
      phone: "+82 10-0000-0000",
      whatsapp: "821000000000",
      kakao: "https://open.kakao.com/o/XXXXXXX",
    },
    {
      name: "Pitchstop 담당",
      role: "피칭 순서 · AV 체크 · 리허설",
      phone: "+65 9000-0000",
      whatsapp: "6590000000",
      kakao: "",
    },
  ],

  /* ---------- 로그인 ----------
     appsScriptUrl 이 비어 있으면 "데모 모드"로 동작합니다.
     Apps Script 웹앱 배포 후 URL(https://script.google.com/macros/s/.../exec)을 넣으면
     실제 로그인으로 전환됩니다. 요청/응답 형식은 README.md 참고. */
  auth: {
    appsScriptUrl: "",
    demoPassword: "demo2026", // 데모 모드 전용 — 실제 운영 전 반드시 Apps Script로 전환
  },

  /* 데모 모드용 기업별 비공개 데이터 (샘플)
     Apps Script 연결 후에는 이 값 대신 서버 응답이 사용됩니다. */
  demoPrivate: {
    beyondmedicine: {
      promoUrl: "https://claude.ai/artifact/NEPu9hYPUtH8dYhZYNLmaw",
      calendarId: "",      // 예: abc123@group.calendar.google.com
      driveFolderId: "",   // 예: 1AbCdEfGh... (폴더 URL의 /folders/ 뒤 값)
      linkedin: "",
      whatsapp: "",
      contactPerson: "",
    },
  },
};
