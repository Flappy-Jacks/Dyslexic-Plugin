import { activateBionicReading, deactivateBionicReading, updateBionicReading } from "./bionic";

let isEnabled = false;
let focusLength = 2;
let isDarkMode = false;
let isDarkMode2 = false;

// Loads user saved prefrences/settings if available
chrome.storage.sync.get(["isEnabled", "focusLength", "isDarkMode", "isDarkMode2"], ({ isEnabled: savedIsEnabled, focusLength: savedFocusLength, isDarkMode: savedIsDarkMode, isDarkMode2: savedIsDarkMode2 }) => {
    isEnabled = savedIsEnabled;
    focusLength = savedFocusLength || 2;
    isDarkMode = savedIsDarkMode || false;
    isDarkMode2 = savedIsDarkMode2 || false;
    if (isEnabled) {
      activateBionicReading(isDarkMode, isDarkMode2, focusLength);
    }
});

// handles different requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "activateBionicReading") {
      isEnabled = true;
      activateBionicReading(isDarkMode, isDarkMode2, focusLength);
    } else if (request.action === "deactivateBionicReading") {
      isEnabled = false;
      deactivateBionicReading();
    } else if (request.action === "updateFocusLength") {
      focusLength = parseInt(request.focusLength, 10);
      if (isEnabled) {
        updateBionicReading(isDarkMode, isDarkMode2, focusLength);
      }
    } else if (request.action === "toggleDarkMode") {
      isDarkMode = request.isDarkMode;
      updateBionicReading(isDarkMode, isDarkMode2, focusLength);
    } else if (request.action === "toggleDarkMode2") {
      isDarkMode2 = request.isDarkMode2;
      updateBionicReading(isDarkMode, isDarkMode2, focusLength);
    }
});







