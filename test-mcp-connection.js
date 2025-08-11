const { Client } = require('pg');

async function testNeonDatabase() {
    const client = new Client({
        connectionString: 'postgres://neondb_owner:npg_OPjy3GYfl0HU@ep-wandering-snowflake-acupessu-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
    });

    try {
        await client.connect();
        console.log('✅ Conexão com Neon Database estabelecida com sucesso!');
        
        const result = await client.query('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = \'public\'');
        console.log(`📊 Neon DB - Número de tabelas: ${result.rows[0].table_count}`);
        
        await client.end();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com Neon Database:', error.message);
        return false;
    }
}

async function testLocawebDatabase() {
    const client = new Client({
        connectionString: 'postgresql://sigmadb:H$kfCR!2U5@sigmadb.postgresql.dbaas.com.br:5432/sigmadb'
    });

    try {
        await client.connect();
        console.log('✅ Conexão com Locaweb Database estabelecida com sucesso!');
        
        const result = await client.query('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = \'public\'');
        console.log(`📊 Locaweb DB - Número de tabelas: ${result.rows[0].table_count}`);
        
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
    console.log(`Neon Database: ${neonResult ? '✅ OK' : '❌ FALHOU'}`);
    console.log(`Locaweb Database: ${locawebResult ? '✅ OK' : '❌ FALHOU'}`);
}

runTests();
