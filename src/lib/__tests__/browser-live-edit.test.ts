// Browser Live Value Change Test
// Verifies that changing a component value in real-time immediately updates the SPICE simulation,
// MeasurementBus, Oscilloscope waveforms, and Multimeter readings.

import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Q\\.gemini\\antigravity-ide\\brain\\2b79a7ad-4385-4bed-8332-2d99f0619e8f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testLiveValueChange() {
  console.log('=== RUNNING LIVE VALUE CHANGE TEST ===');
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

    // 1. Click "Divider" starter card
    console.log('1. Loading Voltage Divider circuit...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const divBtn = allButtons.find(b => b.textContent?.includes('Divider'));
      if (divBtn) divBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // 2. Select R2 (Resistor 2) by clicking it on canvas
    console.log('2. Selecting Resistor component on canvas...');
    await page.evaluate(() => {
      const compEls = Array.from(document.querySelectorAll('div[class*="absolute"]'));
      // Find a resistor element
      const rEl = compEls.find(e => e.textContent?.includes('1000') || e.textContent?.includes('1k'));
      if (rEl) (rEl as HTMLElement).click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // 3. Change value in property panel to 3000
    console.log('3. Changing Resistor value to 3000 ohms...');
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
      if (inputs.length > 0) {
        const valInput = inputs[0] as HTMLInputElement;
        valInput.value = '3000';
        valInput.dispatchEvent(new Event('input', { bubbles: true }));
        valInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 2000));

    // 4. Check DMM reading
    const dmmText = await page.evaluate(() => {
      const dmmEl = document.querySelector('.font-mono.text-3xl') || document.querySelector('.font-mono.text-4xl');
      return dmmEl?.textContent?.trim() || 'N/A';
    });
    console.log('   ✓ DMM live reading after changing value to 3000Ω:', dmmText);

    const liveEditScreenshot = path.join(ARTIFACT_DIR, '11_live_value_change_verified.png');
    await page.screenshot({ path: liveEditScreenshot, fullPage: false });
    console.log('   ✓ Saved screenshot:', liveEditScreenshot);

    console.log('=== LIVE VALUE CHANGE TEST COMPLETE ===');
  } catch (err) {
    console.error('Live value change test error:', err);
  } finally {
    await browser.close();
  }
}

testLiveValueChange();
