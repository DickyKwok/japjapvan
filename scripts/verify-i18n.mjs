import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
mkdirSync("/workspace/screenshots", { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(700);
await page.screenshot({ path: "/workspace/screenshots/palantir-en.png" });
const en = await page.locator("h1").first().innerText();

await page.getByRole("button", { name: "中文", exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/palantir-zh.png" });
const zh = await page.locator("h1").first().innerText();

await page.getByRole("button", { name: "日本語", exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/palantir-ja.png" });
const ja = await page.locator("h1").first().innerText();

await page.goto("http://127.0.0.1:8080/rising", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/palantir-rising-ja.png" });

console.log(JSON.stringify({ en, zh, ja, errors }, null, 2));
await browser.close();
if (!zh.includes("總台") && !zh.includes("本週")) process.exit(3);
if (!ja.includes("今週") && !ja.includes("HQ")) process.exit(4);
