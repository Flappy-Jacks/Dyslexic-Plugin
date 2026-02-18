import { pipeline } from '@xenova/transformers';

// --- CONFIGURATION ---
const TIMEOUT_MS = 10000; // 10 seconds max
const DESIRED_COVERAGE = 0.15; // 2.5% of words

let extractorPipeline = null;

// Self-contained Stop Words (No external dependency)
const BLOCK_LIST = new Set([
  'the','and','that','have','for','not','with','you','this','but','from','they','what','there','their','will','would','which','when','were','your','about','can','said','each','she','how','an','its','then','them','these','some','her','make','like','him','into','time','has','look', 'was', 'two','more','write','go','see','number','no','way','could','people','my','than','first','water','been','call','who','oil','its','now','find','long','down','day','did','get','come','made','may','part','also'
]);

// 1. Calculate how many words to highlight
function getIdealKeywordCount(wordCount) {
  let ideal = Math.floor(wordCount * DESIRED_COVERAGE);
  return Math.min(Math.max(ideal, 3), 100); // Clamp between 3 and 20
}

// 2. Fast TF-IDF Filter
// nlp-optimized.js

// ... (Your imports and BLOCK_LIST stay the same) ...

// 2. Fast TF-IDF Filter (Enhanced for Proper Nouns)
function quickTfidfCandidates(text) {
  // A. Split text into words, preserving case
  // Matches words with 3+ letters
  const rawWords = text.match(/\b[A-Za-z]{3,}\b/g) || [];
  
  const freq = {};
  const caseMap = {}; // Keeps track of the "best" casing (e.g., prefers "Apple" over "apple")

  rawWords.forEach((w, index) => {
    const lower = w.toLowerCase();
    
    // Skip stop words
    if (BLOCK_LIST.has(lower)) return;

    // B. Detect Proper Nouns
    // Logic: If it starts with Capital, AND previous word didn't end with a dot (start of sentence check)
    // (This is a simplified check, but fast enough for this use case)
    const isCapitalized = /^[A-Z]/.test(w);
    
    // Calculate Score: Base 1, Boost to 2 if it looks like a Proper Noun
    let score = isCapitalized ? 2 : 1;

    // Accumulate Score
    freq[lower] = (freq[lower] || 0) + score;

    // C. Store the "Display Version" of the word
    // If we find a Capitalized version, remember it as the preferred display
    if (isCapitalized || !caseMap[lower]) {
      caseMap[lower] = w;
    }
  });

  // Return top 200 most frequent/important words
  // We sort by score (freq), but return the "Nice Looking" string from caseMap
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1]) 
    .slice(0, 200)                  
    .map(entry => caseMap[entry[0]]); // Return "Google" instead of "google"
}

// ... (The rest of your file, extractOptimizedKeywords, stays the same) ...

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