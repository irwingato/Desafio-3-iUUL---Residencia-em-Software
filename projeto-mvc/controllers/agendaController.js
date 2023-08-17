// Importa a classe DateTime do módulo 'luxon' para lidar com datas e horas.
const { DateTime } = require('luxon');
// Importa o operador Op do módulo 'sequelize' para realizar operações de comparação.
const { Op } = require('sequelize');
// Importa o modelo Consulta do diretório '../models/consulta'.
const { Consulta } = require('../models/consulta');
// Importa o modelo Paciente do diretório '../models/paciente'.
const { Paciente } = require('../models/paciente');
// Importa o controlador de validação do diretório './validacaoController'.
const validacaoController = require('./validacaoController');
// Importa a função imprimirAgenda do diretório '../views/agendaView'.
const { imprimirAgenda } = require('../views/agendaView');

// Função assíncrona para agendar uma consulta.
async function agendarConsulta(prompt) {
    while (true) {
        try {
            // Solicita e recebe o CPF do paciente.
            const cpf = prompt('Digite o CPF do paciente: ');

            // Procura um paciente com o CPF informado no banco de dados.
            const paciente = await Paciente.findOne({
                where: {
                    cpf: cpf,
                },
            });

            // Se o paciente não for encontrado, exibe uma mensagem de erro e continua o loop.
            if (!paciente) {
                console.log('Erro: paciente não cadastrado.');
                continue;
            }

            // Verifica se o paciente já possui um agendamento futuro.
            const consultaFutura = await Consulta.findOne({
                where: {
                    cpfPaciente: cpf,
                    dataConsulta: {
                        [Op.gt]: DateTime.now().toISODate(),
                    },
                },
            });

            // Se o paciente já possuir um agendamento futuro, exibe uma mensagem de erro e continua o loop.
            if (consultaFutura) {
                console.log('Erro: O paciente já possui um agendamento futuro.');
                continue;
            }

            // Solicita e recebe a data, hora inicial e hora final da consulta.
            const dataConsulta = prompt('Digite a data da consulta (DD/MM/YYYY): ');
            const horaInicial = prompt('Digite a hora inicial da consulta (HH:mm): ');
            const horaFinal = prompt('Digite a hora final da consulta (HH:mm): ');

            // Verifica se o horário da consulta está fora do intervalo das 08:00h às 19:00h
            if (!validacaoController.validarHorarioConsulta(horaInicial)) {
                console.log('Erro: O horário da consulta deve estar no intervalo das 08:00h às 19:00h.');
                continue;
            }

            // Verifica se as horas estão em formato válido usando o controlador de validação.
            if (!validacaoController.validarFormatoHora(horaInicial) || !validacaoController.validarFormatoHora(horaFinal)) {
                console.log('Erro: formato de hora inválido. Utilize o formato HH:mm');
                continue;
            }

            // Verifica se a duração da consulta é de 15 minutos.
            if (!validacaoController.validarDuracaoConsulta(horaInicial, horaFinal)) {
                console.log('Erro: a duração da consulta deve ser de 15 minutos.');
                continue;
            }

            // Formata as datas e horas usando a biblioteca luxon.
            const dataConsultaFormatada = DateTime.fromFormat(dataConsulta, 'dd/MM/yyyy');
            const horaInicialFormatada = DateTime.fromFormat(horaInicial, 'HH:mm', { zone: 'utc' });
            const horaFinalFormatada = DateTime.fromFormat(horaFinal, 'HH:mm', { zone: 'utc' });
            const dataAtual = DateTime.now();

            // Verifica se a data e hora da consulta estão no futuro.
            if (dataConsultaFormatada <= dataAtual || (dataConsultaFormatada === dataAtual && horaInicialFormatada <= dataAtual)) {
                console.log('Erro: A data e hora da consulta devem ser para um período futuro.');
                continue;
            }

            // Verifica se a hora final é depois da hora inicial.
            if (horaFinalFormatada <= horaInicialFormatada) {
                console.log('Erro: A hora final da consulta deve ser depois da hora inicial.');
                continue;
            }

            // Verifica se já existe uma consulta no mesmo dia e horário.
            const consultaExistente = await validacaoController.validarConsulta(dataConsultaFormatada.toISODate(), horaInicialFormatada.toISOTime(), horaFinalFormatada.toISOTime());
            if (consultaExistente) {
                console.log('Erro: Já existe uma consulta marcada para o mesmo dia e horário.');
                continue;
            }

            // Calcula a duração da consulta usando o controlador de validação.
            const duracao = validacaoController.calcularTempoConsulta(horaInicial, horaFinal);

            // Cria uma nova entrada de consulta no banco de dados.
            await Consulta.create({
                cpfPaciente: cpf,
                dataConsulta: dataConsultaFormatada.toISODate(),
                horaInicio: horaInicialFormatada.toISOTime(),
                horaFim: horaFinalFormatada.toISOTime(),
                tempo: duracao,
            });

            console.log('Agendamento realizado com sucesso!');
            break;
        } catch (error) {
            console.log("Erro ao agendar consulta:", error.message);
            continue;
        }
    }
}

