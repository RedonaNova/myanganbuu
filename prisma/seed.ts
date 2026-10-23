// Initial content: his real projects (photos in prisma/seed-images), a
// starter rate card and a sample quote.
//   npm run db:seed
// Safe to re-run: existing projects are never touched, the rate card is only
// filled when empty, and only the sample quote is replaced. Old stock-photo
// demo projects (isSample) are removed.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { createPrisma } from "../scripts/lib/prisma";
import { deleteImage, processImage } from "../src/lib/image-core";

const prisma = createPrisma();
const IMAGES = path.join(import.meta.dirname, "seed-images");
const SAMPLE_CLIENT = "Жишээ захиалагч";

type SeedPhoto = {
  file: string;
  alt: string;
  role?: "GALLERY" | "PROGRESS";
  caption?: string;
  date?: string;
};

type SeedProject = {
  slug: string;
  title: string;
  description: string;
  room: "KITCHEN" | "BATHROOM" | "LIVING" | "BEDROOM" | "FACADE";
  services: string[];
  featured: boolean;
  pairs: { before: SeedPhoto; after: SeedPhoto }[];
  photos: SeedPhoto[];
};

const projects: SeedProject[] = [
  {
    slug: "khausny-fasad-tagt",
    title: "Хаусын фасадыг шинэчилж, том тагт хийсэн",
    description:
      "Хуучин тоосгон ханыг каркас, дулаалгатай болгож, дээрээс нь цайвар өнгийн фасадын хавтангаар бүрсэн. Цонхны хүрээ, дээврийн ирмэгийг хар өнгийн профайлаар хүрээлсэн.\n\n" +
      "Хаалганы урд баганатай халхавч гаргаж, байшингийн урд талд том тагт, шат, төмөр хашлага хийсэн.",
    room: "FACADE",
    services: ["siding"],
    featured: true,
    pairs: [
      {
        before: {
          file: "siding-before.jpg",
          alt: "Хаус засварын өмнө: хуучин тоосгон хана, улаан дээвэр, барилгын шат",
        },
        after: {
          file: "siding-after.jpg",
          alt: "Хаус засварын дараа: цайвар фасадын хавтан, хар дээвэр, тагт, хашлага",
        },
      },
    ],
    photos: [],
  },
  {
    slug: "living-room-tv-khana",
    title: "Зочны өрөөний телевизийн хана, захиалгат тавиур",
    description:
      "Телевизийн ханыг гантиг хээтэй хавтан, босоо хана панелаар өнгөлж, панелийн ард LED гэрэлтүүлэг оруулсан. Доор нь өрөөнд тааруулж хийсэн өлгөөтэй тавиур суурилуулсан.\n\n" +
      "Хананы хоёр талд ханын гэрэл гаргаж, утсыг бүгдийг нь хананд нуусан.",
    room: "LIVING",
    services: ["tv-wall", "furniture", "electrical"],
    featured: true,
    pairs: [],
    photos: [
      {
        file: "stenk-selfmade.jpg",
        alt: "Зочны өрөө: гантиг хээтэй ТВ хана, босоо панел, LED гэрэл, өлгөөтэй тавиур",
      },
    ],
  },
  {
    slug: "shurshuurtei-ugaalgyn-oroo",
    title: "Шүршүүртэй угаалгын өрөө: шугам, хавтан",
    description:
      "Шалыг хуулж, усны болон бохирын шугамыг шинээр татсан. Шүршүүрийн хэсэгт ус зайлуулах налуу гаргаж, шалыг хавтангаар тавьсан.\n\n" +
      "Хананд гантиг хээтэй цагаан хавтан, шүршүүрийн холигч суурилуулсан.",
    room: "BATHROOM",
    services: ["bathroom"],
    featured: true,
    pairs: [
      {
        before: {
          file: "bathroom-before.jpg",
          alt: "Угаалгын өрөө ажлын явцад: шалан дээр шинэ ус, бохирын шугам",
        },
        after: {
          file: "bathroom-after.jpg",
          alt: "Угаалгын өрөө дууссаны дараа: шүршүүр, хавтантай шал, хана",
        },
      },
    ],
    photos: [],
  },
  {
    slug: "mansardtai-khaus-saiding",
    title: "Мансардтай хаусыг цагаан сайдингаар бүрсэн",
    description:
      "Хоёр давхар хаусын гадна ханыг бүхэлд нь цагаан сайдингаар бүрж, булан, цонхны хүрээг бараан профайлаар гаргасан.",
    room: "FACADE",
    services: ["siding"],
    featured: true,
    pairs: [],
    photos: [
      {
        file: "siding-photo.jpg",
        alt: "Цагаан сайдингаар бүрсэн мансардтай хаус",
      },
    ],
  },
  {
    slug: "tom-tsonkhtoi-khaus-fasad",
    title: "Том цонхтой хаусын фасад",
    description:
      "Мансардтай хаусын гадна ханыг цагаан сайдингаар бүрж байх үе. Ажлыг шат, тавцан босгож, аюулгүй хийдэг.",
    room: "FACADE",
    services: ["siding"],
    featured: false,
    pairs: [],
    photos: [
      {
        file: "in-progress-siding.jpg",
        alt: "Том цонхтой хаус, цагаан сайдинг бүрж буй үе, барилгын шат",
      },
    ],
  },
  {
    slug: "neg-davkhar-baishin-fasad",
    title: "Нэг давхар байшинг фасадын хавтангаар бүрсэн",
    description:
      "Нэг давхар байшинг тоосгон хээтэй цагаан фасадын хавтангаар бүрж, суурийг бараан өнгөөр ялгасан.",
    room: "FACADE",
    services: ["siding"],
    featured: false,
    pairs: [],
    photos: [
      {
        file: "siding-photo1.jpg",
        alt: "Цагаан фасадын хавтангаар бүрсэн нэг давхар байшин",
      },
    ],
  },
  {
    slug: "ulaan-deevertei-baishin",
    title: "Улаан дээвэртэй байшингийн фасад",
    description:
      "Байшингийн ханыг цагаан сайдингаар бүрж, цонх бүрийг бараан өнгийн хүрээгээр ялгаж гаргасан.",
    room: "FACADE",
    services: ["siding"],
    featured: false,
    pairs: [],
    photos: [
      {
        file: "siding-photo2.jpg",
        alt: "Цагаан сайдинг, бараан цонхны хүрээтэй улаан дээвэртэй байшин",
      },
    ],
  },
  {
    slug: "khuvtsasny-shuugee",
    title: "Унтлагын өрөөний суурилуулсан хувцасны шүүгээ",
    description:
      "Хананаас тааз хүртэл өндөр, өрөөнд яг таарсан хувцасны шүүгээ. Дотор нь өлгүүр, тавиур, шургуулга хийсэн, гадна талд нарийн хар бариултай.",
    room: "BEDROOM",
    services: ["furniture"],
    featured: false,
    pairs: [],
    photos: [
      {
        file: "selfmade-wardrobe.jpg",
        alt: "Таазаас шал хүртэл цагаан хувцасны шүүгээ, хар бариултай",
      },
      {
        file: "selfmade-wardrobe1.jpg",
        alt: "Шүүгээний дотор тал: өлгүүр, тавиур, шургуулга",
      },
    ],
  },
];

