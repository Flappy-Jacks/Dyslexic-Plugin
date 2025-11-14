// TF-IDF approach - fast, no model loading, scales well with document length
// Works by finding words that are frequent in this document but rare in general

const STOP_WORDS = new Set([
  'the','and','that','have','for','not','with','you','this','but','from','they','what','there','their','will','would','which','when','were','your','about','can','said','each','she','how','an','its','then','them','these','some','her','make','like','him','into','time','has','look','two','more','write','go','see','number','no','way','could','people','my','than','first','water','been','call','who','oil','its','now','find','long','down','day','did','get','come','made','may','part','also','other','should','any','most','very','such','even','much','own','too','does','good','new','being','where','well','back','through','just','before','think','take','after','work','over','same','our','because','only','between','three','another','while','last','might','us','great','little','year','years','still','must','big','few','different','home','right','put','old','under','never','place','however','found','every','both','important','want','does','give','away','many','show','small','large','off','end','why','asked','need','land','men','change','went','differ','around','form','during','high','kind','really','something','though','without','again','second','later','until','got','since','example','once','against','however','upon','quite','several','always','soon','often','almost','together','far','mean','especially','rather','less','enough','quite','lot','either','yet','already','whether','toward','seems','across','perhaps','toward','along','further','below','among','beyond','simply','therefore','thus','hence','indeed','moreover','furthermore','nevertheless','nonetheless','meanwhile','whereas','whereby','wherein'
]);

function tokenize(text) {
  return ('' + text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function normalizeCandidateTokens(tokens) {
  let start = 0;
  let end = tokens.length;
  while (start < end && STOP_WORDS.has(tokens[start])) start++;
  while (end > start && STOP_WORDS.has(tokens[end - 1])) end--;
  return tokens.slice(start, end);
}

function isGoodCandidate(tokens) {
  if (!tokens || tokens.length === 0) return false;
  let contentWord = false;
  for (const t of tokens) {
    if (t.length > 3 && !STOP_WORDS.has(t)) contentWord = true;
  }
  if (!contentWord) return false;
  const totalChars = tokens.join('').length;
  return totalChars > 3;
}

function generateCandidates(text, maxNgram = 3) {
  const tokens = tokenize(text);
  const counts = new Map();

  for (let n = 1; n <= maxNgram; n++) {
    for (let i = 0; i + n <= tokens.length; i++) {
      const slice = tokens.slice(i, i + n);
      const norm = normalizeCandidateTokens(slice);
      if (!isGoodCandidate(norm)) continue;
      const cand = norm.join(' ');
      counts.set(cand, (counts.get(cand) || 0) + 1);
    }
  }

  return counts;
}

// Simple IDF estimates based on common English
// Lower score = more common word (should be downweighted)
const IDF_ESTIMATES = {
  // Very common words (low IDF)
  'information': 2.5, 'system': 2.5, 'time': 2.3, 'data': 2.6,
  'user': 2.7, 'process': 2.8, 'result': 2.7, 'example': 2.4,
  'method': 2.8, 'number': 2.5, 'different': 2.3,
  
  // Default for unknown words (assumed rare)
  '__default__': 4.0
};

function getIDF(word) {
  return IDF_ESTIMATES[word] || IDF_ESTIMATES['__default__'];
}

function calculateTFIDF(termFreq, docLength, term) {
  const tf = termFreq / docLength;
  const idf = getIDF(term);
  return tf * idf;
}

export async function extractImportantWords(text, topN = 30) {
  if (!text || !text.trim()) return [];
  
  try {
    console.log("🔍 Using TF-IDF approach for keyword extraction...");
    
    // Extract structure-aware content with weights
    const structuredContent = extractStructuredContent(text);
    
    // Generate candidates with their frequencies
    const candidates = generateCandidates(structuredContent.weightedText, 3);
    const docLength = tokenize(structuredContent.weightedText).length;
    
    // Calculate TF-IDF scores
    const scored = [];
    for (const [candidate, freq] of candidates.entries()) {
      const words = candidate.split(' ');
      const avgIDF = words.reduce((sum, w) => sum + getIDF(w), 0) / words.length;
      
      // TF-IDF score
      const tfidf = calculateTFIDF(freq, docLength, candidate);
      
      // Position bonus (if found in important sections)
      const positionBonus = structuredContent.importantPhrases.has(candidate) ? 0.5 : 0;
      
      // Length bonus for multi-word phrases
      const lengthBonus = Math.log(1 + words.length) * 0.3;
      
      // Frequency bonus (but not too much)
      const freqBonus = Math.log(1 + freq) * 0.2;
      
      const finalScore = tfidf + positionBonus + lengthBonus + freqBonus;
      
      scored.push({ 
        candidate, 
        score: finalScore, 
        freq, 
        tfidf 
      });
    }
    
    // Sort by score and deduplicate
    scored.sort((a, b) => b.score - a.score);
    
    const seen = new Set();
    const out = [];
    
    for (const s of scored) {
      // Skip if substring of already chosen longer phrase
      let skip = false;
      for (const chosen of out) {
        if (chosen.includes(s.candidate) && chosen.split(' ').length > s.candidate.split(' ').length) {
          skip = true;
          break;
        }
      }
      if (skip) continue;
      
      if (!seen.has(s.candidate)) {
        seen.add(s.candidate);
        out.push(s.candidate);
        if (out.length >= topN) break;
      }
    }
    
    console.log(`✅ Extracted ${out.length} keywords using TF-IDF`);
    return out;
    
  } catch (err) {
    console.error("TF-IDF extraction failed:", err);
    // Fallback to simple frequency
    const tokens = tokenize(text).filter(t => t.length > 3 && !STOP_WORDS.has(t));
    const freq = new Map();
    for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([k]) => k);
  }
}

// Extract content with awareness of document structure
function extractStructuredContent(text) {
  const lines = text.split('\n').filter(l => l.trim());
  let weightedText = '';
  const importantPhrases = new Set();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Detect headings (short lines, often all caps or title case)
    const isHeading = line.length < 100 && 
                     (line === line.toUpperCase() || 
                      /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*/.test(line));
    
    // First few lines are often important (intro/summary)
    const isEarly = i < Math.min(5, lines.length * 0.1);
    
    if (isHeading) {
      // Weight headings heavily (repeat 3x)
      weightedText += ` ${line} ${line} ${line} `;
      tokenize(line).forEach(t => importantPhrases.add(t));
    } else if (isEarly) {
      // Weight early content (repeat 2x)
      weightedText += ` ${line} ${line} `;
    } else {
      weightedText += ` ${line} `;
    }
  }
  
  return { weightedText, importantPhrases };
}

// No-op functions for API compatibility
export async function loadClassifier() {
  console.log("✓ TF-IDF approach (no model loading needed)");
  return null;
}

export function clearEmbeddingCache() {
  console.log("✓ TF-IDF approach (no cache to clear)");
}