$(document).ready(function () {
    try {
        document.getElementById('ddtCombustivelInicial').ej2_instances[0].showPopup();
        document.getElementById('ddtCombustivelInicial').ej2_instances[0].hidePopup();
        console.log("Mostrei/Escondi Popup");

        ListaTodasViagens();
    } catch (error) {
        Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: AppInit | Método: document.ready | Erro: " + error.message);
    }
});

$(document).on('click', '.btn-cancelar', function () {
    try {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja cancelar esta viagem?",
            text: "Não será possível desfazer a operação!",
            icon: "warning",
            buttons: {
                cancel: "Desistir",
                confirm: "Cancelar a Viagem"
            },
            dangerMode: true
        }).then((willDelete) => {
            if (willDelete) {
                try {
                    var dataToPost = JSON.stringify({ 'ViagemId': id });
                    $.ajax({
                        url: '/api/Viagem/Cancelar',
                        type: "POST",
                        data: dataToPost,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            try {
                                if (data.success) {
                                    toastr.success(data.message);
                                    dataTable = $('#tblViagem').DataTable();
                                    dataTable.ajax.reload();
                                } else {
                                    toastr.error(data.message);
                                }
                            } catch (error) {
                                Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: CancelarViagem | Método: success | Erro: " + error.message);
                            }
                        },
                        error: function (err) {
                            Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: CancelarViagem | Método: error | Erro: " + err.message);
                        }
                    });
                } catch (error) {
                    Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: CancelarViagem | Método: then | Erro: " + error.message);
                }
            }
        });
    } catch (error) {
        Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: CancelarViagem | Método: click.btn-cancelar | Erro: " + error.message);
    }
});

$('#modalFinalizaViagem').on('shown.bs.modal', function (event) {
    try {
        const button = $(event.relatedTarget);
        const viagemId = button.data("id");
        $('#txtId').val(viagemId);

        const rowIndex = $(event.relatedTarget).closest("tr").find("td:eq(9)").text() - 1;
        const data = $('#tblViagem').DataTable().row(rowIndex).data();

        // Preencher dados e desabilitar campos
        $('#txtDataInicial').val(data.dataInicial).prop('disabled', true);
        $('#txtHoraInicial').val(data.horaInicio).prop('disabled', true);
        $('#txtKmInicial').val(data.kmInicial).prop('disabled', true);

        const combInicial = document.getElementById('ddtCombustivelInicial');
        if (combInicial && combInicial.ej2_instances?.length > 0) {
            combInicial.ej2_instances[0].value = [data.combustivelInicial];
            combInicial.ej2_instances[0].enabled = false;
        }

        const combFinal = document.getElementById('ddtCombustivelFinal');
        const rteDescricao = document.getElementById('rteDescricao');
        const rteOcorrencias = document.getElementById('rteOcorrencias');

        $("#h3Titulo").html("Finalizar a Viagem - Ficha nº " + data.noFichaVistoria + " de " + data.nomeMotorista);

        // Caso a viagem já tenha sido finalizada
        if (data.dataFinal != null) {
            $('#txtDataFinal').removeAttr("type").val(data.dataFinal).attr('readonly', true);
            $('#txtHoraFinal').val(data.horaFim).attr('readonly', true);
            document.getElementById('txtKmFinal').value = data.kmFinal;

            if (combFinal && combFinal.ej2_instances?.length > 0) {
                combFinal.ej2_instances[0].value = [data.combustivelFinal];
                combFinal.ej2_instances[0].enabled = false;
            }

            if (rteDescricao && rteDescricao.ej2_instances?.length > 0) {
                rteDescricao.ej2_instances[0].value = data.descricao;
                rteDescricao.ej2_instances[0].readonly = true;
            }

            if (rteOcorrencias && rteOcorrencias.ej2_instances?.length > 0) {
                rteOcorrencias.ej2_instances[0].value = data.descricaoOcorrencia;
                rteOcorrencias.ej2_instances[0].readonly = true;
            }

            $('#txtResumo').val(data.resumoOcorrencia).attr('readonly', true);
            $('#chkStatusDocumento').prop("checked", data.statusDocumento).attr('readonly', true);
            $('#chkStatusCartaoAbastecimento').prop("checked", data.statusCartaoAbastecimento).attr('readonly', true);

            $('#btnFinalizarViagem').hide();
        } else {
            // Viagem ainda não finalizada: preencher data/hora atuais
            const agora = new Date();
            const dataAtual = agora.toISOString().split('T')[0];
            const horaAtual = agora.toTimeString().split(':').slice(0, 2).join(':');

            $('#txtDataFinal').removeAttr("type").attr('type', 'date').val(dataAtual);
            $('#txtHoraFinal').val(horaAtual);
            $('#txtKmFinal').val('');

            // Atualiza a duração com base nas datas e horas
            calcularDuracaoViagem();

            if (combFinal && combFinal.ej2_instances?.length > 0) {
                combFinal.ej2_instances[0].value = '';
                combFinal.ej2_instances[0].enabled = true;
            }

            if (rteDescricao && rteDescricao.ej2_instances?.length > 0) {
                rteDescricao.ej2_instances[0].value = data.descricao || '';
                rteDescricao.ej2_instances[0].readonly = false;
            }

            if (rteOcorrencias && rteOcorrencias.ej2_instances?.length > 0) {
                rteOcorrencias.ej2_instances[0].value = '';
                rteOcorrencias.ej2_instances[0].readonly = false;
            }

            $('#txtResumo').val('');
            $('#chkStatusDocumento').prop("checked", true).attr('readonly', false);
            $('#chkStatusCartaoAbastecimento').prop("checked", true).attr('readonly', false);

            $('#btnFinalizarViagem').show();
        }
    } catch (error) {
        Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: ModalFinalizaViagem | Método: shown.bs.modal | Erro: " + error.message);
    }
});

