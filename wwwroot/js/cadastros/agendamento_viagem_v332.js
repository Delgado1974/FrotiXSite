// Refactored Event Handler for btnConfirma
let isSubmitting = false;

$("#btnConfirma").off("click").on("click", async function (event) {
    event.preventDefault();

    if ($(this).prop("disabled")) {
        console.log("Botão já desabilitado, evitando chamada duplicada.");
        return; // Se já estiver desabilitado, não faz nada
    }

    $(this).prop("disabled", true); // Desabilita o botão

    // Ensure viagemId is fetched correctly
    const viagemId = document.getElementById("txtViagemId").value;

    // Validate input fields
    if (!ValidaCampos(viagemId)) {
        $("#btnConfirma").prop("disabled", false); // Re-enable the button on validation failure
        return; // If validation fails, stop execution
    }

    const periodoRecorrente = document.getElementById("lstPeriodos").ej2_instances[0].value;
    let datasRecorrentes;

    try {
        if (periodoRecorrente === 'V') {
            // For "V" (Dias Variados)
            const calendarObj = document.getElementById('calDatasSelecionadas').ej2_instances[0];
            const selectedDates = calendarObj.values;

            if (!selectedDates || selectedDates.length === 0) {
                Swal.fire({
                    title: 'Erro',
                    text: 'Você precisa selecionar ao menos uma data no calendário para o período "Dias Variados".',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
                $("#btnConfirma").prop("disabled", false); // Re-enable the button
                return;
            }

            try {
                for (const date of selectedDates) {
                    const agendamentoUnico = criarAgendamento(moment(date).toISOString().split('T')[0]);
                    await enviarAgendamentoSerial(agendamentoUnico);
                }

                // Display success message after all agendamentos are created
                exibirMensagemSucesso();
            } catch (error) {
                console.error("An error occurred while creating multiple agendamentos for 'V':", error);
                Swal.fire({
                    title: 'Erro',
                    text: 'Erro ao criar agendamentos para as datas selecionadas.',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            } finally {
                $("#btnConfirma").prop("disabled", false); // Re-enable the button after the submission is complete
            }
        } else if (periodoRecorrente === 'D' || periodoRecorrente === 'S' || periodoRecorrente === 'Q' || periodoRecorrente === 'M') {
            // For "D", "S", "Q", "M"
            datasRecorrentes = ajustarDataInicialRecorrente(periodoRecorrente);
            if (!datasRecorrentes || datasRecorrentes.length === 0) {
                console.error("No valid start date returned for other periods.");
                $("#btnConfirma").prop("disabled", false); // Re-enable the button
                return; // Stop execution if no valid start date is found
            }

            if (viagemId === "") {
                // Criar agendamento para a DataInicial
                const dataInicial = document.getElementById("txtDataInicial").value;
                if (dataInicial && !datasRecorrentes.includes(dataInicial)) {
                    const agendamentoInicial = criarAgendamento(dataInicial);
                    await enviarAgendamentoSerial(agendamentoInicial);
                }

                // Criar agendamentos para datas recorrentes
                for (const data of datasRecorrentes) {
                    const agendamentoUnico = criarAgendamento(data);
                    await enviarAgendamentoSerial(agendamentoUnico);
                }

                // Criar agendamento para a DataFinal, se for 'D' (Diário)
                if (periodoRecorrente === 'D') {
                    const dataFinalRecorrencia = document.getElementById("txtFinalRecorrencia").value;
                    if (dataFinalRecorrencia && !datasRecorrentes.includes(dataFinalRecorrencia) && dataFinalRecorrencia !== dataInicial) {
                        const agendamentoFinal = criarAgendamento(dataFinalRecorrencia);
                        await enviarAgendamentoSerial(agendamentoFinal);
                    }
                }

                // Display success message after all agendamentos are created
                exibirMensagemSucesso();

                // Atualizar o calendário após criar todos os agendamentos
                atualizarcalDatasSelecionadas();
            }

        } else {
            // Para opções não especificadas (que não sejam D, S, Q, M, V)
            if (viagemId === "") {
                const dataInicial = document.getElementById("txtDataInicial").value;
                if (dataInicial) {
                    const agendamentoUnico = criarAgendamento(dataInicial);
                    await enviarAgendamentoSerial(agendamentoUnico);

                    // Display success message after the agendamento is created
                    exibirMensagemSucesso();

                    // Atualizar o calendário após criar o agendamento
                    atualizarcalDatasSelecionadas();
                } else {
                    Swal.fire({
                        title: 'Erro',
                        text: 'Você precisa informar uma data inicial válida.',
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                }
            }
        }
    } catch (error) {
        console.error("An error occurred during the submission:", error);
        Swal.fire({
            title: 'Erro',
            text: 'Erro ao criar agendamento.',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
    } finally {
        $("#btnConfirma").prop("disabled", false); // Re-enable the button after the submission is complete
    }
});



async function enviarAgendamentoSerial(agendamento, datasRecorrentes = [], isRecorrente = false) {
    if (isSubmitting) return;
    isSubmitting = true;
    $("#btnConfirma").prop("disabled", true);

    try {
        if (isRecorrente && datasRecorrentes.length > 0) {
            let viagemIdRecorrente;

            // Loop through each recurring date to send separate requests
            for (const [index, dataRecorrente] of datasRecorrentes.entries()) {
                const agendamentoRecorrente = criarAgendamento(dataRecorrente, viagemIdRecorrente);

                const response = await enviarAgendamento(agendamentoRecorrente);
                if (index === 0) {
                    // Store the viagemId from the first response to reuse
                    viagemIdRecorrente = response.viagemId;
                }
            }
        } else {
            // Send a single non-recurring agendamento
            const response = await enviarAgendamento(agendamento);
        }

        // Display success message after all agendamentos are created
        Swal.fire({
            iconHtml: '<img src="/images/barbudo.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup'
            },
            title: 'Sucesso',
            text: 'Agendamentos criados com sucesso para todas as datas selecionadas.',
            icon: 'success',
            confirmButtonText: 'Ok',
            backdrop: true, // Ensures SweetAlert2 has a backdrop like a modal
            heightAuto: false, // Prevent layout issues
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                // Set z-index for SweetAlert2 container and backdrop
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index
                    'position': 'fixed', // Ensure it's positioned correctly
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                // Force focus to SweetAlert2 to prevent modals from interfering
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes
                $('.modal-backdrop').css('z-index', '1040').show();

                // Close the modal after success
                $("#modalAgendamento").hide();
                $("body").removeClass("modal-open");
                $("body").css("overflow", "auto");

                // Optionally refetch events or refresh the page
                //calendar.refetchEvents();
                //calendar.render();
                //calendar.refetchResources();
                //calendar.changeView('dayGridMonth');
                //calendar.gotoDate(Date());
                //updateSpecificDate();
                location.reload();
            }
        });

    } catch (error) {
        handleAgendamentoError(error);
    } finally {
        isSubmitting = false;
        $("#btnConfirma").prop("disabled", false);
    }
}

// Função para atualizar o calendário
function atualizarcalDatasSelecionadas() {
    const calDatasSelecionadasObj = document.getElementById('calDatasSelecionadas').ej2_instances[0];
    if (calDatasSelecionadasObj) {
        calDatasSelecionadasObj.refresh(); // Atualiza o calendário para refletir as mudanças
    }
}

async function enviarAgendamento(agendamento) {
    return await $.ajax({
        type: "POST",
        url: "/api/Agenda/Agendamento",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(agendamento)
    });
}


async function enviarAgendamentoRecorrente(agendamentoRecorrente) {
    try {
        await enviarAgendamento(agendamentoRecorrente);
        console.log("Agendamento recorrente criado: " + agendamentoRecorrente.DataInicial);
    } catch (error) {
        console.error("Erro ao criar agendamento recorrente: " + error);
    }
}

function handleAgendamentoError(error) {
    if (error.responseJSON && error.responseJSON.message) {
        toastr.error(error.responseJSON.message, 'Erro', { "timeOut": "5000", "extendedTimeOut": "5000" });
    } else {
        exibirErroAgendamento();
    }
}

function criarAgendamento(dataInicial, viagemIdRecorrente = null) {
    const lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
    const lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
    const rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];

    const dataFinalInput = document.getElementById("txtFinalRecorrencia").ej2_instances[0].value;
    const momentDate = moment(dataFinalInput);
    const DataFinalRecorrencia = momentDate.isValid() ? momentDate.format("YYYY-MM-DD") : null;

    return {
        DataInicial: dataInicial,
        HoraInicio: $('#txtHoraInicial').val(),
        Finalidade: document.getElementById("lstFinalidade").ej2_instances[0].value[0],
        Origem: $('#txtOrigem').val(),
        Destino: $('#txtDestino').val() || null,
        MotoristaId: lstMotorista.value || null,
        VeiculoId: lstVeiculo.value || null,
        KmAtual: parseInt($('#txtKmAtual').val(), 10) || null,
        RequisitanteId: document.getElementById("lstRequisitante").ej2_instances[0].value || null,
        RamalRequisitante: $('#txtRamalRequisitante').val(),
        SetorSolicitanteId: document.getElementById("ddtSetor").ej2_instances[0].value[0] || null,
        Descricao: rteDescricao.value,
        StatusAgendamento: true,
        Status: "Agendada",
        EventoId: document.getElementById("lstEventos").ej2_instances[0].value || null,
        Recorrente: document.getElementById("lstRecorrente").ej2_instances[0].value,
        RecorrenciaViagemId: viagemIdRecorrente || null,
        Intervalo: document.getElementById("lstPeriodos").ej2_instances[0].value,
        DataFinalRecorrencia: DataFinalRecorrencia,
        Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true, Saturday: false, Sunday: false
    };
}

function finalizarAgendamento() {
    $("#modalAgendamento").hide();
    $("body").removeClass("modal-open");
    $("body").css("overflow", "auto");

    calendar.refetchEvents();
}

function exibirErroAgendamento() {
    Swal.fire({
        title: 'Erro',
        text: 'Erro ao criar agendamento.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
        timer: 3000,
        position: 'top-start',
        customClass: { popup: 'swal2-popup' }
    });
}

function ajustarDataInicialRecorrente(tipoRecorrencia) {
    const datas = [];
    let dataAtual = moment(document.getElementById("txtDataInicial").ej2_instances[0].value, 'DD/MM/YYYY');
    const dataFinal = moment($('#txtFinalRecorrencia').val(), 'DD/MM/YYYY');

    const diasSelecionados = document.getElementById("lstDias").ej2_instances[0].value || []; // Dias selecionados no lstDias
    const diasSelecionadosIndex = diasSelecionados.map(dia => ({
        "Monday": 1, "Tuesday": 2, "Wednesday": 3,
        "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 0
    })[dia]);

    if (diasSelecionadosIndex.length === 0 && (tipoRecorrencia != 'D' && tipoRecorrencia != 'V')) {
        console.error("Nenhum dia da semana foi selecionado.");
        return null;
    }

    if (tipoRecorrencia === 'D') {
        gerarRecorrenciaDiaria(dataAtual, dataFinal, datas);
    } else {
        gerarRecorrenciaPorPeriodo(tipoRecorrencia, dataAtual, dataFinal, diasSelecionadosIndex, datas);
    }

    return datas.length > 0 ? datas : null;
}


async function enviarAgendamentoSerial(agendamento, datasRecorrentes = [], isRecorrente = false) {
    if (isSubmitting) return;
    isSubmitting = true;
    $("#btnConfirma").prop("disabled", true);

    try {
        if (isRecorrente && datasRecorrentes.length > 0) {
            let viagemIdRecorrente;

            for (const [index, dataRecorrente] of datasRecorrentes.entries()) {
                const agendamentoRecorrente = criarAgendamento(dataRecorrente, viagemIdRecorrente);
                const response = await enviarAgendamento(agendamentoRecorrente);
                if (index === 0) {
                    viagemIdRecorrente = response.viagemId;
                }
            }
        } else {
            const response = await enviarAgendamento(agendamento);
        }

        exibirMensagemSucesso();
    } catch (error) {
        handleAgendamentoError(error);
    } finally {
        isSubmitting = false;
        $("#btnConfirma").prop("disabled", false);
    }
}

// Refactored function to handle the case when the selected period is "V" (Dias Variados)
function ajustarDataInicialVariado() {
    // This function handles the case when the selected period is "V" (Dias Variados)

    let calendarObj = document.getElementById('calDatasSelecionadas').ej2_instances[0];

    // Get the array of selected dates
    let selectedDates = calendarObj.values;

    // Ensure there is at least one selected date
    if (!selectedDates || selectedDates.length === 0) {
        console.error("No dates are selected. Please ensure that at least one day is selected in the calendar.");
        return null;
    }

    // Assuming we need to get the first selected date as the starting point
    let primeiraData = moment(selectedDates[0]).toDate();

    return primeiraData.toISOString().split('T')[0];
}


// Function to obtain the next valid day based on selected days of the week
function obterProximaDataValida(dataAtual, diasSelecionadosIndices) {
    while (!diasSelecionadosIndices.includes(dataAtual.getDay())) {
        dataAtual.setDate(dataAtual.getDate() + 1);
    }
    return dataAtual;
}

// Função para validar se o período de recorrência não excede 365 dias
function validarPeriodoRecorrente(dataInicial, dataFinal) {
    var umAnoEmMilissegundos = 365 * 24 * 60 * 60 * 1000;
    return (dataFinal - dataInicial) <= umAnoEmMilissegundos;
}

// Função principal para gerar agendamentos recorrentes usando Moment.js
function criarAgendamentosRecorrentes() {
    if (document.getElementById("txtDataInicial").ej2_instances[0].value === '') {
        console.error("Data inicial não foi preenchida.");
        return; // Para a execução se a data inicial não estiver preenchida
    }

    // Obtendo datas e verificando validade
    var dataAtualString = document.getElementById("txtDataInicial").ej2_instances[0].value;
    var dataFimString = $('#txtFinalRecorrencia').val();

    var dataAtual = moment(dataAtualString, 'DD/MM/YYYY').startOf('day');
    var dataFim = moment(dataFimString, 'DD/MM/YYYY').startOf('day');

    if (!dataAtual.isValid() || !dataFim.isValid()) {
        console.error("Data inicial ou data final inválida.");
        return; // Para a execução se as datas forem inválidas
    }

    // Definir dias selecionados e seus índices
    var diasSelecionados = document.getElementById("lstDias").ej2_instances[0].value || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]; // Default to all days if none are selected
    var diasSelecionadosIndex = diasSelecionados.map(dia => {
        return {
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6,
            "Sunday": 0
        }[dia];
    });

    console.log("diasSelecionadosIndex:", diasSelecionadosIndex);

    // Definir período
    var lstPeriodos = document.getElementById("lstPeriodos").ej2_instances[0].value;

    var datasRecorrentes = [];

    // Gerar datas recorrentes com base no período selecionado
    if (lstPeriodos === "D") {
        datasRecorrentes = gerarRecorrenciaDiaria(dataAtual, dataFim, diasSelecionadosIndex);
    } else if (lstPeriodos === "S") {
        datasRecorrentes = gerarRecorrenciaSemanal(dataAtual, dataFim, diasSelecionadosIndex);
    } else if (lstPeriodos === "Q") {
        datasRecorrentes = gerarRecorrenciaQuinzenal(dataAtual, dataFim, diasSelecionadosIndex);
    } else if (lstPeriodos === "M") {
        datasRecorrentes = gerarRecorrenciaMensal(dataAtual, dataFim, diasSelecionadosIndex);
    } else if (lstPeriodos === "V") {
        datasRecorrentes = gerarRecorrenciaDiasVariados();
    } else {
        console.error("Tipo de período não reconhecido.");
        return;
    }

    console.log("Final datasRecorrentes:", datasRecorrentes);
    return datasRecorrentes;
}






function gerarRecorrenciaDiaria(dataAtual, dataFinal, datas) {
    while (dataAtual.isSameOrBefore(dataFinal)) {
        const dayOfWeek = dataAtual.isoWeekday();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Exclui sábados e domingos
            datas.push(dataAtual.format('YYYY-MM-DD'));
        }
        dataAtual.add(1, 'days');
    }
}

// Função para obter a próxima data de um dia da semana específico
function obterProximaDataDaSemana(dataAtual, diaSelecionado) {
    let proximaData = moment(dataAtual);

    // Itera até encontrar o dia desejado na semana atual
    while (proximaData.isoWeekday() !== diaSelecionado) {
        proximaData.add(1, 'days');
    }

    return proximaData;
}
function gerarRecorrenciaPorPeriodo(tipoRecorrencia, dataAtual, dataFinal, diasSelecionadosIndex, datas) {
    while (dataAtual.isSameOrBefore(dataFinal)) {
        diasSelecionadosIndex.forEach(diaSelecionado => {
            const proximaData = obterProximaDataDaSemana(dataAtual, diaSelecionado);

            // Certifica-se de não adicionar datas duplicadas
            if (proximaData.isSameOrBefore(dataFinal) && !datas.includes(proximaData.format('YYYY-MM-DD'))) {
                datas.push(proximaData.format('YYYY-MM-DD'));
            }
        });

        // Incremento baseado no tipo de período selecionado
        if (tipoRecorrencia === 'S') {
            dataAtual.add(1, 'week');
        } else if (tipoRecorrencia === 'Q') {
            dataAtual.add(2, 'weeks'); // Quinzenal
        } else if (tipoRecorrencia === 'M') {
            dataAtual.add(1, 'month').startOf('month');
        }
    }
}


//// Atualização na função para gerar datas de recorrência semanal
//function gerarRecorrenciaSemanal(dataInicial, dataFim, diasSelecionadosIndex) {
//    var datasRecorrentes = [];
//    var dataAtual = moment(dataInicial);

//    while (dataAtual <= dataFim) {
//        diasSelecionadosIndex.forEach(function (diaSelecionado) {
//            var proximaData = obterProximaDataDaSemana(dataAtual, diaSelecionado);
//            if (proximaData <= dataFim) {
//                datasRecorrentes.push(proximaData.format('YYYY-MM-DD'));
//            }
//        });

//        // Incrementa uma semana para prosseguir com os próximos agendamentos semanais
//        dataAtual.add(1, 'week');
//    }
//    return datasRecorrentes;
//}

//// Atualização na função para gerar datas de recorrência quinzenal
//function gerarRecorrenciaQuinzenal(dataInicial, dataFim, diasSelecionadosIndex) {
//    var datasRecorrentes = [];
//    var dataAtual = moment(dataInicial);

//    while (dataAtual <= dataFim) {
//        diasSelecionadosIndex.forEach(function (diaSelecionado) {
//            var proximaData = obterProximaDataDaSemana(dataAtual, diaSelecionado);
//            if (proximaData <= dataFim) {
//                datasRecorrentes.push(proximaData.format('YYYY-MM-DD'));
//            }
//        });

//        // Incrementa 2 semanas para prosseguir com os próximos agendamentos quinzenais
//        dataAtual.add(14, 'days');
//    }
//    return datasRecorrentes;
//}

//// Atualização na função para gerar datas de recorrência mensal
//function gerarRecorrenciaMensal(dataInicial, dataFim, diasSelecionadosIndex) {
//    var datasRecorrentes = [];
//    var dataAtual = moment(dataInicial);

//    while (dataAtual <= dataFim) {
//        diasSelecionadosIndex.forEach(function (diaSelecionado) {
//            var proximaData = obterProximaDataDaSemana(dataAtual, diaSelecionado);
//            if (proximaData <= dataFim) {
//                datasRecorrentes.push(proximaData.format('YYYY-MM-DD'));
//            }
//        });

//        // Incrementa um mês para prosseguir com os próximos agendamentos mensais
//        dataAtual.add(1, 'month').startOf('month');
//    }

//    return datasRecorrentes;
//}

// Função auxiliar para obter a próxima data da semana desejada
function obterProximaDataDaSemana(dataAtual, diaSelecionado) {
    const proximaData = moment(dataAtual);
    while (proximaData.day() !== diaSelecionado) {
        proximaData.add(1, 'days');
    }
    return proximaData;
}

function obterProximaDataValida(dataAtual, diasSelecionadosIndex) {
    let proximaData = moment(dataAtual);
    while (!diasSelecionadosIndex.includes(proximaData.isoWeekday())) {
        proximaData.add(1, 'days');
    }
    return proximaData;
}

function exibirMensagemSucesso() {
    Swal.fire({
        iconHtml: '<img src="/images/barbudo.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
        customClass: {
            popup: 'custom-popup'
        },
        title: 'Sucesso',
        text: 'Agendamentos criados com sucesso para todas as datas selecionadas.',
        icon: 'success',
        confirmButtonText: 'Ok',
        backdrop: true,
        heightAuto: false,
        didOpen: () => {
            // Garantir que todos os backdrops e modais relacionados ao modal estejam ocultos
            $('.modal-backdrop').css('z-index', '1040').hide(); // Ocultar o backdrop do Bootstrap

            // Definir z-index para o container e backdrop do SweetAlert2
            $('.swal2-container').css({
                'z-index': 9999, // Maior valor de z-index possível
                'position': 'fixed', // Garantir que esteja posicionado corretamente
            });

            $('.swal2-backdrop-show').css('z-index', 9998); // Logo abaixo da janela de alerta

            // Focar no SweetAlert2 para evitar interferências dos modais
            Swal.getPopup().focus();
        },
        didClose: () => {
            // Fechar o modal "modalViagens" após o fechamento do SweetAlert
            $('#modalViagens').modal('hide');
            // Restaurar o backdrop do Bootstrap após o fechamento do SweetAlert
            $('.modal-backdrop').css('z-index', '1040').show();
        }
    });
}


//Funções de Validação do Formulário
//==================================
function ValidaCampos(viagemId) {

    console.log("Entrei na validação: " + viagemId);

    if (document.getElementById("txtDataInicial").value === "") {
        Swal.fire({
            title: "Presta Atenção",
            text: "A Data Inicial é obrigatória",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok"
            }
        })
        
        return false;
    }

    if (document.getElementById("txtHoraInicial").value === "") {
        Swal.fire({
            title: "Presta Atenção",
            text: "A Hora Inicial é obrigatória",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok"
            }
        })
        
        return false;
    }

    //debugger;

    //var lstFinalidade = document.getElementById("lstFinalidade").ej2_instances[0].value[0];
    if (document.getElementById("lstFinalidade").ej2_instances[0].value === '') {
        Swal.fire({
            title: "Presta Atenção",
            text: "A Finalidade é obrigatória",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok"
            }
        })
        
        return false;
    }


    //Valida Campos na criação da Viagem
    //===================================

    if (document.getElementById("txtOrigem").value === "") {
        Swal.fire({
            title: 'Presta Atenção',
            text: 'A Origem é obrigatória',
            icon: 'error', // Use a standard icon or customize as needed
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup'
            },
            confirmButtonText: 'OK', // Use this to define button text
            heightAuto: false, // Prevent layout issues
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                // Set z-index for SweetAlert2 container and backdrop
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index
                    'position': 'fixed', // Ensure it's positioned correctly
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                // Force focus to SweetAlert2 to prevent modals from interfering
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        });

        // Ensure the element exists before focusing
        const txtOrigem = document.getElementById("txtOrigem");
        if (txtOrigem) {
            txtOrigem.focus();
        }

        return false; // Ensure this is in the right context
    }

    if (viagemId != null && viagemId != '' && ($("#btnConfirma").text() != 'Edita Agendamento')) {

        console.log("viagemId: " + viagemId);

        console.log("btnConfirma: " + $("#btnConfirma").text());

        if (document.getElementById("txtNoFichaVistoria").value === "") {
            Swal.fire({
                title: "Presta Atenção",
                text: "O Nº da Ficha de Vistoria é obrigatório!",
                icon: 'warning', // Use a standard icon or customize as needed
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup'
                },
                confirmButtonText: 'OK', // Use this to define button text
                heightAuto: false, // Prevent layout issues
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                    // Set z-index for SweetAlert2 container and backdrop
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index
                        'position': 'fixed', // Ensure it's positioned correctly
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                    // Force focus to SweetAlert2 to prevent modals from interfering
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })
            
            return false;
        }

        var lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
        if (lstMotorista.value === null) {
            Swal.fire({
                title: "Presta Atenção",
                text: "O Motorista é obrigatório",
                icon: 'warning', // Use a standard icon or customize as needed
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup'
                },
                confirmButtonText: 'OK', // Use this to define button text
                heightAuto: false, // Prevent layout issues
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                    // Set z-index for SweetAlert2 container and backdrop
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index
                        'position': 'fixed', // Ensure it's positioned correctly
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                    // Force focus to SweetAlert2 to prevent modals from interfering
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })
            
            return false;
        }

        var lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
        if (lstVeiculo.value === null) {
            Swal.fire({
                title: "Presta Atenção",
                text: "O Veículo é obrigatório",
                icon: 'warning', // Use a standard icon or customize as needed
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup'
                },
                confirmButtonText: 'OK', // Use this to define button text
                heightAuto: false, // Prevent layout issues
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                    // Set z-index for SweetAlert2 container and backdrop
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index
                        'position': 'fixed', // Ensure it's positioned correctly
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                    // Force focus to SweetAlert2 to prevent modals from interfering
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })
            
            return false;
        }

        if (document.getElementById("txtKmInicial").value === "") {
            Swal.fire({
                title: "Presta Atenção",
                text: "A quilometragem inicial é obrigatória",
                icon: "error",
                icon: 'error', // Use a standard icon or customize as needed
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup'
                },
                confirmButtonText: 'OK', // Use this to define button text
                heightAuto: false, // Prevent layout issues
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                    // Set z-index for SweetAlert2 container and backdrop
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index
                        'position': 'fixed', // Ensure it's positioned correctly
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                    // Force focus to SweetAlert2 to prevent modals from interfering
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })
            
            return false;
        }

        var ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0];
        if (ddtCombustivelInicial.value === "") {
            Swal.fire({
                title: "Presta Atenção",
                text: "O Combustível Inicial é obrigatório!",
                icon: "error",
                icon: 'error', // Use a standard icon or customize as needed
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup'
                },
                confirmButtonText: 'OK', // Use this to define button text
                heightAuto: false, // Prevent layout issues
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                    // Set z-index for SweetAlert2 container and backdrop
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index
                        'position': 'fixed', // Ensure it's positioned correctly
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                    // Force focus to SweetAlert2 to prevent modals from interfering
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })
            
            return false;
        }


    }

    var lstRequisitante = document.getElementById("lstRequisitante").ej2_instances[0];
    if (lstRequisitante.value === null || lstRequisitante.value === '') {
        Swal.fire({
            title: "Presta Atenção",
            text: "O Requisitante é obrigatório",
            icon: 'error', // Use a standard icon or customize as needed
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup'
            },
            confirmButtonText: 'OK', // Use this to define button text
            heightAuto: false, // Prevent layout issues
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                // Set z-index for SweetAlert2 container and backdrop
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index
                    'position': 'fixed', // Ensure it's positioned correctly
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                // Force focus to SweetAlert2 to prevent modals from interfering
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        })
        
        return false;
    }

    if (document.getElementById("txtRamalRequisitante").value === "") {
        Swal.fire({
            title: "Presta Atenção",
            text: "O Ramal do Requisitante é obrigatório",
            icon: 'error', // Use a standard icon or customize as needed
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup'
            },
            confirmButtonText: 'OK', // Use this to define button text
            heightAuto: false, // Prevent layout issues
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                // Set z-index for SweetAlert2 container and backdrop
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index
                    'position': 'fixed', // Ensure it's positioned correctly
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                // Force focus to SweetAlert2 to prevent modals from interfering
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        })
        
        return false;
    }

    var ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
    if (ddtSetor.value === null) {
        Swal.fire({
            title: "Presta Atenção",
            text: "O Setor Solicitante é obrigatório",
            icon: 'error', // Use a standard icon or customize as needed
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup'
            },
            confirmButtonText: 'OK', // Use this to define button text
            heightAuto: false, // Prevent layout issues
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                // Set z-index for SweetAlert2 container and backdrop
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index
                    'position': 'fixed', // Ensure it's positioned correctly
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                // Force focus to SweetAlert2 to prevent modals from interfering
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        })
        
        return false;
    }

    var lstFinalidade = document.getElementById("lstFinalidade").ej2_instances[0].value;
    if (document.getElementById("lstFinalidade").ej2_instances[0].value === '') {
        Swal.fire({
            title: "Presta Atenção",
            text: "A Finalidade é obrigatória",
            icon: 'error', // Use a standard icon or customize as needed
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup'
            },
            confirmButtonText: 'OK', // Use this to define button text
            heightAuto: false, // Prevent layout issues
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                // Set z-index for SweetAlert2 container and backdrop
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index
                    'position': 'fixed', // Ensure it's positioned correctly
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                // Force focus to SweetAlert2 to prevent modals from interfering
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        })
        
        return false;
    }
    else {
        if (document.getElementById("lstFinalidade").ej2_instances[0].value === 'Evento' && (document.getElementById("lstEventos").ej2_instances[0].value === "" || document.getElementById("lstEventos").ej2_instances[0].value === null)) {
            Swal.fire({
                title: "Presta Atenção",
                text: "o nome do evento é obrigatório",
                icon: 'error', // Use a standard icon or customize as needed
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup'
                },
                confirmButtonText: 'OK', // Use this to define button text
                heightAuto: false, // Prevent layout issues
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                    // Set z-index for SweetAlert2 container and backdrop
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index
                        'position': 'fixed', // Ensure it's positioned correctly
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                    // Force focus to SweetAlert2 to prevent modals from interfering
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })
            
            return false;
        }
    }

    //Valida Seção da Recorrência

    //Períodos
    if (document.getElementById("lstRecorrente").ej2_instances[0].value === 'S' && (document.getElementById("lstPeriodos").ej2_instances[0].value === '' || document.getElementById("lstPeriodos").ej2_instances[0].value === null)) {
        Swal.fire({
            title: "Presta Atenção",
            text: "Se o Agendamento é Recorrente, você precisa escolher o Período de Recorrência!",
            icon: 'error', // Use a standard icon or customize as needed
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup'
            },
            confirmButtonText: 'OK', // Use this to define button text
            heightAuto: false, // Prevent layout issues
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                // Set z-index for SweetAlert2 container and backdrop
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index
                    'position': 'fixed', // Ensure it's positioned correctly
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                // Force focus to SweetAlert2 to prevent modals from interfering
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        })
        
        return false;

    }

    //Dias da Semana
    if ((document.getElementById("lstPeriodos").ej2_instances[0].value === 'S' || document.getElementById("lstPeriodos").ej2_instances[0].value === 'Q' || document.getElementById("lstPeriodos").ej2_instances[0].value === 'M') && (document.getElementById("lstDias").ej2_instances[0].value === '' || document.getElementById("lstDias").ej2_instances[0].value === null)) {
        Swal.fire({
            title: "Presta Atenção",
            text: "Se o período foi escolhido como semanal, quinzenal ou mensal, você precisa escolher os Dias da Semana!",
            icon: 'error', // Use a standard icon or customize as needed
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup'
            },
            confirmButtonText: 'OK', // Use this to define button text
            heightAuto: false, // Prevent layout issues
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                // Set z-index for SweetAlert2 container and backdrop
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index
                    'position': 'fixed', // Ensure it's positioned correctly
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                // Force focus to SweetAlert2 to prevent modals from interfering
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        })

        return false;
    }

    //Data Final
    if ((document.getElementById("lstPeriodos").ej2_instances[0].value === 'D' || document.getElementById("lstPeriodos").ej2_instances[0].value === 'S' || document.getElementById("lstPeriodos").ej2_instances[0].value === 'Q' || document.getElementById("lstPeriodos").ej2_instances[0].value === 'M') && (document.getElementById("txtFinalRecorrencia").ej2_instances[0].value === '' || document.getElementById("txtFinalRecorrencia").ej2_instances[0].value === null)) {
        Swal.fire({
            title: "Presta Atenção",
            text: "Se o período foi escolhido como diário, semanal, quinzenal ou mensal, você precisa escolher a Data Final!",
            icon: 'error', // Use a standard icon or customize as needed
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup'
            },
            confirmButtonText: 'OK', // Use this to define button text
            heightAuto: false, // Prevent layout issues
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                // Set z-index for SweetAlert2 container and backdrop
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index
                    'position': 'fixed', // Ensure it's positioned correctly
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                // Force focus to SweetAlert2 to prevent modals from interfering
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        })

        return false;
    }

    let calendarObj = document.getElementById('calDatasSelecionadas').ej2_instances[0];

    // Get the array of selected dates
    let selectedDates = calendarObj.values;

    // Get the number of selected dates
    let numberOfSelectedDates = selectedDates ? selectedDates.length : 0;


    //Dias Variados
    if ((document.getElementById("lstPeriodos").ej2_instances[0].value === 'V') && (numberOfSelectedDates === 0)) {

        Swal.fire({
            title: "Presta Atenção",
            text: "Se o período foi escolhido como Dias Variados, você precisa escolher ao menos um dia no Calendário!",
            icon: 'warning', // Use a standard icon or customize as needed
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup'
            },
            confirmButtonText: 'OK', // Use this to define button text
            heightAuto: false, // Prevent layout issues
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                // Set z-index for SweetAlert2 container and backdrop
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index
                    'position': 'fixed', // Ensure it's positioned correctly
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                // Force focus to SweetAlert2 to prevent modals from interfering
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        })

     
        return false;

    }


    StatusViagem = "Aberta";

    //Verifica se está finalizando a viagem
    //=====================================
    var ddtCombustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0];


    //if ((document.getElementById("txtDataFinal").value != "") || (document.getElementById("txtHoraFinal").value != "") || (document.getElementById("txtKmFinal").value != "") || (ddtCombustivelFinal.value != "")) {
    //    Swal.fire({
    //        title: "Presta Atenção",
    //        text: "Os campos de Data Final, Hora Final, Combustível Final e KM Final devem estar todos preenchidos para que a viagem seja considerada Finalizada",
    //        icon: "error",
    //        buttons: true,
    //        dangerMode: true,
    //        buttons: {
    //            ok: "Ok"
    //        }
    //    })
    //    
    //    return false;
    //}

    if ((document.getElementById("txtDataInicial").ej2_instances[0].value != "") && (document.getElementById("txtHoraFinal").value != "") && (document.getElementById("txtKmInicial").value != "") && (ddtCombustivelInicial.value != "")) {
        StatusViagem = "Realizada";
    }


    console.log("Terminei Validação!");
    return true;

}



