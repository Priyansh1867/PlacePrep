// PlacePrep AI - AI Mock Interview Service
// Orchestrates real AI question generation, intelligent candidate evaluation,
// session state management, and persistent interview history.

import { streamAiChat } from './aiChatService.js';
import { getMockSessions, saveMockSession, getCurrentUser, getInterviewQuestions } from './storage.js';
import { MockSessionApi, QuestionApi } from './api.js';

export const INTERVIEW_CATEGORIES = [
  { id: 'technical', label: 'Technical Interview', icon: 'Code2', desc: 'Core engineering, system architecture, CS foundations & modern frameworks' },
  { id: 'hr', label: 'HR Interview', icon: 'UserCheck', desc: 'Behavioral scenarios, STAR methodology, leadership, cultural fit & situational questions' },
  { id: 'dsa', label: 'DSA Interview', icon: 'Binary', desc: 'Algorithmic problem solving, Big-O trade-offs, data structure mechanics' },
  { id: 'programming', label: 'Programming Interview', icon: 'Terminal', desc: 'Object-oriented patterns, language syntax, debugging, and clean code' },
  { id: 'fullstack', label: 'Full Stack Development', icon: 'Layers', desc: 'Frontend-backend pipelines, REST APIs, state management & deployment' },
  { id: 'database', label: 'Database / SQL Interview', icon: 'Database', desc: 'Complex SQL queries, normalization, indexing, transactions & query optimization' }
];

export const INTERVIEW_DIFFICULTIES = [
  { id: 'Beginner', label: 'Beginner', desc: 'Fundamental concepts, basic syntax, and standard questions' },
  { id: 'Intermediate', label: 'Intermediate', desc: 'Real-world problem solving, edge cases, and architectural trade-offs' },
  { id: 'Advanced', label: 'Advanced', desc: 'Deep concurrency, system optimization, distributed design, and tricky scenarios' }
];

export const SUGGESTED_SKILLS = [
  'Java', 'Python', 'C++', 'JavaScript', 'React', 'Node.js',
  'Spring Boot', 'SQL', 'PostgreSQL', 'System Design', 'Docker',
  'AWS', 'Data Structures', 'REST APIs', 'Git', 'Operating Systems'
];

/**
 * Extracts and parses a JSON object or array from potentially markdown-wrapped AI output.
 */
export function extractJsonFromAiResponse(text) {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text.trim();

  // Try parsing directly
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue to extract from code blocks or brackets
  }

  // Look for ```json ... ``` or ``` ... ```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Continue
    }
  }

  // Look for outer array [ ... ]
  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    try {
      return JSON.parse(cleaned.substring(arrayStart, arrayEnd + 1));
    } catch {
      // Continue
    }
  }

  // Look for outer object { ... }
  const objStart = cleaned.indexOf('{');
  const objEnd = cleaned.lastIndexOf('}');
  if (objStart !== -1 && objEnd > objStart) {
    try {
      return JSON.parse(cleaned.substring(objStart, objEnd + 1));
    } catch {
      // Continue
    }
  }

  return null;
}

/**
 * Generates targeted interview questions via PlacePrep AI.
 */
