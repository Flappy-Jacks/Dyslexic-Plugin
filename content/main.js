let settings = {
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

// Loads user saved settings
chrome.storage.sync.get(Object.keys(settings), (saved) => {
    Object.assign(settings, saved);
    if (settings.isEnabled) { activateBionicReading(settings.isDarkMode, settings.isDarkMode2, settings.focusLength); }
    if (settings.selectedFont) { changeFont(settings.selectedFont); }
    if (settings.selectedFontColor) { changeFontColor(settings.selectedFontColor); }
    if (settings.selectedFontSize) { changeFontSize(settings.selectedFontSize); }
    if (settings.selectedWordSpacing) { changeWordSpacing(settings.selectedWordSpacing); }
    if (settings.selectedLetterSpacing) { changeLetterSpacing(settings.selectedLetterSpacing); }
    if (settings.selectedBgColor) { changeBgColor(settings.selectedBgColor); }
    if (settings.selectedLineSpacing) { changeLineSpacing(settings.selectedLineSpacing); }
  });

// handle requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "changeLineSpacing":
        changeLineSpacing(request.size);
        settings.selectedLineSpacing = request.lineSpacing;
      break;

    case "changeBgColor":
        changeBgColor(request.color);
        settings.selectedBgColor = request.color;
      break;

    case "changeLetterSpacing":
        changeLetterSpacing(request.size);
        settings.selectedLetterSpacing = request.size;
      break;

    case "changeWordSpacing":
        changeWordSpacing(request.size);
        settings.selectedWordSpacing = request.size;
      break;

    case "changeFontSize":
        changeFontSize(request.size);
        settings.selectedFontSize = request.size;
      break;
  
    case "changeFontColor":
        changeFontColor(request.color);
        settings.selectedFontColor = request.color;
      break;

    case "changeFont":
        changeFont(request.fontFamily);
        settings.selectedFont = request.fontFamily;
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

    case "resetSettings":
      settings = {
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
      deactivateBionicReading();
      
      removeCustomStyles();
      
      break;

    default:
      console.warn("Unknown action:", request.action);
      break;
  }
});