$('#modalFinalizaViagem').on("hide.bs.modal", function () {
    try {
        // Campos simples
        $('#txtId, #txtDataInicial, #txtHoraInicial, #txtKmInicial, #txtDataFinal, #txtHoraFinal, #txtKmFinal, #txtResumo').val('').removeAttr("readonly");

        // Resetar tipo de input de data
        $('#txtDataFinal').attr('type', 'date');

        // Resetar Combustível
        const combInicial = document.getElementById('ddtCombustivelInicial');
        if (combInicial && combInicial.ej2_instances?.length > 0) {
            combInicial.ej2_instances[0].value = '';
            combInicial.ej2_instances[0].enabled = true;
        }

        const combFinal = document.getElementById('ddtCombustivelFinal');
        if (combFinal && combFinal.ej2_instances?.length > 0) {
            combFinal.ej2_instances[0].value = '';
            combFinal.ej2_instances[0].enabled = true;
        }

        // Limpar RTE
        const rteDescricao = document.getElementById('rteDescricao');
        if (rteDescricao && rteDescricao.ej2_instances?.length > 0) {
            rteDescricao.ej2_instances[0].value = '';
            rteDescricao.ej2_instances[0].readonly = false;
        }

        const rteOcorrencias = document.getElementById('rteOcorrencias');
        if (rteOcorrencias && rteOcorrencias.ej2_instances?.length > 0) {
            rteOcorrencias.ej2_instances[0].value = '';
            rteOcorrencias.ej2_instances[0].readonly = false;
        }

        // Checkboxes
        $('#chkStatusDocumento, #chkStatusCartaoAbastecimento').prop("checked", false).attr('readonly', false);

        // Mostrar botão novamente
        $('#btnFinalizarViagem').show();
    } catch (error) {
        console.error("Erro ao limpar modal:", error);
        Alerta.Erro("⚠️ Erro Sem Tratamento", "Erro ao limpar campos do modal FinalizaViagem: " + error.message);
    }
});