////COMEÇO DO  REFATORADO PELO CODE PILOT
////=====================================

// Global variable to hold the exposed criarAgendamento function
var criarAgendamento;

$(document).ready(function () {

    // Esconde os controles da Recorrência
    document.getElementById("divPeriodo").style.display = "none";
    document.getElementById("divDias").style.display = "none";
    document.getElementById("divFinalRecorrencia").style.display = "none";
    //document.getElementById("divcalDatasSelecionadas").style.display = "none";
    $("#txtFinalRecorrencia").val('');

    // Botão para fechar a modal de Viagens
    $('#btnFecha').on('click', function () {
        $('#modalViagens').hide();
        $("div").removeClass("modal-backdrop");

        $('body').removeClass('modal-open');
        $("body").css("overflow", "auto");
    });

    // Botão para fechar a Ficha de impressão
    $('#btnFecharFicha').on('click', function () {
        $('#modalPrint').hide();
        $("div").removeClass("modal-backdrop");

        $('body').removeClass('modal-open');
        $("body").css("overflow", "auto");
    });

    // Desabilita o botão de evento
    var lstEvento = document.getElementById("lstEventos").ej2_instances[0];
    lstEvento.enabled = false;

    document.getElementById("btnEvento").style.display = "none";

    // Inicializa o calendário
    InitializeCalendar("api/Agenda/CarregaViagens");
    PreencheListaSetores();

    // Configura a Exibição do Modal de Requisitantes
    $("#modalRequisitante").modal({
        keyboard: true,
        backdrop: "static",
        show: false,
    }).on("hide.bs.modal", function () {
        var setores = document.getElementById('ddtSetorRequisitante').ej2_instances[0];
        setores.value = "";
        $("#txtPonto").val('');
        $("#txtNome").val('');
        $("#txtRamal").val('');
        $("#txtEmail").val('');
    });

    // Configura a Exibição do Modal de Setores
    $("#modalSetor").modal({
        keyboard: true,
        backdrop: "static",
        show: false,
    }).on("hide.bs.modal", function () {
        var setores = document.getElementById('ddtSetorPai').ej2_instances[0];
        setores.value = "";
        $("#txtSigla").val('');
        $("#txtNomeSetor").val('');
        $("#txtRamalSetor").val('');
    });
});





