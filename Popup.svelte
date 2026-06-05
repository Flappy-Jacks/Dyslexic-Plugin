<script>
  import { onMount } from 'svelte';

  // --- STATE VARIABLES ---
  let activeTab = 'typography'; // 'reading', 'theme', 'typography', or 'presets'

  // 1. Reading Tools
  let isBionicEnabled = false;
  let focusLength = 2;
  let isKeywordsEnabled = false;
  let keywordColor = "#C70000";
  
  // 2. Theme
  let isDarkMode = false;
  let isDarkMode2 = false;
  let selectedBgColor = "Default";
  const bgColors = ["Default", "Blue", "Green", "Red"];

  // 3. Typography & Spacing
  let selectedFont = "Default";
  let selectedFontColor = "Default";
  let selectedFontSize = 16;
  let selectedWordSpacing = 0;
  let selectedLetterSpacing = 0;
  let selectedLineSpacing = 1.5;
  const fonts = ["Default", "Arial", "Verdana", "Helvetica", "Times New Roman", "Courier New", "Georgia", "Palatino", "Poppins", "Garamond", "Bookman", "Comic Sans MS", "Trebuchet MS", "Arial Black", "Impact", "Lucida Console", "Tahoma"];

  // 4. Presets
  let userPresets = [];
  let newPresetName = "";

  // --- LOAD SAVED SETTINGS ---
  onMount(() => {
    chrome.storage.sync.get(null, (saved) => {
      if (saved.isEnabled !== undefined) isBionicEnabled = saved.isEnabled;
      if (saved.focusLength !== undefined) focusLength = parseInt(saved.focusLength, 10) || 2;
      if (saved.isKeywordsEnabled !== undefined) isKeywordsEnabled = saved.isKeywordsEnabled;
      if (saved.keywordColor !== undefined) keywordColor = saved.keywordColor;
      
      if (saved.isDarkMode !== undefined) isDarkMode = saved.isDarkMode;
      if (saved.isDarkMode2 !== undefined) isDarkMode2 = saved.isDarkMode2;
      if (saved.selectedBgColor !== undefined) selectedBgColor = saved.selectedBgColor;
      
      if (saved.selectedFont !== undefined) selectedFont = saved.selectedFont;
      if (saved.selectedFontColor !== undefined) selectedFontColor = saved.selectedFontColor;
      if (saved.selectedFontSize !== undefined) selectedFontSize = saved.selectedFontSize;
      if (saved.selectedWordSpacing !== undefined) selectedWordSpacing = saved.selectedWordSpacing;
      if (saved.selectedLetterSpacing !== undefined) selectedLetterSpacing = saved.selectedLetterSpacing;
      if (saved.selectedLineSpacing !== undefined) selectedLineSpacing = saved.selectedLineSpacing;
      
      if (saved.userPresets !== undefined) userPresets = saved.userPresets;
    });
  });

  // --- MESSAGING HELPER ---
  function sendToContentScript(action, payload = {}) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action, ...payload });
    });
  }

  // --- UNIFIED INPUT UPDATE HANDLER ---
  // Fires exclusively when a human interacts with the UI elements!
  function handleUpdate(storageKey, value, action, payload = {}) {
    chrome.storage.sync.set({ [storageKey]: value });
    sendToContentScript(action, payload);
  }

  // --- PRESET LOGIC ---
  function savePreset() {
    const name = newPresetName.trim() || `Preset ${userPresets.length + 1}`;
    const currentSettings = {
      isEnabled: isBionicEnabled, focusLength, isKeywordsEnabled, keywordColor,
      isDarkMode, isDarkMode2, selectedBgColor,
      selectedFont, selectedFontColor, selectedFontSize,
      selectedWordSpacing, selectedLetterSpacing, selectedLineSpacing
    };
    userPresets = [...userPresets, { name, settings: currentSettings }];
    chrome.storage.sync.set({ userPresets });
    newPresetName = "";
  }

  function loadPreset(presetSettings) {
    isBionicEnabled = presetSettings.isEnabled ?? false;
    focusLength = presetSettings.focusLength ?? 2;
    isKeywordsEnabled = presetSettings.isKeywordsEnabled ?? false;
    keywordColor = presetSettings.keywordColor ?? "#C70000";
    isDarkMode = presetSettings.isDarkMode ?? false;
    isDarkMode2 = presetSettings.isDarkMode2 ?? false;
    selectedBgColor = presetSettings.selectedBgColor ?? "Default";
    selectedFont = presetSettings.selectedFont ?? "Default";
    selectedFontColor = presetSettings.selectedFontColor ?? "Default";
    selectedFontSize = presetSettings.selectedFontSize ?? 16;
    selectedWordSpacing = presetSettings.selectedWordSpacing ?? 0;
    selectedLetterSpacing = presetSettings.selectedLetterSpacing ?? 0;
    selectedLineSpacing = presetSettings.selectedLineSpacing ?? 1.5;

    const toSave = {
      isEnabled: isBionicEnabled, focusLength, isKeywordsEnabled, keywordColor,
      isDarkMode, isDarkMode2, selectedBgColor,
      selectedFont, selectedFontColor, selectedFontSize,
      selectedWordSpacing, selectedLetterSpacing, selectedLineSpacing
    };

    chrome.storage.sync.set(toSave, () => {
      sendToContentScript("applyAllSettings", { settings: toSave });
    });
  }

  function deletePreset(index) {
    userPresets = userPresets.filter((_, i) => i !== index);
    chrome.storage.sync.set({ userPresets });
  }

  function applyLayoutPreset(actionName) {
    sendToContentScript(actionName);
    setTimeout(() => {
      chrome.storage.sync.get(null, (saved) => {
        if (saved.selectedFontSize !== undefined) selectedFontSize = saved.selectedFontSize;
        if (saved.selectedWordSpacing !== undefined) selectedWordSpacing = saved.selectedWordSpacing;
        if (saved.selectedLetterSpacing !== undefined) selectedLetterSpacing = saved.selectedLetterSpacing;
        if (saved.selectedLineSpacing !== undefined) selectedLineSpacing = saved.selectedLineSpacing;
        if (saved.selectedFont !== undefined) selectedFont = saved.selectedFont;
      });
    }, 150);
  }

  function resetAllSettings() {
    const defaults = {
      isEnabled: false, focusLength: 2, isKeywordsEnabled: false, keywordColor: "#C70000",
      isDarkMode: false, isDarkMode2: false, selectedBgColor: "Default",
      selectedFont: "Default", selectedFontColor: "Default", selectedFontSize: 16,
      selectedWordSpacing: 0, selectedLetterSpacing: 0, selectedLineSpacing: 1.5
    };

    isBionicEnabled = defaults.isEnabled;
    focusLength = defaults.focusLength;
    isKeywordsEnabled = defaults.isKeywordsEnabled;
    keywordColor = defaults.keywordColor;
    isDarkMode = defaults.isDarkMode;
    isDarkMode2 = defaults.isDarkMode2;
    selectedBgColor = defaults.selectedBgColor;
    selectedFont = defaults.selectedFont;
    selectedFontColor = defaults.selectedFontColor;
    selectedFontSize = defaults.selectedFontSize;
    selectedWordSpacing = defaults.selectedWordSpacing;
    selectedLetterSpacing = defaults.selectedLetterSpacing;
    selectedLineSpacing = defaults.selectedLineSpacing;

    chrome.storage.sync.set(defaults, () => {
      sendToContentScript("resetSettings");
    });
  }