$("#txtDataFinal").focusout(function () {
    try {
        const dataInicialStr = $("#txtDataInicial").val();
        const dataFinalStr = $("#txtDataFinal").val();

        if (!dataInicialStr || !dataFinalStr) return;

        // Converter datas para formato yyyy-MM-dd
        const parts = dataInicialStr.split('/');
        const dataInicial = `${parts[2]}-${parts[1]}-${parts[0]}`;
        const dataFinal = dataFinalStr;

        // Validação de Data
        if (dataFinal < dataInicial) {
            $("#txtDataFinal").val('');
            Alerta.Erro("Erro na Data", "A data final deve ser maior que a inicial!");
            return;
        }

        // Se datas forem iguais, validar hora
        if (dataFinal === dataInicial) {
            const horaInicial = $("#txtHoraInicial").val();
            const horaFinal = $("#txtHoraFinal").val();

            if (!horaInicial || !horaFinal) return;

            const hI = horaInicial.split(":").map(Number);
            const hF = horaFinal.split(":").map(Number);

            const minutosInicial = hI[0] * 60 + hI[1];
            const minutosFinal = hF[0] * 60 + hF[1];

            if (minutosFinal <= minutosInicial) {
                $("#txtHoraFinal").val('');
                Alerta.Erro("Erro na Hora", "Classe: ValidadorHora | Método: focusout.txtHoraFinal | A hora final deve ser maior que a hora inicial quando as datas forem iguais!");
            }
        }

        calcularDuracaoViagem();

    } catch (error) {
        Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: ValidadorDataHora | Método: focusout.txtHoraFinal | Erro: " + error.message);
    }
});

$("#txtHoraFinal").focusout(function () {
    try {
        const horaInicial = $("#txtHoraInicial").val();
        const horaFinal = $("#txtHoraFinal").val();

        const dataInicialParts = $("#txtDataInicial").val().split('/');
        const dataInicial = `${dataInicialParts[2]}-${dataInicialParts[1]}-${dataInicialParts[0]}`;
        const dataFinal = $("#txtDataFinal").val();

        if (!dataFinal) {
            $("#txtHoraFinal").val('');
            Alerta.Erro("Erro na Hora Final", "Classe: ValidadorHora | Método: focusout.txtHoraFinal | Preencha a Data Final para poder preencher a Hora Final!");
            return;
        }

        if (dataInicial === dataFinal) {
            if (!horaInicial || !horaFinal) return;

            const [hIni, mIni] = horaInicial.split(":").map(Number);
            const [hFin, mFin] = horaFinal.split(":").map(Number);

            const minutosInicial = hIni * 60 + mIni;
            const minutosFinal = hFin * 60 + mFin;

            if (minutosFinal <= minutosInicial) {
                $("#txtHoraFinal").val('');
                Alerta.Erro("Erro na Hora", "Classe: ValidadorHora | Método: focusout.txtHoraFinal | A hora final deve ser maior que a inicial quando as datas forem iguais!");
            }
        }

        calcularDuracaoViagem();

    } catch (error) {
        Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: ValidadorHora | Método: focusout.txtHoraFinal | Erro: " + error.message);
    }
});

function calcularDuracaoViagem() {
    try {
        const dataInicialStr = $('#txtDataInicial').val();
        const horaInicialStr = $('#txtHoraInicial').val();
        const dataFinalStr = $('#txtDataFinal').val();
        const horaFinalStr = $('#txtHoraFinal').val();

        if (!dataInicialStr || !horaInicialStr || !dataFinalStr || !horaFinalStr) {
            $('#txtDuracao').val('');
            return;
        }

        const parseDataHora = (data, hora) => {
            if (data.includes('/')) {
                const [dia, mes, ano] = data.split('/');
                return new Date(`${ano}-${mes}-${dia}T${hora}`);
            } else if (data.includes('-')) {
                return new Date(`${data}T${hora}`);
            } else {
                return null;
            }
        };

        const dtInicial = parseDataHora(dataInicialStr, horaInicialStr);
        const dtFinal = parseDataHora(dataFinalStr, horaFinalStr);

        if (!dtInicial || !dtFinal || dtFinal <= dtInicial) {
            $('#txtDuracao').val('');
            return;
        }

        const diffMs = dtFinal - dtInicial;
        const diffHoras = (diffMs / (1000 * 60 * 60)).toFixed(2);
        $('#txtDuracao').val(diffHoras);

    } catch (error) {
        Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: CalculoDuracao | Método: calcularDuracaoViagem | Erro: " + error.message);
    }
}

