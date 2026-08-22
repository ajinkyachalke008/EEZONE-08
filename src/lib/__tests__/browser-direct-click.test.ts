// Browser Direct Click RC Timing & Waveform Capture
import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Q\\.gemini\\antigravity-ide\\brain\\2b79a7ad-4385-4bed-8332-2d99f0619e8f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runDirectClickTest() {
  console.log('=== RUNNING DIRECT CLICK RC TIMING BROWSER TEST ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1100']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  try {
    await page.goto('http://localhost:3000/tools/circuit-simulator', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // Find and click the RC Timing card button on the canvas
    console.log('1. Clicking RC Timing card button...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const rcBtn = allButtons.find(b => b.textContent?.includes('RC Timing'));
      if (rcBtn) rcBtn.click();
    });

    // Wait for circuit to load and SPICE to simulate
    await new Promise(r => setTimeout(r, 2000));

    // Scroll down to the Oscilloscope & Multimeter
    console.log('2. Scrolling to virtual instruments...');
    await page.evaluate(() => {
      window.scrollBy(0, 550);
    });
    await new Promise(r => setTimeout(r, 1500));

    // Capture visual screenshot
    const finalScopeScreenshot = path.join(ARTIFACT_DIR, '06_rc_timing_live_oscilloscope_and_dmm.png');
    await page.screenshot({ path: finalScopeScreenshot, fullPage: false });
    console.log('   ✓ RC Timing live instrument screenshot saved:', finalScopeScreenshot);

    console.log('=== DIRECT CLICK BROWSER TEST COMPLETED ===');
  } catch (err) {
    console.error('Direct click test error:', err);
  } finally {
    await browser.close();
  }
}

runDirectClickTest();
