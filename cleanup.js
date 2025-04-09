const fs = require('fs');
const path = require('path');
const { rimraf } = require('rimraf');

async function cleanup() {
  console.log('Realizando limpeza antes de iniciar a aplicação...');
  
  try {
    const dirs = ['uploads', 'logs'].map(dir => path.join(__dirname, dir));
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    const uploadsDir = path.join(__dirname, 'uploads');
    const logsDir = path.join(__dirname, 'logs');
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        if (file.endsWith('.tmp')) {
          await rimraf(path.join(uploadsDir, file));
        }
      }
    }
    
    if (fs.existsSync(logsDir)) {
      const files = fs.readdirSync(logsDir);
      for (const file of files) {
        if (file.endsWith('.old.log')) {
          await rimraf(path.join(logsDir, file));
        }
      }
    }

    console.log('Limpeza concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a limpeza:', error);
  }
}

if (require.main === module) {
  cleanup();
}

module.exports = { cleanup };
