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

$("#txtKmInicial").focusout(function ()
{
    try
    {
        const kmInicialStr = $("#txtKmInicial").val();
        const kmAtualStr = $("#txtKmAtual").val();

        if (!kmInicialStr || !kmAtualStr)
        {
            $('#txtKmPercorrido').val('');
            return;
        }

        const kmInicial = parseFloat(kmInicialStr.replace(',', '.'));
        const kmAtual = parseFloat(kmAtualStr.replace(',', '.'));

        if (isNaN(kmInicial) || isNaN(kmAtual))
        {
            $('#txtKmPercorrido').val('');
            return;
        }

        if (kmInicial < 0)
        {
            $("#txtKmInicial").val('');
            $('#txtKmPercorrido').val('');
            Alerta.Erro("⚠️ Erro na Quilometragem", "A quilometragem <strong>inicial</strong> deve ser maior que <strong>zero</strong>!");
            return;
        }

        if (kmInicial < kmAtual)
        {
            $("#txtKmAtual").val('');
            $('#txtKmPercorrido').val('');
            Alerta.Erro("⚠️ Erro na Quilometragem", "A quilometragem <strong>inicial</strong> deve ser maior que a <strong>atual</strong>!");
            return;
        }

        validarKmAtualInicial();

        //calcularDistanciaViagem();

    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "focusout.txtKmInicial", error);
    }
});

$("#txtKmFinal").focusout(function ()
{
    try
    {
        const kmInicialStr = $("#txtKmInicial").val();
        const kmFinalStr = $("#txtKmFinal").val();

        if (!kmInicialStr || !kmFinalStr)
        {
            $('#txtKmPercorrido').val('');
            return;
        }

        const kmInicial = parseFloat(kmInicialStr.replace(',', '.'));
        const kmFinal = parseFloat(kmFinalStr.replace(',', '.'));

        if (isNaN(kmInicial) || isNaN(kmFinal))
        {
            $('#txtKmPercorrido').val('');
            return;
        }

        if (kmFinal < kmInicial)
        {
            $("#txtKmFinal").val('');
            $('#txtKmPercorrido').val('');
            Alerta.Erro("⚠️ Erro na Quilometragem", "A quilometragem final deve ser maior que a inicial!");
            return;
        }

        const kmPercorrido = Math.round(kmFinal - kmInicial);
        $('#txtKmPercorrido').val(kmPercorrido);

        //if (kmPercorrido > 100)
        //{
        //    Alerta.Alerta("⚠️ Alerta na Quilometragem", "A quilometragem final excede em 100km a inicial!");
        //}

        calcularDistanciaViagem();
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "focusout.txtKmFinal", error);
    }
});

$("#txtDataInicial").focusout(function ()
{
    try
    {
        const rawDataFinal = document.getElementById("txtDataFinal")?.value;
        const rawDataInicial = document.getElementById("txtDataInicial")?.value;
        const data = new Date(rawDataInicial);
        const anoAtual = new Date().getFullYear();
        const anoInformado = data.getFullYear();

        const ehValida = !isNaN(data.getTime()) &&
            rawDataInicial === data.toISOString().split('T')[0] &&
            (anoInformado >= anoAtual - 1 && anoInformado <= anoAtual + 1);

        if (!ehValida)
        {
            Alerta.Erro("Erro na Data", "A data deve ser válida e o ano deve estar entre o ano anterior e o próximo!");
            document.getElementById("txtDataFinal").value = "";
            document.getElementById("txtDataFinal").focus();
            return;
        }

        const dataInicial = rawDataInicial.replace(/-/g, "/");
        const dataFinal = rawDataFinal.replace(/-/g, "/");

        var inicio = moment(`${dataInicial}`, "DD/MM/YYYY HH:mm");
        var fim = moment(`${dataFinal}`, "DD/MM/YYYY HH:mm");

        if (!inicio.isValid() || !fim.isValid()) return;

        if (dataFinal < dataInicial)
        {
            $("#txtDataInicial").val('');
            $('#txtDuracao').val('');
            Alerta.Erro("Erro na Data", "A data inicial deve ser menor que a final!");
            return;
        }

        validarDatasInicialFinal(dataInicial, dataFinal);

        if (dataFinal === dataInicial)
        {
            const horaInicial = $("#txtHoraInicial").val();
            const horaFinal = $("#txtHoraFinal").val();

            if (!horaInicial || !horaFinal) return;

            const [hI, mI] = horaInicial.split(":").map(Number);
            const [hF, mF] = horaFinal.split(":").map(Number);
            const minIni = hI * 60 + mI;
            const minFin = hF * 60 + mF;

            if (minFin <= minIni)
            {
                $("#txtHoraFinal").val('');
                $('#txtDuracao').val('');
                Alerta.Erro("Erro na Hora", "A hora inicial deve ser menor que a final quando as datas forem iguais!");
                return;
            }
        }

        calcularDuracaoViagem();
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "focusout.txtDataFinal", error);
    }
});

let evitandoLoop = false;

