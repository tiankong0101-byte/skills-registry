const SKILL_STRATEGIES = {
  debug: {
    name: 'debug',
    keywords: ['debug', 'debugging', 'troubleshoot', 'systematic', 'fix'],
    temperature: 0.2,
    maxTokens: 8192,
    generationMode: 'precise',
    focusOn: ['fix precision', 'step-by-step', 'root cause', 'protocol'],
    verifierPromptSuffix: `
## Debug Skill Emphasis
- Verify the skill mentions: reproduce first, isolate scope, form hypothesis
- Check for specific debugging commands and tools
- Verify regression test recommendations
- Check for version-specific guidance (Node, Python, etc.)`,
  },

  creative: {
    name: 'creative',
    keywords: ['creative', 'writing', 'copy', 'content', 'habit', 'viral', 'humanizer', 'brainstorm'],
    temperature: 0.7,
    maxTokens: 8192,
    generationMode: 'generative',
    focusOn: ['examples', 'inspiration', 'voice', 'tone', 'creativity'],
    verifierPromptSuffix: `
## Creative Skill Emphasis
- Verify the skill encourages diverse examples
- Check for tone/voice consistency
- Verify actionable guidance over generic advice
- Check for specific triggers and contexts`,
  },

  frontend: {
    name: 'frontend',
    keywords: ['frontend', 'flutter', 'react', 'vue', 'ios', 'android', 'native', 'ui', 'ux', 'css', 'html'],
    temperature: 0.3,
    maxTokens: 8192,
    generationMode: 'comprehensive',
    focusOn: ['code patterns', 'best practices', 'platform specifics', 'performance'],
    verifierPromptSuffix: `
## Frontend Skill Emphasis
- Verify platform-specific guidance (Flutter, React Native, etc.)
- Check for code examples and patterns
- Verify performance considerations
- Check accessibility and best practices`,
  },

  document: {
    name: 'document',
    keywords: ['pdf', 'docx', 'xlsx', 'excel', 'word', 'powerpoint', 'pptx', 'markdown', 'doc'],
    temperature: 0.2,
    maxTokens: 4096,
    generationMode: 'template',
    focusOn: ['format adherence', 'template compliance', 'structure', 'precision'],
    verifierPromptSuffix: `
## Document Skill Emphasis
- Verify format-specific guidance (PDF, DOCX, etc.)
- Check for template/structure requirements
- Verify field-by-field precision
- Check for edge case handling`,
  },

  data: {
    name: 'data',
    keywords: ['ffmpeg', 'image', 'video', 'audio', 'convert', 'compress', 'resize', 'extract'],
    temperature: 0.3,
    maxTokens: 4096,
    generationMode: 'command',
    focusOn: ['command correctness', 'tool usage', 'format specs', 'flags'],
    verifierPromptSuffix: `
## Data Processing Skill Emphasis
- Verify command syntax accuracy
- Check for format specifications
- Verify flags and options correctness
- Check for input/output handling`,
  },

  agent: {
    name: 'agent',
    keywords: ['clawlist', 'agent', 'autopilot', 'workflow', 'task', 'planning', 'dispatch', 'capability', 'evolver', 'skill'],
    temperature: 0.4,
    maxTokens: 8192,
    generationMode: 'procedural',
    focusOn: ['process adherence', 'workflow', 'integration', 'state management'],
    verifierPromptSuffix: `
## Agent Skill Emphasis
- Verify workflow/step adherence
- Check for state management
- Verify integration patterns
- Check for error handling and recovery`,
  },

  search: {
    name: 'search',
    keywords: ['search', 'scrape', 'fetch', 'crawl', 'browser', 'web'],
    temperature: 0.3,
    maxTokens: 4096,
    generationMode: 'precision',
    focusOn: ['selector accuracy', 'error handling', 'rate limits', 'format'],
    verifierPromptSuffix: `
## Search/Scraping Skill Emphasis
- Verify selector specificity
- Check error handling for network issues
- Verify rate limiting guidance
- Check for parse format guidance`,
  },

  general: {
    name: 'general',
    keywords: [],
    temperature: 0.5,
    maxTokens: 8192,
    generationMode: 'balanced',
    focusOn: ['clarity', 'completeness', 'actionability'],
    verifierPromptSuffix: '',
  },
};

class StrategySelector {
  constructor() {
    this.strategies = SKILL_STRATEGIES;
    this.cache = new Map();
  }

  classify(skillName) {
    if (this.cache.has(skillName)) return this.cache.get(skillName);

    const lower = skillName.toLowerCase();
    let bestMatch = 'general';
    let bestScore = 0;

    for (const [type, strategy] of Object.entries(this.strategies)) {
      if (type === 'general') continue;
      let score = 0;
      for (const kw of strategy.keywords) {
        if (lower.includes(kw)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = type;
      }
    }

    this.cache.set(skillName, bestMatch);
    return bestMatch;
  }

  getStrategy(skillName) {
    const type = this.classify(skillName);
    return { ...this.strategies[type], type };
  }

  getGenerationConfig(skillName) {
    const s = this.getStrategy(skillName);
    return {
      temperature: s.temperature,
      maxTokens: s.maxTokens,
      mode: s.generationMode,
      focusOn: s.focusOn,
    };
  }

  getVerifierPromptSuffix(skillName) {
    const s = this.getStrategy(skillName);
    return s.verifierPromptSuffix;
  }

  getRecommendedRounds(skillName) {
    const type = this.classify(skillName);
    switch (type) {
      case 'debug': return 3;
      case 'creative': return 5;
      case 'frontend': return 4;
      case 'document': return 3;
      case 'data': return 3;
      case 'agent': return 4;
      case 'search': return 3;
      default: return 5;
    }
  }

  getPassThreshold(skillName) {
    const type = this.classify(skillName);
    switch (type) {
      case 'document': return 0.7;
      case 'data': return 0.7;
      case 'debug': return 0.6;
      default: return 0.8;
    }
  }

  describeStrategy(skillName) {
    const s = this.getStrategy(skillName);
    return `[${s.type.toUpperCase()}] temp=${s.temperature}, mode=${s.generationMode}, focus: ${s.focusOn.join(', ')}`;
  }
}

function createSpecialistAgent(skillName, llmClient, assertionEngine, opts = {}) {
  const selector = new StrategySelector();
  const strategy = selector.getStrategy(skillName);
  return {
    skillName,
    strategy,
    config: selector.getGenerationConfig(skillName),
    recommendedRounds: selector.getRecommendedRounds(skillName),
    passThreshold: selector.getPassThreshold(skillName),
    describe: () => selector.describeStrategy(skillName),
    classify: () => strategy.name,
  };
}

module.exports = { StrategySelector, SKILL_STRATEGIES, createSpecialistAgent };
