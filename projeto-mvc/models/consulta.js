// Importa o objeto 'sequelize' e o tipo de dado 'DataTypes' do diretório '../db'.
const { sequelize, DataTypes } = require('../db');

// Define o modelo 'Consulta' utilizando o objeto 'sequelize.define'.
const Consulta = sequelize.define('Consulta', {
    // Define o atributo 'cpfPaciente' como uma string, que não pode ser nulo.
    cpfPaciente: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Define o atributo 'dataConsulta' como uma data (apenas data), que não pode ser nulo.
    dataConsulta: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    // Define o atributo 'horaInicio' como uma string, que não pode ser nulo.
    horaInicio: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Define o atributo 'horaFim' como uma string, que não pode ser nulo.
    horaFim: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Define o atributo 'tempo' como um número inteiro, que não pode ser nulo.
    tempo: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

// Exporta o modelo 'Consulta' para uso em outros módulos.
module.exports = { Consulta };