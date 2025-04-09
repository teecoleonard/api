const { execSync } = require('child_process');
const fs = require('fs');

console.log('Atualizando dependências e corrigindo vulnerabilidades...');

try {
  console.log('Verificando vulnerabilidades...');
  const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
  const auditData = JSON.parse(auditOutput);
  
  if (auditData.metadata.vulnerabilities.total > 0) {
    console.log(`Encontradas ${auditData.metadata.vulnerabilities.total} vulnerabilidades.`);
    console.log('Tentando corrigir automaticamente...');
    
    try {
      execSync('npm audit fix', { stdio: 'inherit' });
      console.log('Correções automáticas aplicadas.');
    } catch (error) {
      console.log('Algumas vulnerabilidades não puderam ser corrigidas automaticamente.');
    }
    
    console.log('Atualizando dependências para as versões mais recentes...');
    execSync('npm update', { stdio: 'inherit' });
    console.log('Dependências atualizadas.');
    
    console.log('Verificando vulnerabilidades restantes...');
    const newAuditOutput = execSync('npm audit --json', { encoding: 'utf8' });
    const newAuditData = JSON.parse(newAuditOutput);
    
    if (newAuditData.metadata.vulnerabilities.total > 0) {
      console.log(`Ainda existem ${newAuditData.metadata.vulnerabilities.total} vulnerabilidades.`);
      console.log('Para algumas vulnerabilidades, pode ser necessário atualizar manualmente:');
      console.log('1. npm audit para ver detalhes');
      console.log('2. npm audit fix --force (Cuidado: pode causar quebra de compatibilidade)');
    } else {
      console.log('Todas as vulnerabilidades foram corrigidas!');
    }
  } else {
    console.log('Não foram encontradas vulnerabilidades!');
  }
  
  console.log('Verificando e instalando dependências de desenvolvimento...');
  execSync('npm install --only=dev', { stdio: 'inherit' });
  
  console.log('\nO processo de atualização está completo!');
} catch (error) {
  console.error('Ocorreu um erro durante o processo de atualização:', error.message);
}
