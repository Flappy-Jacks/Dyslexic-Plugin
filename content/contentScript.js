import { activateBionicReading, deactivateBionicReading, updateBionicReading } from "./bionic";


let settings = {
  isEnabled: false,
  focusLength: 2,
  isDarkMode: false,
  isDarkMode2: false,
  // testToggle: false,
}

// Loads user saved prefrences/settings if available
chrome.storage.sync.get(Object.keys(settings), (saved) => {
    Object.assign(settings, saved)
    if (settings.isEnabled) {
      activateBionicReading(settings.isDarkMode, settings.isDarkMode2, settings.focusLength);
    }
});

// handles different requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    // case "testToggle":
    //   settings.isEnabled = true;
    //   break;

    case "activateBionicReading":
      settings.isEnabled = true;
      activateBionicReading(settings.isDarkMode, settings.isDarkMode2, settings.focusLength);
      break;

    case "deactivateBionicReading":
      settings.isEnabled = false;
      deactivateBionicReading();
      break;

    case "updateFocusLength":
      settings.focusLength = parseInt(request.focusLength, 10);
      if (settings.isEnabled) { updateBionicReading(settings.isDarkMode, settings.isDarkMode2, settings.focusLength) };
      break;

    case "toggleDarkMode":
      settings.isDarkMode = request.isDarkMode;
      updateBionicReading(settings.isDarkMode, settings.isDarkMode2, settings.focusLength);
      break;

    case "toggleDarkMode2":
      settings.isDarkMode2 = request.isDarkMode2;
      updateBionicReading(settings.isDarkMode, settings.isDarkMode2, settings.focusLength);
      break;
  }
});







