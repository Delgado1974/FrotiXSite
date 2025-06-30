var URapi = "/api/viagem";
var IDapi = "";

function ListaTodasViagens() {
    console.log("Lista Todos");

    statusId = "Realizada";
    URLapi = "/api/custosviagem";

    ListaTblViagens(URLapi, statusId);
}

// Ajusta funcionamento do RTE no Modal
var defaultRTE;

function onCreate() {
    defaultRTE = this;
}

function stopEnterSubmitting(e) {
    if (e.keyCode == 13) {
        var src = e.srcElement || e.target;

        console.log(src.tagName.toLowerCase());

        if (src.tagName.toLowerCase() != "div") {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        }
    }
}

// Botão Fechar do Modal
//=============================
$("#btnFechar").click(function (e) {
    $("div").removeClass("modal-backdrop");
    try {
        
    } catch (error) {
        TratamentoErroComLinha("Erro em Javascript", "stopEnterSubmitting", error);

        console.error(error);
        toastr.error('Ocorreu um erro ao executar a ação');
    }
});

$('#modalAjustaCustos').on('shown.bs.modal', function (event) {
    try {


        //console.log("🟢 Modal abriu");

        //    var dataTableViagens = $('#tblViagem').DataTable();
        //    console.log("📊 DataTable: ", dataTableViagens);

        //    var button = $(event.relatedTarget);
        //    console.log("🟡 Botão que abriu o modal: ", button);

        //    var row = button.closest('tr');
        //    console.log("🔵 Linha relacionada: ", row);

        //    if (row.length) {
        //        var data = dataTableViagens.row(row).data();
        //        console.log("🟣 Dados da linha: ", data);

        //        var viagemId = button.data("id");
        //        console.log("🟠 ID da Viagem: ", viagemId);

        //        if (viagemId == null) {
        //            console.warn("⚠️ viagemId veio null!");
        //        }

        //        $('#txtId').attr('value', viagemId?.toString() ?? '');
        //    } else {
        //        console.warn("⚠️ Nenhuma linha relacionada foi encontrada.");
        //    }

        //return;




        var dataTableViagens = $('#tblViagem').DataTable();
        var button = $(event.relatedTarget); // botão que abriu o modal
        var row = button.closest('tr');      // encontra a linha associada

        if (row.length) {
            var data = dataTableViagens.row(row).data();
            console.log("Linha: ", row);
            console.log("Dados: ", data);

            var viagemId = button.data("id");
            console.log(viagemId);
            $('#txtId').attr('value', viagemId);

            var NoFichaVistoria = data['noFichaVistoria'];
            var DataInicial = data['dataInicial'];
            var HoraInicial = data['horaInicio'];
            var KmInicial = data['kmInicial'];
            var DataFinal = data['dataFinal'];
            var HoraFinal = data['horaFim'];
            var KmFinal = data['kmFinal'];
            var NomeMotorista = data['nomeMotorista'];
            var noFichaVistoria = data['noFichaVistoria'];
            var Finalidade = data['Finalidade'];

            $("#h3Titulo").html("Editar a Viagem - Ficha nº " + noFichaVistoria + " de " + NomeMotorista);

            document.getElementById("txtNoFichaVistoria").value = NoFichaVistoria;
            document.getElementById("txtDataInicial").value = (DataInicial).substring(6, 10) + "-" + (DataInicial).substring(3, 5) + "-" + (DataInicial).substring(0, 2);
            document.getElementById("txtHoraInicial").value = HoraInicial;
            document.getElementById("txtKmInicial").value = KmInicial;
            document.getElementById("txtDataFinal").value = (DataFinal).substring(6, 10) + "-" + (DataFinal).substring(3, 5) + "-" + (DataFinal).substring(0, 2);
            document.getElementById("txtHoraFinal").value = HoraFinal;
            document.getElementById("txtKmFinal").value = KmFinal;

            $.ajax({
                url: "api/custosviagem/PegaMotoristaVeiculo",
                method: "GET",
                datatype: "json",
                data: { id: viagemId },
                success: function (res) {
                    if (res.success === true) {
                        var veiculos = document.getElementById('lstVeiculoAlterado').ej2_instances[0];
                        veiculos.value = res.veiculoId;
                        veiculos.dataBind();

                        var motoristas = document.getElementById('lstMotoristaAlterado').ej2_instances[0];
                        motoristas.value = res.motoristaId;
                        motoristas.dataBind();

                        var finalidade = document.getElementById('lstFinalidadeAlterada').ej2_instances[0];
                        finalidade.value = res.finalidadeId;
                        finalidade.dataBind();

                        var setor = document.getElementById('lstSetorSolicitanteAlterado').ej2_instances[0];
                        setor.value = [res.setorsolicitanteId];
                        setor.dataBind();

                        if (res.eventoId != null) {

                            var lstEvento = document.getElementById("lstEvento").ej2_instances[0];
                            lstEvento.enabled = true; // To enable

                            var evento = document.getElementById('lstEvento').ej2_instances[0];
                            evento.value = [res.eventoId];
                            evento.dataBind();
                        }
                        else
                        {
                            var lstEvento = document.getElementById("lstEvento").ej2_instances[0];
                            lstEvento.enabled = false; // To enable
                            lstEvento.value = null;
                        }

                        console.log("Veículo:", veiculos.value);
                        console.log("Motorista:", motoristas.value);
                        console.log("Finalidade:", finalidade.value);
                        console.log("Setor:", setor.value);
                    //    console.log("Evento:", evento.value);
                    }
                }
            });

            FinalidadeChange();
            
        } else {
            console.warn("Nenhuma linha associada ao botão que abriu o modal.");
        }

    } catch (error) {
        TratamentoErroComLinha("Erro em Javascript", "shown.bs.modal", error);
        console.error(error);
        toastr.error('Ocorreu um erro ao abrir o modal');
    }
}).on("hide.bs.modal", function (event) {
    //Habilita tudo
    $('#txtDataInicial').attr('value', '');
    $('#txtHoraInicial').attr('value', '');
    $('#txtKmInicial').attr('value', '');

    $('#txtDataFinal').removeAttr("readonly")
    $('#txtHoraFinal').removeAttr("readonly")
    $('#txtKmFinal').removeAttr("readonly")

    $('#txtDataFinal').attr('type', 'date');
    $('#txtDataFinal').attr('value', '');
    $('#txtHoraFinal').attr('value', '');
    $('#txtKmFinal').attr('value', '');

    var veiculos = document.getElementById('lstVeiculoAlterado').ej2_instances[0];
    veiculos.value = '';
    var motoristas = document.getElementById('lstMotoristaAlterado').ej2_instances[0];
    motoristas.value = '';
    var finalidade = document.getElementById('lstFinalidadeAlterada').ej2_instances[0];
    finalidade.value = '';
    var setor = document.getElementById('lstSetorSolicitanteAlterado').ej2_instances[0];
    setor.value = '';

    $('#btnAjustarViagem').attr('visible', 'true');

    $("div").removeClass("modal-backdrop");

    $('body').removeClass('modal-open');
    $("body").css("overflow", "auto");
});

