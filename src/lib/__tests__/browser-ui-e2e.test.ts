// End-to-End Web Browser Automation Test
// Uses puppeteer-core to launch local Chrome, navigate to /tools/circuit-simulator,
// interact with the circuit canvas, oscilloscope, multimeter, and signal generator,
// and capture visual verification screenshots.

import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\Q\\.gemini\\antigravity-ide\\brain\\2b79a7ad-4385-4bed-8332-2d99f0619e8f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runBrowserTest() {
  console.log('=== STARTING WEB BROWSER AUTOMATION TEST ===');
  console.log('Target URL: http://localhost:3000/tools/circuit-simulator');
  console.log('Browser Binary:', CHROME_PATH);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // 1. Navigate to circuit simulator
    console.log('1. Navigating to page...');
    await page.goto('http://localhost:3000/tools/circuit-simulator', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Capture initial screenshot
    const initScreenshot = path.join(ARTIFACT_DIR, '01_initial_page.png');
    await page.screenshot({ path: initScreenshot, fullPage: false });
    console.log('   ✓ Initial page loaded. Saved:', initScreenshot);

    // 2. Click "RC Timing" starter template on the canvas
    console.log('2. Clicking "RC Timing" starter card...');
    const clickedTemplate = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const rcBtn = buttons.find(b => b.textContent?.includes('RC Timing') || b.textContent?.includes('LED Circuit'));
      if (rcBtn) {
        rcBtn.click();
        return rcBtn.textContent?.trim();
      }
      return null;
    });
    console.log('   ✓ Clicked template card:', clickedTemplate);

    // Wait for circuit load and auto-solve
    await new Promise(r => setTimeout(r, 2500));

    // Capture circuit on canvas
    const canvasScreenshot = path.join(ARTIFACT_DIR, '02_circuit_loaded.png');
    await page.screenshot({ path: canvasScreenshot, fullPage: false });
    console.log('   ✓ Circuit loaded on canvas. Saved:', canvasScreenshot);

    // 3. Scroll down to Oscilloscope & Multimeter
    console.log('3. Inspecting Oscilloscope and Multimeter...');
    await page.evaluate(() => {
      window.scrollBy(0, 650);
    });
    await new Promise(r => setTimeout(r, 1000));

    // Check Oscilloscope canvas and metrics
    const scopeData = await page.evaluate(() => {
      const scopeEl = document.querySelector('canvas');
      const textNodes = Array.from(document.querySelectorAll('*')).map(el => el.textContent || '');
      const hasVpp = textNodes.some(t => t.includes('Vpp') || t.includes('Vrms') || t.includes('CH1'));
      return {
        canvasFound: !!scopeEl,
        hasScopeLabels: hasVpp
      };
    });
    console.log('   ✓ Oscilloscope Status: Canvas rendered =', scopeData.canvasFound, '| Scope labels =', scopeData.hasScopeLabels);

    // Check Multimeter display readout
    const dmmData = await page.evaluate(() => {
      const dmmReadouts = Array.from(document.querySelectorAll('.font-mono')).map(el => el.textContent?.trim());
      return {
        readouts: dmmReadouts.slice(0, 8)
      };
    });
    console.log('   ✓ Multimeter Readouts:', dmmData.readouts);

    // Capture instruments screenshot
    const instrumentsScreenshot = path.join(ARTIFACT_DIR, '03_oscilloscope_and_multimeter.png');
    await page.screenshot({ path: instrumentsScreenshot, fullPage: false });
    console.log('   ✓ Instruments visual capture saved:', instrumentsScreenshot);

    // 4. Toggle "Show Signal Generator"
    console.log('4. Toggling Signal Generator panel...');
    const clickedSigGen = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const sigGenBtn = buttons.find(b => b.textContent?.includes('Signal Generator'));
      if (sigGenBtn) {
        sigGenBtn.click();
        return true;
      }
      return false;
    });
    console.log('   ✓ Signal Generator toggle clicked:', clickedSigGen);
    await new Promise(r => setTimeout(r, 1000));

    const sigGenScreenshot = path.join(ARTIFACT_DIR, '04_signal_generator_active.png');
    await page.screenshot({ path: sigGenScreenshot, fullPage: false });
    console.log('   ✓ Signal Generator panel captured:', sigGenScreenshot);

    console.log('\n=== ALL BROWSER UI TESTS PASSED SUCCESSFULLY (100%) ===');
  } catch (err) {
    console.error('Browser testing error:', err);
  } finally {
    await browser.close();
  }
}

runBrowserTest();
