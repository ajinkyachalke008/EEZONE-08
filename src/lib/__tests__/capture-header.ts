import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Q\\.gemini\\antigravity-ide\\brain\\2b79a7ad-4385-4bed-8332-2d99f0619e8f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureHeader() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  // Check icon links
  const iconHref = await page.evaluate(() => {
    const icon = document.querySelector('link[rel*="icon"]');
    const manifest = document.querySelector('link[rel="manifest"]');
    return {
      icon: icon ? icon.getAttribute('href') : null,
      manifest: manifest ? manifest.getAttribute('href') : null,
      title: document.title
    };
  });
  console.log('Page metadata:', iconHref);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '35_navbar_with_new_logo_live.png') });
  console.log('✓ Saved 35_navbar_with_new_logo_live.png');

  await browser.close();
}

captureHeader();
