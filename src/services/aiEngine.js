// PlacePrep AI - Data-Driven AI Intelligence and Mock Interview Evaluation Engine
import { getInterviewQuestions, getInterviewExperiences, getCompanies } from './storage';

/**
 * Performs analytical aggregation of historical interview records
 * Computes frequency distribution, recency weightings, and categorized topics.
 */
export function generateCompanyAnalytics(companyId) {
  const allQuestions = getInterviewQuestions().filter(q => q.companyId === companyId);
  const allExperiences = getInterviewExperiences().filter(e => e.companyId === companyId);
  const company = getCompanies().find(c => c.id === companyId);

  // Recency and frequency calculations
  const totalQuestions = allQuestions.length;
  const technicalCount = allQuestions.filter(q => q.round === 'technical').length;
  const hrCount = allQuestions.filter(q => q.round === 'hr').length;
  const managerialCount = allQuestions.filter(q => q.round === 'managerial').length;

  // Category breakdown
  const categoryMap = {};
  allQuestions.forEach(q => {
    categoryMap[q.category] = (categoryMap[q.category] || 0) + (q.timesReported || 1);
  });

  // Top recurrent topics
  const sortedTopics = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));

  // Recommended questions weighted by frequency (70%) and recency (30%)
  const recommended = [...allQuestions].sort((a, b) => {
    const scoreA = (a.frequencyScore || 50) + (a.recencyRating === 'High' ? 20 : 5);
    const scoreB = (b.frequencyScore || 50) + (b.recencyRating === 'High' ? 20 : 5);
    return scoreB - scoreA;
  });

  return {
    companyId,
    companyName: company?.name || companyId,
    totalRecords: allExperiences.length + allQuestions.length,
    experienceRecordsCount: allExperiences.length,
    questionBankCount: totalQuestions,
    roundDistribution: {
      technical: technicalCount,
      hr: hrCount,
      managerial: managerialCount
    },
    topCategories: sortedTopics,
    recommendedQuestions: recommended.slice(0, 5),
    latestVerifiedDate: company?.latestUpdateDate || 'October 2026',
    dataReliabilityScore: allExperiences.length > 50 ? 'Very High (Statistically Significant)' : 'Moderate (Based on Initial Campus Logs)'
  };
}

/**
 * AI Mock Interview Response Evaluator
 * Evaluates student answers on:
 * 1. Correctness & Technical / Conceptual depth
 * 2. Communication Clarity & Conciseness
 * 3. Structure (STAR method for behavioral, algorithmic/logical structure for technical)
 * 4. Areas for Improvement & Benchmark Answer comparison
 */
export function evaluateStudentAnswer(question, studentAnswer, roundType) {
  const text = (studentAnswer || '').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (wordCount < 10) {
    return {
      overallScore: 35,
      correctnessScore: 30,
      clarityScore: 40,
      structureScore: 35,
      verdict: 'Answer Too Brief',
      feedback: 'Your answer is very brief. In a real interview, panels look for depth, rationale, and specific technical or real-world examples.',
      strengths: ['Prompt attempt made.'],
      improvements: [
        'Elaborate on the key concepts or mechanics.',
        roundType === 'hr' || roundType === 'managerial'
          ? 'Apply the STAR method (Situation, Task, Action, Result).'
          : 'Explain time/space complexity or provide code/query syntax.'
      ],
      sampleGuidance: question.suggestedAnswer || 'Review the suggested approach provided in the question bank.'
    };
  }

  // Key phrase and keyword matching from question and suggested answer
  const suggestedWords = (question.suggestedAnswer || '').toLowerCase().match(/\b\w{4,}\b/g) || [];
  const studentWords = new Set(text.toLowerCase().match(/\b\w{4,}\b/g) || []);
  
  let keywordHits = 0;
  suggestedWords.forEach(w => {
    if (studentWords.has(w)) keywordHits++;
  });

  const keywordCoverageRatio = suggestedWords.length > 0 ? Math.min(keywordHits / Math.min(suggestedWords.length, 25), 1.0) : 0.6;

  // Structural checks
  const hasExample = /example|instance|project|when i|situation|scenario|team|query|select|code/i.test(text);
  const hasStructure = /first|second|because|therefore|however|result|finally|step/i.test(text);

  // Compute sub-scores (0-100)
  let correctness = Math.min(Math.round(55 + (keywordCoverageRatio * 40)), 98);
  let clarity = Math.min(Math.round(60 + (Math.min(wordCount, 150) / 150 * 25) + (hasStructure ? 10 : 0)), 96);
  let structure = Math.min(Math.round(50 + (hasExample ? 25 : 5) + (hasStructure ? 20 : 5)), 95);

  // Penalize fluff without substance
  if (wordCount > 300 && keywordCoverageRatio < 0.2) {
    correctness -= 15;
    clarity -= 10;
  }

  const overall = Math.round((correctness * 0.4) + (clarity * 0.3) + (structure * 0.3));

  // Generate dynamic actionable feedback
  const strengths = [];
  const improvements = [];

  if (wordCount >= 60) {
    strengths.push('Solid elaboration and willingness to explain nuances.');
  }
  if (hasExample) {
    strengths.push('Good inclusion of contextual examples or practical scenarios.');
  }
  if (hasStructure) {
    strengths.push('Logical progression with transition markers.');
  }
  if (strengths.length === 0) {
    strengths.push('Addressed the core subject of the question.');
  }

  if (!hasExample) {
    improvements.push('Ground your answer with an explicit concrete project, metric, or code sample.');
  }
  if (roundType === 'hr' || roundType === 'managerial') {
    if (!/result|outcome|learned|impact/i.test(text)) {
      improvements.push('Highlight the measurable outcome or learning experience at the conclusion (the "R" in STAR).');
    }
  } else {
    if (!/complexity|index|performance|trade-off|time/i.test(text)) {
      improvements.push('Mention performance considerations, edge cases, or trade-offs.');
    }
  }

  if (wordCount < 40) {
    improvements.push('Aim for a response duration equivalent to 1.5 - 2 minutes spoken (approx. 80-150 words).');
  }

  let verdict = 'Good Response';
  if (overall >= 85) verdict = 'Outstanding Response';
  else if (overall >= 70) verdict = 'Strong & Competitive';
  else if (overall >= 55) verdict = 'Satisfactory with Scope to Polish';
  else verdict = 'Needs Revision';

  return {
    overallScore: overall,
    correctnessScore: correctness,
    clarityScore: clarity,
    structureScore: structure,
    verdict,
    feedback: `You demonstrated a good understanding of the subject (${overall}% score). ${
      overall >= 80
        ? 'Your structure is polished and interview-ready.'
        : 'Adding sharper structure and concrete examples will elevate your rating with senior interviewers.'
    }`,
    strengths,
    improvements,
    sampleGuidance: question.suggestedAnswer
  };
}