$(document).ready(function () {
    try {
        // $("txtData").on('keyup', function (e) {
        //     if (e.key === 'Enter' || e.keyCode === 13) {
        //         document.getElementById('txtData').onchange();

        //     }
        // });

        ListaTodasViagens();

        // $("#txtData").change(function () {
        //     DefineEscolhaData();

        //     console.log("txtDataChange");

        //     var veiculos = document.getElementById('lstVeiculos').ej2_instances[0];
        //     veiculos.value = "";
        //     var setores = document.getElementById('ddtSetor').ej2_instances[0];
        //     setores.value = "";
        //     var motoristas = document.getElementById('lstMotorista').ej2_instances[0];
        //     motoristas.value = "";

        //     var date = $('#txtData').val().split("-");
        //     console.log(date, $('#txtData').val())
        //     day = date[2];
        //     month = date[1];
        //     year = date[0];
        //     var dataViagem = (day + "/" + month + "/" + year);

        //     console.log(dataViagem);

        //     ListaTblViagens("/api/custosviagem/ViagemData", dataViagem);

        // });

        
    } catch (error) {
        TratamentoErroComLinha("Erro em Javascript", "stopEnterSubmitting", error);

        console.error(error);
        toastr.error('Ocorreu um erro ao executar a ação');
    }
});