$("#txtKmInicial").focusout(function () {
    try {
        const kmInicialStr = $("#txtKmInicial").val();
        const kmAtualStr = $("#txtKmAtual").val();

        if (!kmInicialStr || !kmAtualStr) {
            $('#txtKmPercorrido').val('');
            return;
        }

        const kmInicial = parseFloat(kmInicialStr.replace(',', '.'));
        const kmAtual = parseFloat(kmAtualStr.replace(',', '.'));

        if (isNaN(kmInicial) || isNaN(kmAtual)) {
            $('#txtKmPercorrido').val('');
            return;
        }

        if (kmInicial < 0) {
            $("#txtKmInicial").val('');
            $('#txtKmPercorrido').val('');
            Alerta.Erro("⚠️ Erro na Quilometragem", "A quilometragem <strong>inicial</strong> deve ser maior que <strong>zero</strong>!");
            return;
        }

        if (kmInicial < kmAtual) {
            $("#txtKmAtual").val('');
            $('#txtKmPercorrido').val('');
            Alerta.Erro("⚠️ Erro na Quilometragem", "A quilometragem <strong>inicial</strong> deve ser maior que a <strong>atual</strong>!");
            return;
        }

        // Chama a função modular
        calcularDistanciaViagem();

    } catch (error) {
        TratamentoErroComLinha("Viagem_050", "focusout.txtKmInicial", error);
    }
});

$("#txtKmFinal").focusout(function () {
    try {
        const kmInicialStr = $("#txtKmInicial").val();
        const kmFinalStr = $("#txtKmFinal").val();

        if (!kmInicialStr || !kmFinalStr) {
            $('#txtKmPercorrido').val('');
            return;
        }

        const kmInicial = parseFloat(kmInicialStr.replace(',', '.'));
        const kmFinal = parseFloat(kmFinalStr.replace(',', '.'));

        if (isNaN(kmInicial) || isNaN(kmFinal)) {
            $('#txtKmPercorrido').val('');
            return;
        }

        if (kmFinal < kmInicial) {
            $("#txtKmFinal").val('');
            $('#txtKmPercorrido').val('');
            Alerta.Erro("⚠️ Erro na Quilometragem", "A quilometragem <strong>final</strong> deve ser maior que a <strong>inicial</strong>!");
            return;
        }

        const kmPercorrido = (kmFinal - kmInicial).toFixed(2);
        $('#txtKmPercorrido').val(kmPercorrido);

        if (kmPercorrido > 100) {
            Alerta.Info("⚠️ Alerta na Quilometragem", "A quilometragem <strong>final</strong> excede em 100km a <strong>inicial</strong>!");
        }

        // Chama a função modular
        calcularDistanciaViagem();

    } catch (error) {
        Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: ValidadorKM | Método: focusout.txtKmFinal | Erro: " + error.message);
    }
});

function parseDate(d) {
    try {
        if (!d) return null;
        if (d.includes("/")) {
            const [dia, mes, ano] = d.split("/");
            return new Date(ano, mes - 1, dia);
        }
        if (d.includes("-")) {
            const [ano, mes, dia] = d.split("-");
            return new Date(ano, mes - 1, dia);
        }
        return null;
    } catch (error) {
        Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: Util | Método: parseDate | Erro: " + error.message);
        return null;
    }
}

async function validarDatasSimples() {
    try {
        const dataInicialStr = $("#txtDataInicial").val();
        const dataFinalInput = $("#txtDataFinal");
        const dataFinalStr = dataFinalInput.val();

        if (dataInicialStr === '') {
            Alerta.Erro("Erro na Data", "A data inicial é obrigatória!");
            return false;
        }

        if (dataInicialStr !== '' && dataFinalStr !== '') {
            const dtInicial = parseDate(dataInicialStr);
            const dtFinal = parseDate(dataFinalStr);

            if (!dtInicial || !dtFinal) {
                Alerta.Erro("Erro na Data", "Formato de data inválido!");
                return false;
            }

            dtInicial.setHours(0, 0, 0, 0);
            dtFinal.setHours(0, 0, 0, 0);

            const diferencaDias = (dtFinal - dtInicial) / (1000 * 60 * 60 * 24);

            if (diferencaDias >= 5) {
                const result = await Swal.fire({
                    title: 'Presta Atenção',
                    text: 'A Data Final está 5 dias ou mais após a Inicial. Tem certeza?',
                    icon: 'warning',
                    iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                    showCancelButton: true,
                    confirmButtonText: 'Tenho certeza! 💪🏼',
                    cancelButtonText: 'Me enganei! 😟',
                    customClass: { popup: 'custom-popup' },
                    heightAuto: false,
                    didOpen: () => {
                        $('.modal-backdrop').hide().css('z-index', '1040');
                        $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                        $('.swal2-backdrop-show').css('z-index', 9998);
                        Swal.getPopup().focus();
                    },
                });

                if (!result.isConfirmed) {
                    const txtDataFinalElement = document.getElementById("txtDataFinal");
                    txtDataFinalElement.value = null;
                    txtDataFinalElement.focus();
                    return false;
                }
            }

        }

        return true;
    } catch (error) {
        Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: ValidadorData | Método: validarDatasSimples | Erro: " + error.message);
        return false;
    }
}

