import { applyCompact, applyOpen, applyRelaxed, changeBgColor, changeFontColor, changeFont, changeFontSize, changeLetterSpacing, changeLineSpacing, changeWordSpacing, removeCustomStyles } from "./font";
import { activateBionicReading, deactivateBionicReading, updateBionicReading, getTextNodes, deactivateColorizeKeywords } from "./bionic";

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
  keywordColor: "#C70000",  
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
    // case "testNLP":
    //   (async () => {
    //     const text = "Exercise can help prevent excess weight gain or help you keep off lost weight. When you take part in physical activity, you burn calories. The more intense the activity, the more calories you burn. Regular trips to the gym are great, but don't worry if you can't find a large chunk of time to exercise every day. Any amount of activity is better than none. To gain the benefits of exercise, just get more active throughout your day. For example, take the stairs instead of the elevator or rev up your household chores. Consistency is key.";
    //     console.log("TEXT: " + text);
    //     try {
    //       const { extractImportantWords } = await import("./nlp.js");
    //       const importantWords = await extractImportantWords(text, 20);
    //       console.log("Keywords:", importantWords);
    //       sendResponse({ ok: true, words: importantWords });
    //     } catch (err) {
    //       console.error("NLP error:", err);
    //       sendResponse({ ok: false, error: err.message });
    //     }
    //   })();
    //   return true;
    
    case "applyBionicReading":
      (async () => {
        try {
          console.log("📄 Extracting text from webpage...");
          const pageText = document.body.innerText;

          const { extractImportantWords } = await import("./nlp-tfidf.js");
          const importantWords = await extractImportantWords(pageText, 2000);
          console.log("🏷️ Important words:", importantWords);

          // const { extractImportantWordsHybrid } = await import("./nlp-hybrid.js");
          // const importantWords = await extractImportantWordsHybrid(pageText, 20);
          // console.log("🏷️ Important words:", importantWords);

          // Import the bionic highlighting function
          const { highlightKeywordsBionically } = await import("./bionic.js");
          
          // Apply bionic reading to the extracted keywords
          await highlightKeywordsBionically(importantWords, settings.focusLength);

          sendResponse({ ok: true, words: importantWords });
        } catch (err) {
          console.error("❌ NLP error:", err);
          sendResponse({ ok: false, error: err.message });
        }
      })();
      return true;

      case "colorizeKeywords":
      (async () => {
        try {
          console.log("📄 Extracting text from webpage...");
          const pageText = document.body.innerText;

          const { extractImportantWords } = await import("./nlp-tfidf.js");
          const importantWords = await extractImportantWords(pageText, 2000);
          console.log("🏷️ Important words:", importantWords);

          // Save keywords to global settings so we can re-colorize later if color changes
          settings.keywords = importantWords;

          // Import the bionic highlighting function
          const { colorizeKeywords } = await import("./bionic.js");
          
          // Apply bionic reading to the extracted keywords
          await colorizeKeywords(importantWords, settings.focusLength, settings.keywordColor);

          sendResponse({ ok: true, words: importantWords });
        } catch (err) {
          console.error("❌ NLP error:", err);
          sendResponse({ ok: false, error: err.message });
        }
      })();
      return true;

    case "applyRelaxed":
        applyRelaxed(settings);
      break;

    case "applyOpen":
        applyOpen(settings);
      break;
    
    case "applyCompact":
        applyCompact(settings);
      break;

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
      deactivateColorizeKeywords();
      removeCustomStyles();
      break;
    
    case "updateKeywordColor":
      settings.keywordColor = request.color;

      // We assume you store your current keywords in 'settings.keywords' 
      // or somewhere global in main.js
      if (settings.keywords && settings.keywords.length > 0) {
        colorizeKeywords(settings.keywords, settings.focusLength, settings.keywordColor);
      }
      break;

    case "applyAllSettings":
      const newS = request.settings;
      Object.assign(settings, newS);

      // Apply all visual styles immediately using the imported functions
      if (newS.selectedFont) changeFont(newS.selectedFont);
      if (newS.selectedFontColor) changeFontColor(newS.selectedFontColor);
      if (newS.selectedFontSize) changeFontSize(newS.selectedFontSize);
      if (newS.selectedWordSpacing) changeWordSpacing(newS.selectedWordSpacing);
      if (newS.selectedLetterSpacing) changeLetterSpacing(newS.selectedLetterSpacing);
      if (newS.selectedBgColor) changeBgColor(newS.selectedBgColor);
      if (newS.selectedLineSpacing) changeLineSpacing(newS.selectedLineSpacing);

      // Handle Bionic toggle
      if (newS.isEnabled) {
        activateBionicReading(newS.isDarkMode, newS.isDarkMode2, newS.focusLength);
      } else {
        deactivateBionicReading();
      }
      sendResponse({ ok: true });
      
      if (newS.keywords) {
        colorizeKeywords(newS.keywords, newS.focusLength, newS.keywordColor);
      }
      break;

    default:
      console.warn("Unknown action:", request.action);
      break;
  }
});