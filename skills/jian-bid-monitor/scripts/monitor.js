/**
 * 吉安市工程招标公告监控脚本
 * 用法:
 *   node monitor.js --check    # 每小时：抓取新公告、更新日志、输出
 *   node monitor.js --summary # 每6小时：生成摘要报告到桌面
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(process.env.HOME || process.env.USERPROFILE, '.agent-reach', 'jian-bid-log.json');
const DESKTOP = path.join(process.env.USERPROFILE || process.env.HOMEPATH, 'Desktop');
const RETENTION_DAYS = 90;
const RUN_LOG = path.join(process.env.HOME || process.env.USERPROFILE, '.agent-reach', 'jian-bid-run.log');

function writeLog(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  try { fs.appendFileSync(RUN_LOG, line, 'utf8'); } catch(e) {}
  console.log(msg);
}

const BASE_URL_JIAN = 'http://ggzy.jian.gov.cn';
const BASE_URL_JIANGXI = 'http://ggzy.jiangxi.gov.cn';

const JIAN_CITIES = ['吉安市', '吉安县', '吉水县', '峡江县', '新干县', '永丰县',
  '泰和县', '万安县', '遂川县', '安福县', '永新县', '井冈山市', '青原区', '吉州区'];

const PRIORITY = [
  { level: 1, keywords: ['预招标'], tag: '【预招标】' },
  { level: 2, keywords: ['需求征集', '采购意向', '意向公开', '需求公示'], tag: '【需求征集】' },
  { level: 3, keywords: ['设备采购', '设备招标', '仪器采购', '器械采购', '机械采购'], tag: '【设备采购】' },
];

const SOURCE_JIAN = {
  name: '吉安市·建设工程',
  baseUrl: BASE_URL_JIAN,
  url: `${BASE_URL_JIAN}/jyxx/jsgc/zbgg/index.shtml`,
  regex: /<a href="(\/doc\/\d{4}\/\d{2}\/\d{2}\/\d+\.shtml)"[^>]*?title="([^"]+)"[^>]*?>[\s\S]*?<\/a><span class="date">(\[[\d\/]+\])<\/span>/g
};

const SOURCE_JIANGXI = {
  name: '江西省·吉安市',
  baseUrl: BASE_URL_JIANGXI,
  apiPath: '/XZinterface/rest/esinteligentsearch/getFullTextDataNew',
  zbCategories: ['002001001', '002002002', '002003001', '002004001', '002005001', '002006001',
    '002007001', '002008001', '002009001', '002010001', '002011001',
    '002013001', '002015001', '002016001', '002017001', '002021001',
    '002019001', '002018001', '002020001'],
  xqCategories: ['002006002', '002006003', '002006005'],
};

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

function postJson(hostname, pathname, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const opts = { hostname, path: pathname, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
    const req = http.request(opts, (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d))); });
    req.on('error', reject); req.write(body); req.end();
  });
}

function isJianCity(text) {
  return JIAN_CITIES.some(c => text.includes(c));
}

function tagItem(item) {
  item.pushedAt = new Date().toISOString();
  for (const p of PRIORITY) {
    if (p.keywords.some(kw => item.title.includes(kw))) { item.priority = p.level; item.tag = p.tag; return; }
  }
  item.priority = 99;
  item.tag = '';
}

async function fetchJian() {
  const html = await fetchPage(SOURCE_JIAN.url);
  const items = [];
  const regex = new RegExp(SOURCE_JIAN.regex.source, 'g');
  let match;
  while ((match = regex.exec(html)) !== null) {
    const title = match[2].trim();
    const date = match[3].replace(/[\[\]]/g, '');
    const item = { id: match[1], title, date, url: SOURCE_JIAN.baseUrl + match[1], source: SOURCE_JIAN.name };
    tagItem(item);
    items.push(item);
  }
  return items;
}

async function fetchJiangxi() {
  const items = [];
  const now = new Date();
  const sdt = new Date(now.getTime() - 5 * 24 * 3600 * 1000).toLocaleDateString('zh-CN', {timeZone: 'Asia/Shanghai'}).replace(/\//g, '-') + ' 00:00:00';
  const cats = [...SOURCE_JIANGXI.zbCategories, ...SOURCE_JIANGXI.xqCategories];
  for (const cat of cats) {
    try {
      const res = await postJson('ggzy.jiangxi.gov.cn', SOURCE_JIANGXI.apiPath, {
        token: '', pn: 0, rn: 500, sdt, edt: '', ssort: '', cl: 500, terminal: '',
        condition: [{ fieldName: 'categorynum', equal: cat, equalList: null, notEqual: null, notEqualList: null }],
        time: null, highlights: '', statistics: null
      });
      for (const r of (res.result?.records || [])) {
        const region = r.xiaquname || '';
        if (!isJianCity(region)) continue;
        const date = r.webdate ? r.webdate.slice(0, 10).replace(/-/g, '/') : '';
        const item = { id: r.linkurl, title: r.title, date, url: SOURCE_JIANGXI.baseUrl + r.linkurl, source: SOURCE_JIANGXI.name };
        tagItem(item);
        items.push(item);
      }
    } catch (e) { /* skip */ }
  }
  return items;
}

