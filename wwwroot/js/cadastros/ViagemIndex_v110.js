//Para controlar a exibição de ToolTips
var CarregandoViagemBloqueada = false;

// Tooltip (garanta que está criado antes dos eventos)
const tooltipDuracao = new ej.popups.Tooltip({
    content: "Se a <strong>Duração da Viagem</strong> estiver muito longa, verifique se ela está <strong>Correta</strong>.",
    opensOn: "Hover",
    cssClass: "tooltip-laranja",
    position: "TopCenter",
    beforeOpen: (args) =>
    {
        if (CarregandoViagemBloqueada)
        {
            args.cancel = true;
        }
    }
}, "#txtDuracao");

const tooltipKm = new ej.popups.Tooltip({
    content: "Se a <strong>Quilometragem Percorrida</strong> estiver muito grande, verifique se ela está <strong>Correta</strong>.",
    opensOn: "Hover",
    cssClass: "tooltip-laranja",
    position: "TopCenter",
    beforeOpen: (args) =>
    {
        if (CarregandoViagemBloqueada)
        {
            args.cancel = true;
        }
    }
}, "#txtKmPercorrido");


//// Tooltip (garanta que está criado antes dos eventos)
//const tooltipDuracao = new ej.popups.Tooltip({
//    content: "Se a <strong>Duração da Viagem</strong> estiver muito longa, verifique se ela está <strong>Correta</strong>.",
//    opensOn: "Hover",
//    cssClass: "tooltip-laranja",
//    position: "TopCenter",
//    appendTo: document.body,              // garante que fique acima do modal
//    beforeOpen: (args) =>
//    {
//        if (CarregandoViagemBloqueada)
//        {
//            args.cancel = true;
//        }
//    },
//    afterOpen: args =>
//    {
//        args.element.style.zIndex = "2000";
//        args.element.style.position = "fixed";
//    }
//}, "#txtDuracao");

//const tooltipKm = new ej.popups.Tooltip({
//    content: "Se a <strong>Quilometragem Percorrida</strong> estiver muito grande, verifique se ela está <strong>Correta</strong>.",
//    opensOn: "Hover",
//    cssClass: "tooltip-laranja",
//    position: "TopCenter",
//    appendTo: document.body,              // garante que fique acima do modal
//    beforeOpen: (args) =>
//    {
//        if (CarregandoViagemBloqueada)
//        {
//            args.cancel = true;
//        }
//    },
//    afterOpen: args =>
//    {
//        args.element.style.zIndex = "2000";
//        args.element.style.position = "fixed";
//    }
//}, "#txtKmPercorrido");

$(document).ready(function () {
    try {
        document.getElementById('ddtCombustivelInicial').ej2_instances[0].showPopup();
        document.getElementById('ddtCombustivelInicial').ej2_instances[0].hidePopup();
        console.log("Mostrei/Escondi Popup");

        ListaTodasViagens();
    } catch (error) {
        // Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: AppInit | Método: document.ready | Erro: " + error.message);
        TratamentoErroComLinha("AppInit", "document.ready", error);
    }
});

$(document).on('click', '.btn-cancelar', async function ()
{
    try
    {
        const id = $(this).data('id');

        // Aguarda o usuário interagir com o alerta
        const confirmacao = await window.SweetAlertInterop
            .ShowConfirm(
                "Cancelar Viagem",
                "Você tem certeza que deseja cancelar esta viagem? Não será possível desfazer a operação!",
                "Cancelar a Viagem",
                "Desistir"
            );

        // confirmacao agora é true ou false
        if (confirmacao)
        {
            // … seu AJAX de cancelamento …
            const dataToPost = JSON.stringify({ ViagemId: id });
            $.ajax({
                url: '/api/Viagem/Cancelar',
                type: 'POST',
                data: dataToPost,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            })
                .done(function (data)
                {
                    if (data.success)
                    {
                        toastr.success(data.message);
                        $('#tblViagem').DataTable().ajax.reload();
                    } else
                    {
                        toastr.error(data.message);
                    }
                })
                .fail(function (err)
                {
                    TratamentoErroComLinha("CancelarViagem", "ajax.error", err);
                });
        }
    } catch (error)
    {
        TratamentoErroComLinha("CancelarViagem", "click.btn-cancelar", error);
    }
});

