---
name: design-revise
description: 所见即所得的 UI 修改系统。AI 分析截图或设计稿后，直接输出需要修改的具体文件路径和精确代码改动，无需模糊描述。源自 Cursor 3.0 Design Mode 框选即改理念，增强 frontend-design 和 frontend-dev。
triggers:
  - 设计修改
  - design-revise
  - UI修改
  - 所见即所得
  - 设计落地
features:
  - 设计分析
  - 文件定位
  - 精确代码改动
  - 多文件协同
dangerLevel: medium
---

# Design Revise — 所见即所得 UI 修改

> 来自 Cursor 3.0 Design Mode 核心理念：在浏览器中框选 UI 元素，说出你想要的效果，AI 直接给出精确的代码改动。
> 不是"改一下这个按钮"，而是"改哪里、怎么改、文件是什么、代码是什么"。

## 痛点解决

传统工作流：
```
设计师 → 截图 → 描述需求 → AI 猜 → 改错 → 反复 → 浪费大量时间
```

Design Revise 工作流：
```
设计师 → 上传截图 → AI 分析 → 输出精确文件路径+代码 → 直接改 → 一次到位
```

## 核心命令

### /design-revise {截图或描述}

上传截图或描述设计需求，AI 输出精确的代码改动方案。

**输入**：
- 截图文件路径（PNG/JPG）
- 或设计描述（支持自然语言）

**输出格式**：
```markdown
## Design Revise — 分析结果

### 设计理解
- 目标：把导航栏背景从透明改为白色半透明
- 影响范围：Header 组件

### 需要修改的文件

#### 文件1: `src/components/Header.tsx`
```tsx
// 位置: 第 23-28 行（Header 组件的样式定义）
// 修改前:
const styles = {
  header: {
    backgroundColor: 'transparent',
    backdropFilter: 'none',
  }
}

// 修改后:
const styles = {
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  }
}
```

#### 文件2: `src/styles/globals.css`
```css
/* 新增: 如果有全局样式需要修改 */
.header {
  /* ... */
}
```

### 批量修改
如需同时修改多个文件:
- [ ] src/components/Header.tsx（主文件）
- [ ] src/styles/header.module.css（模块样式，可选）

### 预估改动量
- 文件数: 1-2
- 改动行数: ~8 行
- 风险: 低（仅样式改动）

---
[确认执行] 输入 Y 开始修改，输入 N 取消
```

---

### /design-compare {截图1} {截图2}

对比两张设计稿，分析变更差异，输出合并方案。

### /design-extract {截图}

从设计截图中提取：
- 颜色值（HEX / RGB / HSL）
- 字体（family / size / weight / line-height）
- 间距（padding / margin / gap）
- 组件结构（树形图）

**输出格式**：
```markdown
## 设计提取结果

### 颜色系统
| 用途 | 值 |
|------|-----|
| 主色 | #2563EB |
| 辅色 | #1D4ED8 |
| 背景 | #F8FAFC |
| 文字 | #1E293B |
| 边框 | #E2E8F0 |

### 字体系统
| 用途 | 字体 | 字号 | 字重 |
|------|------|------|------|
| 标题 | Inter | 24px | 700 |
| 正文 | Inter | 16px | 400 |
| 辅助 | Inter | 14px | 400 |

### 间距系统
| 间距 | 值 |
|------|-----|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
```

---

## 工作流设计

### 流程一：截图改 UI（推荐）

```
1. 设计师上传截图到对话
2. /design-revise <截图路径>
3. AI 分析并输出精确改动方案
4. 用户确认（Y 确认 / N 调整需求）
5. AI 执行代码修改
6. AI 生成对比说明
```

### 流程二：设计稿 → 完整页面

```
1. 设计师提供多张截图（首页、详情页、列表页...）
2. /design-revise <所有截图路径>
3. AI 识别组件复用关系
4. AI 输出：组件结构树 + 每个组件的改动方案
5. 用户分批确认，AI 分批实现
```

### 流程三：设计系统同步

```
1. 团队更新了设计系统（颜色/字体/间距）
2. 设计师提供变更说明
3. /design-apply <变更说明>
4. AI 扫描所有相关文件，应用变更
5. AI 输出变更报告（改了哪些文件、每处改了什么）
```

---

## 技术实现要点

### 图片分析（MiniMax VL）

使用 MiniMax VL API 分析设计截图：

```javascript
const analysis = await minimax_vl.analyze({
  image: screenshot_path,  // PNG/JPG 文件路径
  prompt: `分析这个 UI 设计截图，请提取：
1. 颜色系统（主色、辅色、背景、文字色，用 HEX 表示）
2. 字体系统（字号、字重、字体名）
3. 间距系统（padding、margin、gap 的规律）
4. 布局类型（Flexbox/Grid/Stack）
5. 组件结构（有哪些组件，各自的功能）
6. 视觉风格关键词（扁平/毛玻璃/渐变/阴影等）`
});
```

**提取结果示例**：
```json
{
  "colors": {
    "primary": "#2563EB",
    "secondary": "#1D4ED8",
    "background": "#F8FAFC",
    "text": "#1E293B",
    "border": "#E2E8F0"
  },
  "typography": {
    "fontFamily": "Inter, sans-serif",
    "headingSize": "24px",
    "bodySize": "16px",
    "captionSize": "14px"
  },
  "spacing": {
    "unit": "4px",
    "scale": [4, 8, 16, 24, 32]
  },
  "layout": "Flexbox (row, justify-between, items-center)",
  "components": ["Header", "NavMenu", "Logo", "ButtonGroup"],
  "style": "minimal, clean, subtle-shadow"
}
```

**分析策略**：
- 优先提取可量化的值（颜色、字号、间距）
- 布局描述要精确（如 `display: flex; justify-content: space-between; align-items: center`）
- 组件识别要能对应到现有代码中的文件名

### 文件定位策略

1. **项目扫描**：分析 `components/` 目录结构，找到最可能相关的组件
2. **代码相似度**：对比截图中的视觉特征与现有代码的视觉效果
3. **路径猜测**：根据组件命名和目录结构推测文件路径
4. **用户确认**：在输出改动方案前，先确认文件是否正确

### 风险控制

| 改动类型 | 风险 | 控制方式 |
|---------|------|---------|
| 纯样式改动 | 低 | 直接执行 |
| 涉及逻辑 | 中 | 先输出改动，用户确认后执行 |
| 涉及多文件 | 高 | 分步执行，每步确认 |
| 涉及数据流 | 高 | 先输出分析，用户确认理解后再执行 |

---

## 与现有技能的关系

- **frontend-design**：负责设计生成和风格规范
- **design-revise**：负责设计的落地和精确修改
- **frontend-dev**：负责代码实现

```
frontend-design 生成设计稿
        ↓
design-revise 分析改动需求
        ↓
frontend-dev 执行代码实现
```

三者配合，形成完整的前端开发闭环。

## 输出质量标准

每次 /design-revise 输出必须包含：
1. ✅ 设计理解（AI 对需求的解读是否正确）
2. ✅ 文件路径（精确到文件名和行号范围）
3. ✅ 代码diff（修改前后的完整代码对比）
4. ✅ 风险评估（改动涉及的范围和潜在影响）
5. ✅ 用户确认点（在哪一步需要用户确认）
