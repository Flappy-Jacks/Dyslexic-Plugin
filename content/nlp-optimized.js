import { pipeline } from '@xenova/transformers';

// --- CONFIGURATION ---
const TIMEOUT_MS = 10000; // 3 seconds max
const DESIRED_COVERAGE = 0.025; // 2.5% of words

let extractorPipeline = null;

// Self-contained Stop Words (No external dependency)
const BLOCK_LIST = new Set([
  'the','and','that','have','for','not','with','you','this','but','from','they','what','there','their','will','would','which','when','were','your','about','can','said','each','she','how','an','its','then','them','these','some','her','make','like','him','into','time','has','look', 'was', 'two','more','write','go','see','number','no','way','could','people','my','than','first','water','been','call','who','oil','its','now','find','long','down','day','did','get','come','made','may','part','also'
]);

// 1. Calculate how many words to highlight
function getIdealKeywordCount(wordCount) {
  let ideal = Math.floor(wordCount * DESIRED_COVERAGE);
  return Math.min(Math.max(ideal, 3), 20); // Clamp between 3 and 20
}

// 2. Fast TF-IDF Filter
function quickTfidfCandidates(text) {
  // Simple tokenizer: lowercase and find words with 3+ letters
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const freq = {};
  
  words.forEach(w => {
    // Ensure we don't use 's' or any confusing variable name
    if(!BLOCK_LIST.has(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  });

  // Return top 50 most frequent words
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1]) 
    .slice(0, 50)                
    .map(entry => entry[0]);     
}

// 3. MAIN EXPORT
export async function extractOptimizedKeywords(text) {
  // A. Fast Path: Get candidates immediately
  const wordCount = (text.match(/\b\w+\b/g) || []).length;
  const targetCount = getIdealKeywordCount(wordCount);
  const candidates = quickTfidfCandidates(text);
  
  // If text is short, return fast results immediately
  if (wordCount < 150) {
    return candidates.slice(0, targetCount);
  }

  // B. AI Path (With Timeout)
  try {
    const aiPromise = (async () => {
      if (!extractorPipeline) {
        // Load the lightweight model
        extractorPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      }
      
      const context = text.slice(0, 800); 
      const contextEmbedding = (await extractorPipeline(context, { pooling: 'mean', normalize: true })).data;

      let scoredCandidates = [];
      
      // Loop carefully through candidates
      for (const candidateWord of candidates) {
        const wordEmbedding = (await extractorPipeline(candidateWord, { pooling: 'mean', normalize: true })).data;
        
        // Calculate Score (Dot Product)
        let score = 0;
        for (let i = 0; i < wordEmbedding.length; i++) {
          score += wordEmbedding[i] * contextEmbedding[i];
        }
        
        scoredCandidates.push({ word: candidateWord, score: score });
      }

      scoredCandidates.sort((a, b) => b.score - a.score);
      return scoredCandidates.slice(0, targetCount).map(item => item.word);
    })();

    // Timeout Race
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve('TIMEOUT'), TIMEOUT_MS);
    });

    const result = await Promise.race([aiPromise, timeoutPromise]);

    if (result === 'TIMEOUT') {
      console.warn("⚠️ AI timed out, using fast keywords.");
      return candidates.slice(0, targetCount);
    }

    return result;

  } catch (e) {
    console.error("❌ NLP Error (Fallback to simple):", e);
    // Return safe fallback
    return candidates.slice(0, targetCount);
  }
}