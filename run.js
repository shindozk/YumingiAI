const { spawn } = require("child_process");

console.log("Iniciando o bot com o comando 'node src/index.js'...");

// Inicia o comando usando 'spawn'
const botProcess = spawn("node", ["src/index.js"], { stdio: "inherit" });

// Escuta o evento de encerramento do processo
botProcess.on("close", (code) => {
  console.log(`Processo encerrado com o código ${code}`);
  });

  // Escuta erros no processo
  botProcess.on("error", (error) => {
    console.error(`Erro ao iniciar o processo: ${error.message}`);
    });
