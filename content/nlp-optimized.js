import nlp from 'compromise';

// --- CONFIGURATION ---
const DESIRED_COVERAGE = 0.15; // Target highlighting ~15% of words

function getIdealKeywordCount(wordCount) {
  let ideal = Math.floor(wordCount * DESIRED_COVERAGE);
  return Math.min(Math.max(ideal, 5), 80); // Clamp between 5 and 80 words
}

/**
 * Lightweight Offline NLP Keyword Extractor
 * Uses Compromise.js to grammatically parse the text and extract key phrases.
 */
export async function extractOptimizedKeywords(text) {
  if (!text || text.trim().length === 0) return [];

  const totalWordCount = (text.match(/\b\w+\b/g) || []).length;
  const targetCount = getIdealKeywordCount(totalWordCount);

  // 1. Run text through the Compromise NLP parser
  const doc = nlp(text);

  // 2. Grab nouns (entities, places, things) sorted automatically by frequency
  let entities = doc.nouns().out('freq');

  // 3. Clean and collect words longer than 3 characters
  let keywords = entities
    .filter(item => item.normal.length > 3) 
    .slice(0, targetCount)
    .map(item => item.normal); 

  // 4. Fallback: If short on keywords, grab top action verbs to fill the quota
  if (keywords.length < targetCount) {
    const verbs = doc.verbs().out('freq')
      .filter(item => item.normal.length > 3)
      .slice(0, targetCount - keywords.length)
      .map(item => item.normal);
      
    keywords = [...keywords, ...verbs];
  }

  // 5. Clean up any weird characters and return
  return keywords.map(word => word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,""));
}