$("#txtDataFinal").focusout(function ()
{
    if (evitandoLoop) return;

    if (evitandoLoop)
    {
        return;
        document.getElementById("txtDataFinal")?.value
    }

    try
    {
        const rawDataFinal = document.getElementById("txtDataFinal")?.value;
        const rawDataInicial = document.getElementById("txtDataInicial")?.value;
        const data = new Date(rawDataFinal);
        const anoAtual = new Date().getFullYear();
        const anoInformado = data.getFullYear();

        if (rawDataFinal === "" || rawDataFinal === null)
        {
            return;
        }

        const ehValida = !isNaN(data.getTime()) &&
            rawDataFinal === data.toISOString().split('T')[0] &&
            (anoInformado >= anoAtual - 1 && anoInformado <= anoAtual + 1);

        if (!ehValida)
        {
            evitandoLoop = true;

            Alerta.Erro("Erro na Data", "A data deve ser válida e o ano deve estar entre o ano anterior e o próximo!");

            setTimeout(() =>
            {
                document.getElementById("txtDataFinal").value = "";
                document.getElementById("txtDataFinal").focus();
                evitandoLoop = false;
            }, 1500); // tempo suficiente para o alerta fechar

            return;
        }

        const dataInicial = rawDataInicial.replace(/-/g, "/");
        const dataFinal = rawDataFinal.replace(/-/g, "/");

        var inicio = moment(`${dataInicial}`, "DD/MM/YYYY HH:mm");
        var fim = moment(`${dataFinal}`, "DD/MM/YYYY HH:mm");

        if (!inicio.isValid() || !fim.isValid()) return;

        if (dataFinal < dataInicial)
        {
            $("#txtDataInicial").val('');
            $('#txtDuracao').val('');
            Alerta.Erro("Erro na Data", "A data final deve ser maior ou igual que a inicial!");
            return;
        }

        validarDatasInicialFinal(dataInicial, dataFinal);

        if (dataFinal === dataInicial)
        {
            const horaInicial = $("#txtHoraInicial").val();
            const horaFinal = $("#txtHoraFinal").val();

            if (!horaInicial || !horaFinal) return;

            const [hI, mI] = horaInicial.split(":").map(Number);
            const [hF, mF] = horaFinal.split(":").map(Number);
            const minIni = hI * 60 + mI;
            const minFin = hF * 60 + mF;

            if (minFin <= minIni)
            {
                $("#txtHoraFinal").val('');
                $('#txtDuracao').val('');
                Alerta.Erro("Erro na Hora", "A hora final deve ser maior ou igual que a inicial quando as datas forem iguais!");
                return;
            }
        }

        calcularDuracaoViagem();
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "focusout.txtDataFinal", error);
    }
});

$("#txtHoraFinal").focusout(function ()
{
    try
    {
        if ($("#txtDataFinal").val() === "" && $("#txtHoraFinal").val() != "")
        {
            Alerta.Erro("Erro na Hora", "A hora final só pode ser preenchida depois de Data Final!");
            $("#txtHoraFinal").val('');
            $('#txtDuracao').val('');
        }

        const dataInicialStr = $("#txtDataInicial").val();
        const dataFinalStr = $("#txtDataFinal").val();
        const horaInicial = $("#txtHoraInicial").val();
        const horaFinal = $("#txtHoraFinal").val();

        if (!dataInicialStr || !dataFinalStr || !horaInicial || !horaFinal) return;

        const [dia, mes, ano] = dataInicialStr.split('/');
        const dataInicial = `${ano}-${mes}-${dia}`;

        if (dataInicial === dataFinalStr)
        {
            const [hI, mI] = horaInicial.split(":").map(Number);
            const [hF, mF] = horaFinal.split(":").map(Number);
            const minIni = hI * 60 + mI;
            const minFin = hF * 60 + mF;

            if (minFin <= minIni)
            {
                $("#txtHoraFinal").val('');
                $('#txtDuracao').val('');
                Alerta.Erro("Erro na Hora", "A hora final deve ser maior que a inicial quando as datas forem iguais!");
                return;
            }
        }

        calcularDuracaoViagem();
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "focusout.txtHoraFinal", error);
    }
});

function PreencheListaEventos()
{
    try
    {
        const eventos = document.getElementById('ddtEventos');
        if (eventos && eventos.ej2_instances && eventos.ej2_instances.length > 0)
        {
            eventos.ej2_instances[0].dataSource = [];
        }
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "PreencheListaEventos", error);
    }
}

function PreencheListaRequisitantes()
{
    try
    {
        const requisitantes = document.getElementById('cmbRequisitante');
        if (requisitantes && requisitantes.ej2_instances && requisitantes.ej2_instances.length > 0)
        {
            requisitantes.ej2_instances[0].dataSource = [];
        }
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "PreencheListaRequisitantes", error);
    }
}

function PreencheListaSetores(SetorSolicitanteId)
{
    try
    {
        const setor = document.getElementById('cmbSetor');
        if (setor && setor.ej2_instances && setor.ej2_instances.length > 0)
        {
            setor.ej2_instances[0].dataSource = [];
            setor.ej2_instances[0].enabled = true;
        }
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "PreencheListaSetores", error);
    }
}

function upload(args)
{
    try
    {
        console.log("Arquivo enviado:", args);
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "upload", error);
    }
}

function toolbarClick(e)
{
    try
    {
        console.log("Toolbar click:", e);
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "toolbarClick", error);
    }
}

async function validarKmAtualInicial()
{
    try
    {
        if (CarregandoViagemBloqueada)
        {
            return;
        }

        const kmInicial = $('#txtKmInicial').val();
        const kmAtual = $('#txtKmAtual').val();

        if (!kmInicial || !kmAtual) return true;

        const ini = parseFloat(kmAtual.replace(",", "."));
        const fim = parseFloat(kmInicial.replace(",", "."));

        if (fim < ini)
        {
            Alerta.Erro("Erro", "A quilometragem <strong>inicial</strong> deve ser maior que a <strong>atual</strong>.");
            return false;
        }

        const diff = fim - ini;
        if (diff > 100)
        {
            const confirmado = await Alerta.Confirmar("Quilometragem Alta", "A quilometragem <strong>inicial</strong> excede em 100km a <strong>atual</strong>. Tem certeza?", "Tenho certeza! 💪🏼", "Me enganei! 😟'");

            if (!confirmado)
            {
                const txtKmInicialElement = document.getElementById("txtKmInicial");
                txtKmInicialElement.value = null;
                txtKmInicialElement.focus();
                return false;
            }
        }

        return true;
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "validarKmAtualInicial", error);
        return false;
    }
}

