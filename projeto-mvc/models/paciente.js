// Importa o objeto 'sequelize' e o tipo de dado 'DataTypes' do diretório '../db'.
const { sequelize, DataTypes } = require('../db');

// Define o modelo de dados 'Paciente' utilizando o objeto 'sequelize.define'.
const Paciente = sequelize.define('Paciente', {
    // Define o atributo 'cpf' como uma string, que é a chave primária da tabela.
    cpf: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    // Define o atributo 'nome' como uma string, que não pode ser nulo.
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Define o atributo 'dataNascimento' como uma data (apenas data), que não pode ser nulo.
    dataNascimento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
});

// Exporta o modelo 'Paciente' para uso em outros módulos.
module.exports = { Paciente };