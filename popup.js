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

let s = {
  isEnabled: false,
  focusLength: 2,
  isDarkMode: false,
  isDarkMode2: false,
  selectedFont: ""
};

chrome.storage.sync.get(Object.keys(s), (saved) => {
  Object.assign(s, saved);

  toggleSwitch.checked = s.isEnabled;
  focusLength.value = s.focusLength || 2;
  focusLengthValue.textContent = focusLength.value;
  darkModeToggle.checked = s.isDarkMode;
  darkModeToggle2.checked = s.isDarkMode2;
  fontSearch.value = s.selectedFont
});

function populateDropdown(filter = "") {
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

fontSearch.addEventListener("input", () => { populateDropdown(fontSearch.value); });
fontSearch.addEventListener("focus", () => { populateDropdown(fontSearch.value); });
fontSearch.addEventListener("blur", () => { setTimeout(() => fontChoices.innerHTML = "", 200); });

// On load, set input to saved font
chrome.storage.sync.get("selectedFont", (data) => {
  if (data.selectedFont) {
    fontSearch.value = data.selectedFont;
  }
});

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