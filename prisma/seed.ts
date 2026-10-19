// Demo content so the site looks complete before real work is uploaded.
//   npm run db:seed
// Safe to re-run: sample projects (isSample) and the sample quote are
// replaced; the rate card is only filled when it is empty.
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
  district: string;
  areaM2: number;
  durationDays: number;
  completedAt: string;
  services: string[];
  pairs: { before: SeedPhoto; after: SeedPhoto }[];
  photos: SeedPhoto[];
};

const projects: SeedProject[] = [
  {
    slug: "bayanzurkh-ugaalgyn-oroo",
    title: "Баянзүрх, 2 өрөө байрны угаалгын өрөөг бүрэн шинэчилсэн",
    description:
      "Хуучин хавтанг бүрэн хуулж, ханыг тэгшилж, ус тусгаарлагч түрхсэн. Ваннын байрлалыг өөрчилж, угаалтуур болон бохирын шугамыг шинэ байршилд шилжүүлсэн.\n\n" +
      "Хананд 30×60 хэмжээтэй цагаан хавтан, шалан дээр гулгахгүй хавтан тавьсан. Толины ард гэрэл, ус нэвтрэхгүй залгуур нэмж суурилуулсан.\n\n" +
      "Материалыг захиалагч өөрөө сонгож авсан. Ажлыг 12 хоногт хүлээлгэн өгсөн.",
    room: "BATHROOM",
    district: "Баянзүрх",
    areaM2: 52,
    durationDays: 12,
    completedAt: "2026-08-14",
    services: ["tiling", "plumbing", "electrical"],
    pairs: [
      {
        before: { file: "bath_old.jpg", alt: "Угаалгын өрөө засварын өмнө: хуучин хавтан, ванн" },
        after: { file: "bath_a4.jpg", alt: "Угаалгын өрөө засварын дараа: цагаан хавтан, шинэ угаалтуур, шүүгээ" },
      },
      {
        before: { file: "b_shower.jpg", alt: "Шүршүүрийн булан засварын өмнө" },
        after: { file: "bath_a3.jpg", alt: "Шүршүүрийн булан засварын дараа: цагаан хавтан, шинэ холигч" },
      },
    ],
    photos: [{ file: "bath_a1.jpg", alt: "Шинэ угаалгын өрөөний ерөнхий байдал" }],
  },
  {
    slug: "khan-uul-zochny-oroo-gal-togoo",
    title: "Хан-Уул, 3 өрөө байрны зочны өрөө ба гал тогоо",
    description:
      "Зочны өрөөний ханыг хана панелаар өнгөлж, телевизийн тавиурыг захиалгаар хийж суурилуулсан. Таазыг суналтын тааз болгож, цэгэн гэрлүүдийг шинээр татсан.\n\n" +
      "Гал тогоонд шалыг ламинатаар сольж, шүүгээг шинэчилсэн. Залгуурын тоог нэмж, бичил долгионы зуухны цахилгааныг тусад нь гаргасан.",
    room: "LIVING",
    district: "Хан-Уул",
    areaM2: 78,
    durationDays: 18,
    completedAt: "2026-06-20",
    services: ["panels", "furniture", "stretch-ceiling", "flooring", "electrical"],
    pairs: [
      {
        before: { file: "l_common.jpg", alt: "Зочны өрөө засварын өмнө: хуучин хивс, буйдан" },
        after: { file: "l_plants.jpg", alt: "Зочны өрөө засварын дараа: шинэ шал, гэрэлтүүлэг, тавиур" },
      },
      {
        before: { file: "k_floor.jpg", alt: "Гал тогоо засварын явцад: тоосгон хана, шинэ шал" },
        after: { file: "k_cab.jpg", alt: "Гал тогоо засварын дараа: цагаан шүүгээ, шинэ зуух" },
      },
    ],
    photos: [
      {
        file: "k_tools.jpg",
        alt: "Гал тогооны шүүгээ суурилуулах явц",
        role: "PROGRESS",
        caption: "Гал тогооны шүүгээг суурилуулж, ажлын тавцанг тавьсан.",
        date: "2026-06-12",
      },
      {
        file: "ceiling.jpg",
        alt: "Суналтын тааз, гэрлийн цэг",
        role: "PROGRESS",
        caption: "Суналтын таазыг татаж, гэрлийн цэгүүдийг гаргасан.",
        date: "2026-06-16",
      },
    ],
  },
  {
    slug: "songinokhairkhan-khaus-saiding",
    title: "Сонгинохайрхан, хувийн хаусны гадна фасадыг сайдингаар бүрсэн",
    description:
      "Хуучирч, хагарсан гадна бүрээсийг авч, модон каркасыг шинэчилсэн. Дулаалгын хавтан тавьж, дээрээс нь цайвар өнгийн винил сайдингаар бүрсэн.\n\n" +
      "Цонхны хүрээ, булангийн хэсгүүдийг тусгай хамгаалалтын профайлаар хийсэн тул бороо, цасанд тэсвэртэй. Ажлыг зуны улиралд 9 хоногт дуусгасан.",
    room: "FACADE",
    district: "Сонгинохайрхан",
    areaM2: 140,
    durationDays: 9,
    completedAt: "2025-08-30",
    services: ["siding"],
    pairs: [
      {
        before: { file: "s_multi.jpg", alt: "Хаусны фасад засварын өмнө: хагарсан хуучин бүрээс" },
        after: { file: "s_vinyl.jpg", alt: "Хаусны фасад засварын дараа: цайвар винил сайдинг" },
      },
    ],
    photos: [
      { file: "s_log.jpg", alt: "Цагаан сайдингаар бүрсэн хаус, урд талаас" },
      { file: "s_stone.jpg", alt: "Чулуун хээтэй сайдинг, цонхны хүрээ" },
    ],
  },
];

