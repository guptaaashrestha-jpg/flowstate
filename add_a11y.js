const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('<input type="text" id="task-input"', '<input type="text" id="task-input" aria-label="New task description"');
html = html.replace('<textarea id="planner-input"', '<textarea id="planner-input" aria-label="Daily goals"');
html = html.replace('<textarea id="meeting-input"', '<textarea id="meeting-input" aria-label="Meeting transcript"');
html = html.replace('<input type="text" id="content-topic"', '<input type="text" id="content-topic" aria-label="Content topic"');
html = html.replace('<textarea id="doc-input"', '<textarea id="doc-input" aria-label="Document content"');

html = html.replace('<button class="sidebar-footer-btn" onclick="App.backToLanding()">', '<button class="sidebar-footer-btn" onclick="App.backToLanding()" aria-label="Back to Home">');
html = html.replace('<button class="command-bar-trigger" id="command-bar-trigger" onclick="App.openCommandBar()">', '<button class="command-bar-trigger" id="command-bar-trigger" onclick="App.openCommandBar()" aria-label="Open Command Bar">');
html = html.replace('<button class="btn btn-secondary" onclick="TaskBoard.addManualTask()" id="btn-add-manual">', '<button class="btn btn-secondary" onclick="TaskBoard.addManualTask()" id="btn-add-manual" aria-label="Add manual task">');
html = html.replace('<button class="btn-close" onclick="App.closeCommandBar()">', '<button class="btn-close" onclick="App.closeCommandBar()" aria-label="Close Command Bar">');
html = html.replace('<button class="btn btn-ghost btn-sm" onclick="Content.copy()" id="btn-copy-content">', '<button class="btn btn-ghost btn-sm" onclick="Content.copy()" id="btn-copy-content" aria-label="Copy to clipboard">');
html = html.replace('<button class="btn btn-ghost btn-sm" onclick="Content.regenerate()" id="btn-regen-content">', '<button class="btn btn-ghost btn-sm" onclick="Content.regenerate()" id="btn-regen-content" aria-label="Regenerate content">');

fs.writeFileSync('index.html', html);
console.log('Accessibility tags added');
