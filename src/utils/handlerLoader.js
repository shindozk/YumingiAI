const fs = require("node:fs");
const path = require("node:path");

module.exports = {
    async execute(client) {
        // Função recursiva para percorrer subpastas
        const loadHandlers = (directory) => {
            const files = fs.readdirSync(directory);
            
            files.forEach(async (file) => {
                const fullPath = path.join(directory, file);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // Se for uma pasta, chama recursivamente
                    loadHandlers(fullPath);
                } else if (file.endsWith(".js")) {
                    // Apenas carrega arquivos JS
                    const handler = await require(fullPath);
                    if (handler.execute) {
                        handler.execute(client);
                    }
                }
            });
        };

        // Chama a função de carregamento na pasta base
        loadHandlers(path.join(__dirname, "../handlers"));
    },
};
