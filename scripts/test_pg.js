const { Client } = require('pg');

async function test() {
    const client = new Client({
        connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
    });
    try {
        await client.connect();
        console.log('✅ Connected to postgres database!');
        await client.query('CREATE DATABASE whoami');
        console.log('✅ Database whoami created successfully!');
    } catch (e) {
        console.error('❌ Database creation failed:', e.message);
    } finally {
        await client.end();
    }
}

test();