//Verifica se Data Final é menor que Data Inicial
$("#txtDataFinal").focusout(function () {
    try {
        var parts = $("#txtDataInicial").val().split('/');
        var DataInicial = parts[2] + '-' + parts[1] + '-' + parts[0];
        DataFinal = $("#txtDataFinal").val();

        console.log('Data Inicial: ' + DataInicial);
        console.log('Data Final: ' + DataFinal);
        console.log((DataFinal < DataInicial));

        if (($("#txtDataFinal").val() < $("#txtDataInicial").val()) && $("#txtDataFinal").val() != '') {
            $("#txtDataFinal").val('');
            swal({
                title: "Erro na Data",
                text: "A data final deve ser maior que a inicial!",
                icon: "error",
                buttons: true,
                
                buttons: {
                    ok: "Ok"
                }
            })
            return;
        }
        
    } catch (error) {
        TratamentoErroComLinha("Erro em Javascript", "stopEnterSubmitting", error);

        console.error(error);
        toastr.error('Ocorreu um erro ao executar a ação');
    }
});

//Verifica se Hora Final é menor que Hora Inicial e se tem Data Final
$("#txtHoraFinal").focusout(function () {
    try {
        HoraInicial = $("#txtHoraInicial").val();
        HoraFinal = $("#txtHoraFinal").val();
        var parts = $("#txtDataInicial").val().split('/');
        var DataInicial = parts[2] + '-' + parts[1] + '-' + parts[0];
        DataFinal = $("#txtDataFinal").val();

        if (DataFinal === '' && HoraFinal != '') {
            $("#txtHoraFinal").val('');
            swal({
                title: "Erro na Hora Final",
                text: "Preencha a Data Final para poder preencher a Hora Final!",
                icon: "error",
                buttons: true,
                
                buttons: {
                    ok: "Ok"
                }
            })
        }

        console.log('Data Inicial: ' + DataInicial);
        console.log('Data Final: ' + DataFinal);
        console.log('Hora Inicial: ' + HoraInicial);
        console.log('Hora Final: ' + HoraFinal);

        if (($("#txtHoraFinal").val() < $("#txtHoraInicial").val()) && ($("#txtDataFinal").val() === $("#txtDataInicial").val())) {
            $("#txtHoraFinal").val('');
            swal({
                title: "Erro na Hora",
                text: "A hora final deve ser maior que a inicial!",
                icon: "error",
                buttons: true,
                
                buttons: {
                    ok: "Ok"
                }
            })
        }
        
    } catch (error) {
        TratamentoErroComLinha("Erro em Javascript", "stopEnterSubmitting", error);

        console.error(error);
        toastr.error('Ocorreu um erro ao executar a ação');
    }
});

//Verifica se KM Final é menor que KM Inicial
$("#txtKmFinal").focusout(function () {
    try {
        kmInicial = parseInt($("#txtKmInicial").val());
        kmFinal = parseInt($("#txtKmFinal").val());

        if (kmFinal < kmInicial) {
            $("#txtKmFinal").val('');
            swal({
                title: "Erro na Quilometragem",
                text: "A quilometragem final deve ser maior que a inicial!",
                icon: "error",
                buttons: true,
                
                buttons: {
                    ok: "Ok"
                }
            })
        }

        if ((kmFinal - kmInicial) > 100) {
            swal({
                title: "Alerta na Quilometragem",
                text: "A quilometragem final excede em 100km a inicial!",
                icon: "warning",
                buttons: true,
                
                buttons: {
                    ok: "Ok"
                }
            })
        }

        
    } catch (error) {
        TratamentoErroComLinha("Erro em Javascript", "stopEnterSubmitting", error);

        console.error(error);
        toastr.error('Ocorreu um erro ao executar a ação');
    }
});