async function validarKmInicialFinal()
{
    try
    {
        if ($("#btnSubmit").is(":hidden"))
        {
            return;
        }

        const kmInicial = $('#txtKmInicial').val();
        const kmFinal = $('#txtKmFinal').val();

        if (!kmInicial || !kmFinal) return true;

        const ini = parseFloat(kmInicial.replace(",", "."));
        const fim = parseFloat(kmFinal.replace(",", "."));

        if (fim < ini)
        {
            Alerta.Erro("Erro", "A quilometragem final deve ser maior que a inicial.");
            return false;
        }

        const diff = fim - ini;
        if (diff > 100)
        {

            const confirmado = await Alerta.Confirmar("Quilometragem Alta", "A quilometragem <strong>final</strong> excede em 100km a <strong>inicial</strong>. Tem certeza?", "Tenho certeza! 💪🏼", "Me enganei! 😟'");

            if (!confirmado)
            {
                const txtKmFinalElement = document.getElementById("txtKmFinal");
                txtKmFinalElement.value = null;
                txtKmFinalElement.focus();
                return false;
            }

        }

        return true;
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "validarKmInicialFinal", error);
        return false;
    }
}

async function validarDatasInicialFinal(DataInicial, DataFinal)
{
    try
    {
        if (CarregandoViagemBloqueada)
        {
            return;
        }

        function parseData(data)
        {
            if (!data) return null;
            if (data instanceof Date) return new Date(data.getTime());

            if (typeof data === 'string')
            {
                if (data.match(/^\d{4}\/\d{2}\/\d{2}$/))
                {
                    const [ano, mes, dia] = data.split('/');
                    return new Date(ano, mes - 1, dia);
                }
                if (data.match(/^\d{4}-\d{2}-\d{2}$/))
                {
                    const [ano, mes, dia] = data.split('-');
                    return new Date(ano, mes - 1, dia);
                }
                if (data.match(/^\d{2}\/\d{2}\/\d{4}$/))
                {
                    const [dia, mes, ano] = data.split('/');
                    return new Date(ano, mes - 1, dia);
                }
            }

            return null;
        }

        const dtIni = parseData(DataInicial);
        const dtFim = parseData(DataFinal);

        if (!dtIni || !dtFim || isNaN(dtIni) || isNaN(dtFim)) return true;

        const diff = (dtFim - dtIni) / (1000 * 60 * 60 * 24);

        if (diff >= 5)
        {
            const mensagem = "A Data Final está 5 dias ou mais após a Data Inicial. Tem certeza?";
            const confirmado = await window.SweetAlertInterop.ShowPreventionAlert(mensagem);

            if (confirmado)
            {
                showSyncfusionToast("Confirmação feita pelo usuário!", "success", "💪🏼");
            } else
            {
                showSyncfusionToast("Ação cancelada pelo usuário", "danger", "😟");

                const campo = document.getElementById("txtDataFinal");
                if (campo)
                {
                    campo.value = "";
                    campo.focus();
                    return false;
                }
            }
        }

        return true;
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "validarDatasInicialFinal", error);
        return false;
    }
}

async function calcularDistanciaViagem()
{
    try
    {
        const kmInicialStr = $("#txtKmInicial").val();
        const kmFinalStr = $("#txtKmFinal").val();

        if (!kmInicialStr || !kmFinalStr)
        {
            $('#txtKmPercorrido').val('');
            return;
        }

        const kmInicial = parseFloat(kmInicialStr.replace(',', '.'));
        const kmFinal = parseFloat(kmFinalStr.replace(',', '.'));

        if (isNaN(kmInicial) || isNaN(kmFinal))
        {
            $('#txtKmPercorrido').val('');
            return;
        }

        const kmPercorrido = Math.round(kmFinal - kmInicial);
        $('#txtKmPercorrido').val(kmPercorrido);

        if (kmPercorrido > 100)
        {
            elKmPercorrido.style.fontWeight = "bold";
            elKmPercorrido.style.color = "red";
        } else
        {
            elKmPercorrido.style.fontWeight = "normal";
            elKmPercorrido.style.color = "";
        }

        if (CarregandoViagemBloqueada)
        {
            return;
        }

        if (kmPercorrido > 100)
        {
            const confirmado = await Alerta.Confirmar("Quilometragem Alta", "A quilometragem <strong>Final</strong> excede em 100km a <strong>Inicial</strong>. Tem certeza?", "Tenho certeza! 💪🏼", "Me enganei! 😟'");


            if (!confirmado)
            {
                const txtKmFinalElement = document.getElementById("txtKmFinal");
                txtKmFinalElement.value = null;
                txtKmFinalElement.focus();
                return false;
            }
        }
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "calcularDistanciaViagem", error);
    }
}

function calcularDuracaoViagem()
{
    try
    {
        const rawDataInicial = document.getElementById("txtDataInicial")?.value;
        const horaInicial = document.getElementById("txtHoraInicial")?.value;
        const rawDataFinal = document.getElementById("txtDataFinal")?.value;
        const horaFinal = document.getElementById("txtHoraFinal")?.value;
        const elDuracao = document.getElementById("txtDuracao");

        if (!rawDataInicial || !horaInicial || !rawDataFinal || !horaFinal)
        {
            elDuracao.value = "";
            return;
        }

        const inicio = moment(`${rawDataInicial}T${horaInicial}`, "YYYY-MM-DDTHH:mm");
        const fim = moment(`${rawDataFinal}T${horaFinal}`, "YYYY-MM-DDTHH:mm");

        if (!inicio.isValid() || !fim.isValid())
        {
            elDuracao.value = "";
            return;
        }

        const duracaoMinutos = fim.diff(inicio, "minutes");
        const dias = Math.floor(duracaoMinutos / 1440);
        const horas = Math.floor((duracaoMinutos % 1440) / 60);

        const textoDuracao =
            `${dias} dia${dias !== 1 ? 's' : ''} e ${horas} hora${horas !== 1 ? 's' : ''}`;
        elDuracao.value = textoDuracao;

        //if (duracaoMinutos >= 720)
        //{
        //    elDuracao.style.fontWeight = "bold";
        //    elDuracao.style.color = "red";

        //    tooltipDuracao.open(elDuracao);
        //    setTimeout(() => tooltipDuracao.close(), 3000);
        //}
        //else
        //{
        //    // Reseta estilo caso não atenda à condição
        //    elDuracao.style.fontWeight = "normal";
        //    elDuracao.style.color = "";
        //}
    }
    catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "calcularDuracaoViagem", error);
    }
}

