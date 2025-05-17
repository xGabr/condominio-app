const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'condominio.db');
const db = new sqlite3.Database(dbPath);

// Criar tabela de moradores
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS moradores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            documento TEXT,
            telefone TEXT,
            email TEXT,
            tipo TEXT CHECK(tipo IN ('Morador', 'Airbnb', 'Charlie')) DEFAULT 'Morador',
            data_entrada DATE NOT NULL,
            data_saida DATE,
            ativo BOOLEAN DEFAULT 1
        )
    `);
});

// Funções do banco de dados
const cadastrarMorador = (nome, documento, telefone, email, tipo, data_entrada) => {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO moradores (nome, documento, telefone, email, tipo, data_entrada) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, documento, telefone, email, tipo, data_entrada],
            function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            }
        );
    });
};

const listarMoradores = (tipo = null, busca = null) => {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM moradores WHERE ativo = 1';
        const params = [];
        
        if (tipo) {
            query += ' AND tipo = ?';
            params.push(tipo);
        }
        
        if (busca) {
            query += ' AND (nome LIKE ? OR documento LIKE ? OR telefone LIKE ? OR email LIKE ?)';
            const buscaTerm = `%${busca}%`;
            params.push(buscaTerm, buscaTerm, buscaTerm, buscaTerm);
        }
        
        query += ' ORDER BY nome';
        
        db.all(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

const atualizarMorador = (id, nome, documento, telefone, email, tipo, data_entrada, data_saida) => {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE moradores SET nome = ?, documento = ?, telefone = ?, email = ?, tipo = ?, data_entrada = ?, data_saida = ? WHERE id = ?',
            [nome, documento, telefone, email, tipo, data_entrada, data_saida, id],
            function(err) {
                if (err) return reject(err);
                resolve(this.changes);
            }
        );
    });
};

const desativarMorador = (id) => {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE moradores SET ativo = 0 WHERE id = ?',
            [id],
            function(err) {
                if (err) return reject(err);
                resolve(this.changes);
            }
        );
    });
};

const getMoradorById = (id) => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM moradores WHERE id = ?',
            [id],
            (err, row) => {
                if (err) return reject(err);
                resolve(row);
            }
        );
    });
};

module.exports = {
    cadastrarMorador,
    listarMoradores,
    atualizarMorador,
    desativarMorador,
    getMoradorById
};


