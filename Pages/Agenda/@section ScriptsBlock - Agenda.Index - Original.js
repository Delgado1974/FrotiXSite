@section ScriptsBlock {

	@*<script src="https://code.jquery.com/jquery-3.6.0.js"
        integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk="
        crossorigin="anonymous"></script>*@

	<link href="https://cdn.kendostatic.com/2022.1.412/styles/kendo.default-main.min.css" rel="stylesheet" type="text/css" />
	@*     <script src="https://cdn.kendostatic.com/2022.1.412/js/jquery.min.js"></script> *@
	<script src="https://cdn.kendostatic.com/2022.1.412/js/jszip.min.js"></script>
	<script src="https://cdn.kendostatic.com/2022.1.412/js/kendo.all.min.js"></script>
	<script src="https://cdn.kendostatic.com/2022.1.412/js/kendo.aspnetmvc.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.2.2/pdf.js"></script>
	<script>
		window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.2.2/pdf.worker.js';
	</script>

	<script src="/api/reports/resources/js/telerikReportViewer"></script>

	@*<script src="https://code.jquery.com/jquery-3.5.1.js"></script>*@
	<script src="https://cdn.datatables.net/1.10.25/js/jquery.dataTables.min.js"></script>
	<script src="https://cdn.datatables.net/responsive/2.2.9/js/dataTables.responsive.min.js"></script>

	@* <script src="~/js/formplugins/select2/select2.bundle.js"></script> *@
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr.min.js"></script>
	<script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
	@*<script src="~/lib/fullcalendar/main.js"></script>*@
	@* <script src="~/js/fullcalendar.6.1.8.js"></script> *@

	@* <script src="https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/6.1.10/index.min.js" integrity="sha512-xCMh+IX6X2jqIgak2DBvsP6DNPne/t52lMbAUJSjr3+trFn14zlaryZlBcXbHKw8SbrpS0n3zlqSVmZPITRDSQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script> *@
	<script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.14/index.global.min.js'></script>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/6.1.10/index.global.js" integrity="sha512-zAadCzZHXo/f5A/3uhF50bZXahdYNqisNgKKniyoJJVpp27b2bR82N4hPLGj3/qBEh3tGZ9SYGmSA1jpdtNF5A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

	<script src="~/lib/fullcalendar/locales-all.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.2/moment.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js"></script>
	<script src='https://unpkg.com/popper.js/dist/umd/popper.min.js'></script>
	<script src='https://unpkg.com/tooltip.js/dist/umd/tooltip.min.js'></script>

	@* <script src="/api/reports/resources/js/telerikReportViewer-17.1.23.718.min.js"></script> *@
	<script src="/api/reports/resources/js/telerikReportViewer-18.1.24.514.min.js"></script>
	<script src="/js/cadastros/agendamento_viagem_v152.js"></script>


	<script>

		var defaultRTE;
		var StatusViagem = "Aberta";
		var calendar;
		var InserindoRequisitante = false;
		var CarregandoAgendamento = false;

		$.fn.modal.Constructor.prototype.enforceFocus = function() { };

		function onCreate() {

			defaultRTE = this;

		}


		//Escolheu um Requisitante
		function RequisitanteValueChange() {

			var ddTreeObj = document.getElementById("lstRequisitante").ej2_instances[0];

			if (ddTreeObj.value === null || ddTreeObj.value === '') {
				return;
			}

			var requisitanteid = String(ddTreeObj.value);

			//debugger;

			//Pega Setor Padrão do Requisitante
            $.ajax({
                url: "/Viagens/Upsert?handler=PegaSetor",
                method: "GET",
                datatype: "json",
                data: { id: requisitanteid },
                success: function(res) {
                    document.getElementById("ddtSetor").ej2_instances[0].value = [res.data];
                }
            });

			//Pega Ramal do Requisitante
            $.ajax({
                url: "/Viagens/Upsert?handler=PegaRamal",
                method: "GET",
                datatype: "json",
                data: { id: requisitanteid },
                success: function(res) {
                    var ramal = res.data;
                    var s = document.getElementById("txtRamalRequisitante");
                    s.value = ramal;
                }
            });
        }

		//Escolheu um Motorista
		function MotoristaValueChange() {

			var ddTreeObj = document.getElementById("lstMotorista").ej2_instances[0];

			console.log("Objeto Requisitante: " + ddTreeObj);

			if (ddTreeObj.value === null || ddTreeObj.enabled === false) {
				return;
			}

			var motoristaid = String(ddTreeObj.value);

		}

		//Escolheu um Veículo
		function VeiculoValueChange() {

			var ddTreeObj = document.getElementById("lstVeiculo").ej2_instances[0];

			console.log("Objeto Requisitante: " + ddTreeObj);

			if (ddTreeObj.value === null || ddTreeObj.enabled === false) {
				return;
			}

			var veiculoid = String(ddTreeObj.value);


			//Pega Km Atual do Veículo
			$.ajax({
				url: "/Viagens/Upsert?handler=PegaKmAtualVeiculo",
				method: "GET",
				datatype: "json",
				data: { id: veiculoid },
				success: function(res) {
					var km = res.data;
					var kmAtual = document.getElementById("txtKmAtual");
					kmAtual.value = km;
					//debugger;
				}
			})

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
		$("#btnViagem").click(function(event) {

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
		$("#btnApaga").click(function(event) {

			var viagemId = document.getElementById("txtViagemId").value;
			var rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];

			swal({
				title: "Você tem certeza que deseja apagar este agendamento?",
				text: "Não será possível recuperar os dados eliminados!",
				icon: "warning",
				buttons: true,
				dangerMode: true,
				buttons: {
					cancel: "Desistir",
					confirm: "Apagar"
				}
			}).then((willDelete) => {
				if (willDelete) {

					console.log("viagemId: " + document.getElementById("txtViagemId").value, "descricao: " + rteDescricao.value);

					var objAgendamento = JSON.stringify({ "ViagemId": viagemId, "Descricao": rteDescricao.value })

					$.ajax({
						type: "post",
						url: '/api/Agenda/ApagaAgendamento',
						contentType: "application/json; charset=utf-8",
						dataType: "json",
						data: objAgendamento,
						success: function(data) {
							if (data.success) {
								toastr.success(data.message);
								$("#modalAgendamento").hide();

								$('body').removeClass('modal-open');
								$("body").css("overflow", "auto");

								location.reload();
							}
							else {
								toastr.error(data.message);
							}
						},
						error: function(err) {
							console.log("Erro:  " + err.responseText);
							alert('something went wrong')
						}
					});

				}
			});
		});


		//Controla o Cancelar do Agendamento
		//==================================
		$("#btnCancela").click(function(event) {

			var viagemId = document.getElementById("txtViagemId").value;
			var rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];

			swal({
				title: "Você tem certeza que deseja cancelar este agendamento?",
				text: "Não será possível recuperar os dados eliminados!",
				icon: "warning",
				buttons: true,
				dangerMode: true,
				buttons: {
					cancel: "Desistir",
					confirm: "Cancelar"
				}
			}).then((willDelete) => {
				if (willDelete) {

					console.log("viagemId: " + document.getElementById("txtViagemId").value, "descricao: " + rteDescricao.value);

					var objAgendamento = JSON.stringify({ "ViagemId": viagemId, "Descricao": rteDescricao.value })

					$.ajax({
						type: "post",
						url: '/api/Agenda/CancelaAgendamento',
						contentType: "application/json; charset=utf-8",
						dataType: "json",
						data: objAgendamento,
						success: function(data) {
							if (data.success) {
								toastr.success(data.message);
								$("#modalAgendamento").hide();

								$('body').removeClass('modal-open');
								$("body").css("overflow", "auto");

								location.reload();
							}
							else {
								toastr.error(data.message);
							}
						},
						error: function(err) {
							console.log("Erro:  " + err.responseText);
							alert('something went wrong')
						}
					});

				}
			});
		});


		//Controla o Imprimir do Agendamento
		//==================================
		$("#btnImprime").click(function(event) {

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


		//Funções de Validação do Formulário
		//==================================
		function ValidaCampos(viagemId) {

			console.log("Entrei na validação: " + viagemId);

			if (document.getElementById("txtDataInicial").value === "") {
				swal({
					title: "Informação Ausente",
					text: "A Data Inicial é obrigatória",
					icon: "error",
					buttons: true,
					dangerMode: true,
					buttons: {
						ok: "Ok"
					}
				})
				ValidaCampos === false;
				return false;
			}

			if (document.getElementById("txtHoraInicial").value === "") {
				swal({
					title: "Informação Ausente",
					text: "A Hora Inicial é obrigatória",
					icon: "error",
					buttons: true,
					dangerMode: true,
					buttons: {
						ok: "Ok"
					}
				})
				ValidaCampos === false;
				return false;
			}

			//debugger;

			//var lstFinalidade = document.getElementById("lstFinalidade").ej2_instances[0].value[0];
			if (document.getElementById("lstFinalidade").ej2_instances[0].value === '') {
				swal({
					title: "Informação Ausente",
					text: "A Finalidade é obrigatória",
					icon: "error",
					buttons: true,
					dangerMode: true,
					buttons: {
						ok: "Ok"
					}
				})
				ValidaCampos === false;
				return false;
			}

			if (document.getElementById("txtOrigem").value === "") {
				swal({
					title: "Informação Ausente",
					text: "A Origem é obrigatória",
					icon: "error",
					buttons: true,
					dangerMode: true,
					buttons: {
						ok: "Ok"
					}
				})
				ValidaCampos === false;
				return false;
			}

			//Valida Campos na criação da Viagem
			//===================================
			if (viagemId != null && viagemId != '' && ($("#btnConfirma").text() != 'Edita Agendamento')) {

				console.log("viagemId: " + viagemId);

				console.log("btnConfirma: " + $("#btnConfirma").text());

				if (document.getElementById("txtNoFichaVistoria").value === "") {
					swal({
						title: "Informação Ausente",
						text: "O Nº da Ficha de Vistoria é obrigatório!",
						icon: "error",
						buttons: true,
						dangerMode: true,
						buttons: {
							ok: "Ok"
						}
					})
					ValidaCampos === false;
					return false;
				}

				var lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
				if (lstMotorista.value === null) {
					swal({
						title: "Informação Ausente",
						text: "O Motorista é obrigatório",
						icon: "error",
						buttons: true,
						dangerMode: true,
						buttons: {
							ok: "Ok"
						}
					})
					ValidaCampos === false;
					return false;
				}

				var lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
				if (lstVeiculo.value === null) {
					swal({
						title: "Informação Ausente",
						text: "O Veículo é obrigatório",
						icon: "error",
						buttons: true,
						dangerMode: true,
						buttons: {
							ok: "Ok"
						}
					})
					ValidaCampos === false;
					return false;
				}

				if (document.getElementById("txtKmInicial").value === "") {
					swal({
						title: "Informação Ausente",
						text: "A quilometragem inicial é obrigatória",
						icon: "error",
						buttons: true,
						dangerMode: true,
						buttons: {
							ok: "Ok"
						}
					})
					ValidaCampos === false;
					return false;
				}

				var ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0];
				if (ddtCombustivelInicial.value === "") {
					swal({
						title: "Informação Ausente",
						text: "O Combustível Inicial é obrigatório!",
						icon: "error",
						buttons: true,
						dangerMode: true,
						buttons: {
							ok: "Ok"
						}
					})
					ValidaCampos === false;
					return false;
				}


			}

			var lstRequisitante = document.getElementById("lstRequisitante").ej2_instances[0];
			if (lstRequisitante.value === null || lstRequisitante.value === '') {
				swal({
					title: "Informação Ausente",
					text: "O Requisitante é obrigatório",
					icon: "error",
					buttons: true,
					dangerMode: true,
					buttons: {
						ok: "Ok"
					}
				})
				ValidaCampos === false;
				return false;
			}

			if (document.getElementById("txtRamalRequisitante").value === "") {
				swal({
					title: "Informação Ausente",
					text: "O Ramal do Requisitante é obrigatório",
					icon: "error",
					buttons: true,
					dangerMode: true,
					buttons: {
						ok: "Ok"
					}
				})
				ValidaCampos === false;
				return false;
			}

			var ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
			if (ddtSetor.value === null) {
				swal({
					title: "Informação Ausente",
					text: "O Setor Solicitante é obrigatório",
					icon: "error",
					buttons: true,
					dangerMode: true,
					buttons: {
						ok: "Ok"
					}
				})
				ValidaCampos === false;
				return false;
			}

			var lstFinalidade = document.getElementById("lstFinalidade").ej2_instances[0].value;
			if (document.getElementById("lstFinalidade").ej2_instances[0].value === '') {
				swal({
					title: "Informação Ausente",
					text: "A Finalidade é obrigatória",
					icon: "error",
					buttons: true,
					dangerMode: true,
					buttons: {
						ok: "Ok"
					}
				})
				ValidaCampos === false;
				return false;
			}
			else {
				if (document.getElementById("lstFinalidade").ej2_instances[0].value === 'Evento' && (document.getElementById("lstEventos").ej2_instances[0].value === "" || document.getElementById("lstEventos").ej2_instances[0].value === null)) {
					swal({
						title: "Informação Ausente",
						text: "o nome do evento é obrigatório",
						icon: "error",
						buttons: true,
						dangerMode: true,
						buttons: {
							ok: "Ok"
						}
					})
					ValidaCampos === false;
					return false;
				}
			}

			StatusViagem = "Aberta";

			//Verifica se está finalizando a viagem
			//=====================================
			var ddtCombustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0];


			//if ((document.getElementById("txtDataFinal").value != "") || (document.getElementById("txtHoraFinal").value != "") || (document.getElementById("txtKmFinal").value != "") || (ddtCombustivelFinal.value != "")) {
			//    swal({
			//        title: "Informação Ausente",
			//        text: "Os campos de Data Final, Hora Final, Combustível Final e KM Final devem estar todos preenchidos para que a viagem seja considerada Finalizada",
			//        icon: "error",
			//        buttons: true,
			//        dangerMode: true,
			//        buttons: {
			//            ok: "Ok"
			//        }
			//    })
			//    ValidaCampos === false;
			//    return false;
			//}

			if ((document.getElementById("txtDataInicial").value != "") && (document.getElementById("txtHoraFinal").value != "") && (document.getElementById("txtKmInicial").value != "") && (ddtCombustivelInicial.value != "")) {
				StatusViagem = "Realizada";
			}


			console.log("Terminei Validação!");
			return true;

		}


		//Verifica se Data Final é menor que Data Inicial
		$("#txtDataFinal").focusout(function() {

			DataInicial = $("#txtDataInicial").val();
			DataFinal = $("#txtDataFinal").val();

			if (DataFinal === '') {
				return;
			}

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

			}
		});

		//Verifica se Data Inicial é maior que Data Final
		$("#txtDataInicial").focusout(function() {

			DataInicial = $("#txtDataInicial").val();
			DataFinal = $("#txtDataFinal").val();

			if (DataInicial === '' || DataFinal === '') {
				return;
			}

			if ((DataInicial > DataFinal)) {
				$("#txtDataInicial").val('');
				swal({
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
		$("#txtHoraFinal").focusout(function() {

			HoraInicial = $("#txtHoraInicial").val();
			HoraFinal = $("#txtHoraFinal").val();
			DataInicial = $("#txtDataInicial").val();
			DataFinal = $("#txtDataFinal").val();

			console.log(HoraInicial);
			console.log(HoraFinal);
			console.log(DataFinal);

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
                });
            }

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
                });

            }
		});

		//Verifica se Hora inicial é maior que Hora final
		$("#txtHoraInicial").focusout(function() {

			HoraInicial = $("#txtHoraInicial").val();
			HoraFinal = $("#txtHoraFinal").val();

			console.log(HoraInicial);
			console.log(HoraFinal);

			if (HoraFinal === '') {
				return;
			}

			if (HoraInicial > HoraFinal) {
				$("#txtHoraInicial").val('');
                swal({
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
		$("#txtKmFinal").focusout(function() {

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


		//Verifica se KM Inicial é maior que KM Inicial
		$("#txtKmInicial").focusout(function() {

			kmInicial = parseInt($("#txtKmInicial").val());
			kmFinal = parseInt($("#txtKmFinal").val());

			if (kmInicial > kmFinal) {
				$("#txtKmInicial").val('');
				swal({
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
		$("#txtKmInicial").focusout(function() {

			if ($("#txtKmInicial").val() === '' || $("#txtKmInicial").val() === null) {
				return;
			}

			kmInicial = parseInt($("#txtKmInicial").val());
			kmAtual = parseInt($("#txtKmAtual").val());

			console.log(kmInicial);

			if (kmInicial < kmAtual) {
				$("#txtKmInicial").val('');
				swal({
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
				swal({
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
			success: function(res) {
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
				success: function(res) {

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
				success: function(res) {


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
				swal({
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
				swal({
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
				swal({
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
				swal({
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
				swal({
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
				swal({
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
				swal({
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
		$("#btnInserirRequisitante").click(function(e) {

			// if (InserindoRequisitante) {
			//     return;
			// } else {
			//     InserindoRequisitante = true;
			// }

			e.preventDefault();

			if ($("#txtPonto").val() === "") {
				swal({
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
				swal({
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
				swal({
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
				swal({
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

				success: function(data) {

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
				error: function(data) {
					toastr.error("Já existe um requisitante com este ponto/nome");
					console.log(data);
				}
			});

		});


	</script>

	<script>

		function select(args) {
			//    var ddTreeObj = document.getElementById("ddtree").ej2_instances[0];
			//    console.info(ddTreeObj.value + " - " + ddTreeObj.text);
		}


		function lstFinalidade_Change() {

			if (document.getElementById('lstFinalidade').ej2_instances[0].value[0] === 'Evento') {

				var lstEvento = document.getElementById("lstEventos").ej2_instances[0];
				lstEvento.enabled = true; // To enable
				document.getElementById("btnEvento").style.display = "block";
				$('#btnEvento').removeAttr('hidden');
				$(".esconde-diveventos").show(); /* Use the .show() method to make the div visible */

			}
			else {
				var lstEvento = document.getElementById("lstEventos").ej2_instances[0];
				lstEvento.enabled = false; // To disable
				lstEvento.value = null;
				document.getElementById("btnEvento").style.display = "none";
				$(".esconde-diveventos").hide(); /* Use the .hide() method to make the div invisible */

			}
		}


	</script>

	<script>

		// Using the .click() method
		$(document).ready(function() {


			$("#multiCalendar").kendoMultiViewCalendar({
				selectable: "multiple", // Enable multiple date selection
				views: 2,               // Number of months to display side by side
				change: function() {
					// Retrieve selected dates when selection changes
					var selectedDates = this.value();
					console.log("Selected dates:", selectedDates);
					// You can process the selectedDates array as needed
				}
			});


			$('#btnFecharFicha').click(function() {
				//// This code will execute when the button is clicked
				//console.log("Button clicked!");

				////Remove a DIV para excluir o Report escolhido anteriormente
				//$("#reportViewer1").remove();

				//console.log("Removi a DIV");

				////Cria DIV do Report
				//$("#ReportContainer").append("<div id='reportViewer1' style='width: 100 %' class='pb - 3'>  Carregando... </div >");

				//console.log("Criei a DIV");

				//debugger;

				//var reportViewerContainer = $("#reportViewer1").data("kendoReportViewer");
				//reportViewerContainer.destroy();
				//$("#reportViewer1").empty();

				//$("div").removeClass("modal-backdrop");
				//$('body').removeClass('modal-open');

				//var divToRemove = document.getElementById("reportViewer1");
				//divToRemove.parentNode.removeChild(divToRemove);

				//    var container = document.getElementById("ReportContainer");
				//    var divToRemove = document.getElementById("reportViewer1");

				//    // Check if the div exists before trying to remove it
				//    if (divToRemove) {
				//        // Remove the DIV from its current location
				//        divToRemove.parentNode.removeChild(divToRemove);

				//        // Create a new DIV element
				//        var newDiv = document.createElement("div");
				//        newDiv.id = "reportViewer1";
				//        newDiv.innerHTML = "  Carregando... ";

				//        // Insert the new DIV back into the container
				//        container.appendChild(newDiv);
				//    }

				//var reportViewer = $("#reportViewer1")
				//    .telerik_ReportViewer({
				//        serviceUrl: "/api/reports/",
				//        reportSource: {
				//            report: 'Agendamento.trdp',
				//        },
				//        viewMode: telerikReportViewer.ViewModes.PRINT_PREVIEW,
				//        scaleMode: telerikReportViewer.ScaleModes.SPECIFIC,
				//        scale: 1.0,
				//        enableAccessibility: false,
				//        sendEmail: { enabled: true }
				//    });

				//reportViewer.dispose();

				//// Clear the report viewer HTML content
				//$("#reportViewer1").html("");

				//reportViewer = $("#reportViewer1").telerik_ReportViewer({
				//    serviceUrl: "/api/reports/",
				//    reportSource: {
				//        report: "Agendamento.trdp"
				//    }
				//}).data("telerik_ReportViewer");

				//reportViewer.unbind();

				//// Remove the report viewer from the DOM
				////reportViewer.remove();

				//reportViewer.dispose();

				//// Reset the reportViewer variable
				//reportViewer = null;

				////Remove a DIV para excluir o Report escolhido anteriormente
				//$("#reportViewer1").remove();
				////$("#reportViewer1").data("telerik_ReportViewer");
				////reportViewer.clearReportSource();
				////location.reload();

				////Cria DIV do Report
				//$("#ReportContainer").append("<div id='reportViewer1' style='width:100%' class='pb-3'> Carregando... </div>");

				//var modal = document.getElementById("modalPrint"); // Replace "myModal" with the actual ID of your modal

				//// To show the modal
				//modal.style.display = "block";
				//modal.style.opacity = "1";

				console.log("Passei por todas as tentativas");

			});
		});

		//Escolheu um Requisitante no Evento
		function RequisitanteEventoValueChange() {

			var ddTreeObj = document.getElementById("lstRequisitanteEvento").ej2_instances[0];

			if (ddTreeObj.value === null || ddTreeObj.value === '') {
				return;
			}

			var requisitanteid = String(ddTreeObj.value);

			//debugger;

			//Pega Setor Padrão do Requisitante
			$.ajax({
				url: "/Viagens/Upsert?handler=PegaSetor",
				method: "GET",
				datatype: "json",
				data: { id: requisitanteid },
				success: function(res) {
					document.getElementById("lstSetorRequisitanteEvento").ej2_instances[0].value = [res.data];
				}
			})

		}

	</script>




	<script>
		// JavaScript function to handle DatePicker change event
		function onDateChange(args) {
			var selectedDates = args.model.values;

			// Get the ListBox element
			var listbox = document.getElementById('selectedDates');
			listbox.innerHTML = '';

			// Add each selected date to the ListBox
			selectedDates.forEach(function(date) {
				var li = document.createElement('li');
				li.textContent = new Date(date).toLocaleDateString();
				listbox.appendChild(li);
			});
		}
	</script>


	<script>

		// Esconde o Accordion de Requisitante
		document.getElementById('btnFecharAccordionRequisitante').onclick = function() {
			document.getElementById("accordionRequisitante").style.display = "none"; // Esconde a DIV
		};

		// Esconde o Accordion de Setor
		document.getElementById('btnFecharAccordionSetor').onclick = function() {
			document.getElementById("accordionSetor").style.display = "none"; // Esconde a DIV
		};

		// Esconde o Accordion de Evento
		document.getElementById('btnFecharAccordionEvento').onclick = function() {
			document.getElementById("accordionEvento").style.display = "none"; // Esconde a DIV
		};

	</script>


	<script>
		document.addEventListener("DOMContentLoaded", function() {
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
				showTodayButton: false,
				isMultiSelection: true,
				min: new Date(), // Set minimum selectable date as the current date
				// Set locale to Portuguese (Brazil)
				locale: "pt-BR",
				// Event handler for date selection
				change: function(args) {
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

			calendar.appendTo("#calendario");

			// Function to remove a date
			window.removeDate = function(timestamp) {
				selectedDates = selectedDates.filter((d) => d.Timestamp !== timestamp);
				console.log("Removing date:", selectedDates); // Debugging statement
				listBox.dataSource = selectedDates;
				listBox.dataBind();
				updateBadge();

				// Update Calendar selection
				const calendarObj = document.getElementById("calendario").ej2_instances[0];
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

	</script>

	<script>
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
	</script>


	<script>
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
	</script>


	<script>
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
                change: function(args) {
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

	</script>

    <script>
        document.addEventListener("DOMContentLoaded", function() {
            // Obtendo a data atual
            const hoje = new Date();

            // Inicializando o DatePicker da Syncfusion
            new ej.calendars.DatePicker({
                min: hoje, // Definindo a data mínima como a data atual
                format: 'dd/MM/yyyy'
            }, '#txtFinalRecorrencia');

            // Inicializando o DatePicker da Syncfusion
            new ej.calendars.DatePicker({
                min: hoje, // Definindo a data mínima como a data atual
                format: 'dd/MM/yyyy'
            }, '#txtDataInicial');

			// Inicializando o DatePicker da Syncfusion
			new ej.calendars.DatePicker({
				min: hoje, // Definindo a data mínima como a data atual
                format: 'dd/MM/yyyy'
			}, '#txtDataFinal');

		});

    </script>

}