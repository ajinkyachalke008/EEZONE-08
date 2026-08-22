import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Q\\.gemini\\antigravity-ide\\brain\\2b79a7ad-4385-4bed-8332-2d99f0619e8f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function capturePictures() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1200']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });

  console.log('Capturing Home screen cards with images (/)...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));

  // 1. Scroll to Project Management Suite
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2'));
    const pmHeading = headings.find(h => h.textContent && h.textContent.includes('Project Management Suite'));
    if (pmHeading) {
      pmHeading.scrollIntoView({ behavior: 'instant', block: 'start' });
      window.scrollBy(0, -60);
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '32_project_management_with_pictures_live.png') });
  console.log('✓ Saved 32_project_management_with_pictures_live.png');

  // 2. Scroll to Master Virtual Laboratories
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2'));
    const labHeading = headings.find(h => h.textContent && h.textContent.includes('Master Virtual Laboratories'));
    if (labHeading) {
      labHeading.scrollIntoView({ behavior: 'instant', block: 'start' });
      window.scrollBy(0, -60);
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '31_master_labs_with_pictures_live.png') });
  console.log('✓ Saved 31_master_labs_with_pictures_live.png');

  await browser.close();
  console.log('=== PICTURE SCREENSHOTS COMPLETED ===');
}

capturePictures();
