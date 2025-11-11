import { pipeline } from '@huggingface/transformers';

class PipelineSingleton {
    static task = 'token-classification';
    static model = 'Xenova/distilbert-base-multilingual-cased-ner-hrl';
    static instance = null;

    static async getInstance(progress_callback = null) {
        this.instance ??= pipeline(this.task, this.model, { progress_callback });

        return this.instance;
    }
}

// Create generic classify function, which will be reused for the different types of events.
export async function classify(text) {
    output.textContent = 'Running Classify...';
    // Get the pipeline instance. This will load and build the model when run for the first time.
    let model = await PipelineSingleton.getInstance((data) => {
        // You can track the progress of the pipeline creation here.
        // e.g., you can send `data` back to the UI to indicate a progress bar
        console.log('progress', data)
    });

    // Actually run the model on the input text
    let result = await model(text);
    return result;
};