$('#modalFinalizaViagem').on('shown.bs.modal', function (event) {
    try {

        // Instancia os tooltips apenas uma vez
        //if (!tooltipDuracao) {
        //    tooltipDuracao = new ej.popups.Tooltip({
        //        content: "Se a <strong>Duração</strong> estiver muito longa, verifique se está <strong>correta</strong>.",
        //        opensOn: "Hover",
        //        cssClass: "tooltip-laranja",
        //        position: "TopCenter",
        //        appendTo: document.body,
        //        beforeOpen: (args) =>
        //        {
        //            if (CarregandoViagemBloqueada)
        //            {
        //                args.cancel = true;
        //            }
        //        },
        //        afterOpen: function (args) {
        //            if (args.element) {
        //                args.element.style.zIndex = "2000";
        //                args.element.style.position = "fixed";
        //            }
        //        }
        //    }, "#txtDuracao");

        //    // Mostra também ao sair do campo
        //    document.getElementById("txtDuracao").addEventListener("focusout", function () {
        //        tooltipDuracao.open(this);
        //        setTimeout(() => tooltipDuracao.close(), 3000);
        //    });
        //}

        //if (!tooltipKm) {
        //    tooltipKm = new ej.popups.Tooltip({
        //        content: "Se a <strong>Quilometragem</strong> estiver muito alta, verifique se está <strong>correta</strong>.",
        //        opensOn: "Hover",
        //        cssClass: "tooltip-laranja",
        //        position: "TopCenter",
        //        appendTo: document.body,
        //        beforeOpen: (args) =>
        //        {
        //            if (CarregandoViagemBloqueada)
        //            {
        //                args.cancel = true;
        //            }
        //        },
        //        afterOpen: function (args) {
        //            if (args.element) {
        //                args.element.style.zIndex = "2000";
        //                args.element.style.position = "fixed";
        //            }
        //        }
        //    }, "#txtKmPercorrido");

        //    // Mostra também ao sair do campo
        //    document.getElementById("txtKmPercorrido").addEventListener("focusout", function () {
        //        tooltipKm.open(this);
        //        setTimeout(() => tooltipDuracao.close(), 3000);
        //    });


        //}

        const button = $(event.relatedTarget);
        const viagemId = button.data("id");
        $('#txtId').val(viagemId);

        const rowIndex = $(event.relatedTarget).closest("tr").find("td:eq(9)").text() - 1;
        const data = $('#tblViagem').DataTable().row(rowIndex).data();

        $('#txtDataInicial').val(data.dataInicial).prop('disabled', true);
        $('#txtHoraInicial').val(data.horaInicio).prop('disabled', true);
        $('#txtKmInicial').val(data.kmInicial).prop('disabled', true);

        const combInicial = document.getElementById('ddtCombustivelInicial');
        if (combInicial && combInicial.ej2_instances && combInicial.ej2_instances.length > 0) {
            combInicial.ej2_instances[0].value = [data.combustivelInicial];
            combInicial.ej2_instances[0].enabled = false;
        }

        const combFinal = document.getElementById('ddtCombustivelFinal');
        const rteDescricao = document.getElementById('rteDescricao');   
        const rteOcorrencias = document.getElementById('rteOcorrencias');

        $("#h3Titulo").html("Finalizar a Viagem - Ficha nº " + data.noFichaVistoria + " de " + data.nomeMotorista);

        if (data.dataFinal != null)
        {
            //Define se as Tooltips aparecerão ou não
            CarregandoViagemBloqueada = true;

            $('#txtDataFinal').removeAttr("type").val(data.dataFinal).attr('readonly', true);
            $('#txtHoraFinal').val(data.horaFim).attr('readonly', true);
            $('#txtKmFinal').val(data.kmFinal).attr('readonly', true);
            //document.getElementById('txtKmFinal').value = data.kmFinal;

            if (combFinal && combFinal.ej2_instances && combFinal.ej2_instances.length > 0) {
                combFinal.ej2_instances[0].value = [data.combustivelFinal];
                combFinal.ej2_instances[0].enabled = false;
            }

            if (rteDescricao && rteDescricao.ej2_instances && rteDescricao.ej2_instances.length > 0) {
                rteDescricao.ej2_instances[0].value = data.descricao;
                rteDescricao.ej2_instances[0].readonly = true;
            }

            if (rteOcorrencias && rteOcorrencias.ej2_instances && rteOcorrencias.ej2_instances.length > 0) {
                rteOcorrencias.ej2_instances[0].value = data.descricaoOcorrencia;
                rteOcorrencias.ej2_instances[0].readonly = true;
            }

            $('#txtResumo').val(data.resumoOcorrencia).attr('readonly', true);

            $('#chkStatusDocumento')
                .prop("checked", data.statusDocumento)
                .prop("disabled", true);

            $('#chkStatusCartaoAbastecimento')
                .prop("checked", data.statusCartaoAbastecimento)
                .prop("disabled", true);

            calcularKmPercorrido();
            calcularDuracaoViagem();

            $('#btnFinalizarViagem').hide();
        } else {
            const agora = new Date();
            const dataAtual = agora.toISOString().split('T')[0];
            const horaAtual = agora.toTimeString().split(':').slice(0, 2).join(':');

            $('#txtDataFinal').removeAttr("type").attr('type', 'date').val(dataAtual);
            $('#txtHoraFinal').val(horaAtual);
            $('#txtKmFinal').val('');

            calcularDuracaoViagem();

            if (combFinal && combFinal.ej2_instances && combFinal.ej2_instances.length > 0) {
                combFinal.ej2_instances[0].value = '';
                combFinal.ej2_instances[0].enabled = true;
            }

            if (rteDescricao && rteDescricao.ej2_instances && rteDescricao.ej2_instances.length > 0) {
                rteDescricao.ej2_instances[0].value = data.descricao || '';
                rteDescricao.ej2_instances[0].readonly = false;
            }

            if (rteOcorrencias && rteOcorrencias.ej2_instances && rteOcorrencias.ej2_instances.length > 0) {
                rteOcorrencias.ej2_instances[0].value = '';
                rteOcorrencias.ej2_instances[0].readonly = false;
            }

            $('#txtResumo').val('');
            $('#chkStatusDocumento').prop("checked", true).attr('readonly', false);
            $('#chkStatusCartaoAbastecimento').prop("checked", true).attr('readonly', false);

            $('#btnFinalizarViagem').show();
        }
    } catch (error) {
        // Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: ModalFinalizaViagem | Método: shown.bs.modal | Erro: " + error.message);
        TratamentoErroComLinha("ModalFinalizaViagem", "shown.bs.modal", error);
    }
});

