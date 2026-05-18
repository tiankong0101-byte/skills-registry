# CloakBrowser Skill

Stealth Chromium — 绕过所有机器人检测的浏览器，源码级指纹补丁，30/30测试通过。

## 基本信息

- **仓库**: CloakHQ/CloakBrowser (6.7k Stars, 500 forks)
- **PyPI**: `pip install cloakbrowser`
- **npm**: `npm install cloakbrowser`
- **Docker**: `docker run --rm cloakhq/cloakbrowser cloaktest`
- **语言**: Python / JavaScript (TypeScript)
- **官网**: https://cloakbrowser.dev/

## 核心特性

- 49个源码级C++补丁（canvas、WebGL、audio、fonts、GPU、screen、WebRTC、网络时间、自动化信号、CDP输入行为）
- `humanize=True` 标志 — 人类-like鼠标曲线、键盘时序、滚动模式
- 0.9 reCAPTCHA v3分数 — 人类级别服务端验证
- 通过Cloudflare Turnstile、FingerprintJS、BrowserScan等30+检测站点
- 自动更新二进制 — 后台检查更新，始终保持最新

## 安装

```bash
# Python
pip install -U cloakbrowser

# JavaScript/Node.js
npm install cloakbrowser@latest

# Docker
docker pull cloakhq/cloakbrowser:latest
```

首次运行自动下载 stealth Chromium 二进制（~200MB，本地缓存）。

### 可选依赖

```bash
pip install cloakbrowser[geoip]  # 根据代理IP自动检测时区和地区
```

### 二进制下载失败

```bash
export CLOAKBROWSER_BINARY_PATH=/path/to/your/chrome
```

## Python API

### 基础用法（同步）

```python
from cloakbrowser import launch

browser = launch()
page = browser.new_page()
page.goto("https://protected-site.com")
browser.close()
```

### 异步用法

```python
import asyncio
from cloakbrowser import launch_async

async def main():
    browser = await launch_async()
    page = await browser.new_page()
    await page.goto("https://example.com")
    print(await page.title())
    await browser.close()

asyncio.run(main())
```

### launch_context() — 一步创建浏览器+上下文

```python
from cloakbrowser import launch_context

browser = launch_context(
    proxy="http://user:pass@proxy:8080",
    geoip=True,  # 自动从代理IP检测时区和地区
)
page = browser.new_page()
page.goto("https://protected-site.com")
```

### CDP远程调试模式（供其他框架使用）

```python
from cloakbrowser import launch_async

browser = await launch_async(args=["--remote-debugging-port=9242"])
# 连接你的框架到 http://127.0.0.1:9242
```

## JavaScript / Node.js API

### Playwright风格（默认）

```javascript
import { launch, launchContext, launchPersistentContext } from 'cloakbrowser';

// 基础
const browser = await launch();

// 带选项
const browser = await launch({
  headless: false,
  proxy: 'http://user:pass@proxy:8080',
  args: ['--fingerprint=12345'],
});
```

### Puppeteer风格

```javascript
import { pupeteer } from 'cloakbrowser';

const browser = await pupeteer.launch({
  headless: false,
  proxy: 'http://user:pass@proxy:8080',
});
```

## Playwright迁移

只需3行代码，30秒解除封锁：

```python
# Playwright
from playwright.sync_api import sync_playwright
pw = sync_playwright().start()
browser = pw.chromium.launch()

# CloakBrowser（替换import和launch）
from cloakbrowser import launch
browser = launch()

page = browser.new_page()
```

## humanize=True

人类行为模拟，一键开启：

```python
browser = launch(humanize=True)
page = browser.new_page()
# 所有鼠标、键盘、滚动交互自动模拟真实用户行为
# Bézier曲线、逐字输入、真实滚动模式
```

通过CDP连接时：

```javascript
import { patchBrowser, resolveConfig } from 'cloakbrowser/human';
patchBrowser(browser, resolveConfig('default'));
```

## 高级配置

### 强烈推荐的抗机器人配置

```python
browser = launch(
    proxy="http://your-residential-proxy:port",  # 住宅IP，数据中心IP会因信誉被直接封禁
    geoip=True,      # 自动匹配时区和地区（不设置=UTC+en-US=机器人信号）
    headless=False,  # 有头模式 — 某些站点即使有C++补丁也会检测无头模式
)
```

### headed模式（无头检测严格的站点）

```bash
# Linux - 安装虚拟显示器
sudo apt install xvfb
Xvfb :99 -screen 0 1920x1080x24 &
export DISPLAY=:99
```

```python
browser = launch(headless=False, proxy="http://your-residential-proxy:port")
page = browser.new_page()
page.got("https://heavily-protected-site.com")
browser.close()
```

### 代理配置

```python
# SOCKS5代理
browser = launch(proxy="socks5://user:pass@host:port")

# HTTP代理
browser = launch(proxy="http://user:pass@proxy:8080")

# geoip自动检测时区和地区
browser = launch(proxy="http://proxy:port", geoip=True)
```

### 自定义指纹

```python
from cloakbrowser.config import get_default_stealth_args
from cloakbrowser import ensure_binary

binary_path = ensure_binary()
stealth_args = get_default_stealth_args()
```

## 测试

```bash
# Docker测试（无需安装）
docker run --rm cloakhq/cloakbrowser cloaktest
```

## 触发词

"cloakbrowser", "stealth chromium", "反爬虫", "绕过机器人检测", "浏览器指纹", "cloudflare", "turnstile", "playwright替代", "puppeteer替代", "无头浏览器", "自动化浏览器"