const rateItems: {
  label: string;
  unit: string;
  unitPrice: number;
  category: string;
}[] = [
  {
    label: "Хана, шалны хавтан тавих",
    unit: "м²",
    unitPrice: 45000,
    category: "Хавтан",
  },
  {
    label: "Хуучин хавтан хуулах",
    unit: "м²",
    unitPrice: 12000,
    category: "Хавтан",
  },
  {
    label: "Хана панел суурилуулах",
    unit: "м²",
    unitPrice: 35000,
    category: "Хана",
  },
  {
    label: "Гипсэн хана босгох",
    unit: "м²",
    unitPrice: 40000,
    category: "Хана",
  },
  { label: "Ламинат шал тавих", unit: "м²", unitPrice: 15000, category: "Шал" },
  {
    label: "Уналттай тааз татах",
    unit: "м²",
    unitPrice: 30000,
    category: "Тааз",
  },
  { label: "Хаалга суурилуулах", unit: "ш", unitPrice: 80000, category: "Мод" },
  {
    label: "Залгуур, унтраалга гаргах",
    unit: "цэг",
    unitPrice: 25000,
    category: "Цахилгаан",
  },
  {
    label: "Гэрлийн цэг гаргах",
    unit: "цэг",
    unitPrice: 30000,
    category: "Цахилгаан",
  },
  {
    label: "Угаалтуур, бохирын шугам шилжүүлэх",
    unit: "цэг",
    unitPrice: 120000,
    category: "Сантехник",
  },
  {
    label: "Сантехникийн тоног суурилуулах",
    unit: "ш",
    unitPrice: 60000,
    category: "Сантехник",
  },
  {
    label: "Гадна фасадыг сайдингаар бүрэх",
    unit: "м²",
    unitPrice: 25000,
    category: "Фасад",
  },
  { label: "Өдрийн хөлс", unit: "өдөр", unitPrice: 150000, category: "Бусад" },
];

async function addPhoto(
  projectId: number,
  p: SeedPhoto,
  role: "BEFORE" | "AFTER" | "GALLERY" | "PROGRESS",
  sortOrder: number,
) {
  const image = await processImage(
    await readFile(path.join(IMAGES, p.file)),
    "public",
  );
  return prisma.photo.create({
    data: {
      projectId,
      ...image,
      role,
      alt: p.alt,
      caption: p.caption ?? "",
      milestoneDate: p.date ? new Date(`${p.date}T00:00:00Z`) : null,
      sortOrder,
    },
  });
}

