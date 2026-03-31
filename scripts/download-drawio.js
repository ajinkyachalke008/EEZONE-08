const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../public/drawio');

if (!fs.existsSync(targetDir)) {
  console.log('Downloading drawio via git sparse-checkout...');
  const tmpDir = path.join(__dirname, '../drawio-tmp');
  
  // Clean up any old tmp dir
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  
  try {
    // 1. Clone only the top-level tree info (no blobs)
    execSync(`git clone --depth 1 --filter=blob:none --sparse https://github.com/jgraph/drawio.git "${tmpDir}"`, { stdio: 'inherit' });
    
    // 2. Set the sparse-checkout to exactly the webapp directory
    execSync(`git -C "${tmpDir}" sparse-checkout set src/main/webapp`, { stdio: 'inherit' });
    
    // 3. Create target directory
    fs.mkdirSync(path.join(__dirname, '../public'), { recursive: true });
    
    // 4. Copy the webapp files
    const sourceWebapp = path.join(tmpDir, 'src', 'main', 'webapp');
    
    // Use platform-appropriate copy command
    if (process.platform === 'win32') {
      execSync(`xcopy "${sourceWebapp}" "${targetDir}" /E /I /Q /Y`, { stdio: 'inherit' });
    } else {
      execSync(`cp -r "${sourceWebapp}" "${targetDir}"`, { stdio: 'inherit' });
    }
    
    // ========================================
    // 5. Patch AI Generate URL → local proxy
    // ========================================
    console.log('Patching draw.io for AI Generate proxy...');
    const jsDir = path.join(targetDir, 'js');
    const filesToPatch = ['app.min.js', 'integrate.min.js', 'viewer.min.js', 'viewer-static.min.js'];
    
    for (const file of filesToPatch) {
      const filePath = path.join(jsDir, file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');
        content = content.replaceAll('https://www.draw.io/generate/v3', '/api/drawio-generate');
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`  Patched ${file}`);
      }
    }
    
    // ========================================
    // 6. Configure PreConfig.js for EE Zone
    // ========================================
    const preConfigPath = path.join(jsDir, 'PreConfig.js');
    const preConfigContent = `/**
 * EE Zone - Draw.io Configuration
 * Enables all features: AI Generate, Mermaid, Export, Templates
 */
window.DRAWIO_PUBLIC_BUILD = true;
window.EXPORT_URL = '/api/drawio-export';
window.PLANT_URL = 'https://www.plantuml.com/plantuml';
window.DRAWIO_BASE_URL = null;
window.DRAWIO_VIEWER_URL = null;
window.DRAWIO_LIGHTBOX_URL = null;
window.DRAW_MATH_URL = 'math4/es5';
window.DRAWIO_CONFIG = {
  "enableAi": true,
  "enableMermaid": true,
  "defaultFonts": ["Helvetica", "Verdana", "Times New Roman", "Courier New", "Orbitron"],
  "customColorSchemes": [[
    {"fill": "#0B0A11", "stroke": "#9C4AFF", "font": "#FFFFFF"},
    {"fill": "#1a1625", "stroke": "#FF6B00", "font": "#FFFFFF"},
    {"fill": "#9C4AFF", "stroke": "#7B2FCC", "font": "#FFFFFF"},
    {"fill": "#FF6B00", "stroke": "#CC5500", "font": "#FFFFFF"},
    {"fill": "#00E5FF", "stroke": "#00B8CC", "font": "#0B0A11"},
    {"fill": "#FF00C8", "stroke": "#CC009E", "font": "#FFFFFF"},
    {"fill": "#00FF88", "stroke": "#00CC6B", "font": "#0B0A11"},
    {"fill": "#FFD700", "stroke": "#CCB000", "font": "#0B0A11"}
  ]],
  "enableScratchpad": true,
  "darkMode": true,
  "enableGeneralShapes": true,
  "defaultLibraries": "general;electrical;uml;flowchart;arrows2",
  "enableCustomLibraries": true,
  "enableCsvImport": true
};
urlParams['sync'] = 'manual';
`;
    fs.writeFileSync(preConfigPath, preConfigContent, 'utf-8');
    console.log('  Configured PreConfig.js');
    
    // ========================================
    // 7. Disable service worker (prevent caching)
    // ========================================
    const swPath = path.join(targetDir, 'service-worker.js');
    const swContent = `// EE Zone - Disabled service worker to prevent caching issues
self.addEventListener('install', function() { self.skipWaiting(); });
self.addEventListener('activate', function(event) {
  event.waitUntil(caches.keys().then(function(names) {
    return Promise.all(names.map(function(name) { return caches.delete(name); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function(event) { event.respondWith(fetch(event.request)); });
`;
    fs.writeFileSync(swPath, swContent, 'utf-8');
    console.log('  Disabled service worker');
    
    // ========================================
    // 8. Cleanup the git repo clone
    // ========================================
    fs.rmSync(tmpDir, { recursive: true, force: true });
    
    console.log('\\nSuccessfully downloaded and configured drawio for EE Zone!');
    console.log('  ✓ AI Generate proxy: /api/drawio-generate');
    console.log('  ✓ Export proxy: /api/drawio-export');
    console.log('  ✓ Service worker disabled');
    console.log('  ✓ EE Zone theme & colors configured');
  } catch (error) {
    console.error('Failed to download draw.io:', error);
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    process.exit(1);
  }
} else {
  console.log('drawio already exists in public/drawio, skipping download.');
}
