/**
 * 吉安招标 - Tabbit 标签页分组 + AI 内容分析
 */
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(process.env.HOME || process.env.USERPROFILE, '.agent-reach', 'jian-bid-log.json');
const SYNC_FILE = path.join(process.env.HOME || process.env.USERPROFILE, '.agent-reach', 'jian-bid-tabbed.json');
const CDP_PORT = 9222;
const SESSION = 'jian-bid';

// Build regex from string pattern (avoids regex-literal escaping issues)
const R = (p, f) => new RegExp(p, f || '');

// Chinese chars as actual unicode strings
const _0 = () => ''; // placeholder, not used

const U = {
  t1: '\u6295\u6807', t2: '\u6587\u4ef6', t3: '\u622a\u6b62', t4: '\u65f6\u95f4',
  t5: '\u62a5\u540d', t6: '\u5f00\u6807', t7: '\u63d0\u4ea4', t8: '\u54cd\u5e94',
  t9: '\u81f3', ta: '\u6b62', tb: '\u671f',
  tc: '\u9884\u8ba1', td: '\u62db\u6807', te: '\u8ba1\u5212',
  tf: '\u5de5\u671f', tg: '\u5efa\u8bbe\u5468\u671f', th: '\u65bd\u5de5\u5468\u671f',
  ti: '\u5408\u540c\u5c65\u884c\u671f\u9650',
  tj: '\u83b7\u53d6', tk: '\u4e0b\u8f7d', tl: '\u6807\u4e66', tm: '\u9012\u4ea4',
  tn: '\u524d', tye: '\u5e74', tmo: '\u6708', tda: '\u65e5',
  tpub: '\u516c\u5f00\u62db\u6807', tcomp: '\u7ade\u4e89\u6027\u78c5\u5546',
  tpri: '\u8be2\u4ef7', tsng: '\u5355\u4e00\u6765\u6e90',
  tinv: '\u9080\u8bf7\u62db\u6807', tneg: '\u7ade\u4e89\u6027\u8c08\u5224',
  tyk: '\u9884\u7b97', tlan: '\u6263\u6807\u4ef7', tmax: '\u6700\u9ad8\u9650\u4ef7',
  tctl: '\u62db\u6807\u63a7\u5236\u4ef7', tbid: '\u6801\u7684',
  tmon: '\u91d1\u989d', tprc: '\u4ef7\u6b3e', toff: '\u62a5\u4ef7',
  twan: '\u4e07\u5143', twan2: '\u4e07', tyo: '\u5143', tbil: '\u4ebf\u5143',
  tqual: '\u8d44\u8d28', tlev: '\u7b49\u7ea7', treq: '\u8981\u6c42',
  tcon: '\u8054\u7cfb\u4eba', tlnk: '\u8054\u7cfb', tbuy: '\u91c7\u8d2d\u4eba',
  tabs: '\u62db\u6807\u4eba', tproj: '\u9879\u76ee\u8054\u7cfb',
  tmr: '\u5148\u751f', tms: '\u5973\u58eb', tmgr: '\u7ecf\u7406',
  tchief: '\u79d8\u79d1', tdpt: '\u5c40\u957f', thead: '\u4e3b\u4efb',
  tsrc: '\u6765\u6e90', tdate: '\u65e5\u671f', ttag: '\u516c\u544a',
};

// Build char class from char string: chrClass('abc') => '[abc]' with special chars escaped
const cc = (s) => '[' + s.replace(/[\\^\]\[-]/g, '\\$&') + ']';
// S: whitespace/colons/fullwidth punctuation (allow ）、，。" etc. between keyword and date)
const S = cc('\s\n\t:：\u00a0\u3000\uff1a\uff08\uff09\uff0c\uff0e\u3001\u3002');  // whitespace + colons + fullwidth parens/punct

const DATE = '20[0-9]{2}' + U.tye + '(?:0?[1-9]|1[0-2])' + U.tmo + '(?:0?[1-9]|[12]\\d|3[01])' + U.tda + '?';
const DATE2 = '20[0-9]{2}' + U.tye + '(?:0?[1-9]|1[0-2])' + U.tmo + '?';

