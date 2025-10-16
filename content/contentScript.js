import { activateBionicReading, deactivateBionicReading, updateBionicReading } from "./bionic";
import { changeFont } from "./font";


let settings = {
  isEnabled: false,
  focusLength: 2,
  isDarkMode: false,
  isDarkMode2: false,
  selectedFont: "",
}

// Loads user saved settings
chrome.storage.sync.get(Object.keys(settings), (saved) => {
    Object.assign(settings, saved)
    if (settings.isEnabled) { activateBionicReading(settings.isDarkMode, settings.isDarkMode2, settings.focusLength); }
    if (settings.selectedFont) { changeFont(settings.selectedFont) } 
  });

// handle requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "changeFont":
        changeFont(request.fontFamily);
        settings.selectedFont = request.fontFamily
      break;

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







