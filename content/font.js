const GOOGLE_FONTS = [
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Oswald',
    'Source Sans Pro',
    'Raleway',
    'PT Sans',
    'Merriweather',
    'Nunito',
    'Poppins',
    'Playfair Display',
    'Ubuntu',
    'Mukta',
    'Work Sans'
];

function changeFont(fontFamily) {
    const existing = document.getElementById("newFont");
    if (existing) { existing.remove(); }
    if (fontFamily === "Default") return;

    if (GOOGLE_FONTS.includes(fontFamily)) {
        importGoogleFont(fontFamily);
    }

    const style = document.createElement("style");
    style.id = "newFont";
    style.textContent = `
        :is(*, body, div, p, span, a, h1, h2, h3, h4, h5, h6, li, td, th, article, section) {
            font-family: "${fontFamily}", sans-serif !important;
        }
    `;
    document.head.appendChild(style);
}

function changeFontColor(fontColor) {
    const existing = document.getElementById("newFontColor");
    if (existing) { existing.remove(); }
    if (fontColor === "Default") return;
    const style = document.createElement("style");
    style.id = "newFontColor";
    style.textContent = `
        body, body * {
        color: ${fontColor} !important;
        }
    `;
    document.head.appendChild(style);
}

function changeFontSize(fontSize) {
    const existing = document.getElementById("newFontSize");
    if (existing) { existing.remove(); }
    if (fontSize === "0") return;
    const style = document.createElement("style");
    style.id = "newFontSize";
    style.textContent = `
        body, body * {
        font-size: ${fontSize}px !important;
        }
    `;
    document.head.appendChild(style);
}

function changeWordSpacing(spacingSize, unit = "em") {
    const existing = document.getElementById("newWordSpacing");
    if (existing) { existing.remove(); }
    if (spacingSize === "0") return;
    const style = document.createElement("style");
    style.id = "newWordSpacing";
    style.textContent = `
        body, body * {
        word-spacing: ${spacingSize}${unit} !important;
        }
    `;
    document.head.appendChild(style);
}

function changeLetterSpacing(spacingSize, unit = "em") {
    const existing = document.getElementById("newLetterSpacing");
    if (existing) { existing.remove(); }
    if (spacingSize === "0") return;
    const style = document.createElement("style");
    style.id = "newLetterSpacing";
    style.textContent = `
        body, body * {
        letter-spacing: ${spacingSize}${unit} !important;
        }
    `;
    document.head.appendChild(style);
}

function changeLineSpacing(spacingSize, unit = "em") {
    const existing = document.getElementById("newLineSpacing");
    if (existing) { existing.remove(); }
    if (spacingSize === "0") return;
    const style = document.createElement("style");
    style.id = "newLineSpacing";
    style.textContent = `
        body, body * {
        line-height: ${spacingSize}${unit} !important;
        }
    `;
    document.head.appendChild(style);
}

function changeBgColor(bgColor) {
    const existing = document.getElementById("bgOverlay");
    if (existing) { existing.remove(); }
    if (bgColor === "Default") return;

    const overlay = document.createElement("div");
    overlay.id = "bgOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "999";
    overlay.style.mixBlendMode = "multiply";
    overlay.style.backgroundColor = `${bgColor}`;
    overlay.style.opacity = "0.3";
    document.body.appendChild(overlay);
}

function removeCustomStyles() {
    const styleIds = ["newFont", "newFontColor", "newFontSize", "newWordSpacing", "newLetterSpacing", "newLineSpacing"];
    styleIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    });
}

function applyCompact(settings) {
    // changeLetterSpacing();
    changeWordSpacing(0.1, "em");
    changeLineSpacing(1.4, "em");
    changeFont("Georgia");
    changeFontSize(15.8);

    settings.selectedFont = "Georgia";
    settings.selectedFontSize = "15.8";
    settings.selectedWordSpacing = "0.1";
    settings.selectedLetterSpacing = "";
    settings.selectedLineSpacing = "1.4";
    chrome.storage.sync.set(settings);
}

function applyOpen(settings) {
    changeLetterSpacing(0.02, "em");
    changeWordSpacing(0.2, "em");
    changeLineSpacing(2.2, "em");
    changeFont("Merriweather");
    changeFontSize(15.8);

    settings.selectedFont = "Merriweather";
    settings.selectedFontSize = "15.8";
    settings.selectedWordSpacing = "0.2";
    settings.selectedLetterSpacing = "0.02";
    settings.selectedLineSpacing = "2.2";
    chrome.storage.sync.set(settings);
}

function applyRelaxed(settings) {
    changeLetterSpacing(0.04, "em");
    changeWordSpacing(0.3, "em");
    changeLineSpacing(4.5, "em");
    changeFont("Poppins");
    changeFontSize(14.1);

    settings.selectedFont = "Poppins";
    settings.selectedFontSize = "14.1";
    settings.selectedWordSpacing = "0.3";
    settings.selectedLetterSpacing = "0.04";
    settings.selectedLineSpacing = "4.5";
    chrome.storage.sync.set(settings);
}

function importGoogleFont(fontName) {
    const fontId = `google-font-${fontName.replace(/\s+/g, '-')}`;

    if (document.getElementById(fontId)) {
        return;
    }

    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700&display=swap`;

    document.head.appendChild(link);


}