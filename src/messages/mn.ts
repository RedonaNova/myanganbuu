// ─────────────────────────────────────────────────────────────────────────
// Сайтын бүх бичвэр энэ файлд байна. Үгийг өөрчлөхдөө зөвхөн хашилтан
// доторх текстийг засна уу.
// All UI copy lives here. Components never contain literal strings.
// ─────────────────────────────────────────────────────────────────────────

export const site = {
  name: "Мянганбуу",
  tagline: "Орон сууцны засвар — хавтангаас тааз хүртэл, нэг гараар",
  city: "Улаанбаатар",
  description:
    "Улаанбаатар хотод орон сууц, хаусын засвар: хавтан, гипсэн хана, хана панел, шал, сантехник, цахилгаан, тавилга, суналтын тааз, гадна фасад. Ажлын зураг, үнийн тооцоо.",
  locale: "mn_MN",
};

export const common = {
  save: "Хадгалах",
  saving: "Хадгалж байна…",
  saved: "Хадгалагдлаа",
  cancel: "Болих",
  delete: "Устгах",
  confirmDelete: "Устгахдаа итгэлтэй байна уу?",
  edit: "Засах",
  add: "Нэмэх",
  back: "Буцах",
  next: "Дараах",
  done: "Болсон",
  close: "Хаах",
  loading: "Ачаалж байна…",
  retry: "Дахин оролдох",
  required: "Заавал бөглөнө",
  optional: "заавал биш",
  yes: "Тийм",
  no: "Үгүй",
  skipToContent: "Үндсэн агуулга руу шилжих",
  errorGeneric: "Алдаа гарлаа. Дахин оролдоно уу.",
  notFoundTitle: "Хуудас олдсонгүй",
  notFoundBody: "Энэ хаяг буруу эсвэл хуудас устсан байна.",
  toHome: "Нүүр хуудас руу",
};

export const rooms = {
  KITCHEN: "Гал тогоо",
  BATHROOM: "Угаалгын өрөө",
  LIVING: "Зочны өрөө",
  BEDROOM: "Унтлагын өрөө",
  FACADE: "Гадна фасад",
  OTHER: "Бусад",
} as const;

export const districts = [
  "Баянзүрх",
  "Баянгол",
  "Сонгинохайрхан",
  "Сүхбаатар",
  "Хан-Уул",
  "Чингэлтэй",
  "Налайх",
  "Багануур",
  "Багахангай",
] as const;

// Short names; full service pages are in `servicePages` below.
export const serviceNames = {
  tiling: "Хавтан",
  drywall: "Гипсэн хана",
  panels: "Хана панел",
  flooring: "Шал",
  plumbing: "Сантехник",
  electrical: "Цахилгаан",
  furniture: "Суурилуулсан тавилга",
  "stretch-ceiling": "Суналтын тааз",
  siding: "Гадна фасад (сайдинг)",
} as const;

export const inquiryStatuses = {
  NEW: "Шинэ",
  CONTACTED: "Холбогдсон",
  QUOTED: "Үнэ өгсөн",
  STARTED: "Ажил эхэлсэн",
  DONE: "Дууссан",
} as const;

export const contactMethods = {
  MESSENGER: "Мессенжер",
  SMS: "Утасны мессеж",
} as const;

export const photoRoles = {
  BEFORE: "Өмнө",
  AFTER: "Дараа",
  GALLERY: "Зураг",
  PROGRESS: "Ажлын явц",
} as const;

// ─── Admin ───────────────────────────────────────────────────────────────

export const admin = {
  title: "Удирдлага",
  nav: {
    projects: "Төсөл",
    inquiries: "Хүсэлт",
    quotes: "Үнэ",
    settings: "Тохиргоо",
  },
  viewSite: "Сайт харах",
  logout: "Гарах",
  login: {
    title: "Нэвтрэх",
    username: "Нэвтрэх нэр",
    password: "Нууц үг",
    submit: "Нэвтрэх",
    submitting: "Шалгаж байна…",
    invalid: "Нэр эсвэл нууц үг буруу байна.",
    tooMany: "Хэт олон оролдлого хийлээ. 15 минутын дараа дахин оролдоно уу.",
    showPassword: "Нууц үгийг харуулах",
    hidePassword: "Нууц үгийг нуух",
  },
  home: {
    greeting: "Сайн байна уу",
    newInquiries: "Шинэ хүсэлт",
    publishedProjects: "Нийтэлсэн төсөл",
    addProject: "Шинэ төсөл нэмэх",
    addProjectHint: "Зургаа оруулаад, өмнө/дараа гэж хослуулна",
    newQuote: "Үнийн санал гаргах",
    newQuoteHint: "Ажил бүрийн үнийг жагсааж, холбоос илгээнэ",
  },
  projects: {
    title: "Төслүүд",
    empty: "Одоогоор төсөл алга. Эхний төслөө нэмээрэй.",
  },
  inquiries: {
    title: "Хүсэлтүүд",
    empty: "Хүсэлт ирээгүй байна.",
  },
  quotes: {
    title: "Үнийн санал",
    empty: "Үнийн санал гаргаагүй байна.",
  },
  settings: {
    title: "Тохиргоо",
  },
};
