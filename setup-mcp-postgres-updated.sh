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

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado. Por favor, configure suas credenciais do PostgreSQL primeiro."
    exit 1
else
    echo "✅ Arquivo .env encontrado com configurações dos bancos"
fi

# Instalar servidor MCP PostgreSQL
echo "📦 Instalando servidor MCP PostgreSQL..."
npm install --save-dev @modelcontextprotocol/server-postgres

# Instalar cliente PostgreSQL se não estiver instalado
if ! npm list pg > /dev/null 2>&1; then
    echo "📦 Instalando cliente PostgreSQL..."
    npm install pg
else
    echo "✅ Cliente PostgreSQL já instalado"
fi

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
echo "1. Teste as conexões: node test-mcp-connection.js"
echo "2. Reinicie o VS Code"
echo "3. Use o Command Palette: 'MCP: Show Connected Servers'"
echo ""
echo "💡 Dica: Para usar o MCP, digite no chat do Copilot:"
echo "   'Conecte ao banco neon-database e mostre as tabelas'"
echo "   'Conecte ao banco locaweb-database e analise os dados'"
echo ""
