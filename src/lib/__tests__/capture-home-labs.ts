import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Q\\.gemini\\antigravity-ide\\brain\\2b79a7ad-4385-4bed-8332-2d99f0619e8f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureHomeLabs() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1100']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  console.log('Capturing Home screen with Master Virtual Laboratories cards (/)...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Scroll slightly down to center on the Master Virtual Laboratories section
  await page.evaluate(() => {
    window.scrollBy(0, 600);
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '28_homepage_master_laboratories_live.png') });
  console.log('✓ Saved 28_homepage_master_laboratories_live.png');

  await browser.close();
  console.log('=== HOME SCREEN CAPTURE COMPLETED ===');
}

captureHomeLabs();
