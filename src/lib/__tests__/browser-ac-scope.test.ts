// Browser AC Transient & Oscilloscope Waveform Verification Test
import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Q\\.gemini\\antigravity-ide\\brain\\2b79a7ad-4385-4bed-8332-2d99f0619e8f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runAcScopeBrowserTest() {
  console.log('=== RUNNING AC TRANSIENT & OSCILLOSCOPE BROWSER TEST ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    await page.goto('http://localhost:3000/tools/circuit-simulator', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // Open Templates modal
    console.log('1. Opening Templates modal...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const tBtn = btns.find(b => b.textContent?.includes('Templates'));
      if (tBtn) tBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Click "RC Low-Pass Filter"
    console.log('2. Selecting RC Low-Pass Filter template...');
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('button, div'));
      const rcItem = items.find(el => el.textContent?.includes('RC Low-Pass Filter'));
      if (rcItem) rcItem.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // Scroll to Oscilloscope
    console.log('3. Scrolling to Oscilloscope...');
    await page.evaluate(() => {
      window.scrollBy(0, 680);
    });
    await new Promise(r => setTimeout(r, 1500));

    const acScopeScreenshot = path.join(ARTIFACT_DIR, '05_ac_oscilloscope_live_waveform.png');
    await page.screenshot({ path: acScopeScreenshot, fullPage: false });
    console.log('   ✓ Live AC Oscilloscope waveform screenshot saved:', acScopeScreenshot);

    console.log('=== AC OSCILLOSCOPE BROWSER TEST COMPLETE ===');
  } catch (e) {
    console.error('AC test error:', e);
  } finally {
    await browser.close();
  }
}

runAcScopeBrowserTest();
