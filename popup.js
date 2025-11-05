const toggleSwitch = document.getElementById("toggleSwitch");
const focusLength = document.getElementById("focusLength");
const focusLengthValue = document.getElementById("focusLengthValue");
const darkModeToggle = document.getElementById("darkModeToggle");
const darkModeToggle2 = document.getElementById("darkModeToggle2");

const fontSearch = document.getElementById("chooseFont");
const fontChoices = document.getElementById("fontChoices");
const fonts = [
  "Default", "Arial", "Verdana", "Helvetica", "Times New Roman", "Courier New",
  "Georgia", "Palatino", "Garamond", "Bookman", "Comic Sans MS",
  "Trebuchet MS", "Arial Black", "Impact", "Lucida Console", "Tahoma"
];
const fontColorSearch = document.getElementById("chooseFontColor");
const fontColorChoices = document.getElementById("fontColorChoices");
const fontColors = [ "Default", "Blue", "Green", "Red"];
const fontSizeSearch = document.getElementById("chooseFontSize");
const fontSizeSlider = document.getElementById("slideFontSize");
const wordSpacingSearch = document.getElementById("chooseWordSpacing");
const letterSpacingSearch = document.getElementById("chooseLetterSpacing");
const bgColors = [ "Default", "Blue", "Green", "Red"];
const bgColorSearch = document.getElementById("chooseBgColor");
const bgColorChoices = document.getElementById("bgColorChoices");
const lineSpacingSearch = document.getElementById("chooseLineSpacing");

const resetSettings = document.getElementById("resetSettings");
const compactButton = document.getElementById("compact");
const openButton = document.getElementById("open");
const relaxedButton = document.getElementById("relaxed");

const wordSpacingSlider = document.getElementById("slideWordSpacing");
const letterSpacingSlider = document.getElementById("slideLetterSpacing");
const lineSpacingSlider = document.getElementById("slideLineSpacing");

let s = {
  isEnabled: false,
  focusLength: 2,
  isDarkMode: false,
  isDarkMode2: false,
  selectedFont: "",
  selectedFontColor: "",
  selectedFontSize: "",
  selectedWordSpacing: "",
  selectedLetterSpacing: "",
  selectedBgColor: "",
  selectedLineSpacing: "",
};

chrome.storage.sync.get(Object.keys(s), (saved) => {
  Object.assign(s, saved);

  toggleSwitch.checked = s.isEnabled;
  focusLength.value = s.focusLength || 2;
  focusLengthValue.textContent = focusLength.value;
  darkModeToggle.checked = s.isDarkMode;
  darkModeToggle2.checked = s.isDarkMode2;
  fontSearch.value = s.selectedFont
  fontColorSearch.value = s.selectedFontColor;
  fontSizeSearch.value = s.selectedFontSize;
  fontSizeSlider.value = s.selectedFontSize;
  wordSpacingSearch.value = s.selectedWordSpacing;
  letterSpacingSearch.value = s.selectedLetterSpacing;
  letterSpacingSlider.value = s.selectedLetterSpacing;
  bgColorSearch.value = s.selectedBgColor;
  lineSpacingSearch.value = s.selectedLineSpacing;
  lineSpacingSlider.value  = s.selectedLineSpacing;
});

lineSpacingSearch.addEventListener("input", () => {
  const lineSpacing = lineSpacingSearch.value;
  lineSpacingSlider.value = lineSpacing;
  chrome.storage.sync.set({ selectedLineSpacing: lineSpacing });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "changeLineSpacing", size: lineSpacing });
  });
});

lineSpacingSlider.addEventListener("input", () => {
  const lineSpacing = lineSpacingSlider.value;
  lineSpacingSearch.value = lineSpacing;
  chrome.storage.sync.set({ selectedLineSpacing: lineSpacing });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "changeLineSpacing", size: lineSpacing });
  });
});


letterSpacingSearch.addEventListener("input", () => {
  const letterSpacing = letterSpacingSearch.value;
  letterSpacingSlider.value = letterSpacing
  chrome.storage.sync.set({ selectedLetterSpacing: letterSpacing });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "changeLetterSpacing", size: letterSpacing });
  });
});

letterSpacingSlider.addEventListener("input", () => {
  const letterSpacing = letterSpacingSlider.value;
  letterSpacingSearch.value = letterSpacing
  chrome.storage.sync.set({ selectedLetterSpacing: letterSpacing });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "changeLetterSpacing", size: letterSpacing });
  });
});

wordSpacingSearch.addEventListener("input", () => {
  const wordSpacing = wordSpacingSearch.value;
  wordSpacingSlider.value = wordSpacing;
  chrome.storage.sync.set({ selectedWordSpacing: wordSpacing });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "changeWordSpacing", size: wordSpacing });
  });
});


wordSpacingSlider.addEventListener("input", () => {
  const wordSpacing = wordSpacingSlider.value;
  wordSpacingSearch.value = wordSpacing;
  chrome.storage.sync.set({ selectedFontSize: wordSpacing });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "changeWordSpacing", size: wordSpacing });
  });
});

fontSizeSearch.addEventListener("input", () => {
  const fontSize = fontSizeSearch.value;
  fontSizeSlider.value = fontSize;
  chrome.storage.sync.set({ selectedFontSize: fontSize });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "changeFontSize", size: fontSize });
  });
});

