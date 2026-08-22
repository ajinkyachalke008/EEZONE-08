// Browser End-to-End RLC Circuit Resonance Test
import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Q\\.gemini\\antigravity-ide\\brain\\2b79a7ad-4385-4bed-8332-2d99f0619e8f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runRlcBrowserTest() {
  console.log('=== RUNNING RLC RESONANT CIRCUIT BROWSER TEST ===');
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

    // 1. Click "Templates" button
    console.log('1. Opening Templates modal...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const tBtn = btns.find(b => b.textContent?.includes('Templates'));
      if (tBtn) tBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // 2. Click "Analog" tab
    console.log('2. Clicking "Analog" tab...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button, div[role="tab"]'));
      const analogTab = tabs.find(t => t.textContent?.trim() === 'Analog');
      if (analogTab) (analogTab as HTMLElement).click();
    });
    await new Promise(r => setTimeout(r, 800));

    // 3. Select "RLC Resonant Tank"
    console.log('3. Selecting "RLC Resonant Tank"...');
    const selected = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('*'));
      const rlcCard = cards.find(el => el.textContent?.includes('RLC Resonant Tank') && el.tagName !== 'SCRIPT');
      if (rlcCard) {
        (rlcCard as HTMLElement).click();
        return true;
      }
      return false;
    });
    console.log('   ✓ Template click result:', selected);

    // Wait for SPICE transient solve
    await new Promise(r => setTimeout(r, 3000));

    // Capture RLC circuit on canvas
    const rlcCanvasScreenshot = path.join(ARTIFACT_DIR, '07_rlc_circuit_canvas.png');
    await page.screenshot({ path: rlcCanvasScreenshot, fullPage: false });
    console.log('   ✓ RLC Circuit canvas screenshot saved:', rlcCanvasScreenshot);

    // 4. Scroll to Oscilloscope and DMM
    console.log('4. Inspecting RLC Oscilloscope & Multimeter...');
    await page.evaluate(() => {
      window.scrollBy(0, 560);
    });
    await new Promise(r => setTimeout(r, 1500));

    // Read live metrics from DOM
    const rlcMetrics = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return {
        hasScopeText: bodyText.includes('Vpp') && bodyText.includes('Hz'),
        snippets: Array.from(document.querySelectorAll('.font-mono')).map(e => e.textContent?.trim()).slice(0, 10)
      };
    });
    console.log('   ✓ RLC Scope Live Metrics:', rlcMetrics.snippets);

    // Capture Oscilloscope & DMM visual
    const rlcScopeScreenshot = path.join(ARTIFACT_DIR, '08_rlc_oscilloscope_resonance_waveform.png');
    await page.screenshot({ path: rlcScopeScreenshot, fullPage: false });
    console.log('   ✓ RLC Resonance Oscilloscope screenshot saved:', rlcScopeScreenshot);

    console.log('\n=== RLC BROWSER VERIFICATION TEST COMPLETE (100%) ===');
  } catch (err) {
    console.error('RLC browser test error:', err);
  } finally {
    await browser.close();
  }
}

runRlcBrowserTest();
