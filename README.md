# File Processor API
<div align="center">
![Status do Projeto](https://img.shields.io/badge/status-em-progresso-orange)
![Node.js](https://img.shields.io/badge/Node.js-14%2B-339933?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-3178C6?logo=typescript)
![NestJS](https://img.shields.io/badge/NestJS-8.x-E0234E?logo=nestjs)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![Licença](https://img.shields.io/badge/licença-MIT-green)

</div>

API para processamento e extração de dados de arquivos (PDF, Excel, Word) com funcionalidades de gerenciamento de contratos, faturas e equipamentos.

## 📋 Recursos Principais

- **Processamento de Arquivos:** Extração automática de dados de arquivos PDF, XLSX/XLS e DOCX
- **Gestão de Contratos:** Criação e gerenciamento de contratos com itens associados
- **Gestão de Faturas:** Registro e acompanhamento de faturas
- **Gestão de Equipamentos:** Cadastro e controle de equipamentos disponíveis
- **Gestão de Clientes e Empresas:** Cadastro e manutenção de dados

## 🔧 Requisitos

- Node.js (v14+)
- MySQL (v8+)
- Npm ou Yarn

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente no arquivo `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=sua_senha
DB_DATABASE=file_processor
DB_SYNCHRONIZE=true

JWT_SECRET=seu_jwt_secret
JWT_EXPIRATION=24h

PORT=3000
```

4. Inicie o servidor:
```bash
npm start
```

O servidor estará disponível em: http://localhost:3000

## 📚 Documentação da API

A documentação completa da API (Swagger) está disponível em:
http://localhost:3000/api

## 🔐 Autenticação

A API utiliza autenticação JWT (JSON Web Token). Para obter um token:

```
POST /auth/login
```

Com o seguinte corpo:
```json
{
  "email": "seu_email@exemplo.com",
  "password": "sua_senha"
}
```

Use o token recebido nas requisições subsequentes no header Authorization:
```
Authorization: Bearer seu_token
```

## 🗃️ Principais Endpoints

### Arquivos
- `POST /files/upload` - Fazer upload de um arquivo
- `POST /files/:id/process` - Processar e extrair dados de um arquivo
- `GET /files` - Listar arquivos do usuário

### Contratos
- `POST /contratos` - Criar um novo contrato
- `GET /contratos` - Listar todos os contratos
- `GET /contratos/:id` - Obter um contrato específico
- `POST /contratos/process-from-file` - Criar contrato a partir de arquivo processado

### Faturas
- `POST /faturas` - Criar uma nova fatura
- `GET /faturas` - Listar todas as faturas
- `POST /faturas/process-from-file` - Criar fatura a partir de arquivo processado

### Equipamentos
- `POST /equipamentos` - Cadastrar um novo equipamento
- `GET /equipamentos` - Listar todos os equipamentos
- `POST /equipamentos/lote` - Cadastrar múltiplos equipamentos

### Clientes
- `POST /clientes` - Cadastrar um novo cliente
- `GET /clientes` - Listar todos os clientes

## 📁 Estrutura do Projeto

```
api/
├── src/
│   ├── auth/            # Autenticação e autorização 
│   ├── clientes/        # Módulo de clientes
│   ├── common/          # Utilitários compartilhados
│   ├── contracts/       # Módulo de contratos
│   ├── empresa/         # Módulo de empresas
│   ├── equipamentos/    # Módulo de equipamentos
│   ├── files/           # Módulo de processamento de arquivos
│   │   └── extractors/  # Extratores para diferentes tipos de arquivos
│   ├── invoices/        # Módulo de faturas
│   ├── item-contrato/   # Módulo de itens de contrato
│   ├── returns/         # Módulo de devoluções
│   ├── users/           # Módulo de usuários
│   ├── app.controller.ts
│   ├── app.module.ts
│   └── main.ts          # Ponto de entrada da aplicação
```

## 📊 Funcionalidades de Extração de Dados

A API é capaz de processar automaticamente:

- **Contratos** - Extrai dados como número do contrato, datas, partes envolvidas e valores
- **Faturas** - Extrai número da fatura, data de emissão, valor total e informações do fornecedor
- **Devoluções** - Extrai informações sobre itens devolvidos, datas e motivos

## 👩‍💻 Desenvolvimento

Para executar em modo de desenvolvimento com reload automático:

```bash
npm run start:dev
```
