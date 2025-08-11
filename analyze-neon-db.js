const { Client } = require('pg');

async function analyzeNeonDatabase() {
    const client = new Client({
        connectionString: 'postgres://neondb_owner:npg_OPjy3GYfl0HU@ep-wandering-snowflake-acupessu-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
    });

    try {
        await client.connect();
        console.log('🔗 Conectado ao Neon Database com sucesso!\n');

        // 1. Informações básicas do banco
        console.log('🗃️  INFORMAÇÕES DO BANCO:');
        console.log('=======================');
        
        const versionQuery = 'SELECT version() as version';
        const version = await client.query(versionQuery);
        console.log(`📊 Versão: ${version.rows[0].version}`);

        const sizeQuery = `SELECT pg_size_pretty(pg_database_size('neondb')) as database_size`;
        const size = await client.query(sizeQuery);
        console.log(`💾 Tamanho: ${size.rows[0].database_size}`);

        // 2. Listar todos os schemas
        console.log('\n📋 SCHEMAS DISPONÍVEIS:');
        console.log('======================');
        const schemasQuery = `
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
            ORDER BY schema_name;
        `;
        const schemas = await client.query(schemasQuery);
        schemas.rows.forEach((schema, index) => {
            console.log(`${index + 1}. ${schema.schema_name}`);
        });

        // 3. Listar todas as tabelas
        console.log('\n📊 TABELAS NO BANCO:');
        console.log('==================');
        const tablesQuery = `
            SELECT 
                schemaname,
                tablename,
                tableowner
            FROM pg_tables 
            WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
            ORDER BY schemaname, tablename;
        `;
        const tables = await client.query(tablesQuery);
        
        if (tables.rows.length === 0) {
            console.log('❌ Nenhuma tabela encontrada');
        } else {
            let currentSchema = '';
            tables.rows.forEach((table, index) => {
                if (table.schemaname !== currentSchema) {
                    currentSchema = table.schemaname;
                    console.log(`\n📁 Schema: ${currentSchema}`);
                    console.log('─'.repeat(30));
                }
                console.log(`  ${index + 1}. ${table.tablename} (owner: ${table.tableowner})`);
            });
        }

        // 4. Para cada tabela no schema public, obter informações detalhadas
        const publicTables = tables.rows.filter(t => t.schemaname === 'public');
        
        if (publicTables.length > 0) {
            console.log('\n📋 ANÁLISE DETALHADA DAS TABELAS DO SCHEMA PUBLIC:');
            console.log('================================================');

            for (const table of publicTables) {
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
        }

        // 5. Views
        console.log('\n👁️  VIEWS:');
        console.log('=========');
        const viewsQuery = `
            SELECT 
                schemaname,
                viewname,
                viewowner
            FROM pg_views 
            WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
            ORDER BY schemaname, viewname;
        `;
        
        try {
            const views = await client.query(viewsQuery);
            if (views.rows.length === 0) {
                console.log('❌ Nenhuma view encontrada');
            } else {
                views.rows.forEach(view => {
                    console.log(`📊 ${view.schemaname}.${view.viewname} (owner: ${view.viewowner})`);
                });
            }
        } catch (error) {
            console.log(`❌ Erro ao obter views: ${error.message}`);
        }

        // 6. Funções
        console.log('\n🔧 FUNÇÕES:');
        console.log('==========');
        const functionsQuery = `
            SELECT 
                n.nspname as schema_name,
                p.proname as function_name,
                pg_catalog.pg_get_function_result(p.oid) as return_type,
                pg_catalog.pg_get_function_arguments(p.oid) as arguments
            FROM pg_proc p
            LEFT JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
            AND p.prokind = 'f'
            ORDER BY n.nspname, p.proname;
        `;
        
        try {
            const functions = await client.query(functionsQuery);
            if (functions.rows.length === 0) {
                console.log('❌ Nenhuma função encontrada');
            } else {
                functions.rows.forEach(func => {
                    console.log(`⚙️  ${func.schema_name}.${func.function_name}(${func.arguments}) → ${func.return_type}`);
                });
            }
        } catch (error) {
            console.log(`❌ Erro ao obter funções: ${error.message}`);
        }

        // 7. Índices
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
                console.log('❌ Nenhum índice encontrado no schema public');
            } else {
                indexes.rows.forEach(idx => {
                    console.log(`📊 ${idx.tablename}.${idx.indexname}`);
                    console.log(`   ${idx.indexdef}`);
                });
            }
        } catch (error) {
            console.log(`❌ Erro ao obter índices: ${error.message}`);
        }

        // 8. Chaves estrangeiras
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

        // 9. Extensões instaladas
        console.log('\n🧩 EXTENSÕES INSTALADAS:');
        console.log('=======================');
        const extensionsQuery = `
            SELECT 
                extname as name,
                extversion as version,
                nspname as schema
            FROM pg_extension e
            JOIN pg_namespace n ON n.oid = e.extnamespace
            ORDER BY extname;
        `;
        
        try {
            const extensions = await client.query(extensionsQuery);
            if (extensions.rows.length === 0) {
                console.log('❌ Nenhuma extensão encontrada');
            } else {
                extensions.rows.forEach(ext => {
                    console.log(`🧩 ${ext.name} v${ext.version} (schema: ${ext.schema})`);
                });
            }
        } catch (error) {
            console.log(`❌ Erro ao obter extensões: ${error.message}`);
        }

        // 10. Estatísticas gerais
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
            console.log(`📋 Total de tabelas no schema public: ${stats.rows[0].total_tables}`);

            const totalSchemasQuery = `
                SELECT COUNT(*) as total_schemas
                FROM information_schema.schemata 
                WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast');
            `;
            const totalSchemas = await client.query(totalSchemasQuery);
            console.log(`📁 Total de schemas: ${totalSchemas.rows[0].total_schemas}`);

        } catch (error) {
            console.log(`❌ Erro ao obter estatísticas: ${error.message}`);
        }

        await client.end();
        console.log('\n✅ Análise do Neon Database concluída!');

    } catch (error) {
        console.error('❌ Erro ao conectar/analisar o Neon Database:', error.message);
        
        // Sugestões de solução
        console.log('\n🔧 Possíveis soluções:');
        console.log('1. Verifique se o banco está online');
        console.log('2. Confirme as credenciais no arquivo .env');
        console.log('3. Verifique se o IP está liberado no Neon');
        console.log('4. Teste a conectividade de rede');
    }
}

// Executar análise
analyzeNeonDatabase();
