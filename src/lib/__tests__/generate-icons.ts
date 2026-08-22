import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SOURCE_IMAGE = path.join(process.cwd(), 'public', 'images', 'logo', 'ee-zone-app-icon.jpg');

async function generatePngIcons() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Read base64
  const imgBase64 = fs.readFileSync(SOURCE_IMAGE).toString('base64');
  const imgSrc = `data:image/jpeg;base64,${imgBase64}`;

  const sizes = [
    { name: 'favicon-16x16.png', size: 16, dest: ['public'] },
    { name: 'favicon-32x32.png', size: 32, dest: ['public'] },
    { name: 'favicon.png', size: 64, dest: ['public', 'src/app'] },
    { name: 'icon.png', size: 512, dest: ['public', 'src/app'] },
    { name: 'apple-touch-icon.png', size: 180, dest: ['public'] },
    { name: 'apple-icon.png', size: 180, dest: ['src/app'] },
    { name: 'icon-192.png', size: 192, dest: ['public'] },
    { name: 'icon-512.png', size: 512, dest: ['public'] },
    { name: 'favicon.ico', size: 48, dest: ['public', 'src/app'] }
  ];

  for (const { name, size, dest } of sizes) {
    await page.setViewport({ width: size, height: size });
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; }
            img { width: 100%; height: 100%; object-fit: cover; display: block; }
          </style>
        </head>
        <body>
          <img src="${imgSrc}" />
        </body>
      </html>
    `);

    const buffer = await page.screenshot({ type: 'png', omitBackground: true });

    for (const d of dest) {
      const targetDir = path.join(process.cwd(), d);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const targetFile = path.join(targetDir, name);
      fs.writeFileSync(targetFile, buffer);
      console.log(`Generated: ${targetFile} (${size}x${size})`);
    }
  }

  await browser.close();
  console.log('=== ALL PNG ICONS SUCCESSFULLY GENERATED ===');
}

generatePngIcons();
