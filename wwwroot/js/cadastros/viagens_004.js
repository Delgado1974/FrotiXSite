var dataTable;

$(document).ready(function () {

    document.getElementById('ddtCombustivelInicial').ej2_instances[0].showPopup();
    document.getElementById('ddtCombustivelInicial').ej2_instances[0].hidePopup();
    console.log("Mostrei/Escondi Popup");

    ListaTodasViagens();

});

$(document).on('click', '.btn-cancelar', function () {
    var id = $(this).data('id');

    swal({
        title: "Você tem certeza que deseja cancelar esta viagem?",
        text: "Não será possível desfazer a operação!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
        buttons: {
            cancel: "Desistir",
            confirm: "Cancelar"
        }
    }).then((willDelete) => {
        if (willDelete) {
            var dataToPost = JSON.stringify({ 'ViagemId': id });
            var url = '/api/Viagem/Cancelar';
            $.ajax({
                url: url,
                type: "POST",
                data: dataToPost,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    if (data.success) {
                        toastr.success(data.message);
                        dataTable = $('#tblViagem').DataTable();
                        dataTable.ajax.reload();
                    }
                    else {
                        toastr.error(data.message);
                    }
                },
                error: function (err) {
                    console.log(err)
                    alert('something went wrong')
                }
            });

        }
    });
});


        function ClicaDropDowns() {

            document.getElementById('ddtCombustivelInicial').ej2_instances[0].showPopup();
            document.getElementById('ddtCombustivelInicial').ej2_instances[0].hidePopup();
            console.log("Mostrei/Escondi Popup");

        }


        $('#modalFinalizaViagem').on('shown.bs.modal', function (event) {


            var dataTableViagens = $('#tblViagem').DataTable();
            var row = $(this).closest('tr');
            var data = dataTableViagens.row(row).data();
            console.log("Linha: " + row + " - Dado: " + data);

            var RowNumber = $(event.relatedTarget).closest("tr").find("td:eq(9)").text() - 1;

            defaultRTE.refreshUI();
            defaultRTEDescricao.refreshUI();

            var button = $(event.relatedTarget); // button the triggered modal
            var viagemId = button.data("id");
            console.log(viagemId);
            $('#txtId').attr('value', viagemId);

            console.log("Row Number: " + RowNumber);

            var data = $('#tblViagem').DataTable().row(RowNumber).data();


            var DataInicial = data['dataInicial'];
            var HoraInicial = data['horaInicio'];
            var KmInicial = data['kmInicial'];
            var CombustivelInicial = data['combustivelInicial'];
            var DataFinal = data['dataFinal'];
            var HoraFinal = data['horaFim'];
            var KmFinal = data['kmFinal'];
            var CombustivelFinal = data['combustivelFinal'];
            var ResumoOcorrencia = data['resumoOcorrencia'];
            var DescricaoOcorrencia = data['descricaoOcorrencia'];
            var StatusDocumento = data['statusDocumento'];
            var StatusCartaoAbastecimento = data['statusCartaoAbastecimento'];
            var NomeMotorista = data['nomeMotorista'];
            var noFichaVistoria = data['noFichaVistoria'];
            var Descricao = data['descricao'];
            var ImagemOcorrencia = data['imagemOcorrencia'];

            $("#h3Titulo").html("Finalizar a Viagem - Ficha nº " + noFichaVistoria + " de " + NomeMotorista);
            console.log(DescricaoOcorrencia);


            $('#txtDataInicial').attr('value', DataInicial);
            $('#txtHoraInicial').attr('value', HoraInicial);
            $('#txtKmInicial').attr('value', KmInicial);

            $('#txtDataFinal').attr('value', '');
            $('#txtHoraFinal').attr('value', '');
            $('#txtKmFinal').attr('value', '');
            document.getElementById("txtKmFinal").value = "";

            var nivelinicial = document.getElementById('ddtCombustivelInicial').ej2_instances[0];
            nivelinicial.value = [CombustivelInicial];
            nivelinicial.enabled = false; // To disable

            var nivelfinal = document.getElementById('ddtCombustivelFinal').ej2_instances[0];

            $('#imgViewerItem').removeAttr("src")

            if (ImagemOcorrencia === '' || ImagemOcorrencia === null) {
                $('#imgViewerItem').attr('src', "/DadosEditaveis/ImagensOcorrencias/semimagem.jpg");
            }
            else {
                $('#imgViewerItem').attr('src', "/DadosEditaveis/ImagensOcorrencias/" + ImagemOcorrencia);
            }

            //debugger;

            //Se a viagem já estive finalizada, desabilita tudo
            if (DataFinal != null) {
                $('#txtDataFinal').removeAttr("type")

                $('#txtDataFinal').attr('value', DataFinal);
                $('#txtHoraFinal').attr('value', HoraFinal);
                //$('#txtKmFinal').attr('value', KmFinal);
                document.getElementById('txtKmFinal').value = KmFinal
                nivelfinal.value = [CombustivelFinal];

                var descricaoLista = document.getElementById('rteDescricao').ej2_instances[0];
                descricaoLista.value = Descricao;

                //debugger;

                $('#txtDataFinal').attr('readonly', true);
                $('#txtHoraFinal').attr('readonly', true);
                $('#txtKmFinal').attr('readonly', true);
                var nivelfinal = document.getElementById('ddtCombustivelFinal').ej2_instances[0];
                nivelfinal.enabled = false; // To disable
                $('#txtResumo').attr('readonly', true);


                $('#chkStatusDocumento').attr('readonly', true);
                $("#chkStatusDocumento").prop("checked", StatusDocumento);
                $('#chkStatusCartaoAbastecimento').attr('readonly', true);
                $("#chkStatusCartaoAbastecimento").prop("checked", StatusCartaoAbastecimento);

                console.log(ResumoOcorrencia);
                console.log(DescricaoOcorrencia);

                $('#txtResumo').attr('value', ResumoOcorrencia);
                var descricaoOcorrenciaLista = document.getElementById('rteOcorrencias').ej2_instances[0];
                descricaoOcorrenciaLista.value = DescricaoOcorrencia;

                $('#btnFinalizarViagem').hide();
            }
            else //Coloca data e hora atual
            {
                const d = new Date();
                $('#txtDataFinal').removeAttr("type")
                var dataAtual = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
                $('#txtDataFinal').attr('value', dataAtual);
                $('#txtDataFinal').attr('type', 'date');
                var horaAtual = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
                $('#txtHoraFinal').attr('value', horaAtual);
                $('#btnFinalizarViagem').show();

                //debugger;

                $('#chkStatusDocumento').attr('readonly', false);
                $("#chkStatusDocumento").prop("checked", true);
                $('#chkStatusCartaoAbastecimento').attr('readonly', false);
                $("#chkStatusCartaoAbastecimento").prop("checked", true);

                var descricaoLista = document.getElementById('rteDescricao').ej2_instances[0];
                descricaoLista.value = Descricao;

                console.log("Viagem Não Realizada");


            }
        }).on("hide.bs.modal", function (event) {

            //Habilita tudo
            $('#txtDataInicial').attr('value', '');
            $('#txtHoraInicial').attr('value', '');
            $('#txtKmInicial').attr('value', '');
            var nivelinicial = document.getElementById('ddtCombustivelInicial').ej2_instances[0];
            nivelinicial.value = '';

            $('#txtDataFinal').removeAttr("readonly")
            $('#txtHoraFinal').removeAttr("readonly")
            $('#txtKmFinal').removeAttr("readonly")
            $('#txtResumo').removeAttr("readonly")

            $('#txtDataFinal').attr('type', 'date');
            $('#txtDataFinal').attr('value', '');
            $('#txtHoraFinal').attr('value', '');
            $('#txtKmFinal').attr('value', '');
            var nivelfinal = document.getElementById('ddtCombustivelFinal').ej2_instances[0];
            nivelfinal.value = '';
            nivelfinal.enabled = true; // To enable
            $('#txtResumo').attr('value', '');

            var descricaoOcorrenciaLista = document.getElementById('rteOcorrencias').ej2_instances[0];
            descricaoOcorrenciaLista.value = '';
            descricaoOcorrenciaLista.readonly = false; // To enable

            var descricaoLista = document.getElementById('rteDescricao').ej2_instances[0];
            descricaoLista.value = '';
            descricaoLista.readonly = false; // To enable

            $('#chkStatusDocumento').attr('readonly', false);
            $("#chkStatusDocumento").prop("checked", true);
            $('#chkStatusCartaoAbastecimento').attr('readonly', false);
            $("#chkStatusCartaoAbastecimento").prop("checked", true);

            $('#btnFinalizarViagem').attr('visible', 'true');

            $('#imgViewerItem').removeAttr("src")

            //Limpa o controle de Upload de arquivos
            var upload = $("#txtFileItem").data("kendoUpload");
            upload.clearAllFiles();

        });


        //Verifica se Data Final é menor que Data Inicial
        $("#txtDataFinal").focusout(function () {

            var parts = $("#txtDataInicial").val().split('/');
            var DataInicial = parts[2] + '-' + parts[1] + '-' + parts[0];
            DataFinal = $("#txtDataFinal").val();

            console.log('Data Inicial: ' + DataInicial);
            console.log('Data Final: ' + DataFinal);
            console.log((DataFinal < DataInicial));

            if ((DataFinal < DataInicial)) {
                $("#txtDataFinal").val('');
                swal({
                    title: "Erro na Data",
                    text: "A data final deve ser maior que a inicial!",
                    icon: "error",
                    buttons: true,
                    dangerMode: true,
                    buttons: {
                        ok: "Ok"
                    }
                })
                return;
            }
        });

        //Verifica se Hora Final é menor que Hora Inicial e se tem Data Final
        $("#txtHoraFinal").focusout(function () {

            HoraInicial = $("#txtHoraInicial").val();
            HoraFinal = $("#txtHoraFinal").val();
            var parts = $("#txtDataInicial").val().split('/');
            var DataInicial = parts[2] + '-' + parts[1] + '-' + parts[0];
            DataFinal = $("#txtDataFinal").val();

            if (DataFinal === '') {
                $("#txtHoraFinal").val('');
                swal({
                    title: "Erro na Hora Final",
                    text: "Preencha a Data Final para poder preencher a Hora Final!",
                    icon: "error",
                    buttons: true,
                    dangerMode: true,
                    buttons: {
                        ok: "Ok"
                    }
                })
            }


            console.log('Data Inicial: ' + DataInicial);
            console.log('Data Final: ' + DataFinal);
            console.log('Hora Inicial: ' + HoraInicial);
            console.log('Hora Final: ' + HoraFinal);


            if ((HoraFinal < HoraInicial) && (DataInicial === DataFinal)) {
                $("#txtHoraFinal").val('');
                swal({
                    title: "Erro na Hora",
                    text: "A hora final deve ser maior que a inicial!",
                    icon: "error",
                    buttons: true,
                    dangerMode: true,
                    buttons: {
                        ok: "Ok"
                    }
                })

            }
        });

        //Verifica se KM Final é menor que KM Inicial
        $("#txtKmFinal").focusout(function () {

            kmInicial = parseInt($("#txtKmInicial").val());
            kmFinal = parseInt($("#txtKmFinal").val());

            if (kmFinal < kmInicial) {
                $("#txtKmFinal").val('');
                swal({
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
                swal({
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

        // Botão Fechar do Modal
        //=============================
        $("#btnFechar").click(function (e) {
            $("div").removeClass("modal-backdrop");
            $('body').removeClass('modal-open');
        });

        // Botão FinazarViagem do Modal
        //=============================
        $("#btnFinalizarViagem").click(async function (e) {

            e.preventDefault();

            DataFinal = $("#txtDataFinal").val();

            if (DataFinal === '') {
                swal({
                    title: "Erro na Data",
                    text: "A data final é obrigatória!",
                    icon: "error",
                    buttons: true,
                    dangerMode: true,
                    buttons: {
                        ok: "Ok"
                    }
                })
                return;
            }

            const datasOk = await validarDatasSimples();
            if (!datasOk) return;

            HoraFinal = $("#txtHoraFinal").val();

            if (HoraFinal === '') {
                swal({
                    title: "Erro na Hora",
                    text: "A hora final é obrigatória!",
                    icon: "error",
                    buttons: true,
                    dangerMode: true,
                    buttons: {
                        ok: "Ok"
                    }
                })
                return;
            }

            KmFinal = $("#txtKmFinal").val();

            if (KmFinal === '') {
                swal({
                    title: "Erro na Quilometragem",
                    text: "A quilometragem final é obrigatória!",
                    icon: "error",
                    buttons: true,
                    dangerMode: true,
                    buttons: {
                        ok: "Ok"
                    }
                })
                return;
            }

            const kmOk = await validarKmSimples();
            if (!kmOk) return;

            var niveis = document.getElementById('ddtCombustivelFinal').ej2_instances[0];
            if ((niveis.value === null)) {
                swal({
                    title: 'Atenção',
                    text: "O nível final de combustível é obrigatório!",
                    icon: "error",
                    buttons: true,
                    dangerMode: true,
                    buttons: {
                        close: "Fechar",
                    }
                });
                return
            };
            var nivelcombustivel = niveis.value.toString();

            var descricaoOcorrencia = document.getElementById('rteOcorrencias').ej2_instances[0];

            if (descricaoOcorrencia.value != null && descricaoOcorrencia.value != '') {
                if ($('#txtResumo').val() === '' || $('#txtResumo').val() === null) {
                    swal({
                        title: 'Atenção',
                        text: "O Resumo da Ocorrência deve ser preenchido junto com a Descrição!",
                        icon: "error",
                        buttons: true,
                        dangerMode: true,
                        buttons: {
                            close: "Fechar",
                        }
                    });
                    return
                }
            }

            if ((descricaoOcorrencia.value != null && descricaoOcorrencia.value != '') || (ImagemSelecionada != null && ImagemSelecionada != '')) {
                if ($('#txtResumo').val() === '' || $('#txtResumo').val() === null) {
                    swal({
                        title: 'Atenção',
                        text: "O Resumo da Ocorrência deve ser preenchido junto com a Descrição/Imagem!",
                        icon: "error",
                        buttons: true,
                        dangerMode: true,
                        buttons: {
                            close: "Fechar",
                        }
                    });
                    return
                }
            }


            if ($('#chkStatusDocumento').prop('checked')) {
                var statusDocumento = "Entregue";
            }
            else {
                var statusDocumento = "Ausente";
            }

            if ($('#chkStatusCartaoAbastecimento').prop('checked')) {
                var statusCartaoAbastecimento = "Entregue";
            }
            else {
                var statusCartaoAbastecimento = "Ausente";
            }

            var descricao = document.getElementById('rteDescricao').ej2_instances[0];

            //var ImagemOcorrencia = $('input[type=file]').val().replace(/C:\\fakepath\\/i, '');

            var objViagem = JSON.stringify({ "ViagemId": $('#txtId').val(), "DataFinal": $('#txtDataFinal').val(), "HoraFim": $('#txtHoraFinal').val(), "KmFinal": $('#txtKmFinal').val(), "CombustivelFinal": nivelcombustivel, "ResumoOcorrencia": $('#txtResumo').val(), "DescricaoOcorrencia": descricaoOcorrencia.value, "StatusDocumento": statusDocumento, "StatusCartaoAbastecimento": statusCartaoAbastecimento, "Descricao": descricao.value, "ImagemOcorrencia": ImagemSelecionada })

            //debugger;

            $.ajax({
                type: "post",
                url: "/api/Viagem/FinalizaViagem",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: objViagem,

                success: function (data) {
                    toastr.success(data.message);
                    $('#tblViagem').DataTable().ajax.reload(null, false);
                    $("#modalFinalizaViagem").hide();
                    $("div").removeClass("modal-backdrop");
                    $('body').removeClass('modal-open');
                    //location.reload();
                },
                error: function (data) {
                    alert('error');
                    console.log(data);
                }
            });

            $('body').removeClass('modal-open');

        });


        //Função necessária para o RTE
        function toolbarClick(e) {
            if (e.item.id == "rte_toolbar_Image") {
                var element = document.getElementById('rte_upload')
                element.ej2_instances[0].uploading = function upload(args) {
                    args.currentRequest.setRequestHeader('XSRF-TOKEN', document.getElementsByName('__RequestVerificationToken')[0].value);
                }
            }
        }

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

        function ListaTodasViagens() {

            //------ Aciona o Loading Spinner ------------------
            //==================================================
            $('#divViagens').LoadingScript('method_12', {
                'background_image': 'img/loading7.png',
                'main_width': 200,
                'animation_speed': 10,
                'additional_style': '',
                'after_element': false
            });



            //----- Pega Os Filtros ------------------------
            //==================================================
            var veiculoId = "";
            var veiculos = document.getElementById('lstVeiculos').ej2_instances[0];
            if (veiculos.value != null) {
                veiculoId = veiculos.value
            }

            var setorId = "";
            var setores = document.getElementById('ddtSetor').ej2_instances[0];
            if (setores.value != null || setores.value === '') {
                setorId = setores.value[0]
            }

            var motoristaId = "";
            var motoristas = document.getElementById('lstMotorista').ej2_instances[0];
            if (motoristas.value != null) {
                motoristaId = motoristas.value
            }

			var eventoId = "";
			var eventos = document.getElementById('lstEventos').ej2_instances[0];
			if (eventos.value != null) {
				eventoId = eventos.value
			}

			//debugger;

            var status = document.getElementById('lstStatus').ej2_instances[0];

            //debugger;

            if (status.value === "" || status.value === null) {
				if ((motoristas.value != null || setores.value != null || veiculos.value != null || eventos.value != null || $('#txtData').val() != null)) {
                    var statusId = "Todas";
                }
            }

			if (motoristas.value == null && setores.value == null && veiculos.value == null && eventos.value == null && ($('#txtData').val() === null || $('#txtData').val() === "")) {
                if (status.value != null) {
                    var statusId = status.value;
                }
                else {
                    var statusId = "Aberta";
                }
            }

            //debugger;

            var date = $('#txtData').val().split("-");
            console.log(date, $('#txtData').val())
            day = date[2];
            month = date[1];
            year = date[0];
            var dataViagem = (day + "/" + month + "/" + year);

            URLapi = "/api/viagem"

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
                    {
                        "targets": 21, //Imagem Ocorrência
                        "className": "text-center",
                        "visible": false,
                    },
                ],
                responsive: true,
                "ajax": {
                    "url": URLapi,
                    "type": "GET",
                    "data": { veiculoId: veiculoId, motoristaId: motoristaId, setorId: setorId, statusId: statusId, dataviagem: dataViagem, eventoId: eventoId },
                    "datatype": "json"
                },
                //"deferRender": true,
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
                                return '<a href="javascript:void" class="updateStatusViagem btn btn-success btn-xs text-white" data-url="/api/Viagem/updateStatusViagem?Id=' + row.viagemId + '">Aberta</a>';
                            else
                                if (row.status === "Realizada")
                                    return '<a href="javascript:void" class="updateStatusViagem btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Viagem/updateStatusViagem?Id=' + row.viagemId + '">Realizada</a>';
                                else
                                    return '<a href="javascript:void" class="updateStatusViagem btn btn-danger btn-xs text-white text-bold" data-url="/api/Viagem/updateStatusViagem?Id=' + row.viagemId + '">Cancelada</a>';
                        }
                    },
                    {
                        "data": "viagemId",
                        "render": function (data) {
                            return `<div class="text-center">
                                                                                                                <a href="/Viagens/Upsert?id=${data}" class="btn btn-primary btn-xs text-white" aria-label="Editar a Viagem!" data-microtip-position="top" role="tooltip"  style="cursor:pointer;">
                                                                                                                    <i class="far fa-edit"></i>
                                                                                                                </a>
                                                                                                                <a class="btn btn-xs text-white fundo-laranja"  data-toggle="modal" data-target="#modalFinalizaViagem" id="btnFinalizar" aria-label="Finaliza a Viagem!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
                                                                                                                    <i class="fal fa-flag-checkered"></i>
                                                                                                                </a>
                                                                                                                <a class="btn btn-cancelar btn-danger btn-xs text-white" aria-label="Cancelar a Viagem!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
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
                        render: function (data, type, row, meta) {
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
                    { "data": "imagemOcorrencia" },
                ],
                "language": {
                    "emptyTable": "Nenhum registro encontrado",
                    "info": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
                    "infoEmpty": "Mostrando 0 até 0 de 0 registros",
                    "infoFiltered": "(Filtrados de _MAX_ registros)",
                    "infoThousands": ".",
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

        }









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
                            $('#imgViewer').attr('src', "/Images/FichaEmBranco.jpg");
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
            $("#imgViewer").attr("src", window.URL.createObjectURL(files[0]));
            $("#painelfundo").css({
                "padding-bottom:": "200px"
            });
        });


        //Grava a Foto Carregada no Modal
        //================================
        $("#btnAdicionarFicha").click(function () {

            viagemid = document.getElementById("txtViagemId").value;

            var files = $('#txtFile').prop("files");
            var url = "api/Viagem/MyUploader";
            formData = new FormData();
            formData.set("ViagemId", viagemid);
            formData.set("MyUploader", files[0]);

            jQuery.ajax({
                type: 'POST',
                url: url,
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                success: function (repo) {
                    if (repo.status == "success") {
                        toastr.success("Ficha de Vistoria Inserida com Sucesso");
                        console.log("Response: " + response);
                        $("#modalFicha").hide();
                        $("#btnFecharModal").click()
                    }
                },
                error: function () {
                    alert("Error occurs");
                }
            });
            $("#modalFicha").hide();
            $("#btnFecharModal").click()

        });

    $('#modalPrint').on('shown.bs.modal', function (event) {

        var RowNumber = $(event.relatedTarget).closest("tr").find("td:eq(9)").text() - 1;

        console.log("Row Number: " + RowNumber);

        var data = $('#tblViagem').DataTable().row(RowNumber).data();

        var noFichaVistoria = data['noFichaVistoria'];

        console.log("Check data" + noFichaVistoria);

        $("#reportViewer1")
            .telerik_ReportViewer({
                serviceUrl: "/api/reports/",
                reportSource: {
                    report: 'Viagem.trdp',
                    parameters: { NoFichaVistoria: noFichaVistoria.toString() }

                },
                viewMode: telerikReportViewer.ViewModes.PRINT_PREVIEW,
                scaleMode: telerikReportViewer.ScaleModes.SPECIFIC,
                scale: 1.0,
                enableAccessibility: false,
                sendEmail: { enabled: true }
            });

        //var reportViewer = document.getElementById('#reportViewer1');

        //// Set the parameter value
        //reportViewer.setParameters({ 'NoFichaVistoria': noFichaVistoria });

        //// Refresh the report to apply the parameter value
        //reportViewer.refreshReport();


    }).on("hide.bs.modal", function (event) {

        //Remove a DIV para excluir o Report escolhido anteriormente
        $("#reportViewer1").remove();
        //$("#reportViewer1").data("telerik_ReportViewer");
        //reportViewer.clearReportSource();
        //location.reload();

        //Cria DIV do Report
        $("#ReportContainer").append("<div id='reportViewer1' style='width:100%' class='pb-3'> Carregando... </div>");

        var modal = document.getElementById("modalPrint"); // Replace "myModal" with the actual ID of your modal

        // To show the modal
        modal.style.display = "block";
        modal.style.opacity = "1";

    });;


//Carrega a foto da Ocorrência no controle e redimensiona o painel
//================================================================
$("#txtFileOcorrencia").change(function (event) {
    var files = event.target.files;
    $("#imgViewerItem").attr("src", window.URL.createObjectURL(files[0]));
    $("#painelfundo").css({
        "padding-bottom:": "200px"
    });
});



        var ImagemSelecionada = "";

        //Desabilita o Drop Zone
        kendo.ui.Upload.fn._supportsDrop = function () { return false; }

        $("#txtFileItem").kendoUpload({
            async: {
            saveUrl: "/Uploads/UploadPDF?handler=SaveIMGManutencao",
        removeUrl: "/Uploads/UploadPDF?handler=RemoveIMGManutencao"
            },
        localization: {
            select: "Selecione a imagem do Item...",
        headerStatusUploaded: "Arquivo Carregado",
        uploadSuccess: "Arquivo Carregado com Sucesso"
            },
        validation: {
            allowedExtensions: [".jpg"],
            },
        success: onSuccess
        });

        function onSuccess(e) {

            var files = e.files;

        ImagemSelecionada = files[0].name;
        $('#imgViewerItem').attr('src', "/DadosEditaveis/ImagensOcorrencias/" + files[0].name);
            //debugger;

        }


async function validarDatasSimples() {
    const dataInicialStr = $("#txtDataInicial").val();
    const dataFinalInput = $("#txtDataFinal");
    const dataFinalStr = dataFinalInput.val();

    if (dataInicialStr === '') {
        await swal({
            title: "Erro na Data",
            text: "A data inicial é obrigatória!",
            icon: "error",
            buttons: {
                ok: "Ok"
            },
            dangerMode: true
        });
        return false;
    }

    if (dataInicialStr !== '' && dataFinalStr !== '') {
        const dtInicial = parseDate(dataInicialStr);
        const dtFinal = parseDate(dataFinalStr);

        if (!dtInicial || !dtFinal) {
            await swal({
                title: "Erro na Data",
                text: "Formato de data inválido!",
                icon: "error",
                buttons: {
                    ok: "Ok"
                }
            });
            return false;
        }

        dtInicial.setHours(0, 0, 0, 0);
        dtFinal.setHours(0, 0, 0, 0);

        const diferencaDias = (dtFinal - dtInicial) / (1000 * 60 * 60 * 24);

        if (diferencaDias >= 5) {
            const confirmado = await swal({
                title: "Presta Atenção",
                text: "A data final está 5 dias ou mais depois da data inicial. Tem certeza?",
                icon: "warning",
                buttons: {
                    confirm: {
                        text: "Tem certeza?",
                        value: true,
                        visible: true,
                        className: "btn-confirm"
                    },
                    cancel: {
                        text: "Me enganei!",
                        value: false,
                        visible: true,
                        className: "btn-cancel"
                    }
                }
            });

            if (!confirmado) {
                dataFinalInput.val('').focus();
                return false;
            }
        }
    }

    return true;
}

async function validarKmSimples() {
    const kmInicialInput = $("#txtKmInicial");
    const kmFinalInput = $("#txtKmFinal");

    const kmInicial = kmInicialInput.val();
    const kmFinal = kmFinalInput.val();

    if (kmInicial === "") {
        await swal({
            title: "Informação Ausente",
            text: "A Quilometragem Inicial é obrigatória",
            icon: "error",
            buttons: {
                ok: "Ok"
            },
            dangerMode: true
        });
        return false;
    }

    if (kmFinal !== "") {
        const inicial = parseFloat(kmInicial.replace(",", "."));
        const final = parseFloat(kmFinal.replace(",", "."));

        if (!isNaN(inicial) && !isNaN(final)) {
            const diferenca = final - inicial;

            if (diferenca >= 100) {
                const confirmado = await swal({
                    title: "Presta Atenção",
                    text: "A quilometragem final está 100 km ou mais acima da inicial. Tem certeza?",
                    icon: "warning",
                    buttons: {
                        confirm: {
                            text: "Tem certeza?",
                            value: true,
                            visible: true,
                            className: "btn-confirm"
                        },
                        cancel: {
                            text: "Me enganei!",
                            value: false,
                            visible: true,
                            className: "btn-cancel"
                        }
                    }
                });

                if (!confirmado) {
                    kmFinalInput.val("").focus();
                    return false;
                }
            }
        }
    }

    return true;
}

function parseDate(d) {
    if (!d) return null;

    // Se vier no formato "dd/MM/yyyy"
    if (d.includes("/")) {
        const [dia, mes, ano] = d.split("/");
        return new Date(ano, mes - 1, dia);
    }

    // Se vier no formato "yyyy-MM-dd"
    if (d.includes("-")) {
        const [ano, mes, dia] = d.split("-");
        return new Date(ano, mes - 1, dia);
    }

    return null; // formato desconhecido
}