fontSizeSlider.addEventListener("input", () => {
  const fontSize = fontSizeSlider.value;
  fontSizeSearch.value = fontSize;
  chrome.storage.sync.set({ selectedFontSize: fontSize });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "changeFontSize", size: fontSize });
  });
});

function updateSettings() {
  chrome.storage.sync.get(Object.keys(s), (saved) => {
    Object.assign(s, saved);
    fontSizeSearch.value = s.selectedFontSize;
    fontSizeSlider.value = s.selectedFontSize;
    fontSearch.value = s.selectedFont;
    wordSpacingSearch.value = s.selectedWordSpacing;
    lineSpacingSearch.value = s.selectedLineSpacing;
    letterSpacingSearch.value = s.selectedLetterSpacing;
  });
}

openButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "applyOpen" }, () => { setTimeout(updateSettings, 150); });
  });
});

relaxedButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "applyRelaxed" }, () => { setTimeout(updateSettings, 150); });
  });
});

compactButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "applyCompact" }, () => { setTimeout(updateSettings, 150); });
  });
});

function populateBgColorDropdown(filter = "") {
  bgColorChoices.innerHTML = "";
  const filteredColors = bgColors.filter(bgColor => bgColor.toLowerCase().includes(filter.toLocaleLowerCase()));
  filteredColors.forEach(bgColor => {
    const option = document.createElement("div");
    option.textContent = bgColor;
    option.style.cursor = "pointer";
    option.onclick = () => selectBgColor(bgColor);
    bgColorChoices.appendChild(option)
  });
}

function selectBgColor(bgColor) {
  bgColorSearch.value = bgColor;
  bgColorChoices.innerHTML = "";
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "changeBgColor",
      color: bgColor
    });
  });
  chrome.storage.sync.set({ selectedBgColor: bgColor });
}

bgColorSearch.addEventListener("input", () => { populateBgColorDropdown(bgColorSearch.value); });
bgColorSearch.addEventListener("focus", () => { populateBgColorDropdown(bgColorSearch.value); });
bgColorSearch.addEventListener("blur", () => { setTimeout(() => bgColorChoices.innerHTML = "", 200); });

function populateFontColorDropdown(filter = "") {
  fontColorChoices.innerHTML = "";
  const filteredColors = fontColors.filter(fontColor => fontColor.toLowerCase().includes(filter.toLocaleLowerCase()));
  filteredColors.forEach(fontColor => {
    const option = document.createElement("div");
    option.textContent = fontColor;
    option.style.cursor = "pointer";
    option.onclick = () => selectFontColor(fontColor);
    fontColorChoices.appendChild(option)
  });
}

function selectFontColor(fontColor) {
  fontColorSearch.value = fontColor;
  fontColorChoices.innerHTML = "";
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "changeFontColor",
      color: fontColor
    });
  });
  chrome.storage.sync.set({ selectedFontColor: fontColor });
}

fontColorSearch.addEventListener("input", () => { populateFontColorDropdown(fontColorSearch.value); });
fontColorSearch.addEventListener("focus", () => { populateFontColorDropdown(fontColorSearch.value); });
fontColorSearch.addEventListener("blur", () => { setTimeout(() => fontColorChoices.innerHTML = "", 200); });

function populateFontDropdown(filter = "") {
  fontChoices.innerHTML = "";
  const filteredChoices = fonts.filter(font => font.toLowerCase().includes(filter.toLocaleLowerCase()));
  filteredChoices.forEach(font => {
    const option = document.createElement("div");
    option.textContent = font;
    option.style.cursor = "pointer";
    option.onclick = () => selectFont(font);
    fontChoices.appendChild(option)
  });
}

function selectFont(font) {
  fontSearch.value = font;
  fontChoices.innerHTML = "";
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "changeFont",
      fontFamily: font
    });
  });
  chrome.storage.sync.set({ selectedFont: font });
}

fontSearch.addEventListener("input", () => { populateFontDropdown(fontSearch.value); });
fontSearch.addEventListener("focus", () => { populateFontDropdown(fontSearch.value); });
fontSearch.addEventListener("blur", () => { setTimeout(() => fontChoices.innerHTML = "", 200); });

toggleSwitch.addEventListener("change", () => {
  const isEnabled = toggleSwitch.checked;
  chrome.storage.sync.set({ isEnabled });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: isEnabled ? "activateBionicReading" : "deactivateBionicReading",
    });
  });
});

focusLength.addEventListener("input", () => {
  const value = focusLength.value;
  focusLengthValue.textContent = value;
  chrome.storage.sync.set({ focusLength: value });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "updateFocusLength", focusLength: value });
  });
});

darkModeToggle.addEventListener("change", () => {
  const isDarkMode = darkModeToggle.checked;
  chrome.storage.sync.set({ isDarkMode });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleDarkMode", isDarkMode });
  });
});

darkModeToggle2.addEventListener("change", () => {
  const isDarkMode2 = darkModeToggle2.checked;
  chrome.storage.sync.set({ isDarkMode2 });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleDarkMode2", isDarkMode2 });
  });
});

resetSettings.addEventListener("click", () => {
  chrome.storage.sync.clear(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "resetSettings" });
    });
    window.location.reload();
  })
})