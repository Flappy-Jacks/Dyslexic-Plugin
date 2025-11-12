import { pipeline } from '@xenova/transformers';

let _classifier = null;
const embeddingsCache = new Map();

async function loadClassifier() {
  if (_classifier) return _classifier;
  console.log("Loading TinyBERT model...");
  _classifier = await pipeline('feature-extraction', 'Xenova/bert-base-uncased');
  console.log("Model loaded!");
  return _classifier;
}

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const STOP_WORDS = new Set([
  'the','and','that','have','for','not','with','you','this','but','from','they','what','there','their','will','would','which','when','were','your','about','can','said','each','she','how','an','its','then','them','these','some','her','make','like','him','into','time','has','look','two','more','write','go','see','number','no','way','could','people','my','than','first','water','been','call','who','oil','its','now','find','long','down','day','did','get','come','made','may','part'
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
  const slice = tokens.slice(start, end);
  return slice;
}

// removes stop words and short words
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

/**
 * Generate candidate phrases (1..4-grams) with frequency counts
 * Returns array of { candidate: string, count: number }
 */
function generateCandidates(text, maxCandidates = 400, maxNgram = 4) {
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

  // convert to array of objects and sort by frequency (descending)
  const arr = Array.from(counts.entries())
    .map(([candidate, count]) => ({ candidate, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, maxCandidates);

  return arr;
}

async function getEmbeddingsForTexts(texts, batchSize = 16) {
  // returns array of vectors aligned to texts
  const classifier = await loadClassifier();

  const results = new Array(texts.length).fill(null);
  const toCompute = [];
  const toComputeIdx = [];

  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    const key = t;
    if (embeddingsCache.has(key)) {
      results[i] = embeddingsCache.get(key);
    } else {
      toCompute.push(t);
      toComputeIdx.push(i);
    }
  }

  if (toCompute.length === 0) return results;

  const batches = chunkArray(toCompute, batchSize);
  let processed = 0;

  for (const b of batches) {
    // use pooling + normalize so returned vectors are unit length — dot product = cosine
    const res = await classifier(b, { pooling: 'mean', normalize: true });

    // Helper to convert various runtime return shapes into a plain array of numbers
    const normalizeVec = (v) => {
      if (v == null) return null;
      // Typed arrays
      if (ArrayBuffer.isView(v) && !(v instanceof DataView)) {
        return Array.from(v);
      }

      // If the runtime returns an object with a `data` field (some wrappers), use it
      if (typeof v === 'object' && v.data && (Array.isArray(v.data) || ArrayBuffer.isView(v.data))) {
        return Array.from(v.data);
      }

      // Unwrap nested arrays until we reach a numeric array or non-array
      let out = v;
      while (Array.isArray(out) && out.length > 0 && Array.isArray(out[0])) {
        out = out[0];
      }

      if (Array.isArray(out) && out.length > 0 && typeof out[0] === 'number') return out;

      // If it's a single number or unexpected shape, try to coerce
      if (typeof out === 'number') return [out];

      return null;
    };

    // Normalize result into an array of vectors
    const normalized = Array.isArray(res) ? res.map(normalizeVec) : [normalizeVec(res)];

    for (let i = 0; i < normalized.length; i++) {
      const vec = normalized[i];
      const globalIdx = toComputeIdx[processed + i];
      results[globalIdx] = vec;
      // cache using original text as key
      embeddingsCache.set(b[i], vec);
    }
    processed += normalized.length;
  }

  return results;
}

function dotProduct(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export async function extractImportantWords(text, topN = 10) {
  if (!text || !text.trim()) return [];
  try {
    // create document embedding
    const docEmbArr = await getEmbeddingsForTexts([text]);
    const docEmb = docEmbArr[0];
    if (!docEmb) throw new Error('Failed to compute document embedding');

    // generate candidate phrases (unigrams + bigrams) limited to a reasonable size
    const candidates = generateCandidates(text, 200);
    if (candidates.length === 0) return [];

    // compute embeddings for candidates (uses cache where possible)
    const candidateStrings = candidates.map(c => c.candidate);
    const candEmbeddings = await getEmbeddingsForTexts(candidateStrings);

    // score candidates by cosine similarity (dot product since vectors are normalized)
    // combine semantic score with a frequency and length bonus to prefer meaningful phrases
    const scored = [];
    for (let i = 0; i < candidates.length; i++) {
      const emb = candEmbeddings[i];
      if (!emb) continue;
      const semantic = dotProduct(docEmb, emb);
      const freq = candidates[i].count || 1;
      const words = candidateStrings[i].split(' ').length;
      const lengthBonus = Math.log(1 + words) * 0.05; // small boost for multi-word
      const score = semantic + 0.18 * Math.log(1 + freq) + lengthBonus;
      scored.push({ candidate: candidateStrings[i], score, semantic, freq });
    }

    // sort and return topN unique candidates
    scored.sort((a, b) => b.score - a.score);
    const seen = new Set();
    const out = [];
    for (const s of scored) {
      // dedupe: if a chosen phrase is a substring of an already chosen longer phrase, skip it
      let skip = false;
      for (const chosen of out) {
        if (chosen.includes(s.candidate) && chosen.split(' ').length > s.candidate.split(' ').length) {
          skip = true;
          break;
        }
        if (s.candidate.includes(chosen) && s.candidate.split(' ').length > chosen.split(' ').length) {
          // prefer the longer candidate if it has similar score; if not, keep shorter
          const chosenScore = scored.find(x => x.candidate === chosen)?.score ?? 0;
          if (s.score > chosenScore * 0.95) {
            // replace the shorter chosen with this longer one
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

    return out;
  } catch (err) {
    console.warn('Embedding-based extraction failed, falling back to frequency:', err);
    // Fallback: simple frequency-based top words (mirrors previous behavior but improves ordering)
    const tokens = tokenize(text).filter(t => t.length > 3 && !STOP_WORDS.has(t));
    const freq = new Map();
    for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
    const fallback = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, topN).map(([k]) => k);
    return fallback;
  }
}

export { loadClassifier };

// useful helper for debugging/testing in console
export function clearEmbeddingCache() {
  embeddingsCache.clear();
}

