import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Q\\.gemini\\antigravity-ide\\brain\\2b79a7ad-4385-4bed-8332-2d99f0619e8f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testProblemSolverUI() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Scroll to AI Problem Solver section
  console.log('Scrolling to AI Problem Solver...');
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2, h3, div'));
    const ps = headings.find(h => h.textContent && h.textContent.includes('AI Problem Solver'));
    if (ps) {
      ps.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  // Find textarea and type
  console.log('Typing problem into textarea...');
  const textarea = await page.$('textarea');
  if (textarea) {
    await textarea.type('A 100 ohm resistor is connected to a 12V DC battery. Calculate current and power.');
    await new Promise(r => setTimeout(r, 500));

    // Click "Get AI Solution" button
    console.log('Clicking Get AI Solution button...');
    const buttons = await page.$$('button');
    let solveBtn = null;
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Get AI Solution')) {
        solveBtn = b;
        break;
      }
    }

    if (solveBtn) {
      await solveBtn.click();
      console.log('Clicked solve button, waiting for AI response...');
      // Wait up to 30s for the solution to appear
      await page.waitForSelector('.prose', { timeout: 30000 }).catch(() => null);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '37_problem_solver_solution_rendered.png') });
  console.log('Saved screenshot to 37_problem_solver_solution_rendered.png');

  // Check result or error on page
  const pageState = await page.evaluate(() => {
    const errorBox = document.querySelector('.bg-red-500\\/10');
    const solutionText = document.querySelector('.prose');
    return {
      solutionFound: !!solutionText,
      solutionContent: solutionText ? solutionText.textContent : null,
      errorFound: !!errorBox,
      errorText: errorBox ? errorBox.textContent : null,
    };
  });
  console.log('Problem Solver Final Page State:');
  console.log(JSON.stringify(pageState, null, 2));

  await browser.close();
}

testProblemSolverUI();
