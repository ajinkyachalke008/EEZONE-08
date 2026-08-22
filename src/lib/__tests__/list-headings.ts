import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function listPageSections() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  const sections = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim()
    }));
  });

  console.log('Page headings found:', sections);
  await browser.close();
}

listPageSections();
