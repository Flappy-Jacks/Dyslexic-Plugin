export function getTextNodes(element) {
    let textNodes = [];
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