// Date: keyword before date
const dateBefore = R(
  '(?:' + U.t1 + U.t2 + '?' + U.t3 + '(?:' + U.t4 + ')?' +
  '|' + U.t5 + U.t3 + '(?:' + U.t4 + ')?' +
  '|' + U.t6 + '(?:' + U.t4 + ')?' +
  '|' + U.t7 + '(?:' + U.t1 + ')?' + U.t3 + '(?:' + U.t4 + ')?' +
  '|' + U.t8 + U.t3 +
  '|' + U.t3 + '[' + U.t9 + U.ta + U.tb + ']' +
  '|' + U.t1 + U.t3 +
  ')' + S + '{0,3}' + DATE, 'i'
);

// Date: get招标文件 至 deadline
const dateGetTo = R(
  '(?:' + U.tj + '|' + U.tk + ')(?:' + U.tl + '|' + U.t2 + ')' + S + '{0,5}(?:' + U.t9 + '|from)' + S + '{0,5}' + DATE, 'i'
);

// Date: 预计招标时间
const dateForecast = R('(?:' + U.tc + U.td + '|' + U.td + U.te + ')' + S + '{0,2}' + DATE2, 'i');

// Date: date before "前递交" (keyword AFTER date, sep can be time+paren+punct up to 60 chars)
const dateBeforeFront = R(DATE + '[^\d]{0,60}' + U.tn + U.tm + U.t1, 'i');

// Date: date before递交投标文件截止
const dateBeforeKb = R(DATE + S + '{0,5}' + U.tm + U.t1 + U.t2 + U.t3, 'i');

// Date: "至" date
const dateBy = R('(?:' + U.t9 + '|by|before)' + S + '{0,3}' + DATE, 'i');

// Money
const money1 = R(
  '(?:' + U.tyk + '|' + U.tlan + '|' + U.tmax + '|' + U.tctl + '|' + U.tbid + ')' + S + '*[¥\uffe5$]?\\s*([0-9,.]+(?:' + U.twan + '|' + U.twan2 + '|' + U.tyo + '|' + U.tbil + ')?)', 'i'
);
const money2 = R(
  '(?:' + U.tyk + U.tmon + '|' + U.tlan + '|' + U.tctl + ')' + S + '*([0-9,.]+(?:' + U.twan + '|' + U.twan2 + '|' + U.tyo + '))', 'i'
);
const money3 = R('[¥\uffe5]\\s*([0-9,]+(?:\\.[0-9]+)?(?:' + U.twan + '|' + U.tbil + ')?)', 'i');

// Period: 合同履行期限：自合同签订之日起60日内
const period = R(
  '(?:' + U.tf + '|' + U.tg + '|' + U.te + U.tf + '|' + U.th + '|' + U.ti + ')' + S + '*(?:[约不超共]*[0-9\u96f6\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341\u767e\u5343]+(?:' + U.tda + '|' + U.tmo + '|' + U.tye + '))', 'i'
);

// Level: 资质要求
const level = R(
  '(?:' + U.tqual + '|' + U.tlev + '|' + U.treq + ')' + S + '*([一二三甲乙丙丁级]+(?:施工|监理|设计|勘察)?(?:' + U.tqual + ')?)', 'i'
);

// Contact
const cnName = '[\u4e00-\u9fa5]{2,4}(?:' + U.tmr + '|' + U.tms + '|' + U.tmgr + '|' + U.tchief + '|' + U.tdpt + '|' + U.thead + ')?';
const conKw = '(?:' + U.tproj + '|' + U.tcon + '|' + U.tlnk + '|' + U.tbuy + '|' + U.tabs + ')';
const contact = R(
  conKw + S + '*' + cnName + '(?:[^' + '\n\r\uff0c\uff0e\u3002\u201c\u201d() \u3001]{0,25}(?:[0-9\\-()]{7,20})?)(?:$|' + '\n)', 'i'
);

const rx = { dateBefore, dateGetTo, dateForecast, dateBeforeFront, dateBeforeKb, dateBy, money1, money2, money3, period, level, contact };