$('#modalFinalizaViagem').on("hide.bs.modal", function () {
    try {
        $('#txtId, #txtDataInicial, #txtHoraInicial, #txtKmInicial, #txtDataFinal, #txtHoraFinal, #txtKmFinal, #txtResumo').val('').removeAttr("readonly");
        $('#txtDataFinal').attr('type', 'date');

        const combInicial = document.getElementById('ddtCombustivelInicial');
        if (combInicial && combInicial.ej2_instances && combInicial.ej2_instances.length > 0) {
            combInicial.ej2_instances[0].value = '';
            combInicial.ej2_instances[0].enabled = true;
        }

        const combFinal = document.getElementById('ddtCombustivelFinal');
        if (combFinal && combFinal.ej2_instances && combFinal.ej2_instances.length > 0) {
            combFinal.ej2_instances[0].value = '';
            combFinal.ej2_instances[0].enabled = true;
        }

        const combKm = document.getElementById('txtKmPercorrido');
        if (combKm && combKm.ej2_instances && combKm.ej2_instances.length > 0) {
            combKm.ej2_instances[0].value = '';
            combKm.ej2_instances[0].enabled = true;
        }

        const rteDescricao = document.getElementById('rteDescricao');
        if (rteDescricao && rteDescricao.ej2_instances && rteDescricao.ej2_instances.length > 0) {
            rteDescricao.ej2_instances[0].value = '';
            rteDescricao.ej2_instances[0].readonly = false;
        }

        const rteOcorrencias = document.getElementById('rteOcorrencias');
        if (rteOcorrencias && rteOcorrencias.ej2_instances && rteOcorrencias.ej2_instances.length > 0) {
            rteOcorrencias.ej2_instances[0].value = '';
            rteOcorrencias.ej2_instances[0].readonly = false;
        }

        document.getElementById('txtKmPercorrido').value = "";
        document.getElementById('txtDuracao').value = "";

        $('#chkStatusDocumento, #chkStatusCartaoAbastecimento').prop("checked", false).attr('readonly', false);
        $('#btnFinalizarViagem').show();
    } catch (error) {
        // console.error("Erro ao limpar modal:", error);
        // Alerta.Erro("⚠️ Erro Sem Tratamento", "Erro ao limpar campos do modal FinalizaViagem: " + error.message);
        TratamentoErroComLinha("ModalFinalizaViagem", "hide.bs.modal", error);
    }
});