async function validarKmAtualFinal() {
    try {
        const kmInicial = $('#txtKmInicial').val();
        const kmAtual = $('#txtKmAtual').val();

        if (!kmInicial || !kmAtual) return true;

        const ini = parseFloat(kmAtual.replace(",", "."));
        const fim = parseFloat(kmFinal.replace(",", "."));

        if (fim < ini) {
            Alerta.Erro("Erro", "A quilometragem <strong>inicial</strong> deve ser maior que a <strong>atual</strong>.");
            return false;
        }

        const diff = fim - ini;
        if (diff > 100) {

            const confirmado = await Swal.fire({
                title: "Quilometragem Alta",
                html: "A quilometragem <strong>inicial</strong> excede em 100km a <strong>atual</strong>. Tem certeza?",
                icon: 'warning',
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                showCancelButton: true,
                confirmButtonText: "Tenho certeza! 💪🏼",
                cancelButtonText: "Me enganei! 😟'",
                customClass: { popup: 'custom-popup' },
                heightAuto: false,
                didOpen: () => {
                    $('.modal-backdrop').hide().css('z-index', '1040');
                    $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                    $('.swal2-backdrop-show').css('z-index', 9998);
                    Swal.getPopup().focus();
                }
            });

            if (!confirmado.isConfirmed) {
                const txtKmInicialElement = document.getElementById("txtKmInicial");
                txtKmInicialElement.value = null;
                txtKmInicialElement.focus();
                return false;
            }
        }

        return true;
    } catch (error) {
        TratamentoErroComLinha("ValidadorKM", "validarKmAtualInicial", error);
        return false;
    }
}

async function validarKmInicialFinal() {
    try {
        const kmInicial = $('#txtKmInicial').val();
        const kmFinal = $('#txtKmFinal').val();

        if (!kmInicial || !kmFinal) return true;

        const ini = parseFloat(kmInicial.replace(",", "."));
        const fim = parseFloat(kmFinal.replace(",", "."));

        if (fim < ini) {
            Alerta.Erro("Erro", "A quilometragem final deve ser maior que a inicial.");
            return false;
        }

        const diff = fim - ini;
        if (diff > 100) {

            const confirmado = await Swal.fire({
                title: "Quilometragem Alta",
                html: "A quilometragem <strong>final</strong> excede em 100km a <strong>inicial</strong>. Tem certeza?",
                icon: 'warning',
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                showCancelButton: true,
                confirmButtonText: "Tenho certeza! 💪🏼",
                cancelButtonText: "Me enganei! 😟'",
                customClass: { popup: 'custom-popup' },
                heightAuto: false,
                didOpen: () => {
                    $('.modal-backdrop').hide().css('z-index', '1040');
                    $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                    $('.swal2-backdrop-show').css('z-index', 9998);
                    Swal.getPopup().focus();
                }
            });

            if (!confirmado.isConfirmed) {
                const txtKmFinalElement = document.getElementById("txtKmFinal");
                txtKmFinalElement.value = null;
                txtKmFinalElement.focus();
                return false;
            }
        }

        return true;
    } catch (error) {
        TratamentoErroComLinha("ValidadorKM", "validarKmInicialFinal", error);
        return false;
    }
}

