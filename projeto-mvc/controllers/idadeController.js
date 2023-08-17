// Importa a classe DateTime do módulo 'luxon' para lidar com datas e horas.
const { DateTime } = require('luxon');

// Função para calcular a idade de um paciente com base na data de nascimento.
function calcularIdade(dataNascimento) {
    // Converte a data de nascimento para um objeto DateTime no formato 'yyyy-MM-dd'.
    const dataNasc = DateTime.fromFormat(dataNascimento, 'yyyy-MM-dd');

    // Obtém a data e hora atual.
    const hoje = DateTime.now();

    // Calcula a diferença de anos entre o ano atual e o ano de nascimento.
    let idade = hoje.year - dataNasc.year;

    // Verifica se o mês atual é menor que o mês de nascimento ou se é o mesmo mês, mas o dia atual é menor que o dia de nascimento.
    // Se sim, subtrai um ano da idade, já que o paciente ainda não completou o aniversário deste ano.
    if (hoje.month < dataNasc.month || (hoje.month === dataNasc.month && hoje.day < dataNasc.day)) {
        idade--;
    }

    // Retorna a idade calculada.
    return idade;
}

// Exporta a função calcularIdade para uso em outros módulos.
module.exports = {
    calcularIdade,
};