// Botão Fechar do Modal
//=============================
$("#btnFechar").click(function (e) {
    $("div").removeClass("modal-backdrop");
    try {
        
    } catch (error) {
        TratamentoErroComLinha("Erro em Javascript", "stopEnterSubmitting", error);

        console.error(error);
        toastr.error('Ocorreu um erro ao executar a ação');
    }
});

// Botão FinazarViagem do Modal
//=============================
$("#btnAjustarViagem").click(function (e) {
    e.preventDefault();

    const $btn = $(this);
    const $spinner = $btn.find(".spinner-border");
    const $btnText = $btn.find(".btn-text");

    // Ativa modo loading
    $btn.prop("disabled", true);
    $spinner.removeClass("d-none");
    $btnText.text("Aguarde...");
    document.body.style.cursor = "wait";

    setTimeout(function () {
        try {
            const NoFichaVistoria = $("#txtNoFichaVistoria").val();

            const veiculos = document.getElementById("lstVeiculoAlterado").ej2_instances[0];
            const motoristas = document.getElementById("lstMotoristaAlterado").ej2_instances[0];
            const finalidade = document.getElementById("lstFinalidadeAlterada").ej2_instances[0];
            const setor = document.getElementById("lstSetorSolicitanteAlterado").ej2_instances[0];
            const evento = document.getElementById("lstEvento").ej2_instances[0];

            if ((evento.value === "" || evento.value === null) && finalidade.value === "Evento") {
                swal({
                    title: "Erro no Evento",
                    text: "Se a Finalidade for EVENTO, o Evento deve ser informado!",
                    icon: "error",
                    
                    buttons: { ok: "Ok" }
                });
                resetButton();
                return;
            }

            if (NoFichaVistoria === "") {
                swal({
                    title: "Erro na Vistoria",
                    text: "O número da Ficha de Vistoria é obrigatório!",
                    icon: "error",
                    
                    buttons: { ok: "Ok" }
                });
                resetButton();
                return;
            }

            const DataInicial = $("#txtDataInicial").val();
            if (DataInicial === "") {
                swal({
                    title: "Erro na Data",
                    text: "A data inicial é obrigatória!",
                    icon: "error",
                    
                    buttons: { ok: "Ok" }
                });
                resetButton();
                return;
            }

            const HoraInicio = $("#txtHoraInicial").val();
            if (HoraInicio === "") {
                swal({
                    title: "Erro na Hora",
                    text: "A hora inicial é obrigatória!",
                    icon: "error",
                    
                    buttons: { ok: "Ok" }
                });
                resetButton();
                return;
            }

            const KmInicial = $("#txtKmInicial").val();
            if (KmInicial === "") {
                swal({
                    title: "Erro na Quilometragem",
                    text: "A quilometragem inicial é obrigatória!",
                    icon: "error",
                    
                    buttons: { ok: "Ok" }
                });
                resetButton();
                return;
            }

            const DataFinal = $("#txtDataFinal").val();
            if (DataFinal === "") {
                swal({
                    title: "Erro na Data",
                    text: "A data final é obrigatória!",
                    icon: "error",
                    
                    buttons: { ok: "Ok" }
                });
                resetButton();
                return;
            }

            const HoraFinal = $("#txtHoraFinal").val();
            if (HoraFinal === "") {
                swal({
                    title: "Erro na Hora",
                    text: "A hora final é obrigatória!",
                    icon: "error",
                    
                    buttons: { ok: "Ok" }
                });
                resetButton();
                return;
            }

            const KmFinal = $("#txtKmFinal").val();
            if (KmFinal === "") {
                swal({
                    title: "Erro na Quilometragem",
                    text: "A quilometragem final é obrigatória!",
                    icon: "error",
                    
                    buttons: { ok: "Ok" }
                });
                resetButton();
                return;
            }

            let objViagem;
            if (evento.value != null) {
                objViagem = JSON.stringify({
                    ViagemId: $('#txtId').val(),
                    NoFichaVistoria,
                    DataInicial,
                    HoraInicial: HoraInicio,
                    KmInicial,
                    DataFinal,
                    HoraFim: HoraFinal,
                    KmFinal,
                    VeiculoId: veiculos.value,
                    MotoristaId: motoristas.value,
                    Finalidade: finalidade.value,
                    SetorSolicitanteId: setor.value[0],
                    EventoId: evento.value[0]
                });
            } else {
                objViagem = JSON.stringify({
                    ViagemId: $('#txtId').val(),
                    NoFichaVistoria,
                    DataInicial,
                    HoraInicial: HoraInicio,
                    KmInicial,
                    DataFinal,
                    HoraFim: HoraFinal,
                    KmFinal,
                    VeiculoId: veiculos.value,
                    MotoristaId: motoristas.value,
                    Finalidade: finalidade.value,
                    SetorSolicitanteId: setor.value[0]
                });
            }

            $.ajax({
                type: "POST",
                url: "/api/Viagem/AjustaViagem",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: objViagem,
                success: function (data) {
                    toastr.success(data.message);
                    $('#tblViagem').DataTable().ajax.reload(null, false);
                    $("#modalAjustaCustos").hide();
                    $('body').removeClass('modal-open');
                    $("body").css("overflow", "auto");
                    $("div").removeClass("modal-backdrop");
                    ListaTodasViagens();
                },
                error: function (data) {
                    console.error(data);
                    toastr.error("Erro ao ajustar a viagem.");
                },
                complete: function () {
                    resetButton();
                }
            });

        } catch (error) {
            console.error(error);
            toastr.error("Erro inesperado.");
            resetButton();
        }
    }, 100); // Espera 100ms para o cursor renderizar

    function resetButton() {
        $btn.prop("disabled", false);
        $spinner.addClass("d-none");
        $btnText.text("Ajustar Viagem");
        document.body.style.cursor = "default";
    }
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
})

