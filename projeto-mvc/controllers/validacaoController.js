// Importa a classe DateTime do módulo 'luxon' para lidar com datas e horas.
const { DateTime } = require('luxon');
// Importa o operador Op do módulo 'sequelize' para realizar operações de comparação.
const { Op } = require('sequelize');
// Importa o modelo Consulta do diretório '../models/consulta'.
const { Consulta } = require('../models/consulta');

// Função para validar o CPF.
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Remove todos os caracteres não numéricos do CPF.

    // Verifica se o CPF possui 11 dígitos.
    if (cpf.length !== 11) {
        return false;
    }

    // Verifica se o CPF possui todos os dígitos iguais.
    if (/^(\d)\1+$/.test(cpf)) {
        return false;
    }

    // Realiza a validação do dígito verificador do CPF.
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.charAt(9))) {
        return false;
    }

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.charAt(10))) {
        return false;
    }

    return true; // Retorna verdadeiro se o CPF é válido.
}

// Função para validar o nome.
function validarNome(nome) {
    return nome.length >= 5; // Retorna verdadeiro se o nome possui pelo menos 5 caracteres.
}

// Função para validar a data de nascimento.
function validarDataNascimento(dataNascimento) {
    const dataAtual = DateTime.now(); // Obtém a data e hora atuais.
    const dataNasc = DateTime.fromFormat(dataNascimento, 'dd/MM/yyyy'); // Converte a string da data de nascimento para um objeto DateTime.

    // Verifica se a data de nascimento é válida e se o paciente tem pelo menos 13 anos.
    return dataNasc.isValid && dataAtual.diff(dataNasc, 'years').years >= 13;
}

// Função para validar se a data é válida e maior que a data atual.
function validarDataFutura(data) {
    const dataFormatada = DateTime.fromFormat(data, 'dd/MM/yyyy');
    const dataAtual = DateTime.now();
    return dataFormatada.isValid && dataFormatada > dataAtual;
}

// Função para calcular a duração de uma consulta em minutos.
function calcularTempoConsulta(horaInicial, horaFinal) {
    const horaInicialFormatada = DateTime.fromFormat(horaInicial, 'HH:mm');
    const horaFinalFormatada = DateTime.fromFormat(horaFinal, 'HH:mm');

    const diffMilliseconds = horaFinalFormatada.diff(horaInicialFormatada).milliseconds;
    const diffMinutes = diffMilliseconds / (1000 * 60);

    return diffMinutes;
}

// Função para validar o formato de hora (HH:mm).
function validarFormatoHora(hora) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
}

// Função para validar se a duração da consulta é de 15 minutos
function validarDuracaoConsulta(horaInicial, horaFinal) {
    const horaInicialObj = new Date(`01/01/2000 ${horaInicial}`);
    const horaFinalObj = new Date(`01/01/2000 ${horaFinal}`);
    // Calcula a diferença em minutos
    const diffInMinutes = (horaFinalObj - horaInicialObj) / 60000; 

    return diffInMinutes === 15;
}

// Função para validar o horário da consulta
function validarHorarioConsulta(horaInicial) {
    const horarioConsulta = DateTime.fromFormat(horaInicial, 'HH:mm');
    const horarioInicio = DateTime.fromISO('08:00');
    const horarioFim = DateTime.fromISO('19:00');

    return horarioConsulta >= horarioInicio && horarioConsulta < horarioFim;
}

// Função para validar uma consulta.
async function validarConsulta(dataConsulta, horaInicio, horaFim) {
    // Verifica se já existe uma consulta no mesmo dia e horário.
    const consultaExistente = await Consulta.findOne({
        where: {
            dataConsulta: dataConsulta,
            [Op.or]: [
                {
                    horaInicio: {
                        [Op.between]: [horaInicio, horaFim],
                    },
                },
                {
                    horaFim: {
                        [Op.between]: [horaInicio, horaFim],
                    },
                },
                {
                    [Op.and]: [
                        { horaInicio: { [Op.lte]: horaInicio } },
                        { horaFim: { [Op.gte]: horaFim } },
                    ],
                },
            ],
        },
    });
    // Verifica se já existe uma consulta no mesmo dia e horário.
    if (consultaExistente) {
        throw new Error('Já existe uma consulta marcada para o mesmo dia e horário.');
    }
}

// Exporta as funções definidas neste módulo para uso em outros módulos.
module.exports = {
    validarCPF,
    validarNome,
    validarDataNascimento,
    validarDataFutura,
    calcularTempoConsulta,
    validarFormatoHora,
    validarDuracaoConsulta,
    validarHorarioConsulta,
    validarConsulta,
};