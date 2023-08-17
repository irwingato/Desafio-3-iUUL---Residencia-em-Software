// Importa a classe DateTime do módulo 'luxon' para lidar com datas e horas.
const { DateTime } = require('luxon');
// Importa o modelo Consulta do diretório '../db'.
const { Consulta } = require('../db');

// Classe Agenda que contém métodos relacionados ao agendamento e gerenciamento de consultas.
class Agenda {
    // Método assíncrono para agendar uma consulta.
    async agendarConsulta(consulta) {
        try {
            // Cria uma nova consulta no banco de dados com os detalhes fornecidos.
            await Consulta.create({
                cpfPaciente: consulta.cpfPaciente,
                dataConsulta: consulta.dataConsulta,
                horaInicio: consulta.horaInicio,
                horaFim: consulta.horaFim,
                tempoConsulta: consulta.tempoConsulta,
            });
            console.log('Consulta agendada com sucesso!');
        } catch (error) {
            // Em caso de erro, exibe a mensagem de erro e lança uma nova exceção.
            console.error('Erro ao agendar consulta:', error);
            throw new Error('Não foi possível agendar a consulta. Por favor, tente novamente mais tarde.');
        } 
    }

    // Método assíncrono para cancelar o agendamento de uma consulta.
    async cancelarAgendamento(cpf, dataConsulta, horaInicio) {
        try {
            // Busca a consulta no banco de dados com os parâmetros fornecidos.
            const consulta = await Consulta.findOne({
                where: {
                    cpfPaciente: cpf,
                    dataConsulta: dataConsulta,
                    horaInicio: horaInicio,
                },
            });

            if (consulta) {
                // Se a consulta for encontrada, a exclui do banco de dados e retorna true.
                await consulta.destroy();
                console.log('Consulta cancelada com sucesso!');
                return true;
            } else {
                // Se a consulta não for encontrada, exibe uma mensagem e retorna false.
                console.log('Agendamento não encontrado. Tente novamente.');
                return false;
            }
        } catch (error) {
            // Em caso de erro, exibe a mensagem de erro e lança uma nova exceção.
            console.error('Erro ao cancelar agendamento:', error);
            throw new Error('Não foi possível cancelar a consulta. Por favor, tente novamente mais tarde.');
        }
    }

    // Método assíncrono para listar consultas futuras.
    async listarConsultasFuturas() {
        try {
            // Obtém a data e hora atuais.
            const dataAtual = DateTime.now();

            // Busca e retorna as consultas futuras do banco de dados.
            const consultasFuturas = await Consulta.findAll({
                where: {
                    dataConsulta: {
                        [Op.gt]: dataAtual.toISODate(),
                    },
                },
            });
            return consultasFuturas;
        } catch (error) {
            // Em caso de erro, exibe a mensagem de erro e lança uma nova exceção.
            console.error('Erro ao listar consultas futuras:', error);
            throw new Error('Não foi possível listar as consultas futuras. Por favor, tente novamente mais tarde.');
        }
    }

    // Método assíncrono para listar consultas em um período especificado.
    async listarConsultasPeriodo(dataInicial, dataFinal) {
        try {
            // Converte as datas fornecidas para objetos DateTime.
            const dataInicialFormatada = DateTime.fromFormat(dataInicial, 'dd/MM/yyyy');
            const dataFinalFormatada = DateTime.fromFormat(dataFinal, 'dd/MM/yyyy');

            // Busca e retorna as consultas dentro do período especificado do banco de dados.
            const consultasPeriodo = await Consulta.findAll({
                where: {
                    dataConsulta: {
                        [Op.between]: [dataInicialFormatada.toISODate(), dataFinalFormatada.toISODate()],
                    },
                },
            });
            return consultasPeriodo;
        } catch (error) {
            // Em caso de erro, exibe a mensagem de erro e lança uma nova exceção.
            console.error('Erro ao listar consultas no período:', error);
            throw new Error('Não foi possível listar as consultas no período especificado. Por favor, tente novamente mais tarde.');
        } 
    }
}

// Exporta a classe Agenda para uso em outros módulos.
module.exports = Agenda;