//==== Modal Ficha de Vistoria  =======
$("#modalFicha").modal
    ({
        keyboard: true,
        backdrop: "static",
        show: false,
    }).on("show.bs.modal", function (event) {
        var button = $(event.relatedTarget); // button the triggered modal

        var ViagemId = button.data("id"); //data-id of button which is equal to id (primary key) of person

        console.log(ViagemId);

        document.getElementById("txtViagemId").value = ViagemId

        var id = ViagemId;

        var label = document.getElementById("DynamicModalLabel");
        label.innerHTML = ("");

        $.ajaxSetup({ async: false });

        $.ajax({
            type: "get",
            url: "/api/Viagem/PegaFichaModal",
            data: { id: id },
            success: function (res) {
                console.log("Imagem: " + res);

                var fichavistoria = $(event.relatedTarget).closest("tr").find("td:eq(0)").text();
                console.log("fichavistoria: " + fichavistoria);

                var label = document.getElementById("DynamicModalLabel");

                console.log("label: " + label);

                $('#imgViewer').removeAttr("src")

                if (res === false) {
                    label.innerHTML = ("Viagem sem Ficha de Vistoria Digitalizada");
                    $('#imgViewer').attr('src', "/Images/FichaAmarelaNova.jpg");
                }
                else {
                    label.innerHTML = ("Ficha de Vistoria Nº: <b>" + fichavistoria + "</b>");
                    $('#imgViewer').attr('src', "data:image/jpg;base64," + res);
                }
            },
            error: function (error) {
                console.log(error);
            }
        });
    }).on("hide.bs.modal", function (event) {
        $('#imgViewer').removeAttr("src")
    });

//Carrega a foto no controle e redimensiona o painel
//==================================================
$("#txtFile").change(function (event) {
    var files = event.target.files;
    try {
        $("#imgViewer").attr("src", window.URL.createObjectURL(files[0]));
        $("#painelfundo").css({
            "padding-bottom:": "200px"
        });
        
    } catch (error) {
        TratamentoErroComLinha("Erro em Javascript", "stopEnterSubmitting", error);

        console.error(error);
        toastr.error('Ocorreu um erro ao executar a ação');
    }
});

