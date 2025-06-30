/*Anotações sobre a página:
A página está sendo usada tanto para o Index quanto para o upsert, pra fazer essa divisão eu peguei o caminho dela e comparei para saber para onde lançar
No final da página tem algumas funções que tiveram que ficar fora do bloco porque o razorPages procurava essa função antes do DOM carregar e saber para qual bloco mandar
E*/
var IndexOuUpsert = 0;
var path = window.location.pathname.toLowerCase();
console.log(path);

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


//Eu não sei porque mas as vezes ele manda para a URL patrimonio só ao invés de patrimonio/index, coloquei isso aqui para ele continuar funcionando
if (path == "/patrimonio/index" || path == "/patrimonio") {
    console.log("Entrou na primeira");

    $(document).ready(function () {
        loadGrid();
    });

    function loadGrid() {
        console.log("Entrou na loadlist");
        dataTable = $('#tblPatrimonio').DataTable({

            'columnDefs': [
                {
                    "targets": 0,                //NPR
                    "className": "text-center",
                    "width": "6%",
                },
                {
                    "targets": 1,               //MARCA
                    "className": "text-left",
                    "width": "10%",
                    "defaultContent": "Não informado",
                },
                {
                    "targets": 2,               //MODELO
                    "className": "text-left",
                    "width": "10%",
                    "defaultContent": "Não informado",
                },
                {
                    "targets": 3,               //DESCRICAO
                    "className": "text-left",
                    "width": "10%",
                    "defaultContent": "Não informado",
                },
                {
                    "targets": 4,               //SETOR ATUAL
                    "className": "text-left",
                    "width": "10%",
                },
                {
                    "targets": 5,               //SECAO ATUAL
                    "className": "text-left",
                    "width": "10%",
                },
                {
                    "targets": 6,               //Status
                    "className": "text-center",
                    "width": "8%",
                    "defaultContent": "Não informado",
                },
                {
                    "targets": 7,               //Ação 
                    "className": "text-center",
                    "width": "8%",
                }
            ],
            responsive: true,
            "ajax": {
                "url": "/api/Patrimonio",
                "type": "GET",
                "datatype": "json",
                "error": function (xhr, status, error) {
                    console.error("Erro ao carregar os dados:", error);
                }
            },
            "columns": [
                { "data": "npr" },
                { "data": "marca" },
                { "data": "modelo" },
                { "data": "descricao" },
                { "data": "nomeSetor" },
                { "data": "nomeSecao" },
                {
                    "data": "status",
                    "render": function (data, type, row, meta) {
                        if (data)
                            return '<a href="javascript:void" class="updateStatusPatrimomonio btn btn-success btn-xs text-white" data-url="/api/Patrimomio/UpdateStatus?Id=' + row.unidadeId + '">Ativo</a>';
                        else
                            return '<a href="javascript:void" class="updateStatusPatrimomonio btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Patrimomio/UpdateStatus?Id=' + row.unidadeId + '">Baixado</a>';
                    },
                    "width": "6%"
                },
                {
                    "data": "patrimonioId",

                    "render": function (data) {
                        return `<div class="text-center">
                                <a href="/Patrimonio/Upsert?id=${data}" class="btn btn-primary btn-xs text-white"  aria-label="Editar o patrimônio!" data-microtip-position="top" role="tooltip"  style="cursor:pointer;">
                                    <i class="far fa-edit"></i> 
                                </a>                               
                                <a class="btn-delete btn btn-danger btn-xs text-white"   aria-label="Excluir o patrimônio!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>
                                <a href="/Patrimonio/VisualizarMovimentacoes?id=${data}" class="btn btn-secondary btn-xs text-white"  aria-label="Visualizar movimentações" data-microtip-position="top" role="tooltip"  style="cursor:pointer;">
                                    <i class="fa-solid fa-arrow-up-arrow-down"></i> 
                                </a>    

                    </div>`;
                    },
                },


            ],
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                "emptyTable": "Sem Dados para Exibição"
            },
            "width": "100%"
        });
        console.log("Saiu da Load");

    }
} else if (path == "/patrimonio/upsert") {
    var edicao = false;

    var filesName = [];

    // Triggered when files are selected
    function onFileSelect(args) {
        console.log("Selected files:", args.filesData);
        var validFiles = validateFiles(args, []);
        if (validFiles.length > 0) {
            for (var i = 0; i < validFiles.length; i++) {
                // Render selected file preview
                readURL(validFiles[i]);
            }
        }
    }

    // Triggered when files are removed
    function onFileRemove(args) {
        console.log("File removed:", args);
        args.postRawFile = false;
    }

    // Read and display the selected image
    function readURL(file) {
        var preview = document.getElementById("previewImage");
        var reader = new FileReader();
        reader.onload = function () {
            preview.src = reader.result; // Set the image source to the file content
            preview.style.display = "block"; // Make the image visible
        };
        if (file.rawFile) {
            reader.readAsDataURL(file.rawFile); // Convert the file to Data URL
        }
    }

    // Validate the selected files
    function validateFiles(args, existingFiles) {
        var validFiles = [];
        var allImages = ["jpg", "jpeg", "png"];
        for (var i = 0; i < args.filesData.length; i++) {
            var file = args.filesData[i];
            if (allImages.indexOf(file.type) !== -1 && filesName.indexOf(file.name) === -1) {
                filesName.push(file.name);
                validFiles.push(file);
            } else {
                console.warn("Invalid file type or duplicate file:", file.name);
            }
        }
        return validFiles;
    }

    $(document).ready(function () {

    //    loadListaSetores();
    //    loadListaMarcas();


    //    var PatrimonioId = document.getElementsByName('PatrimonioObj.PatrimonioId'); //Pega o Id do campo que só existe caso seja uma edição

    //    if (PatrimonioId.length > 0) { // Verifica se o tamanho é maior que 0 para saber ele não está vazio ou nulo
    //        edicao = true;
    //        var currentSetorId = document.getElementsByName('PatrimonioObj.PatrimonioId');
    //        document.getElementById("cmbMarcas").ej2_instances[0].value = [document.getElementById('MarcaId').value];
    //        document.getElementById("cmbSetores").ej2_instances[0].value = [document.getElementById('SetorId').value];
    //    } else {
    //        document.getElementById("divSecao").style.display = "none"; //Esconde a div da seção
    //    }
        //    valida();

        //loadListaMarcas();

        //var marcaAtual = document.getElementById("MarcaId").value;
        //var modeloAtual = document.getElementById("ModeloId").value;

        //var comboBoxMarcas = document.getElementById("cmbMarcas").ej2_instances[0];
        //var comboBoxModelos = document.getElementById("cmbModelos").ej2_instances[0];

        //// Define a marca e carrega os modelos relacionados
        //if (marcaAtual)
        //{
        //    comboBoxMarcas.value = marcaAtual;
        //    loadListaModelos(marcaAtual, modeloAtual);
        //}

        //comboBoxMarcas.addEventListener("change", function (args)
        //{
        //    var marcaSelecionada = args.value;
        //    loadListaModelos(marcaSelecionada);
        //});

    });


    function valida() {
        $(formsPatrimonio).on("submit", function (event) { //Verificase o nome está preenchido
            var NPR = document.getElementsByName('PatrimonioObj.Patrimonio.NPR')[0].value;
            var situacao = document.getElementsByName('PatrimonioObj.Patrimonio.Situacao')[0].value;
            if (!edicao) {
                var setorId = document.getElementById("cmbSetores").ej2_instances[0].value;
                var secaoId = document.getElementById("cmbSecoes").ej2_instances[0].value;
            } else { //~Caso seja uma edição o valor vai vir do input hidden e não da comboBox
                var setorId = document.getElementById("SetorId");
                var secaoId = document.getElementById("SecaoId");
            }


            if (NPR === "") {
                event.preventDefault(); //Isso aqui impede a página de ser recarregada
                swal({
                    title: "Erro no NPR",
                    text: "O NPR não pode estar em branco!",
                    icon: "error",
                    buttons: true,
                    
                    buttons: {
                        ok: "Ok"
                    }
                })
            }
            if (setorId === "" || setorId == null) {
                event.preventDefault(); //Isso aqui impede a página de ser recarregada
                swal({
                    title: "Erro no setor",
                    text: "O setor não pode estar em branco!",
                    icon: "error",
                    buttons: true,
                    
                    buttons: {
                        ok: "Ok"
                    }
                })
            }
            if (secaoId === "" || secaoId == null) {
                event.preventDefault(); //Isso aqui impede a página de ser recarregada
                swal({
                    title: "Erro na seção",
                    text: "A seção não pode estar em branco!",
                    icon: "error",
                    buttons: true,
                    
                    buttons: {
                        ok: "Ok"
                    }
                })
            }

        });
    }

    // Carregar lista de Setores
    // Load Setores and assign selected value
    // Revised loadListaSetores: simply load and bind the data
    function loadListaSetores()
    {
        var comboBoxSetores = document.getElementById("cmbSetores")?.ej2_instances[0];

        //if (!comboBoxSetores)
        //{
        //    console.error("ComboBox de Setores não encontrada.");
        //    return;
        //}

        $.ajax({
            type: "GET",
            url: "/api/Patrimonio/ListaSetores",
            success: function (res)
            {
                console.log("Setores carregados:", res);
                if (res && res.data.length > 0)
                {
                    comboBoxSetores.fields = { text: "text", value: "value" };
                    comboBoxSetores.dataSource = res.data;
                    comboBoxSetores.dataBind();
                } else
                {
                    console.warn("Nenhum setor encontrado.");
                }
            },
            error: function (error)
            {
                console.error("Erro ao carregar setores:", error);
            }
        });
    }


    // Carregar lista de Marcas
    function loadListaMarcas()
    {
        var comboBox = document.getElementById("cmbMarcas")?.ej2_instances[0];

        //if (!comboBox)
        //{
        //    console.error("ComboBox de Marcas não encontrado.");
        //    return;
        //}

        $.ajax({
            type: "GET",
            url: "/api/Patrimonio/ListaMarcas",
            success: function (res)
            {
                if (res && res.data.length > 0)
                {
                    comboBox.fields = { text: "text", value: "value" };
                    comboBox.dataSource = res.data;
                    comboBox.dataBind();
                } else
                {
                    console.warn("Nenhuma marca encontrada.");
                }
            },
            error: function (error)
            {
                console.error("Erro ao carregar marcas:", error);
            }
        });
    }

    function onMarcaChange(args)
    {
        var comboBoxModelos = document.getElementById("cmbModelos").ej2_instances[0];
        var marcaSelecionada = args.value;
        console.log("Marca selecionada:", marcaSelecionada);
        if (marcaSelecionada != null)
        {
            $.ajax({
                type: "GET",
                url: "/api/Patrimonio/ListaModelos",
                data: { marca: marcaSelecionada },
                success: function (data)
                {
                    console.log("Resposta do ListaModelos:", data);
                    if (data && data.data && data.data.length > 0)
                    {
                        // Configura os campos do ComboBox
                        comboBoxModelos.fields = { text: "text", value: "value" };
                        comboBoxModelos.dataSource = data.data;

                        // Utilize o evento dataBound para definir o valor assim que os dados forem renderizados
                        comboBoxModelos.dataBound = function ()
                        {
                            var modeloAtualElement = document.getElementById('ModeloId');
                            if (modeloAtualElement)
                            {
                                var modeloAtual = modeloAtualElement.value;
                                comboBoxModelos.value = modeloAtual;
                                console.log("Modelo definido (dataBound):", modeloAtual);
                            } else
                            {
                                console.warn("Elemento com id 'ModeloId' não foi encontrado.");
                            }
                        };
                        comboBoxModelos.dataBind();
                    } else
                    {
                        console.log("Nenhum modelo encontrado para a marca:", marcaSelecionada);
                        comboBoxModelos.dataSource = [];
                        comboBoxModelos.value = null;
                        comboBoxModelos.dataBind();
                    }
                },
                error: function (error)
                {
                    console.log("Erro na requisição de modelos:", error);
                }
            });
        }
    }

    function onSetorChange(args)
    {

        var comboBoxSecoes = document.getElementById("cmbSecoes").ej2_instances[0];

        var setorSelecionado = args.value;

        console.log("Setor selecionado:", setorSelecionada);

        document.getElementById("divSecao").style.display = "block";

        if (setorSelecionado != null)
        {
            $.ajax({
                type: "GET",
                url: "/api/Patrimonio/ListaSecoes",
                data: { setorId: setorSelecionado},
                success: function (data)
                {
                    console.log("Resposta do ListaSecoes:", data);
                    if (data && data.data && data.data.length > 0)
                    {
                        // Configura os campos do ComboBox
                        comboBoxSecoes.fields = { text: "text", value: "value" };
                        comboBoxSecoes.dataSource = data.data;

                        // Utilize o evento dataBound para definir o valor assim que os dados forem renderizados
                        comboBoxSecoes.dataBound = function ()
                        {
                            var secaoAtualElement = document.getElementById('SecaoId');
                            if (secaoAtualElement)
                            {
                                var secaoAtual = secaoAtualElement.value;
                                comboBoxSecoes.value = secaoAtual;
                                console.log("Seção definida (dataBound):", secaoAtual);
                            } else
                            {
                                console.warn("Elemento com id 'SecaoId' não foi encontrado.");
                            }
                        };
                        comboBoxSecoes.dataBind();
                    } else
                    {
                        console.log("Nenhuma seção encontrada para o setor:", setorSelecionado);
                        comboBoxSecoes.dataSource = [];
                        comboBoxSecoes.value = null;
                        comboBoxSecoes.dataBind();
                    }
                },
                error: function (error)
                {
                    console.log("Erro na requisição de seções:", error);
                }
            });
        }

        //function loadListaSecoes(setorSelecionado) {
        //    var comboBox = document.getElementById("cmbSecoes").ej2_instances[0];
        //    comboBox.value = null; // Reseta o valor da ComboBox
        //    $.ajax({
        //        type: "get",
        //        url: "/api/Secao/ListaSecoes",
        //        data: { setorSelecionado: setorSelecionado },
        //        success: function (res) {
        //            if (res != null && res.data.length) {
        //                // Separar o texto em Nome/Id e criar uma nova lista com apenas o Nome
        //                var processedData = res.data.map(function (item) {
        //                    var nome = item.text.split('/')[0]; // Extrair o Nome
        //                    return {
        //                        text: nome, // Atualizar o campo text com apenas o Nome
        //                        value: item.value
        //                    };
        //                });

        //                // Inicialize o ComboBox da Syncfusion


        //                comboBox.fields = { text: "text", value: "value" };
        //                comboBox.dataSource = processedData; // Defina o dataSource com os dados processados
        //                comboBox.dataBind();
        //                comboBox.removeEventListener('change', onSecaoChange);
        //                comboBox.addEventListener('change', onSecaoChange);

        //            } else {
        //                // 2) Limpa o dataSource
        //                comboBox.dataSource = [];
        //                comboBox.value = null;
        //                comboBox.dataBind();
        //                comboBox.text = ""; 

        //                console.log("Nenhuma seção encontrada.");
        //            }
        //        },
        //        error: function (error) {
        //            console.log("Erro na requisição: ", error);
        //        }
        //    });

        //}

    //    if (document.getElementById('PatrimonioId') != null) {
    //        document.getElementById('cmbSetores').value = document.getElementById('SetorId').value;
    //    }
    }

    function onSecaoChange(args) {
        var secaoSelecionada = args.value;
        //document.getElementById("SecaoId").value = secaoSelecionada;
    }

    function onMarcaValueChange(args) {
        // Aqui é JavaScript no cliente.
        // Se quiser “pausar” no navegador, use debugger; 
        debugger;

        // Ou, se deseja acionar o servidor, poderia fazer:
        // $.post("/Home/DropDownChanged", { valor: args.value }, function(response) {
        //     // ...
        // });
    }

    document.addEventListener("DOMContentLoaded", function ()
    {
        console.log("Página Upsert carregada!");

        initMarcaModelo();

        initSetorSecao();

        var setorAtual = document.getElementById("SetorId")?.value || "";
        var secaoAtual = document.getElementById("SecaoId")?.value || "";

        if (document.getElementById("SetorId") === null)
        {
            document.getElementById("cmbSetores").ej2_instances[0].text = ""
        }

        if (document.getElementById("SecaoId") === null)
        {
            document.getElementById("cmbSecoes").ej2_instances[0].text = ""
        }

        // Verifica se é um Guid vazio
        const isEmptyGuid = "00000000-0000-0000-0000-000000000000";

        // Seleciona o checkbox pelo ID
        const checkbox = document.getElementById("chkStatus");

        // Se for Guid vazio, marca o checkbox
        if (isEmptyGuid && checkbox)
        {
            checkbox.checked = true;
        }

    });

} else if (path = "/patrimonio/visualizarmovimentacoes") {
    console.log("Tá na visualizarMovimentações");
    var patrimonioId = document.getElementById('patrimonioId').value; //Ta imprimindo certo
    console.log("Id do patrimonio capturado: " + patrimonioId);
    loadGridVisualização(patrimonioId);

    //Função pra deletar o patrimônio
    $(document).ready(function () {

        //Tem que adaptar esse aqui pra patrimônio
        $(document).on('click', '.btn-delete', function () {
            var id = $(this).data('id');
            console.log("Id da movimentação a deletar:" + id);

            swal({
                title: "Você tem certeza que deseja apagar este patrimônio?",
                text: "Não será possível recuperar os dados eliminados!",
                icon: "warning",
                buttons: true,
                
                buttons: {
                    cancel: "Cancelar",
                    confirm: "Excluir"
                }
            }).then((willDelete) => {
                if (willDelete) {
                    var dataToPost = JSON.stringify({ 'MovimentacaoPatrimonioId': id });
                    var url = '/api/Patrimonio/DeleteMovimentacaoPatrimonio';
                    $.ajax({
                        url: url,
                        type: "POST",
                        data: dataToPost,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            if (data.success) {
                                toastr.success(data.message);
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
    });


    function loadGridVisualização(patrimonioId) {
        console.log("Entrou na loadlist");
        dataTable = $('#tblMovimentacaoPatrimonio').DataTable({

            'columnDefs': [
                {
                    "targets": 0,                //DataMovimentacao 
                    "className": "text-center",
                    "width": "10%",
                },
                {
                    "targets": 1,               //NPR 
                    "className": "text-left",
                    "width": "20%",
                },
                {
                    "targets": 2,               //Descrição
                    "className": "text-left",
                    "width": "20%",
                },
                {
                    "targets": 3,               //SetorOrigemNome
                    "className": "text-center",
                    "width": "10%",
                    "defaultContent": "",
                },
                {
                    "targets": 4,               //SecaoOrigemNome
                    "className": "text-center",
                    "width": "10%",
                    "defaultContent": "",
                },
                {
                    "targets": 5,               //SetorDestinoNome
                    "className": "text-center",
                    "width": "10%",
                    "defaultContent": "",
                },
                {
                    "targets": 6,               //SecaoDestinoNome
                    "className": "text-center",
                    "width": "10%",
                },
                {
                    "targets": 7,               //ResponsávelMovimentação
                    "className": "text-right",
                    "width": "10%",
                },
                {
                    "targets": 8,               //Ação
                    "className": "text-center",
                    "width": "10%",
                }
            ],
            responsive: true,
            "ajax": {
                "url": "/api/Patrimonio/MovimentacaoPatrimonioGrid",
                "type": "GET",
                "datatype": "json",
                "data": { patrimonioId: patrimonioId },
                "error": function (xhr, status, error) {
                    console.error("Erro ao carregar os dados:", error);
                },
            },
            "columns": [
                {
                    "data": "dataMovimentacao", // Use raw data for sorting
                    "type": "date",
                    "render": function (data, type, row) {
                        // Only format the data for display (type === 'display')
                        if (type === 'display' && data) {
                            const date = new Date(data);
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = date.getFullYear();
                            return `${day}/${month}/${year}`; // Format as DD/MM/YYYY
                        }
                        return data; // Return raw data for sorting and other operations
                    }
                },
                { "data": "npr" },
                { "data": "descricao" },
                { "data": "setorOrigemNome" },
                { "data": "secaoOrigemNome" },
                { "data": "setorDestinoNome" },
                { "data": "secaoDestinoNome" },
                { "data": "responsavelMovimentacao" },
                {
                    "data": "movimentacaoPatrimonioId",
                    "render": function (data) {
                        return `<div class="text-center">
                                <a class="btn-delete btn btn-danger btn-xs text-white"   aria-label="Excluir movimentação!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>
                    </div>`;
                    },
                },
            ],
            "order": [[0, "desc"]],
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
                "emptyTable": "Sem movimentações encontradas"
            },

            "width": "100%"
        });
        console.log("Saiu da Load");
    }

}

//Tive que colocar aqui fora porque tem que carregar junto com o DOM
function stopEnterSubmitting(e) {
    if (e.keyCode == 13) {
        var src = e.srcElement || e.target;

        console.log(src.tagName.toLowerCase());

        if (src.tagName.toLowerCase() !== "div") {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        }
    }
}


// Carregar lista de Modelos com base na Marca selecionada
function loadListaModelos(marca, modeloAtual = null)
{
    var comboBoxModelos = document.getElementById("cmbModelos")?.ej2_instances[0];

    if (!comboBoxModelos)
    {
        console.error("ComboBox de Modelos não encontrado.");
        return;
    }

    $.ajax({
        type: "GET",
        url: "/api/Patrimonio/ListaModelos",
        data: { marca: marca },
        success: function (res)
        {
            console.log("Modelos carregados para a marca:", marca, res);
            if (res && res.data.length > 0)
            {
                comboBoxModelos.fields = { text: "text", value: "value" };
                comboBoxModelos.dataSource = res.data;

                // Definir o valor correto após os dados serem carregados
                comboBoxModelos.dataBound = function ()
                {
                    if (modeloAtual)
                    {
                        comboBoxModelos.value = modeloAtual;
                        console.log("Modelo definido após carga:", modeloAtual);
                    }
                };

                comboBoxModelos.dataBind();
            } else
            {
                console.warn("Nenhum modelo encontrado para a marca:", marca);
                comboBoxModelos.dataSource = [];
                comboBoxModelos.value = null;
                comboBoxModelos.dataBind();
            }
        },
        error: function (error)
        {
            console.error("Erro ao carregar modelos:", error);
        }
    });
}



function initMarcaModelo()
{
    console.log("Inicializando Marca e Modelo");

    var marcaAtual = document.getElementById("MarcaId")?.value || "";
    var modeloAtual = document.getElementById("ModeloId")?.value || "";

    var comboBoxMarcas = document.getElementById("cmbMarcas")?.ej2_instances[0];
    var comboBoxModelos = document.getElementById("cmbModelos")?.ej2_instances[0];

    if (!comboBoxMarcas || !comboBoxModelos)
    {
        console.error("ComboBoxes de Marcas e Modelos não encontrados.");
        return;
    }

    // Carregar lista de Marcas
    loadListaMarcas();

    if (marcaAtual)
    {
        comboBoxMarcas.value = marcaAtual;

        // Aguarda a carga do cmbMarcas antes de carregar os modelos
        comboBoxMarcas.dataBound = function ()
        {
            console.log("Marca carregada:", comboBoxMarcas.value);
            loadListaModelos(marcaAtual, modeloAtual);
        };
    }

    // Evento para atualizar os modelos ao mudar a marca
    comboBoxMarcas.addEventListener("change", function (args)
    {
        var marcaSelecionada = args.value;
        console.log("Marca alterada:", marcaSelecionada);
        loadListaModelos(marcaSelecionada);
    });
}


// Initialize Setor and Seção ComboBoxes
// Revised initSetorSecao using a similar pattern as initMarcaModelo
function initSetorSecao()
{
    console.log("Inicializando Setor e Seção");

    var setorAtual = document.getElementById("SetorId")?.value || "";
    var secaoAtual = document.getElementById("SecaoId")?.value || "";

    var comboBoxSetores = document.getElementById("cmbSetores")?.ej2_instances[0];
    var comboBoxSecoes = document.getElementById("cmbSecoes")?.ej2_instances[0];

    //if (!comboBoxSetores || !comboBoxSecoes)
    //{
    //    console.error("ComboBoxes de Setores e Seções não encontrados.");
    //    return;
    //}

    // Load setores
    loadListaSetores();

    // If there's a current setor, set its value and use dataBound to load secões
    if (setorAtual)
    {
        comboBoxSetores.value = setorAtual;
        comboBoxSetores.dataBound = function ()
        {
            console.log("Setor carregado:", comboBoxSetores.value);
            loadListaSecoes(setorAtual, secaoAtual);
        };
    }

    // Set up the change event so that if the user changes the setor, secões are reloaded.
    comboBoxSetores.addEventListener("change", function (args)
    {
        var setorSelecionado = args.value;
        console.log("Setor alterado:", setorSelecionado);
        loadListaSecoes(setorSelecionado);
    });
}


// Carregar lista de Seções com base no Setor selecionado
// Load Seções based on selected Setor
function loadListaSecoes(setorId, secaoAtual = null)
{
    var comboBoxSecoes = document.getElementById("cmbSecoes")?.ej2_instances[0];

    //if (!comboBoxSecoes)
    //{
    //    console.error("ComboBox de Seções não encontrada.");
    //    return;
    //}

    $.ajax({
        type: "GET",
        url: "/api/Patrimonio/ListaSecoes",
        data: { setorId: setorId },
        success: function (res)
        {
            console.log("Seções carregadas para o setor:", setorId, res);

            if (res && res.data.length > 0)
            {
                comboBoxSecoes.fields = { text: "text", value: "value" };
                comboBoxSecoes.dataSource = res.data;

                // Definir o valor correto após os dados serem carregados
                comboBoxSecoes.dataBound = function ()
                {
                    if (secaoAtual)
                    {
                        comboBoxSecoes.value = secaoAtual;
                        console.log("Seção definida após carga:", secaoAtual);
                    }
                };

                comboBoxSecoes.dataBind();
            } else
            {
                console.warn("Nenhuma seção encontrada para o setor:", setorId);
                comboBoxSecoes.dataSource = [];
                comboBoxSecoes.value = null;
                comboBoxSecoes.dataBind();
            }
        },
        error: function (error)
        {
            console.error("Erro ao carregar seções:", error);
        }
    });
}