const rateItems: { label: string; unit: string; unitPrice: number; category: string }[] = [
  { label: "Хана, шалны хавтан тавих", unit: "м²", unitPrice: 45000, category: "Хавтан" },
  { label: "Хуучин хавтан хуулах", unit: "м²", unitPrice: 12000, category: "Хавтан" },
  { label: "Хана панел суурилуулах", unit: "м²", unitPrice: 35000, category: "Хана" },
  { label: "Гипсэн хана босгох", unit: "м²", unitPrice: 40000, category: "Хана" },
  { label: "Ламинат шал тавих", unit: "м²", unitPrice: 15000, category: "Шал" },
  { label: "Суналтын тааз татах", unit: "м²", unitPrice: 30000, category: "Тааз" },
  { label: "Хаалга суурилуулах", unit: "ш", unitPrice: 80000, category: "Мод" },
  { label: "Залгуур, унтраалга гаргах", unit: "цэг", unitPrice: 25000, category: "Цахилгаан" },
  { label: "Гэрлийн цэг гаргах", unit: "цэг", unitPrice: 30000, category: "Цахилгаан" },
  { label: "Угаалтуур, бохирын шугам шилжүүлэх", unit: "цэг", unitPrice: 120000, category: "Сантехник" },
  { label: "Сантехникийн тоног суурилуулах", unit: "ш", unitPrice: 60000, category: "Сантехник" },
  { label: "Гадна фасадыг сайдингаар бүрэх", unit: "м²", unitPrice: 25000, category: "Фасад" },
  { label: "Өдрийн хөлс", unit: "өдөр", unitPrice: 150000, category: "Бусад" },
];

async function addPhoto(projectId: number, p: SeedPhoto, role: "BEFORE" | "AFTER" | "GALLERY" | "PROGRESS", sortOrder: number) {
  const image = await processImage(await readFile(path.join(IMAGES, p.file)), "public");
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
  const old = await prisma.project.findMany({ where: { isSample: true }, include: { photos: true } });
  for (const p of old) {
    await prisma.project.delete({ where: { id: p.id } });
    await Promise.all(p.photos.map((ph) => deleteImage("public", ph.storageKey)));
  }

  for (const [i, s] of projects.entries()) {
    const project = await prisma.project.create({
      data: {
        slug: s.slug,
        title: s.title,
        description: s.description,
        room: s.room,
        district: s.district,
        areaM2: s.areaM2,
        durationDays: s.durationDays,
        completedAt: new Date(`${s.completedAt}T00:00:00Z`),
        published: true,
        featured: true,
        isSample: true,
        sortOrder: 100 + i,
        services: { create: s.services.map((serviceSlug) => ({ serviceSlug })) },
      },
    });

    let order = 0;
    let heroPairId: number | null = null;
    for (const pair of s.pairs) {
      const before = await addPhoto(project.id, pair.before, "BEFORE", order++);
      const after = await addPhoto(project.id, pair.after, "AFTER", order++);
      await prisma.photo.update({ where: { id: before.id }, data: { pairedAfterId: after.id } });
      heroPairId ??= before.id;
    }
    for (const p of s.photos) await addPhoto(project.id, p, p.role ?? "GALLERY", order++);

    const hero = heroPairId ? await prisma.photo.findUniqueOrThrow({ where: { id: heroPairId } }) : null;
    await prisma.project.update({
      where: { id: project.id },
      data: { heroPairId, coverPhotoId: hero?.pairedAfterId ?? null },
    });
    console.log(`✓ ${s.title} (${order} photos)`);
  }
}

async function seedRates() {
  if ((await prisma.rateItem.count()) > 0) return console.log("· rate card already filled, left as is");
  await prisma.rateItem.createMany({ data: rateItems.map((r, i) => ({ ...r, sortOrder: i })) });
  console.log(`✓ ${rateItems.length} rate card items`);
}

async function seedQuote() {
  await prisma.quote.deleteMany({ where: { clientName: SAMPLE_CLIENT } });
  const rates = await prisma.rateItem.findMany({ orderBy: { sortOrder: "asc" } });
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
      validUntil: new Date(validUntil.toISOString().slice(0, 10) + "T00:00:00Z"),
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
await seedRates();
await seedQuote();
await prisma.$disconnect();
