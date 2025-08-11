const { Client } = require('pg');

async function analyzeLocawebDatabase() {
    const client = new Client({
        connectionString: 'postgresql://sigmadb:H$kfCR!2U5@sigmadb.postgresql.dbaas.com.br:5432/sigmadb'
    });

    try {
        await client.connect();
        console.log('🔗 Conectado ao banco Locaweb (sigmadb) com sucesso!\n');

        // 1. Listar todas as tabelas
        console.log('📊 TABELAS NO BANCO:');
        console.log('==================');
        const tablesQuery = `
            SELECT 
                schemaname,
                tablename,
                tableowner
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename;
        `;
        const tables = await client.query(tablesQuery);
        
        if (tables.rows.length === 0) {
            console.log('❌ Nenhuma tabela encontrada no schema public');
        } else {
            tables.rows.forEach((table, index) => {
                console.log(`${index + 1}. ${table.tablename} (owner: ${table.tableowner})`);
            });
        }

        console.log('\n📋 ANÁLISE DETALHADA DAS TABELAS:');
        console.log('================================');

        // 2. Para cada tabela, obter informações detalhadas
        for (const table of tables.rows) {
            const tableName = table.tablename;
            
            console.log(`\n🔍 Tabela: ${tableName}`);
            console.log('─'.repeat(40));

            // Contar registros
            try {
                const countResult = await client.query(`SELECT COUNT(*) as total FROM ${tableName}`);
                console.log(`📈 Registros: ${countResult.rows[0].total}`);
            } catch (error) {
                console.log(`📈 Registros: Erro ao contar (${error.message})`);
            }

            // Obter estrutura da tabela
            const columnsQuery = `
                SELECT 
                    column_name,
                    data_type,
                    is_nullable,
                    column_default,
                    character_maximum_length
                FROM information_schema.columns 
                WHERE table_name = $1 
                AND table_schema = 'public'
                ORDER BY ordinal_position;
            `;
            
            try {
                const columns = await client.query(columnsQuery, [tableName]);
                console.log('📋 Colunas:');
                columns.rows.forEach(col => {
                    const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
                    const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
                    const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
                    console.log(`   - ${col.column_name}: ${col.data_type}${length} ${nullable}${defaultVal}`);
                });
            } catch (error) {
                console.log(`   ❌ Erro ao obter colunas: ${error.message}`);
            }

            // Amostra de dados (primeiros 3 registros)
            try {
                const sampleQuery = `SELECT * FROM ${tableName} LIMIT 3`;
                const sample = await client.query(sampleQuery);
                
                if (sample.rows.length > 0) {
                    console.log('🔍 Amostra de dados:');
                    sample.rows.forEach((row, index) => {
                        console.log(`   ${index + 1}. ${JSON.stringify(row, null, 2)}`);
                    });
                } else {
                    console.log('📝 Tabela vazia');
                }
            } catch (error) {
                console.log(`   ❌ Erro ao obter amostra: ${error.message}`);
            }
        }

        // 3. Índices
        console.log('\n🔍 ÍNDICES:');
        console.log('==========');
        const indexesQuery = `
            SELECT 
                schemaname,
                tablename,
                indexname,
                indexdef
            FROM pg_indexes 
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname;
        `;
        
        try {
            const indexes = await client.query(indexesQuery);
            if (indexes.rows.length === 0) {
                console.log('❌ Nenhum índice encontrado');
            } else {
                indexes.rows.forEach(idx => {
                    console.log(`📊 ${idx.tablename}.${idx.indexname}`);
                    console.log(`   ${idx.indexdef}`);
                });
            }
        } catch (error) {
            console.log(`❌ Erro ao obter índices: ${error.message}`);
        }

        // 4. Chaves estrangeiras
        console.log('\n🔗 RELACIONAMENTOS (FOREIGN KEYS):');
        console.log('=================================');
        const fkQuery = `
            SELECT
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public';
        `;
        
        try {
            const foreignKeys = await client.query(fkQuery);
            if (foreignKeys.rows.length === 0) {
                console.log('❌ Nenhuma chave estrangeira encontrada');
            } else {
                foreignKeys.rows.forEach(fk => {
                    console.log(`🔗 ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
                });
            }
        } catch (error) {
            console.log(`❌ Erro ao obter FKs: ${error.message}`);
        }

        // 5. Estatísticas gerais
        console.log('\n📊 ESTATÍSTICAS GERAIS:');
        console.log('=====================');
        
        try {
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_tables
                FROM information_schema.tables 
                WHERE table_schema = 'public';
            `;
            const stats = await client.query(statsQuery);
            console.log(`📋 Total de tabelas: ${stats.rows[0].total_tables}`);

            // Tamanho do banco
            const sizeQuery = `
                SELECT 
                    pg_size_pretty(pg_database_size('sigmadb')) as database_size;
            `;
            const size = await client.query(sizeQuery);
            console.log(`💾 Tamanho do banco: ${size.rows[0].database_size}`);

        } catch (error) {
            console.log(`❌ Erro ao obter estatísticas: ${error.message}`);
        }

        await client.end();
        console.log('\n✅ Análise concluída!');

    } catch (error) {
        console.error('❌ Erro ao conectar/analisar o banco:', error.message);
        
        // Sugestões de solução
        console.log('\n🔧 Possíveis soluções:');
        console.log('1. Verifique se o banco está online');
        console.log('2. Confirme as credenciais no arquivo .env');
        console.log('3. Verifique se o IP está liberado no firewall');
        console.log('4. Teste a conexão de rede: ping sigmadb.postgresql.dbaas.com.br');
    }
}

// Executar análise
analyzeLocawebDatabase();
