const toggleSwitch = document.getElementById("toggleSwitch");
const focusLength = document.getElementById("focusLength");
const focusLengthValue = document.getElementById("focusLengthValue");
const darkModeToggle = document.getElementById("darkModeToggle");
const darkModeToggle2 = document.getElementById("darkModeToggle2");
// const testToggle = document.getElementById("testToggle");

let s = {
  isEnabled: false,
  focusLength: 2,
  isDarkMode: false,
  isDarkMode2: false,
  // testToggle: false,
};

chrome.storage.sync.get(Object.keys(s), (saved) => {
  Object.assign(s, saved);

  toggleSwitch.checked = s.isEnabled;
  focusLength.value = s.focusLength || 2;
  focusLengthValue.textContent = focusLength.value;
  darkModeToggle.checked = s.isDarkMode;
  darkModeToggle2.checked = s.isDarkMode2;
  // testToggle.checked = s.testToggle
});

// testToggle.addEventListener("change", () => {
//   const isTestToggle = testToggle.checked;
//   chrome.storage.sync.set({ testToggle: isTestToggle })

//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     chrome.tabs.sendMessage(tabs[0].id, { action: "testToggle", testToggle });
//   });
// });

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