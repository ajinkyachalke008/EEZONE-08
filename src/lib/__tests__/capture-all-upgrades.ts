import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Q\\.gemini\\antigravity-ide\\brain\\2b79a7ad-4385-4bed-8332-2d99f0619e8f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureAllUpgrades() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('1. Capturing Troubleshooting Exam (/tools/troubleshooting-exam)...');
  await page.goto('http://localhost:3000/tools/troubleshooting-exam', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '25_troubleshooting_exam_live.png') });
  console.log('   ✓ Saved 25_troubleshooting_exam_live.png');

  console.log('2. Capturing 3-Phase Induction Motor (/tools/electrical-machines)...');
  await page.goto('http://localhost:3000/tools/electrical-machines', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  // Click on Induction Motor tab
  const tabs = await page.$$('button[role="tab"]');
  for (const t of tabs) {
    const text = await page.evaluate(el => el.textContent, t);
    if (text && text.includes('Induction Motor')) {
      await t.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '26_induction_motor_torque_speed_live.png') });
  console.log('   ✓ Saved 26_induction_motor_torque_speed_live.png');

  console.log('3. Capturing Microprocessor 8085 Hardware Interrupts (/tools/microprocessor-8085)...');
  await page.goto('http://localhost:3000/tools/microprocessor-8085', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '27_microprocessor_8085_interrupts_live.png') });
  console.log('   ✓ Saved 27_microprocessor_8085_interrupts_live.png');

  await browser.close();
  console.log('=== ALL NEW FEATURES CAPTURED SUCCESSFULLY ===');
}

captureAllUpgrades();
