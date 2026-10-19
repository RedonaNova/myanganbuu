import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const username = process.env.ADMIN_USERNAME!;
const password = process.env.ADMIN_PASSWORD!;

test("admin requires login", async ({ page }) => {
  await page.goto("/admin/projects");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Нэвтрэх" })).toBeVisible();
});

test("login page is accessible", async ({ page }) => {
  await page.goto("/admin/login");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("wrong password shows an error, right password signs in, logout works", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Нэвтрэх нэр").fill(username);
  await page.getByLabel("Нууц үг", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Нэвтрэх" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Нэр эсвэл нууц үг буруу байна.");

  await page.getByLabel("Нууц үг", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Нэвтрэх" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Сайн байна уу" })).toBeVisible();

  const cookie = (await page.context().cookies()).find((c) => c.name === "mb_session");
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe("Lax");

  // Every tab resolves.
  for (const name of ["Хүсэлт", "Үнэ", "Тохиргоо", "Төсөл"]) {
    await page.getByRole("link", { name, exact: true }).first().click();
    await expect(page.getByRole("link", { name, exact: true }).first()).toHaveAttribute("aria-current", "page");
  }

  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(axe.violations).toEqual([]);

  await page.goto("/admin/settings");
  await page.getByRole("button", { name: "Гарах" }).last().click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});
