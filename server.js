const express = require('express');
const cors = require('cors');
const conexao = require('./bancodados');
const server = express();
server.use(express.json());
server.use(cors());
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const chavejwt = "minhasuperchave";
const users = [];

server.post('/usuarios', (req, res) => {
    const nomeUsuario = req.body.nomeUsuario;
    const senhaUsuario = req.body.senhaUsuario;
    bcrypt.hash(senhaUsuario, 10)
        .then((senhaNova) => {
            users.push({
                nomeUsuario,
                senha: senhaNova
            })
            return res.status(200).json(users);
        });
});

server.post('/login', (req, res) => {
    const nomeUsuario = req.body.nomeUsuario;
    const senhaUsuario = req.body.senhaUsuario;
    const usuario = users.find((u) => u.nomeUsuario === nomeUsuario)
    if (!usuario) {
        return res.status(400).json("Nome de usuário não encontrado.");
    }

    bcrypt.compare(senhaUsuario, usuario.senha)
        .then((senhaIgual) => {
            if (!senhaIgual) {
                return res.status(400).json("Senha de usuário inválida.");
            }
            const token = jwt.sign({ codigoUsuario: "leandro" }, chavejwt)
            res.json({ token: token });
        })
});

// Removendo a middleware de verificação de login
// server.use(verificaLogin); // Esta linha foi removida

const alunos = [];

server.get('/', (req, res) => {
    console.log('Minha rota GET');
    res.json({ mensagem: "http://localhost:3000/" });
});

server.post('/alunos', (req, res) => {
    console.log('Body requisição: ', req.body);
    const nomeAluno = req.body.nome;
    const matriculaAluno = req.body.matricula;

    // Usando placeholders para evitar injeção de SQL
    let insertSql = 'INSERT INTO alunos (nome, matricula) VALUES (?, ?)';

    // Passando os valores para a consulta, sem o campo id
    conexao.query(insertSql, [nomeAluno, matriculaAluno], (erro, resultado) => {
        if (erro) {
            console.log(erro);
            return res.status(500).json({ mensagem: "Erro ao cadastrar aluno" });
        }
        res.json({ mensagem: "Aluno cadastrado com sucesso" });
    });
});

server.get('/alunos', (req, res) => {
    const consultaSql = 'SELECT nome, matricula FROM alunos';
    conexao.query(consultaSql, (erro, resultado) => {
        if (erro) {
            console.log(erro);
            throw erro;
        }
        res.json(resultado);
    });
});

server.delete('/alunos/:idAluno', (req, res) => {
    // pegar o id do aluno
    const idAluno = req.params.idAluno;
    console.log(idAluno);

    // remover o aluno da lista
    const indiceAluno = alunos.findIndex(aluno => aluno.id == idAluno);
    if (indiceAluno < 0) {
        res.json({ mensagem: "Aluno não existe." });
        return;
    }
    alunos.splice(indiceAluno, 1);
    res.json({ mensagem: 'Aluno removido com sucesso' });
});

server.put('/alunos/:idAluno', (req, res) => {
    const idAlunoParametro = req.params.idAluno;
    const idAluno = req.body.id;
    const nomeAluno = req.body.nome;
    const matriculaAluno = req.body.matricula;

    if (idAlunoParametro != idAluno) {
        res.status(400).json({ mensagem: "Parâmetro 'idAluno' inválido." })
        return;
    }

    const aluno = alunos.find(i => i.id == idAluno);
    if (aluno === undefined) {
        res.status(400).json({ mensagem: "Aluno não encontrado." });
        return;
    }

    aluno.nome = nomeAluno;
    aluno.matricula = matriculaAluno;

    res.json({ mensagem: "Aluno atualizado com sucesso" });
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