//Convert to base 64
//=================================
function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    try {
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        return dataURL;
        
    } catch (error) {
        TratamentoErroComLinha("Erro em Javascript", "getBase64Image", error);

        console.error(error);
        toastr.error('Ocorreu um erro ao executar a ação');
    }
}

//Grava a Foto Carregada no Modal
//================================
$("#btnAdicionarFicha").click(function () {
    try {
        viagemid = document.getElementById("txtViagemId").value;

        id = JSON.stringify({ viagemid: viagemid });

        var fd = new FormData();
        var files = $('#txtFile')[0].files;

        console.log(files);

        //Check file selected or not
        if (files.length > 0) {
            fd.append('file', files[0]);
            fd.append('viagemid', id);
            var base64 = getBase64Image(document.getElementById("imgViewer"));

            base64 = base64.replace('data:image/png;base64,', '');

            var data = { 'file': base64, 'viagemid': document.getElementById("txtViagemId").value };

            $.ajax({
                url: "/api/Viagem/FileUpload",
                //url: "/api/Viagem/FileUpload?file=" + base64 + "&viagemid=" + viagemid,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: "application/json;charset=utf-8",
                dataType: "json",
                success: function (response) {
                    toastr.success("Ficha de Vistoria Inserida com Sucesso");
                    console.log("Response: " + response);
                    $("#modalFicha").hide();

                    $('body').removeClass('modal-open');
                    $("body").css("overflow", "auto");
                },
            });
        } else {
            alert("Please select a file.");
        }

        
    } catch (error) {
        TratamentoErroComLinha("Erro em Javascript", "getBase64Image", error);

        console.error(error);
        toastr.error('Ocorreu um erro ao executar a ação');
    }
});

