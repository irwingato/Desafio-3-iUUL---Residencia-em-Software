// Importa o objeto 'DateTime' do módulo 'luxon' para lidar com datas e horas.
const { DateTime } = require('luxon');

// Função para imprimir a agenda
function imprimirAgenda(consultas, nomePaciente, espacoNome, dataNascimentoFormatted, espacoDataNascimento) {
    const linhasAgenda = [];

    // Percorre as consultas e as formata.
    for (const consulta of consultas) {
        // Converte a data da consulta para o formato desejado (dd/mm/yyyy).
        const dataConsulta = DateTime.fromISO(consulta.dataConsulta).toLocaleString({
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        // Extrai a parte da hora (hh:mm) de 'horaInicio' e 'horaFim' da consulta.
        const horaInicio = consulta.horaInicio.substring(0, 5);
        const horaFim = consulta.horaFim.substring(0, 5);

        // Cria uma linha formatada contendo os detalhes da consulta, nome do paciente e data de nascimento.
        const linha = `${dataConsulta}     ${horaInicio}   ${horaFim} ${consulta.tempo}    ${nomePaciente}${espacoNome}  ${espacoDataNascimento}${dataNascimentoFormatted}`;

        // Adiciona a linha formatada ao array.
        linhasAgenda.push(linha);
    }

    // Verifica se há consultas para imprimir.
    if (linhasAgenda.length > 0) {
        // Retorna somente as linhas formatadas da agenda.
        return linhasAgenda.join('\n');
    } else {
        return 'Não há consultas para mostrar.';
    }
}

module.exports = {
    imprimirAgenda,
};