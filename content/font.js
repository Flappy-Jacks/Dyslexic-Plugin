export function changeFont(fontFamily) {
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

export function changeFontColor(fontColor) {
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