async function seedProjects() {
  const old = await prisma.project.findMany({
    where: { isSample: true },
    include: { photos: true },
  });
  for (const p of old) {
    await prisma.project.delete({ where: { id: p.id } });
    await Promise.all(
      p.photos.map((ph) => deleteImage("public", ph.storageKey)),
    );
  }

  for (const [i, s] of projects.entries()) {
    // Never overwrite: once imported, these are his projects to edit.
    if (await prisma.project.findUnique({ where: { slug: s.slug } })) {
      console.log(`· ${s.title} already exists, left as is`);
      continue;
    }
    const project = await prisma.project.create({
      data: {
        slug: s.slug,
        title: s.title,
        description: s.description,
        room: s.room,
        rooms: { create: [{ room: s.room }] },
        published: true,
        featured: s.featured,
        sortOrder: i,
        services: {
          create: s.services.map((serviceSlug) => ({ serviceSlug })),
        },
      },
    });

    let order = 0;
    let heroPairId: number | null = null;
    for (const pair of s.pairs) {
      const before = await addPhoto(project.id, pair.before, "BEFORE", order++);
      const after = await addPhoto(project.id, pair.after, "AFTER", order++);
      await prisma.photo.update({
        where: { id: before.id },
        data: { pairedAfterId: after.id },
      });
      heroPairId ??= before.id;
    }
    for (const p of s.photos)
      await addPhoto(project.id, p, p.role ?? "GALLERY", order++);

    // Cover: the main pair's AFTER photo, otherwise the first photo.
    const hero = heroPairId
      ? await prisma.photo.findUniqueOrThrow({ where: { id: heroPairId } })
      : null;
    const first = await prisma.photo.findFirst({
      where: { projectId: project.id },
      orderBy: { sortOrder: "asc" },
    });
    await prisma.project.update({
      where: { id: project.id },
      data: {
        heroPairId,
        coverPhotoId: hero?.pairedAfterId ?? first?.id ?? null,
      },
    });
    console.log(`✓ ${s.title} (${order} photos)`);
  }
}

/** His highlight list, in seed order, unless he has already chosen one. */
async function seedFeatured() {
  const existing = await prisma.setting.findUnique({
    where: { key: "featuredProjectIds" },
  });
  if (existing?.value)
    return console.log("· featured works already chosen, left as is");
  const featured = await prisma.project.findMany({
    where: { featured: true, published: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    take: 4,
  });
  const value = featured.map((p) => p.id).join(",");
  await prisma.setting.upsert({
    where: { key: "featuredProjectIds" },
    create: { key: "featuredProjectIds", value },
    update: { value },
  });
  console.log(`✓ ${featured.length} featured works`);
}

/** His profile photo for the about page, unless he has already set one. */
async function seedPortrait() {
  if (await prisma.sitePhoto.findFirst({ where: { isPortrait: true } }))
    return console.log("· profile photo already set, left as is");
  const image = await processImage(
    await readFile(path.join(IMAGES, "pfp.jpg")),
    "public",
  );
  await prisma.sitePhoto.create({
    data: { ...image, alt: "Мянганбуу, дээлтэй", isPortrait: true },
  });
  console.log("✓ profile photo");
}

async function seedRates() {
  if ((await prisma.rateItem.count()) > 0)
    return console.log("· rate card already filled, left as is");
  await prisma.rateItem.createMany({
    data: rateItems.map((r, i) => ({ ...r, sortOrder: i })),
  });
  console.log(`✓ ${rateItems.length} rate card items`);
}

async function seedQuote() {
  await prisma.quote.deleteMany({ where: { clientName: SAMPLE_CLIENT } });
  const rates = await prisma.rateItem.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const pick = (label: string) => rates.find((r) => r.label === label);
  const lines = [
    { item: pick("Хуучин хавтан хуулах"), quantity: 18 },
    { item: pick("Хана, шалны хавтан тавих"), quantity: 22.5 },
    { item: pick("Угаалтуур, бохирын шугам шилжүүлэх"), quantity: 2 },
    { item: pick("Сантехникийн тоног суурилуулах"), quantity: 3 },
    { item: pick("Залгуур, унтраалга гаргах"), quantity: 2 },
  ].filter((l) => l.item);

  const validUntil = new Date();
  validUntil.setUTCDate(validUntil.getUTCDate() + 14);
  const quote = await prisma.quote.create({
    data: {
      publicToken: randomBytes(16).toString("base64url"),
      clientName: SAMPLE_CLIENT,
      address: "Баянзүрх дүүрэг, 26-р хороо",
      note: "Хавтан, цавуу, сантехникийн тоног төхөөрөмжийг захиалагч өөрөө авна.",
      validUntil: new Date(
        validUntil.toISOString().slice(0, 10) + "T00:00:00Z",
      ),
      lines: {
        create: lines.map((l, i) => ({
          label: l.item!.label,
          unit: l.item!.unit,
          unitPrice: l.item!.unitPrice,
          quantity: l.quantity,
          sortOrder: i,
        })),
      },
    },
  });
  console.log(`✓ sample quote: /une/${quote.publicToken}`);
}

await seedProjects();
await seedFeatured();
await seedPortrait();
await seedRates();
await seedQuote();
await prisma.$disconnect();
