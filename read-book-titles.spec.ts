import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker/locale/en";

const UI_URL = 'https://bookstoreui-production.up.railway.app/';
const API_URL = 'https://aqa-bookstoreapi-0.up.railway.app';
let bookTitle: string;

test.beforeEach(async ({ page }) => {
  await page.goto(UI_URL);
  expect(await page.title()).toEqual('Księgarania Testera');
  await expect(page.locator('#main-container')).toBeVisible();

  bookTitle = faker.music.songName();

});

test("Read all boo titles and search for Clean Code", async ({ page }) => {
  const titles: string[] = await page.locator('.card-title h5').allInnerTexts();
  expect(titles).toContain('Clean Code');
});

test("Add new book - UI only", async ({ page }) => {
  await page.getByRole("link").filter({ hasText: "Lista książek" }).click();
  await page.getByRole("button", { name: "Dodaj książkę" }).click();
  await page.getByRole("textbox", { name: "Tytuł" }).fill(bookTitle);
  await page.locator("#authorsField").selectOption("Andrew Hunt");
  await page.getByRole("textbox", { name: "Rok wydania:" }).fill("2024");
  await page.getByRole("textbox", { name: "Cena:" }).fill("100");
  await page.getByRole("textbox", { name: "Ilość egzemploarzy:" }).fill("100");
  await page.getByRole("button", { name: "Dodaj książkę" }).click();

  await expect(page.getByText("Książka dodana pomyślnie!")).toBeVisible();

  await page.reload();
  await expect(page.locator('#main-container')).toBeVisible();
  const titles: string[] = await page.locator('.card-title h5').allInnerTexts();
  expect(titles).toContain(bookTitle);
});

test("Add new book - API + UI", async ({ page, request }) => {

    console.log(bookTitle);
    const response = await request.post(`${API_URL}/books`, {
      data: {
        title: bookTitle,
        authors: [1],
        year: 2024,
        price: 100,
        available: 100
      }
    });

    expect(response.status()).toBe(201);

    await page.reload();
    await expect(page.locator('#main-container')).toBeVisible();
    const titles: string[] = await page.locator('.card-title h5').allInnerTexts();
    expect(titles).toContain(bookTitle);
});

test("Add new book API only", async ({ page, request }) => {

  // Create new book via API
  const response = await request.post(`${API_URL}/books`, {
    data: {
      title: bookTitle,
      authors: [1],
      year: 2024,
      price: 100,
      available: 100
    }
  });

  expect(response.status()).toBe(201);

  // API GET
  const responseGet = await request.get(`${API_URL}/books`);
  expect(responseGet.status()).toBe(200);

  const titles: string[] = (await responseGet.json()).map((book: any) => book.title);
  expect(titles).toContain(bookTitle);
});