</script>

<main class="w-96 min-h-[460px] bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-200 flex flex-col justify-between">
  <div>
    <header class="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
      <h1 class="text-xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">Better Browsing</h1>
      <button onclick={resetAllSettings} class="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-2.5 py-1 rounded transition-colors text-gray-600 dark:text-gray-300 font-medium">
        Reset All
      </button>
    </header>

    <div class="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 pt-2 space-x-1">
      {#each ['typography', 'reading', 'theme', 'presets'] as tab}
        <button 
          class="flex-1 text-center py-2.5 text-sm font-medium transition-colors capitalize rounded-t-md border-t border-l border-r 
          {activeTab === tab 
            ? 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 -mb-px relative z-10' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'}"
          onclick={() => activeTab = tab}>
          {tab}
        </button>
      {/each}
    </div>

    <div class="p-5">
      {#if activeTab === 'typography'}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4 max-h-[310px] overflow-y-auto">
          
          <div class="flex flex-col space-y-1">
            <span class="font-medium text-sm">Font Family</span>
            <select bind:value={selectedFont} onchange={(e) => handleUpdate('selectedFont', e.target.value, "changeFont", { fontFamily: e.target.value })} class="border border-gray-200 dark:border-gray-600 rounded p-2 text-sm bg-gray-50 dark:bg-gray-700 outline-none focus:border-blue-500">
              {#each fonts as font}
                <option value={font}>{font}</option>
              {/each}
            </select>
          </div>

          <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
            <div class="flex flex-col">
              <span class="text-sm font-medium">Font Color</span>
              <button onclick={() => { selectedFontColor = "Default"; handleUpdate('selectedFontColor', "Default", "changeFontColor", { color: "Default" }); }} class="text-left text-[11px] text-blue-500 hover:underline">Reset to Default</button>
            </div>
            <input 
              type="color" 
              value={selectedFontColor === "Default" ? "#000000" : selectedFontColor} 
              oninput={(e) => { selectedFontColor = e.target.value; handleUpdate('selectedFontColor', selectedFontColor, "changeFontColor", { color: selectedFontColor }); }} 
              class="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" />
          </div>

          <div class="space-y-0.5">
            <div class="flex justify-between text-sm"><span class="font-medium">Font Size</span><span class="text-xs text-gray-400">{selectedFontSize}px</span></div>
            <input type="range" min="10" max="40" bind:value={selectedFontSize} oninput={(e) => handleUpdate('selectedFontSize', e.target.value, "changeFontSize", { size: e.target.value })} class="w-full accent-blue-600" />
          </div>

          <div class="space-y-0.5">
            <div class="flex justify-between text-sm"><span class="font-medium">Word Spacing</span><span class="text-xs text-gray-400">{selectedWordSpacing}px</span></div>
            <input type="range" min="0" max="20" bind:value={selectedWordSpacing} oninput={() => handleUpdate('selectedWordSpacing', selectedWordSpacing, "changeWordSpacing", { size: selectedWordSpacing })} class="w-full accent-blue-600" />
          </div>

          <div class="space-y-0.5">
            <div class="flex justify-between text-sm"><span class="font-medium">Letter Spacing</span><span class="text-xs text-gray-400">{selectedLetterSpacing}px</span></div>
            <input type="range" min="0" max="10" bind:value={selectedLetterSpacing} oninput={() => handleUpdate('selectedLetterSpacing', selectedLetterSpacing, "changeLetterSpacing", { size: selectedLetterSpacing })} class="w-full accent-blue-600" />
          </div>

          <div class="space-y-0.5">
            <div class="flex justify-between text-sm"><span class="font-medium">Line Spacing</span><span class="text-xs text-gray-400">{selectedLineSpacing}</span></div>
            <input type="range" min="1" max="3" step="0.1" bind:value={selectedLineSpacing} oninput={() => handleUpdate('selectedLineSpacing', selectedLineSpacing, "changeLineSpacing", { size: selectedLineSpacing })} class="w-full accent-blue-600" />
          </div>

          <div class="pt-2 border-t border-gray-100 dark:border-gray-700">
            <span class="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Density Layout Presets</span>
            <div class="grid grid-cols-3 gap-2">
              <button onclick={() => applyLayoutPreset('applyCompact')} class="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded text-xs font-medium transition-colors">Compact</button>
              <button onclick={() => applyLayoutPreset('applyOpen')} class="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded text-xs font-medium transition-colors">Open</button>
              <button onclick={() => applyLayoutPreset('applyRelaxed')} class="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded text-xs font-medium transition-colors">Relaxed</button>
            </div>
          </div>

        </div>
      {/if}

      {#if activeTab === 'reading'}
        <div class="space-y-4">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div class="flex items-center justify-between mb-4">
              <span class="font-semibold">Selective Bionic Reading</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isBionicEnabled} 
                onchange={(e) => {
                    isBionicEnabled = e.target.checked;
                    handleUpdate('isEnabled', isBionicEnabled, isBionicEnabled ? "applyBionicReading" : "deactivateBionicReading");
                }} 
                class="sr-only peer">             
                <div class="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500 dark:text-gray-400">Focus Length: {focusLength}</span>
              <input type="range" min="1" max="5" value={focusLength} onchange={(e) => { 
                focusLength = parseInt(e.target.value);
                handleUpdate('focusLength', focusLength, "updateFocusLength", { focusLength: focusLength });
                }} class="w-32 accent-blue-600" />
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div class="flex items-center justify-between mb-4">
              <span class="font-semibold">Colorize Keywords</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isKeywordsEnabled} 
                onchange={(e) => {
                    isKeywordsEnabled = e.target.checked;
                    handleUpdate('isKeywordsEnabled', isKeywordsEnabled, isKeywordsEnabled ? "colorizeKeywords" : "removeKeywords");
                }} 
                class="sr-only peer">   
                <div class="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500 dark:text-gray-400">Keyword Color</span>
              <input type="color" value={keywordColor} onchange={(e) => { 
                keywordColor = e.target.value;
                handleUpdate('keywordColor', keywordColor, "updateKeywordColor", { color: keywordColor });
                }} class="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" />
            </div>
          </div>
        </div>
      {/if}

      {#if activeTab === 'theme'}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div class="flex items-center justify-between">
            <span class="font-medium">Dark Mode 1</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isDarkMode} onchange={(e) => {
                isDarkMode = e.target.checked;
                handleUpdate('isDarkMode', isDarkMode, "toggleDarkMode", { isDarkMode: isDarkMode });
                }} class="sr-only peer">

                <input type="checkbox" checked={isDarkMode2} onchange={(e) => {
                isDarkMode2 = e.target.checked;
                handleUpdate('isDarkMode2', isDarkMode2, "toggleDarkMode2", { isDarkMode2: isDarkMode2 });
                }} class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium">Dark Mode 2</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isDarkMode2} onchange={(e) => {
                isDarkMode2 = e.target.checked;
                handleUpdate('isDarkMode2', isDarkMode2, "toggleDarkMode2", { isDarkMode2: isDarkMode2 });
                }} class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div class="flex flex-col space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <span class="font-medium text-sm">Background Color</span>
            <select bind:value={selectedBgColor} onchange={(e) => handleUpdate('selectedBgColor', e.target.value, "changeBgColor", { color: e.target.value })} class="border border-gray-200 dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 outline-none text-sm focus:border-blue-500">
              {#each bgColors as color}
                <option value={color}>{color}</option>
              {/each}
            </select>
          </div>
        </div>
      {/if}

      

      {#if activeTab === 'presets'}
        <div class="space-y-4">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <span class="block font-semibold mb-2 text-sm">Save Current Configuration</span>
            <div class="flex space-x-2">
              <input type="text" bind:value={newPresetName} placeholder="Preset Name..." class="flex-1 border border-gray-200 dark:border-gray-600 rounded p-2 text-sm bg-gray-50 dark:bg-gray-700 outline-none focus:border-blue-500" />
              <button onclick={savePreset} class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">Save</button>
            </div>
          </div>

          {#if userPresets.length > 0}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-2 max-h-[170px] overflow-y-auto">
              <span class="block font-semibold mb-1 text-sm border-b border-gray-100 dark:border-gray-700 pb-1">Saved Presets</span>
              {#each userPresets as preset, i}
                <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-100 dark:border-gray-600">
                  <span class="text-sm font-medium truncate pr-2">{preset.name}</span>
                  <div class="flex space-x-2 flex-shrink-0">
                    <button onclick={() => loadPreset(preset.settings)} class="text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 px-3 py-1 rounded transition-colors font-medium text-gray-800 dark:text-gray-100">Load</button>
                    <button onclick={() => deletePreset(i)} class="text-xs bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 px-3 py-1 rounded transition-colors font-medium">Delete</button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

    </div>
  </div>
</main>