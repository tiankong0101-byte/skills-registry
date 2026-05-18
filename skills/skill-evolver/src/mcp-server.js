#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const http = require('http');
const { SkillEvolver } = require('./index');
const { PalaceStore } = require('./palace-store');

const TOOLS = [
  {
    name: 'evolver_verify',
    description: 'Verify a skill against its eval suite. Returns pass rate and detailed assertion results.',
    inputSchema: {
      type: 'object',
      properties: {
        skill_name: { type: 'string', description: 'Name of the skill to verify' },
        eval_id: { type: 'number', description: 'Optional: run a specific eval by ID' }
      },
      required: ['skill_name']
    }
  },
  {
    name: 'evolver_evolve',
    description: 'Run the evolution loop on a skill for N rounds, improving it based on eval feedback.',
    inputSchema: {
      type: 'object',
      properties: {
        skill_name: { type: 'string', description: 'Name of the skill to evolve' },
        rounds: { type: 'number', description: 'Max rounds (default: 5)' }
      },
      required: ['skill_name']
    }
  },
  {
    name: 'evolver_status',
    description: 'Get the evolution status and Pareto frontier report for a skill.',
    inputSchema: {
      type: 'object',
      properties: {
        skill_name: { type: 'string', description: 'Name of the skill' }
      },
      required: ['skill_name']
    }
  },
  {
    name: 'evolver_rollback',
    description: 'Rollback a skill to a previous checkpoint version.',
    inputSchema: {
      type: 'object',
      properties: {
        skill_name: { type: 'string', description: 'Name of the skill' },
        version: { type: 'string', description: 'Version to rollback to (omit for latest)' }
      },
      required: ['skill_name']
    }
  },
  {
    name: 'evolver_stats',
    description: 'Get palace-wide statistics across all skills.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'evolver_search_failures',
    description: 'Search failure history (hall_failures) for a skill by keyword.',
    inputSchema: {
      type: 'object',
      properties: {
        skill_name: { type: 'string', description: 'Name of the skill' },
        query: { type: 'string', description: 'Search keyword for failure assertions' }
      },
      required: ['skill_name', 'query']
    }
  },
  {
    name: 'evolver_verify_all',
    description: 'Run verification on all skills with eval suites in parallel.',
    inputSchema: {
      type: 'object',
      properties: {
        parallel: { type: 'number', description: 'Parallel verification count (default: 4)' }
      }
    }
  }
];

async function handleRequest(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ tools: TOOLS }));
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const request = JSON.parse(body);
      const { method, params, id } = request;

      if (method === 'initialize') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'skill-evolver', version: '1.0.0' },
          id
        }));
        return;
      }

      if (method === 'tools/list') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ tools: TOOLS, id }));
        return;
      }

      if (method === 'tools/call') {
        const { name, arguments: args = {} } = params;
        const result = await callTool(name, args);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          id
        }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Unknown method: ${method}`, id }));
    } catch (e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}

async function callTool(name, args) {
  const baseDir = require('path').join(__dirname, '..');
  const opts = {
    evalsDir: process.env.EVOLVER_EVALS_DIR || require('path').join(baseDir, 'evals'),
    evolveDir: process.env.EVOLVER_EVOLVE_DIR || require('path').join(baseDir, '.evolve')
  };

  switch (name) {
    case 'evolver_verify': {
      const ev = new SkillEvolver(args.skill_name, opts);
      const result = await ev.verify(args.eval_id || null);
      return result;
    }

    case 'evolver_evolve': {
      const ev = new SkillEvolver(args.skill_name, opts);
      const result = await ev.evolve(args.rounds || 5);
      return result;
    }

    case 'evolver_status': {
      const ev = new SkillEvolver(args.skill_name, opts);
      const status = await ev.status();
      return status;
    }

    case 'evolver_rollback': {
      const ev = new SkillEvolver(args.skill_name, opts);
      const result = await ev.rollback(args.version || null);
      return result;
    }

    case 'evolver_stats': {
      const store = new PalaceStore(opts.evolveDir);
      await store.init();
      const stats = store.stats();
      const wings = store.listWings();
      const summary = [];
      for (const wing of wings) {
        const report = store.paretoReport(wing.id);
        summary.push({
          name: wing.name,
          activeVersions: report.active,
          bestPassRate: report.best?.passRate || 0,
          bestScore: report.best?.score || 0
        });
      }
      store.close();
      return { ...stats, skills: summary };
    }

    case 'evolver_search_failures': {
      const store = new PalaceStore(opts.evolveDir);
      await store.init();
      const wing = store.getWing(args.skill_name);
      let failures = [];
      if (wing) {
        const halls = store.searchHalls(wing.id, 'hall_failures', args.query);
        for (const h of halls) {
          try {
            failures.push(...JSON.parse(h.data));
          } catch {
            failures.push(h.data);
          }
        }
      }
      store.close();
      return { skill: args.skill_name, query: args.query, count: failures.length, failures };
    }

    case 'evolver_verify_all': {
      const ev = new SkillEvolver('all', opts);
      const result = await ev.verifyAll(args.parallel || 4);
      return result;
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

const PORT = parseInt(process.env.EVOLVER_MCP_PORT || '3100');
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`[MCP] Skill Evolver MCP Server running on port ${PORT}`);
  console.log(`[MCP] Tools: ${TOOLS.map(t => t.name).join(', ')}`);
  console.log(`[MCP] Connect via: claude mcp add skill-evolver -- python -m http.server ${PORT}`);
});

process.on('SIGTERM', () => { server.close(); process.exit(0); });