//function enviarAgendamento(agendamento, datasRecorrentes = [], isRecorrente = false) {
//    $.ajax({
//        type: "POST",
//        url: "/api/Agenda/Agendamento",
//        contentType: "application/json; charset=utf-8",
//        dataType: "json",
//        data: agendamento,
//        success: function (data) {
//            toastr.success(data.message, null, { "timeOut": "5000", "extendedTimeOut": "5000" });
//            if (isRecorrente) {
//                var viagemIdRecorrente = data.viagemId;
//                datasRecorrentes.forEach(function (dataRecorrente) {
//                    if (dataRecorrente !== agendamento.DataInicial) {
//                        var agendamentoRecorrente = criarAgendamento(dataRecorrente, viagemIdRecorrente);
//                        $.ajax({
//                            type: "POST",
//                            url: "/api/Agenda/Agendamento",
//                            contentType: "application/json; charset=utf-8",
//                            dataType: "json",
//                            data: agendamentoRecorrente,
//                            success: function () {
//                                console.log("Agendamento recorrente criado: " + dataRecorrente);
//                            }
//                        });
//                    }
//                });
//            }
//            $("#modalAgendamento").hide();
//            $('body').removeClass('modal-open');
//            $("body").css("overflow", "auto");
//            calendar.refetchEvents();
//        },
//        error: function () {
//            Swal.fire({
//                title: 'Erro',
//                text: 'Erro ao criar agendamento.',
//                icon: 'error',
//                confirmButtonText: 'OK',
//                confirmButtonColor: '#d33',
//                timer: 3000,
//                position: 'top-start',
//                customClass: { popup: 'swal2-popup' }
//            });
//        }
//    });
//}
////FIM DO  REFATORADO PELO CODE PILOT
////==================================


//EXIBE A VIAGEM NO MODAL (REFATORADO)
//====================================
function ExibeViagem(viagem) {
    // Habilita e Limpa Controles
    StatusViagem = "Aberta";

    var childNodes = document.getElementById("divModal").getElementsByTagName('*');
    for (var node of childNodes) {
        node.disabled = false;
        node.value = "";
    }

    //$('#txtDataInicial').attr('type', 'date');
    //$('#txtDataFinal').attr('type', 'date');
    $('#txtHoraInicial').attr('type', 'time');
    $('#txtHoraFinal').attr('type', 'time');

    document.getElementById("divNoFichaVistoria").style.display = 'none';
    document.getElementById("divDataFinal").style.display = 'none';
    document.getElementById("divHoraFinal").style.display = 'none';
    document.getElementById("divKmAtual").style.display = 'none';
    document.getElementById("divKmInicial").style.display = 'none';
    document.getElementById("divKmFinal").style.display = 'none';

    var rte = document.getElementById("rteDescricao").ej2_instances[0];
    rte.enabled = true;
    rte.value = "";

    var lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
    lstMotorista.enabled = true;
    lstMotorista.value = "";

    var lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
    lstVeiculo.enabled = true;
    lstVeiculo.value = "";

    var lstRequisitante = document.getElementById("lstRequisitante").ej2_instances[0];
    lstRequisitante.enabled = true;
    lstRequisitante.value = "";

    var ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
    ddtSetor.enabled = true;
    ddtSetor.value = "";

    var ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0];
    ddtCombustivelInicial.value = "";
    document.getElementById("divCombustivelInicial").style.display = 'none';

    var ddtCombustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0];
    ddtCombustivelFinal.value = "";
    document.getElementById("divCombustivelFinal").style.display = 'none';

    $("#btnViagem").show();
    $("#btnImprime").show();
    $("#btnConfirma").show();
    $("#btnApaga").show();
    $("#btnCancela").show();

    document.getElementById("lblUsuarioCriacao").innerHTML = "";

    var lstEvento = document.getElementById("lstEventos").ej2_instances[0];
    lstEvento.enabled = false;
    document.getElementById("btnEvento").style.display = "none";

    //Limpa Controles Recorrência
    document.getElementById("lstRecorrente").ej2_instances[0].value = "";
    document.getElementById("lstPeriodos").ej2_instances[0].value = "";
    document.getElementById("lstDias").ej2_instances[0].value = "";
    document.getElementById('txtFinalRecorrencia').ej2_instances[0].value = null;
    document.getElementById('calDatasSelecionadas').ej2_instances[0].value = null;
    //document.getElementById("lstDiasCalendario").ej2_instances[0].clear();
    var listBox = document.getElementById("lstDiasCalendario").ej2_instances[0];
    listBox.dataSource = [];
    document.getElementById("itensBadge").textContent = 0;

    if (viagem === "") {
        // Cria Agendamento
        document.getElementById("Titulo").innerHTML = "<h3 class='modal-title'><i class='fad fa-calendar-alt' aria-hidden='true'></i> Criar Agendamento</h3>";
        console.log("Criar Agendamento");
        $("#btnViagem").hide();
        $("#btnImprime").hide();
        $("#btnApaga").hide();
        $("#btnCancela").hide();
        $("#btnConfirma").html("<i class='fa fa-save' aria-hidden='true'></i>Cria Agendamento");
    } else {
        // Carregar viagem existente e preencher os campos
        console.log("Status Agendamento: " + viagem.statusAgendamento);

        $("#txtViagemId").val(viagem.viagemId);
        $("#txtStatusAgendamento").val(viagem.statusAgendamento);
        $("#txtUsuarioIdCriacao").val(viagem.usuarioIdCriacao);
        $("#txtDataCriacao").val(viagem.dataCriacao);

        //$('#txtDataInicial').removeAttr("type");
        //var dataInicial = viagem.dataInicial.substring(0, 10);
        //document.getElementById("txtDataInicial").ej2_instances[0].value = moment(viagem.dataInicial).format('DD/MM/YYYY');
        //$('#txtDataInicial').attr('type', 'date');
        var datePicker = document.getElementById("txtDataInicial").ej2_instances[0];
        datePicker.value = moment(viagem.dataInicial).toDate(); // Ou use o método correto para definir o valor
        datePicker.dataBind(); // Atualiza a interface


        $('#txtHoraInicial').removeAttr("type");
        document.getElementById("txtHoraInicial").value = viagem.horaInicio.substring(11, 16);
        $('#txtHoraInicial').attr('type', 'time');

        document.getElementById("lstFinalidade").ej2_instances[0].value = [viagem.finalidade];
        document.getElementById("lstFinalidade").ej2_instances[0].text = viagem.finalidade;
        $("#txtOrigem").val(viagem.origem);
        $("#txtDestino").val(viagem.destino);

        if (viagem.eventoId != null) {
            lstEvento.enabled = true;
            lstEvento.value = [viagem.eventoId];
            document.getElementById("btnEvento").style.display = "block";
        }

        lstMotorista.value = viagem.motoristaId;
        lstVeiculo.value = viagem.veiculoId;
        document.getElementById("txtKmAtual").value = viagem.kmAtual;
        lstRequisitante.value = viagem.requisitanteId;
        document.getElementById("txtRamalRequisitante").value = viagem.ramalRequisitante;
        ddtSetor.value = [viagem.setorSolicitanteId];

        rte.value = viagem.descricao;
        document.getElementById("rteDescricao").ej2_instances[0].value = viagem.descricao;

        // Configuração do botão e exibição da ficha
        if (viagem.statusAgendamento === true) {
            document.getElementById("Titulo").innerHTML = "<h3 class='modal-title'><i class='fad fa-calendar-alt' aria-hidden='true'></i> Editar Agendamento</h3>";
            $("#btnConfirma").html("<i class='fa fa-save' aria-hidden='true'></i>Edita Agendamento");

            $("#btnViagem").show();
            $("#btnImprime").show();
            $("#btnConfirma").show();
            $("#btnApaga").show();
            $("#btnCancela").show();

            if (viagem.status === "Cancelada") {
                document.getElementById("Titulo").innerHTML = "<h3 class='modal-title'><i class='fad fa-calendar-alt' aria-hidden='true'></i> Agendamento Cancelado</h3>";
                $("#btnViagem").hide();
                $("#btnImprime").hide();
                $("#btnConfirma").hide();
                $("#btnApaga").hide();
                $("#btnCancela").hide();
            }
        } else {
            // Exibe detalhes da viagem
            document.getElementById("Titulo").innerHTML = "<h3 class='modal-title'><i class='fad fa-route' aria-hidden='true'></i> Exibindo Viagem</h3>";

            for (var node of childNodes) {
                node.disabled = true;
            }

            rte.enabled = false;

            document.getElementById("divNoFichaVistoria").style.display = 'block';
            document.getElementById("divDataFinal").style.display = 'block';
            document.getElementById("divHoraFinal").style.display = 'block';
            document.getElementById("divKmAtual").style.display = 'block';
            document.getElementById("divKmInicial").style.display = 'block';
            document.getElementById("divKmFinal").style.display = 'block';

            if (viagem.status === "Realizada") {
                //$('#txtDataFinal').removeAttr("type");
                //var dataFinal = viagem.dataFinal.substring(0, 10);
                document.getElementById("txtDataFinal").value = viagem.dataFinal;
                //$('#txtDataFinal').attr('type', 'date');

                $('#txtHoraFinal').removeAttr("type");
                document.getElementById("txtHoraFinal").value = viagem.horaFim.substring(11, 16);
                $('#txtHoraFinal').attr('type', 'time');

                document.getElementById("txtKmInicial").value = viagem.kmInicial;
                document.getElementById("txtKmFinal").value = viagem.kmFinal;

                ddtCombustivelInicial.value = [viagem.combustivelInicial];
                if (viagem.combustivelFinal != null && viagem.combustivelFinal !== '') {
                    ddtCombustivelFinal.value = [viagem.combustivelFinal];
                }

                const DataFinalizacao = moment(viagem.dataCriacao).format("DD/MM/YYYY");
                const HoraFinalizacao = moment(viagem.dataCriacao).format("HH:mm");

                $.ajax({
                    url: '/api/Agenda/RecuperaUsuario',
                    type: "Get",
                    data: { id: viagem.usuarioIdFinalizacao },
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        let usuarioFinalizacao;
                        $.each(data, function (key, val) {
                            usuarioFinalizacao = val;
                        });
                        document.getElementById("lblUsuarioFinalizacao").innerHTML = " - Finalizada por " + usuarioFinalizacao + " em " + DataFinalizacao + " às " + HoraFinalizacao;
                    },
                    error: function (err) {
                        console.log(err);
                        alert('something went wrong');
                    }
                });
            }
        }
    }
}
//====================================

//var calendarEl = document.getElementById('agenda');

//var calendar = new FullCalendar.Calendar(calendarEl)

function InitializeCalendar(URL) {
    var calendarEl = document.getElementById('agenda');

    calendar = new FullCalendar.Calendar(calendarEl, {
        lazyFetching: true,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        initialView: 'diaSemana',
        views: {
            diaSemana: { buttonText: 'Dia', type: 'timeGridDay', weekends: true },
            listDay: { buttonText: 'Lista do dia', weekends: true },
            weekends: { buttonText: 'Fins de Semana', type: 'timeGridWeek', weekends: true, hiddenDays: [1, 2, 3, 4, 5] }
        },
        locale: "pt",
        selectable: true,
        editable: true,
        navLinks: true,
        events: function (fetchInfo, successCallback, failureCallback) {
            var start = fetchInfo.startStr;
            var end = fetchInfo.endStr;

            $.ajax({
                url: URL,
                type: 'GET',
                dataType: 'json',
                data: {
                    start: start,
                    end: end
                },
                success: function (data) {
                    var events = $.map(data.data, function (item) {
                        return {
                            id: item.viagemId,
                            title: item.titulo,
                            description: item.descricao,
                            start: item.horaInicial,
                            end: item.horaFinal,
                            backgroundColor: item.corEvento,
                            textColor: item.corTexto,
                            allDay: false
                        };
                    });

                    successCallback(events);
                },
                error: function () {
                    failureCallback();
                }
            });
        },
        eventClick: function (info) {
            var idViagem = info.event.id;
            console.log("ID: " + idViagem);

            info.jsEvent.preventDefault();

            $.ajax({
                type: "GET",
                url: '/api/Agenda/RecuperaViagem',
                data: { id: idViagem },
                contentType: "application/json",
                dataType: "json",
                success: function (response) {
                    console.log(response.data.viagemId);
                    console.log(response.data.dataInicial);
                    console.log(response.data.horaInicio);

                    ExibeViagem(response.data);
                }
            });
            $('#modalViagens').modal('show');
        },
        eventDidMount: function (info) {
            var tooltip = new Tooltip(info.el, {
                title: info.event.extendedProps.description,
                placement: 'top',
                trigger: 'hover',
                container: 'body'
            });
        },
        loading: function (isLoading) {
            if (isLoading) {
                $(".example").show();
            }
            else {
                $(".example").hide();
            }
        },
        select: function (info) {
            const startStr = moment(info.start).format("YYYY-MM-DD");
            const HoraInicio = moment(info.start).format("HH:mm:ss");
            console.log(startStr);
            ExibeViagem("");
            CarregandoAgendamento = true;
            $('#modalViagens').modal('show');
            document.getElementById("txtDataInicial").ej2_instances[0].value = moment(startStr).format('DD/MM/YYYY');
            document.getElementById("txtHoraInicial").value = HoraInicio;
            CarregandoAgendamento = false;
        },
        selectOverlap: function (event) {
            return !event.block;
        },
    });

    calendar.render();
}