// Função assíncrona para cancelar o agendamento de uma consulta.
async function cancelarAgendamento(prompt) {
    while (true) {
        // Solicita e recebe o CPF do paciente.
        const cpf = prompt('Digite o CPF do paciente: ');

        // Verifica se o CPF é válido usando o controlador de validação.
        if (!validacaoController.validarCPF(cpf)) {
            console.log('Erro: CPF inválido. Digite um CPF válido.');
            continue;
        }

        // Solicita e recebe a data e hora da consulta.
        const dataConsulta = prompt('Digite a data da consulta (DD/MM/YYYY): ');
        const dataConsultaFormatada = DateTime.fromFormat(dataConsulta, 'dd/MM/yyyy');
        if (!dataConsultaFormatada.isValid) {
            console.log('Erro: Formato de data inválido. Utilize o formato DD/MM/YYYY.');
            continue;
        }

        const horaInicial = prompt('Digite a hora inicial da consulta (HH:mm): ');
        if (!validacaoController.validarFormatoHora(horaInicial)) {
            console.log('Erro: formato de hora inválido. Utilize o formato HH:mm');
            continue;
        }

        try {
            // Procura uma consulta com os dados informados no banco de dados.
            const consulta = await Consulta.findOne({
                where: {
                    cpfPaciente: cpf,
                    dataConsulta: dataConsultaFormatada.toISODate(),
                    horaInicio: DateTime.fromFormat(horaInicial, 'HH:mm', { zone: 'utc' }).toISOTime(),
                },
            });

            // Se a consulta for encontrada, a exibe, remove do banco e exibe mensagem de sucesso.
            if (consulta) {
                console.log('Consulta encontrada no banco de dados:');
                await consulta.destroy();
                console.log('Agendamento cancelado com sucesso!');
            } else {
                console.log('Agendamento não encontrado. Tente novamente.');
            }
            break;
        } catch (error) {
            console.error('Erro ao cancelar agendamento:', error);
        }
    }
}

