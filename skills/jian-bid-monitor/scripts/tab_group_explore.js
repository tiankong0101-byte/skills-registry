/**
 * 测试通过 Tabbit 扩展的 JS API 创建标签组
 */
const WebSocket = require('ws');
const { execSync } = require('child_process');
const CDP_PORT = 9222;

async function getJson(url) {
  try { return JSON.parse(execSync(`curl -s "${url}"`, { encoding: 'utf8', timeout: 5000 })); }
  catch (e) { return null; }
}

async function cdpReq(ws, method, params) {
  let msgId = 0;
  const id = ++msgId;
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout`)), 10000);
    const h = (data) => { const msg = JSON.parse(data); if (msg.id === id) { clearTimeout(t); ws.off('message', h); resolve(msg.result || msg); } };
    ws.on('message', h);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalOn(ws, expr) {
  const r = await cdpReq(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true });
  return r?.result?.value ?? r?.result ?? r;
}

async function main() {
  // Get all targets
  const targets = await getJson(`http://localhost:${CDP_PORT}/json`);
  console.log('所有标签页:');
  targets.filter(t => t.type === 'page').forEach(t => console.log(`  ${t.id} | ${t.title.slice(0, 40)} | ${t.url.slice(0, 60)}`));

  // Connect to the 吉安市 page
  const bidTarget = targets.find(t => t.url.includes('ggzy.jian.gov.cn'));
  if (!bidTarget) { console.log('未找到招标列表页'); return; }

  const ws = new WebSocket(bidTarget.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); });
  console.log('\n✅ 已连接招标列表页\n');

  // Test 1: Can we access Tabbit extension's chrome API?
  const tabbitApi = await evalOn(ws, `
    (() => {
      // Try to find the Tabbit extension's background page
      const extId = 'ihcaopdjcjhmjlnocckpbhkmdamhalii';
      if (window.chrome?.extension?.getBackgroundPage) {
        const bg = chrome.extension.getBackgroundPage();
        if (bg) return 'BG found: ' + Object.keys(bg).filter(k => k.includes('tab') || k.includes('group')).join(', ');
      }
      // Try chrome.runtime.connect
      try {
        const port = chrome.runtime.connect(extId, { name: 'test' });
        if (port) { port.disconnect(); return 'Connected to Tabbit ext!'; }
      } catch(e) { return 'connect err: ' + e.message; }
      return 'no access';
    })()
  `);
  console.log('Tabbit extension API:', tabbitApi);

  // Test 2: Try sending message to extension
  const extResult = await evalOn(ws, `
    (() => {
      const extId = 'ihcaopdjcjhmjlnocckpbhkmdamhalii';
      try {
        // Try to call the extension's background script function
        const res = chrome.runtime.sendMessage(extId, { type: 'getTabs' });
        return 'sendMessage result: ' + (res ? JSON.stringify(res) : 'null/undefined');
      } catch(e) {
        return 'sendMessage error: ' + e.message;
      }
    })()
  `);
  console.log('Extension message:', extResult);

  // Test 3: Check Tabbit's injected content script on the page
  const tabbitScript = await evalOn(ws, `
    (() => {
      // Check if Tabbit content script added any globals
      const tabbitKeys = Object.keys(window).filter(k => k.toLowerCase().includes('tabbit') || k.toLowerCase().includes('_sy_'));
      return 'Tabbit globals: ' + tabbitKeys.join(', ');
    })()
  `);
  console.log('Tabbit script:', tabbitScript);

  // Test 4: Try to use the extension's URL
  const extTabResult = await evalOn(ws, `
    (() => {
      const extId = 'ihcaopdjcjhmjlnocckpbhkmdamhalii';
      // Try to open a tab using the extension's API
      try {
        // Check if there's an exposed API
        const bg = window.__TABBIT_BACKGROUND__;
        if (bg) return 'Found __TABBIT_BACKGROUND__';
        // Try accessing via chrome-extension URL
        return 'trying other methods...';
      } catch(e) { return e.message; }
    })()
  `);
  console.log('Ext tab result:', extTabResult);

  // Test 5: Check if there's any global function we can call
  const globalApis = await evalOn(ws, `JSON.stringify(Object.keys(window).filter(k => k.includes('sy_') || k.includes('SY') || k.includes('Tabbit') || k.includes('tabbit')).slice(0, 200))`);
  console.log('SY/tabbit globals:', globalApis);

  // Test 6: Try to call the Tabbit CLI directly
  const cliResult = await evalOn(ws, `
    (() => {
      try {
        // The Tabbit extension might expose a CLI function
        if (typeof window.__infsh !== 'undefined') return 'infsh found';
        if (typeof window.__agent !== 'undefined') return 'agent found';
        if (typeof window.__tabbit !== 'undefined') return 'tabbit found';
        return 'no known CLI found';
      } catch(e) { return e.message; }
    })()
  `);
  console.log('CLI APIs:', cliResult);

  ws.close();
  console.log('\n✅ Done');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