// Nova função para atualizar um dia específico
function updateSpecificDate() {
    var date = document.getElementById("txtDataInicial").ej2_instances[0].value;
    if (date) {
        calendar.gotoDate(date);
    } else {
        alert("Por favor, selecione uma data.");
    }
}






// Function to fetch events based on the date range
let isFetching = false;

function fetchEvents(start, end, successCallback, failureCallback) {
    if (isFetching) return; // Prevent multiple calls
    isFetching = true;

    console.log("Fetching events from", start, "to", end);

    // Simulating an async operation
    setTimeout(() => {
        // Your event fetching logic...
        isFetching = false; // Reset flag after fetching
        successCallback(); // Call success callback
    }, 1000);
}


// Função para carregar eventos de um mês específico
//function loadEventsForMonth(startDate, URL) {
//    var formattedStartDate = moment(startDate).format("YYYY-MM-DD");
//    var formattedEndDate = moment(startDate).endOf('month').format("YYYY-MM-DD");

//    $.ajax({
//        type: "GET",
//        url: URL,
//        data: { start: formattedStartDate, end: formattedEndDate }, // Passando as datas para o servidor
//        contentType: "application/json",
//        dataType: "json",
//        success: function (data) {
//            var events = $.map(data.data, function (item) {
//                return {
//                    id: item.viagemId,
//                    title: item.titulo,
//                    description: item.descricao,
//                    start: item.horaInicial, // Certifique-se de que este campo está no formato correto
//                    end: item.horaFinal, // Certifique-se de que este campo está no formato correto
//                    backgroundColor: item.corEvento,
//                    textColor: item.corTexto,
//                    allDay: false
//                };
//            });

//            // Adicionando os eventos carregados ao calendário
//            calendar.addEventSource(events);
//        },
//        error: function (XMLHttpRequest, textStatus, errorThrown) {
//            console.error("Erro ao carregar eventos: ", textStatus, errorThrown);
//        }
//    });
//}

// Função para verificar se dois meses são iguais
function isSameMonth(start, end) {
    return moment(start).isSame(end, 'month');
}
//}

 //function InitializeCalendar(URL) {
 //    //debugger;

 //    var calendarEl = document.getElementById('agenda');

 //    $.ajax({
 //        type: "GET",
 //        contentType: "application/json",
 //        url: URL,
 //        dataType: "json",
 //        success: function (data) {
 //            //debugger;

 //            console.log(data.data)

 //            calendar = new FullCalendar.Calendar(calendarEl, {
 //                lazyFetching: true,
 //                refetchResourcesOnNavigate: true,
 //                initialView: 'diaSemana',
 //                headerToolbar: {
 //                    left: 'prev,next today',
 //                    center: 'title',
 //                    right: 'diaSemana, timeGridWeek, dayGridMonth, listDay, weekends'
 //                },
 //                // customize the button names,
 //                // otherwise they'd all just say "list"
 //                views: {
 //                    diaSemana: { buttonText: 'Dia', type: 'timeGridDay', weekends: true },
 //                    listDay: { buttonText: 'Lista do dia', weekends: true },
 //                    weekends: { buttonText: 'Fins de Semana', type: 'timeGridWeek', weekends: true, hiddenDays: [1, 2, 3, 4, 5] }
 //                    //    listMonth: { buttonText: 'Lista do mês' },
 //                    //    listYear: { buttonText: 'Lista do ano' }
 //                },
 //                locale: "pt",
 //                dropAccept: '.fc-event',
 //                weekNumbers: false, // Determines if week numbers should be displayed on the calendar.
 //                dayMaxEvents: true, // allow "more" link when too many events
 //                weekends: false, // will hide Saturdays and Sundays
 //                //displayEventTime: true,
 //                //displayEventEnd: true, // Whether or not to display an event’s end time. => false // for dayGridMonth and dayGridWeek views
 //                editable: true, // Determines whether the events on the calendar can be modified.
 //                eventStartEditable: true, // Allow events’ start times to be editable through dragging.
 //                eventResizableFromStart: true, // Whether the user can resize an event from its starting edge.
 //                droppable: true, // this allows things to be dropped onto the calendar !!!
 //                eventOverlap: true, // Determines if events being dragged and resized are allowed to overlap each other.
 //                slotEventOverlap: true, // Determines if timed events in TimeGrid view should visually overlap.
 //                selectOverlap: true, // Determines whether the user is allowed to select periods of time that are occupied by events.
 //                selectable: true, // Allows a user to highlight multiple days or timeslots by clicking and dragging.
 //                buttonIcons: true, // show the prev/next text
 //                navLinks: true, // can click day/week names to navigate views
 //                businessHours: false, // display business hours
 //                firstDay: 1,
 //                //slotMinTime: "05:00:00",
 //                eventDidMount: function (info) {
 //                    var tooltip = new Tooltip(info.el, {
 //                        title: info.event.extendedProps.description,
 //                        placement: 'top',
 //                        trigger: 'hover',
 //                        container: 'body',
 //                    });
 //                    return function (view) {
 //                        var view = $('#calendar').fullCalendar('getView');
 //                        alert('The new title of the view is ' + view.title);
 //                    }

 //                },
 //                events: $.map(data.data, function (item, i) {

 //                    //-- here is the event details to show in calendar view.. the data is retrieved via ajax call will be accessed here

 //                    var event = new Object();

 //                    event.id = item.viagemId;
 //                    event.title = item.titulo;
 //                    event.description = item.descricao;
 //                    event.start = item.horaInicial;
 //                    event.end = item.horaFinal;
 //                    event.backgroundColor = item.corEvento;
 //                    event.textColor = item.corTexto;
 //                    event.allDay = false;
 //                    return event;
 //                }),
 //                eventReceive: function (data) {

 //                },
 //                //select: function (info) {
 //                //    console.log("select function called");
 //                //    const startStr = moment(info.start).format("YYYY-MM-DD");
 //                //    const HoraInicio = moment(info.start).format("HH:mm:ss");
 //                //    $('#modalViagens').modal('show');
 //                //    document.getElementById("txtDataInicial").value = startStr;
 //                //    document.getElementById("txtHoraInicial").value = HoraInicio;
 //                //}
 //                select: function (info) {
 //                    const startStr = moment(info.start).format("YYYY-MM-DD");
 //                    const HoraInicio = moment(info.start).format("HH:mm:ss");
 //                    //$('#vmodel').load('/home/AddEvent/?fromDate=' + encodeURI(startStr) + '&toDate=' + encodeURI(endStr), function (response, status, xhr) {
 //                    //    modalInit();
 //                    //});
 //                    console.log(startStr);
 //                    ExibeViagem("");
 //                    CarregandoAgendamento = true;
 //                    $('#modalViagens').modal('show');
 //                    document.getElementById("txtDataInicial").value = startStr;
 //                    document.getElementById("txtHoraInicial").value = HoraInicio;
 //                    CarregandoAgendamento = false;
 //                },
 //                selectOverlap: function (event) {
 //                    return !event.block;
 //                },
 //                eventClick: function (info) {
 //                    info.jsEvent.preventDefault(); // don't let the browser navigate
 //                    //    $('#vmodel').load('/home/ManageEvent/' + info.event.id, function (response, status, xhr) {
 //                    //        modalInit();
 //                    //    });
 //                    //$('.modal-body').load('/api/Agenda/CarregaViagens', function (response, status, xhr) {

 //                    var idViagem = info.event.id;

 //                    console.log("ID: " + idViagem);

 //                    $.ajax({
 //                        type: "GET",
 //                        url: '/api/Agenda/RecuperaViagem',
 //                        data: { id: idViagem },
 //                        contentType: "application/json",
 //                        dataType: "json",
 //                        success: function (response) {

 //                            //console.log(response.data.viagemId);
 //                            //console.log(response.data.dataInicial);
 //                            //console.log(response.data.horaInicio);

 //                            ExibeViagem(response.data);
 //                        }
 //                    });
 //                    $('#modalViagens').modal('show');

 //                },
 //                eventResize: function (info) {
 //                    editEventDrop(info);
 //                    //if (!confirm("is this okay?")) {
 //                    //    info.revert();
 //                    //}
 //                },
 //                eventDrop: function (info) {
 //                    editEventDrop(info);
 //                    //if (!confirm("Are you sure about this change?")) {
 //                    //    info.revert();
 //                    //}
 //                },
 //                loading: function (isLoading) {
 //                    if (isLoading) {
 //                        $(".example").show();
 //                    }
 //                    else {
 //                        $(".example").hide();
 //                    }
 //                }
 //            });
 //            calendar.render();
 //        },
 //        error: function (XMLHttpRequest, textStatus, errorThrown) {
 //            //-- log error
 //        }
 //    });
 //}


// Event Handler for btnConfirma
//$("#btnConfirma").click(async function (event) {
//    event.preventDefault();

//    // Desabilitar o botão para evitar múltiplas submissões
//    $("#btnConfirma").prop("disabled", true);

//    // Ensure viagemId is fetched correctly
//    viagemId = document.getElementById("txtViagemId").value;

//    if (!ValidaCampos(viagemId)) {
//        $("#btnConfirma").prop("disabled", false);
//        return; // If validation fails, stop execution
//    }

//    var lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
//    var lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
//    var periodoRecorrente = document.getElementById("lstPeriodos").ej2_instances[0].value;

//    if (periodoRecorrente === 'V') {
//        // "V" (Dias Variados) - Use calendar values directly
//        let calendarObj = document.getElementById('calDatasSelecionadas').ej2_instances[0];
//        let selectedDates = calendarObj.values;

//        if (!selectedDates || selectedDates.length === 0) {
//            Swal.fire({
//                title: 'Erro',
//                text: 'Você precisa selecionar ao menos uma data no calendário para o período "Dias Variados".',
//                icon: 'error',
//                confirmButtonText: 'Ok'
//            });

//            // Reabilitar o botão para permitir novas submissões
//            $("#btnConfirma").prop("disabled", false);
//            return;
//        }

//        // Create separate agendamentos for each selected date
//        let agendamentosPromises = selectedDates.map(async (date) => {
//            let dataFormatted = moment(date).toISOString().split('T')[0];
//            let agendamentoUnico = criarAgendamento(dataFormatted);
//            await enviarAgendamentoSerial(agendamentoUnico);
//        });

//        await Promise.all(agendamentosPromises);

//    } else {
//        // Other Recurrence Types (D, S, Q, M)
//        let dataInicialAjustada = ajustarDataInicialRecorrente(periodoRecorrente);
//        if (!dataInicialAjustada) {
//            $("#btnConfirma").prop("disabled", false);
//            return; // Stop execution if no valid start date is found
//        }

//        if (viagemId === "") {
//            var recorrente = document.getElementById("lstRecorrente").ej2_instances[0].value;

//            if (recorrente === "S") {
//                var dataFimRecorrenciaString = $('#txtFinalRecorrencia').val();
//                var dataFimRecorrencia = moment(dataFimRecorrenciaString, 'DD/MM/YYYY').toDate();
//                var dataInicial = moment(dataInicialAjustada, 'YYYY-MM-DD').toDate();

//                if (!dataFimRecorrencia || isNaN(dataFimRecorrencia.getTime())) {
//                    console.error("Invalid date object for dataFimRecorrencia");
//                    $("#btnConfirma").prop("disabled", false);
//                    return; // Stop if the date is invalid
//                }

//                if (!validarPeriodoRecorrente(dataInicial, dataFimRecorrencia)) {
//                    Swal.fire({
//                        title: 'Atenção',
//                        text: 'O período de recorrência não pode exceder 365 dias.',
//                        icon: 'warning',
//                        confirmButtonText: 'Entendi',
//                        confirmButtonColor: '#3085d6',
//                        timer: 3000,
//                        position: 'top-start',
//                        customClass: { popup: 'swal2-popup' }
//                    });
//                    $("#btnConfirma").prop("disabled", false);
//                    return; // Stop execution if period validation fails
//                }

//                var datasRecorrentes = criarAgendamentosRecorrentes();
//                var agendamentoInicial = criarAgendamento(dataInicialAjustada);
//                await enviarAgendamentoSerial(agendamentoInicial, datasRecorrentes, true);
//            } else {
//                var agendamentoUnico = criarAgendamento(dataInicialAjustada);
//                await enviarAgendamentoSerial(agendamentoUnico);
//            }
//        }
//    }

//});


function formatDate(dateObj) {
    const day = ("0" + dateObj.getDate()).slice(-2);
    const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}
 
function updateBadge() {
    document.getElementById("itemCount").textContent = $("#lstDias").data("kendoMultiSelect").dataSource.total();
}


//< !--JavaScript to initialize the accordion-- >

//REQUISITANTES

// Initialize the Syncfusion Accordion
var accordionRequisitante = new ej.navigations.Accordion({
    width: 600,
    height: 'auto',
    margintop: 100,
    marginleft: -300,
    expandMode: 'Single', // Allows only one item to be expanded at a time
    animation: {
        expand: { effect: 'fadeIn', duration: 3000 }, // Animation for expanding
        collapse: { effect: 'fadeOut', duration: 3000 } // Animation for collapsing
    }
});

// Append the accordion to the specified HTML element
accordionRequisitante.appendTo('#accordionRequisitante');


// Show/Hide functionality
var toggleAccordionBtnRequisitante = document.getElementById("btnRequisitante");
var accordionElementRequisitante = document.getElementById("accordionRequisitante");

var toggleAccordionBtnSetores = document.getElementById("btnAbrirNovoSetor");
var accordionElementSetores = document.getElementById("accordionSetor");


toggleAccordionBtnRequisitante.addEventListener("click", function () {
    if (accordionElementRequisitante.style.display === "none") {
        accordionElementRequisitante.style.display = "block";
        accordionElementSetores.style.display = "none";
        // // toggleAccordionBtn.textContent = "Hide Accordion";
    } else {
        accordionElementRequisitante.style.display = "none";
        // toggleAccordionBtn.textContent = "Show Accordion";
    }
});


//SETORES

// Initialize the Syncfusion Accordion
var accordionSetor = new ej.navigations.Accordion({
    width: 700,
    height: 'auto',
    margintop: 100,
    marginleft: -1300,
    expandMode: 'Single', // Allows only one item to be expanded at a time
    animation: {
        expand: { effect: 'fadeIn', duration: 3000 }, // Animation for expanding
        collapse: { effect: 'fadeOut', duration: 3000 } // Animation for collapsing
    }
});

// Append the accordion to the specified HTML element
accordionSetor.appendTo('#accordionSetor');


// Show/Hide functionality

toggleAccordionBtnSetores.addEventListener("click", function () {
    if (accordionElementSetores.style.display === "none") {
        accordionElementSetores.style.display = "block";
        accordionElementRequisitante.style.display = "none";
        // // toggleAccordionBtn.textContent = "Hide Accordion";
    } else {
        accordionElementSetores.style.display = "none";
        // toggleAccordionBtn.textContent = "Show Accordion";
    }
});


//Eventos

