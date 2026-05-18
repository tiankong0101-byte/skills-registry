/**
 * 吉安招标 - Tabbit CDP 自动化脚本
 * 通过 agent-browser 连接 Tabbit CDP，提取招标公告内容
 *
 * 使用前提：Tabbit 已启动并开启远程调试
 * 启动 Tabbit: "C:\Users\TIAN\AppData\Local\Tabbit Browser\Application\Tabbit Browser.exe" --remote-debugging-port=9222
 */

const { execSync } = require('child_process');

function ab(args) {
  const cmd = `agent-browser --cdp 9222 ${args}`;
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 30000 });
  } catch (e) {
    return e.stdout || e.message;
  }
}

async function run() {
  console.log('\n🔍 [Tabbit CDP 自动化提取]\n');

  // 1. 打开吉安市招标列表页
  console.log('📂 打开招标列表页...');
  ab('open http://ggzy.jian.gov.cn/jyxx/jsgc/zbgg/index.shtml');
  ab('wait --load networkidle');
  console.log('  ✅ 页面已加载');

  // 2. 提取公告列表
  console.log('📋 提取公告列表...');
  const listResult = ab(`eval "const r=[];document.querySelectorAll('a[href*=doc],a[href*=zbgg]').forEach((a,i)=>{if(i<15){const t=a.textContent.trim();if(t&&t.length>5)r.push({t:t.slice(0,80),h:a.href})}});console.log(JSON.stringify(r));"`);
  console.log('  Raw:', listResult.slice(0, 200));

  // 3. 获取页面标题确认
  const title = ab('get title');
  console.log('  页面标题:', title.trim());
}

// 保持 Tabbit 浏览器运行（供后续 AI 分析使用）
process.stdin.resume();

console.log('Tabbit CDP 脚本已启动，浏览器将保持运行...');
console.log('按 Ctrl+C 停止并关闭浏览器');
