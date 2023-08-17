// Importa o objeto 'Sequelize' e 'DataTypes' do módulo 'sequelize'.
const { Sequelize, DataTypes } = require('sequelize');

// Define as informações de conexão com o banco de dados PostgreSQL.
const sequelize = new Sequelize({
  database: 'Clinica Odontologica', // Nome do banco de dados padrão do PostgreSQL
  username: 'postgres',
  password: 'QaZOkM147!@',
  host: 'localhost', // ou o host do seu PostgreSQL
  port: 5432, // Porta padrão do PostgreSQL
  dialect: 'postgres', // Define o dialeto como PostgreSQL
  logging: false, // Desativa a saída de logs de consultas SQL no console.
});

// Definição do modelo 'Paciente'.
const Paciente = sequelize.define('Paciente', {
    cpf: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true, // Define a chave primária como o atributo 'cpf'.
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dataNascimento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
});

// Definição do modelo 'Consulta'.
const Consulta = sequelize.define('Consulta', {
    dataConsulta: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    horaInicio: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    horaFim: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    tempo: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

// Estabelece o relacionamento entre Paciente e Consulta.
Paciente.hasMany(Consulta, { foreignKey: 'cpfPaciente', sourceKey: 'cpf' }); // Um paciente pode ter várias consultas.
Consulta.belongsTo(Paciente, { foreignKey: 'cpfPaciente', targetKey: 'cpf' }); // Uma consulta pertence a um paciente.

// Autentica a conexão com o banco de dados.
sequelize.authenticate()
    .then(() => {
        console.log('Conexão com o banco de dados estabelecida com sucesso');
    })
    .catch((error) => {
        console.error('Erro ao conectar ao banco de dados:', error);
    });

// Sincroniza o modelo com o banco de dados (cria tabelas se não existirem).
sequelize.sync()
    .then(() => {
        console.log('Tabelas sincronizadas com o banco de dados.');
    })
    .catch((error) => {
        console.error('Erro ao sincronizar tabelas:', error);
    });

// Exporta objetos e modelos para serem utilizados em outros módulos.
module.exports = {
    sequelize,
    DataTypes,
    Paciente,
    Consulta,
};