// Initialize the Syncfusion Accordion
var accordionEvento = new ej.navigations.Accordion({
    width: 800,
    height: 'auto',
    margintop: 100,
    marginleft: -1300,
    expandMode: 'Single', // Allows only one item to be expanded at a time
    animation: {
        expand: { effect: 'fadeIn', duration: 3000 }, // Animation for expanding
        collapse: { effect: 'fadeOut', duration: 3000 } // Animation for collapsing
    }
});

// Append the accordion to the specified HTML element
accordionEvento.appendTo('#accordionEvento');

var toggleAccordionBtnEvento = document.getElementById("btnEvento");
var accordionElementEvento = document.getElementById("accordionEvento");


// Show/Hide functionality

toggleAccordionBtnEvento.addEventListener("click", function () {
    if (accordionElementEvento.style.display === "none") {
        accordionElementEvento.style.display = "block";
        // // toggleAccordionBtn.textContent = "Hide Accordion";
    } else {
        accordionElementEvento.style.display = "none";
        // toggleAccordionBtn.textContent = "Show Accordion";
    }
});




    // Botão InserirSetor do Modal
    //============================
    $("#btnInserirSetor").click(function (e) {

        e.preventDefault();

        if ($("#txtNomeSetor").val() === "") {
            Swal.fire({
                title: 'Atenção',
                text: "O Nome do Setor é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar",
                }
            });
            return
        };

        if ($("#txtRamalSetor").val() === "") {
            Swal.fire({
                title: 'Atenção',
                text: "O Ramal do Seor é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar",
                }
            });
            return
        };

        var setorPai = document.getElementById('ddtSetorPai').ej2_instances[0];

        setorPaiId = null;

        if (document.getElementById('ddtSetorPai').ej2_instances[0].value != '' && document.getElementById('ddtSetorPai').ej2_instances[0].value != null) {
            setorPaiId = document.getElementById('ddtSetorPai').ej2_instances[0].value.toString();
        }

        if ((setorPaiId === null)) {
            var objSetor = JSON.stringify({ "Nome": $('#txtNomeSetor').val(), "Ramal": $('#txtRamalSetor').val(), "Sigla": $('#txtSigla').val() })
        }
        else {
            var objSetor = JSON.stringify({ "Nome": $('#txtNomeSetor').val(), "Ramal": $('#txtRamalSetor').val(), "Sigla": $('#txtSigla').val(), "SetorPaiId": setorPaiId })
        };

        console.log(objSetor);

        $.ajax({
            type: "post",
            url: "/api/Viagem/AdicionarSetor",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: objSetor,

            success: function (data) {

                if (data.success) {
                    toastr.success(data.message);


                    PreencheListaSetores();
                    // $("#modalSetor").hide();

                    // $('body').removeClass('modal-open');
                    // $("body").css("overflow", "auto");

                    document.getElementById("accordionSetor").style.display = "none"; // Esconde a DIV

                    // Assuming you have a DropDownTree initialized
                    var dropdownTreeObj = document.getElementById('ddtSetorRequisitante').ej2_instances[0];

                    // Set the desired value
                    dropdownTreeObj.value = [data.setorId]; // Replace 'desiredValue' with the actual value

                    // Refresh the ComboBox
                    dropdownTreeObj.dataBind();

                    console.log(data.setorId);


                }
                else {
                    toastr.error(data.message);

                }

            },
            error: function (data) {
                toastr.error(data.message);
            }
        });
    });


    function onChangeRecorrente(args) {

        console.log("Selected item:", this.value());

        recorrente = document.getElementById("lstRecorrente").ej2_instances[0].value;

        if (recorrente === 'S') {
            document.getElementById("divPeriodo").style.display = "block";
            document.getElementById("divDias").style.display = "none";
            document.getElementById("divFinalRecorrencia").style.display = "none";

            var calendarContainer = document.getElementById("calendarContainer");
            calendarContainer.style.display = "none";

            var listboxContainer = document.getElementById("listboxContainer");
            listboxContainer.style.display = "none";
        }
        else {
            document.getElementById("divPeriodo").style.display = "none";
            document.getElementById("divDias").style.display = "none";
            document.getElementById("divFinalRecorrencia").style.display = "none";

            var calendarContainer = document.getElementById("calendarContainer");
            calendarContainer.style.display = "none";

            var listboxContainer = document.getElementById("listboxContainer");
            listboxContainer.style.display = "none";
        }

    }

    //let dialogRecorrencia = new ej.popups.Dialog({
    //    header: '<div style="display: flex; align-items: center; justify-content: space-between;">' +
    //        '<i class="fa fa-exclamation-triangle" aria-hidden="true" style="color: #e67e22;"></i>' +
    //        '<span style="flex-grow: 1; text-align: center;">Atenção ao Prazo</span>' +
    //        '<i class="fa fa-exclamation-triangle" aria-hidden="true" style="color: #e67e22;"></i>' +
    //        '</div>',        content: 'A data final não pode ser maior que 365 dias após a data inicial.',
    //    position: { X: 'center', Y: 'center' }, // Centraliza o Dialog na tela
    //    width: '300px',
    //    cssClass: 'custom-dialog-style', // Classe CSS para aplicar estilos personalizados
    //    visible: false,  // Inicializa como invisível
    //    buttons: [{
    //        click: () => dialogRecorrencia.hide(),
    //        buttonModel: { content: 'OK', isPrimary: true }
    //    }]
    //});
    //dialogRecorrencia.appendTo('#dialogRecorrencia');

    let dialogRecorrencia = new ej.popups.Dialog({
        header: '<div style="display: flex; align-items: center; justify-content: space-between;">' +
            '<span style="font-size: 18px; color: #e74c3c; font-weight: bold;">Atenção ao Prazo</span>' +
            '<img src="./images/barbudo.jpg" alt="Warning Icon" style="width: 48px; height: 48px; margin-left: auto;">' +
            '</div>',
        content: '<div style="font-size: 16px; color: #333;">A data final não pode ser maior que 365 dias após a data inicial.</div>',
        position: { X: 'center', Y: 'center' },
        width: '350px',
        cssClass: 'custom-dialog-style', // Custom CSS class for applying additional styles
        visible: false,  // Initializes as hidden
        buttons: [{
            click: () => dialogRecorrencia.hide(),
            buttonModel: { content: 'OK', isPrimary: true, cssClass: 'custom-ok-button' }
        }]
    });
    dialogRecorrencia.appendTo('#dialogRecorrencia');

    // Custom CSS for dialog styles
    document.head.insertAdjacentHTML('beforeend', `
    <style>
        .custom-dialog-style .e-dlg-header {
            background: none; /* No background color */
            border-bottom: none;
        }
        .custom-dialog-style .e-footer-content {
            text-align: center;
        }
        .custom-ok-button {
            background-color: #3498db !important; /* Custom button color */
            color: white !important;
            border: none;
            font-size: 14px;
            padding: 8px 16px;
        }
        .custom-ok-button:hover {
            background-color: #2980b9 !important;
        }
    </style>
    `);


    // Função a ser chamada no evento focusout do controle txtFinalRecorrencia
    document.getElementById('txtFinalRecorrencia').addEventListener('focusout', function () {
        const txtDataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;
        const txtFinalRecorrencia = document.getElementById('txtFinalRecorrencia').value;

        if (txtDataInicial && txtFinalRecorrencia) {
            // Especifica claramente o formato esperado (ex: 'DD/MM/YYYY' ou 'YYYY-MM-DD')
            const dataInicial = moment(txtDataInicial, 'DD-MM-YYYY'); // 'true' para validar o formato
            const dataFinal = moment(txtFinalRecorrencia, 'DD-MM-YYYY');

            // Verifica se a diferença entre as datas é maior que 365 dias
            const diferencaDias = dataFinal.diff(dataInicial, 'days');
            if (diferencaDias > 365) {
                // Mostra o dialog e esvazia o campo txtFinalRecorrencia
                //dialogRecorrencia.show();

                Swal.fire({
                    iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                    customClass: {
                        popup: 'custom-popup'
                    },
                    title: 'Presta Atenção',
                    text: 'A data final não pode ser maior que 365 dias após a data inicial.',
                    icon: 'warning',
                    confirmButtonText: 'Ok',
                    backdrop: true, // Ensures SweetAlert2 has a backdrop like a modal
                    heightAuto: false, // Prevent layout issues
                    didOpen: () => {
                        // Ensure all modal-related backdrops and modals are hidden behind
                        $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                        // Set z-index for SweetAlert2 container and backdrop
                        $('.swal2-container').css({
                            'z-index': 9999, // Highest possible z-index
                            'position': 'fixed', // Ensure it's positioned correctly
                        });

                        $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                        // Force focus to SweetAlert2 to prevent modals from interfering
                        Swal.getPopup().focus();
                    },
                    didClose: () => {
                        // Restore the Bootstrap backdrop after SweetAlert closes
                        $('.modal-backdrop').css('z-index', '1040').show();

                        // Close the modal after success
                        $("#modalAgendamento").hide();
                        $("body").removeClass("modal-open");
                        $("body").css("overflow", "auto");

                    }
                });

                document.getElementById('txtFinalRecorrencia').value = '';
            }
        }
    });

$(document).ready(function () {


    $('#btnFecha').on('click', function () {
        $('#modalViagens').hide();
        $("div").removeClass("modal-backdrop");

        $('body').removeClass('modal-open');
        $("body").css("overflow", "auto");

    });

    $('#btnFecharFicha').on('click', function () {
        $('#modalPrint').hide();
        $("div").removeClass("modal-backdrop");

        $('body').removeClass('modal-open');
        $("body").css("overflow", "auto");

    });

    var lstEvento = document.getElementById("lstEventos").ej2_instances[0];
    lstEvento.enabled = false; // To disable

    document.getElementById("btnEvento").style.display = "none";


    InitializeCalendar("api/Agenda/CarregaViagens");
    PreencheListaSetores();

    ////Configura a Exibição do Modal de Requisitantes
    ////==============================================
    //$("#modalRequisitante").modal({
    //    keyboard: true,
    //    backdrop: "static",
    //    show: false,

    //}).on("show.bs.modal", function (event) {


    //}).on("hide.bs.modal", function (event) {
    //    var setores = document.getElementById('ddtSetorRequisitante').ej2_instances[0];
    //    setores.value = "";
    //    $("#txtPonto").val('');
    //    $("#txtNome").val('');
    //    $("#txtRamal").val('');
    //    $("#txtEmail").val('');
    //});

    ////Configura a Exibição do Modal de Setores
    ////========================================
    //$("#modalSetor").modal({
    //    keyboard: true,
    //    backdrop: "static",
    //    show: false,

    //}).on("show.bs.modal", function (event) {


    //}).on("hide.bs.modal", function (event) {
    //    var setores = document.getElementById('ddtSetorPai').ej2_instances[0];
    //    setores.value = "";
    //    $("#txtSigla").val('');
    //    $("#txtNomeSetor").val('');
    //    $("#txtRamalSetor").val('');
    //});


});


//export function ExibeViagem(viagem) {

//    //Habilita e Limpa Controles
//    //==========================

//    //debugger;

//    StatusViagem = "Aberta";

//    var childNodes = document.getElementById("divModal").getElementsByTagName('*');
//    for (var node of childNodes) {
//        node.disabled = false;
//        node.value = "";
//    }

//    // $('#txtDataInicial').attr('type', 'date');
//    // $('#txtDataFinal').attr('type', 'date');
//    $('#txtHoraInicial').attr('type', 'time');
//    $('#txtHoraFinal').attr('type', 'time');

//    document.getElementById("divNoFichaVistoria").style.display = 'none';
//    document.getElementById("divDataFinal").style.display = 'none';
//    document.getElementById("divHoraFinal").style.display = 'none';
//    document.getElementById("divKmAtual").style.display = 'none';
//    document.getElementById("divKmInicial").style.display = 'none';
//    document.getElementById("divKmFinal").style.display = 'none';

//    var rte = document.getElementById("rteDescricao").ej2_instances[0];
//    rte.enabled = true;
//    rte.value = ""
//    var lstFinalidade = document.getElementById("lstFinalidade").ej2_instances[0];
//    lstFinalidade.enabled = true;
//    lstFinalidade.value = "";
//    var lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
//    lstMotorista.enabled = true;
//    lstMotorista.value = "";
//    var lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
//    lstVeiculo.enabled = true;
//    lstVeiculo.value = "";
//    var lstRequisitante = document.getElementById("lstRequisitante").ej2_instances[0];
//    lstRequisitante.enabled = true;
//    lstRequisitante.value = "";
//    var ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
//    ddtSetor.enabled = true;
//    ddtSetor.value = "";
//    var ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0];
//    ddtCombustivelInicial.value = "";
//    document.getElementById("divCombustivelInicial").style.display = 'none';
//    var ddtCombustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0];
//    ddtCombustivelFinal.value = "";
//    document.getElementById("divCombustivelFinal").style.display = 'none';

//    $("#btnViagem").show();
//    $("#btnImprime").show();
//    $("#btnConfirma").show();
//    $("#btnApaga").show();
//    $("#btnCancela").show();

//    document.getElementById("lblUsuarioCriacao").innerHTML = ""

//    var lstEvento = document.getElementById("lstEventos").ej2_instances[0];
//    lstEvento.enabled = false; // To disable
//    document.getElementById("btnEvento").style.display = "none";

//    if (viagem === "") {

//        //Cria Agendamento
//        document.getElementById("Titulo").innerHTML = "<h3 class='modal-title'><i class='fad fa-calendar-alt' aria-hidden'true'></i> Criar Agendamento</h3>";
//        console.log("Criar Agendamento");
//        $("#btnViagem").hide();
//        $("#btnImprime").hide();
//        $("#btnApaga").hide();
//        $("#btnCancela").hide();
//        $("#btnConfirma").html("<i class='fa fa-save' aria-hidden='true'></i>Cria Agendamento");

//    }
//    else {

//        console.log("Status Agendamento: " + viagem.statusAgendamento);

//        $("#txtViagemId").val(viagem.viagemId);
//        $("#txtStatusAgendamento").val(viagem.statusAgendamento);
//        $("#txtUsuarioIdCriacao").val(viagem.usuarioIdCriacao);
//        $("#txtDataCriacao").val(viagem.dataCriacao);

//        //Exibe dados comuns ao Agendamento e Viagem
//        //============================================
//        // $('#txtDataInicial').removeAttr("type");
//        var dataInicial = moment(viagem.dataInicial);
//        //let data = moment('2024-10-24T00:00:00');

//        // Formate a data no formato que o controle espera
//        // let dataFormatada = dataInicial.format('DD/MM/YYYY');
//        let dataFormatada = dataInicial.toDate();

//        // Verifique se o DatePicker já existe no elemento
//        let datepickerElement = document.getElementById('txtDataInicial');
//        datepickerElement.ej2_instances[0].value = dataFormatada;


//        // Agora, passe para o controle DatePicker da Syncfusion
//        // let datePickerObject = {
//        // 	value: dataFormatada // Atribua a data formatada ao valor do datepicker
//        // };

//        // Inicializando o datepicker com a data formatada
//        // let datepicker = new ej.calendars.DatePicker(datePickerObject);
//        // datepicker.appendTo('#txtDataInicial');

//        // document.getElementById("txtDataInicial").value = dataInicial;
//        // $('#txtDataInicial').attr('type', 'date');

//        $('#txtHoraInicial').removeAttr("type");
//        var horaInicio = viagem.horaInicio;
//        horaInicio = horaInicio.substring(11, 16);
//        document.getElementById("txtHoraInicial").value = horaInicio;

//        $('#txtHoraInicial').attr('type', 'time');

//        //debugger;

//        document.getElementById("lstFinalidade").ej2_instances[0].value = [viagem.finalidade];
//        document.getElementById("lstFinalidade").ej2_instances[0].text = viagem.finalidade;
//        $("#txtOrigem").val(viagem.origem);
//        $("#txtDestino").val(viagem.destino);

//        if (viagem.eventoId != null) {
//            var lstEvento = document.getElementById("lstEventos").ej2_instances[0];
//            lstEvento.enabled = true; // To disable
//            lstEvento.value = [viagem.eventoId];
//            document.getElementById("btnEvento").style.display = "block";
//        }
//        else {
//            var lstEvento = document.getElementById("lstEventos").ej2_instances[0];
//            lstEvento.enabled = false; // To disable
//            document.getElementById("btnEvento").style.display = "none";
//        }

//        lstMotorista.value = viagem.motoristaId;