// Função assíncrona para listar a agenda de consultas.
async function listarAgenda(opcaoListagem, prompt) {
    const dataAtual = DateTime.now();

    try {
        if (opcaoListagem.toUpperCase() === 'T') {
            // Lista as consultas agendadas para datas futuras.
            const consultasAgendadas = await Consulta.findAll({
                where: {
                    dataConsulta: {
                        [Op.gt]: dataAtual.toISODate(),
                    },
                },
            });

            // Exibe as consultas agendadas ou uma mensagem se não houver nenhuma.
            if (consultasAgendadas.length === 0) {
                console.log('Não há consultas agendadas.');
            } else {
                // Ordena as consultas por data e hora de início.
                consultasAgendadas.sort((consultaA, consultaB) => {
                    const dataHoraInicialA = new Date(consultaA.dataConsulta + 'T' + consultaA.horaInicio);
                    const dataHoraInicialB = new Date(consultaB.dataConsulta + 'T' + consultaB.horaInicio);
                    return dataHoraInicialA - dataHoraInicialB;
                });

                // Encontra o tamanho máximo do nome do paciente e da data de nascimento.
                let maxNomeLength = 0;
                let maxDataNascimentoLength = 0;
                for (const consulta of consultasAgendadas) {
                    const paciente = await Paciente.findOne({
                        where: {
                            cpf: consulta.cpfPaciente,
                        },
                    });

                    // Verifica o tamanho máximo do nome do paciente e atribui ao tamanho máximo.
                    if (paciente && paciente.nome.length > maxNomeLength) {
                        maxNomeLength = paciente.nome.length;
                    }

                    // Formata a data de nascimento para o tamanho desejado (dd/mm/yyyy).
                    const dataNascimentoFormatted = DateTime.fromISO(paciente.dataNascimento).toLocaleString({
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    });
                    
                    // Verifica se a data de nascimento formatoda é maior que o tamanho máximo e atribui ao tamanho máximo.
                    if (dataNascimentoFormatted.length > maxDataNascimentoLength) {
                        maxDataNascimentoLength = dataNascimentoFormatted.length;
                    }
                }

                // Imprime o cabeçalho da agenda com base no tamanho máximo do nome e data de nascimento.
                console.log('-----------------------------------------------------------------------------------------');
                console.log('Data           H.Ini   H.Fim Tempo Nome' + ' '.repeat(maxNomeLength - 4) + '  ' + 'Dt.Nasc.' + ' '.repeat(maxDataNascimentoLength - 8));
                console.log('-----------------------------------------------------------------------------------------');

                for (const consulta of consultasAgendadas) {
                    const paciente = await Paciente.findOne({
                        where: {
                            cpf: consulta.cpfPaciente,
                        },
                    });

                    if (paciente) {
                        // Calcula o espaçamento necessário para alinhar os campos de nome.
                        const espacoNome = ' '.repeat(maxNomeLength - paciente.nome.length);

                        // Formata a data de nascimento para o tamanho desejado (dd/mm/yyyy).
                        const dataNascimentoFormatted = DateTime.fromISO(paciente.dataNascimento).toLocaleString({
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        });

                        // Calcula o espaçamento necessário para alinhar os campos de data de nascimento.
                        const espacoDataNascimento = ' '.repeat(10 - dataNascimentoFormatted.length);
                        
                        // Imprime o conteúdo da agenda.
                        console.log(imprimirAgenda([consulta], paciente.nome, espacoNome, dataNascimentoFormatted, espacoDataNascimento));
                    } else {
                        console.log('Paciente não encontrado para o CPF:', consulta.cpfPaciente);
                    }
               }

                // Imprime o rodapé da agenda.
                console.log('-----------------------------------------------------------------------------------------');
            }
        } else if (opcaoListagem.toUpperCase() === 'P') {
            // Listagem por período personalizado.
            while (true) {
                // Solicita e recebe as datas iniciais e finais do período.
                const dataInicial = prompt('Informe a data inicial (DD/MM/YYYY): ');
                const dataFinal = prompt('Informe a data final (DD/MM/YYYY): ');
        
                // Valida o formato das datas.
                const dataFormato = 'dd/MM/yyyy';
                const dataInicialFormatada = DateTime.fromFormat(dataInicial, dataFormato, { zone: 'utc' });
                const dataFinalFormatada = DateTime.fromFormat(dataFinal, dataFormato, { zone: 'utc' });
                
                // Verifica se o formato das datas é válido.
                if (!dataInicialFormatada.isValid || !dataFinalFormatada.isValid) {
                    console.log('Erro: Formato de data inválido. Utilize o formato DD/MM/YYYY.');
                    continue;
                }
        
                // Verifica se a data final é maior ou igual à data inicial.
                if (dataFinalFormatada < dataInicialFormatada) {
                    console.log('Erro: A data final deve ser igual ou depois da data inicial.');
                    continue;
                }
        
                // Lista as consultas agendadas dentro do período especificado.
                const consultasAgendadas = await Consulta.findAll({
                    where: {
                        dataConsulta: {
                            [Op.between]: [dataInicialFormatada.toISODate(), dataFinalFormatada.toISODate()],
                        },
                    },
                });
        
                // Exibe as consultas agendadas no período ou uma mensagem se não houver nenhuma.
                if (consultasAgendadas.length === 0) {
                    console.log('Não há consultas agendadas nesse período.');
                } else {
                    // Ordena as consultas por data e hora de início.
                    consultasAgendadas.sort((consultaA, consultaB) => {
                        const dataHoraInicialA = new Date(consultaA.dataConsulta + 'T' + consultaA.horaInicio);
                        const dataHoraInicialB = new Date(consultaB.dataConsulta + 'T' + consultaB.horaInicio);
                        return dataHoraInicialA - dataHoraInicialB;
                    });
        
                    // Encontra o tamanho máximo do nome do paciente e da data de nascimento.
                    let maxNomeLength = 0;
                    let maxDataNascimentoLength = 0;
        
                    for (const consulta of consultasAgendadas) {
                        const paciente = await Paciente.findOne({
                            where: {
                                cpf: consulta.cpfPaciente,
                            },
                        });
        
                        if (paciente) {
                            // Verifica se o nome do paciente excede o tamanho máximo e atribui o valor ao tamanho máximo.
                            if (paciente.nome.length > maxNomeLength) {
                                maxNomeLength = paciente.nome.length;
                            }
                            // Formata a data de nascimento para o tamanho desejado (dd/mm/yyyy).
                            const dataNascimentoFormatted = DateTime.fromISO(paciente.dataNascimento).toLocaleString({
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                            });
                            
                            // Calcula o espaçamento necessário para alinhar os campos de data de nascimento.
                            if (dataNascimentoFormatted.length > maxDataNascimentoLength) {
                                maxDataNascimentoLength = dataNascimentoFormatted.length;
                            }
                        }
                    }
        
                    // Imprime o cabeçalho da agenda com base no tamanho máximo do nome e data de nascimento.
                    console.log('-----------------------------------------------------------------------------------------');
                    console.log('Data           H.Ini   H.Fim Tempo Nome' + ' '.repeat(maxNomeLength - 4) + '  ' + 'Dt.Nasc.' + ' '.repeat(maxDataNascimentoLength - 8));
                    console.log('-----------------------------------------------------------------------------------------');
        
                    for (const consulta of consultasAgendadas) {
                        const paciente = await Paciente.findOne({
                            where: {
                                cpf: consulta.cpfPaciente,
                            },
                        });
        
                        if (paciente) {
                            // Formata a data de nascimento para o tamanho desejado (dd/mm/yyyy).
                            const espacoNome = ' '.repeat(maxNomeLength - paciente.nome.length);
        
                            // Formata a data de nascimento para o tamanho desejado (dd/mm/yyyy).
                            const dataNascimentoFormatted = DateTime.fromISO(paciente.dataNascimento).toLocaleString({
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                            });
        
                            // Calcula o espaçamento necessário para alinhar os campos de data de nascimento.
                            const espacoDataNascimento = ' '.repeat(maxDataNascimentoLength - dataNascimentoFormatted.length);
                            // Imprime o conteúdo da agenda.
                            console.log(imprimirAgenda([consulta], paciente.nome, espacoNome, dataNascimentoFormatted, espacoDataNascimento));
                        } else {
                            // Imprime uma mensagem de erro.
                            console.log('Paciente não encontrado para o CPF:', consulta.cpfPaciente);
                        }
                    }
        
                    // Imprime o rodapé da agenda.
                    console.log('-----------------------------------------------------------------------------------------');
                }
        
                break;
            }
        } else {
            // Escreve uma mensagem de opção inválida.
            console.log('Opção inválida. Tente novamente.');
        }
    } catch (error) {
        // Exibe uma mensagem de erro.
        console.error('Erro ao listar agenda:', error);
    }
}

// Exporta as funções definidas neste módulo para uso em outros módulos.
module.exports = {
    agendarConsulta,
    cancelarAgendamento,
    listarAgenda,
};