export async function generateAiInterviewQuestions({
  category = 'technical',
  difficulty = 'Intermediate',
  technology = '',
  companyName = '',
  count = 3
}) {
  const catObj = INTERVIEW_CATEGORIES.find(c => c.id === category) || INTERVIEW_CATEGORIES[0];
  const isHr = category === 'hr';

  const systemInstructions = isHr
    ? `You are a Principal HR Recruiter and Talent Assessment Lead at top tech companies.
Generate exactly ${count} realistic HR and behavioral interview questions for a campus candidate.
Include behavioral questions using the STAR framework, conflict resolution, situational judgment, and workplace culture questions.
Target Difficulty: ${difficulty}.
${companyName ? `Target Company: ${companyName}.` : ''}`
    : `You are a Principal Software Engineering Interviewer and Technical Bar Raiser at premier tech firms.
Generate exactly ${count} realistic, insightful interview questions for a campus candidate.
Category: ${catObj.label}.
Difficulty Level: ${difficulty}.
${technology ? `Primary Technology/Skill Focus: ${technology}.` : ''}
${companyName ? `Target Company: ${companyName}.` : ''}
Focus on deep conceptual reasoning, practical code or scenario questions, and real interview discussions.`;

  const prompt = `${systemInstructions}

Format your response STRICTLY as a valid JSON array of objects with the following schema for each question, and NO other prose before or after:
[
  {
    "id": "q1",
    "question": "Full question statement here",
    "category": "${catObj.label}",
    "difficulty": "${difficulty}",
    "expectedConcepts": ["Key concept 1", "Key concept 2", "Key concept 3"],
    "suggestedAnswer": "Comprehensive ideal benchmark response explaining the approach and key points",
    "type": "${isHr ? 'hr' : category === 'database' ? 'sql' : category === 'dsa' ? 'dsa' : 'technical'}"
  }
]`;

  let accumulated = '';
  try {
    await streamAiChat(prompt, {
      onText: (chunk) => {
        accumulated += chunk;
      }
    });
  } catch (err) {
    console.warn(`[AI Interview] Live generation failed (${err.message}). Using curated question pool.`, err);
    return await getCuratedFallbackQuestions({ category, difficulty, count, technology });
  }

  const parsed = extractJsonFromAiResponse(accumulated);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed.map((q, idx) => ({
      id: q.id || `ai-q-${idx + 1}`,
      question: q.question || 'Interview Question',
      category: q.category || catObj.label,
      difficulty: q.difficulty || difficulty,
      expectedConcepts: Array.isArray(q.expectedConcepts) ? q.expectedConcepts : [],
      suggestedAnswer: q.suggestedAnswer || '',
      type: q.type || (isHr ? 'hr' : 'technical')
    }));
  }

  console.warn('AI question response was non-JSON. Falling back to curated question bank.');
  return await getCuratedFallbackQuestions({ category, difficulty, count, technology });
}

/**
 * Evaluates candidate answer via PlacePrep AI.
 */
