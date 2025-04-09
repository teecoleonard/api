const { execSync } = require('child_process');

console.log('Instalando dependências necessárias...');

try {

  console.log('Instalando @nestjs/throttler...');
  execSync('npm install @nestjs/throttler --save', { stdio: 'inherit' });

  console.log('Dependências instaladas com sucesso!');
} catch (error) {
  console.error('Erro ao instalar dependências:', error.message);
  process.exit(1);
}
