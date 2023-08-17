// Importações de módulos e controladores
const agendaController = require('./controllers/agendaController');
const pacienteController = require('./controllers/pacienteController');
const consultaController = require('./controllers/consultaController');
const PromptSync = require('prompt-sync');
const pacienteView = require('./views/pacienteView');
const { sequelize } = require ('./db');

// Criação de uma instância PromptSync para interação com o usuário via linha de comando
const prompt = PromptSync({ sigint: true });

// Variável para controle do encerramento do programa
let sairDoPrograma = false;

// Função para iniciar o programa
async function iniciarPrograma() {
    try {
        // Autentica e sincroniza a conexão com o banco de dados, em seguida exibe o menu principal
        await sequelize.authenticate();
        await sequelize.sync();
        await exibirMenuPrincipal();
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
    } finally {
        // Fecha a conexão com o banco de dados ao final do programa
        await sequelize.close();
    }
}

// Função para exibir o menu principal
async function exibirMenuPrincipal() {
    while (!sairDoPrograma) {
        console.log('Menu Principal');
        console.log('1 - Cadastro de pacientes');
        console.log('2 - Agenda');
        console.log('3 - Fim');

        // Solicita a opção ao usuário
        const opcaoPrincipal = await prompt('Escolha uma opção: ');

        // Verifica a opção selecionada e chama a função correspondente
        if (opcaoPrincipal === '1') {
            await exibirMenuCadastroPacientes();
        } else if (opcaoPrincipal === '2') {
            await exibirMenuAgenda();
        } else if (opcaoPrincipal === '3') {
            console.log('Opção 3 selecionada: Fim');
            sairDoPrograma = true;
        } else {
            console.log('Opção inválida. Tente novamente.');
        }
    }
}
// Função para exibir o menu de cadastro de pacientes
async function exibirMenuCadastroPacientes() {
    while (!sairDoPrograma) {
        console.log('Cadastro de pacientes');
        console.log('1 - Incluir paciente');
        console.log('2 - Excluir paciente');
        console.log('3 - Listar pacientes (ordenado por CPF)');
        console.log('4 - Listar pacientes (ordenado por nome)');
        console.log('5 - Voltar');

        // Solicita a opção ao usuário
        const opcaoCadastro = await prompt('Escolha uma opção: ');

        // Executa a ação correspondente à opção escolhida
        if (opcaoCadastro === '1') {
            console.log('Opção 1 selecionada: Incluir paciente');
            const dadosPaciente = await consultaController.lerDadosPaciente(prompt);

            try {
                // Chama o controlador para incluir o paciente
                await pacienteController.incluirPaciente(dadosPaciente.cpf, dadosPaciente.nome, dadosPaciente.dataNascimento);
                console.log('Paciente cadastrado com sucesso!');
            } catch (error) {
                console.error('Erro ao cadastrar paciente:', error);
            }
        } else if (opcaoCadastro === '2') {
            console.log('Opção 2 selecionada: Excluir paciente');
            const cpf = await prompt('Digite o CPF do paciente: ');
            await pacienteController.excluirPacienteDoCadastro(cpf);
        } else if (opcaoCadastro === '3') {
            try {
                // Chama o controlador para listar pacientes por CPF
                const pacientesListados = await pacienteController.listarPacientes('cpf');
                await pacienteView.exibirListaPacientes(pacientesListados, 'CPF');
            } catch (error) {
                console.error('Erro ao listar pacientes:', error);
            }
        } else if (opcaoCadastro === '4') {
            try {
                // Chama o controlador para listar pacientes por nome
                const pacientesListados = await pacienteController.listarPacientes('nome');
                await pacienteView.exibirListaPacientes(pacientesListados, 'Nome');
            } catch (error) {
                console.error('Erro ao listar pacientes:', error);
            }
        } else if (opcaoCadastro === '5') {
            console.log('Opção 5 selecionada: Voltar');
            break; // Sai do loop do menu de cadastro de pacientes
        } else {
            console.log('Opção inválida. Tente novamente.');
        }
    }
}

// Função para exibir o menu da agenda
async function exibirMenuAgenda() {
    let sairDoMenuAgenda = false;

    while (!sairDoMenuAgenda) {
        console.log('Menu Agenda');
        console.log('1 - Agendar consulta');
        console.log('2 - Cancelar agendamento');
        console.log('3 - Listar agenda');
        console.log('4 - Voltar');

        // Solicita a opção ao usuário
        const opcaoAgenda = prompt('Escolha uma opção: ');

        try {
            if (opcaoAgenda === '1') {
                console.log('Opção 1 selecionada: Agendar consulta');
                // Chama o controlador para agendar uma consulta
                await agendaController.agendarConsulta(prompt);
            } else if (opcaoAgenda === '2') {
                console.log('Opção 2 selecionada: Cancelar agendamento');
                // Chama o controlador para cancelar um agendamento
                await agendaController.cancelarAgendamento(prompt);
            } else if (opcaoAgenda === '3') {
                console.log('Opção 3 selecionada: Listar agenda');
                const opcaoListagem = prompt('Apresentar a agenda T-Toda ou P-Periodo: ').toUpperCase();
                // Chama o controlador para listar a agenda
                await agendaController.listarAgenda(opcaoListagem, prompt);
            } else if (opcaoAgenda === '4') {
                console.log('Opção 4 selecionada: Voltar');
                sairDoMenuAgenda = true; // Sai do loop do menu da agenda
            } else {
                console.log('Opção inválida. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro no menu da agenda:', error);
        }
    }
}

// Inicia o programa
iniciarPrograma();