$("#txtDataFinal").focusout(function () {
    try {
        const rawDataInicial = document.getElementById("txtDataInicial")?.value;
        const horaInicial = document.getElementById("txtHoraInicial")?.value;
        const rawDataFinal = document.getElementById("txtDataFinal")?.value;
        const horaFinal = document.getElementById("txtHoraFinal")?.value;

        // 🛠️ Normaliza o formato de data para DD/MM/YYYY
        const dataInicial = rawDataInicial.replace(/-/g, "/");
        const dataFinal = rawDataFinal.replace(/-/g, "/");

        var inicio = moment(`${dataInicial}`, "DD/MM/YYYY HH:mm");
        var fim = moment(`${dataFinal}`, "DD/MM/YYYY HH:mm");

        // Sai se qualquer uma estiver inválida
        if (!inicio.isValid() || !fim.isValid()) return;


        if (dataFinal < dataInicial) {
            $("#txtDataFinal").val('');
            $('#txtDuracao').val('');
            Alerta.Erro("Erro na Data", "A data final deve ser maior que a inicial!");
            return;
        }

        // 🔍 Adiciona chamada à validação de datas
        validarDatasSimples(dataInicial, dataFinal);

        // Verifica horas apenas se datas forem iguais
        if (dataFinal === dataInicial) {
            const horaInicial = $("#txtHoraInicial").val();
            const horaFinal = $("#txtHoraFinal").val();

            if (!horaInicial || !horaFinal) return;


            //const inicio = moment(`${dataInicial} ${horaInicial}`, "DD/MM/YYYY HH:mm");
            //const fim = moment(`${dataFinal} ${horaFinal}`, "DD/MM/YYYY HH:mm");

            const [hI, mI] = horaInicial.split(":").map(Number);
            const [hF, mF] = horaFinal.split(":").map(Number);
            const minIni = hI * 60 + mI;
            const minFin = hF * 60 + mF;

            if (minFin <= minIni) {
                $("#txtHoraFinal").val('');
                $('#txtDuracao').val('');
                Alerta.Erro("Erro na Hora", "A hora final deve ser maior que a inicial quando as datas forem iguais!");
                return;
            }
        }

        calcularDuracaoViagem();
    } catch (error) {
        TratamentoErroComLinha("ValidadorData", "focusout.txtDataFinal", error);
    }
});

