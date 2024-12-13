const fs = require("fs");
const path = require("path");

module.exports = {
    async execute(client) {
        const interactionEventsDir = path.join(__dirname, '..', 'events', 'interactionEvents');

        fs.readdirSync(interactionEventsDir).forEach(async (folder) => {
            const folderPath = path.join(interactionEventsDir, folder);
            fs.readdirSync(folderPath).forEach(async (file) => {
                if (file.endsWith('.js')) {
                    const eventPath = path.join(folderPath, file);
                    const event = await require(eventPath);

                    await event.execute(client);
                }
            });
        });
    },
};