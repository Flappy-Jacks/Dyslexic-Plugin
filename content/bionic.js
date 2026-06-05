// A safety lock to prevent Svelte from triggering multiple simultaneous loops!
let isProcessingBionic = false;

// ==========================================
// 1. SELECTIVE BIONIC READING (Bold half)
// ==========================================
// ==========================================
// 1. SELECTIVE BIONIC READING (Bold half)
// ==========================================
export function activateBionicReading(keywords, isDarkMode = false, isDarkMode2 = false) {
    // Abort if keywords aren't ready yet
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) return;
    
    // Clean up first to prevent duplicates
    deactivateBionicReading(); 
    
    // 🚨 FIX: Inject the CSS so dark mode and bolding styles actually apply!
    injectCSS(isDarkMode, isDarkMode2);

    const textNodes = getTextNodes(document.body);
    const safeKeywords = keywords.filter(kw => kw.length > 0).sort((a, b) => b.length - a.length);
    const keywordRegex = new RegExp(`\\b(${safeKeywords.join("|")})\\b`, "gi");

    textNodes.forEach((node) => {
    const text = node.textContent;
    keywordRegex.lastIndex = 0;
    const newText = text.replace(keywordRegex, (match) => {
        const mid = Math.ceil(match.length / 2);
        return `<span class="bionic-keyword"><span class="bionic-primary">${match.slice(0, mid)}</span>${match.slice(mid)}</span>`;
    });
    if (newText === text) return; // skip DOM surgery if nothing changed
    const span = document.createElement("span");
    span.innerHTML = newText;
    node.parentNode.replaceChild(span, node);
    });

    console.log("✨ Selective Bionic Reading applied!");
}

export function deactivateBionicReading() {
    let bionicSpans = document.querySelectorAll(".bionic-keyword");
    bionicSpans.forEach((span) => {
        span.outerHTML = span.textContent; 
    });
    document.body.normalize(); 
}

export async function updateBionicReading(keywords, isDarkMode, isDarkMode2) {
    if (isProcessingBionic) return;
    await deactivateBionicReading();
    await activateBionicReading(keywords, isDarkMode, isDarkMode2);
}   

export function deactivateColorizeKeywords() {
    let colorizeSpans = document.querySelectorAll(".colorize-keyword");
    colorizeSpans.forEach((span) => {
        span.outerHTML = span.textContent;
    });
    // 3. Normalize keywords too!
    document.body.normalize();
}

// export function applyBionicReading(textNode, focusLength) {
//     const text = textNode.nodeValue;
//     const words = text.split(/(\s+)/); // split with white space as the delimiter. Keep the delimiter

//     // for each word do the following
//     const bionicWords = words.map((word) => {
//         if (/^\s+$/.test(word)) { return word; } // if the current "word" is just the delimiter or whitespace, keep it as is
//         else {
//             let bionicWord = "";
//             const characters = word.split(''); // split actual words into an array of characters

//             // for each character, check how far into the word we are and apply bionic CSS based on index
//             characters.forEach((char, index) => {
//                 // current letter is cleanly before focuslength
//                 if (index === 0 || (index < focusLength && word.length > focusLength)) {
//                     bionicWord += `<span class="bionic-primary">${char}</span>`;
                
//                 // current letter is within the focuslengh or transition letters TODO: remove this?
//                 //} else if (index === Math.floor(word.length / 2)) {
//                 //    bionicWord += `<span class="bionic-secondary">${char}</span>`;

//                 // current letter is after focuslength. keep as is
//                 } else {
//                     bionicWord += char;
//                 }
//             });
//         return bionicWord;
//         }
//     });

//     return bionicWords.join('');
// }

export function applyBionicReading(textNode, focusLength) {
    const text = textNode.nodeValue;
    const words = text.split(/(\s+)/); // split with white space as the delimiter. Keep the delimiter

    // for each word do the following
    const bionicWords = words.map((word) => {
        // if the current "word" is just the delimiter or whitespace, keep it as is
        if (/^\s+$/.test(word)) { 
            return word; 
        } else {
            // Calculate half the word length, rounding up
            const splitIndex = Math.ceil(word.length / 2);
            
            // Split the word into the bolded first half and normal second half
            const boldPart = word.substring(0, splitIndex);
            const normalPart = word.substring(splitIndex);
            
            // Wrap them in your bionic spans
            return `<span class="bionic-primary">${boldPart}</span>${normalPart}`;
        }
    });

    return bionicWords.join("");
}

export function getTextNodes(element) {
    let textNodes = [];
    let node;
    let walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: function (node) {
        if (
        !/^(script|style|noscript)$/i.test(node.parentNode.nodeName) &&
        node.textContent.trim().length > 0
        ) {
        return NodeFilter.FILTER_ACCEPT;
        }
    },
    }, false);

    while (node = walk.nextNode()) {
    textNodes.push(node);
    }

    return textNodes;
}

