// src/services/scoringService.js
const Message = require('../models/Message');
const Debate = require('../models/Debate');

/**
 * Simple tokenizer (lowercase, split non-words) and remove common stopwords.
 * Keep tiny and fast - replace by semantic similarity later.
 */
const STOPWORDS = new Set([
  'the','is','in','and','to','a','of','for','on','that','with','as','are','it','this','be','by','or','an','from'
]);

function tokenize(text) {
  if (!text) return [];
  return text.toLowerCase()
    .split(/\W+/)
    .filter(t => t && !STOPWORDS.has(t));
}

/**
 * Heuristics:
 * - Relevance (0-35): keyword overlap between topic name and messages by participant.
 * - Strength (0-40): based on message length, presence of "evidence" words (study, data, research, statistics),
 *                    and use of connectors ("therefore", "because", "thus").
 * - Engagement (0-25): counts turns contributed and conciseness/time (we approximate using message count and avg length).
 *
 * These are *heuristic* and transparent. Replace with model-based scoring for better accuracy.
 */

const EVIDENCE_WORDS = ['study','data','research','statistics','survey','evidence','report','finding','analysis'];
const CONNECTOR_WORDS = ['therefore','because','thus','hence','however','moreover','furthermore','consequently'];

function scoreRelevanceForTexts(topicTokens, texts) {
  if (texts.length === 0) return 0;
  const allTokens = texts.flatMap(t => tokenize(t));
  if (allTokens.length === 0) return 0;
  const topicSet = new Set(topicTokens);
  const overlap = allTokens.filter(t => topicSet.has(t)).length;
  const norm = Math.min(1, overlap / Math.max(1, topicTokens.length * 2)); // normalize loosely
  return Math.round(norm * 35);
}

function scoreStrengthForTexts(texts) {
  if (texts.length === 0) return 0;
  let score = 0;
  let totalLen = 0;
  texts.forEach(t => {
    const words = tokenize(t);
    totalLen += words.length;
    // length contribution: up to 20 points (normalized)
    const lenScore = Math.min(20, words.length / 3); // longer -> more up to cap
    score += lenScore;

    // evidence words + connectors boost
    const lw = words.map(w => w.toLowerCase());
    const evidenceCount = EVIDENCE_WORDS.reduce((acc, w) => acc + (lw.includes(w) ? 1 : 0), 0);
    const connectorCount = CONNECTOR_WORDS.reduce((acc, w) => acc + (lw.includes(w) ? 1 : 0), 0);
    score += Math.min(10, evidenceCount * 3); // up to +10
    score += Math.min(10, connectorCount * 2); // up to +10
  });

  // Normalize to 0-40
  const avgScore = score / Math.max(1, texts.length);
  const normalized = Math.min(40, Math.round((avgScore / 40) * 40));
  // Another fallback: if totalLen is tiny, penalize
  if (totalLen < 5 * texts.length) {
    return Math.round(normalized * 0.8);
  }
  return normalized;
}

function scoreEngagementForTexts(texts) {
  // Engagement is about contribution frequency and concision.
  if (texts.length === 0) return 0;
  const turns = texts.length;
  const avgLen = texts.reduce((s,t)=>s+tokenize(t).length,0) / turns;
  // reward balanced - not too short, not too long
  let lenScore = 0;
  if (avgLen < 5) lenScore = 5;           // short
  else if (avgLen < 20) lenScore = 20;    // sweet spot
  else lenScore = 15;                     // long but engaged

  // more turns -> more engagement (cap)
  const turnScore = Math.min(10, turns * 2); // up to 10
  const total = Math.round((lenScore/20)*15 + turnScore); // map to ~0-25
  return Math.min(25, total);
}

/**
 * Score a debate by grouping messages by sender role.
 * Returns an object: { breakdown: [{participantRole, relevance, strength, engagement, total}], summary, meta }
 */
async function scoreDebate(debateId) {
  // load debate & messages
  const debate = await Debate.findById(debateId).populate('topic', 'name').lean();
  if (!debate) throw new Error('Debate not found');

  const topicName = debate.topic ? debate.topic.name || '' : '';
  const topicTokens = tokenize(topicName);

  const messages = await Message.find({ debate: debateId }).sort({ createdAt: 1 }).lean();

  // group texts by senderType; if senderType is 'user' and has senderUser, role string remains 'user'
  const groups = {};
  for (const m of messages) {
    const role = m.senderType || (m.senderUser ? 'user' : 'system');
    groups[role] = groups[role] || [];
    groups[role].push(m.text || '');
  }

  const breakdown = [];
  for (const part of debate.participants) {
    const role = part.role || (part.isAi ? (part.aiName || 'ai') : 'user');
    const texts = groups[role] || groups[part.role] || [];
    const relevance = scoreRelevanceForTexts(topicTokens, texts);
    const strength  = scoreStrengthForTexts(texts);
    const engagement = scoreEngagementForTexts(texts);
    const total = relevance + strength + engagement;
    breakdown.push({
      participantRole: role,
      relevance,
      strength,
      engagement,
      total
    });
  }

  // summary averages
  const n = breakdown.length || 1;
  const avgRelevance = Math.round(breakdown.reduce((s,b)=>s+b.relevance,0)/n);
  const avgStrength  = Math.round(breakdown.reduce((s,b)=>s+b.strength,0)/n);
  const avgEngagement= Math.round(breakdown.reduce((s,b)=>s+b.engagement,0)/n);
  const avgTotal = Math.round(breakdown.reduce((s,b)=>s+b.total,0)/n);

  return {
    breakdown,
    summary: { avgRelevance, avgStrength, avgEngagement, avgTotal },
    meta: { topicName, messageCount: messages.length, scoredAt: new Date() }
  };
}

module.exports = { scoreDebate };