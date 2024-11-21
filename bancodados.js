const mysql = require('mysql2');

const conexao = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'matriculas'
});

conexao.connect((erro) => {
    if (erro != null) {
        console.log('Deu erro: ', erro.message);
        return;
    }
    console.log('Conectado com sucesso!');
       
    const checaTabelaSql = 'SELECT 1+1 FROM alunos';
    conexao.query(checaTabelaSql, (erro, resultado) => {
        if (!erro) return;
        const criaTabelaSql = 'CREATE TABLE alunos (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(150) NOT NULL, matricula VARCHAR(10) NOT NULL)';
        conexao.query(criaTabelaSql, (erroCriaTabela, resultadoCriaTabela) => {
            if (erroCriaTabela) {
                throw erroCriaTabela; 
            }
            console.log('Tabela alunos criada com sucesso!');
        });
    });
});

module.exports = conexao;