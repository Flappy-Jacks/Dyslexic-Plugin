import { extractOptimizedKeywords } from "./content/nlp-optimized.js";

// Listen for messages from the content script (main.js)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractKeywords") {
    
    // Run the heavy NLP model off the main thread!
    extractOptimizedKeywords(request.text)
      .then((importantWords) => {
        sendResponse({ ok: true, words: importantWords });
      })
      .catch((err) => {
        console.error("Background Worker NLP error:", err);
        sendResponse({ ok: false, error: err.message });
      });

    // Return true tells Chrome we will send the response asynchronously
    return true; 
  }
});