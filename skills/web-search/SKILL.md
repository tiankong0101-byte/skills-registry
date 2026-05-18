---
name: web-search
description: |
  Unified search skill — DuckDuckGo, multi-engine fallback, privacy mode, Tavily AI, and multi-source research.
  Triggers on any web search, research, fact-checking, news, image/video search, or privacy-sensitive query.
metadata:
  openclaw:
    emoji: 🌐
  requires:
    env: []
---

# Web Search — Unified

A single search interface covering 4 modes: **DuckDuckGo** (default), **Multi-Engine** (16 engines, no API key), **Tavily** (AI-optimized, requires key), and **Multi-Source Research**.

## Mode Selection

| Mode | Best For | Prerequisites |
|------|----------|---------------|
| DuckDuckGo | General search, news, images, videos | `pip install duckduckgo-search` |
| Multi-Engine | China + Global, privacy, engine fallback | None (no API key) |
| Tavily | AI-optimized, deep research, citations | `TAVILY_API_KEY` |
| Multi-Source | Comprehensive research, APIs, databases | `OPENCODE_API_KEY` |

---

## Mode 1: DuckDuckGo (Default)

```bash
python scripts/search.py "<query>" [options]
```

### Quick Examples
```bash
# Web search
python scripts/search.py "python asyncio tutorial"

# News
python scripts/search.py "AI news" --type news --time-range w

# Images
python scripts/search.py "sunset" --type images --image-size Large

# Videos
python scripts/search.py "python tutorial" --type videos

# Region-specific
python scripts/search.py "local news" --region us-en

# Save to file
python scripts/search.py "quantum computing" --format markdown --output results.md
```

### Options
- `-t, --type` — web, news, images, videos
- `-n, --max-results` — default 10
- `--time-range` — d, w, m, y
- `-r, --region` — us-en, uk-en, de-de, etc.
- `--safe-search` — on, moderate, off
- `-f, --format` — text, markdown, json
- `-o, --output` — save to file
- Image filters: `--image-size`, `--image-color`, `--image-type`, `--image-layout`
- Video filters: `--video-duration`, `--video-resolution`

### Privacy
DuckDuckGo does not log or track queries. Ideal for sensitive topics.

---

## Mode 2: Multi-Engine (16 Engines)

Use when DuckDuckGo fails, or for China-specific / privacy / fallback scenarios.

### Domestic (7) — Chinese queries
| Engine | URL |
|--------|-----|
| Baidu | `https://www.baidu.com/s?wd={keyword}` |
| Bing CN | `https://cn.bing.com/search?q={keyword}&ensearch=0` |
| Bing INT | `https://cn.bing.com/search?q={keyword}&ensearch=1` |
| 360 | `https://www.so.com/s?q={keyword}` |
| Sogou | `https://sogou.com/web?query={keyword}` |
| WeChat | `https://wx.sogou.com/weixin?type=2&query={keyword}` |
| Shenma | `https://m.sm.cn/s?q={keyword}` |

### International (9) — non-Chinese queries
| Engine | URL | Notes |
|--------|-----|-------|
| Google | `https://www.google.com/search?q={keyword}` | Best index |
| Google HK | `https://www.google.com.hk/search?q={keyword}` | |
| DuckDuckGo | `https://duckduckgo.com/html/?q={keyword}` | No tracking |
| Yahoo | `https://search.yahoo.com/search?p={keyword}` | |
| Startpage | `https://www.startpage.com/sp/search?query={keyword}` | Google + privacy |
| Brave | `https://search.brave.com/search?q={keyword}` | Independent |
| Ecosia | `https://www.ecosia.org/search?q={keyword}` | Eco-friendly |
| Qwant | `https://www.qwant.com/?q={keyword}` | EU GDPR |
| WolframAlpha | `https://www.wolframalpha.com/input?i={keyword}` | Knowledge |

### Advanced Operators
`site:`, `filetype:`, `""` (exact match), `-` (exclude), `OR`

### Time Filters
`tbs=qdr:h` (hour), `tbs=qdr:d` (day), `tbs=qdr:w` (week), `tbs=qdr:m` (month), `tbs=qdr:y` (year)

### Privacy Engines
DuckDuckGo (no tracking), Startpage (Google+privacy), Brave (independent), Qwant (EU GDPR)

### DuckDuckGo Bangs
`!g` Google, `!gh` GitHub, `!so` Stack Overflow, `!w` Wikipedia, `!yt` YouTube

### WolframAlpha
Math (`integrate x^2 dx`), conversion (`100 USD to CNY`), stocks (`AAPL stock`), weather

### Usage Pattern
```javascript
web_fetch({"url": "https://www.google.com/search?q=python+tutorial"})
web_fetch({"url": "https://duckduckgo.com/html/?q=privacy+tools"})
```

With rate limiting: 1-2s delay between requests, batch 3-4 engines at a time.

---

## Mode 3: Tavily (AI-Optimized)

Best for AI consumption with context extraction, citations, and summarization.

- Requires `TAVILY_API_KEY` (from https://app.tavily.com)
- Configurable search depth: quick to deep research
- Domain inclusion/exclusion
- News + general search modes
- Fresh content prioritization
- Automatic summarization

---

## Mode 4: Multi-Source Research

For comprehensive research tasks requiring data from APIs, databases, and documents simultaneously.

- Requires `OPENCODE_API_KEY`
- Parallel queries across configured sources
- Deduplication and consolidation
- Cited summary output

---

## Best Practices

1. Start with DuckDuckGo (no setup needed)
2. Fall back to Multi-Engine for China/Google results
3. Use Tavily for AI-consumption tasks (citations, summaries)
4. Use Multi-Source for broad research campaigns
5. Add 1-2s delay between requests to avoid rate limiting

## References

- `references/advanced-search.md` — Domestic search guide
- `references/international-search.md` — International search guide
