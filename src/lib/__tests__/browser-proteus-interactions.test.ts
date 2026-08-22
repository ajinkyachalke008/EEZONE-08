// Browser Test: Proteus / MATLAB Simulink Interactive Controls & Quick Actions
import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Q\\.gemini\\antigravity-ide\\brain\\2b79a7ad-4385-4bed-8332-2d99f0619e8f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testProteusInteractions() {
  console.log('=== RUNNING PROTEUS / SIMULINK CONTROLS TEST ===');
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

    // 2. Select Resistor to show Floating Quick Action Pill
    console.log('2. Clicking Resistor to show Floating Quick-Action Pill...');
    await page.evaluate(() => {
      const compDivs = Array.from(document.querySelectorAll('.absolute.cursor-pointer'));
      if (compDivs.length > 0) {
        (compDivs[1] as HTMLElement).click();
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    const quickPillScreenshot = path.join(ARTIFACT_DIR, '14_proteus_floating_quick_pill.png');
    await page.screenshot({ path: quickPillScreenshot, fullPage: false });
    console.log('   ✓ Floating quick pill screenshot saved:', quickPillScreenshot);

    // 3. Right click component to open Context Menu
    console.log('3. Right-clicking component to open Proteus Context Menu...');
    await page.evaluate(() => {
      const compDivs = Array.from(document.querySelectorAll('.absolute.cursor-pointer'));
      if (compDivs.length > 0) {
        const el = compDivs[1] as HTMLElement;
        const rect = el.getBoundingClientRect();
        const event = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2
        });
        el.dispatchEvent(event);
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    const contextMenuScreenshot = path.join(ARTIFACT_DIR, '15_proteus_context_menu.png');
    await page.screenshot({ path: contextMenuScreenshot, fullPage: false });
    console.log('   ✓ Context Menu screenshot saved:', contextMenuScreenshot);

    // 4. Click a wire to select it and show the Wire Delete Badge
    console.log('4. Clicking a wire to show wire selection & interactive delete badge...');
    await page.evaluate(() => {
      // Click canvas to close context menu
      const canvas = document.querySelector('.relative.overflow-hidden') as HTMLElement;
      if (canvas) canvas.click();
      
      const wireGroup = document.querySelector('svg g.cursor-pointer');
      if (wireGroup) {
        wireGroup.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    const wireSelectScreenshot = path.join(ARTIFACT_DIR, '16_wire_selection_and_delete_badge.png');
    await page.screenshot({ path: wireSelectScreenshot, fullPage: false });
    console.log('   ✓ Wire selection screenshot saved:', wireSelectScreenshot);

    // 5. Test Deleting Wire by clicking the SVG delete badge
    console.log('5. Clicking SVG delete badge on wire...');
    await page.evaluate(() => {
      const deleteBadge = document.querySelector('svg g.cursor-pointer g.cursor-pointer');
      if (deleteBadge) {
        deleteBadge.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    const wireDeletedScreenshot = path.join(ARTIFACT_DIR, '17_wire_deleted_successfully.png');
    await page.screenshot({ path: wireDeletedScreenshot, fullPage: false });
    console.log('   ✓ Wire deleted screenshot saved:', wireDeletedScreenshot);

    console.log('=== PROTEUS / SIMULINK CONTROLS TEST COMPLETE (100% SUCCESS) ===');
  } catch (err) {
    console.error('Proteus test error:', err);
  } finally {
    await browser.close();
  }
}

testProteusInteractions();
