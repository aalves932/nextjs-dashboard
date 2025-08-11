#!/bin/bash

# Script de configuração automática do MCP PostgreSQL
# Execute com: chmod +x setup-mcp-postgres.sh && ./setup-mcp-postgres.sh

echo "🚀 Configurando Servidor MCP PostgreSQL para Next.js Dashboard"
echo "============================================================"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18+ primeiro."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não encontrado. Por favor, instale PostgreSQL primeiro."
    exit 1
fi

echo "✅ PostgreSQL encontrado"

# Instalar servidor MCP PostgreSQL
echo "📦 Instalando servidor MCP PostgreSQL..."
npm install --save-dev @modelcontextprotocol/server-postgres

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado. Por favor, configure suas credenciais do PostgreSQL primeiro."
    exit 1
else
    echo "✅ Arquivo .env encontrado com configurações dos bancos"
fi

# Criar script SQL de inicialização
echo "📝 Criando script de inicialização do banco..."
cat > init-database.sql << EOL
-- Script de inicialização do banco para Next.js Dashboard
-- Execute com: psql -f init-database.sql

-- Criar banco se não existir
SELECT 'CREATE DATABASE nextjs_dashboard'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nextjs_dashboard')\gexec

-- Conectar ao banco
\c nextjs_dashboard;

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de faturas
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    amount INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar usuário para MCP (desenvolvimento)
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'mcp_dev') THEN
        CREATE USER mcp_dev WITH PASSWORD 'mcp_dev_password';
    END IF;
END
\$\$;

-- Conceder permissões
GRANT CONNECT ON DATABASE nextjs_dashboard TO mcp_dev;
GRANT USAGE ON SCHEMA public TO mcp_dev;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mcp_dev;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO mcp_dev;

-- Inserir dados de exemplo se as tabelas estiverem vazias
INSERT INTO users (name, email, password) 
SELECT 'Admin User', 'admin@nextjs-dashboard.com', '\$2b\$10\$example.hash.here'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@nextjs-dashboard.com');

INSERT INTO customers (name, email, image_url) VALUES 
('Acme Corp', 'contact@acme.com', '/customers/acme-corp.png'),
('Tech Solutions', 'info@techsolutions.com', '/customers/tech-solutions.png'),
('Digital Agency', 'hello@digitalagency.com', '/customers/digital-agency.png')
ON CONFLICT (email) DO NOTHING;

INSERT INTO invoices (customer_id, amount, status, date) VALUES 
(1, 15000, 'paid', '2024-01-15'),
(2, 8500, 'pending', '2024-01-20'),
(3, 12000, 'paid', '2024-01-25'),
(1, 6000, 'pending', '2024-01-30')
ON CONFLICT DO NOTHING;

PRINT 'Banco de dados inicializado com sucesso!';
EOL

# Criar configuração para VS Code usando os bancos existentes
echo "⚙️  Criando configuração do VS Code para os bancos existentes..."
mkdir -p .vscode

cat > .vscode/settings.json << EOL
{
  "mcp.servers": {
    "neon-database": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgres://neondb_owner:npg_OPjy3GYfl0HU@ep-wandering-snowflake-acupessu-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"
      }
    },
    "locaweb-database": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://sigmadb:H%24kfCR!2U5@sigmadb.postgresql.dbaas.com.br:5432/sigmadb"
      }
    }
  },
  "mcp.enable": true
}
EOL

# Criar script de teste de conexão para os bancos existentes
echo "🧪 Criando script de teste para os dois bancos..."
cat > test-mcp-connection.js << EOL
const { Client } = require('pg');

async function testNeonDatabase() {
    const client = new Client({
        connectionString: 'postgres://neondb_owner:npg_OPjy3GYfl0HU@ep-wandering-snowflake-acupessu-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
    });

    try {
        await client.connect();
        console.log('✅ Conexão com Neon Database estabelecida com sucesso!');
        
        const result = await client.query('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = \'public\'');
        console.log(\`📊 Neon DB - Número de tabelas: \${result.rows[0].table_count}\`);
        
        await client.end();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com Neon Database:', error.message);
        return false;
    }
}

async function testLocawebDatabase() {
    const client = new Client({
        connectionString: 'postgresql://sigmadb:H\$kfCR!2U5@sigmadb.postgresql.dbaas.com.br:5432/sigmadb'
    });

    try {
        await client.connect();
        console.log('✅ Conexão com Locaweb Database estabelecida com sucesso!');
        
        const result = await client.query('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = \'public\'');
        console.log(\`📊 Locaweb DB - Número de tabelas: \${result.rows[0].table_count}\`);
        
        await client.end();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com Locaweb Database:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('🔗 Testando conexões com os bancos de dados...\n');
    
    const neonResult = await testNeonDatabase();
    console.log('');
    const locawebResult = await testLocawebDatabase();
    
    console.log('\n📋 Resumo:');
    console.log(\`Neon Database: \${neonResult ? '✅ OK' : '❌ FALHOU'}\`);
    console.log(\`Locaweb Database: \${locawebResult ? '✅ OK' : '❌ FALHOU'}\`);
}

runTests();
EOL

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Instale o cliente PostgreSQL: npm install pg"
echo "2. Teste as conexões: node test-mcp-connection.js"
echo "3. Reinicie o VS Code"
echo "4. Use o Command Palette: 'MCP: Show Connected Servers'"
echo ""
echo "💡 Dica: Para usar o MCP, digite no chat do Copilot:"
echo "   'Conecte ao banco neon-database e mostre as tabelas'"
echo "   'Conecte ao banco locaweb-database e analise os dados'"
echo ""