$("#txtHoraFinal").focusout(function () {
    try
    {

        if ($("#txtDataFinal").val() === "" && $("#txtHoraFinal").val() != "")
        {
            Alerta.Erro("Erro na Hora", "A hora final só pode ser preenchida depois de Data Final!");
            $("#txtHoraFinal").val('');
            $('#txtDuracao').val('');
        }

        const horaInicial = $("#txtHoraInicial").val();
        const horaFinal = $("#txtHoraFinal").val();

        const dataInicialParts = $("#txtDataInicial").val().split('/');
        const dataInicial = `${dataInicialParts[2]}-${dataInicialParts[1]}-${dataInicialParts[0]}`;
        const dataFinal = $("#txtDataFinal").val();

        if (!dataFinal) {
            $("#txtHoraFinal").val('');
            Alerta.Erro("Erro na Hora Final", "Preencha a Data Final para poder preencher a Hora Final!");
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
                Alerta.Erro("Erro na Hora", "A hora final deve ser maior que a inicial quando as datas forem iguais!");
            }
        }

        calcularDuracaoViagem();

    } catch (error) {
        // Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: ValidadorHora | Método: focusout.txtHoraFinal | Erro: " + error.message);
        TratamentoErroComLinha("ValidadorHora", "focusout.txtHoraFinal", error);
    }
});



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

        calcularDistanciaViagem();

    } catch (error) {
        // Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: Viagem_050 | Método: focusout.txtKmInicial | Erro: " + error.message);
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
            Alerta.Alerta("⚠️ Alerta na Quilometragem", "A quilometragem <strong>final</strong> excede em 100km a <strong>inicial</strong>!");
        }

        calcularDistanciaViagem();

    } catch (error) {
        // Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: ValidadorKM | Método: focusout.txtKmFinal | Erro: " + error.message);
        TratamentoErroComLinha("ValidadorKM", "focusout.txtKmFinal", error);
    }
});

function calcularDistanciaViagem() {
    try {
        const kmInicial = parseFloat($("#txtKmInicial").val().replace(',', '.'));
        const kmFinal = parseFloat($("#txtKmFinal").val().replace(',', '.'));

        if (isNaN(kmInicial) || isNaN(kmFinal)) return;

        const kmPercorrido = kmFinal - kmInicial;
        $('#txtKmPercorrido').val(kmPercorrido);

        // 🔥 Força o tooltip a abrir se estiver acima de 50
        if (kmPercorrido >= 50) {
            tooltipKm.open(document.getElementById("txtKmPercorrido"));
            setTimeout(() => tooltipKm.close(), 3000);
        }

    } catch (error) {
        TratamentoErroComLinha("Viagem", "calcularDistanciaViagem", error);
    }
}


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
        // Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: Util | Método: parseDate | Erro: " + error.message);
        TratamentoErroComLinha("Util", "parseDate", error);
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
                const mensagem = "A Data Final está 5 dias ou mais após a Data Inicial. Tem certeza?";
                const confirmado = await window.SweetAlertInterop.ShowPreventionAlert(mensagem);

                if (confirmado) {
                    showSyncfusionToast("Confirmação feita pelo usuário!", "success", "💪🏼");
                }
                else {
                    showSyncfusionToast("Ação cancelada pelo usuário", "danger", "😟");

                    const campo = document.getElementById("txtDataFinal");
                    if (campo) {
                        campo.value = "";
                        campo.focus();
                        return false;
                    }
                }
            }
        }

        return true;
    } catch (error) {
        // Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: ValidadorData | Método: validarDatasSimples | Erro: " + error.message);
        TratamentoErroComLinha("ValidadorData", "validarDatasSimples", error);
        return false;
    }
}

