/**
 * 吉安招标监控 → Tabbit 收藏夹同步脚本
 * 功能：将 OpenCode 抓取的新公告同步到 Tabbit 浏览器的收藏夹
 * 使用：node sync_to_tabbit.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TABBIT_BOOKMARKS = path.join(process.env.LOCALAPPDATA, 'Tabbit Browser', 'User Data', 'Default', 'Bookmarks');
const LOG_FILE = path.join(process.env.HOME || process.env.USERPROFILE, '.agent-reach', 'jian-bid-log.json');
const SYNC_STATE_FILE = path.join(process.env.HOME || process.env.USERPROFILE, '.agent-reach', 'jian-bid-synced.json');

function getBookmarkTimestamp() {
  const FILETIME_EPOCH = new Date('1601-01-01T00:00:00Z').getTime();
  const now = Date.now();
  return String((now - FILETIME_EPOCH) * 1000);
}

function genGuid() {
  return crypto.randomUUID();
}

function genId() {
  return crypto.randomUUID().split('-')[0];
}

function loadSyncState() {
  try {
    if (fs.existsSync(SYNC_STATE_FILE)) {
      return JSON.parse(fs.readFileSync(SYNC_STATE_FILE, 'utf8'));
    }
  } catch (e) {}
  return { syncedIds: new Set() };
}

function saveSyncState(state) {
  const dir = path.dirname(SYNC_STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify({
    syncedIds: [...state.syncedIds],
    lastSync: new Date().toISOString()
  }, null, 2));
}

function makeSummary(item) {
  const tags = [];
  if (item.tag) tags.push(item.tag.replace(/【|】/g, ''));
  tags.push(`优先级: ${item.priority <= 3 ? '重点' : '普通'}`);
  tags.push(item.source);
  tags.push(item.date);
  return tags.join(' | ');
}

async function syncToTabbit() {
  console.log('\n📮 [同步到 Tabbit 收藏夹]\n');

  if (!fs.existsSync(TABBIT_BOOKMARKS)) {
    console.log('⚠️  未找到 Tabbit Bookmarks 文件，跳过同步');
    return;
  }

  const log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
  const state = loadSyncState();

  const newItems = log.items.filter(item => !state.syncedIds.has(item.id));
  if (newItems.length === 0) {
    console.log('✅ 无新条目需要同步');
    return;
  }

  const bakFile = TABBIT_BOOKMARKS + '.tabbit_backup_' + Date.now();
  fs.copyFileSync(TABBIT_BOOKMARKS, bakFile);
  console.log(`  📦 备份: ${path.basename(bakFile)}`);

  let bookmarks = JSON.parse(fs.readFileSync(TABBIT_BOOKMARKS, 'utf8'));

  const bar = bookmarks.roots.bookmark_bar;

  let jianFolder = bar.children.find(c => c.type === 'folder' && c.name === '吉安招标');
  if (!jianFolder) {
    jianFolder = {
      date_added: getBookmarkTimestamp(),
      date_modified: getBookmarkTimestamp(),
      guid: genGuid(),
      id: genId(),
      name: '吉安招标',
      type: 'folder',
      children: []
    };
    bar.children.unshift(jianFolder);
  }

  const toAdd = newItems
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 50)
    .map(item => {
      state.syncedIds.add(item.id);
      return {
        date_added: getBookmarkTimestamp(),
        date_last_used: '0',
        guid: genGuid(),
        id: genId(),
        meta_info: { 'ext.summary': makeSummary(item) },
        name: item.title,
        type: 'url',
        url: item.url
      };
    });

  jianFolder.children = toAdd.concat(jianFolder.children);
  jianFolder.date_modified = getBookmarkTimestamp();

  try {
    fs.writeFileSync(TABBIT_BOOKMARKS, JSON.stringify(bookmarks, null, 2));
    saveSyncState(state);
    console.log(`  ✅ 新增 ${toAdd.length} 条同步到「吉安招标」文件夹`);
    console.log(`  📁 合计: ${jianFolder.children.length} 条`);

    if (toAdd.length > 0) {
      console.log('\n  🆕 本次同步:');
      toAdd.slice(0, 5).forEach((item, i) => {
        const logItem = newItems[i];
        console.log(`  ${i + 1}. ${logItem.tag || ''}${logItem.title.slice(0, 40)}...`);
        console.log(`     ${logItem.date} | ${logItem.source}`);
      });
      if (toAdd.length > 5) console.log(`  ... 还有 ${toAdd.length - 5} 条`);
    }

    const total = state.syncedIds.size;
    const today = newItems.filter(i => i.date && i.date.includes(new Date().toISOString().slice(0, 10).replace(/-/g, '/'))).length;
    console.log(`\n  📊 累计同步: ${total} 条 | 今日新增: ${today} 条`);
  } catch (err) {
    if (err.code === 'EBUSY' || err.code === 'EPERM') {
      console.log('  ⚠️  Tabbit 正在运行，文件被锁定');
      console.log('  💡 请关闭 Tabbit 后重试，或下次启动时自动同步');
    } else {
      fs.copyFileSync(bakFile, TABBIT_BOOKMARKS);
      console.log('  ❌ 同步失败，已恢复备份');
      console.log('  错误:', err.message);
    }
  }
}

syncToTabbit().catch(e => console.error('❌', e.message));