export async function evaluateAiInterviewAnswer({
  question,
  studentAnswer,
  category = 'technical',
  difficulty = 'Intermediate'
}) {
  if (!studentAnswer || !studentAnswer.trim()) {
    throw new Error('Please enter or record an answer before submitting for AI evaluation.');
  }

  const isHr = category === 'hr' || question.type === 'hr';

  const evalPrompt = isHr
    ? `You are an expert HR and behavioral interviewer evaluating a candidate's answer.
Question: "${question.question}"
Candidate's Answer:
"${studentAnswer.trim()}"

Evaluate the candidate's answer based on communication, relevance, clarity, structure (STAR method), and overall answer quality rather than technical correctness.

Return your evaluation STRICTLY as a single valid JSON object with NO surrounding markdown or prose:
{
  "overallScore": <integer 0-100>,
  "communicationScore": <integer 0-100>,
  "relevanceScore": <integer 0-100>,
  "clarityScore": <integer 0-100>,
  "verdict": "<Outstanding | Polished & Strong | Good Attempt | Needs More Depth | Inadequate>",
  "technicalAccuracy": "Detailed assessment of the communication clarity, sincerity, and relevance of the response",
  "missingConcepts": ["Missing element 1 (e.g. quantifiable result, clear action steps)", "Missing element 2"],
  "strengths": ["Clear strength 1 observed in the response", "Clear strength 2"],
  "areasOfImprovement": ["Constructive suggestion 1 for higher impact", "Constructive suggestion 2"],
  "suggestedIdealAnswer": "Exemplary behavioral response demonstrating the STAR methodology"
}`
    : `You are a Senior Technical Bar Raiser evaluating a candidate's technical interview answer.
Question: "${question.question}"
Interview Category: ${category}
Difficulty: ${difficulty}
${question.expectedConcepts?.length ? `Expected Concepts: ${question.expectedConcepts.join(', ')}` : ''}
${question.suggestedAnswer ? `Benchmark Reference: ${question.suggestedAnswer}` : ''}

Candidate's Answer:
"${studentAnswer.trim()}"

Evaluate the candidate's answer for technical accuracy, conceptual correctness, depth, missing concepts, and edge case awareness.

Return your evaluation STRICTLY as a single valid JSON object with NO surrounding markdown or prose:
{
  "overallScore": <integer 0-100>,
  "correctnessScore": <integer 0-100>,
  "clarityScore": <integer 0-100>,
  "structureScore": <integer 0-100>,
  "verdict": "<Excellent | Strong Technical Grasp | Partial Understanding | Needs Significant Improvement | Inaccurate>",
  "technicalAccuracy": "Rigorous, constructive explanation of the technical accuracy of points made in the candidate's response",
  "missingConcepts": ["Specific technical concept 1 that was omitted", "Specific technical concept 2"],
  "strengths": ["Specific accurate insight or concept mentioned by the student"],
  "areasOfImprovement": ["Specific technical area or edge case to strengthen", "Actionable recommendation"],
  "suggestedIdealAnswer": "Clear, comprehensive ideal model answer covering all core technical mechanics"
}`;

  let accumulated = '';
  try {
    await streamAiChat(evalPrompt, {
      onText: (chunk) => {
        accumulated += chunk;
      }
    });
  } catch (err) {
    console.warn(`[AI Interview] Live evaluation failed (${err.message}). Using local rubric evaluation.`, err);
    return generateLocalEvaluation(question, studentAnswer, category);
  }

  const result = extractJsonFromAiResponse(accumulated);
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    const overall = Number(result.overallScore) || 50;
    return {
      overallScore: Math.min(100, Math.max(0, overall)),
      correctnessScore: Number(result.correctnessScore || result.communicationScore || overall),
      clarityScore: Number(result.clarityScore || result.relevanceScore || overall),
      structureScore: Number(result.structureScore || overall),
      verdict: result.verdict || (overall >= 75 ? 'Strong Answer' : 'Needs Practice'),
      technicalAccuracy: result.technicalAccuracy || 'The response was reviewed against standard industry expectations.',
      missingConcepts: Array.isArray(result.missingConcepts) ? result.missingConcepts : [],
      strengths: Array.isArray(result.strengths) ? result.strengths : ['Good effort attempting the problem.'],
      areasOfImprovement: Array.isArray(result.areasOfImprovement) ? result.areasOfImprovement : ['Elaborate with concrete examples.'],
      suggestedIdealAnswer: result.suggestedIdealAnswer || question.suggestedAnswer || 'Review the core documentation and reference solutions.'
    };
  }

  console.warn('AI evaluation response was non-JSON. Performing local rubric evaluation.');
  return generateLocalEvaluation(question, studentAnswer, category);
}

/**
 * Intelligent local rubric evaluation when AI model returns non-JSON or is offline.
 */
