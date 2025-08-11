# Configuração do Servidor MCP PostgreSQL

## Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **PostgreSQL** instalado e rodando
3. **VS Code** com extensão GitHub Copilot

## Passo 1: Instalar o Servidor MCP PostgreSQL

```bash
# Instalar globalmente
npm install -g @modelcontextprotocol/server-postgres

# Ou instalar localmente no projeto
npm install --save-dev @modelcontextprotocol/server-postgres
```

## Passo 2: Configurar as Credenciais do Banco

### Opção A: Usando Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Configurações do PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=nextjs_dashboard
POSTGRES_USER=seu_usuario
POSTGRES_PASSWORD=sua_senha

# URL de conexão completa (alternativa)
DATABASE_URL=postgresql://usuario:senha@localhost:5432/nextjs_dashboard
```

### Opção B: Configuração via arquivo JSON

Crie um arquivo `mcp-postgres-config.json`:

```json
{
  "servers": [
    {
      "name": "nextjs-dashboard-db",
      "host": "localhost",
      "port": 5432,
      "database": "nextjs_dashboard",
      "user": "seu_usuario",
      "password": "sua_senha"
    }
  ]
}
```

## Passo 3: Configurar o VS Code

### 3.1: Instalar a extensão MCP

1. Abra o VS Code
2. Vá para Extensions (Ctrl+Shift+X)
3. Procure por "Model Context Protocol"
4. Instale a extensão oficial

### 3.2: Configurar settings.json

Adicione ao seu `settings.json` do VS Code:

```json
{
  "mcp.servers": {
    "postgres": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://usuario:senha@localhost:5432/nextjs_dashboard"
      }
    }
  }
}
```

## Passo 4: Inicializar o Banco de Dados (se necessário)

Se você ainda não tem um banco configurado para o projeto:

```sql
-- Conectar ao PostgreSQL e criar o banco
CREATE DATABASE nextjs_dashboard;

-- Conectar ao banco criado
\c nextjs_dashboard;

-- Exemplo de tabelas para o projeto Next.js Dashboard
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    amount INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados de exemplo
INSERT INTO users (name, email, password) VALUES 
('Admin User', 'admin@example.com', 'hashed_password_here'),
('Test User', 'test@example.com', 'hashed_password_here');

INSERT INTO customers (name, email, image_url) VALUES 
('John Doe', 'john@example.com', '/customers/john-doe.png'),
('Jane Smith', 'jane@example.com', '/customers/jane-smith.png');
```

## Passo 5: Verificar a Conexão

Para testar se tudo está funcionando:

1. Reinicie o VS Code
2. Abra o Command Palette (Ctrl+Shift+P)
3. Digite "MCP: Show Connected Servers"
4. Verifique se o servidor PostgreSQL aparece na lista

## Passo 6: Usar o MCP no Chat

Agora você pode usar comandos como:

- "Mostre-me todas as tabelas do banco"
- "Execute uma query para buscar todos os usuários"
- "Crie uma nova tabela para produtos"
- "Analise o esquema do banco de dados"

## Funcionalidades Disponíveis

Com o servidor MCP PostgreSQL configurado, eu posso:

✅ **Visualizar esquemas**: Ver todas as tabelas, colunas, tipos de dados
✅ **Executar consultas**: SELECT, INSERT, UPDATE, DELETE
✅ **Analisar dados**: Estatísticas, relacionamentos, índices
✅ **Modificar estruturas**: CREATE TABLE, ALTER TABLE, DROP TABLE
✅ **Carregar dados**: Importar CSVs, fazer bulk inserts
✅ **Gerar visualizações**: Diagramas ER, relatórios

## Configurações de Segurança

### Permissões Recomendadas

Para uso em desenvolvimento:
```sql
-- Criar usuário específico para MCP
CREATE USER mcp_user WITH PASSWORD 'senha_segura';

-- Conceder permissões específicas
GRANT CONNECT ON DATABASE nextjs_dashboard TO mcp_user;
GRANT USAGE ON SCHEMA public TO mcp_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mcp_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO mcp_user;
```

Para uso em produção:
```sql
-- Usuário somente leitura
CREATE USER mcp_readonly WITH PASSWORD 'senha_segura';
GRANT CONNECT ON DATABASE nextjs_dashboard TO mcp_readonly;
GRANT USAGE ON SCHEMA public TO mcp_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mcp_readonly;
```

## Solução de Problemas

### Erro de Conexão
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo de configuração
- Teste a conexão manualmente com `psql`

### Servidor MCP não aparece
- Reinicie o VS Code
- Verifique os logs no Output panel
- Confirme que a extensão MCP está instalada

### Permissões negadas
- Verifique as permissões do usuário no banco
- Confirme que o usuário tem acesso ao schema correto

## Próximos Passos

1. Configure o banco de dados
2. Instale e configure o servidor MCP
3. Teste a conexão
4. Comece a usar as funcionalidades no chat

Com essa configuração, poderei ajudá-lo de forma muito mais eficiente com:
- Análise de dados
- Otimização de queries
- Design de esquemas
- Migração de dados
- Debugging de problemas de banco
