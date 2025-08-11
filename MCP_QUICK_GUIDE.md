# Guia Rápido: Usando MCP PostgreSQL

## Como Executar a Configuração

```bash
# 1. Execute o script de configuração
./setup-mcp-postgres.sh

# 2. Edite suas credenciais no arquivo .env.local
# Abra o arquivo e configure:
# POSTGRES_USER=seu_usuario
# POSTGRES_PASSWORD=sua_senha

# 3. Inicialize o banco de dados
psql -f init-database.sql

# 4. Teste a conexão
node test-mcp-connection.js
```

## Comandos MCP Úteis

Uma vez configurado, você pode usar estes comandos no chat do GitHub Copilot:

### 📊 Exploração de Dados
```
"Mostre-me todas as tabelas do banco nextjs_dashboard"
"Descreva a estrutura da tabela users"
"Liste os últimos 10 registros da tabela invoices"
"Quantos usuários temos cadastrados?"
```

### 🔍 Consultas Específicas
```
"Busque todos os clientes com faturas pendentes"
"Mostre o total de vendas por mês"
"Liste os clientes que mais fizeram pedidos"
"Encontre faturas vencidas"
```

### 🛠️ Modificações
```
"Crie uma nova tabela products com id, name, price, description"
"Adicione uma coluna phone na tabela customers"
"Insira um novo cliente com nome 'Empresa ABC'"
"Atualize o status da fatura ID 5 para 'paid'"
```

### 📈 Análises
```
"Gere um relatório de vendas do último trimestre"
"Mostre as estatísticas da tabela customers"
"Analise o desempenho das vendas por cliente"
"Crie um gráfico das faturas por status"
```

### 🔧 Manutenção
```
"Otimize a performance da tabela invoices"
"Verifique a integridade referencial do banco"
"Mostre índices existentes nas tabelas"
"Sugira melhorias no esquema do banco"
```

## Funcionalidades Avançadas

### Importação de Dados
- Carregar CSVs diretamente nas tabelas
- Fazer bulk inserts de grandes volumes
- Migrar dados entre ambientes

### Visualizações
- Gerar diagramas ER automaticamente
- Criar dashboards de dados
- Exportar relatórios em diferentes formatos

### Segurança
- Controlar permissões por usuário
- Auditoria de operações
- Backup e restore automatizados

## Solução de Problemas

### ❌ "Servidor MCP não conectado"
```bash
# Verifique se o PostgreSQL está rodando
brew services start postgresql
# ou
sudo service postgresql start

# Teste a conexão manualmente
psql -h localhost -U postgres -d nextjs_dashboard
```

### ❌ "Permissão negada"
```sql
-- Reconecte como superusuário e execute:
GRANT ALL PRIVILEGES ON DATABASE nextjs_dashboard TO mcp_dev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mcp_dev;
```

### ❌ "Módulo não encontrado"
```bash
# Reinstale as dependências
npm install --save-dev @modelcontextprotocol/server-postgres pg
```

## Dicas de Uso

1. **Seja específico**: "Mostre faturas do cliente ID 3" é melhor que "mostre faturas"
2. **Use contexto**: "Baseado na tabela customers, crie uma query para..."
3. **Peça explicações**: "Explique esta query antes de executar"
4. **Valide mudanças**: "Confirme os dados antes de fazer UPDATE"

## Comandos de Manutenção

```bash
# Backup do banco
pg_dump nextjs_dashboard > backup.sql

# Restore do banco
psql nextjs_dashboard < backup.sql

# Verificar logs do MCP
tail -f ~/.vscode/logs/mcp-postgres.log

# Reiniciar servidor MCP
# Command Palette > "MCP: Restart Server"
```

Agora você está pronto para usar o poder total do MCP PostgreSQL no seu desenvolvimento! 🚀
