// Importa a classe DateTime do módulo 'luxon' para lidar com datas e horas.
const { DateTime } = require('luxon');
// Importa o modelo Paciente do diretório '../models/paciente'.
const { Paciente } = require('../models/paciente');
// Importa o prompt-sync e iniciliza ele
const prompt = require('prompt-sync')();
// Importa o modelo Consulta do diretório '../models/consulta'.
const { Consulta } = require('../models/consulta');
// Importa o operador Op do módulo 'sequelize' para realizar operações de comparação.
const { Op } = require('sequelize');

// Função assíncrona para incluir um novo paciente no cadastro.
async function incluirPaciente(cpf, nome, dataNascimento) {
    try {
        while (true) {
            // Verifica se um paciente com o mesmo CPF já está cadastrado.
            const pacienteJaCadastrado = await verificarPacienteCadastrado(cpf);

            if (pacienteJaCadastrado) {
                console.log('Um paciente com esse CPF já está cadastrado. Por favor, insira um CPF diferente.');
                // Solicita um novo CPF
                cpf = prompt('Insira um CPF válido:');
                // Volta para o início do loop
                continue;
            }

            // Cria um novo paciente no banco de dados utilizando os dados fornecidos.
            const paciente = await Paciente.create({
                cpf: cpf,
                nome: nome,
                dataNascimento: DateTime.fromFormat(dataNascimento, 'dd/MM/yyyy').toISODate(),
            });

            console.log('Paciente cadastrado com sucesso!');
            // Sai do loop se o paciente for cadastrado com sucesso
            break;
        }
    } catch (error) {
        // Em caso de erro, exibe a mensagem de erro e o lança novamente.
        console.error('Erro ao incluir paciente:', error);
        throw error;
    }
}

// Função assíncrona para verificar se um paciente está cadastrado.
async function verificarPacienteCadastrado(cpf) {
    try {
        // Busca um paciente no banco de dados com o CPF fornecido.
        const paciente = await Paciente.findOne({
            where: {
                cpf: cpf,
            },
        });

        // Retorna true se o paciente estiver cadastrado, senão retorna false.
        return paciente !== null;
    } catch (error) {
        // Em caso de erro, exibe a mensagem de erro e retorna false.
        console.error('Erro ao verificar paciente cadastrado:', error);
        return false;
    }
}

// Função assíncrona para excluir um paciente do cadastro.
async function excluirPacienteDoCadastro(cpf) {
    try {
        // Busca o paciente no banco de dados com o CPF fornecido.
        const paciente = await Paciente.findOne({
            where: {
                cpf: cpf,
            },
        });

        // Verifica se o paciente foi encontrado.
        if (paciente) {
            // Verifica se o paciente possui consultas futuras.
            const consultasFuturas = await Consulta.findAll({
                where: {
                    cpfPaciente: cpf,
                    dataConsulta: {
                        [Op.gt]: DateTime.now().toISODate(),
                    },
                },
            });

            if (consultasFuturas.length === 0) {
                // Exclui o paciente e todas as consultas agendadas para ele.
                await Paciente.destroy({
                    where: {
                        cpf: cpf,
                    },
                });

                await Consulta.destroy({
                    where: {
                        cpfPaciente: cpf,
                    },
                });

                console.log('Paciente excluído com sucesso!');
            } else {
                console.log('O paciente possui consultas futuras e não pode ser excluído.');
            }
        } else {
            console.log('Paciente não encontrado. Tente novamente.');
        }
    } catch (error) {
        // Exibe a mensagem de erro.
        console.error('Erro ao excluir paciente:', error);
    }
}


// Função assíncrona para listar os pacientes cadastrados.
async function listarPacientes(ordem) {
    try {
        // Busca e lista os pacientes do banco de dados, ordenando por nome ou CPF conforme a escolha.
        const pacientes = await Paciente.findAll({
            order: [[ordem === 'nome' ? 'nome' : 'cpf']],
        });

        // Retorna a lista de pacientes.
        return pacientes;
    } catch (error) {
        // Em caso de erro, exibe a mensagem de erro e o lança novamente.
        console.error('Erro ao listar pacientes', error);
        throw error;
    }
}

// Exporta as funções definidas neste módulo para uso em outros módulos.
module.exports = {
    incluirPaciente,
    verificarPacienteCadastrado,
    excluirPacienteDoCadastro,
    listarPacientes,
};