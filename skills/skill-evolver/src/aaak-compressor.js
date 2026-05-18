const fs = require('fs');
const path = require('path');

const DEFAULT_ENTITIES = {
  JavaScript: 'JS',
  TypeScript: 'TS',
  Python: 'PY',
  React: 'RCT',
  Vue: 'VU',
  Angular: 'ANG',
  Node: 'ND',
  Express: 'EXP',
  MongoDB: 'MGO',
  PostgreSQL: 'PGS',
  MySQL: 'MY',
  Redis: 'RDS',
  Docker: 'DKR',
  Kubernetes: 'K8S',
  AWS: 'AWS',
  GCP: 'GCP',
  Azure: 'AZR',
  API: 'API',
  REST: 'REST',
  GraphQL: 'GQL',
  HTML: 'HTML',
  CSS: 'CSS',
  JSON: 'JSON',
  YAML: 'YAML',
  XML: 'XML',
  CLI: 'CLI',
  SDK: 'SDK',
  LLM: 'LLM',
  GPT: 'GPT',
  Claude: 'CLD',
  Gemini: 'GMN',
  OpenAI: 'OPAI',
  Anthropic: 'ANTC',
  error: 'ERR',
  warning: 'WRN',
  debug: 'DBG',
  log: 'LOG',
  config: 'CFG',
  deploy: 'DPLY',
  build: 'BLD',
  test: 'TST',
  production: 'PROD',
  development: 'DEV',
  staging: 'STG',
};

const ABBREVIATIONS = [
  [/\binformation\b/gi, 'INFO'],
  [/\bconfiguration\b/gi, 'CFG'],
  [/\bapplication\b/gi, 'APP'],
  [/\bcharacter\b/gi, 'CHR'],
  [/\bcommand\b/gi, 'CMD'],
  [/\bcomponent\b/gi, 'CMP'],
  [/\bconnection\b/gi, 'CONN'],
  [/\bcontainer\b/gi, 'CNT'],
  [/\bcontent\b/gi, 'CNT'],
  [/\bcontext\b/gi, 'CTX'],
  [/\bcontinuous\b/gi, 'CONT'],
  [/\bdefault\b/gi, 'DFT'],
  [/\bdocument\b/gi, 'DOC'],
  [/\benvironment\b/gi, 'ENV'],
  [/\bextension\b/gi, 'EXT'],
  [/\bfeature\b/gi, 'FT'],
  [/\bframework\b/gi, 'FWK'],
  [/\bfunction\b/gi, 'FN'],
  [/\bgeneration\b/gi, 'GEN'],
  [/\bimplementation\b/gi, 'IMPL'],
  [/\binstruction\b/gi, 'INST'],
  [/\bintegration\b/gi, 'INTG'],
  [/\blanguage\b/gi, 'LANG'],
  [/\blibrary\b/gi, 'LIB'],
  [/\bmanagement\b/gi, 'MGT'],
  [/\bmessage\b/gi, 'MSG'],
  [/\bmetadata\b/gi, 'META'],
  [/\bnetwork\b/gi, 'NET'],
  [/\boperation\b/gi, 'OP'],
  [/\boptimization\b/gi, 'OPT'],
  [/\boriented\b/gi, 'ORT'],
  [/\bpackage\b/gi, 'PKG'],
  [/\bparameter\b/gi, 'PARAM'],
  [/\bplatform\b/gi, 'PLT'],
  [/\bpreference\b/gi, 'PREF'],
  [/\bprobability\b/gi, 'PROB'],
  [/\bprocessing\b/gi, 'PROC'],
  [/\bproduction\b/gi, 'PROD'],
  [/\bprofessional\b/gi, 'PROF'],
  [/\bprogram\b/gi, 'PROG'],
  [/\bprogramming\b/gi, 'PROG'],
  [/\bproject\b/gi, 'PRJ'],
  [/\brecommendation\b/gi, 'RECM'],
  [/\breference\b/gi, 'REF'],
  [/\bregistry\b/gi, 'REG'],
  [/\brelationship\b/gi, 'REL'],
  [/\brepresentation\b/gi, 'REPR'],
  [/\brequirement\b/gi, 'REQ'],
  [/\bresolution\b/gi, 'RES'],
  [/\bresource\b/gi, 'RES'],
  [/\bresponse\b/gi, 'RSP'],
  [/\brestaurant\b/gi, 'RSTR'],
  [/\bservice\b/gi, 'SVC'],
  [/\bsession\b/gi, 'SSN'],
  [/\bsettings\b/gi, 'SET'],
  [/\bspecification\b/gi, 'SPEC'],
  [/\bstructure\b/gi, 'STR'],
  [/\bsystem\b/gi, 'SYS'],
  [/\btechnology\b/gi, 'TECH'],
  [/\btemplate\b/gi, 'TPL'],
  [/\bterminal\b/gi, 'TERM'],
  [/\bthreshold\b/gi, 'THR'],
  [/\bundefined\b/gi, 'UNDEF'],
  [/\buniversal\b/gi, 'UNIV'],
  [/\bvalidation\b/gi, 'VAL'],
  [/\bvariable\b/gi, 'VAR'],
  [/\bverification\b/gi, 'VER'],
  [/\bversion\b/gi, 'VER'],
  [/\bworkspace\b/gi, 'WSPC'],
  [/\bsuccessfully\b/gi, 'SUCC'],
  [/\bespecially\b/gi, 'ESPC'],
  [/\bimmediately\b/gi, 'IMMD'],
  [/\bparticularly\b/gi, 'PRTL'],
  [/\bregularly\b/gi, 'RGLY'],
  [/\bspecifically\b/gi, 'SPFC'],
];