$(document).ready(function ()
{
    try
    {
        if ('@Model.ViagemObj.Viagem.ViagemId' !== '00000000-0000-0000-0000-000000000000')
        {
            $.ajax({
                type: "GET",
                url: "/api/Viagem/PegaFicha",
                success: function (data)
                {
                    if (data.fichaVistoria !== null && data.fichaVistoria !== undefined)
                    {
                        $('#imgViewer').attr('src', "data:image/jpg;base64," + data.fichaVistoria);
                    } else
                    {
                        $('#imgViewer').attr('src', "/Images/FichaAmarelaNova.jpg");
                    }
                },
                error: function (data)
                {
                    console.log('Error:', data);
                }
            });
        } else
        {
            const origin = window.location.origin;
            $('#imgViewer').attr('src', "/Images/FichaAmarelaNova.jpg");

            let list = new DataTransfer();
            let file = new File(["content"], origin + "/Images/FichaAmarelaNova.jpg");
            list.items.add(file);
        }

        const viagemId = document.getElementById("txtViagemId").value;
        if (viagemId && viagemId !== '00000000-0000-0000-0000-000000000000')
        {
            $.ajax({
                type: "GET",
                url: '/api/Agenda/RecuperaViagem',
                data: { id: viagemId },
                contentType: "application/json",
                dataType: "json",
                success: function (response)
                {
                    ExibeViagem(response.data);
                }
            });

        }
        else
        {
            const agora = new Date();
            const dataAtual = agora.toISOString().split('T')[0];
            const horaAtual = agora.toTimeString().split(':').slice(0, 2).join(':');

            $('#txtDataInicial').val(dataAtual);
            $('#txtHoraInicial').val(horaAtual);
        }
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "document.ready", error);
    }
});

function ExibeViagem(viagem)
{
    try
    {
        $("#btnSubmit").hide();

        document.getElementById("ddtFinalidade").ej2_instances[0].value = viagem.finalidade;
        document.getElementById("ddtFinalidade").ej2_instances[0].text = viagem.finalidade;

        if (viagem.eventoId != null)
        {
            const ddtEventos = document.getElementById("ddtEventos").ej2_instances[0];
            ddtEventos.enabled = true;
            ddtEventos.value = [viagem.eventoId];
            document.getElementById("btnEvento").style.display = "block";
            $(".esconde-diveventos").show();
        } else
        {
            const ddtEventos = document.getElementById("ddtEventos").ej2_instances[0];
            ddtEventos.enabled = false;
            document.getElementById("btnEvento").style.display = "none";
            $(".esconde-diveventos").hide();
        }

        if (viagem.setorSolicitanteId)
            document.getElementById("ddtSetor").ej2_instances[0].value = [viagem.setorSolicitanteId];

        if (viagem.combustivelInicial)
            document.getElementById("ddtCombustivelInicial").ej2_instances[0].value = [viagem.combustivelInicial];

        if (viagem.combustivelFinal)
            document.getElementById("ddtCombustivelFinal").ej2_instances[0].value = [viagem.combustivelFinal];

        $('#txtKmInicial').val(viagem.kmInicial);

        if (viagem.status === 'Realizada' || viagem.status === 'Cancelada')
        {
            CarregandoViagemBloqueada = true;

            $("#divPainel :input").each(function ()
            {
                $(this).prop("disabled", true);
            });

            const rte = document.getElementById("rte").ej2_instances[0];
            if (rte) rte.enabled = false;

            ["cmbMotorista", "cmbVeiculo", "cmbRequisitante", "cmbOrigem", "cmbDestino"].forEach(id =>
            {
                const control = document.getElementById(id).ej2_instances[0];
                if (control) control.enabled = false;
            });

            ["ddtSetor", "ddtCombustivelInicial", "ddtCombustivelFinal"].forEach(id =>
            {
                const control = document.getElementById(id).ej2_instances[0];
                if (control) control.enabled = false;
            });

            document.getElementById("ddtFinalidade").ej2_instances[0].enabled = false;
            document.getElementById("ddtEventos").ej2_instances[0].enabled = false;

            ["btnRequisitante", "btnSetor", "btnEvento"].forEach(id =>
            {
                const button = document.getElementById(id);
                if (button) button.disabled = true;
            });

            document.getElementById("divSubmit").style.display = 'none';

            calcularDuracaoViagem();
            calcularDistanciaViagem()

        }
        else
        {
            $("#btnSubmit").show();
        }
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "ExibeViagem", error);
    }
}

function BuscarSetoresPorMotorista(motoristaId)
{
    try
    {
        if (!motoristaId) return;

        $.ajax({
            url: '/Setores/BuscarSetoresPorMotorista',
            data: { motoristaId: motoristaId },
            success: function (data)
            {
                const ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
                ddtSetor.dataSource = data;
                ddtSetor.refresh();
            },
            error: function (xhr)
            {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "BuscarSetoresPorMotorista", error);
            }
        });
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "BuscarSetoresPorMotorista", error);
    }
}

function InserirNovoRequisitante()
{
    try
    {
        const nome = $("#txtNomeRequisitante").val();
        if (!nome)
        {
            Alerta.Info("Atenção", "Informe o nome do novo requisitante.");
            return;
        }

        $.ajax({
            url: "/Requisitantes/CriarNovoRequisitante",
            type: "POST",
            data: { nome: nome },
            success: function (requisitante)
            {
                const cmb = document.getElementById("cmbRequisitante").ej2_instances[0];
                cmb.dataSource.push(requisitante);
                cmb.value = requisitante.id;
                cmb.dataBind();
                $("#modalNovoRequisitante").modal('hide');
            },
            error: function (xhr)
            {
                Alerta.Erro("Erro", "Erro ao criar novo requisitante: " + xhr.statusText);
            }
        });
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "InserirNovoRequisitante", error);
    }
}

