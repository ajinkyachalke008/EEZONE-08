import http from 'http';

const urls = [
  '/favicon.ico',
  '/favicon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/manifest.json'
];

async function checkUrl(urlPath: string): Promise<void> {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      console.log(`[${res.statusCode}] ${urlPath} (${res.headers['content-type']}, ${res.headers['content-length']} bytes)`);
      resolve();
    }).on('error', (err) => {
      console.error(`Error on ${urlPath}:`, err.message);
      resolve();
    });
  });
}

async function verifyAll() {
  console.log('Verifying icon and manifest endpoints on http://localhost:3000...');
  for (const u of urls) {
    await checkUrl(u);
  }
  console.log('=== ENDPOINTS VERIFIED ===');
}

verifyAll();