//        console.log("MotoristaId: " + viagem.motoristaId);
//        console.log("Nome Motorista: " + lstMotorista.text);

//        lstVeiculo.value = viagem.veiculoId;
//        document.getElementById("txtKmAtual").value = viagem.kmAtual;

//        lstRequisitante.value = viagem.requisitanteId;

//        document.getElementById("txtRamalRequisitante").value = viagem.ramalRequisitante;

//        ddtSetor.value = [viagem.setorSolicitanteId];
//        console.log("SetorId: " + viagem.setorSolicitanteId)

//        rte.value = viagem.descricao;
//        document.getElementById("rteDescricao").ej2_instances[0].value = viagem.descricao

//        const DataCriacao = moment(viagem.dataCriacao).format("DD/MM/YYYY");
//        const HoraCriacao = moment(viagem.dataCriacao).format("HH:mm");

//        var usuarioCriacao;

//        $.ajax({
//            url: '/api/Agenda/RecuperaUsuario',
//            type: "Get",
//            data: { id: viagem.usuarioIdCriacao },
//            contentType: "application/json; charset=utf-8",
//            dataType: "json",
//            success: function (data) {
//                $.each(data, function (key, val) {
//                    usuarioCriacao = val;
//                });
//                document.getElementById("lblUsuarioCriacao").innerHTML = "Incluída/Alterada por " + usuarioCriacao + " em " + DataCriacao + " às " + HoraCriacao;
//                console.log("Usuário: " + usuarioCriacao)

//            },
//            error: function (err) {
//                console.log(err)
//                alert('something went wrong')
//            }
//        });

//        $("#btnViagem").hide();
//        $("#btnImprime").hide();
//        $("#btnConfirma").hide();
//        $("#btnApaga").hide();
//        $("#btnCancela").hide();


//        //Exibe Viagem/Agendamento
//        if (viagem.statusAgendamento === true) {

//            //Exibe Agendamento
//            document.getElementById("Titulo").innerHTML = "<h3 class='modal-title'><i class='fad fa-calendar-alt' aria-hidden'true'></i> Editar Agendamento</h3>";
//            $("#btnConfirma").html("<i class='fa fa-save' aria-hidden='true'></i>Edita Agendamento");
//            $("#txtViagemId").val(viagem.viagemId);

//            $("#btnViagem").show();
//            $("#btnImprime").show();
//            $("#btnConfirma").show();
//            $("#btnApaga").show();
//            $("#btnCancela").show();

//            if (viagem.status === "Cancelada") {

//                document.getElementById("Titulo").innerHTML = "<h3 class='modal-title'><i class='fad fa-calendar-alt' aria-hidden'true'></i> Agendamento Cancelado</h3>";
//                $("#btnViagem").hide();
//                $("#btnImprime").hide();
//                $("#btnConfirma").hide();
//                $("#btnApaga").hide();
//                $("#btnCancela").hide();

//            }

//        }
//        else {

//            //Exibe Viagem
//            document.getElementById("Titulo").innerHTML = "<h3 class='modal-title'><i class='fad fa-route' aria-hidden'true'></i> Exibindo Viagem</h3>";


//            var childNodes = document.getElementById("divModal").getElementsByTagName('*');
//            for (var node of childNodes) {
//                node.disabled = true;
//            }

//            var rte = document.getElementById("rteDescricao").ej2_instances[0];
//            rte.enabled = false; // To disable
//            var lstFinalidade = document.getElementById("lstFinalidade").ej2_instances[0];
//            lstFinalidade.enabled = false; // To disable
//            var lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
//            lstMotorista.enabled = false; // To disable
//            var lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
//            lstVeiculo.enabled = false; // To disable
//            var lstRequisitante = document.getElementById("lstRequisitante").ej2_instances[0];
//            //lstRequisitante.enabled = false; // To disable
//            var ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
//            //ddtSetor.enabled = false; // To disable
//            var ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0];
//            ddtCombustivelInicial.enabled = false; // To disable
//            var ddtCombustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0];
//            ddtCombustivelFinal.enabled = false; // To disable
//            document.getElementById("divCombustivelInicial").style.display = 'block';
//            document.getElementById("divCombustivelFinal").style.display = 'block';

//            document.getElementById("divNoFichaVistoria").style.display = 'block';
//            document.getElementById("divDataFinal").style.display = 'block';
//            document.getElementById("divHoraFinal").style.display = 'block';
//            document.getElementById("divKmAtual").style.display = 'block';
//            document.getElementById("divKmInicial").style.display = 'block';
//            document.getElementById("divKmFinal").style.display = 'block';

//            console.log(viagem);

//            $("#txtNoFichaVistoria").val(viagem.noFichaVistoria);

//            if (viagem.status === "Realizada") {
//                $('#txtDataFinal').removeAttr("type");
//                var dataFinal = viagem.dataFinal;
//                dataFinal = dataFinal.substring(0, 10);
//                dArr = dataFinal.split("-");  // ex input "2010-01-18"
//                dataFinal = dArr[2] + "/" + dArr[1] + "/" + dArr[0].substring(0, 4); //ex out: "18/01/10"
//                document.getElementById("txtDataFinal").value = dataFinal;

//                $('#txtHoraFinal').removeAttr("type");
//                var horaFim = viagem.horaFim;
//                horaFim = horaFim.substring(11, 16);
//                document.getElementById("txtHoraFinal").value = horaFim;
//            }

//            document.getElementById("txtKmAtual").value = viagem.kmAtual;
//            document.getElementById("txtKmInicial").value = viagem.kmInicial;
//            document.getElementById("txtKmFinal").value = viagem.kmFinal;

//            ddtCombustivelInicial.value = [viagem.combustivelInicial];
//            if ([viagem.combustivelFinal] != null && [viagem.combustivelFinal] != '') {
//                ddtCombustivelFinal.value = [viagem.combustivelFinal];
//            }

//            console.log("ddtCombustivelInicial : " + ddtCombustivelInicial.value);
//            console.log("ddtCombustivelInicialViagem : " + ddtCombustivelInicial.value);

//            console.log("ddtCombustivelFinal : " + [viagem.combustivelInicial]);
//            console.log("ddtCombustivelFinalViagem : " + [viagem.combustivelFinal]);

//            if (viagem.status === "Realizada") {

//                const DataFinalizacao = moment(viagem.dataCriacao).format("DD/MM/YYYY");
//                const HoraFinalizacao = moment(viagem.dataCriacao).format("HH:mm");


//                var usuarioFinalizacao;

//                $.ajax({
//                    url: '/api/Agenda/RecuperaUsuario',
//                    type: "Get",
//                    data: { id: viagem.usuarioIdFinalizacao },
//                    contentType: "application/json; charset=utf-8",
//                    dataType: "json",
//                    success: function (data) {
//                        $.each(data, function (key, val) {
//                            usuarioFinalizacao = val;
//                        });
//                        console.log("Usuário: " + usuarioFinalizacao)
//                        document.getElementById("lblUsuarioFinalizacao").innerHTML = " - Finalizada por " + usuarioFinalizacao + " em " + DataFinalizacao + " às " + HoraFinalizacao;

//                    },
//                    error: function (err) {
//                        console.log(err)
//                        alert('something went wrong')
//                    }
//                });

//            }

//        }

//    }
//}

// Configura a Exibição do Modal de Viagens
$('#modalViagens').on('shown.bs.modal', function (event) {
    defaultRTE.refreshUI();
    $(document).off('focusin.modal');
    $("#btnConfirma").prop("disabled", false);

    var viagemId = document.getElementById("txtViagemId").value;
    var relatorioAsString = "";

    $.ajax({
        type: "GET",
        url: '/api/Agenda/RecuperaViagem',
        data: { id: viagemId },
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
            if (response.data.status == "Cancelada") {
                relatorioAsString = (response.data.finalidade != "Evento") ? "FichaCancelada.trdp" : "FichaEventoCancelado.trdp";
            } else if (response.data.finalidade == "Evento" && response.data.status != "Cancelada") {
                relatorioAsString = "FichaEvento.trdp";
            } else if (response.data.status == "Aberta" && response.data.finalidade != "Evento") {
                relatorioAsString = "FichaAberta.trdp";
            } else if (response.data.status == "Realizada") {
                relatorioAsString = (response.data.finalidade != "Evento") ? "FichaRealizada.trdp" : "FichaEventoRealizado.trdp";
            } else if (response.data.statusAgendamento == true) {
                relatorioAsString = (response.data.finalidade != "Evento") ? "FichaAgendamento.trdp" : "FichaEventoAgendado.trdp";
            }

            // Renderiza o relatório
            $("#fichaReport")
                .telerik_ReportViewer({
                    serviceUrl: "/api/reports/",
                    reportSource: {
                        report: relatorioAsString,
                        parameters: { ViagemId: viagemId.toString().toUpperCase() }
                    },
                    viewMode: telerikReportViewer.ViewModes.PRINT_PREVIEW,
                    scaleMode: telerikReportViewer.ScaleModes.SPECIFIC,
                    scale: 1.0,
                    enableAccessibility: false,
                    sendEmail: { enabled: true }
                });

            ExibeViagem(response.data);
        }
    });

    const novaDataMinima = new Date();
    const datePickerElement = document.getElementById('txtDataInicial');
    const datePickerInstance = datePickerElement.ej2_instances[0]; // Acessando a instância
    novaDataMinima.setDate(novaDataMinima.getDate() - 1); // Um dia antes de hoje
    datePickerInstance.setProperties({ min: novaDataMinima });
    datePickerInstance.min = novaDataMinima;
    console.log("datePickerInstance");

}).on("hide.bs.modal", function (event) {
    // Remove o relatório e recria o container para o próximo uso
    $("#fichaReport").remove();
    $("#ReportContainer").append("<div id='fichaReport' style='width:100%' class='pb-3'> Carregando... </div>");
    $("div").removeClass("modal-backdrop");
    $('body').removeClass('modal-open');
    location.reload();
});

var defaultRTE;
var StatusViagem = "Aberta";
var calendar;
var InserindoRequisitante = false;
var CarregandoAgendamento = false;

$.fn.modal.Constructor.prototype.enforceFocus = function () { };

function onCreate() {

    defaultRTE = this;

}





//Função necessária para o RTE
function toolbarClick(e) {
    if (e.item.id == "rte_toolbar_Image") {
        var element = document.getElementById('rte_upload')
        element.ej2_instances[0].uploading = function upload(args) {
            args.currentRequest.setRequestHeader('XSRF-TOKEN', document.getElementsByName('__RequestVerificationToken')[0].value);
        }
    }
}


//Controla o Submit do Agendamento
//================================
$("#btnViagem").click(function (event) {

    event.preventDefault()

    $("#btnViagem").hide();
    $("#btnConfirma").html("<i class='fa fa-save' aria-hidden='true'></i>Registra Viagem");

    document.getElementById("divNoFichaVistoria").style.display = 'block';
    document.getElementById("divDataFinal").style.display = 'block';
    document.getElementById("divHoraFinal").style.display = 'block';
    document.getElementById("divKmAtual").style.display = 'block';
    document.getElementById("divKmInicial").style.display = 'block';
    document.getElementById("divKmFinal").style.display = 'block';
    document.getElementById("divCombustivelInicial").style.display = 'block';
    document.getElementById("divCombustivelFinal").style.display = 'block';

    $("#txtStatusAgendamento").val(false);

    VeiculoValueChange()

});


//Controla o Apagar do Agendamento
//================================
$("#btnApaga").click(function (event) {

    var viagemId = document.getElementById("txtViagemId").value;
    var rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];

    Swal.fire({
        title: "Você tem certeza que deseja apagar este agendamento?",
        text: "Não será possível recuperar os dados eliminados!",
        icon: "warning",
        iconHtml: '<img src="/images/assustado.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
        customClass: {
            popup: 'custom-popup'
        },
        showCancelButton: true,
        confirmButtonText: 'Apagar',
        cancelButtonText: 'Desistir',
        dangerMode: true,
        heightAuto: false,
        didOpen: () => {
            $('.modal-backdrop').css('z-index', '1040').hide();
            $('.swal2-container').css({
                'z-index': 9999,
                'position': 'fixed'
            });
            $('.swal2-backdrop-show').css('z-index', 9998);
            Swal.getPopup().focus();
        },
        didClose: () => {
            $('.modal-backdrop').css('z-index', '1040').show();
        }
    }).then((result) => {
        if (result.isConfirmed) {
            console.log("viagemId: " + document.getElementById("txtViagemId").value, "descricao: " + rteDescricao.value);

            var objAgendamento = JSON.stringify({ "ViagemId": viagemId, "Descricao": rteDescricao.value });

            $.ajax({
                type: "post",
                url: '/api/Agenda/ApagaAgendamento',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: objAgendamento,
                success: function (data) {
                    if (data.success) {
                        toastr.success(data.message);
                        $("#modalAgendamento").hide();
                        $('body').removeClass('modal-open');
                        $("body").css("overflow", "auto");
                        location.reload();
                    } else {
                        toastr.error(data.message);
                    }
                },
                error: function (err) {
                    console.log("Erro:  " + err.responseText);
                    alert('something went wrong');
                }
            });
        }
    });

});

    // Controla o Cancelar do Agendamento
    // ==================================
    $("#btnCancela").click(function (event) {

        var viagemId = document.getElementById("txtViagemId").value;
        var rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];

        Swal.fire({
            title: "Você tem certeza que deseja cancelar este agendamento?",
            text: "Não será possível recuperar os dados eliminados!",
            icon: "warning",
            iconHtml: '<img src="/images/assustado.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup'
            },
            showCancelButton: true,
            confirmButtonText: 'Cancelar',
            cancelButtonText: 'Desistir',
            dangerMode: true,
            heightAuto: false,
            didOpen: () => {
                $('.modal-backdrop').css('z-index', '1040').hide();
                $('.swal2-container').css({
                    'z-index': 9999,
                    'position': 'fixed'
                });
                $('.swal2-backdrop-show').css('z-index', 9998);
                Swal.getPopup().focus();
            },
            didClose: () => {
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        }).then((result) => {
            if (result.isConfirmed) {
                console.log("viagemId: " + document.getElementById("txtViagemId").value, "descricao: " + rteDescricao.value);

                var objAgendamento = JSON.stringify({ "ViagemId": viagemId, "Descricao": rteDescricao.value });

                $.ajax({
                    type: "post",
                    url: '/api/Agenda/CancelaAgendamento',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: objAgendamento,
                    success: function (data) {
                        if (data.success) {
                            toastr.success(data.message);
                            $("#modalAgendamento").hide();
                            $('body').removeClass('modal-open');
                            $("body").css("overflow", "auto");
                            location.reload();
                        } else {
                            toastr.error(data.message);
                        }
                    },
                    error: function (err) {
                        console.log("Erro: " + err.responseText);
                        alert('something went wrong');
                    }
                });
            }
        });
    });


//Controla o Imprimir do Agendamento
//==================================
$("#btnImprime").click(function (event) {

    //Imprime a Ficha do Agendamento
    var viagemId = document.getElementById("txtViagemId").value;

    $("#fichaReport")
        .telerik_ReportViewer({
            serviceUrl: "/api/reports/",
            reportSource: {
                report: 'Agendamento.trdp',
                parameters: { ViagemId: viagemId.toString().toUpperCase() }
            },
            viewMode: telerikReportViewer.ViewModes.PRINT_PREVIEW,
            scaleMode: telerikReportViewer.ScaleModes.SPECIFIC,
            scale: 1.0,
            enableAccessibility: false,
            sendEmail: { enabled: true }
        });


});