function ListaTodasViagens() {
    try {
        $('#divViagens').LoadingScript('method_12', {
            'background_image': 'img/loading7.png',
            'main_width': 200,
            'animation_speed': 10,
            'additional_style': '',
            'after_element': false
        });

        let veiculoId = "";
        const veiculosCombo = document.getElementById('lstVeiculos');
        if (veiculosCombo && veiculosCombo.ej2_instances?.length > 0) {
            const combo = veiculosCombo.ej2_instances[0];
            if (combo.value != null && combo.value !== "") {
                veiculoId = combo.value;
            }
        }

        let motoristaId = "";
        const motoristasCombo = document.getElementById('lstMotorista');
        if (motoristasCombo && motoristasCombo.ej2_instances?.length > 0) {
            const combo = motoristasCombo.ej2_instances[0];
            if (combo.value != null && combo.value !== "") {
                motoristaId = combo.value;
            }
        }

        let eventoId = "";
        const eventosCombo = document.getElementById('lstEventos');
        if (eventosCombo && eventosCombo.ej2_instances?.length > 0) {
            const combo = eventosCombo.ej2_instances[0];
            if (combo.value != null && combo.value !== "") {
                eventoId = combo.value;
            }
        }

        let statusId = "Aberta";
        const statusCombo = document.getElementById('lstStatus');
        if (statusCombo && statusCombo.ej2_instances?.length > 0) {
            const status = statusCombo.ej2_instances[0];
            if (status.value === "" || status.value === null) {
                if (motoristaId || veiculoId || eventoId || ($('#txtData').val() != null && $('#txtData').val() !== '')) {
                    statusId = "Todas";
                }
            } else {
                statusId = status.value;
            }
        }

        const date = $('#txtData').val()?.split("-");
        const dataViagem = date?.length === 3 ? `${date[2]}/${date[1]}/${date[0]}` : "";

        const URLapi = "/api/viagem";

        let dataTableViagens = $('#tblViagem').DataTable();
        dataTableViagens.destroy();
        $('#tblViagem tbody').empty();

        DataTable.datetime('DD/MM/YYYY');

        dataTableViagens = $('#tblViagem').DataTable({
            autoWidth: false,
            dom: 'Bfrtip',
            lengthMenu: [
                [10, 25, 50, -1],
                ['10 linhas', '25 linhas', '50 linhas', 'Todas as Linhas']
            ],
            buttons: ['pageLength', 'excel', {
                extend: 'pdfHtml5',
                orientation: 'landscape',
                pageSize: 'LEGAL'
            }],
            "order": [[0, 'desc']],

            'columnDefs': [
                {
                    "targets": 0, //Vistoria
                    "className": "text-center",
                    "width": "3%",
                },
                {
                    "targets": 1, //Data
                    "className": "text-center",
                    "width": "3%",
                },
                {
                    "targets": 2, //Hora Inicio
                    "className": "text-center",
                    "width": "3%",
                },
                {
                    "targets": 3, //Requisitante
                    "className": "text-left",
                    "width": "10%",
                },
                {
                    "targets": 4, //Setor
                    "className": "text-left",
                    "width": "10%",
                },
                {
                    "targets": 5, //Motorista
                    "className": "text-left",
                    "width": "10%",
                },
                {
                    "targets": 6, //Veículo
                    "className": "text-left",
                    "width": "10%",
                },
                {
                    "targets": 7, //Status
                    "className": "text-center",
                    "width": "4%",
                },
                {
                    "targets": 8, //Ação
                    "className": "text-center",
                    "width": "6%",
                },
                {
                    "targets": 9, //Row Number
                    "className": "text-center",
                    "width": "1%",
                },
                {
                    "targets": 10, //Km Inicial
                    "className": "text-center",
                    "visible": false,
                },
                {
                    "targets": 11, //Combustivel Inicial
                    "className": "text-center",
                    "visible": false,
                },
                {
                    "targets": 12, //Data Final
                    "className": "text-center",
                    "visible": false,
                },
                {
                    "targets": 13, //Hora Final
                    "className": "text-center",
                    "visible": false,
                },
                {
                    "targets": 14, //Km Final
                    "className": "text-center",
                    "visible": false,
                },
                {
                    "targets": 15, //Combustivel Final
                    "className": "text-center",
                    "visible": false,
                },
                {
                    "targets": 16, //Resumo Ocorrência
                    "className": "text-center",
                    "visible": false,
                },
                {
                    "targets": 17, //Descrição Ocorrência
                    "className": "text-center",
                    "visible": false,
                },
                {
                    "targets": 18, //Status Documento
                    "className": "text-center",
                    "visible": false,
                },
                {
                    "targets": 19, //Status Cartão Abastecimento
                    "className": "text-center",
                    "visible": false,
                },
                {
                    "targets": 20, //Descrição
                    "className": "text-center",
                    "visible": false,
                },
            ],

            responsive: true,
            "ajax": {
                "url": URLapi,
                "type": "GET",
                "data": {
                    veiculoId: veiculoId,
                    motoristaId: motoristaId,
                    statusId: statusId,
                    dataviagem: dataViagem,
                    eventoId: eventoId
                },
                "datatype": "json"
            },
            "columns": [
                { "data": "noFichaVistoria" },
                { "data": "dataInicial" },
                { "data": "horaInicio" },
                { "data": "nomeRequisitante" },
                { "data": "nomeSetor" },
                { "data": "nomeMotorista" },
                { "data": "descricaoVeiculo" },
                {
                    "data": "status",
                    "render": function (data, type, row, meta) {
                        if (row.status === "Aberta")
                            return `<a href="javascript:void" class="updateStatusViagem btn btn-success btn-xs text-white" data-url="/api/Viagem/updateStatusViagem?Id=${row.viagemId}">Aberta</a>`;
                        if (row.status === "Realizada")
                            return `<a href="javascript:void" class="updateStatusViagem btn btn-xs fundo-cinza text-white text-bold" data-url="/api/Viagem/updateStatusViagem?Id=${row.viagemId}">Realizada</a>`;
                        return `<a href="javascript:void" class="updateStatusViagem btn btn-danger btn-xs text-white text-bold" data-url="/api/Viagem/updateStatusViagem?Id=${row.viagemId}">Cancelada</a>`;
                    }
                },
                {
                    "data": "viagemId",
                    "render": function (data, type, row, meta) {
                        const isAberta = row.status === "Aberta";
                        const disableClass = isAberta ? "" : "btn-disabled";
                        const disableTitle = isAberta ? "" : 'title="Ação não disponível"';

                        return `<div class="text-center">
                                <a href="/Viagens/Upsert?id=${data}" class="btn btn-primary btn-xs text-white" aria-label="Editar a Viagem!" data-microtip-position="top" role="tooltip" style="cursor:pointer;">
                                    <i class="far fa-edit"></i>
                                </a>
                                <a class="btn btn-xs text-white fundo-laranja ${disableClass}" ${disableTitle} data-toggle="modal" data-target="#modalFinalizaViagem" id="btnFinalizar" aria-label="Finaliza a Viagem!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
                                    <i class="fal fa-flag-checkered"></i>
                                </a>
                                <a class="btn btn-cancelar btn-danger btn-xs text-white ${disableClass}" ${disableTitle} aria-label="Cancelar a Viagem!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
                                    <i class="far fa-window-close"></i>
                                </a>
                                <a class="btn btn-foto btn-dark btn-xs text-white" data-toggle="modal" data-target="#modalFicha" id="rowdata" aria-label="Ficha de Vistoria!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px" data-id='${data}' data-backdrop="false">
                                    <i class="fab fa-wpforms"></i>
                                </a>
                                <a class="btn fundo-azul btn-xs text-white" data-toggle="modal" data-target="#modalPrint" id="rowdata" aria-label="Ficha da Viagem!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px" data-id='${data}' data-backdrop="false">
                                    <i class="fa-light fa-print"></i>
                                </a>
                            </div>`;
                    }
                },
                {
                    "data": "viagemId",
                    "render": function (data, type, row, meta) {
                        return meta.row + meta.settings._iDisplayStart + 1;
                    }
                },
                { "data": "kmInicial" },
                { "data": "combustivelInicial" },
                { "data": "dataFinal" },
                { "data": "horaFim" },
                { "data": "kmFinal" },
                { "data": "combustivelFinal" },
                { "data": "resumoOcorrencia" },
                { "data": "descricaoOcorrencia" },
                { "data": "statusDocumento" },
                { "data": "statusCartaoAbastecimento" },
                { "data": "descricao" },
            ],
            "language": {
                "emptyTable": "Nenhum registro encontrado",
                "info": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                "infoEmpty": "Mostrando 0 até 0 de 0 registros",
                "infoFiltered": "(Filtrados de _MAX_ registros)",
                "loadingRecords": "Carregando...",
                "processing": "Processando...",
                "zeroRecords": "Nenhum registro encontrado",
                "search": "Pesquisar",
                "paginate": {
                    "next": "Próximo",
                    "previous": "Anterior",
                    "first": "Primeiro",
                    "last": "Último"
                },
                "lengthMenu": "Exibir _MENU_ resultados por página"
            }
        });

        $('#divViagens').LoadingScript('destroy');

    } catch (error) {
        Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: ListaViagens | Método: ListaTodasViagens | Erro: " + error.message);
    }
}

