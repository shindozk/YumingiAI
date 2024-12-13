const fs = require('node:fs');
const path = require('path');

module.exports = {
    async execute(client) {
        // Carregar eventos do diretório ./src/events/botEvents/${dir}
        const eventsDir = path.join(__dirname, '..', 'events', 'botEvents');
        fs.readdirSync(eventsDir).forEach(dir => {
            const dirPath = path.join(eventsDir, dir);
            fs.readdirSync(dirPath).filter(file => file.endsWith('.js')).forEach(file => {
                try {
                    const event = require(path.join(dirPath, file));

                    const eventName = event.event || path.basename(file, '.js');
                    if (event.once) {
                        client.once(eventName, (...args) => event.execute(...args));
                    } else {
                        client.on(eventName, (...args) => event.execute(...args));
                    }
                } catch (err) {
                    console.error(`Error while loading event: ${path.join(dirPath, file)}\n`, err);
                }
            });
        });
    },
};