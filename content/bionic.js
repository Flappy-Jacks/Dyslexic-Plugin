import { getTextNodes, injectCSS } from "./utils";

// Applies the bionic reading
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
