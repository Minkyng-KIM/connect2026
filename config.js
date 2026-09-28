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
      name: "유지현 본부장",
      role: "글로벌 본부",
      phone: "+82 10-7349-3398",
      whatsapp: "821073493398",
      kakao: "",
      kakaoPhone: "010-7349-3398", // 카카오톡은 전화번호로 바로 대화를 여는 링크가 없어 번호 복사로 연결
    },
    {
      name: "김민경 팀장",
      role: "TBZ Partners",
      phone: "+82 10-8903-2563",
      whatsapp: "821089032563",
      kakao: "",
      kakaoPhone: "010-8903-2563",
    },
  ],

  /* ---------- 로그인 ----------
     appsScriptUrl 이 비어 있으면 "데모 모드"로 동작합니다.
     Apps Script 웹앱 배포 후 URL(https://script.google.com/macros/s/.../exec)을 넣으면
     실제 로그인으로 전환됩니다. 요청/응답 형식은 README.md 참고. */
  auth: {
    appsScriptUrl: "https://script.google.com/macros/s/AKfycbyVthFy8gS0dw6LXBLoViwbjeHG0x8Gq0melZkwWmHn1A2lxMG6nT0s_Laf7HNLU4-F/exec",
    demoPassword: "demo2026", // 데모 모드 전용 — 실제 운영 전 반드시 Apps Script로 전환
  },

  /* 기업별 링크·비밀번호는 이제 구글 시트 "CONNECT2026 로그인 관리 (운영사 전용)"에서 관리합니다.
     (Apps Script 연결 완료 — 이 파일에는 비공개 정보를 넣지 마세요.) */
  demoPrivate: {},
};
