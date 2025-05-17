const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database/database');

const app = express();
const PORT = 3333;

// Configurações
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/cadastrar', async (req, res) => {
    const { nome, documento, telefone, email, tipo, data_entrada } = req.body;
    
    if (!nome || !tipo || !data_entrada) {
        return res.status(400).send('Nome, tipo e data de entrada são obrigatórios');
    }

    try {
        await db.cadastrarMorador(nome, documento, telefone, email, tipo, data_entrada);
        res.redirect('/moradores');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao cadastrar morador');
    }
});


app.get('/moradores', async (req, res) => {
    const tipo = req.query.tipo || null;
    const busca = req.query.busca || null;
    
    try {
        const moradores = await db.listarMoradores(tipo, busca);
        res.render('moradores', { moradores, tipo, busca });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao listar moradores');
    }
});

app.get('/moradores/editar/:id', async (req, res) => {
    try {
        const morador = await db.getMoradorById(req.params.id);
        if (!morador) {
            return res.status(404).send('Morador não encontrado');
        }
        res.render('editar-morador', { morador });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar morador');
    }
});

app.post('/moradores/editar/:id', async (req, res) => {
    const { nome, documento, telefone, email, tipo, data_entrada, data_saida } = req.body;
    
    try {
        await db.atualizarMorador(
            req.params.id,
            nome,
            documento,
            telefone,
            email,
            tipo,
            data_entrada,
            data_saida
        );
        res.redirect('/moradores');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar morador');
    }
});

app.post('/moradores/excluir/:id', async (req, res) => {
    try {
        await db.desativarMorador(req.params.id);
        res.redirect('/moradores');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao excluir morador');
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

