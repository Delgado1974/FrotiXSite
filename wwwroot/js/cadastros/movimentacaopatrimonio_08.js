var dataTable;


$(document).ready(function () {
    var path = window.location.pathname.toLowerCase();

    if (path == "/movimentacaopatrimonio/index" || path == "/movimentacaopatrimonio") {
        console.log("Entrou no index");

        loadList();

        $(document).on('click', '.btn-delete', function () {
            var id = $(this).data('id');

            swal({
                title: "Você tem certeza que deseja apagar esta movimentação?",
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

        //APARENTEMENTE DESNECESSARIO

        //function loadGridVisualização(patrimonioId) {
        //    dataTable = $('#tblMovimentacaoPatrimonio').DataTable({
        //        //"columnDefs": [
        //        //    {
        //        //        "targets": 0,         
        //        //        "className": "text-center", 
        //        //        "width": "15%",             
        //        //        "render": function (data, type, row) {
        //        //            return row.dataMovimentacaoFormatada || ""; 
        //        //        },
        //        //        "orderData": 1               
        //        //    }
        //        //],
        //        //"order": [[1, "desc"]], 
        //        "responsive": true,
        //        "ajax": {
        //            "url": "/api/Patrimonio/MovimentacaoPatrimonioGrid",
        //            "type": "GET",
        //            "datatype": "json",
        //            "data": { patrimonioId: patrimonioId },
        //            "error": function (xhr, status, error) {
        //                console.error("Erro ao carregar os dados:", error);
        //            },
        //        },
        //        "columns": [
        //            { "data": "dataMovimentacao" },  // Exibe a data formatada
        //            { "data": "npr" },
        //            { "data": "descricao" },
        //            { "data": "secaoOrigemNome" },
        //            { "data": "secaoDestinoNome" },
        //            { "data": "responsavelMovimentacao" },
        //            {
        //                "data": "movimentacaoPatrimonioId",
        //                "render": function (data) {
        //                    return `<div class="text-center">
        //                <a class="btn-delete btn btn-danger btn-xs text-white" aria-label="Excluir movimentação!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
        //                    <i class="far fa-trash-alt"></i>
        //                </a>
        //            </div>`;
        //                },
        //            },
        //        ],
        //        "language": {
        //            "url": "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
        //            "emptyTable": "Sem movimentações encontradas"
        //        },
        //        "width": "100%"
        //    });
        //}




        function loadList() {
            console.log("Entrou na loadlist");
            dataTable = $('#tblMovimentacaoPatrimonio').DataTable({

                'columnDefs': [
                    {
                        "targets": 0,                //DataMovimentacao
                        "className": "text-center",
                        "width": "8%",
                    },
                    {
                        "targets": 1,               //NPR
                        "className": "text-left",
                        "width": "8%",
                    },
                    {
                        "targets": 2,               //Descrição 
                        "className": "text-left",
                        "width": "20%",
                    },
                    {
                        "targets": 3,               //SetorOrigemNome
                        "className": "text-left",
                        "width": "10%",
                        "defaultContent": "",
                    },
                    {
                        "targets": 4,               //SecaoOrigemNome
                        "className": "text-left",
                        "width": "10%",
                        "defaultContent": "",
                    },
                    {
                        "targets": 5,               //SetorDestinoNome
                        "className": "text-left",
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
                        "width": "8%",
                    }
                ],
                responsive: true,
                "ajax": {
                    "url": "/api/Patrimonio/MovimentacaoPatrimonioGrid",
                    "type": "GET",
                    "datatype": "json",
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
                    "emptyTable": "Sem Dados para Exibição"
                },
                "width": "100%",
            });
            console.log("Saiu da Load");

        }
    } else if (path == "/movimentacaopatrimonio/upsert") {
        console.log("Ta na movimentacaopatrmonio/upsert");
        $("#dataMov").val('');
        valida();

        loadListaPatrimonios();

        $(document).ready(function () {
            //Aqui ele pega o valor do campo Id para saber se é edição ou criação
            var movimentacaoPatrimonioId = document.getElementsByName('MovimentacaoPatrimonioObj.MovimentacaoPatrimonioId');
            var edicao = false;

            if (movimentacaoPatrimonioId && movimentacaoPatrimonioId.value) {
                console.log("Valor da movimentacaoPatrimonioId: " + movimentacaoPatrimonioId);
                edicao = true;
            } else {
                console.log("Não é edição");
                //Esconde as Seções 
                // document.getElementById("divSecaoOrigem").style.display = "none";
                document.getElementById("divSecaoDestino").style.display = "none";
            }

            // loadListaSetoresOrigem();
            loadListaSetoresDestino();

        });

        function loadListaPatrimonios() { //Função pra carregar a lista dos patrimonios
            var comboBox = document.getElementById("cmbPatrimonio").ej2_instances[0];
            comboBox.value = "";
            $.ajax({
                type: "get",
                url: "/api/Patrimonio/ListaPatrimonios",
                success: function (res) {
                    if (res != null && res.data.length) {
                        // Inicialize o ComboBox da Syncfusion


                        comboBox.fields = { text: "text", value: "value" };

                        comboBox.dataSource = res.data;

                        comboBox.addEventListener('change', onPatrimonioChange);

                    } else {
                        console.log("Nenhum patrimonio encontrado.");
                    }
                },
                error: function (error) {
                    console.log("Erro ao carregar setores: " + error);
                }
            });
        }

        function onSetorChangeDestino(args) {
            var setorSelecionado = args.value;
            console.log(setorSelecionado);
            document.getElementById("divSecaoDestino").style.display = "block";

            function loadListaSecoes(setorSelecionado) {
                var comboBox = document.getElementById("cmbSecoesDestino").ej2_instances[0];
                comboBox.value = ""; // Reseta o valor da ComboBox
                $.ajax({
                    type: "get",
                    url: "/api/Secao/ListaSecoes",
                    data: { setorSelecionado: setorSelecionado },
                    success: function (res) {
                        if (res != null && res.data.length) {
                            // Separar o texto em Nome/Id e criar uma nova lista com apenas o Nome
                            var processedData = res.data.map(function (item) {
                                var nome = item.text.split('/')[0]; // Extrair o Nome
                                return {
                                    text: nome, // Atualizar o campo text com apenas o Nome
                                    value: item.value
                                };
                            });

                            // Inicialize o ComboBox da Syncfusion


                            comboBox.fields = { text: "text", value: "value" };
                            comboBox.dataSource = processedData; // Defina o dataSource com os dados processados



                            // comboBox.addEventListener('change', onSecaoChange);

                        } else {
                            console.log("Nenhuma seção encontrada.");
                        }
                    },
                    error: function (error) {
                        console.log("Erro na requisição: ", error);
                    }
                });
            }

            loadListaSecoes(setorSelecionado);
            // document.getElementById("SetorId").value = setorSelecionado;
        }

        function loadListaSetoresOrigem() { //Função pra carregar a lista dos setores
            var comboBox = document.getElementById("cmbSetorOrigem").ej2_instances[0];
            comboBox.value = "";
            $.ajax({
                type: "get",
                url: "/api/Setor/ListaSetores",
                success: function (res) {
                    if (res != null && res.data.length) {
                        // Inicialize o ComboBox da Syncfusion


                        comboBox.fields = { text: "text", value: "value" };

                        comboBox.dataSource = res.data;

                        // comboBox.addEventListener('change', onSetorChangeOrigem);

                    } else {
                        console.log("Nenhum setor encontrado.");
                    }
                },
                error: function (error) {
                    console.log("Erro ao carregar setores: " + error);
                }
            });


        }
        function loadListaSetoresDestino() { //Função pra carregar a lista dos setores
            var comboBox = document.getElementById("cmbSetorDestino").ej2_instances[0];
            comboBox.value = "";
            $.ajax({
                type: "get",
                url: "/api/Setor/ListaSetores",
                success: function (res) {
                    if (res != null && res.data.length) {
                        // Inicialize o ComboBox da Syncfusion


                        comboBox.fields = { text: "text", value: "value" };

                        comboBox.dataSource = res.data;

                        comboBox.addEventListener('change', onSetorChangeDestino);

                    } else {
                        console.log("Nenhum setor encontrado.");
                    }
                },
                error: function (error) {
                    console.log("Erro ao carregar setores: " + error);
                }
            });


        }

        function valida() {
            $(formsMovimentacaoPatrimonio).on("submit", function (event) {
                var patrimonio = document.getElementsByName('MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.PatrimonioId')[0].value;
                var dataMovimentacao = document.getElementsByName('MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.DataMovimentacao')[0].value;
                var setorOrigem = document.getElementsByName('MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SetorOrigemId')[0].value;
                var secaoOrigem = document.getElementsByName('MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SecaoOrigemId')[0].value;
                var setorDestino = document.getElementsByName('MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SetorDestinoId')[0].value;
                var secaoDestino = document.getElementsByName('MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SecaoDestinoId')[0].value;

                if (patrimonio === "") {
                    event.preventDefault(); //Isso aqui impede a página de ser recarregada
                    swal({
                        title: "Erro no patrimonio",
                        text: "O Patrimonio não pode estar em branco!",
                        icon: "error",
                        buttons: true,
                        
                        buttons: {
                            ok: "Ok"
                        }
                    })
                }
                if (dataMovimentacao === "") { //Esse aqui não tá funfnado, provavelmente porque o tipo é DateTime nullable ao invés de só DateTime
                    event.preventDefault(); //Isso aqui impede a página de ser recarregada      
                    swal({
                        title: "Erro na data",
                        text: "A data não pode estar em branco!",
                        icon: "error",
                        buttons: true,
                        
                        buttons: {
                            ok: "Ok"
                        }
                    })
                }
                if (setorOrigem === "") {
                    event.preventDefault(); //Isso aqui impede a página de ser recarregada
                    swal({
                        title: "Erro no setor",
                        text: "O setor de origem não pode estar em branco!",
                        icon: "error",
                        buttons: true,
                        
                        buttons: {
                            ok: "Ok"
                        }
                    })
                }
                if (secaoOrigem === "") {
                    event.preventDefault(); //Isso aqui impede a página de ser recarregada
                    swal({
                        title: "Erro na seção",
                        text: "A seção de origem não pode estar em branco!",
                        icon: "error",
                        buttons: true,
                        
                        buttons: {
                            ok: "Ok"
                        }
                    })
                }
                if (setorDestino === "") {
                    event.preventDefault(); //Isso aqui impede a página de ser recarregada
                    swal({
                        title: "Erro no setor",
                        text: "O setor de destino não pode estar em branco!",
                        icon: "error",
                        buttons: true,
                        
                        buttons: {
                            ok: "Ok"
                        }
                    })
                }
                if (secaoDestino === "") {
                    event.preventDefault(); //Isso aqui impede a página de ser recarregada
                    swal({
                        title: "Erro no setor",
                        text: "O setor de destino não pode estar em branco!",
                        icon: "error",
                        buttons: true,
                        
                        buttons: {
                            ok: "Ok"
                        }
                    })
                }
                if (secaoDestino === secaoOrigem) {
                    event.preventDefault(); //Isso aqui impede a página de ser recarregada
                    swal({
                        title: "Erro na seção",
                        text: "A seção de destino não pode ser a mesma que a seção de origem!",
                        icon: "error",
                        buttons: true,
                        
                        buttons: {
                            ok: "Ok"
                        }
                    })
                }

            })
        }

    }

    function onPatrimonioChange(args) {
        var patrimonioId = args.value;
        console.log("Entrou no patrimonioChange");

        if (patrimonioId && patrimonioId != '00000000-0000-0000-0000-000000000000') {
            $.ajax({
                type: "get",
                url: "/api/Patrimonio/GetSingle",
                data: { Id: patrimonioId },
                success: function (res) {
                    if (res != null && res.success == true) {

                        console.log("SetorId: " + res.data.setorOrigemId);
                        console.log("SecaoId: " + res.data.secaoOrigemId);

                        // Preenche os campos de origem
                        document.getElementById("SetorOrigemId").value = res.data.setorOrigemId;
                        document.getElementById("SecaoOrigemId").value = res.data.secaoOrigemId;

                        document.getElementById("SetorOrigem").value = res.data.setorOrigemNome;
                        document.getElementById("SecaoOrigem").value = res.data.secaoOrigemNome;

                        // Checkbox e label
                        var statusCheckbox = document.getElementById("StatusCheckbox");
                        var statusLabel = document.getElementById("StatusCheckboxLabel");

                        if (res.status === true) {
                            statusCheckbox.checked = true;
                            statusLabel.textContent = "Ativo";
                        } else {
                            statusCheckbox.checked = false;
                            statusLabel.textContent = "Baixado";
                        }
                    }
                },
                error: function (xhr, status, error) {
                    console.log("Erro ao buscar patrimônio:", error);
                }
            });
        }
    }
});


document.addEventListener('DOMContentLoaded', function () {
    var statusCheckbox = document.getElementById('StatusCheckbox');
    var statusLabel = document.getElementById('StatusCheckboxLabel');

    if (statusCheckbox && statusLabel) { // <== Adicione esse if
        function updateStatusLabel() {
            if (statusCheckbox.checked) {
                statusLabel.textContent = "Ativo";
            } else {
                statusLabel.textContent = "Baixado";
            }
        }

        // Atualiza SOMENTE no clique do usuário
        statusCheckbox.addEventListener('change', updateStatusLabel);

        // NÃO chama updateStatusLabel() aqui!
        statusLabel.textContent = ""; // Deixa vazio ao abrir
    }
});

//Tive que colocar aqui fora porque tem que carregar junto com o DOM
//function stopEnterSubmitting(e) {
//    if (e.keyCode == 13) {
//        var src = e.srcElement || e.target;

//        console.log(src.tagName.toLowerCase());

//        if (src.tagName.toLowerCase() !== "div") {
//            if (e.preventDefault) {
//                e.preventDefault();
//            } else {
//                e.returnValue = false;
//            }
//        }
//    }
//}