$("#btnFinalizarViagem").click(async function (e) {
    try {
        e.preventDefault();

        const DataFinal = $("#txtDataFinal").val();
        if (DataFinal === '') {
            Alerta.Erro("Erro na Data", "A data final é obrigatória!");
            return;
        }

        const datasOk = await validarDatasSimples();
        if (!datasOk) return;

        const HoraFinal = $("#txtHoraFinal").val();
        if (HoraFinal === '') {
            Alerta.Erro("Erro na Hora", "A hora final é obrigatória!");
            return;
        }

        const KmFinal = $("#txtKmFinal").val();
        if (KmFinal === '') {
            Alerta.Erro("Erro na Quilometragem", "A quilometragem final é obrigatória!");
            return;
        }

        const kmOk = await validarKmInicialFinal();
        if (!kmOk) return;

        var niveis = document.getElementById('ddtCombustivelFinal').ej2_instances[0];
        if ((niveis.value === null)) {
            Alerta.Erro("Atenção", "O nível final de combustível é obrigatório!");
            return;
        }

        var nivelcombustivel = niveis.value.toString();
        var descricaoOcorrencia = document.getElementById('rteOcorrencias').ej2_instances[0];

        if ((descricaoOcorrencia.value) && !$('#txtResumo').val()) {
            Alerta.Erro("Atenção", "O Resumo da Ocorrência deve ser preenchido junto com a Descrição!");
            return;
        }

        const statusDocumento = $('#chkStatusDocumento').prop('checked') ? "Entregue" : "Ausente";
        const statusCartaoAbastecimento = $('#chkStatusCartaoAbastecimento').prop('checked') ? "Entregue" : "Ausente";
        const descricao = document.getElementById('rteDescricao').ej2_instances[0];

        const objViagem = JSON.stringify({
            ViagemId: $('#txtId').val(),
            DataFinal: $('#txtDataFinal').val(),
            HoraFim: $('#txtHoraFinal').val(),
            KmFinal: $('#txtKmFinal').val(),
            CombustivelFinal: nivelcombustivel,
            ResumoOcorrencia: $('#txtResumo').val(),
            DescricaoOcorrencia: descricaoOcorrencia.value,
            StatusDocumento: statusDocumento,
            StatusCartaoAbastecimento: statusCartaoAbastecimento,
            Descricao: descricao.value
        });

        $.ajax({
            type: "POST",
            url: "/api/Viagem/FinalizaViagem",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: objViagem,
            success: function (data) {
                try {
                    toastr.success(data.message);
                    $('#tblViagem').DataTable().ajax.reload(null, false);
                    $("#modalFinalizaViagem").hide();
                    $("div").removeClass("modal-backdrop");
                    $('body').removeClass('modal-open');
                } catch (error) {
                    Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: FinalizaViagem | Método: success | Erro: " + error.message);
                }
            },
            error: function (data) {
                Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: FinalizaViagem | Método: ajax.error | Erro: " + data.message);
            }
        });
    } catch (error) {
        Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: FinalizaViagem | Método: click.btnFinalizarViagem | Erro: " + error.message);
    }
});

function calcularDistanciaViagem() {
    try {
        const kmInicialStr = $("#txtKmInicial").val();
        const kmFinalStr = $("#txtKmFinal").val();

        if (!kmInicialStr || !kmFinalStr) {
            $('#txtKmPercorrido').val('');
            return;
        }

        const kmInicial = parseFloat(kmInicialStr.replace(',', '.'));
        const kmFinal = parseFloat(kmFinalStr.replace(',', '.'));

        if (isNaN(kmInicial) || isNaN(kmFinal)) {
            $('#txtKmPercorrido').val('');
            return;
        }

        const kmPercorrido = Math.round(kmFinal - kmInicial);
        $('#txtKmPercorrido').val(kmPercorrido);

        if (kmPercorrido > 100) {
            Alerta.Alerta("⚠️ Alerta na Quilometragem", "A quilometragem final excede em 100km a inicial!");
        }
    } catch (error) {
        TratamentoErroComLinha("Viagem_050", "calcularDistanciaViagem", error);
    }
}
