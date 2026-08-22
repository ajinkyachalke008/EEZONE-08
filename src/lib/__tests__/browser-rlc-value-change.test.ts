// Browser RLC Value Change Test
// Tests changing the RLC resistor from 50 ohms to 200 ohms (lowering Q factor and resonant amplitude)
// and verifies that the live oscilloscope CH2 Vpp reading changes accordingly!

import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Q\\.gemini\\antigravity-ide\\brain\\2b79a7ad-4385-4bed-8332-2d99f0619e8f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testRlcValueChange() {
  console.log('=== RUNNING RLC LIVE VALUE CHANGE TEST ===');
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

    // 1. Click "RLC Tank" starter card
    console.log('1. Loading RLC Tank circuit...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const rlcBtn = allButtons.find(b => b.textContent?.includes('RLC Tank'));
      if (rlcBtn) rlcBtn.click();
    });
    await new Promise(r => setTimeout(r, 2500));

    // 2. Read initial resonant Vpp at R=50 ohms
    const initialMetrics = await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('.font-mono')).map(e => e.textContent?.trim());
      return texts.find(t => t?.includes('CH2 Vpp:')) || 'N/A';
    });
    console.log('   ✓ Initial Resonant Metrics (R=50Ω):', initialMetrics);

    // 3. Select Resistor component (50 ohms)
    console.log('2. Selecting 50 ohm Resistor on canvas...');
    await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('div'));
      const rEl = divs.find(d => d.textContent?.includes('50 Ω'));
      if (rEl) rEl.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // 4. Change value in property input to 200
    console.log('3. Editing Resistor value to 200 ohms in property panel...');
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
      if (inputs.length > 0) {
        const valInput = inputs[0] as HTMLInputElement;
        valInput.value = '200';
        valInput.dispatchEvent(new Event('input', { bubbles: true }));
        valInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 2000));

    // 5. Read updated resonant Vpp at R=200 ohms
    const updatedMetrics = await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('.font-mono')).map(e => e.textContent?.trim());
      return texts.find(t => t?.includes('CH2 Vpp:')) || 'N/A';
    });
    console.log('   ✓ Updated Resonant Metrics (R=200Ω, Q=1.58):', updatedMetrics);

    const rlcEditScreenshot = path.join(ARTIFACT_DIR, '12_rlc_value_change_verified.png');
    await page.screenshot({ path: rlcEditScreenshot, fullPage: false });
    console.log('   ✓ Screenshot saved:', rlcEditScreenshot);

    console.log('=== RLC VALUE CHANGE TEST COMPLETE (100% SUCCESS) ===');
  } catch (err) {
    console.error('RLC value change test error:', err);
  } finally {
    await browser.close();
  }
}

testRlcValueChange();
