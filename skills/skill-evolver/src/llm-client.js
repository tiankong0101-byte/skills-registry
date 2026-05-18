const https = require('https');
const http = require('http');
const { URL } = require('url');

class LLMClient {
  constructor(opts = {}) {
    this.baseURL = process.env.EVOLVER_NVIDIA_BASE_URL || 
      'https://integrate.api.nvidia.com/v1';
    this.apiKey = process.env.EVOLVER_NVIDIA_API_KEY || 
      process.env.NVIDIA_NIM_API_KEY || '';
    this.model = process.env.EVOLVER_LLM_MODEL || 'qwen/qwen2.5-coder-7b-instruct';
    this.verifierModel = process.env.EVOLVER_VERIFIER_MODEL || this.model;
    this.timeout = 60000;
    this.temperature = opts.temperature || 0.7;
  }

  async complete(prompt, opts = {}) {
    return this._request({
      model: opts.model || this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: opts.temperature ?? this.temperature,
      max_tokens: opts.maxTokens || 4096
    });
  }

  async completeMessages(messages, opts = {}) {
    return this._request({
      model: opts.model || this.model,
      messages,
      temperature: opts.temperature ?? this.temperature,
      max_tokens: opts.maxTokens || 4096
    });
  }

  async verifyComplete(systemPrompt, userPrompt, opts = {}) {
    return this._request({
      model: opts.model || this.verifierModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 2048
    });
  }

  async _request(body) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseURL}/chat/completions`);
      const isHttps = url.protocol === 'https:';
      const lib = isHttps ? https : http;

      const data = JSON.stringify(body);

      const req = lib.request({
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: this.timeout
      }, (res) => {
        let raw = '';
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            if (parsed.error) {
              reject(new Error(`API Error: ${parsed.error.message || JSON.stringify(parsed.error)}`));
              return;
            }
            const content = parsed.choices?.[0]?.message?.content || '';
            resolve({
              content,
              usage: parsed.usage || {},
              model: parsed.model,
              finishReason: parsed.choices?.[0]?.finish_reason
            });
          } catch (e) {
            reject(new Error(`Parse error: ${e.message}. Raw: ${raw.substring(0, 500)}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
      req.write(data);
      req.end();
    });
  }

  async completeStream(prompt, onChunk, opts = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseURL}/chat/completions`);
      const isHttps = url.protocol === 'https:';
      const lib = isHttps ? https : http;

      const body = {
        model: opts.model || this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: opts.temperature ?? this.temperature,
        max_tokens: opts.maxTokens || 4096,
        stream: true
      };

      const data = JSON.stringify(body);
      let fullContent = '';

      const req = lib.request({
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: this.timeout
      }, (res) => {
        res.on('data', chunk => {
          const lines = chunk.toString().split('\n');
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content || '';
              if (token) {
                fullContent += token;
                onChunk(token);
              }
            } catch {}
          }
        });
        res.on('end', () => resolve({ content: fullContent }));
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Stream timeout')); });
      req.write(data);
      req.end();
    });
  }
}

module.exports = { LLMClient };