async function validarKmAtualFinal() {
    try {
        const kmInicial = $('#txtKmInicial').val();
        const kmAtual = $('#txtKmAtual').val();

        if (!kmInicial || !kmAtual) return true;

        const ini = parseFloat(kmAtual.replace(",", "."));
        const fim = parseFloat(kmInicial.replace(",", "."));

        if (fim < ini) {
            Alerta.Erro("Erro", "A quilometragem <strong>inicial</strong> deve ser maior que a <strong>atual</strong>.");
            return false;
        }

        const diff = fim - ini;

        if (diff > 100)
        {
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
        else if (diff > 50) {
            // Exibe o tooltip por 2 segundos
            tooltipKm.open(document.getElementById("txtKmPercorrido"));
            setTimeout(() => tooltipKm.close(), 2000);        }

        return true;
    } catch (error) {
        // Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: ValidadorKM | Método: validarKmAtualInicial | Erro: " + error.message);
        TratamentoErroComLinha("ValidadorKM", "validarKmAtualFinal", error);
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
        } else if (diff > 50)
        {
            // Mostra também ao sair do campo
            document.getElementById("txtKmPercorrido").addEventListener("focusout", function () {
                tooltipKm.open(this);
                setTimeout(() => tooltipKm.close(), 3000);
            });

        }

        return true;
    } catch (error) {
        // Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: ValidadorKM | Método: validarKmInicialFinal | Erro: " + error.message);
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
        if (veiculosCombo && veiculosCombo.ej2_instances && veiculosCombo.ej2_instances.length > 0) {
            const combo = veiculosCombo.ej2_instances[0];
            if (combo.value != null && combo.value !== "") {
                veiculoId = combo.value;
            }
        }

        let motoristaId = "";
        const motoristasCombo = document.getElementById('lstMotorista');
        if (motoristasCombo && motoristasCombo.ej2_instances && motoristasCombo.ej2_instances.length > 0) {
            const combo = motoristasCombo.ej2_instances[0];
            if (combo.value != null && combo.value !== "") {
                motoristaId = combo.value;
            }
        }

        let eventoId = "";
        const eventosCombo = document.getElementById('lstEventos');
        if (eventosCombo && eventosCombo.ej2_instances && eventosCombo.ej2_instances.length > 0) {
            const combo = eventosCombo.ej2_instances[0];
            if (combo.value != null && combo.value !== "") {
                eventoId = combo.value;
            }
        }

        let statusId = "Aberta";
        const statusCombo = document.getElementById('lstStatus');
        if (statusCombo && statusCombo.ej2_instances && statusCombo.ej2_instances.length > 0) {
            const status = statusCombo.ej2_instances[0];
            if (status.value === "" || status.value === null) {
                if (motoristaId || veiculoId || eventoId || ($('#txtData').val() != null && $('#txtData').val() !== '')) {
                    statusId = "Todas";
                }
            } else {
                statusId = status.value;
            }
        }

        const dateVal = $('#txtData').val();
        const date = dateVal ? dateVal.split("-") : null;
        const dataViagem = (date && date.length === 3) ? `${date[2]}/${date[1]}/${date[0]}` : "";

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
        // Alerta.Erro("⚠️ Erro Sem Tratamento", "Classe: ListaViagens | Método: ListaTodasViagens | Erro: " + error.message);
        TratamentoErroComLinha("ListaViagens", "ListaTodasViagens", error);
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
        TratamentoErroComLinha("FinalizaViagem", "click.btnFinalizarViagem", error);
    }
});


//const tooltipKm = new ej.popups.Tooltip({
//    content: "Se a <strong>Quilometragem Percorrida</strong> estiver muito grande, verifique se ela está <strong>Correta</strong>.",
//    opensOn: "Hover",
//    cssClass: "tooltip-laranja",
//    position: "TopCenter",
//    beforeOpen: (args) =>
//    {
//        if (CarregandoViagemBloqueada)
//        {
//            args.cancel = true;
//        }
//    },
//}, "#txtKmPercorrido");

function calcularKmPercorrido() {
    const elKmInicial = document.getElementById("txtKmInicial");
    const elKmFinal = document.getElementById("txtKmFinal");
    const elKmPercorrido = document.getElementById("txtKmPercorrido");

    const kmInicial = parseFloat(elKmInicial?.value.replace(",", "."));
    const kmFinal = parseFloat(elKmFinal?.value.replace(",", "."));

    if (isNaN(kmInicial) || isNaN(kmFinal)) return;

    elKmPercorrido.value = kmFinal - kmInicial;

    if (elKmPercorrido.value > 100) {
        tooltipKm.open(elKmPercorrido);
        setTimeout(() => tooltipKm.close(), 3000);
        elKmPercorrido.style.fontWeight = "bold";
        elKmPercorrido.style.color = "red";
    }
    else
    {
        elKmPercorrido.style.fontWeight = "normal";
        elKmPercorrido.style.color = "";
    }
}

["input", "focusout", "change"].forEach(evt =>
    document.getElementById("txtKmFinal")?.addEventListener(evt, calcularKmPercorrido)
);


