const fs = require('fs');
const path = require('path');

class Translator {
    constructor() {
        this.translations = {};
        this.loadTranslations();
    }

    loadTranslations() {
        const localesPath = path.join(__dirname, 'locales');
        const files = fs.readdirSync(localesPath);

        files.forEach(file => {
            const locale = path.basename(file, '.json');
            const filePath = path.join(localesPath, file);
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            this.translations[locale] = content;
        });
    }

    t(locale, key) {
        if (!this.translations[locale]) {
            console.warn(`Locale '${locale}' not found. Using default locale 'en-US'.`);
            locale = 'en-US';
        }

        return key.split('.').reduce((o, i) => (o ? o[i] : null), this.translations[locale]) || key;
    }
}

module.exports = new Translator();