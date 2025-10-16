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