// Tooltip (garanta que está criado antes dos eventos)
//const tooltipDuracao = new ej.popups.Tooltip({
//    content: "Se a <strong>Duração da Viagem</strong> estiver muito longa, verifique se ela está <strong>Correta</strong>.",
//    opensOn: "Hover",
//    cssClass: "tooltip-laranja",
//    position: "TopCenter"
//}, "#txtDuracao");

function normalizarData(dataStr) {
    // Se contiver barra, assumimos "dd/mm/yyyy"
    if (dataStr.includes("/")) {
        const [dia, mes, ano] = dataStr.split('/');
        return `${ano}-${mes}-${dia}`; // retorna no padrão ISO (yyyy-mm-dd)
    }
    // Senão, assumimos que já está no formato ISO
    return dataStr;
}

function calcularDuracaoViagem() {
    const rawDataInicial = document.getElementById("txtDataInicial")?.value;
    const horaInicial = document.getElementById("txtHoraInicial")?.value;
    const rawDataFinal = document.getElementById("txtDataFinal")?.value;
    const horaFinal = document.getElementById("txtHoraFinal")?.value;
    const elDuracao = document.getElementById("txtDuracao");

    if (!rawDataInicial || !horaInicial || !rawDataFinal || !horaFinal) {
        elDuracao.value = "";
        return;
    }

    const dataInicial = normalizarData(rawDataInicial);
    const dataFinal = normalizarData(rawDataFinal);

    const inicio = moment(`${dataInicial}T${horaInicial}`, "YYYY-MM-DDTHH:mm");
    const fim = moment(`${dataFinal}T${horaFinal}`, "YYYY-MM-DDTHH:mm");

    if (!inicio.isValid() || !fim.isValid()) {
        elDuracao.value = "";
        return;
    }

    const duracaoMinutos = fim.diff(inicio, "minutes");
    const dias = Math.floor(duracaoMinutos / 1440);
    const horas = Math.floor((duracaoMinutos % 1440) / 60);

    const textoDuracao = `${dias} dia${dias !== 1 ? 's' : ''} e ${horas} hora${horas !== 1 ? 's' : ''}`;
    elDuracao.value = textoDuracao;

    if (duracaoMinutos >= 720) { // 12 horas = 720 minutos
        elDuracao.style.fontWeight = "bold";
        elDuracao.style.color = "red";

        tooltipDuracao.open(elDuracao);
        setTimeout(() => tooltipDuracao.close(), 3000);
    } else {
        // Reseta estilo caso não atenda à condição
        elDuracao.style.fontWeight = "normal";
        elDuracao.style.color = "";
    }
}

["input", "focusout", "change"].forEach(evt =>
    document.getElementById("txtHoraFinal")?.addEventListener(evt, calcularDuracaoViagem)
);

["input", "focusout", "change"].forEach(evt =>
    document.getElementById("txtKmPercorrido")?.addEventListener(evt, calcularKmPercorrido)
);

document.addEventListener("DOMContentLoaded", function ()
{

    if (window.ej && ej.popups && document.querySelector("#txtKmPercorrido"))
    {
        new ej.popups.Tooltip({
            content: "Se a <strong>Quilometragem Percorrida</strong> estiver muito grande, verifique primeiro se ela está <strong>Correta</strong> antes de confirmar.",
            opensOn: "Hover", // Pode ser "Click" ou "Focus" também
            cssClass: "custom-orange-tooltip",
            position: "TopCenter",
            beforeOpen: (args) =>
            {
                if (CarregandoViagemBloqueada)
                {
                    args.cancel = true;
                }
            }
        }, "#txtKmPercorrido");
    }

    if (window.ej && ej.popups && document.querySelector("#txtDuracao"))
    {
        new ej.popups.Tooltip({
            content: "Se a <strong>Duração da Viagem</strong> estiver muito longa, verifique primeiro se ela está <strong>Correta</strong> antes de confirmar.",
            opensOn: "Hover", // Pode ser "Click" ou "Focus" também
            cssClass: "custom-orange-tooltip",
            position: "TopCenter",
            beforeOpen: (args) =>
            {
                if (CarregandoViagemBloqueada)
                {
                    args.cancel = true;
                }
            }
        }, "#txtDuracao");
    }


});
