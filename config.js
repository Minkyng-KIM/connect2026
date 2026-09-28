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

  /* 기업별 링크 — 기업 ID마다 아래 7개 칸을 채우세요. 링크는 주소창 URL을 그대로 붙여넣으면 됩니다.
     빈 값("")이면 해당 칸은 "아직 연결되지 않았습니다"로 표시됩니다.
     (Apps Script 연결 후에는 이 값 대신 서버 응답이 사용됩니다.) */
  demoPrivate: {
    beyondmedicine: {
      promoUrl:   "https://claude.ai/artifact/NEPu9hYPUtH8dYhZYNLmaw",
      bookingUrl: "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0kevWQ4ptjVDvCvmj_ULiG5q9IHanGP_I0wQx7HkY8ztGPQH82tfdmWR-0N96IVglg0Z5PQqxu",
      formUrl:    "https://forms.gle/jq9qFXXrzbCi6VHE9",
      photoFolder:"https://drive.google.com/drive/folders/1hoAxgEbA19pHYJ-hkzV_2NS6O6-tjg_8?usp=sharing",
      linkedin: "",
      whatsapp: "",
      contactPerson: "",
    },
    speechnrt:      { promoUrl: "", bookingUrl: "", formUrl: "", photoFolder: "", linkedin: "", whatsapp: "", contactPerson: "" },
    lifefuturetech: { promoUrl: "", bookingUrl: "", formUrl: "", photoFolder: "", linkedin: "", whatsapp: "", contactPerson: "" },
    cdthera:        { promoUrl: "", bookingUrl: "https://calendar.app.google/fwRLcLNnuvLpx3V19", formUrl: "", photoFolder: "https://drive.google.com/drive/folders/1Itz31kzw3wSksmmKKdMBV0g16WWJl102?usp=sharing", linkedin: "", whatsapp: "", contactPerson: "" },
    careminder:     { promoUrl: "", bookingUrl: "https://calendar.app.google/ABXycQ2Lka1MFFtn9", formUrl: "", photoFolder: "https://drive.google.com/drive/folders/1X3vhaW9kHIEsttRYX2wbBL3kqMw6YsL3?usp=sharing", linkedin: "", whatsapp: "", contactPerson: "" },
    jeongjin:       { promoUrl: "", bookingUrl: "https://calendar.app.google/QNb2hBfaxxh8ARUa6", formUrl: "", photoFolder: "https://drive.google.com/drive/folders/1YuZPB8ZqGRu1V7ELwhxzzxUTuL3q0t6Q?usp=sharing", linkedin: "", whatsapp: "", contactPerson: "" },
    inexoplat:      { promoUrl: "", bookingUrl: "https://calendar.app.google/UjGfYCcMcfpmciTAA", formUrl: "", photoFolder: "https://drive.google.com/drive/folders/1nGBkvW0yKNKfEFuPMFSSRXdisI00L1DT?usp=sharing", linkedin: "", whatsapp: "", contactPerson: "" },
    imitarscience:  { promoUrl: "", bookingUrl: "https://calendar.app.google/zVNDd3SdVKdZTKJM9", formUrl: "", photoFolder: "https://drive.google.com/drive/folders/1Zhf4RC9Gjub76kOpSU5F9XYFWuLfzrpn?usp=sharing", linkedin: "", whatsapp: "", contactPerson: "" },
  },
};