function ListaTblViagens(URLapi, IDapi) {
    try {
        //------ Aciona o Loading Spinner ------------------
        //==================================================
        $('#divViagens').LoadingScript('method_12', {
            'background_image': 'img/loading7.png',
            'main_width': 200,
            'animation_speed': 10,
            'additional_style': '',
            'after_element': false
        });

        var dataTableViagens = $('#tblViagem').DataTable();
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
                    "targets": 1, //Data Inicial
                    "className": "text-center",
                    "width": "3%",
                },
                {
                    "targets": 2, //Data Final
                    "className": "text-center",
                    "width": "3%",
                },
                {
                    "targets": 3, //Hora Inicio
                    "className": "text-center",
                    "width": "3%",
                },
                {
                    "targets": 4, //Hora Final
                    "className": "text-center",
                    "width": "3%",
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
                    "targets": 7, //Km Inicial
                    "className": "text-center",
                    "width": "3%",
                },
                {
                    "targets": 8, //Km Final
                    "className": "text-center",
                    "width": "3%",
                },
                {
                    "targets": 9, //Quilometragem
                    "className": "text-center",
                    "width": "3%",
                },
                {
                    "targets": 10, //Custo Motorista
                    "className": "text-center",
                    "width": "3%",
                },
                {
                    "targets": 11, //Custo Combustível
                    "className": "text-center",
                    "width": "3%",
                },
                {
                    "targets": 12, //Custo Veículo
                    "className": "text-center",
                    "width": "3%",
                },
                {
                    "targets": 13, //Ação
                    "className": "text-center",
                    "width": "6%",
                },
                {
                    "targets": 14, //ViagemId
                    "className": "text-center",
                    "width": "1%",
                },
                {
                    "targets": 15, //Row Number
                    "className": "text-center",
                    "width": "1%",
                }
            ],
            responsive: true,
            processing: true,
            "ajax": {
                "url": URLapi,
                "type": "GET",
                "data": { id: IDapi },
                "datatype": "json"
            },
            "columns": [
                { "data": "noFichaVistoria" },
                { "data": "dataInicial" },
                { "data": "dataFinal" },
                { "data": "horaInicio" },
                { "data": "horaFim" },
                { "data": "finalidade" },
                { "data": "nomeMotorista" },
                { "data": "descricaoVeiculo" },
                { "data": "kmInicial" },
                { "data": "kmFinal" },
                { "data": "quilometragem" },
                { "data": "custoMotorista" },
                { "data": "custoCombustivel" },
                { "data": "custoVeiculo" },
                {
                    "data": "viagemId",
                    "render": function (data) {

                        if (!data) return "";

                        return `<div class="text-center">
                    <a class="btn btn-xs text-white fundo-laranja" data-toggle="modal" data-target="#modalAjustaCustos" id="btnAjustar" aria-label="Ajusta dados da Viagem!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
                        <i class="fa-light fa-pen-to-square"></i>
                    </a>
                    <a class="btn btn-foto btn-dark btn-xs text-white" data-toggle="modal" data-target="#modalFicha" id="rowdata" aria-label="Ficha de Vistoria!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px" data-id='${data}' data-backdrop="false">
                        <i class="fab fa-wpforms"></i>
                    </a>

                </div>`;
                    }
                },
                {
                    "data": "viagemId",
                    render: function (data, type, row, meta) {
                        return meta.row + meta.settings._iDisplayStart + 1;
                    }
                },
            ],
            "language": {
                "emptyTable": "Nenhum registro encontrado",
                "info": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                "infoEmpty": "Mostrando 0 até 0 de 0 registros",
                "infoFiltered": "(Filtrados de _MAX_ registros)",
                "infoThousands": ".",
                "loadingRecords": "Carregando...",
                "processing": "<div class='spinner'></div>",
                "zeroRecords": "Nenhum registro encontrado",
                "search": "Pesquisar",
                "paginate": {
                    "next": "Próximo",
                    "previous": "Anterior",
                    "first": "Primeiro",
                    "last": "Último"
                },
                "aria": {
                    "sortAscending": ": Ordenar colunas de forma ascendente",
                    "sortDescending": ": Ordenar colunas de forma descendente"
                },
                "select": {
                    "rows": {
                        "_": "Selecionado %d linhas",
                        "1": "Selecionado 1 linha"
                    },
                    "cells": {
                        "1": "1 célula selecionada",
                        "_": "%d células selecionadas"
                    },
                    "columns": {
                        "1": "1 coluna selecionada",
                        "_": "%d colunas selecionadas"
                    }
                },
                "buttons": {
                    "copySuccess": {
                        "1": "Uma linha copiada com sucesso",
                        "_": "%d linhas copiadas com sucesso"
                    },
                    "collection": "Coleção  <span class=\"ui-button-icon-primary ui-icon ui-icon-triangle-1-s\"><\/span>",
                    "colvis": "Visibilidade da Coluna",
                    "colvisRestore": "Restaurar Visibilidade",
                    "copy": "Copiar",
                    "copyKeys": "Pressione ctrl ou u2318 + C para copiar os dados da tabela para a área de transferência do sistema. Para cancelar, clique nesta mensagem ou pressione Esc..",
                    "copyTitle": "Copiar para a Área de Transferência",
                    "csv": "CSV",
                    "excel": "Excel",
                    "pageLength": {
                        "-1": "Mostrar todos os registros",
                        "_": "Mostrar %d registros"
                    },
                    "pdf": "PDF",
                    "print": "Imprimir"
                },
                "autoFill": {
                    "cancel": "Cancelar",
                    "fill": "Preencher todas as células com",
                    "fillHorizontal": "Preencher células horizontalmente",
                    "fillVertical": "Preencher células verticalmente"
                },
                "lengthMenu": "Exibir _MENU_ resultados por página",
                "searchBuilder": {
                    "add": "Adicionar Condição",
                    "button": {
                        "0": "Construtor de Pesquisa",
                        "_": "Construtor de Pesquisa (%d)"
                    },
                    "clearAll": "Limpar Tudo",
                    "condition": "Condição",
                    "conditions": {
                        "date": {
                            "after": "Depois",
                            "before": "Antes",
                            "between": "Entre",
                            "empty": "Vazio",
                            "equals": "Igual",
                            "not": "Não",
                            "notBetween": "Não Entre",
                            "notEmpty": "Não Vazio"
                        },
                        "number": {
                            "between": "Entre",
                            "empty": "Vazio",
                            "equals": "Igual",
                            "gt": "Maior Que",
                            "gte": "Maior ou Igual a",
                            "lt": "Menor Que",
                            "lte": "Menor ou Igual a",
                            "not": "Não",
                            "notBetween": "Não Entre",
                            "notEmpty": "Não Vazio"
                        },
                        "string": {
                            "contains": "Contém",
                            "empty": "Vazio",
                            "endsWith": "Termina Com",
                            "equals": "Igual",
                            "not": "Não",
                            "notEmpty": "Não Vazio",
                            "startsWith": "Começa Com"
                        },
                        "array": {
                            "contains": "Contém",
                            "empty": "Vazio",
                            "equals": "Igual à",
                            "not": "Não",
                            "notEmpty": "Não vazio",
                            "without": "Não possui"
                        }
                    },
                    "data": "Data",
                    "deleteTitle": "Excluir regra de filtragem",
                    "logicAnd": "E",
                    "logicOr": "Ou",
                    "title": {
                        "0": "Construtor de Pesquisa",
                        "_": "Construtor de Pesquisa (%d)"
                    },
                    "value": "Valor",
                    "leftTitle": "Critérios Externos",
                    "rightTitle": "Critérios Internos"
                },
                "searchPanes": {
                    "clearMessage": "Limpar Tudo",
                    "collapse": {
                        "0": "Painéis de Pesquisa",
                        "_": "Painéis de Pesquisa (%d)"
                    },
                    "count": "{total}",
                    "countFiltered": "{shown} ({total})",
                    "emptyPanes": "Nenhum Painel de Pesquisa",
                    "loadMessage": "Carregando Painéis de Pesquisa...",
                    "title": "Filtros Ativos"
                },
                "thousands": ".",
                "datetime": {
                    "previous": "Anterior",
                    "next": "Próximo",
                    "hours": "Hora",
                    "minutes": "Minuto",
                    "seconds": "Segundo",
                    "amPm": [
                        "am",
                        "pm"
                    ],
                    "unknown": "-",
                    "months": {
                        "0": "Janeiro",
                        "1": "Fevereiro",
                        "10": "Novembro",
                        "11": "Dezembro",
                        "2": "Março",
                        "3": "Abril",
                        "4": "Maio",
                        "5": "Junho",
                        "6": "Julho",
                        "7": "Agosto",
                        "8": "Setembro",
                        "9": "Outubro"
                    },
                    "weekdays": [
                        "Domingo",
                        "Segunda-feira",
                        "Terça-feira",
                        "Quarta-feira",
                        "Quinte-feira",
                        "Sexta-feira",
                        "Sábado"
                    ]
                },
                "editor": {
                    "close": "Fechar",
                    "create": {
                        "button": "Novo",
                        "submit": "Criar",
                        "title": "Criar novo registro"
                    },
                    "edit": {
                        "button": "Editar",
                        "submit": "Atualizar",
                        "title": "Editar registro"
                    },
                    "error": {
                        "system": "Ocorreu um erro no sistema (<a target=\"\\\" rel=\"nofollow\" href=\"\\\">Mais informações<\/a>)."
                    },
                    "multi": {
                        "noMulti": "Essa entrada pode ser editada individualmente, mas não como parte do grupo",
                        "restore": "Desfazer alterações",
                        "title": "Multiplos valores",
                        "info": "Os itens selecionados contêm valores diferentes para esta entrada. Para editar e definir todos os itens para esta entrada com o mesmo valor, clique ou toque aqui, caso contrário, eles manterão seus valores individuais."
                    },
                    "remove": {
                        "button": "Remover",
                        "confirm": {
                            "_": "Tem certeza que quer deletar %d linhas?",
                            "1": "Tem certeza que quer deletar 1 linha?"
                        },
                        "submit": "Remover",
                        "title": "Remover registro"
                    }
                },
                "decimal": ","
            },
            "width": "100%"
        });

        $('#divViagens').LoadingScript('destroy');

        
    } catch (error) {
        TratamentoErroComLinha("Erro em Javascript", "ListaTblViagens", error);

        console.error(error);
        toastr.error('Ocorreu um erro ao executar a ação');
    }
}

