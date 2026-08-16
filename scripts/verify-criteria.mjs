#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

mkdirSync("/workspace/screenshots", { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

async function shot(name) {
  await page.screenshot({ path: `/workspace/screenshots/${name}.png`, fullPage: false });
}

await page.goto("http://127.0.0.1:8080/catalog", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(800);
const beforeText = await page.locator("body").innerText();
const beforeMatch = beforeText.match(/Shopify list \((\d+)\)/);
const before = beforeMatch ? Number(beforeMatch[1]) : -1;
await shot("verify-catalog-before");

await page.goto("http://127.0.0.1:8080/criteria", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(600);
const sliders = page.locator('input[type="range"]');
await sliders.nth(0).fill("55");
await page.waitForTimeout(300);
const preview = await page.locator("body").innerText();
const previewMatch = preview.match(/Preview of this draft[\s\S]*?(\d+)/);
const previewN = previewMatch ? Number(previewMatch[1]) : -1;
await shot("verify-criteria-draft");
await page.getByRole("button", { name: /Save and refresh all desks/ }).click();
await page.waitForTimeout(1200);

await page.goto("http://127.0.0.1:8080/catalog", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(800);
const afterText = await page.locator("body").innerText();
const afterMatch = afterText.match(/Shopify list \((\d+)\)/);
const after = afterMatch ? Number(afterMatch[1]) : -1;
await shot("verify-catalog-after");

await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(600);
await shot("verify-hq-images");

await page.goto("http://127.0.0.1:8080/history", { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(600);
const hist = await page.locator("body").innerText();
await shot("verify-history");

await page.goto("http://127.0.0.1:8080/criteria", { waitUntil: "networkidle", timeout: 45000 });
await page.getByRole("button", { name: /Reset saved/ }).click();
await page.waitForTimeout(400);

console.log(JSON.stringify({ before, previewN, after, historyHasVersion: /Criteria v|As-of/.test(hist), errors }, null, 2));
await browser.close();
if (before < 0 || after < 0) process.exit(2);
if (after >= before && previewN === before) {
  console.error("criteria save did not change listed count");
  process.exit(3);
}
if (after !== previewN && previewN >= 0) {
  console.error("catalog after save did not match preview");
  process.exit(4);
}
