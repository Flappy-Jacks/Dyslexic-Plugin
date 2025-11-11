// import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0/dist/transformers.min.js";

class PipelineSingleton {
    static task = 'token-classification';
    static model = 'Xenova/distilbert-base-multilingual-cased-ner-hrl';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance) {
            return this.instance;
        }

        try {
            // Check if pipeline is available globally
            if (typeof pipeline === 'undefined') {
                throw new Error('Transformers.js not loaded! Check if libs/transformers.min.js is in manifest.json');
            }

            console.log('🤖 Loading model:', this.model);
            
            // Create the pipeline
            this.instance = await pipeline(
                this.task, 
                this.model, 
                { progress_callback }
            );
            
            console.log('✅ Model loaded successfully!');
            return this.instance;

        } catch (error) {
            console.error('❌ Failed to create pipeline:', error);
            throw error;
        }
    }
}

// // Create generic classify function, which will be reused for the different types of events.
// export async function classify(text) {
//     output.textContent = 'Running Classify...';
//     // Get the pipeline instance. This will load and build the model when run for the first time.
//     let model = await PipelineSingleton.getInstance((data) => {
//         // You can track the progress of the pipeline creation here.
//         // e.g., you can send `data` back to the UI to indicate a progress bar
//         console.log('progress', data)
//     });

//     // Actually run the model on the input text
//     let result = await model(text);
//     return result;
// };

async function classify(text) {
    try {
        console.log('🔄 Starting classification...');
        console.log('📝 Text:', text.substring(0, 100) + '...');
        
        // Get the model instance
        let model = await PipelineSingleton.getInstance((data) => {
            if (data.status === 'progress') {
                console.log(`📥 Loading: ${data.file} - ${Math.round(data.progress || 0)}%`);
            }
        });

        console.log('🎯 Running model...');
        
        // Run classification
        let result = await model(text);
        
        console.log('✅ Classification complete!');
        console.log('📊 Found', result.length, 'tokens');
        
        return result;

    } catch (error) {
        console.error('❌ Classification error:', error);
        return { 
            error: error.message, 
            stack: error.stack 
        };
    }
}

window.classify = classify;
console.log('✅ classify function registered globally');