function loadLog() {
  try { if (fs.existsSync(LOG_FILE)) return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')); }
  catch (e) {}
  return { items: [] };
}

function saveLog(log) {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

function cleanupLog(log) {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 3600 * 1000).toISOString();
  const before = log.items.length;
  log.items = log.items.filter(i => !i.pushedAt || i.pushedAt >= cutoff);
  return before - log.items.length;
}

// ============ CHECK ============
async function runCheck() {
  const log = loadLog();
  const pushedIds = new Set(log.items.map(i => i.id));

  console.log('\n🔍 [检查新公告]\n');

  const allNew = [];

  try {
    process.stdout.write('  🔍 吉安市·建设工程...\n');
    const items = await fetchJian();
    const newItems = items.filter(i => !pushedIds.has(i.id));
    process.stdout.write(`     📋 ${items.length} 条 / 🆕 新增 ${newItems.length}\n\n`);
    allNew.push(...newItems);
  } catch (e) { process.stdout.write(`     ⚠️ ${e.message}\n\n`); }

  try {
    process.stdout.write('  🔍 江西省·吉安市...\n');
    const items = await fetchJiangxi();
    const newItems = items.filter(i => !pushedIds.has(i.id));
    process.stdout.write(`     📋 ${items.length} 条 / 🆕 新增 ${newItems.length}\n\n`);
    allNew.push(...newItems);
  } catch (e) { process.stdout.write(`     ⚠️ ${e.message}\n\n`); }

  if (allNew.length === 0) {
    console.log('✅ 无新公告');
    log.lastCheck = new Date().toISOString();
    saveLog(log);
    return;
  }

  const removed = cleanupLog(log);
  allNew.sort((a, b) => a.priority - b.priority);
  log.items.push(...allNew);
  log.lastCheck = new Date().toISOString();
  saveLog(log);

  const priority = allNew.filter(a => a.priority <= 3);
  const normal = allNew.filter(a => a.priority > 3);

  if (priority.length > 0) {
    console.log(`🔥 【重点关注】${priority.length} 条:\n`);
    priority.forEach((a, i) => console.log(`  ${i + 1}. ${a.tag}${a.title}\n     ${a.source} | ${a.date}\n`));
  }

  if (normal.length > 0) {
    console.log(`📋 【其他公告】${normal.length} 条:\n`);
    normal.forEach((a, i) => console.log(`  ${i + 1}. ${a.title}\n     ${a.source} | ${a.date}\n`));
  }

  console.log(`✅ 新增 ${allNew.length} 条 | 清理 ${removed} 条过期 | 共跟踪 ${log.items.length} 条`);

  // 同步到 Tabbit 收藏夹
  if (allNew.length > 0) {
    try {
      const { exec } = require('child_process');
      await new Promise((resolve) => {
        exec(`node "${path.join(__dirname, 'sync_to_tabbit.js')}"`, (err, stdout, stderr) => {
          if (err) { console.log(`  ⚠️ Tabbit同步: ${stderr || err.message}`); }
          resolve();
        });
      });
    } catch (e) {}
  }
}

// ============ SUMMARY ============
async function runSummary() {
  const log = loadLog();
  const removed = cleanupLog(log);
  saveLog(log);

  const today = new Date().toLocaleDateString('zh-CN', {timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\//g, '-');
  const ts = today.replace(/-/g, '');
  const mdFile = path.join(DESKTOP, `吉安招标监控_${ts}.md`);
  const pdfFile = path.join(DESKTOP, `吉安招标监控_${ts}.pdf`);

  // 按日期分组，日期降序（最新在前）
  const byDate = {};
  for (const item of log.items) {
    const d = item.date || '1970/01/01';
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(item);
  }
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  // 每日内按优先级排序
  for (const d of dates) {
    byDate[d].sort((a, b) => a.priority - b.priority);
  }

  const totalPriority = log.items.filter(a => a.priority <= 3).length;

  // ===== Markdown =====
  let mdBody = '';
  for (const d of dates) {
    const items = byDate[d];
    const isToday = d === today;
    mdBody += `## 📅 ${d}${isToday ? '（今日）' : ''}（${items.length} 条）\n\n`;
    for (const a of items) {
      mdBody += `- ${a.tag ? `**${a.tag}** ` : ''}**${a.title}**  \n  ${a.source} · ${a.date}  \n  🔗 ${a.url}\n\n`;
    }
  }
  if (dates.length === 0) mdBody = `_暂无数据_\n`;
  const md = `# 📢 吉安招标监控\n\n**${today}** · 共 ${log.items.length} 条（重点 ${totalPriority}） · ${dates.length} 天数据\n\n---\n${mdBody}\n---\n*吉安招标自动监控 · ${new Date().toLocaleTimeString('zh-CN')}*\n`;

  // 写MD
  fs.writeFileSync(mdFile, md, 'utf8');

  // ===== PDF (Python reportlab with clickable links) =====
  const pyScript = path.join(__dirname, 'gen_pdf.py');
  try {
    const { exec } = require('child_process');
    await new Promise((resolve, reject) => {
      exec(`python "${pyScript}" "${pdfFile}"`, { timeout: 60000 }, (err, stdout, stderr) => {
        if (err) { console.log(`\n⚠️ PDF: ${stderr || err.message}`); reject(err); }
        else { console.log(`\n📄 PDF: ${pdfFile}`); resolve(); }
      });
    });
  } catch (e) {
    console.log(`\n⚠️ PDF失败`);
  }

  console.log(`📝 MD: ${mdFile}`);
  writeLog(`SUMMARY 完成 | ${today} | ${log.items.length} 条 | ${dates.length} 天 | 清理 ${removed}`);
}

// ============ 入口 ============
const isSummary = process.argv.includes('--summary');
const mode = isSummary ? 'SUMMARY' : 'CHECK';
writeLog(`[${mode}] 启动`);
if (isSummary) {
  runSummary()
    .then(() => { writeLog(`[${mode}] 完成`); process.exit(0); })
    .catch(e => { writeLog(`[${mode}] 失败: ${e.message}`); process.exit(1); });
} else {
  runCheck()
    .then(() => { writeLog(`[${mode}] 完成`); process.exit(0); })
    .catch(e => { writeLog(`[${mode}] 失败: ${e.message}`); process.exit(1); });
}