function parseContent(text, item) {
  const out = [];
  out.push('\u3010' + (item.tag || U.ttag) + '\u3011' + item.title);
  out.push('\ud83d\udcc4 ' + U.tsrc + ': ' + item.source + ' | \ud83d\udcc5 ' + U.tdate + ': ' + item.date);
  out.push('');
  const t = (text || '').replace(/\\n/g, '\n');

  // DATE
  for (const p of [rx.dateBefore, rx.dateGetTo, rx.dateForecast, rx.dateBeforeFront, rx.dateBeforeKb, rx.dateBy]) {
    const m = t.match(p);
    if (m) { out.push('\ud83d\udd39 ' + U.t3 + ': ' + m[1]); break; }
  }

  // MONEY
  for (const p of [rx.money1, rx.money2, rx.money3]) {
    const m = t.match(p);
    if (m) { out.push('\ud83d\udcb0 ' + U.tmon + ': ' + m[1]); break; }
  }

  // METHOD
  if (t.includes(U.tpub)) out.push('\ud83d\udccb \u65b9\u5f0f: ' + U.tpub);
  else if (t.includes(U.tcomp)) out.push('\ud83d\udccb \u65b9\u5f0f: ' + U.tcomp);
  else if (t.includes(U.tpri)) out.push('\ud83d\udccb \u65b9\u5f0f: ' + U.tpri);
  else if (t.includes(U.tsng)) out.push('\ud83d\udccb \u65b9\u5f0f: ' + U.tsng);
  else if (t.includes(U.tinv)) out.push('\ud83d\udccb \u65b9\u5f0f: ' + U.tinv);
  else if (t.includes(U.tneg)) out.push('\ud83d\udccb \u65b9\u5f0f: ' + U.tneg);

  // PERIOD
  const pm = t.match(rx.period);
  if (pm) {
    const val = pm[0].replace(/^(?:\u5de5\u671f|\u5efa\u8bbe\u5468\u671f|\u8ba1\u5212\u5de5\u671f|\u65bd\u5de5\u5468\u671f|\u5408\u540c\u5c65\u884c\u671f\u9650)[^\d]*/, '').slice(0, 20);
    out.push('\u23f1\ufe0f \u5de5\u671f: ' + val);
  }

  // LEVEL
  const lm = t.match(rx.level);
  if (lm) {
    const val = lm[0].replace(/^(?:\u8d44\u8d28|\u7b49\u7ea7|\u8981\u6c42)[^\d]*/, '').slice(0, 30);
    out.push('\ud83c\udfe0 \u8d44\u8d28: ' + val);
  }

  // CONTACT
  const cm = t.match(rx.contact);
  if (cm) {
    const name = cm[0].replace(conKw + S + '*', '').replace(/[①-\u2469\d.．。\-+()（）]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 20);
    if (name.length >= 2) out.push('\ud83d\udc64 ' + U.tcon + ': ' + name);
  }

  return out.join('\n');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function ab(args) {
  try {
    return execSync('agent-browser --cdp ' + CDP_PORT + ' --session ' + SESSION + ' ' + args, { encoding: 'utf8', timeout: 25000, shell: true }).trim();
  } catch (e) { return e.stdout || e.message || ''; }
}

function abJson(args) {
  try { return JSON.parse(ab(args)); } catch (e) { return null; }
}

function loadLog() {
  try { if (fs.existsSync(LOG_FILE)) return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')); }
  catch (e) {} return { items: [] };
}

function loadState() {
  try { if (fs.existsSync(SYNC_FILE)) return JSON.parse(fs.readFileSync(SYNC_FILE, 'utf8')); }
  catch (e) {} return { openedIds: [] };
}

function saveState(state) {
  const dir = path.dirname(SYNC_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SYNC_FILE, JSON.stringify(state, null, 2));
}

function checkTabbit() {
  try {
    const out = execSync('curl -s "http://localhost:' + CDP_PORT + '/json/version"', { encoding: 'utf8', timeout: 3000 });
    return !!JSON.parse(out).Browser;
  } catch (e) { return false; }
}

function startTabbit() {
  const TABBIT_EXE = 'C:\\Users\\TIAN\\AppData\\Local\\Tabbit Browser\\Application\\Tabbit Browser.exe';
  const TABBIT_USER_DATA = 'C:\\Users\\TIAN\\AppData\\Local\\Tabbit Browser\\User Data';
  console.log('\u2691 \u542f\u52a8 Tabbit...');
  try {
    spawn(TABBIT_EXE, ['--remote-debugging-port=' + CDP_PORT, '--user-data-dir=' + TABBIT_USER_DATA], {
      detached: true, stdio: 'ignore', windowStyle: 'hidden'
    });
    for (let i = 0; i < 15; i++) {
      sleep(2000);
      if (checkTabbit()) { console.log('\u2705 Tabbit \u5df2\u5c31\u7eea'); return true; }
    }
  } catch (e) {}
  return false;
}

function openTab(url) {
  const r = ab('tab new ' + url);
  sleep(3000);
  return r.includes(url) || r.includes('Done');
}

async function main() {
  console.log('\n\ud83c\udff7 [\u5409\u5b89\u62db\u6807 - Tabbit \u6807\u7b7e\u9875 + AI \u5206\u6790]\n');

  if (!checkTabbit()) {
    if (!startTabbit()) { console.log('\u274c Tabbit \u542f\u52a8\u5931\u8d25'); return; }
  } else {
    console.log('\u2705 Tabbit \u5df2\u8fd0\u884c');
  }

  const log = loadLog();
  const state = loadState();
  const openedSet = new Set(state.openedIds || []);

  const newItems = log.items.filter(i => i.priority <= 3 && !openedSet.has(i.id));
  if (newItems.length === 0) { console.log('\u2705 \u65e0\u65b0\u91cd\u70b9\u516c\u544a'); return; }

  console.log('\n\ud83d\udcec \u53d1\u73b0 ' + newItems.length + ' \u6761\u91cd\u70b9\u516c\u544a\n');

  const test = ab('snapshot');
  if (!test) { console.log('\u274c CDP \u8fde\u63a5\u5931\u8d25'); return; }
  console.log('\u2705 CDP \u8fde\u63a5\u6b63\u5e38\n');

  const results = [];
  for (const item of newItems.slice(0, 8)) {
    process.stdout.write('\ud83d\udd0d ' + item.title.slice(0, 45) + '... ');

    if (!openTab(item.url)) { console.log('\u274c'); continue; }
    sleep(4000);

    const raw = ab('eval "document.body.innerText.slice(0,3000)"');
    const cleanText = raw.replace(/^"|"$/g, '').replace(/\\n/g, '\n').slice(0, 3000);
    const analysis = parseContent(cleanText, item);

    process.stdout.write('\u2705\n');
    results.push({ ...item, analysis });
    openedSet.add(item.id);
  }

  if (results.length > 0) {
    console.log('\n' + '\u2550'.repeat(70));
    console.log('\ud83d\udcca AI \u5206\u6790\u62a5\u544a - \u5409\u5b89\u62db\u6807\u91cd\u70b9\u516c\u544a\n');
    for (const [i, r] of results.entries()) {
      console.log((i + 1) + '. \u3010' + (r.tag || U.ttag) + '\u3011' + r.title);
      console.log('   ' + r.source + ' | ' + r.date);
      console.log('   ' + r.analysis);
      console.log('');
    }
    console.log('\u2550'.repeat(70));
  }

  saveState({ openedIds: [...openedSet], lastUpdate: new Date().toISOString() });

  const tabsResult = abJson('tab list --json');
  if (tabsResult && tabsResult.data && tabsResult.data.tabs) {
    const allTabs = tabsResult.data.tabs;
    console.log('\n\ud83c\udff7\ufe0f Tabbit \u6807\u7b7e\u9875:');
    allTabs.slice(-6).forEach((tab, i) => {
      const isBid = tab.title.includes(U.td) || tab.title.includes(U.tbuy) || tab.title.includes('\u4ea4\u6613') || tab.url.includes('ggzy');
      console.log('  ' + (isBid ? '\u2705' : '\u25cb') + ' [' + (allTabs.length - 6 + i) + '] ' + tab.title.slice(0, 50));
    });
  }

  console.log('\n\u2705 \u5b8c\u6210 | \u5206\u6790 ' + results.length + ' \u6761 | \u7d2f\u8ba1 ' + openedSet.size + ' \u6761');
  console.log('\ud83d\udca1 \u63d0\u793a\uff1aTabbit \u4f1a\u6839\u636e\u7f51\u5740\u81ea\u52a8\u6574\u7406\u6807\u7b7e\u9875\u4e3a\u5206\u7ec4\n');
}

main().catch(e => { console.error('\u274c', e.message); process.exit(1); });
