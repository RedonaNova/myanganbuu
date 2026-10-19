// ─────────────────────────────────────────────────────────────────────────
// Сайтын бүх бичвэр энэ файлд байна. Үгийг өөрчлөхдөө зөвхөн хашилтан
// доторх текстийг засна уу.
// All UI copy lives here. Components never contain literal strings.
// ─────────────────────────────────────────────────────────────────────────

export const site = {
  name: "Мянганбуу",
  tagline: "Орон сууцны засвар: хавтангаас тааз хүртэл, нэг гараар",
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
  MESSENGER: "Фэйсбүүк мессенжер",
  VIBER: "Вайбер",
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
    add: "Шинэ төсөл",
    newTitle: "Шинэ төсөл",
    nameLabel: "Төслийн нэр",
    namePlaceholder: "Жишээ нь: Баянзүрх, 2 өрөө байрны угаалгын өрөө",
    nameHint: "Сайтад гарчиг болж харагдана. Дараа нь засаж болно.",
    roomLabel: "Аль өрөө вэ?",
    create: "Үргэлжлүүлэх",
    published: "Нийтэлсэн",
    draft: "Ноорог",
    featured: "Нүүрэнд",
    photosCount: "зураг",
    noPhotos: "Зураггүй",
    sample: "Жишээ",
    tabs: { photos: "Зураг", info: "Мэдээлэл" },
    viewPublic: "Сайтад харах",
  },
  photos: {
    upload: "Зураг нэмэх",
    uploadHint: "Утасныхаа зургийн цомгоос олныг нэг дор сонгож болно.",
    preparing: "Бэлтгэж байна",
    uploading: "Илгээж байна",
    processing: "Боловсруулж байна",
    failed: "Амжилтгүй",
    retry: "Дахин",
    unsupported: "Энэ зургийн төрлийг уншиж чадсангүй. JPG эсвэл PNG зураг сонгоно уу.",
    tooBig: "Зураг хэт том байна (40 МБ-аас их).",
    empty: "Зураг алга. Дээрх товчоор зургаа нэмнэ үү.",
    pairs: "Өмнө ба дараа",
    pairsHint: "Нэг газрыг засварын өмнө ба дараа авсан хоёр зургийг хослуулна. Сайтад гулсуулж харьцуулах зураг болно.",
    pairStart: "Хослуулах",
    pickBefore: "Засварын ӨМНӨХ зургийг сонгоно уу",
    pickAfter: "Одоо засварын ДАРААХ зургийг сонгоно уу",
    pairDone: "Хослууллаа",
    unpair: "Салгах",
    noPairs: "Хослол алга.",
    mainPair: "Гол хослол",
    makeMainPair: "Гол болгох",
    cover: "Нүүр зураг",
    makeCover: "Нүүр зураг болгох",
    role: "Зургийн төрөл",
    alt: "Зургийн тайлбар (харж чадахгүй хүмүүст)",
    altHint: "Зурган дээр юу байгааг товч бичнэ үү.",
    altMissing: "Тайлбаргүй",
    caption: "Зургийн доорх бичиг",
    milestoneDate: "Огноо",
    moveUp: "Дээш",
    moveDown: "Доош",
    reorderHint: "Дараалал солихдоо зургийг удаан дарж чирнэ үү.",
    deletePhoto: "Зургийг устгах",
    confirmDeletePhoto: "Энэ зургийг устгах уу?",
    edit: "Зургийг засах",
    altBefore: "засварын өмнө",
    altAfter: "засварын дараа",
    altProgress: "ажлын явц",
  },
  info: {
    title: "Гарчиг",
    description: "Тайлбар",
    descriptionHint: "Юу хийсэн, ямар материал хэрэглэсэн, онцлог зүйл.",
    room: "Өрөө",
    services: "Хийсэн ажил",
    district: "Дүүрэг",
    chooseDistrict: "Дүүрэг сонгох",
    area: "Талбай (м²)",
    duration: "Хугацаа (хоног)",
    completedAt: "Дууссан огноо",
    publish: "Сайтад нийтлэх",
    publishHint: "Унтраавал зөвхөн та харна.",
    feature: "Нүүр хуудсанд гаргах",
    featureHint: "3 эсвэл 4 сайн төслийг сонгоорой.",
    deleteProject: "Төслийг устгах",
    confirmDeleteProject: "Энэ төсөл болон бүх зургийг устгах уу? Буцаах боломжгүй.",
    titleRequired: "Гарчиг бичнэ үү.",
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
