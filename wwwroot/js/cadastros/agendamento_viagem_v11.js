// Controla o Submit do Agendamento
$("#btnConfirma").click(function (event) {
    event.preventDefault();

    var lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
    var lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
    var rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];

    if (document.getElementById("lstEventos").ej2_instances[0].value != null) {
        EventoId = document.getElementById("lstEventos").ej2_instances[0].value[0];
    } else {
        EventoId = "";
    }

    RequisitanteId = document.getElementById("lstRequisitante").ej2_instances[0].value;
    SetorSolicitanteId = JSON.stringify(document.getElementById("ddtSetor").ej2_instances[0].value).substring(2, 38);
    viagemId = document.getElementById("txtViagemId").value;

    if (!ValidaCampos(viagemId)) {
        return; // Faltaram campos obrigatórios
    }

    // Função para criar agendamento
    function criarAgendamento(dataInicial, viagemIdRecorrente = null) {

        var recorrente = document.getElementById("lstRecorrente").value;
        var dataFinal = $('#txtDataFinal').val();
        var tipoRecorrencia = document.getElementById("lstPeriodos").value; // 'D', 'S', 'Q', 'M', 'P'

        return JSON.stringify({
            "DataInicial": dataInicial,
            "HoraInicio": $('#txtHoraInicial').val(),
            "Finalidade": document.getElementById("lstFinalidade").ej2_instances[0].value[0],
            "Origem": $('#txtOrigem').val(),
            "Destino": $('#txtDestino').val(),
            "MotoristaId": lstMotorista.value,
            "VeiculoId": lstVeiculo.value,
            "KmAtual": $('#txtKmAtual').val(),
            "RequisitanteId": RequisitanteId,
            "RamalRequisitante": $('#txtRamalRequisitante').val(),
            "SetorSolicitanteId": SetorSolicitanteId,
            "Descricao": rteDescricao.value,
            "StatusAgendamento": true,
            "Status": "Agendada",
            "EventoId": EventoId,
            "Recorrente": recorrente,
            "Intervalo": tipoRecorrencia,
            "DataFinalRecorrencia": dataFinal,
            "RecorrenciaViagemId": viagemIdRecorrente // Chave de referência para a recorrência
        });
    }

    // Se não houver ViagemId, é um novo agendamento
    if (viagemId === "") {
        var recorrente = document.getElementById("lstRecorrente").value;
        var dataInicial = $('#txtDataInicial').val();
        var dataFinal = $('#txtDataFinal').val();

        if (recorrente === "S") {
            var tipoRecorrencia = document.getElementById("lstPeriodos").value; // 'D', 'S', 'Q', 'M', 'V'
            var datasRecorrentes = [];
            var dataAtual = new Date(dataInicial);
            var dataFim = new Date(dataFinal);

            if (tipoRecorrencia === "D") {
                // Recorrência Diária
                while (dataAtual <= dataFim) {
                    datasRecorrentes.push(new Date(dataAtual).toISOString().split("T")[0]);
                    dataAtual.setDate(dataAtual.getDate() + 1); // Incrementa 1 dia
                }
            } else if (tipoRecorrencia === "S" || tipoRecorrencia === "Q" || tipoRecorrencia === "M") {
                // Recorrência Semanal, Quinzenal e Mensal (todos seguem lógica de verificação de dias da semana)
                var diasSelecionados = document.getElementById("lstDias").ej2_instances[0].value; // ["Monday", "Wednesday", ...]
                var incrementoDias = tipoRecorrencia === "Q" ? 14 : (tipoRecorrencia === "M" ? 30 : 7); // 30 dias para Mensal

                while (dataAtual <= dataFim) {
                    var diaSemanaAtual = dataAtual.toLocaleDateString('en-US', { weekday: 'long' });
                    // Verifica se o dia da semana atual está entre os dias selecionados
                    if (diasSelecionados.includes(diaSemanaAtual)) {
                        datasRecorrentes.push(new Date(dataAtual).toISOString().split("T")[0]);
                    }
                    dataAtual.setDate(dataAtual.getDate() + incrementoDias); // Incrementa com base no tipo de recorrência
                }
            } else if (tipoRecorrencia === "V") {
                // Períodos Diversos
                var selectedDates = sendDatesToServer(); // Pega as datas selecionadas aleatoriamente
                if (selectedDates && selectedDates.length > 0) {
                    selectedDates.forEach(function (date) {
                        datasRecorrentes.push(date); // Considera as datas retornadas pela função
                    });
                }
            }

            // Verifica se datasRecorrentes possui elementos antes de tentar percorrê-lo
            if (datasRecorrentes.length > 0) {
                // Primeiro, inserimos o agendamento inicial
                var agendamentoInicial = criarAgendamento(dataInicial);
                $.ajax({
                    type: "POST",
                    url: "/api/Agenda/Agendamento",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: agendamentoInicial,

                    success: function (data) {
                        toastr.success(data.message, null, {
                            "timeOut": "30000",
                            "extendedTimeOut": "3000"
                        });

                        var viagemIdRecorrente = data.viagemId; // Captura o ViagemId do agendamento inicial

                        // Agora, insere os agendamentos subsequentes recorrentes
                        datasRecorrentes.forEach(function (dataRecorrente) {
                            if (dataRecorrente !== dataInicial) { // Ignora a data inicial, pois já foi inserida
                                var agendamentoRecorrente = criarAgendamento(dataRecorrente, viagemIdRecorrente);
                                $.ajax({
                                    type: "POST",
                                    url: "/api/Agenda/Agendamento",
                                    contentType: "application/json; charset=utf-8",
                                    dataType: "json",
                                    data: agendamentoRecorrente,

                                    success: function (data) {
                                        console.log("Agendamento recorrente criado: " + dataRecorrente);
                                    },
                                    error: function (data) {
                                        console.log("Erro ao criar agendamento recorrente: " + dataRecorrente);
                                    }
                                });
                            }
                        });

                        $("#modalAgendamento").hide();
                        $('body').removeClass('modal-open');
                        $("body").css("overflow", "auto");
                        location.reload();
                    },
                    error: function (data) {
                        alert('Erro ao criar agendamento inicial');
                        console.log("Erro: " + data);
                    }
                });
            } else {
                console.log("Nenhuma data recorrente foi gerada.");
            }
        } else {
            // Agendamento único
            var agendamentoUnico = criarAgendamento(dataInicial);
            $.ajax({
                type: "POST",
                url: "/api/Agenda/Agendamento",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: agendamentoUnico,

                success: function (data) {
                    toastr.success(data.message, null, {
                        "timeOut": "3000",
                        "extendedTimeOut": "3000"
                    });

                    $("#modalAgendamento").hide();
                    $('body').removeClass('modal-open');
                    $("body").css("overflow", "auto");
                    location.reload();
                },
                error: function (data) {
                    alert('Erro ao criar agendamento único');
                    console.log("Erro: " + data);
                }
            });
        }
    } else {
        var recorrente = document.getElementById("lstRecorrente").value == "S";

        if (recorrente) {
            // Pergunta ao usuário se quer aplicar a edição para o atual ou para todos os subsequentes
            Swal.fire({
                title: 'Editar agendamento',
                text: "Deseja aplicar esta edição para este agendamento ou para todos os subsequentes?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Este e subsequentes',
                cancelButtonText: 'Somente este',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    // Se o usuário escolheu editar os subsequentes, busca os agendamentos subsequentes
                    $.ajax({
                        type: "GET",
                        url: `/api/Agenda/AgendamentosRecorrentes/${viagemId}`, // Busca todos os agendamentos com o mesmo RecorrenciaViagemId
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (agendamentosSubsequentes) {
                            // Itera pelos agendamentos subsequentes e aplica a edição
                            agendamentosSubsequentes.forEach(function (agendamento) {
                                var agendamentoEditado = criarAgendamento(agendamento.DataInicial, viagemId);
                                $.ajax({
                                    type: "PUT",
                                    url: `/api/Agenda/Agendamento/${agendamento.ViagemId}`,
                                    contentType: "application/json; charset=utf-8",
                                    dataType: "json",
                                    data: agendamentoEditado,
                                    success: function () {
                                        console.log(`Agendamento ${agendamento.ViagemId} editado com sucesso.`);
                                    },
                                    error: function () {
                                        console.log(`Erro ao editar agendamento ${agendamento.ViagemId}.`);
                                    }
                                });
                            });

                            Swal.fire('Editado!', 'Os agendamentos subsequentes foram editados.', 'success');
                            location.reload();
                        },
                        error: function () {
                            Swal.fire('Erro!', 'Ocorreu um erro ao recuperar os agendamentos subsequentes.', 'error');
                        }
                    });
                } else {
                    // Edita apenas o agendamento atual
                    var agendamentoEditado = criarAgendamento($('#txtDataInicial').val(), viagemId);
                    $.ajax({
                        type: "PUT",
                        url: `/api/Agenda/Agendamento/${viagemId}`,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: agendamentoEditado,
                        success: function (data) {
                            toastr.success(data.message, null, {
                                "timeOut": "3000",
                                "extendedTimeOut": "3000"
                            });

                            $("#modalAgendamento").hide();
                            $('body').removeClass('modal-open');
                            $("body").css("overflow", "auto");
                            location.reload();
                        },
                        error: function (data) {
                            alert('Erro ao editar agendamento');
                            console.log("Erro: " + data);
                        }
                    });
                }
            });
        } else {
            // Edição de um agendamento único
            var agendamentoEditado = criarAgendamento($('#txtDataInicial').val(), viagemId);
            $.ajax({
                type: "PUT",
                url: `/api/Agenda/Agendamento/${viagemId}`,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: agendamentoEditado,
                success: function (data) {
                    toastr.success(data.message, null, {
                        "timeOut": "30000",
                        "extendedTimeOut": "3000"
                    });

                    $("#modalAgendamento").hide();
                    $('body').removeClass('modal-open');
                    $("body").css("overflow", "auto");
                    location.reload();
                },
                error: function (data) {
                    alert('Erro ao editar agendamento');
                    console.log("Erro: " + data);
                }
            });
        }
    }

    $("#btnConfirma").prop("disabled", true);
});
