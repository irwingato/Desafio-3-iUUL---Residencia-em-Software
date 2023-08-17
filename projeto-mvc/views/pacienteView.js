const idadeController = require('../controllers/idadeController');
const consultaController = require('../controllers/consultaController');
const { DateTime } = require('luxon');

async function exibirListaPacientes(pacientesListados, ordem) {
  // Exibe um cabeçalho indicando a opção selecionada e a ordem de ordenação.
  console.log(`Opção 3 selecionada: Listar pacientes (ordenado por ${ordem})`);
  console.log("------------------------------------------------------------------------------");
  console.log("CPF                Nome                                       Dt.Nasc.   Idade");
  console.log("------------------------------------------------------------------------------");

  try {
    for (const paciente of pacientesListados) {
      // Divide a data de nascimento do paciente em partes (ano, mês, dia) e formata como DD/MM/YYYY
      const dataNascimentoParts = paciente.dataNascimento.split("-");
      const dataFormatada = `${dataNascimentoParts[2]}/${dataNascimentoParts[1]}/${dataNascimentoParts[0]}`;
      
      // Calcula a idade do paciente usando a função do módulo 'idadeController'.
      const idade = idadeController.calcularIdade(paciente.dataNascimento);

      // Imprime os detalhes do paciente formatados em colunas.
      console.log(
        paciente.cpf + "        " +
        paciente.nome.padEnd(40) + // Formatação para alinhar à direita com um tamanho de 40 caracteres
        dataFormatada + "     " +
        idade
      );

      // Obtém as consultas futuras do paciente usando a função do módulo 'consultaController'.
      const consultasFuturas = await consultaController.obterConsultasFuturas(paciente.cpf);

      if (consultasFuturas.length > 0) {
        const consultaFutura = consultasFuturas[0];

        // Formata a data da consulta para o formato desejado (no exemplo, 'DD/MM/YYYY')
        const dataFormatadaConsulta = DateTime.fromISO(consultaFutura.dataConsulta).toFormat('dd/MM/yyyy');

        // Formata as horas de início e fim das consultas futuras
        const horaInicioFormatada = DateTime.fromISO(consultaFutura.horaInicio, { zone: 'UTC' }).toFormat('HH:mm');
        const horaFimFormatada = DateTime.fromISO(consultaFutura.horaFim, { zone: 'UTC' }).toFormat('HH:mm');

        console.log("                    Agendado para:", dataFormatadaConsulta);
        console.log("                    ", horaInicioFormatada, "às", horaFimFormatada);
      }
    }
    console.log("------------------------------------------------------------------------------");
  } catch (error) {
    // Em caso de erro, imprime uma mensagem de erro.
    console.error('Erro ao exibir lista de pacientes:', error);
  }
}

// Exporta a função 'exibirListaPacientes' para uso em outros módulos.
module.exports = {
  exibirListaPacientes,
};
