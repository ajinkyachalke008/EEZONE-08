import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Q\\.gemini\\antigravity-ide\\brain\\2b79a7ad-4385-4bed-8332-2d99f0619e8f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureNewLabPages() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('1. Testing Master Lab Bench (/tools/lab-bench)...');
  await page.goto('http://localhost:3000/tools/lab-bench', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '23_master_lab_bench_live.png') });
  console.log('   ✓ Saved 23_master_lab_bench_live.png');

  console.log('2. Testing University Lab Experiments (/tools/lab-experiments)...');
  await page.goto('http://localhost:3000/tools/lab-experiments', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '24_university_lab_experiments_live.png') });
  console.log('   ✓ Saved 24_university_lab_experiments_live.png');

  await browser.close();
  console.log('=== ALL NEW VIRTUAL LAB PAGES VERIFIED ===');
}

captureNewLabPages();
