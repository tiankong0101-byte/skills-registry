const WebSocket = require('ws');
const SIDEBAR_WS = 'ws://localhost:9222/devtools/page/278D7187B7089F3CA7857158391E7036';
let msgId = 0;

async function cdpSend(ws, method, params) {
  const id = ++msgId;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 15000);
    const handler = (data) => {
      const msg = JSON.parse(data);
      if (msg.id === id) { clearTimeout(timer); ws.off('message', handler); resolve(msg.result || msg); }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalJs(ws, expr) {
  const r = await cdpSend(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true });
  return r.result?.value ?? r.result ?? r;
}

async function main() {
  const sidebar = new WebSocket(SIDEBAR_WS);
  await new Promise((res, rej) => { sidebar.on('open', res); sidebar.on('error', rej); });
  console.log('✅ Connected\n');

  // 1. Get user info response body
  await cdpSend(sidebar, 'Network.enable');

  // Capture request/response pairs
  const reqMap = {};
  const handler = (data) => {
    const msg = JSON.parse(data);
    if (msg.method === 'Network.requestWillBeSent') {
      reqMap[msg.params.requestId] = { url: msg.params.request.url };
    } else if (msg.method === 'Network.responseReceived') {
      const req = reqMap[msg.params.requestId];
      if (req && (req.url.includes('tabbit-ai.com') || req.url.includes('grotok') || req.url.includes('glm'))) {
        req.status = msg.params.response.status;
        req.mimeType = msg.params.response.mimeType;
      }
    }
  };
  sidebar.on('message', handler);

  // Make request
  await evalJs(sidebar, `fetch('/api/user/info').then(r=>{console.log('STATUS:'+r.status);return r.json()}).then(d=>console.log('DATA:'+JSON.stringify(d))).catch(e=>console.log('ERR:'+e.message))`);
  await new Promise(r => setTimeout(r, 2000));

  // Get response bodies
  console.log('\n📋 请求详情:');
  for (const [rid, req] of Object.entries(reqMap)) {
    if (req.url && (req.url.includes('tabbit-ai.com') || req.url.includes('grotok'))) {
      console.log(`  [${req.status || 'pending'}] ${req.url}`);
      try {
        const body = await cdpSend(sidebar, 'Network.getResponseBody', { requestId: rid });
        console.log('    Body:', JSON.stringify(body).slice(0, 300));
      } catch(e) {}
    }
  }

  // 2. Look for auth token in localStorage and cookies
  console.log('\n🔑 认证信息:');
  const authInfo = await evalJs(sidebar, `
    (() => {
      const ls = {};
      try {
        for (const [k, v] of Object.entries(localStorage)) {
          if (k.includes('token') || k.includes('auth') || k.includes('session') || k.includes('user') || k.includes('key') || k.includes('api')) {
            ls[k] = v.slice(0, 100);
          }
        }
      } catch(e) {}
      const cookies = document.cookie.split(';').reduce((acc, c) => { const [k,v] = c.trim().split('='); acc[k] = v; return acc; }, {});
      return { ls, cookies };
    })()
  `);
  console.log('Auth info:', authInfo);

  // 3. Find the AI chat API endpoint from the JS bundle
  console.log('\n🤖 尝试直接调用 AI API...');
  const aiResult = await evalJs(sidebar, `
    (async () => {
      // Check localStorage for auth tokens
      const tokenKey = Object.keys(localStorage).find(k => k.includes('token') || k.includes('auth') || k.includes('api_key'));
      const token = tokenKey ? localStorage.getItem(tokenKey) : null;

      // Try Grotok API (based on network capture)
      try {
        const GrotokResponse = await fetch('https://open.lgrotok.com/api/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'glm-4',
            messages: [{ role: 'user', content: 'Say hello in 5 words' }],
            max_tokens: 20
          })
        });
        const grotokData = await GrotokResponse.json();
        return 'Grotok OK: ' + JSON.stringify(grotokData).slice(0, 200);
      } catch(e) {
        return 'Grotok ERR: ' + e.message;
      }
    })()
  `);
  console.log('AI Result:', aiResult);

  sidebar.close();
  console.log('\n✅ Done');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