function VisualizaImagem(input)
{
    try
    {
        if (input.files && input.files[0])
        {
            const reader = new FileReader();
            reader.onload = function (e)
            {
                $('#imgViewerItem').attr('src', e.target.result);
            };
            reader.readAsDataURL(input.files[0]);
        }
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "VisualizaImagem", error);
    }
}

$(document).ready(function ()
{
    try
    {
        $("#modalEvento").modal({
            keyboard: true,
            backdrop: false,
            show: false,
        }).on("hide.bs.modal", function ()
        {
            try
            {
                let setores = document.getElementById('ddtSetorRequisitanteEvento').ej2_instances[0];
                setores.value = "";
                let requisitantes = document.getElementById('lstRequisitanteEvento').ej2_instances[0];
                requisitantes.value = "";
                $("#txtNome").val('');
                $("#txtDescricao").val('');
                $("#txtDataInicial").val('');
                $("#txtDataFinal").val('');
                $('.modal-backdrop').remove();
                $(document.body).removeClass("modal-open");
            } catch (error)
            {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "hide.modalEvento", error);
            }
        });

        $("#modalRequisitante").modal({
            keyboard: true,
            backdrop: "static",
            show: false,
        }).on("hide.bs.modal", function ()
        {
            try
            {
                let setores = document.getElementById('ddtSetorRequisitante').ej2_instances[0];
                setores.value = "";
                $("#txtPonto").val('');
                $("#txtNome").val('');
                $("#txtRamal").val('');
                $("#txtEmail").val('');
                $('.modal-backdrop').remove();
            } catch (error)
            {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "hide.modalRequisitante", error);
            }
        });

        $("#modalSetor").modal({
            keyboard: true,
            backdrop: "static",
            show: false,
        }).on("hide.bs.modal", function ()
        {
            try
            {
                let setores = document.getElementById('ddtSetorPai').ej2_instances[0];
                setores.value = "";
                $("#txtSigla").val('');
                $("#txtNomeSetor").val('');
                $("#txtRamalSetor").val('');
            } catch (error)
            {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "hide.modalSetor", error);
            }
        });

        $("#txtFile").change(function (event)
        {
            try
            {
                let files = event.target.files;
                if (files.length === 0) return;
                let file = files[0];
                if (!file.type.startsWith("image/"))
                {
                    Alerta.Erro("Arquivo inválido", "Por favor, selecione um arquivo de imagem válido." + xhr.statusText);
                    return;
                }
                $("#imgViewer").attr("src", window.URL.createObjectURL(file));
                $("#painelfundo").css({ "padding-bottom": "200px" });
            } catch (error)
            {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "change.txtFile", error);
            }
        });
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "document.ready", error);
    }
});

function PreencheListaSetores(SetorSolicitanteId)
{
    try
    {
        $.ajax({
            url: "/Viagens/Upsert?handler=AJAXPreencheListaSetores",
            method: "GET",
            datatype: "json",
            success: function (res)
            {
                let SetorList = [];

                res.data.forEach(item =>
                {
                    SetorList.push({
                        "SetorSolicitanteId": item.setorSolicitanteId,
                        "SetorPaiId": item.setorPaiId,
                        "Nome": item.nome,
                        "HasChild": item.hasChild
                    });
                });

                document.getElementById("ddtSetor").ej2_instances[0].fields.dataSource = SetorList;
            }
        });

        document.getElementById("ddtSetor").ej2_instances[0].refresh();
        var strSetor = String(SetorSolicitanteId);
        document.getElementById("ddtSetor").ej2_instances[0].value = [strSetor];
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "PreencheListaSetores", error);
    }
}

function RequisitanteValueChange()
{
    try
    {
        var ddTreeObj = document.getElementById("cmbRequisitante").ej2_instances[0];
        if (ddTreeObj.value === null) return;
        var requisitanteid = String(ddTreeObj.value);

        $.ajax({
            url: "/Viagens/Upsert?handler=PegaSetor",
            method: "GET",
            datatype: "json",
            data: { id: requisitanteid },
            success: function (res)
            {
                document.getElementById("ddtSetor").ej2_instances[0].value = [res.data];
            }
        });

        $.ajax({
            url: "/Viagens/Upsert?handler=PegaRamal",
            method: "GET",
            datatype: "json",
            data: { id: requisitanteid },
            success: function (res)
            {
                document.getElementById("txtRamalRequisitante").value = res.data;
            }
        });
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "RequisitanteValueChange", error);
    }
}

function RequisitanteEventoValueChange()
{
    try
    {
        var ddTreeObj = document.getElementById("lstRequisitanteEvento").ej2_instances[0];
        if (ddTreeObj.value === null) return;
        var requisitanteid = String(ddTreeObj.value);

        $.ajax({
            url: "/Viagens/Upsert?handler=PegaSetor",
            method: "GET",
            datatype: "json",
            data: { id: requisitanteid },
            success: function (res)
            {
                document.getElementById("ddtSetorRequisitanteEvento").ej2_instances[0].value = [res.data];
            }
        });
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "RequisitanteEventoValueChange", error);
    }
}

function MotoristaValueChange()
{
    try
    {
        var ddTreeObj = document.getElementById("cmbMotorista").ej2_instances[0];
        console.log("Objeto Motorista:", ddTreeObj);

        if (ddTreeObj.value === null) return;

        var motoristaid = String(ddTreeObj.value);

        $.ajax({
            url: "/Viagens/Upsert?handler=VerificaMotoristaViagem",
            method: "GET",
            datatype: "json",
            data: { id: motoristaid },
            success: function (res)
            {
                var viajando = res.data;
                console.log("Motorista Viajando:", viajando);

                if (viajando)
                {
                    swal({
                        title: "Motorista em Viagem",
                        text: "Este motorista encontra-se em uma viagem não terminada!",
                        icon: "warning",
                        dangerMode: true,
                        buttons: {
                            ok: "Ok"
                        }
                    });
                }
            }
        });
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "MotoristaValueChange", error);
    }
}