export function generateLocalEvaluation(question, studentAnswer, category = 'technical') {
  const isHr = category === 'hr' || question?.type === 'hr';
  const text = (studentAnswer || '').trim();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const expected = Array.isArray(question?.expectedConcepts) ? question.expectedConcepts : [];
  const textLower = text.toLowerCase();
  const matchedConcepts = expected.filter(c => textLower.includes(c.toLowerCase()));
  const missing = expected.filter(c => !textLower.includes(c.toLowerCase()));

  let baseScore = 65;
  if (wordCount > 40) baseScore += 10;
  if (wordCount > 90) baseScore += 8;
  if (expected.length > 0) {
    const ratio = matchedConcepts.length / expected.length;
    baseScore += Math.round(ratio * 15);
  } else {
    baseScore += 5;
  }
  const overallScore = Math.min(95, Math.max(50, baseScore));

  const strengths = [];
  if (matchedConcepts.length > 0) {
    strengths.push(`Accurately addressed key concepts: ${matchedConcepts.join(', ')}.`);
  } else {
    strengths.push('Direct response with clear communication flow.');
  }
  if (wordCount > 35) {
    strengths.push('Provided a thoughtful, structured answer.');
  }

  const improvements = [];
  if (missing.length > 0) {
    improvements.push(`Deepen discussion on: ${missing.slice(0, 2).join(', ')}.`);
  }
  if (isHr) {
    improvements.push('Strengthen answer structure by quantifying the positive business Result using STAR.');
  } else {
    improvements.push('Discuss algorithmic time/space complexity and potential production edge cases.');
  }

  return {
    overallScore,
    correctnessScore: isHr ? overallScore : Math.min(100, overallScore - 2),
    clarityScore: isHr ? Math.min(100, overallScore + 3) : overallScore,
    structureScore: Math.min(100, overallScore + 1),
    verdict: overallScore >= 75 ? 'Strong Answer' : 'Solid Attempt - Deepen Your Explanation',
    technicalAccuracy: isHr
      ? 'Relevant behavioral communication demonstrating adaptability, teamwork, and accountability.'
      : (matchedConcepts.length > 0
          ? `Accurately incorporates core mechanisms (${matchedConcepts.join(', ')}).`
          : 'Sound baseline understanding with room for deeper technical precision.'),
    missingConcepts: missing.length > 0 ? missing : ['Edge case handling', 'Performance trade-offs'],
    strengths,
    areasOfImprovement: improvements,
    suggestedIdealAnswer: question?.suggestedAnswer || 'Review standard reference answers.'
  };
}

/**
 * Fallback questions helper if the remote AI is temporarily unconfigured or offline.
 */
export async function getCuratedFallbackQuestions({ category = 'technical', difficulty = 'Intermediate', count = 3 }) {
  let all = [];
  try {
    const serverQs = await QuestionApi.getAll().catch(() => []);
    if (Array.isArray(serverQs) && serverQs.length > 0) {
      all = serverQs;
    }
  } catch {
    // fallback
  }

  if (all.length === 0) {
    all = getInterviewQuestions();
  }

  const catLower = category.toLowerCase();
  const matched = all.filter(q => {
    const qCat = (q.category || '').toLowerCase();
    const qRound = (q.round || '').toLowerCase();
    if (catLower === 'hr') return qRound === 'hr' || qCat.includes('hr') || qCat.includes('behavioral');
    if (catLower === 'database') return qCat.includes('dbms') || qCat.includes('sql') || qCat.includes('database');
    if (catLower === 'dsa') return qCat.includes('dsa') || qCat.includes('algorithm') || qCat.includes('data structure');
    return qRound === 'technical' || qCat.includes(catLower);
  });

  const pool = matched.length > 0 ? matched : all;
  return pool.slice(0, count).map((q, idx) => ({
    id: q.id || q.questionId || `fallback-q-${idx + 1}`,
    question: q.question || 'Interview Question',
    category: q.category || category,
    difficulty: q.difficulty || difficulty,
    expectedConcepts: Array.isArray(q.skills) ? q.skills : ['Core Foundations'],
    suggestedAnswer: q.suggestedAnswer || q.approach || 'Review standard reference answers.',
    type: catLower === 'hr' ? 'hr' : 'technical',
    isFallback: true
  }));
}

/**
 * Persists completed interview session to storage and backend.
 */
export async function saveCompletedInterviewSession(sessionData) {
  const user = getCurrentUser();
  const savedList = saveMockSession(sessionData);

  if (user) {
    try {
      await MockSessionApi.saveSession(sessionData);
    } catch (err) {
      console.warn('Backend mock session sync deferred to local cache:', err);
    }
  }

  return savedList;
}

/**
 * Loads interview history.
 */
export async function loadInterviewHistory() {
  const local = getMockSessions();
  try {
    const user = getCurrentUser();
    if (user) {
      const serverList = await MockSessionApi.getMySessions().catch(() => null);
      if (Array.isArray(serverList) && serverList.length > 0) {
        return serverList;
      }
    }
  } catch {
    // fallback
  }
  return local || [];
}
