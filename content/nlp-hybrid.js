import { pipeline } from '@xenova/transformers';

// Hybrid approach: Combines fast TF-IDF pre-filtering with semantic embeddings
// Best of both worlds - handles long documents and maintains semantic quality

let _classifier = null;
const embeddingsCache = new Map();

async function loadClassifier() {
  if (_classifier) return _classifier;
  console.log("Loading embedding model for hybrid approach...");
  _classifier = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log("Model loaded!");
  return _classifier;
}

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

// Extract key sections for focused semantic analysis
function extractKeySections(text, maxSections = 10) {
  const lines = text.split('\n').filter(l => l.trim());
  const sections = [];
  
  // First paragraph (often summary)
  const firstParaLines = Math.min(5, lines.length);
  const firstPara = lines.slice(0, firstParaLines).join(' ');
  if (firstPara.length > 50) sections.push(firstPara.substring(0, 1000));
  
  // Extract potential headings and their following content
  for (let i = 0; i < lines.length && sections.length < maxSections; i++) {
    const line = lines[i].trim();
    if (line.length < 100 && line.length > 10) {
      const isHeading = line === line.toUpperCase() || 
                       /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*/.test(line);
      if (isHeading && i + 1 < lines.length) {
        const section = lines.slice(i, Math.min(i + 3, lines.length)).join(' ');
        sections.push(section.substring(0, 500));
      }
    }
  }
  
  // Sample middle section
  if (lines.length > 10) {
    const mid = Math.floor(lines.length / 2);
    const midSection = lines.slice(mid, Math.min(mid + 3, lines.length)).join(' ');
    sections.push(midSection.substring(0, 500));
  }
  
  return sections.filter(s => s.length > 50).slice(0, maxSections);
}

async function getEmbedding(text) {
  const limitedText = text.substring(0, 500);
  
  if (embeddingsCache.has(limitedText)) {
    return embeddingsCache.get(limitedText);
  }
  
  const classifier = await loadClassifier();
  const res = await classifier(limitedText, { pooling: 'mean', normalize: true });
  
  // Normalize embedding vector - same as nlp.js
  let vec = res;
  if (ArrayBuffer.isView(vec) && !(vec instanceof DataView)) {
    vec = Array.from(vec);
  }
  if (typeof vec === 'object' && vec.data && (Array.isArray(vec.data) || ArrayBuffer.isView(vec.data))) {
    vec = Array.from(vec.data);
  }
  let out = vec;
  while (Array.isArray(out) && out.length > 0 && Array.isArray(out[0])) {
    out = out[0];
  }
  if (Array.isArray(out) && out.length > 0 && typeof out[0] === 'number') vec = out;
  if (typeof out === 'number') vec = [out];
  
  embeddingsCache.set(limitedText, vec);
  return vec;
}

function dotProduct(a, b) {
  let s = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) s += a[i] * b[i];
  return s;
}

// Calculate keyword count for 40-50% coverage
function calculateKeywordCount(text) {
  const wordCount = tokenize(text).length;
  
  if (wordCount < 100) return Math.floor(wordCount * 0.5);
  if (wordCount < 500) return Math.floor(wordCount * 0.45);
  if (wordCount < 2000) return Math.floor(wordCount * 0.42);
  if (wordCount < 5000) return Math.floor(wordCount * 0.40);
  return Math.floor(wordCount * 0.40);
}

export async function extractImportantWordsHybrid(text, baseTopN = 30) {
  if (!text || !text.trim()) return [];
  
  try {
    const topN = calculateKeywordCount(text);
    const wordCount = tokenize(text).length;
    const coveragePercent = ((topN / wordCount) * 100).toFixed(1);
    
    console.log(`🔍 Hybrid: ${wordCount} words → extracting ${topN} keywords (${coveragePercent}% coverage)`);
    
    // Step 1: Fast TF-IDF pre-filtering
    const candidates = generateCandidates(text, 3);
    const docLength = wordCount;
    
    const tfScored = [];
    for (const [candidate, freq] of candidates.entries()) {
      const tf = freq / docLength;
      const words = candidate.split(' ');
      const lengthBonus = Math.log(1 + words.length) * 0.2;
      const score = tf * 100 + lengthBonus;
      tfScored.push({ candidate, score, freq });
    }
    
    tfScored.sort((a, b) => b.score - a.score);
    const topCandidates = tfScored.slice(0, Math.min(100, tfScored.length)).map(c => c.candidate);
    
    console.log(`📊 Pre-filtered to ${topCandidates.length} candidates`);
    
    // Step 2: Extract key sections
    const keySections = extractKeySections(text, 8);
    console.log(`📑 Analyzing ${keySections.length} key sections`);
    
    // Get embeddings for sections
    const sectionEmbeddings = [];
    for (const section of keySections) {
      try {
        const emb = await getEmbedding(section);
        if (emb) sectionEmbeddings.push(emb);
      } catch (err) {
        console.warn('Failed to get section embedding:', err);
      }
    }
    
    if (sectionEmbeddings.length === 0) {
      throw new Error('Failed to compute any section embeddings');
    }
    
    // Step 3: Score candidates semantically
    const finalScored = [];
    
    for (let i = 0; i < topCandidates.length; i++) {
      try {
        const candEmb = await getEmbedding(topCandidates[i]);
        if (!candEmb) continue;
        
        let avgSimilarity = 0;
        for (const secEmb of sectionEmbeddings) {
          avgSimilarity += dotProduct(candEmb, secEmb);
        }
        avgSimilarity /= sectionEmbeddings.length;
        
        const tfScore = tfScored.find(t => t.candidate === topCandidates[i])?.score || 0;
        const freq = tfScored.find(t => t.candidate === topCandidates[i])?.freq || 1;
        const freqBonus = Math.log(1 + freq) * 0.15;
        
        const finalScore = avgSimilarity * 2 + tfScore * 0.01 + freqBonus;
        
        finalScored.push({
          candidate: topCandidates[i],
          score: finalScore,
          semantic: avgSimilarity,
          tf: tfScore
        });
      } catch (err) {
        console.warn(`Failed to process candidate ${topCandidates[i]}:`, err);
      }
    }
    
    // Step 4: Sort and deduplicate
    finalScored.sort((a, b) => b.score - a.score);
    
    const seen = new Set();
    const out = [];
    
    for (const s of finalScored) {
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
    
    const actualCoverage = ((out.length / wordCount) * 100).toFixed(1);
    console.log(`✅ Extracted ${out.length} keywords (${actualCoverage}% coverage)`);
    return out;
    
  } catch (err) {
    console.error("Hybrid extraction failed:", err);
    const topN = calculateKeywordCount(text);
    const tokens = tokenize(text).filter(t => t.length > 3 && !STOP_WORDS.has(t));
    const freq = new Map();
    for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([k]) => k);
  }
}

export { loadClassifier };

export function clearEmbeddingCache() {
  embeddingsCache.clear();
}