function VeiculoValueChange()
{
    try
    {
        var ddTreeObj = document.getElementById("cmbVeiculo").ej2_instances[0];
        console.log("Objeto Veículo:", ddTreeObj);

        if (ddTreeObj.value === null) return;

        var veiculoid = String(ddTreeObj.value);

        $.ajax({
            url: "/Viagens/Upsert?handler=VerificaVeiculoViagem",
            method: "GET",
            datatype: "json",
            data: { id: veiculoid },
            success: function (res)
            {
                var viajando = res.data;
                console.log("Veículo Viajando:", viajando);

                if (viajando)
                {
                    swal({
                        title: "Veículo em Viagem",
                        text: "Este veículo encontra-se em uma viagem não terminada!",
                        icon: "warning",
                        dangerMode: true,
                        buttons: {
                            ok: "Ok"
                        }
                    });
                }
            }
        });

        $.ajax({
            url: "/Viagens/Upsert?handler=PegaKmAtualVeiculo",
            method: "GET",
            datatype: "json",
            data: { id: veiculoid },
            success: function (res)
            {
                var km = res.data;
                document.getElementById("txtKmAtual").value = km;
            }
        });
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "VeiculoValueChange", error);
    }
}

$("#btnInserirEvento").click(function (e)
{
    try
    {
        e.preventDefault();

        if ($("#txtNomeDoEvento").val() === "" || $("#txtDescricao").val() === "" ||
            $("#txtDataInicialEvento").val() === "" || $("#txtDataFinalEvento").val() === "" ||
            $("#txtQtdPessoas").val() === "")
        {
            Alerta.Alerta("⚠️ Atenção", "Todos os campos são obrigatórios!");
            return;
        }

        let setores = document.getElementById('ddtSetorRequisitanteEvento').ej2_instances[0];
        let requisitantes = document.getElementById('lstRequisitanteEvento').ej2_instances[0];

        if (!setores.value || !requisitantes.value)
        {
                Alerta.Alerta("⚠️ Atenção", "Setor e Requisitante são obrigatórios!");
                return;
        }

        let objEvento = JSON.stringify({
            "Nome": $('#txtNomeDoEvento').val(),
            "Descricao": $('#txtDescricaoEvento').val(),
            "SetorSolicitanteId": setores.value.toString(),
            "RequisitanteId": requisitantes.value.toString(),
            "QtdParticipantes": $('#txtQtdPessoas').val(),
            "DataInicial": moment($('#txtDataInicialEvento').val()).format("MM-DD-YYYY"),
            "DataFinal": moment($('#txtDataFinalEvento').val()).format("MM-DD-YYYY"),
            "Status": "1"
        });

        $.ajax({
            type: "POST",
            url: "/api/Viagem/AdicionarEvento",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: objEvento,
            success: function (data)
            {
                toastr.success(data.message);
                PreencheListaEventos(data.eventoId);
                $("#modalEvento").hide();
            },
            error: function (data)
            {
                alert('error');
                console.log(data);
            }
        });
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "click.btnInserirEvento", error);
    }
});

$("#btnInserirRequisitante").click(function (e)
{
    try
    {
        e.preventDefault();

        if ($("#txtPonto").val() === "" || $("#txtNome").val() === "" || $("#txtRamal").val() === "")
        {
            Alerta.Alerta("⚠️ Atenção", "Ponto, Nome e Ramal são obrigatórios!");
            return;
        }

        let setores = document.getElementById('ddtSetorRequisitante').ej2_instances[0];
        if (!setores.value)
        {
            Alerta.Alerta("⚠️ Atenção", "O Setor do Requisitante é obrigatório!");
            return;
        }

        let objRequisitante = JSON.stringify({
            "Nome": $('#txtNome').val(),
            "Ponto": $('#txtPonto').val(),
            "Ramal": $('#txtRamal').val(),
            "Email": $('#txtEmail').val(),
            "SetorSolicitanteId": setores.value.toString()
        });

        $.ajax({
            type: "POST",
            url: "/api/Viagem/AdicionarRequisitante",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: objRequisitante,
            success: function (data)
            {
                if (data.success)
                {
                    toastr.success(data.message);
                    document.getElementById("cmbRequisitante").ej2_instances[0].addItem({
                        RequisitanteId: data.requisitanteid,
                        Requisitante: $('#txtNome').val() + " - " + $('#txtPonto').val()
                    }, 0);
                    $("#modalRequisitante").hide();
                    $('.modal-backdrop').remove();
                    $("body").removeClass("modal-open").css("overflow", "auto");
                    $("#btnFecharRequisitante").click();
                } else
                {
                    toastr.error(data.message);
                }
            },
            error: function (data)
            {
                Alerta.Erro("⚠️ Atenção", "Já existe um requisitante com este ponto/nome!");
                console.log(data);
            }
        });
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "click.btnInserirRequisitante", error);
    }
});

$("#btnInserirSetor").click(function (e)
{
    try
    {
        e.preventDefault();

        if ($("#txtNomeSetor").val() === "" || $("#txtRamalSetor").val() === "")
        {
            Alerta.Alerta("⚠️ Atenção", "Nome e Ramal do Setor são obrigatórios!");
            return;
        }

        let setorPaiId = null;
        let setorPai = document.getElementById('ddtSetorPai').ej2_instances[0].value;
        if (setorPai !== '' && setorPai !== null)
        {
            setorPaiId = setorPai.toString();
        }

        let objSetorData = {
            "Nome": $('#txtNomeSetor').val(),
            "Ramal": $('#txtRamalSetor').val(),
            "Sigla": $('#txtSigla').val()
        };

        if (setorPaiId)
        {
            objSetorData["SetorPaiId"] = setorPaiId;
        }

        let objSetor = JSON.stringify(objSetorData);

        $.ajax({
            type: "POST",
            url: "/api/Viagem/AdicionarSetor",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: objSetor,
            success: function (data)
            {
                toastr.success(data.message);
                PreencheListaSetores(data.setorId);
                $("#modalSetor").hide();
                $('.modal-backdrop').remove();
                $('body').removeClass('modal-open');
                $("body").css("overflow", "auto");
            },
            error: function (data)
            {
                alert('error');
                console.log(data);
            }
        });
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "click.btnInserirSetor", error);
    }
});