export function injectCSS(isDarkMode, isDarkMode2) {
    // 1. Clean up existing bionic styles to prevent flooding the <head>
    const existingStyle = document.getElementById("bionic-styles");
    if (existingStyle) existingStyle.remove();

    const primaryColor = isDarkMode ? '#B0C4DE' : 'inherit';
    const secondaryColor = isDarkMode ? '#A0D6B4' : 'grey';

    const primaryColor2 = isDarkMode2 ? '#FFA07A' : 'inherit'; 
    const secondaryColor2 = isDarkMode2 ? '#FFB6C1' : 'grey'; 

    // 2. Add !important so website CSS cannot override your extension
    const styles = `
        .bionic-primary {
            font-weight: bold !important;
            color: ${isDarkMode2 ? primaryColor2 : primaryColor} !important;
        }

        .bionic-secondary {
            font-weight: bold !important;
            color: ${isDarkMode2 ? secondaryColor2 : secondaryColor} !important;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = "bionic-styles"; // Tag it for easy cleanup
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
}

// export async function highlightKeywordsBionically(keywords, focusLength = 2) {
//   if (!keywords || keywords.length === 0) {
//     console.warn("⚠️ No keywords provided for bionic highlighting.");
//     return;
//   }

//   // Don't re-import, these are already in this module
//   injectCSS(false, false); // Use current dark mode settings
//   const textNodes = getTextNodes(document.body);

//   // Create regex that matches whole words only
//   const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");

//   textNodes.forEach((node) => {
//     const text = node.textContent;
//     if (!keywordRegex.test(text)) return;

//     // Reset regex for replace
//     keywordRegex.lastIndex = 0;
    
//     const newText = text.replace(keywordRegex, (match) => {
//       // Apply bionic formatting to just this keyword
//       const tempNode = document.createTextNode(match);
//       return applyBionicReading(tempNode, focusLength);
//     });

//     const span = document.createElement("span");
//     span.innerHTML = newText;
//     node.parentNode.replaceChild(span, node);
//   });

//   console.log("✨ Bionic Reading applied to extracted keywords!");
// }

export async function highlightKeywordsBionically(keywords, focusLength = 2) {
    if (!keywords || keywords.length === 0) {
        console.warn("⚠️ No keywords provided for bionic highlighting.");
        return;
    }

    // Performance cleanup: Remove duplicate style tags from flooding the head element
    const existingStyle = document.getElementById("bionic-style-tag");
    if (existingStyle) existingStyle.remove();

    // Inject styles and tag it with an ID so we can clean it up later
    injectCSS(false, false);
    if (document.head.lastChild && document.head.lastChild.nodeName === "STYLE") {
        document.head.lastChild.id = "bionic-style-tag";
    }

    const textNodes = getTextNodes(document.body);

    // FIX 1: Use the optimized shared boundary group structure: \b(word1|word2)\b
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    const pattern = sortedKeywords.map(escapeRegex).join("|");
    const keywordRegex = new RegExp(`\\b(${pattern})\\b`, "gi");

    let highlightedCount = 0;
    textNodes.forEach((node) => {
        const text = node.textContent;
        
        keywordRegex.lastIndex = 0;
        if (!keywordRegex.test(text)) return;

        keywordRegex.lastIndex = 0;
        
        // FIX 2: Pure string-slicing. No temporary DOM nodes or array allocations inside the loop.
        const newText = text.replace(keywordRegex, (match) => {
            highlightedCount++;
            
            // Fast mathematical string splitting based on word length
            const splitIndex = Math.ceil(match.length / 2);
            const boldPart = match.substring(0, splitIndex);
            const normalPart = match.substring(splitIndex);
            
            return `<span class="bionic-primary">${boldPart}</span>${normalPart}`;
        });

        const span = document.createElement("span");
        span.innerHTML = newText;
        node.parentNode.replaceChild(span, node);
    });

    console.log(`✨ Bionic Reading applied to ${highlightedCount} keyword instances safely!`);
}

export async function colorizeKeywords(keywords, focusLength = 2, color = "#C70000") {
  if (!keywords || keywords.length === 0) {
    console.warn("⚠️ No keywords provided for bionic highlighting.");
    return;
  }

  // Don't re-import, these are already in this module
  const existingStyle = document.getElementById("colorize-style");
  if (existingStyle) existingStyle.remove();
  
  injectCSS(false, false); // Use current dark mode settings
  const styleElement = document.createElement('style');
  styleElement.id = "colorize-style";
  styleElement.textContent = `
    .colorize-keyword {
      font-weight: bold;
      color: ${color} !important;
    }
  `;
  document.head.appendChild(styleElement);

  const textNodes = getTextNodes(document.body);
  const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");

  textNodes.forEach((node) => {
    const text = node.textContent;
    if (!keywordRegex.test(text)) return;

    // Reset regex for replace
    keywordRegex.lastIndex = 0;

    const newText = text.replace(keywordRegex, (match) => {
      return `<span class="colorize-keyword">${match}</span>`;
    });

    const span = document.createElement("span");
    span.innerHTML = newText;
    node.parentNode.replaceChild(span, node);
  });

  console.log("✨ Colorized extracted keywords!");
}

// NEW: A lightweight function to update color instantly
export function setKeywordStyle(color) {
  const styleElement = document.getElementById("colorize-style");
  if (styleElement) {
    styleElement.textContent = `
      .colorize-keyword {
        font-weight: bold;
        color: ${color} !important;
      }
    `;
  }
}