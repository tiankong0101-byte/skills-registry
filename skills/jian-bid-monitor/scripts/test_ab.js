const { execSync } = require('child_process');
const CDP_PORT = 9222, SESSION = 'jian-bid';

function ab(args) {
  try {
    return execSync('agent-browser --cdp ' + CDP_PORT + ' --session ' + SESSION + ' ' + args, {encoding: 'utf8', timeout: 20000}).trim();
  } catch(e) { return e.stdout || ''; }
}

function abJson(args) {
  const out = ab(args + ' --json');
  try { return JSON.parse(out); } catch(e) { return null; }
}

const tabs = abJson('tab list');
console.log('Tabs:', tabs ? tabs.length : 'null');
if (tabs) tabs.forEach((t, i) => console.log(' [' + i + '] ' + t.title.slice(0, 40) + ' | ' + t.url.slice(0, 60)));