$("#btnSubmit").click(async function (event)
{
    try
    {
        event.preventDefault();

        if ($("#txtNoFichaVistoria").val() === "")
        {
            Alerta.Erro("⚠️ Informação Ausente", "O número da Ficha de Vistoria é obrigatório");
            return;
        }

        if ($("#txtDataInicial").val() === "")
        {
            Alerta.Erro("⚠️ Informação Ausente", "A Data Inicial é obrigatória");
            return;
        }

        if ($("#txtHoraInicial").val() === "")
        {
            Alerta.Erro("⚠️ Informação Ausente", "A Hora Inicial é obrigatória");
            return;
        }

        const finalidade = document.getElementById("ddtFinalidade").ej2_instances[0];
        if (!finalidade.value || finalidade.value[0] === null)
        {
            Alerta.Erro("⚠️ Informação Ausente", "A Finalidade é obrigatória");
            return;
        }

        const origem = document.getElementById("cmbOrigem").ej2_instances[0];
        if (origem.value === null)
        {
            Alerta.Erro("⚠️ Informação Ausente", "A Origem é obrigatória");
            return;
        }

        const motorista = document.getElementById("cmbMotorista").ej2_instances[0];
        if (motorista.value === null)
        {
            Alerta.Erro("⚠️ Informação Ausente", "O Motorista é obrigatório");
            return;
        }

        const veiculo = document.getElementById("cmbVeiculo").ej2_instances[0];
        if (veiculo.value === null)
        {
            Alerta.Erro("⚠️ Informação Ausente", "O Veículo é obrigatório");
            return;
        }

        if ($("#txtKmInicial").val() === "")
        {
            Alerta.Erro("⚠️ Informação Ausente", "A Quilometragem Inicial é obrigatória");
            return;
        }

        const combustivel = document.getElementById("ddtCombustivelInicial").ej2_instances[0];
        if (!combustivel.value)
        {
            Alerta.Erro("⚠️ Informação Ausente", "O Nível de Combustível Inicial é obrigatório");
            return;
        }

        const requisitante = document.getElementById("cmbRequisitante").ej2_instances[0];
        if (!requisitante.value || requisitante.value[0] === null)
        {
            Alerta.Erro("⚠️ Informação Ausente", "O Requisitante é obrigatório");
            return;
        }

        if ($("#txtRamalRequisitante").val() === "")
        {
            Alerta.Erro("⚠️ Informação Ausente", "O Ramal do Requisitante é obrigatório");
            return;
        }

        const setor = document.getElementById("ddtSetor").ej2_instances[0];
        if (!setor.value)
        {
            Alerta.Erro("⚠️ Informação Ausente", "O Setor Solicitante é obrigatório");
            return;
        }

        const dataFinal = $("#txtDataFinal").val();
        const horaFinal = $("#txtHoraFinal").val();
        const combustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0].value;
        const kmFinal = $("#txtKmFinal").val();

        const algumFinalPreenchido = dataFinal || horaFinal || combustivelFinal || kmFinal;
        const todosFinalPreenchidos = dataFinal && horaFinal && combustivelFinal && kmFinal;

        if (kmFinal && parseFloat(kmFinal) <= 0)
        {
            Alerta.Erro("⚠️ Informação Incorreta", "A Quilometragem Final deve ser maior que zero");
            return;
        }

        if (algumFinalPreenchido && !todosFinalPreenchidos)
        {
            Alerta.Erro("⚠️ Informação Incompleta", "Todos os campos de Finalização devem ser preenchidos para encerrar a viagem");
            return;
        }

        if (todosFinalPreenchidos)
        {
            const confirmacao = await Alerta.Confirmar(
                "Confirmar Fechamento",
                'Você está criando a viagem como "Realizada". Deseja continuar?',
                "Sim, criar!",
                "Cancelar"
            );

            if (!confirmacao)
            {
                return;
            }
        }

        const datasOk = await validarDatasInicialFinal($("#txtDataInicial").val(), $("#txtDataFinal").val());
        if (!datasOk)
        {
            return;
        }

        const kmOk = await validarKmInicialFinal();
        if (!kmOk)
        {
            return;
        }

        $("#btnSubmit").prop("disabled", true);
        $("#btnEscondido").click();
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "click.btnSubmit", error);
    }
});

$("#txtNoFichaVistoria").focusout(async function ()
{
    try
    {
        let noFicha = $("#txtNoFichaVistoria").val();
        if (noFicha === '') return;

        $.ajax({
            url: "/Viagens/Upsert?handler=VerificaFicha",
            method: "GET",
            datatype: "json",
            data: { id: noFicha },
            success: async function (res)
            {
                let maxFicha = parseInt(res.data);
                if (noFicha > maxFicha + 100 || noFicha < maxFicha - 100)
                {

                    const confirmado = await Alerta.Confirmar("Ficha Divergente", "O número inserido difere em ±100 da última Ficha inserida! Tem certeza?", "Tenho certeza! 💪🏼", "Me enganei! 😟'");

                    if (!confirmado)
                    {
                        const txtKmInicialElement = document.getElementById("txtKmInicial");
                        document.getElementById("txtNoFichaVistoria").value = "";
                        document.getElementById("txtNoFichaVistoria").focus();
                        return;
                    }

                }
            }
        });

        $.ajax({
            url: "/Viagens/Upsert?handler=FichaExistente",
            method: "GET",
            datatype: "json",
            data: { id: noFicha },
            success: async function (res)
            {
                if (res.data === true)
                {
                    await window.SweetAlertInterop.ShowPreventionAlert("Já existe uma Ficha inserida com esta numeração!");
                }
            }
        });
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "focusout.txtNoFichaVistoria", error);
    }
});

