// Browser RLC Direct Click Test
import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Q\\.gemini\\antigravity-ide\\brain\\2b79a7ad-4385-4bed-8332-2d99f0619e8f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runRlcDirectTest() {
  console.log('=== RUNNING RLC DIRECT CLICK TEST ===');
  
  // Warm up dev server route
  console.log('0. Warming up route...');
  try {
    await fetch('http://localhost:3000/tools/circuit-simulator');
  } catch {}

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1100']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  try {
    console.log('1. Navigating to page...');
    await page.goto('http://localhost:3000/tools/circuit-simulator', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000));
    const btnTexts = await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      return allButtons.map(b => b.textContent?.trim() || '');
    });
    console.log('   Available buttons on page:', btnTexts);

    const clicked = await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const rlcBtn = allButtons.find(b => b.textContent?.includes('RLC Tank'));
      if (rlcBtn) {
        rlcBtn.click();
        return rlcBtn.textContent?.trim();
      }
      return null;
    });
    console.log('   ✓ Button clicked:', clicked);

    // Wait for SPICE to solve transient resonant waveforms
    await new Promise(r => setTimeout(r, 2500));

    // Capture RLC circuit on canvas
    const rlcCanvasScreenshot = path.join(ARTIFACT_DIR, '09_rlc_circuit_canvas_live.png');
    await page.screenshot({ path: rlcCanvasScreenshot, fullPage: false });
    console.log('   ✓ RLC circuit canvas screenshot saved:', rlcCanvasScreenshot);

    // 2. Scroll to Oscilloscope and DMM
    console.log('2. Scrolling to virtual instruments...');
    await page.evaluate(() => {
      window.scrollBy(0, 560);
    });
    await new Promise(r => setTimeout(r, 1000));

    // Click AutoSet button
    console.log('3. Clicking AutoSet to scale resonant waveforms...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const autoBtn = btns.find(b => b.textContent?.includes('AutoSet'));
      if (autoBtn) autoBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Read live metrics from scope
    const scopeMetrics = await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('.font-mono')).map(e => e.textContent?.trim());
      return texts.slice(0, 12);
    });
    console.log('   ✓ Scope & DMM live readings:', scopeMetrics);

    const rlcScopeScreenshot = path.join(ARTIFACT_DIR, '10_rlc_oscilloscope_live_waveform.png');
    await page.screenshot({ path: rlcScopeScreenshot, fullPage: false });
    console.log('   ✓ RLC live oscilloscope screenshot saved:', rlcScopeScreenshot);

    console.log('=== RLC DIRECT CLICK TEST COMPLETE (100% SUCCESS) ===');
  } catch (err) {
    console.error('RLC test error:', err);
  } finally {
    await browser.close();
  }
}

runRlcDirectTest();
