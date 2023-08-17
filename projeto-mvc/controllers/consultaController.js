// Importa a classe DateTime do módulo 'luxon' para lidar com datas e horas.
const { DateTime } = require('luxon');
// Importa as funções de validação de CPF, nome e data de nascimento do controlador 'validacaoController'.
const { validarCPF, validarNome, validarDataNascimento } = require('./validacaoController');
// Importa o modelo Consulta do diretório '../models/consulta'.
const { Consulta } = require('../models/consulta');
// Importa Op do módulo 'sequelize' para realizar operações de comparação.
const { Op } = require('sequelize');
// Importa o modelo Paciente do diretório '../models/paciente'.
const { Paciente } = require('../models/paciente');

// Função para ler os dados de um paciente a partir do prompt e retorna um objeto com as informações lidas.
function lerDadosPaciente(prompt) {
    while (true) {
        // Solicita e recebe o CPF do paciente.
        const cpf = prompt('CPF: ');

        // Valida o CPF usando a função validarCPF.
        if (!validarCPF(cpf)) {
            console.log('CPF inválido. Tente novamente.');
            continue;
        }

        // Solicita e recebe o nome do paciente.
        const nome = prompt('Nome: ');

        // Valida o nome usando a função validarNome.
        if (!validarNome(nome)) {
            console.log('Nome inválido. O nome deve ter pelo menos 5 caracteres.');
            continue;
        }

        // Solicita e recebe a data de nascimento do paciente.
        const dataNascimento = prompt('Data de nascimento (formato DD/MM/YYYY): ');

        // Valida a data de nascimento usando a função validarDataNascimento.
        if (!validarDataNascimento(dataNascimento)) {
            console.log('Data de nascimento inválida. O paciente deve ter pelo menos 13 anos.');
            continue;
        }

        // Retorna um objeto com as informações do paciente.
        return { cpf, nome, dataNascimento };
    }
}

// Função para verificar se um paciente possui consultas futuras agendadas.
function temConsultaFutura(cpf) {
    // Filtra as consultas do paciente com CPF fornecido que estão no futuro.
    const consultasFuturas = consultas.filter(
        (consulta) => consulta.cpf === cpf && DateTime.fromISO(consulta.data) > DateTime.now()
    );

    // Retorna verdadeiro se existir pelo menos uma consulta futura.
    return consultasFuturas.length > 0;
}

// Função para obter as consultas passadas de um paciente.
function obterConsultasPassadas(cpf) {
    // Filtra as consultas do paciente com CPF fornecido que já ocorreram.
    const consultasPassadas = consultas.filter(
        (consulta) => consulta.cpf === cpf && DateTime.fromISO(consulta.data) < DateTime.now()
    );

    // Retorna as consultas passadas encontradas.
    return consultasPassadas;
}

// Função assíncrona para obter as consultas futuras de um paciente pelo CPF do paciente.
async function obterConsultasFuturas(cpfPaciente) {
    try {
        const consultasFuturas = await Consulta.findAll({
            where: {
                // Filtra consultas do paciente com CPF fornecido
                cpfPaciente: cpfPaciente,
                dataConsulta: {
                    // Filtra consultas com data de consulta futura
                    [Op.gt]: new Date() 
                }
            }
        });

        // Retorna as consultas futuras.
        return consultasFuturas;
    } catch (error) {
        // Em caso de erro, exibe a mensagem de erro e o lança novamente.
        console.error('Erro ao obter consultas futuras:', error);
        throw error;
    }
}

// Exporta as funções definidas neste módulo para uso em outros módulos.
module.exports = {
    lerDadosPaciente,
    temConsultaFutura,
    obterConsultasPassadas,
    obterConsultasFuturas,
};