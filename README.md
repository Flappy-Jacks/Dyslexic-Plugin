# Bionic Reading Extension

Enhance your reading experience with Bionic Reading. This Chrome extension applies the Bionic Reading technique to the text on web pages, making it easier to read and process information.

## Technology Stack
* **Frontend UI:** Svelte 5 & Tailwind CSS v4 (Reactive, lightning-fast popup interface).
* **Backend:** Vanilla JavaScript (Lightweight DOM manipulation content scripts).
* **Machine Learning:** `@xenova/transformers` (On-device NLP for keyword extraction).
* **Bundler:** Vite & Rolldown.

## Installation & Local Development

Because this extension uses Svelte and Vite, it requires a build step. You cannot load the raw source code directly into Chrome.

### 1. Build the Extension
1. Clone this repository to your local machine.
2. Open your terminal and navigate to the project folder.
3. Install the dependencies:
   ```bash
   npm install
4. Build the extension
   npx vite build

### Step 2: Load the extension in Chrome

- Open Google Chrome and navigate to chrome://extensions/.
- Toggle the Developer mode switch in the top-right corner to ON.
- Click the Load unpacked button in the top-left corner.
- Select the newly generated dist folder from your project directory.
- The Bionic Reading extension is now installed and ready to use.

## Step 3. Usage
- Click on the extension icon in the Chrome toolbar to open the popup.
- Toggle the "Activate Bionic Reading" switch to enable or disable the Bionic Reading effect on the current web page.
- Adjust the "Focus Length" slider to change the length of bolding in the text.

## Support and Contribution

If you encounter any issues or would like to suggest improvements, please [open an issue](https://github.com/edwardsaunders7/BionicReaderChromeExtension/issues) on GitHub. Contributions are welcome, and you can submit a pull request with your changes.