ej.base.L10n.load({
    "pt-BR": {
        "richtexteditor": {
            "alignments": "Alinhamentos",
            "justifyLeft": "Alinhar à Esquerda",
            "justifyCenter": "Centralizar",
            "justifyRight": "Alinhar à Direita",
            "justifyFull": "Justificar",
            "fontName": "Nome da Fonte",
            "fontSize": "Tamanho da Fonte",
            "fontColor": "Cor da Fonte",
            "backgroundColor": "Cor de Fundo",
            "bold": "Negrito",
            "italic": "Itálico",
            "underline": "Sublinhado",
            "strikethrough": "Tachado",
            "clearFormat": "Limpa Formatação",
            "clearAll": "Limpa Tudo",
            "cut": "Cortar",
            "copy": "Copiar",
            "paste": "Colar",
            "unorderedList": "Lista com Marcadores",
            "orderedList": "Lista Numerada",
            "indent": "Aumentar Identação",
            "outdent": "Diminuir Identação",
            "undo": "Desfazer",
            "redo": "Refazer",
            "superscript": "Sobrescrito",
            "subscript": "Subscrito",
            "createLink": "Inserir Link",
            "openLink": "Abrir Link",
            "editLink": "Editar Link",
            "removeLink": "Remover Link",
            "image": "Inserir Imagem",
            "replace": "Substituir",
            "align": "Alinhar",
            "caption": "Título da Imagem",
            "remove": "Remover",
            "insertLink": "Inserir Link",
            "display": "Exibir",
            "altText": "Texto Alternativo",
            "dimension": "Mudar Tamanho",
            "fullscreen": "Maximizar",
            "maximize": "Maximizar",
            "minimize": "Minimizar",
            "lowerCase": "Caixa Baixa",
            "upperCase": "Caixa Alta",
            "print": "Imprimir",
            "formats": "Formatos",
            "sourcecode": "Visualizar Código",
            "preview": "Exibir",
            "viewside": "ViewSide",
            "insertCode": "Inserir Código",
            "linkText": "Exibir Texto",
            "linkTooltipLabel": "Título",
            "linkWebUrl": "Endereço Web",
            "linkTitle": "Entre com um título",
            "linkurl": "http://exemplo.com",
            "linkOpenInNewWindow": "Abrir Link em Nova Janela",
            "linkHeader": "Inserir Link",
            "dialogInsert": "Inserir",
            "dialogCancel": "Cancelar",
            "dialogUpdate": "Atualizar",
            "imageHeader": "Inserir Imagem",
            "imageLinkHeader": "Você pode proporcionar um link da web",
            "mdimageLink": "Favor proporcionar uma URL para sua imagem",
            "imageUploadMessage": "Solte a imagem aqui ou busque para o upload",
            "imageDeviceUploadMessage": "Clique aqui para o upload",
            "imageAlternateText": "Texto Alternativo",
            "alternateHeader": "Texto Alternativo",
            "browse": "Procurar",
            "imageUrl": "http://exemplo.com/imagem.png",
            "imageCaption": "Título",
            "imageSizeHeader": "Tamanho da Imagem",
            "imageHeight": "Altura",
            "imageWidth": "Largura",
            "textPlaceholder": "Entre com um Texto",
            "inserttablebtn": "Inserir Tabela",
            "tabledialogHeader": "Inserir Tabela",
            "tableWidth": "Largura",
            "cellpadding": "Espaçamento de célula",
            "cellspacing": "Espaçamento de célula",
            "columns": "Número de colunas",
            "rows": "Número de linhas",
            "tableRows": "Linhas da Tabela",
            "tableColumns": "Colunas da Tabela",
            "tableCellHorizontalAlign": "Alinhamento Horizontal da Célular",
            "tableCellVerticalAlign": "Alinhamento Vertical da Célular",
            "createTable": "Criar Tabela",
            "removeTable": "Remover Tabela",
            "tableHeader": "Cabeçalho da Tabela",
            "tableRemove": "Remover Tabela",
            "tableCellBackground": "Fundo da Célula",
            "tableEditProperties": "Editar Propriedades da Tabela",
            "styles": "Estilos",
            "insertColumnLeft": "Inserir Coluna à Esquerda",
            "insertColumnRight": "Inserir Coluna à Direita",
            "deleteColumn": "Apagar Coluna",
            "insertRowBefore": "Inserir Linha Antes",
            "insertRowAfter": "Inserir Linha Depois",
            "deleteRow": "Apagar Linha",
            "tableEditHeader": "Edita Tabela",
            "TableHeadingText": "Cabeçãlho",
            "TableColText": "Col",
            "imageInsertLinkHeader": "Inserir Link",
            "editImageHeader": "Edita Imagem",
            "alignmentsDropDownLeft": "Alinhar à Esquerda",
            "alignmentsDropDownCenter": "Centralizar",
            "alignmentsDropDownRight": "Alinhar à Direita",
            "alignmentsDropDownJustify": "Justificar",
            "imageDisplayDropDownInline": "Inline",
            "imageDisplayDropDownBreak": "Break",
            "tableInsertRowDropDownBefore": "Inserir linha antes",
            "tableInsertRowDropDownAfter": "Inserir linha depois",
            "tableInsertRowDropDownDelete": "Apagar linha",
            "tableInsertColumnDropDownLeft": "Inserir coluna à esquerda",
            "tableInsertColumnDropDownRight": "Inserir coluna à direita",
            "tableInsertColumnDropDownDelete": "Apagar Coluna",
            "tableVerticalAlignDropDownTop": "Alinhar no Topo",
            "tableVerticalAlignDropDownMiddle": "Alinhar no Meio",
            "tableVerticalAlignDropDownBottom": "Alinhar no Fundo",
            "tableStylesDropDownDashedBorder": "Bordas Pontilhadas",
            "tableStylesDropDownAlternateRows": "Linhas Alternadas",
            "pasteFormat": "Colar Formato",
            "pasteFormatContent": "Escolha a ação de formatação",
            "plainText": "Texto Simples",
            "cleanFormat": "Limpar",
            "keepFormat": "Manter",
            "formatsDropDownParagraph": "Parágrafo",
            "formatsDropDownCode": "Código",
            "formatsDropDownQuotation": "Citação",
            "formatsDropDownHeading1": "Cabeçalho 1",
            "formatsDropDownHeading2": "Cabeçalho 2",
            "formatsDropDownHeading3": "Cabeçalho 3",
            "formatsDropDownHeading4": "Cabeçalho 4",
            "fontNameSegoeUI": "SegoeUI",
            "fontNameArial": "Arial",
            "fontNameGeorgia": "Georgia",
            "fontNameImpact": "Impact",
            "fontNameTahoma": "Tahoma",
            "fontNameTimesNewRoman": "Times New Roman",
            "fontNameVerdana": "Verdana"
        }
    }
});

//Verifica se Data Final é menor que Data Inicial
$("#txtDataFinal").focusout(function () {

    DataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;

    DataFinal = $("#txtDataFinal").val();

    if (DataFinal === '') {
        return;
    }

    if ((DataFinal < DataInicial)) {
        $("#txtDataFinal").val('');

        Swal.fire({
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup'
            },
            title: 'Presta Atenção',
            text: 'A data final deve ser maior que a inicial!',
            icon: 'error',
            dangerMode: true,
            confirmButtonText: 'Ok',
            backdrop: true, // Ensures SweetAlert2 has a backdrop like a modal
            heightAuto: false, // Prevent layout issues
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop

                // Set z-index for SweetAlert2 container and backdrop
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index
                    'position': 'fixed', // Ensure it's positioned correctly
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window

                // Force focus to SweetAlert2 to prevent modals from interfering
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes
                $('.modal-backdrop').css('z-index', '1040').show();

                // Close the modal after success
                $("#modalAgendamento").hide();
                $("body").removeClass("modal-open");
                $("body").css("overflow", "auto");

            }
        });
    }
});

//Verifica se Data Inicial é maior que Data Final
$("#txtDataInicial").focusout(function () {

    DataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;
;
    DataFinal = $("#txtDataFinal").val();

    if (DataInicial === '' || DataFinal === '') {
        return;
    }

    if ((DataInicial > DataFinal)) {
        $("#txtDataInicial").val('');
        Swal.fire({
            title: "Erro na Data",
            text: "A data inicial deve ser menor que a final!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok"
            }
        })

    }
});

//Verifica se Hora Final é menor que Hora Inicial e se tem Data Final
$("#txtHoraFinal").focusout(function () {

    HoraInicial = $("#txtHoraInicial").val();
    HoraFinal = $("#txtHoraFinal").val();
    DataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;
    DataFinal = $("#txtDataFinal").val();

    console.log(HoraInicial);
    console.log(HoraFinal);
    console.log(DataFinal);

    if (DataFinal === '') {
        $("#txtHoraFinal").val('');
        Swal.fire({
            title: "Erro na Hora Final",
            text: "Preencha a Data Final para poder preencher a Hora Final!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok"
            }
        });
    }

    if ((HoraFinal < HoraInicial) && (DataInicial === DataFinal)) {
        $("#txtHoraFinal").val('');
        Swal.fire({
            title: "Erro na Hora",
            text: "A hora final deve ser maior que a inicial!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok"
            }
        });

    }
});

//Verifica se Hora inicial é maior que Hora final
$("#txtHoraInicial").focusout(function () {

    HoraInicial = $("#txtHoraInicial").val();
    HoraFinal = $("#txtHoraFinal").val();

    console.log(HoraInicial);
    console.log(HoraFinal);

    if (HoraFinal === '') {
        return;
    }

    if (HoraInicial > HoraFinal) {
        $("#txtHoraInicial").val('');
        Swal.fire({
            title: "Erro na Hora",
            text: "A hora inicial deve ser menor que a final!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok"
            }
        });

    }
});


//Verifica se KM Final é menor que KM Inicial
$("#txtKmFinal").focusout(function () {

    kmInicial = parseInt($("#txtKmInicial").val());
    kmFinal = parseInt($("#txtKmFinal").val());

    if (kmFinal < kmInicial) {
        $("#txtKmFinal").val('');
        Swal.fire({
            title: "Erro na Quilometragem",
            text: "A quilometragem final deve ser maior que a inicial!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok"
            }
        })

    }


    if ((kmFinal - kmInicial) > 100) {
        Swal.fire({
            title: "Alerta na Quilometragem",
            text: "A quilometragem final excede em 100km a inicial!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok"
            }
        })

    }



});


//Verifica se KM Inicial é maior que KM Inicial
$("#txtKmInicial").focusout(function () {

    kmInicial = parseInt($("#txtKmInicial").val());
    kmFinal = parseInt($("#txtKmFinal").val());

    if (kmInicial > kmFinal) {
        $("#txtKmInicial").val('');
        Swal.fire({
            title: "Erro na Quilometragem",
            text: "A quilometragem inicial deve ser menor que a final!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok"
            }
        })

    }
});

//Verifica se KM Inicial é menor ou diferente de KM Atual
$("#txtKmInicial").focusout(function () {

    if ($("#txtKmInicial").val() === '' || $("#txtKmInicial").val() === null) {
        return;
    }

    kmInicial = parseInt($("#txtKmInicial").val());
    kmAtual = parseInt($("#txtKmAtual").val());

    console.log(kmInicial);

    if (kmInicial < kmAtual) {
        $("#txtKmInicial").val('');
        Swal.fire({
            title: "Erro na Quilometragem",
            text: "A quilometragem inicial deve ser maior que a atual!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok"
            }
        })
        return;
    }

    if (kmInicial != kmAtual) {
        //$("#txtKmInicial").val('');
        Swal.fire({
            title: "Erro na Quilometragem",
            text: "A quilometragem inicial não confere com a atual!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok"
            }
        })
        return;
    }

});

//Preenche Lista de Eventos Após Inserção de um novo
function PreencheListaEventos() {

    $.ajax({
        url: "/Viagens/Upsert?handler=AJAXPreencheListaEventos",
        method: "GET",
        datatype: "json",
        success: function (res) {
            try {
                var eventoid = res.data[0].eventoId;
                var nome = res.data[0].nome;

                console.log(eventoid + " " + nome);

                let EventoList = [{ "EventoId": eventoid, "Evento": nome }];

                for (var i = 1; i < res.data.length; ++i) {
                    console.log(res.data[i].eventoId + res.data[i].nome);

                    eventoid = res.data[i].eventoId;
                    nome = res.data[i].nome;

                    console.log(eventoid + " " + nome);

                    let evento = { EventoId: eventoid, Evento: nome }
                    EventoList.push(evento);
                }

                console.log(EventoList);

                document.getElementById("lstEventos").ej2_instances[0].fields.dataSource = EventoList;
            } catch (error) {
                console.error("An error occurred: ", error);
            }
        }
    });

    document.getElementById("lstEventos").ej2_instances[0].refresh();

}

//Preenche Lista de Requisitantes Após Inserção de um novo
function PreencheListaRequisitantes() {

    $.ajax({
        url: "/Viagens/Upsert?handler=AJAXPreencheListaRequisitantes",
        method: "GET",
        datatype: "json",
        success: function (res) {

            var requisitanteid = res.data[0].requisitanteId;
            var nomerequisitante = res.data[0].requisitante;

            let RequisitanteList = [{ "RequisitanteId": requisitanteid, "Requisitante": nomerequisitante }];

            for (var i = 1; i < res.data.length; ++i) {
                console.log(res.data[i].requisitanteId + res.data[i].requisitante);

                requisitanteid = res.data[i].requisitanteId;
                nomerequisitante = res.data[i].requisitante;

                let requisitante = { RequisitanteId: requisitanteid, Requisitante: nomerequisitante }
                RequisitanteList.push(requisitante);

            }

            console.log(RequisitanteList);

            document.getElementById("lstRequisitante").ej2_instances[0].fields.dataSource = RequisitanteList;

        }
    })

    document.getElementById("lstRequisitante").ej2_instances[0].refresh();

}

//Preenche Lista de Setores Após Inserção de um novo
function PreencheListaSetores() {

    $.ajax({
        url: "/Viagens/Upsert?handler=AJAXPreencheListaSetores",
        method: "GET",
        datatype: "json",
        success: function (res) {


            var setorSolicitanteId = res.data[0].setorSolicitanteId;
            var setorPaiId = res.data[0].setorPaiId;
            var nome = res.data[0].nome;
            var hasChild = res.data[0].hasChild;

            let SetorList = [{ "SetorSolicitanteId": setorSolicitanteId, "SetorPaiId": setorPaiId, "Nome": nome, "HasChild": hasChild }];

            for (var i = 1; i < res.data.length; ++i) {
                console.log(res.data[i].requisitanteId + res.data[i].requisitante);

                setorSolicitanteId = res.data[i].setorSolicitanteId;
                setorPaiId = res.data[i].setorPaiId;
                nome = res.data[i].nome;
                hasChild = res.data[i].hasChild;

                let setor = { "SetorSolicitanteId": setorSolicitanteId, "SetorPaiId": setorPaiId, "Nome": nome, "HasChild": hasChild }
                SetorList.push(setor);
            }

            console.log(SetorList);

            document.getElementById("ddtSetor").ej2_instances[0].fields.dataSource = SetorList;
            document.getElementById("ddtSetorPai").ej2_instances[0].fields.dataSource = SetorList;

            document.getElementById("ddtSetorRequisitante").ej2_instances[0].fields.dataSource = SetorList;


        }
    })

    document.getElementById("ddtSetor").ej2_instances[0].refresh();
    document.getElementById("ddtSetorPai").ej2_instances[0].refresh();

    document.getElementById("ddtSetorRequisitante").ej2_instances[0].refresh();

}


