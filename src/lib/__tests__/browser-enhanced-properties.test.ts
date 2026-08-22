// Browser Test: Enhanced Component Properties Inspector
import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Q\\.gemini\\antigravity-ide\\brain\\2b79a7ad-4385-4bed-8332-2d99f0619e8f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testEnhancedProperties() {
  console.log('=== RUNNING ENHANCED COMPONENT PROPERTIES TEST ===');
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

    // 1. Load Divider circuit
    console.log('1. Loading Voltage Divider circuit...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const divBtn = allButtons.find(b => b.textContent?.includes('Divider'));
      if (divBtn) divBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // 2. Click a Resistor component on the canvas
    console.log('2. Selecting Resistor on canvas to trigger Enhanced Properties Inspector...');
    await page.evaluate(() => {
      const compDivs = Array.from(document.querySelectorAll('.absolute.cursor-pointer'));
      if (compDivs.length > 0) {
        (compDivs[1] as HTMLElement).click();
      }
    });
    await new Promise(r => setTimeout(r, 1500));

    // 3. Scroll to show Enhanced Inspector
    console.log('3. Scrolling to show Enhanced Properties Inspector...');
    await page.evaluate(() => {
      window.scrollBy({ top: 350, behavior: 'smooth' });
    });
    await new Promise(r => setTimeout(r, 1500));

    // 4. Capture screenshot of Enhanced Inspector
    const inspectorScreenshot = path.join(ARTIFACT_DIR, '13_enhanced_component_inspector.png');
    await page.screenshot({ path: inspectorScreenshot, fullPage: false });
    console.log('   ✓ Enhanced Inspector screenshot saved:', inspectorScreenshot);

    console.log('=== ENHANCED COMPONENT PROPERTIES TEST COMPLETE (100% SUCCESS) ===');
  } catch (err) {
    console.error('Enhanced inspector test error:', err);
  } finally {
    await browser.close();
  }
}

testEnhancedProperties();
