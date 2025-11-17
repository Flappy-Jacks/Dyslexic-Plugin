export function activateBionicReading(isDarkMode, isDarkMode2, focusLength) {
    injectCSS(isDarkMode, isDarkMode2);
    let textNodes = getTextNodes(document.body);
    textNodes.forEach((node) => {
        let bionicText = applyBionicReading(node, focusLength);
        let newNode = document.createElement("span");
        newNode.innerHTML = bionicText;
        node.parentNode.replaceChild(newNode, node);
    });
}

export function deactivateBionicReading() {
    let bionicSpans = document.querySelectorAll(".bionic-primary, .bionic-secondary");
    bionicSpans.forEach((span) => {
        span.outerHTML = span.textContent;
    });
}

export function updateBionicReading(isDarkMode, isDarkMode2, focusLength) {
    deactivateBionicReading();
    activateBionicReading(isDarkMode, isDarkMode2, focusLength);
}

export function applyBionicReading(textNode, focusLength) {
    const text = textNode.nodeValue;
    const words = text.split(/(\s+)/); // split with white space as the delimiter. Keep the delimiter

    // for each word do the following
    const bionicWords = words.map((word) => {
        if (/^\s+$/.test(word)) { return word; } // if the current "word" is just the delimiter or whitespace, keep it as is
        else {
            let bionicWord = "";
            const characters = word.split(''); // split actual words into an array of characters

            // for each character, check how far into the word we are and apply bionic CSS based on index
            characters.forEach((char, index) => {
                // current letter is cleanly before focuslength
                if (index === 0 || (index < focusLength && word.length > focusLength)) {
                    bionicWord += `<span class="bionic-primary">${char}</span>`;
                
                // current letter is within the focuslengh or transition letters TODO: remove this?
                //} else if (index === Math.floor(word.length / 2)) {
                //    bionicWord += `<span class="bionic-secondary">${char}</span>`;

                // current letter is after focuslength. keep as is
                } else {
                    bionicWord += char;
                }
            });
        return bionicWord;
        }
    });

    return bionicWords.join('');
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
    const primaryColor = isDarkMode ? '#B0C4DE' : 'inherit';
    const secondaryColor = isDarkMode ? '#A0D6B4' : 'grey';

    const primaryColor2 = isDarkMode2 ? '#FFA07A' : 'inherit'; // New alternate color
    const secondaryColor2 = isDarkMode2 ? '#FFB6C1' : 'grey'; // New alternate color

    const styles = `
        .bionic-primary {
            font-weight: bold;
            color: ${isDarkMode2 ? primaryColor2 : primaryColor};
        }

        .bionic-secondary {
            font-weight: bold;
            color: ${isDarkMode2 ? secondaryColor2 : secondaryColor};
        }
    `;

    const styleElement = document.createElement('style');
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

    injectCSS(false, false);
    const textNodes = getTextNodes(document.body);

    // Escape special regex characters
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Sort by length (longest first) to match longer phrases before shorter ones
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    
    // Create regex pattern
    const pattern = sortedKeywords.map(kw => {
        const escaped = escapeRegex(kw);
        return `\\b${escaped}\\b`;
    }).join("|");
    
    const keywordRegex = new RegExp(pattern, "gi");

    let highlightedCount = 0;
    textNodes.forEach((node) => {
        const text = node.textContent;
        
        keywordRegex.lastIndex = 0;
        if (!keywordRegex.test(text)) return;

        keywordRegex.lastIndex = 0;
        
        const newText = text.replace(keywordRegex, (match) => {
            highlightedCount++;
            const tempNode = document.createTextNode(match);
            return applyBionicReading(tempNode, focusLength);
        });

        const span = document.createElement("span");
        span.innerHTML = newText;
        node.parentNode.replaceChild(span, node);
    });

    console.log(`✨ Bionic Reading applied to ${highlightedCount} keyword instances!`);
}

export async function colorizeKeywords(keywords, focusLength = 2) {
  if (!keywords || keywords.length === 0) {
    console.warn("⚠️ No keywords provided for bionic highlighting.");
    return;
  }

  // Don't re-import, these are already in this module
  injectCSS(false, false); // Use current dark mode settings
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .bionic-keyword {
      font-weight: bold;
      color: #C70000 !important; /* bright red */
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
      return `<span class="bionic-keyword">${match}</span>`;
    });

    const span = document.createElement("span");
    span.innerHTML = newText;
    node.parentNode.replaceChild(span, node);
  });

  console.log("✨ Colorized extracted keywords!");
}