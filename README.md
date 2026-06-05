# Bionic Reading Extension

Enhance your reading experience with Bionic Reading. This Chrome extension applies the Bionic Reading technique to the text on web pages, making it easier to read and process information.

## Technology Stack
* **Frontend UI:** Svelte 5 & Tailwind CSS v4 (Reactive, lightning-fast popup interface).
* **Backend:** Vanilla JavaScript (Lightweight DOM manipulation content scripts).
* **Machine Learning:** `@xenova/transformers` (On-device NLP for keyword extraction).
* **Bundler:** Vite & Rolldown.

## Installation & Local Development

Because this extension uses Svelte and Vite, it requires a build step. You cannot load the raw source code directly into Chrome.

Because this extension uses Svelte and Vite, it requires a build step. You cannot load the raw source code directly into Chrome.

### Prerequisites
Before you begin, ensure you have **Node.js** and **npm** (Node Package Manager) installed on your system. 
* Download and install them from the official website: [https://nodejs.org/](https://nodejs.org/) (The LTS version is recommended).
* You can verify your installation by opening your terminal and running `node -v` and `npm -v`.

### 1. Clone and Build the Extension
1. Clone this repository to your local machine:
```bash
    git clone [https://github.com/yourusername/better-browsing.git](https://github.com/yourusername/better-browsing.git)
```
2. Open your terminal and navigate to the project folder.
3. Install the dependencies:
```bash
   npm install
```
4. Build the extension
   npx vite build

### Step 2: Load the extension in Chrome

- Open Google Chrome and navigate to chrome://extensions/.
- Toggle the Developer mode switch in the top-right corner to ON.
- Click the Load unpacked button in the top-left corner.
- Select the newly generated `dist` folder from your project directory.
- The Bionic Reading extension is now installed and ready to use.

## Step 3. Usage
- Navigate to any standard public webpage (e.g., Wikipedia, Medium, a news site).
- Click the puzzle-piece icon in your Chrome toolbar and pin Better Browsing.
- Click the extension icon to open the popup and start tweaking the sliders!
- (Note: Extensions cannot run on restricted internal Chrome pages like the New Tab page or the Chrome Web Store).