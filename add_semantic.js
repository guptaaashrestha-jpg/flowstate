const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('<nav class="navbar" id="navbar">', '<header>\n  <nav class="navbar" id="navbar">');
html = html.replace('</nav>\n\n  <!-- Hero Section -->', '</nav>\n  </header>\n\n  <main>\n  <!-- Hero Section -->');
html = html.replace('</section>\n\n</div>\n\n<!-- ============================================', '</section>\n  </main>\n\n</div>\n\n<!-- ============================================');

fs.writeFileSync('index.html', html);
console.log('Semantic tags added');