const STRUCTURAL_MARKERS = {
  '## ': '[H2] ',
  '### ': '[H3] ',
  '```': '[CODE]',
  '`': "'",
  '- **': '-*',
  '**': '*',
  '_': '',
};

class AAAKCompressor {
  constructor(opts = {}) {
    this.entityMap = { ...DEFAULT_ENTITIES, ...opts.entities };
    this.maxTokens = opts.maxTokens || 3500;
    this.entityCodes = new Map();
    this._buildEntityCodes();
  }

  _buildEntityCodes() {
    let idx = 1;
    for (const [name, code] of Object.entries(this.entityMap)) {
      this.entityCodes.set(name.toLowerCase(), code);
    }
  }

  compress(text, opts = {}) {
    if (!opts.skipEntityDetection) {
      text = this._detectAndCodeEntities(text);
    }
    text = this._applyAbbreviations(text);
    text = this._applyStructuralMarkers(text);
    text = this._truncateSentences(text, opts.maxSentences);
    return text;
  }

  _detectAndCodeEntities(text) {
    const detected = new Map();

    for (const [name, code] of this.entityCodes) {
      const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches && matches.length >= 2) {
        detected.set(name.toLowerCase(), { code, count: matches.length });
      }
    }

    let result = text;
    const sorted = [...detected.entries()].sort((a, b) => b[1].count - a[1].count);

    for (const [name, { code, count }] of sorted.slice(0, 20)) {
      if (count >= 2) {
        const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        result = result.replace(regex, code);
      }
    }

    return result;
  }

  _applyAbbreviations(text) {
    let result = text;
    for (const [pattern, replacement] of ABBREVIATIONS) {
      result = result.replace(pattern, replacement);
    }
    return result;
  }

  _applyStructuralMarkers(text) {
    let result = text;
    for (const [marker, replacement] of Object.entries(STRUCTURAL_MARKERS)) {
      result = result.split(marker).join(replacement);
    }
    return result;
  }

  _truncateSentences(text, maxSentences) {
    if (!maxSentences) return text;
    const sentences = text.split(/(?<=[.!?])\s+/);
    if (sentences.length <= maxSentences) return text;
    return sentences.slice(0, maxSentences).join(' ') + '...';
  }

  decompress(text) {
    let result = text;
    result = result.replace(/\[H2\] /g, '## ');
    result = result.replace(/\[H3\] /g, '### ');
    result = result.replace(/\[CODE\]/g, '```');
    result = result.replace(/'/g, '`');
    result = result.replace(/-!\*/g, '- **');
    result = result.replace(/\*(.*?)\*/g, '**$1**');
    return result;
  }

  stats(before, after) {
    return {
      before_length: before.length,
      after_length: after.length,
      reduction: `${((1 - after.length / before.length) * 100).toFixed(1)}%`,
      before_tokens_est: Math.ceil(before.length / 4),
      after_tokens_est: Math.ceil(after.length / 4),
    };
  }
}

class AAAKContextBuilder {
  constructor(compressor) {
    this.compressor = compressor;
  }

  buildContext(skillContent, hallFailures = [], hallSuggestions = [], opts = {}) {
    const maxLen = opts.maxLength || 3500;

    let context = '';

    if (hallFailures.length > 0) {
      const failures = this._summarizeFailures(hallFailures);
      context += `[MEMORY:HALL_FAILURES]\n${failures}\n\n`;
    }

    if (hallSuggestions.length > 0) {
      const suggestions = hallSuggestions.slice(-5).join('\n');
      context += `[MEMORY:HALL_SUGGESTIONS]\n${suggestions}\n\n`;
    }

    const remaining = maxLen - this._estTokens(context);
    if (remaining > 500) {
      const compressed = this.compressor.compress(skillContent, { skipEntityDetection: false });
      if (this._estTokens(compressed) <= remaining) {
        context += `[SKILL:COMPRESSED]\n'${compressed}'`;
      } else {
        const truncated = compressed.slice(0, remaining * 4);
        context += `[SKILL:COMPRESSED]\n'${truncated}'`;
      }
    }

    return context;
  }

  _summarizeFailures(failures) {
    const unique = [];
    const seen = new Set();
    for (const f of failures) {
      const key = typeof f === 'string' ? f : (f.assertion || f.suggestion || '');
      if (key && !seen.has(key)) {
        seen.add(key);
        unique.push(f);
      }
    }
    return unique.slice(-5).map(f => {
      if (typeof f === 'string') return f;
      return `* "${f.assertion}": ${f.suggestion || f.evidence || ''}`.slice(0, 150);
    }).join('\n');
  }

  _estTokens(text) {
    return Math.ceil(text.length / 4);
  }
}

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

function compressSkill(skillContent, opts = {}) {
  const comp = new AAAKCompressor(opts);
  return comp.compress(skillContent, opts);
}

module.exports = { AAAKCompressor, AAAKContextBuilder, compressSkill, estimateTokens };