// Botão InserirEvento do Modal
//===================================
$("#btnInserirEvento").click(async function (e) {

    e.preventDefault();

    if ($("#txtNomeDoEvento").val() === "") {
        Swal.fire({
            title: 'Atenção',
            text: "O Nome do Evento é obrigatório!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar"
            }
        });
        return;
    }

    if ($("#txtDescricao").val() === "") {
        Swal.fire({
            title: 'Atenção',
            text: "A Descrição do Evento é obrigatória!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar"
            }
        });
        return;
    }

    if ($("#txtDataInicialEvento").val() === "") {
        Swal.fire({
            title: 'Atenção',
            text: "A Data Inicial é obrigatória!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar"
            }
        });
        return;
    }

    if ($("#txtDataFinalEvento").val() === "") {
        Swal.fire({
            title: 'Atenção',
            text: "A Data Final é obrigatória!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar"
            }
        });
        return;
    }

    if ($("#txtQtdPessoas").val() === "") {
        Swal.fire({
            title: 'Atenção',
            text: "A Quantidade de Pessoas é obrigatória!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar"
            }
        });
        return;
    }

    var setores = document.getElementById('lstSetorRequisitanteEvento').ej2_instances[0];
    if ((setores.value === null)) {
        Swal.fire({
            title: 'Atenção',
            text: "O Setor do Requisitante é obrigatório!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar"
            }
        });
        return;
    }
    var setorSolicitanteId = setores.value.toString();

    var requisitantes = document.getElementById('lstRequisitanteEvento').ej2_instances[0];
    if ((requisitantes.value === null)) {
        Swal.fire({
            title: 'Atenção',
            text: "O Requisitante é obrigatório!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar"
            }
        });
        return;
    }
    var requisitanteId = requisitantes.value.toString();

    var objEvento = JSON.stringify({
        "Nome": $('#txtNomeDoEvento').val(),
        "Descricao": $('#txtDescricaoEvento').val(),
        "SetorSolicitanteId": setorSolicitanteId,
        "RequisitanteId": requisitanteId,
        "QtdParticipantes": $('#txtQtdPessoas').val(),
        "DataInicial": moment(document.getElementById('txtDataInicialEvento').value).format("MM-DD-YYYY"),
        "DataFinal": moment(document.getElementById('txtDataFinalEvento').value).format("MM-DD-YYYY"),
        "Status": "1"
    });

    console.log(objEvento);

    try {
        // Set the cursor to hourglass while waiting
        document.body.style.cursor = 'wait';

        // Send AJAX request
        await $.ajax({
            type: "post",
            url: "/api/Viagem/AdicionarEvento",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: objEvento,

            success: async function (data) {
                try {
                    // Step 1: Wait for toastr to complete
                    showToastrMessage(data.message);

                    // Step 2: Wait for PreencheListaEventos to complete if it's asynchronous
                    await PreencheListaEventos();

                    // Access the ComboBox instance
                    var comboBoxInstance = document.getElementById("lstEventos").ej2_instances[0];

                    // Ensure the dataSource is initialized and is an array
                    var currentDataSource = comboBoxInstance.dataSource || [];

                    // Update the data source to make sure it includes the newly added event
                    var newEvent = { text: data.nomeDoEvento, value: data.eventoid };
                    var updatedDataSource = currentDataSource.concat([newEvent]);

                    // Assign the updated data source back to the ComboBox
                    comboBoxInstance.dataSource = updatedDataSource;

                    // Refresh the ComboBox binding
                    comboBoxInstance.dataBind();

                    // Set the desired value to the new event
                    comboBoxInstance.value = data.eventoid;

                    // Refresh the ComboBox again to reflect the selected value
                    comboBoxInstance.dataBind();

                    // Log for debugging
                    console.log("eventoId: " + data.eventoid);

                    // Hide the modal
                    $("#modalEvento").hide();

                    // Hide the accordion
                    document.getElementById("accordionEvento").style.display = "none";

                } catch (error) {
                    console.error("An error occurred during the success callback: ", error);
                }
            },
            error: function (data) {
                alert('error');
                console.log(data);
            }
        });
    } catch (error) {
        console.error("An error occurred: ", error);
    } finally {
        // Restore the cursor after completion
        document.body.style.cursor = 'default';
    }

    // Function to show toastr message and wait for it to complete
    function showToastrMessage(message) {
        return new Promise((resolve) => {
            toastr.success(message);
            setTimeout(resolve, 2000); // Adjust timeout as needed
        });
    }
});





// Botão InserirRequisitante do Modal
//===================================
$("#btnInserirRequisitante").click(function (e) {

    // if (InserindoRequisitante) {
    //     return;
    // } else {
    //     InserindoRequisitante = true;
    // }

    e.preventDefault();

    if ($("#txtPonto").val() === "") {
        Swal.fire({
            title: 'Atenção',
            text: "O Ponto do Requisitante é obrigatório!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar",
            }
        });
        return
    };

    if ($("#txtNome").val() === "") {
        Swal.fire({
            title: 'Atenção',
            text: "O Nome do Requisitante é obrigatório!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar",
            }
        });
        return
    };

    if ($("#txtRamal").val() === "") {
        Swal.fire({
            title: 'Atenção',
            text: "O Ramal do Requisitante é obrigatório!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar",
            }
        });
        return;
    };

    var setores = document.getElementById('ddtSetorRequisitante').ej2_instances[0];
    if ((setores.value.toString() === '')) {
        Swal.fire({
            title: 'Atenção',
            text: "O Setor do Requisitante é obrigatório!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar",
            }
        });
        return;
    };

    var setorSolicitanteId = setores.value.toString();

    var objRequisitante = JSON.stringify({ "Nome": $('#txtNome').val(), "Ponto": $('#txtPonto').val(), "Ramal": $('#txtRamal').val(), "Email": $('#txtEmail').val(), "SetorSolicitanteId": setorSolicitanteId })

    //debugger;

    $.ajax({
        type: "post",
        url: "/api/Viagem/AdicionarRequisitante",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: objRequisitante,

        success: function (data) {

            if (data.success) {
                toastr.success(data.message);
                // let d = document.getElementById('modalRequisitante')
                // d.style.display = "none"
                // PreencheListaRequisitantes();
                document.getElementById("lstRequisitante").ej2_instances[0].addItem({ RequisitanteId: data.requisitanteid, Requisitante: $('#txtNome').val() + " - " + $('#txtPonto').val() }, 0);
                // $("#modalRequisitante").hide();

                // $('body').removeClass('modal-open');
                // $("body").css("overflow", "auto");

                // $("#btnFecharRequisitante").click();

                document.getElementById("accordionRequisitante").style.display = "none"; // Esconde a DIV

                console.log("Passei por todas as etapas do Sucess do Adiciona Requisitante no AJAX");

                // Access the ComboBox instance
                var comboBoxInstance = document.getElementById("lstRequisitante").ej2_instances[0];

                // Set the desired value
                comboBoxInstance.value = data.requisitanteid; // Replace 'desiredValue' with the actual value

                // Refresh the ComboBox
                comboBoxInstance.dataBind();

                console.log(data.requisitanteid);


            }
            else {
                toastr.error(data.message);
            }

        },
        error: function (data) {
            toastr.error("Já existe um requisitante com este ponto/nome");
            console.log(data);
        }
    });

});

// Esconde o Accordion de Requisitante
document.getElementById('btnFecharAccordionRequisitante').onclick = function () {
    document.getElementById("accordionRequisitante").style.display = "none"; // Esconde a DIV
};

// Esconde o Accordion de Setor
document.getElementById('btnFecharAccordionSetor').onclick = function () {
    document.getElementById("accordionSetor").style.display = "none"; // Esconde a DIV
};

// Esconde o Accordion de Evento
document.getElementById('btnFecharAccordionEvento').onclick = function () {
    document.getElementById("accordionEvento").style.display = "none"; // Esconde a DIV
};


document.addEventListener("DOMContentLoaded", function () {
    // Initialize selectedDates array
    let selectedDates = [];

    // Function to update the Badge (Bootstrap Badge)
    function updateBadge() {
        const badge = document.getElementById("itensBadge");
        badge.textContent = selectedDates.length;
    }

    // Function to format Date to dd/mm/yyyy
    function formatDate(dateObj) {
        const day = ("0" + dateObj.getDate()).slice(-2);
        const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Initialize ListBox with a custom template
    const listBox = new ej.dropdowns.ListBox({
        dataSource: selectedDates,
        height: "180px",
        itemTemplate: `
				  <div class="normal-item">
					<button class="remove-btn" onclick="removeDate(\${Timestamp})">
					  <i class="fas fa-trash-alt"></i>
					</button>
					<span class="item-text">\${DateText}</span>
				  </div>`,
        noRecordsTemplate: "Sem dias escolhidos..",
    });

    // Render the ListBox inside the #lstDiasCalendario element
    listBox.appendTo("#lstDiasCalendario");

    // Function to add a date
    function addDate(dateObj) {
        const timestamp = new Date(dateObj).setHours(0, 0, 0, 0); // Normalize time
        if (!selectedDates.some((d) => d.Timestamp === timestamp)) {
            selectedDates.push({
                Timestamp: timestamp,
                DateText: formatDate(new Date(timestamp)),
            });
            selectedDates.sort((a, b) => a.Timestamp - b.Timestamp);
            console.log("Adding date:", selectedDates); // Debugging statement
            listBox.dataSource = selectedDates;
            listBox.dataBind(); // Update the ListBox
            updateBadge();
        }
    }

    // Initialize Calendar with multi-selection
    const calendar = new ej.calendars.Calendar({
        showTodayconfirmButtonText: false,
        isMultiSelection: true,
        min: new Date(), // Set minimum selectable date as the current date
        // Set locale to Portuguese (Brazil)
        locale: "pt-BR",
        // Event handler for date selection
        change: function (args) {
            const selectedDatesArray = args.values;
            selectedDates = [];
            selectedDatesArray.forEach((d) => {
                const normalizedTimestamp = new Date(d).setHours(0, 0, 0, 0);
                selectedDates.push({
                    Timestamp: normalizedTimestamp,
                    DateText: formatDate(new Date(normalizedTimestamp)),
                });
            });
            // Sort the selectedDates
            selectedDates.sort((a, b) => a.Timestamp - b.Timestamp);
            console.log("Selected dates changed:", selectedDates); // Debugging statement
            // Update ListBox dataSource
            listBox.dataSource = selectedDates;
            listBox.dataBind();
            // Update the Badge
            updateBadge();
        },
    });

    calendar.appendTo("#calDatasSelecionadas");

    // Function to remove a date
    window.removeDate = function (timestamp) {
        selectedDates = selectedDates.filter((d) => d.Timestamp !== timestamp);
        console.log("Removing date:", selectedDates); // Debugging statement
        listBox.dataSource = selectedDates;
        listBox.dataBind();
        updateBadge();

        // Update Calendar selection
        const calendarObj = document.getElementById("calDatasSelecionadas").ej2_instances[0];
        const dateToRemove = new Date(timestamp);

        // Get currently selected dates from calendar
        let currentSelectedDates = calendarObj.values;

        // Remove the date from calendar if it exists
        currentSelectedDates = currentSelectedDates.filter(date => {
            const normalizedDate = new Date(date).setHours(0, 0, 0, 0);
            return normalizedDate !== timestamp;
        });
        calendarObj.values = currentSelectedDates; // Set the updated list of selected dates
    };
});

function toggleControls() {
    // Get the calendar and listbox containers
    var calendarContainer = document.getElementById("calendarContainer");
    var listboxContainer = document.getElementById("listboxContainer");
    var toggleButton = document.getElementById("toggleButton");

    // Toggle the visibility of the controls
    if (calendarContainer.style.display === "none") {
        calendarContainer.style.display = "block";
        listboxContainer.style.display = "block";
        toggleButton.textContent = "Hide Controls";
    } else {
        calendarContainer.style.display = "none";
        listboxContainer.style.display = "none";
        toggleButton.textContent = "Show Controls";
    }
}

// Create the data source
var dataRecorrente = [
    { text: 'Sim', value: 'S' },
    { text: 'Não', value: 'N' }
];

// Initialize the DropDownList component
var dropDownListRecorrente = new ej.dropdowns.DropDownList({
    // Set the data source
    dataSource: dataRecorrente,
    // Map fields
    fields: { text: 'text', value: 'value' },
    // Set the default value to "Não"
    value: 'N',
    // Optional: Add placeholder text
    placeholder: 'Selecione uma opção',
    // Add the change event handler
    change: function (e) {
        // Access the selected value and text
        var selectedValue = e.value;
        var selectedText = e.itemData.text;

        // Perform your logic here
        console.log('Selected Value:', selectedValue);
        console.log('Selected Text:', selectedText);

        if (selectedValue === 'S') {
            document.getElementById("divPeriodo").style.display = "block";
            document.getElementById("divDias").style.display = "none";
            document.getElementById("divFinalRecorrencia").style.display = "none";

            var calendarContainer = document.getElementById("calendarContainer");
            calendarContainer.style.display = "none";

            var listboxContainer = document.getElementById("listboxContainer");
            listboxContainer.style.display = "none";
        }
        else {
            document.getElementById("divPeriodo").style.display = "none";
            document.getElementById("divDias").style.display = "none";
            document.getElementById("divFinalRecorrencia").style.display = "none";

            var calendarContainer = document.getElementById("calendarContainer");
            calendarContainer.style.display = "none";

            var listboxContainer = document.getElementById("listboxContainer");
            listboxContainer.style.display = "none";
        }

    }

});

// Render the DropDownList
dropDownListRecorrente.appendTo('#lstRecorrente');


// Create the data source
var data = [
    { text: 'Diário', value: 'D' },
    { text: 'Semanal', value: 'S' },
    { text: 'Quinzenal', value: 'Q' },
    { text: 'Mensal', value: 'M' },
    { text: 'Dias Variados', value: 'V' }
];

// Initialize the DropDownList component
var dropDownListObject = new ej.dropdowns.DropDownList({
    // Set the data source
    dataSource: data,
    // Map fields
    fields: { text: 'text', value: 'value' },
    // Set the default value to null (no selection)
    value: null,
    // Add placeholder text
    placeholder: 'Selecione um período',
    // Add the change event handler
    change: function (e) {
        var selectedValue = e.value || ''; // Handle null or undefined values

        if (selectedValue === '') {

            document.getElementById("divDias").style.display = "none";
            document.getElementById("divFinalRecorrencia").style.display = "none";

            var calendarContainer = document.getElementById("calendarContainer");
            calendarContainer.style.display = "none";

            var listboxContainer = document.getElementById("listboxContainer");
            listboxContainer.style.display = "none";
        }
        else if (selectedValue === 'V') {

            var calendarContainer = document.getElementById("calendarContainer");
            calendarContainer.style.display = "block";

            var listboxContainer = document.getElementById("listboxContainer");
            listboxContainer.style.display = "block";

            document.getElementById("divDias").style.display = "none";
            document.getElementById("divFinalRecorrencia").style.display = "none";
        }
        else if (selectedValue === 'D') {
            document.getElementById("divDias").style.display = "none";
            document.getElementById("divFinalRecorrencia").style.display = "block";
            var calendarContainer = document.getElementById("calendarContainer");
            calendarContainer.style.display = "none";

            var listboxContainer = document.getElementById("listboxContainer");
            listboxContainer.style.display = "none";
        }
        else {
            document.getElementById("divDias").style.display = "block";
            document.getElementById("divFinalRecorrencia").style.display = "block";

            var calendarContainer = document.getElementById("calendarContainer");
            calendarContainer.style.display = "none";

            var listboxContainer = document.getElementById("listboxContainer");
            listboxContainer.style.display = "none";
        }
    }
});

// Render the DropDownList
dropDownListObject.appendTo('#lstPeriodos');


document.addEventListener("DOMContentLoaded", function () {
    // Initialize the MultiSelect component after the DOM is ready
    var multiSelect = new ej.dropdowns.MultiSelect({
        placeholder: 'Selecione os dias...',
        dataSource: [
            { id: "Monday", name: "Segunda" },
            { id: "Tuesday", name: "Terça" },
            { id: "Wednesday", name: "Quarta" },
            { id: "Thursday", name: "Quinta" },
            { id: "Friday", name: "Sexta" },
            { id: "Saturday", name: "Sábado" },
            { id: "Sunday", name: "Domingo" }
        ],
        fields: { text: 'name', value: 'id' },
        maximumSelectionLength: 7,
        change: function (args) {
            let itemValue = args.item ? args.item.value : null;
            if (itemValue && multiSelect.value.includes(itemValue)) {
                multiSelect.value = multiSelect.value.filter(value => value !== itemValue);
                multiSelect.dataBind(); // Apply the changes
            }
        }
    });

    // Append the MultiSelect component to the div with id lstDias
    multiSelect.appendTo('#lstDias');

});

document.addEventListener("DOMContentLoaded", function () {

    // Obtendo a data atual
    const hoje = new Date();

    // Diminuindo um dia
    //hoje.setDate(hoje.getDate() - 1);

    // Inicializando o DatePicker da Syncfusion
    new ej.calendars.DatePicker({
        min: hoje, // Definindo a data mínima como a data atual
        format: 'dd/MM/yyyy'
    }, '#txtFinalRecorrencia');

    // Inicializando o DatePicker da Syncfusion
    new ej.calendars.DatePicker({
        min: hoje, // Definindo a data mínima como a data atual
        format: 'dd/MM/yyyy',
        enableStrictMode: false,
        focus: function (event) {
            console.log("DatePicker focused!");
            // You can access the event object here
            console.log(event);
        },
    }, '#txtDataInicial');

    // Inicializando o DatePicker da Syncfusion
    new ej.calendars.DatePicker({
        min: hoje, // Definindo a data mínima como a data atual
        format: 'dd/MM/yyyy',
    }, '#txtDataFinal');

});
