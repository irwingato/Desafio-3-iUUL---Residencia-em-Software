// Importa o módulo 'idadeController' que contém a função 'calcularIdade'.
const idadeController = require('../controllers/idadeController');
// Importa o módulo 'consultaController' que contém a função 'obterConsultasPassadas'.
const consultaController = require('../controllers/consultaController');
// Importa a classe DateTime do módulo 'luxon' para lidar com datas e horas.
const { DateTime } = require('luxon');

// Função para exibir a lista de pacientes ordenada por uma determinada ordem.
async function exibirListaPacientes(pacientesListados, ordem) {
  // Imprime um cabeçalho indicando a opção selecionada e a ordem de ordenação.
  console.log(`Opção 3 selecionada: Listar pacientes (ordenado por ${ordem})`);
  console.log("------------------------------------------------------------------------------");
  console.log("CPF                Nome                                       Dt.Nasc.   Idade");
  console.log("------------------------------------------------------------------------------");

  try {
    // Itera sobre cada paciente na lista de pacientes listados.
    for (const paciente of pacientesListados) {
      const dataNascimentoParts = paciente.dataNascimento.split("-"); // Divide a data em partes (ano, mês, dia)
      const dataFormatada = `${dataNascimentoParts[2]}/${dataNascimentoParts[1]}/${dataNascimentoParts[0]}`; // Formata a data como DD/MM/YYYY
      const idade = idadeController.calcularIdade(paciente.dataNascimento); // Calcula a idade do paciente usando a função do módulo 'idadeController'.

      // Imprime os detalhes do paciente formatados em colunas.
      console.log(
        paciente.cpf + "        " +
        paciente.nome.padEnd(40) + // Formatação para alinhar à direita com um tamanho de 40 caracteres
        dataFormatada + "     " +
        idade
      );

      // Obtém as consultas futuras do paciente usando a função do módulo 'consultaController'.
      const consultasFuturas = await consultaController.obterConsultasFuturas(paciente.cpf);

      // Verifica se há consultas futuras para o paciente.
      if (consultasFuturas.length > 0) {
        // Formata a data da consulta para o formato desejado (no exemplo, 'DD/MM/YYYY')
        const dataFormatadaConsulta = DateTime.fromISO(consultasFuturas[0].dataConsulta).toFormat('dd/MM/yyyy');

        // Formata as horas de início e fim das consultas futuras
        const horaInicioFormatada = DateTime.fromISO(consultasFuturas[0].horaInicio).toFormat('HH:mm');
        const horaFimFormatada = DateTime.fromISO(consultasFuturas[0].horaFim).toFormat('HH:mm');

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