function calcularKmPercorrido()
{
    const elKmInicial = document.getElementById("txtKmInicial");
    const elKmFinal = document.getElementById("txtKmFinal");
    const elKmPercorrido = document.getElementById("txtKmPercorrido");

    const kmInicial = parseFloat(elKmInicial?.value.replace(",", "."));
    const kmFinal = parseFloat(elKmFinal?.value.replace(",", "."));

    if (isNaN(kmInicial) || isNaN(kmFinal)) return;

    elKmPercorrido.value = kmFinal - kmInicial;

//    if (elKmPercorrido.value >= 50 && elKmPercorrido.value < 100)
//    {
//        elKmPercorrido.style.fontWeight = "bold";
//        elKmPercorrido.style.color = "red";
//        tooltipKm.open(elKmPercorrido);
//        setTimeout(() => tooltipKm.close(), 3000);
//    } else
//    {
//        elKmPercorrido.style.fontWeight = "normal";
//        elKmPercorrido.style.color = "";
//    }
}

["input", "focusout", "change"].forEach(evt =>
    document.getElementById("txtKmFinal")?.addEventListener(evt, calcularKmPercorrido)
);

["input", "focusout", "change"].forEach(evt =>
    document.getElementById("txtHoraFinal")?.addEventListener(evt, calcularDuracaoViagem)
);

["input", "focusout", "change"].forEach(evt =>
    document.getElementById("txtKmPercorrido")?.addEventListener(evt, calcularKmPercorrido)
);

window.addEventListener("load", () =>
{
    try
    {
        const duracaoInput = document.getElementById("txtDuracao");
        if (duracaoInput)
        {
            duracaoInput.addEventListener("focus", () =>
            {
                tooltipDuracao.open(duracaoInput);
                setTimeout(() => tooltipDuracao.close(), 3000);
            });
        }

        const percorridoInput = document.getElementById("txtKmPercorrido");
        if (percorridoInput)
        {
            percorridoInput.addEventListener("focus", () =>
            {
                tooltipKm.open(percorridoInput);
                setTimeout(() => tooltipKm.close(), 3000);
            });
        }
    } catch (error)
    {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "load.window", error);
    }
});

var textBox = new ej.inputs.TextBox({
    input: function (args)
    {
        const value = args.event.target.value;

        // Remove qualquer caractere não numérico (exceto "-")
        args.event.target.value = value.replace(/[^\d-]/g, '');

        // Impede múltiplos sinais de "-"
        if ((value.match(/-/g) || []).length > 1 || value.indexOf('-') > 0)
        {
            args.event.target.value = value.replace(/-/g, '');
        }

        // Limite para inteiro de 32 bits
        const num = parseInt(args.event.target.value, 10);
        if (!isNaN(num))
        {
            if (num > 2147483647)
            {
                args.event.target.value = '2147483647';
            } else if (num < -2147483648)
            {
                args.event.target.value = '-2147483648';
            }
        }
    }
});
textBox.appendTo('#txtNoFichaVistoria');


document.addEventListener("DOMContentLoaded", function ()
{
    if (window.ej && ej.popups && document.querySelector("#cmbOrigem"))
    {
        new ej.popups.Tooltip({
            content: "Se a <strong>Origem</strong> não estiver presente na Lista, verifique primeiro se ela não está cadastrada com <strong>Outro Nome</strong> antes de cadastrar uma nova.",
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
        }, "#cmbOrigem");
    }

    if (window.ej && ej.popups && document.querySelector("#cmbDestino"))
    {
        new ej.popups.Tooltip({
            content: "Se o <strong>Destino</strong> não estiver presente na Lista, verifique primeiro se ele não está cadastrado com <strong>Outro Nome</strong> antes de cadastrar um novo.",
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
        }, "#cmbDestino");
    }

    if (window.ej && ej.popups && document.querySelector("#cmbMotorista"))
    {
        new ej.popups.Tooltip({
            content: "Se o <strong>Motorista</strong> não estiver presente na Lista, verifique primeiro se ele não está <strong>Inativo</strong> antes de cadastrar um novo.",
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
        }, "#cmbMotorista");
    }

    if (window.ej && ej.popups && document.querySelector("#cmbVeiculo"))
    {
        new ej.popups.Tooltip({
            content: "Se o <strong>Veículo</strong> não estiver presente na Lista, verifique primeiro se ele não está <strong>Inativo</strong> antes de cadastrar um novo.",
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
        }, "#cmbVeiculo");
    }

    if (window.ej && ej.popups && document.querySelector("#cmbRequisitante"))
    {
        new ej.popups.Tooltip({
            content: "Se o <strong>Requisitante</strong> não estiver presente na Lista, verifique primeiro se ele não está <strong>Inativo</strong> antes de cadastrar um novo.",
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
        }, "#cmbRequisitante");
    }

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

    if (window.ej && ej.popups && document.querySelector("#ddtEventos"))
    {
        new ej.popups.Tooltip({
            content: "Se o <strong>Evento</strong> não estiver presente na Lista, verifique primeiro se ele não está <strong>Inativo</strong> antes de cadastrar um novo.",
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
        }, "#ddtEventos");
    }

    if (window.ej && ej.popups && document.querySelector("#requisitanteEvento"))
    {
        new ej.popups.Tooltip({
            content: "Se o <strong>Requisitante do Evento</strong> não estiver presente na Lista, verifique primeiro se ele não está <strong>Inativo</strong> antes de cadastrar um novo.",
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
        }, "#requisitanteEvento");
    }


});

