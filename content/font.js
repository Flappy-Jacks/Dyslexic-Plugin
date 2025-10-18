function changeFont(fontFamily) {
    const existing = document.getElementById("newFont");
    if (existing) { existing.remove(); }
    if (fontFamily === "Default") return;
    const style = document.createElement("style");
    style.id = "newFont";
    style.textContent = `
        body, body * {
        font-family: ${fontFamily} !important;
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

function changeWordSpacing(spacingSize) {
    const existing = document.getElementById("newWordSpacing");
    if (existing) { existing.remove(); }
    if (spacingSize === "0") return;
    const style = document.createElement("style");
    style.id = "newWordSpacing";
    style.textContent = `
        body, body * {
        word-spacing: ${spacingSize}px !important;
        }
    `;
    document.head.appendChild(style);
}

function changeLetterSpacing(spacingSize) {
    const existing = document.getElementById("newLetterSpacing");
    if (existing) { existing.remove(); }
    if (spacingSize === "0") return;
    const style = document.createElement("style");
    style.id = "newLetterSpacing";
    style.textContent = `
        body, body * {
        letter-spacing: ${spacingSize}px !important;
        }
    `;
    document.head.appendChild(style);
}