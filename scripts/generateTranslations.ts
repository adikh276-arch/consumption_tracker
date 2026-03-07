import fs from 'fs';
import path from 'path';

const API_KEY = 'AIzaSyDgyWwwmHOROsPZclCm-LGzZs_uoYNhVDk';
const SOURCE_LANG = 'en';
const TARGET_LANGS = [
    'es', 'fr', 'pt', 'de', 'ar', 'hi', 'bn', 'zh', 'ja', 'id', 'tr', 'vi', 'ko', 'ru', 'it', 'pl', 'th', 'tl'
];

const localesDir = path.resolve('src/i18n/locales');
const sourceFile = path.join(localesDir, 'en.json');

async function translateText(text: string, targetLang: string) {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                q: text,
                target: targetLang,
                format: 'text',
            }),
        });
        const data: any = await response.json();
        return data.data.translations[0].translatedText;
    } catch (error) {
        console.error(`Error translating to ${targetLang}:`, error);
        return text;
    }
}

async function run() {
    if (!fs.existsSync(sourceFile)) {
        console.error('Source file en.json not found');
        return;
    }

    const sourceContent = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
    const keys = Object.keys(sourceContent);

    for (const lang of TARGET_LANGS) {
        console.log(`Translating to ${lang}...`);
        const translatedContent: any = {};

        // Batch translations to be more efficient if needed, but for now, simple loop
        // Actually, Google API supports multiple 'q' parameters for batching
        const textsToTranslate = keys.map(key => sourceContent[key]);

        const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    q: textsToTranslate,
                    target: lang,
                    format: 'text',
                }),
            });
            const data: any = await response.json();

            if (data.data && data.data.translations) {
                data.data.translations.forEach((t: any, i: number) => {
                    translatedContent[keys[i]] = t.translatedText;
                });
            } else {
                console.error(`Failed to translate ${lang}:`, data);
            }
        } catch (error) {
            console.error(`Error translating to ${lang}:`, error);
        }

        fs.writeFileSync(
            path.join(localesDir, `${lang}.json`),
            JSON.stringify(translatedContent, null, 2),
            'utf-8'
        );
    }
    console.log('All translations generated!');
}

run();
