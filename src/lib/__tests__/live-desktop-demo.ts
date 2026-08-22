// Live Desktop Visual Browser Demo
// Launches visible Google Chrome on the user's desktop with automated demonstration steps,
// showing circuit loading, SPICE solving, oscilloscope auto-scaling, and multimeter testing.

import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runLiveDesktopDemo() {
  console.log('=== LAUNCHING LIVE BROWSER DEMO ON YOUR DESKTOP ===');
  console.log('Opening Chrome window on screen...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false, // Visible browser on user desktop!
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const pages = await browser.pages();
  const page = pages[0] || await browser.newPage();

  try {
    // 1. Navigate to Circuit Simulator
    console.log('1. Navigating to http://localhost:3000/tools/circuit-simulator ...');
    await page.goto('http://localhost:3000/tools/circuit-simulator', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2000));

    // 2. Click RLC Resonant Tank
    console.log('2. Loading RLC Resonant Tank Circuit on canvas...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const rlcBtn = allButtons.find(b => b.textContent?.includes('RLC Tank'));
      if (rlcBtn) rlcBtn.click();
    });
    await new Promise(r => setTimeout(r, 2500));

    // 3. Scroll down to show Oscilloscope and Multimeter
    console.log('3. Scrolling to 4-Channel DSO Oscilloscope and Digital Multimeter...');
    await page.evaluate(() => {
      window.scrollBy({ top: 580, behavior: 'smooth' });
    });
    await new Promise(r => setTimeout(r, 2000));

    // 4. Click AutoSet on the Oscilloscope
    console.log('4. Triggering Oscilloscope AutoSet for optimal waveform scaling...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const autoBtn = allButtons.find(b => b.textContent?.includes('AutoSet'));
      if (autoBtn) autoBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // 5. Open Signal Generator
    console.log('5. Opening Arbitrary Signal Generator drawer...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const sigBtn = allButtons.find(b => b.textContent?.includes('Signal Generator'));
      if (sigBtn) sigBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // 6. Test Multimeter modes (V AC, Continuity)
    console.log('6. Switching Multimeter to V~ AC (True RMS)...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const vacBtn = allButtons.find(b => b.textContent?.includes('V~ AC'));
      if (vacBtn) vacBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    console.log('=== LIVE DESKTOP DEMO READY & RUNNING ===');
    console.log('Chrome window is now active on your desktop for live interaction.');
  } catch (err) {
    console.error('Desktop demo error:', err);
  }
}

runLiveDesktopDemo();
