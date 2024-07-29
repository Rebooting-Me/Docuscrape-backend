import { chromium } from "playwright";
import TurndownService from "turndown";

let turndownService = new TurndownService();

export default async function scrapeDocumentation(firstUrl) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(firstUrl);
  await page.waitForLoadState("domcontentloaded");

  // List of common selectors for main content
  const possibleSelectors = [
    "main",
    "article",
    "#main-content",
    ".main-content",
    "#content",
    ".content",
  ];

  let mainDiv = null;

  // Finds the first selector that matches the main element on the page
  for (const selector of possibleSelectors) {
    const element = await page.locator(selector).first();
    if ((await element.count()) > 0) {
      mainDiv = selector;
      console.log(`Main content div found: ${mainDiv}`);
      break;
    }
  }

  if (!mainDiv) {
    console.log("No suitable main content div found.");
    await browser.close();
    return;
  }

  const scrapedContent = []; // the scraped content will be stored in this array

  // Scrapes the innerHTML of the mainDiv(where the content lies) and
  // stores it in the array
  let articleContent = await page
    .locator(mainDiv)
    .innerHTML();
  let markdown = await turndownService.turndown(articleContent);

  scrapedContent.push({ url: page.url(), markdown: markdown });

  // Clicks the 'Next' link and repeats scraping until no 'Next' link is found
  while ((await page.locator('a :text-is("Next")').count()) > 0) {
    const currentUrl = page.url();
    await page.locator('a :text-is("Next")').click();
    await page.waitForLoadState("domcontentloaded");

    // Ensures the page has navigated to a new URL
    await page.waitForTimeout(1000); // Waiting for a short time to ensure navigation
    
    if (page.url() !== currentUrl) {
      
      articleContent = await page.locator(mainDiv).innerHTML();
      markdown = await turndownService.turndown(articleContent);
      scrapedContent.push({ url: page.url(), markdown: markdown });
    } else {
      console.log("Navigation did not occur. Stopping.");
      break;
    }
  }

  await browser.close();
  
  return scrapedContent;
}