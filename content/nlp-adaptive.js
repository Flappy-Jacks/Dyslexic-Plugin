import { pipeline } from '@xenova/transformers';

// Adaptive approach: Dynamically adjusts number of keywords based on document length
// Targets ~40-50% keyword coverage for optimal bionic reading

let _classifier = null;
const embeddingsCache = new Map();

async function loadClassifier() {
  if (_classifier) return _classifier;
  console.log("Loading embedding model for adaptive approach...");
  _classifier = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log("Model loaded!");
  return _classifier;
}

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
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

function generateCandidates(text, maxCandidates = 500, maxNgram = 4) {
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

  const arr = Array.from(counts.entries())
    .map(([candidate, count]) => ({ candidate, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, maxCandidates);

  return arr;
}

// Calculate adaptive keyword count to achieve 40-50% coverage
function calculateAdaptiveKeywordCount(text) {
  const wordCount = tokenize(text).length;
  
  // Target 45% of total words as keywords
  if (wordCount < 100) {
    // Very short: ~50% coverage
    return Math.floor(wordCount * 0.5);
  } else if (wordCount < 500) {
    // Short: ~45% coverage
    return Math.floor(wordCount * 0.45);
  } else if (wordCount < 2000) {
    // Medium: ~42% coverage
    return Math.floor(wordCount * 0.42);
  } else if (wordCount < 5000) {
    // Long: ~40% coverage
    return Math.floor(wordCount * 0.40);
  } else {
    // Very long: cap at reasonable number but maintain ~40% ratio
    // For 10k words, this gives 4000 keywords (40%)
    return Math.floor(wordCount * 0.40);
  }
}

// Chunk long documents into sections for better embeddings
function chunkDocument(text, chunkSize = 1000) {
  const words = tokenize(text);
  const chunks = [];
  
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    chunks.push(chunk);
  }
  
  return chunks;
}

async function getEmbeddingsForTexts(texts, batchSize = 16) {
  const classifier = await loadClassifier();
  const results = new Array(texts.length).fill(null);
  const toCompute = [];
  const toComputeIdx = [];

  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    if (embeddingsCache.has(t)) {
      results[i] = embeddingsCache.get(t);
    } else {
      toCompute.push(t);
      toComputeIdx.push(i);
    }
  }

  if (toCompute.length === 0) return results;

  const batches = chunkArray(toCompute, batchSize);
  let processed = 0;

  for (const b of batches) {
    const res = await classifier(b, { pooling: 'mean', normalize: true });

    const normalizeVec = (v) => {
      if (v == null) return null;
      if (ArrayBuffer.isView(v) && !(v instanceof DataView)) return Array.from(v);
      if (typeof v === 'object' && v.data && (Array.isArray(v.data) || ArrayBuffer.isView(v.data))) {
        return Array.from(v.data);
      }
      let out = v;
      while (Array.isArray(out) && out.length > 0 && Array.isArray(out[0])) {
        out = out[0];
      }
      if (Array.isArray(out) && out.length > 0 && typeof out[0] === 'number') return out;
      if (typeof out === 'number') return [out];
      return null;
    };

    const normalized = Array.isArray(res) ? res.map(normalizeVec) : [normalizeVec(res)];

    for (let i = 0; i < normalized.length; i++) {
      const vec = normalized[i];
      const globalIdx = toComputeIdx[processed + i];
      results[globalIdx] = vec;
      embeddingsCache.set(b[i], vec);
    }
    processed += normalized.length;
  }

  return results; 
}

function dotProduct(a, b) {
  let s = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) s += a[i] * b[i];
  return s;
}

export async function extractImportantWordsAdaptive(text, baseTopN = 30) {
  if (!text || !text.trim()) return [];
  
  try {
    // Calculate adaptive keyword count for 40-50% coverage
    const topN = calculateAdaptiveKeywordCount(text);
    const wordCount = tokenize(text).length;
    const coveragePercent = ((topN / wordCount) * 100).toFixed(1);
    
    console.log(`🔍 Adaptive approach: ${wordCount} words → extracting ${topN} keywords (${coveragePercent}% coverage)`);
    
    // For very long documents, use chunking
    let docEmbeddings;
    if (wordCount > 2000) {
      console.log("📚 Long document detected, using chunked approach...");
      const chunks = chunkDocument(text, 1000);
      docEmbeddings = await getEmbeddingsForTexts(chunks.map(c => c.substring(0, 500)));
    } else {
      const docEmbArr = await getEmbeddingsForTexts([text.substring(0, 2000)]);
      docEmbeddings = [docEmbArr[0]];
    }
    
    if (!docEmbeddings || docEmbeddings.every(e => !e)) {
      throw new Error('Failed to compute document embeddings');
    }

    // Generate more candidates to ensure we can reach target
    const maxCandidates = Math.min(topN * 2, 10000);
    const candidates = generateCandidates(text, maxCandidates);
    if (candidates.length === 0) return [];

    // Get embeddings for candidates
    const candidateStrings = candidates.map(c => c.candidate);
    const candEmbeddings = await getEmbeddingsForTexts(candidateStrings);

    // Score candidates
    const scored = [];
    for (let i = 0; i < candidates.length; i++) {
      const emb = candEmbeddings[i];
      if (!emb) continue;
      
      // Calculate average similarity to all document chunks
      let avgSimilarity = 0;
      for (const docEmb of docEmbeddings) {
        if (docEmb) avgSimilarity += dotProduct(docEmb, emb);
      }
      avgSimilarity /= docEmbeddings.filter(e => e).length;
      
      const freq = candidates[i].count || 1;
      const words = candidateStrings[i].split(' ').length;
      const lengthBonus = Math.log(1 + words) * 0.05;
      const freqBonus = Math.log(1 + freq) * 0.18;
      
      const score = avgSimilarity + freqBonus + lengthBonus;
      scored.push({ candidate: candidateStrings[i], score, semantic: avgSimilarity, freq });
    }

    // Sort and deduplicate
    scored.sort((a, b) => b.score - a.score);
    const seen = new Set();
    const out = [];
    
    for (const s of scored) {
      let skip = false;
      for (const chosen of out) {
        if (chosen.includes(s.candidate) && chosen.split(' ').length > s.candidate.split(' ').length) {
          skip = true;
          break;
        }
        if (s.candidate.includes(chosen) && s.candidate.split(' ').length > chosen.split(' ').length) {
          const chosenScore = scored.find(x => x.candidate === chosen)?.score ?? 0;
          if (s.score > chosenScore * 0.95) {
            const idx = out.indexOf(chosen);
            if (idx !== -1) out.splice(idx, 1);
          } else {
            skip = true;
            break;
          }
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
    console.warn('Adaptive extraction failed, falling back to frequency:', err);
    const topN = calculateAdaptiveKeywordCount(text);
    const tokens = tokenize(text).filter(t => t.length > 3 && !STOP_WORDS.has(t));
    const freq = new Map();
    for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
    const fallback = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, topN).map(([k]) => k);
    return fallback;
  }
}

export { loadClassifier };

export function clearEmbeddingCache() {
  embeddingsCache.clear();
}