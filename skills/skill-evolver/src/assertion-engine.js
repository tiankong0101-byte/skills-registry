const { SurrogateVerifier } = require('./surrogate-verifier');
const { SkillGenerator } = require('./skill-generator');

class AssertionEngine {
  constructor(llmClient) {
    this.llm = llmClient;
    this.verifier = new SurrogateVerifier(llmClient);
    this.generator = new SkillGenerator(llmClient);
  }

  async verify(skillContent, evalCase) {
    return this.verifier.verify(skillContent, evalCase);
  }

  async verifyBatch(skillContent, evalCases, strategy = null) {
    return this.verifier.verifyBatch(skillContent, evalCases, strategy);
  }

  async runEvalSuite(skillContent, evalCases, strategy = null) {
    if (!evalCases || evalCases.length === 0) {
      return {
        passed: false,
        passRate: 0,
        score: 0,
        results: [],
        overall_feedback: 'No evals defined for this skill'
      };
    }

    const results = await this.verifier.verifyBatch(skillContent, evalCases, strategy);

    const passedCount = results.filter(r => r.passed).length;
    const passRate = passedCount / results.length;
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    const allPassed = passRate === 1.0;
    const thresholdPassed = passRate >= 0.8;

    return {
      passed: thresholdPassed,
      passRate,
      score: avgScore,
      results,
      failedAssertions: results
        .filter(r => !r.passed)
        .flatMap(r => r.assertion_results?.filter(a => !a.passed) || []),
      overall_feedback: this.summarizeFeedback(results),
      confidence: this.calculateConfidence(results)
    };
  }

  async improve(skillContent, feedback, context) {
    console.log('    [AssertionEngine] Calling generator...');
    const result = await this.generator.generateImprovedVersion(skillContent, feedback, context);
    console.log('    [AssertionEngine] Generator returned length:', result?.length || 'null/undefined');

    if (!result || result.length < 100) {
      console.log('    [AssertionEngine] Generator output too short, using targeted patch');
      return this.generator.patchImprove(skillContent, feedback);
    }

    return result;
  }

  summarizeFeedback(results) {
    const failed = results.filter(r => !r.passed);
    if (failed.length === 0) return 'All assertions passed';
    
    const critical = failed
      .flatMap(r => r.assertion_results?.filter(a => !a.passed) || [])
      .filter(a => a.suggestion && a.suggestion.length > 10)
      .slice(0, 3)
      .map(a => `- ${a.assertion}: ${a.suggestion}`)
      .join('\n');

    return `Failed ${failed.length}/${results.length} test cases:\n${critical || 'Review individual assertion results for details'}`;
  }

  calculateConfidence(results) {
    const confidentResults = results.filter(r => r.confidence >= 0.7);
    return confidentResults.length / results.length;
  }

  async dryRun(skillContent, evalCase) {
    const result = await this.verifier.verify(skillContent, evalCase);
    return {
      wouldPass: result.passed,
      score: result.score,
      criticalFailures: result.assertion_results
        .filter(a => !a.passed)
        .map(a => ({ assertion: a.assertion, severity: this.estimateSeverity(a) }))
    };
  }

  estimateSeverity(assertion) {
    const high = ['must', 'critical', 'required', 'essential', 'never', 'always'];
    const medium = ['should', 'recommended', 'important'];
    const text = (assertion.assertion + ' ' + (assertion.suggestion || '')).toLowerCase();
    
    if (high.some(w => text.includes(w))) return 'high';
    if (medium.some(w => text.includes(w))) return 'medium';
    return 'low';
  }
}

module.exports = { AssertionEngine };
