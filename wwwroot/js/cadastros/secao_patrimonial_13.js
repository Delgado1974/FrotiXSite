var path = window.location.pathname.toLowerCase();
console.log(path);

if (path == '/secaopatrimonial/index' || path == '/secaopatrimonial') {

    console.log("Entrou na seção index AAAAAAAAAAAAAAAAAAAa");

    $(document).ready(function () {

        loadGrid();

    });

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');
        console.log(id);

        swal({
            title: "Você tem certeza que deseja apagar esta Seção Patrimonial?",
            text: "Não será possível recuperar os dados eliminados!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
            buttons: {
                cancel: "Cancelar",
                confirm: "Excluir"
            }
        }).then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: "/api/Secao/Delete",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(id),
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

    $(document).on('click', '.updateStatusSecao', function () {
        var url = $(this).data('url');
        var currentElement = $(this);

        $.get(url, function (data) {
            if (data.success)
            {

                if (data.type == 1)
                {
                    text = 'Inativa';
                    currentElement.removeClass('btn-success').addClass('fundo-cinza');
                }
                else
                {
                    var text = 'Ativa';
                    currentElement.removeClass('fundo-cinza').addClass('btn-success');
                }

                toastr.success(data.message);

                currentElement.text(text);
            }
            else
            {
                alert('Something went wrong!');
            }
        });
    });

    function loadGrid() {
        console.log("Entrou na loadGrid secao");
        dataTable = $('#tblSecao').DataTable({

            'columnDefs': [
                {
                    "targets": 0,               //NOME SECAO
                    "className": "text-left",
                    "width": "15%",
                },
                {
                    "targets": 1,               //NOME SETOR
                    "className": "text-left",
                    "width": "15%",
                },
                {
                    "targets": 2,               //ATIVO / INATIVO
                    "className": "text-center",
                    "width": "10%",
                },
                {
                    "targets": 3,               //AÇÂO
                    "className": "text-center",
                    "width": "10%",
                }
            ],
            responsive: true,
            "ajax": {
                "url": "/api/secao/GetGrid",
                "type": "GET",
                "datatype": "json",
                "error": function (xhr, status, error) {
                    console.log("Erro ao carregar os dados: ", error);
                }
            },
            "columns": [
                { "data": "nomeSecao" },
                { "data": "nomeSetor" },
                {
                    "data": "status",
                    "render": function (data, type, row, meta) {
                        if (data)
                            return '<a href="javascript:void" class="updateStatusSecao btn btn-success btn-xs text-white" data-url="/api/Secao/updateStatusSecao?Id=' + row.secaoId + '">Ativa</a>';
                        else
                            return '<a href="javascript:void" class="updateStatusSecao btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Secao/updateStatusSecao?Id=' + row.secaoId + '">Inativa</a>';
                    },
                    "width": "6%"
                },
                {
                    "data": "secaoId",

                    "render": function (data) {
                        return `<div class="text-center">
                                <a href="/SecaoPatrimonial/Upsert?id=${data}" class="btn btn-primary btn-xs text-white"  aria-label="Editar a Seção!" data-microtip-position="top" role="tooltip"  style="cursor:pointer;">
                                    <i class="far fa-edit"></i> 
                                </a>
                                <a class="btn-delete btn btn-danger btn-xs text-white"   aria-label="Excluir a Seção!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
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
        console.log("Saiu da LoadGrid");
    }

} else if (path === '/secaopatrimonial/upsert') {
    console.log("Upsert seção");
    $(document).ready(function () {
        loadListaSetores();
    })

       
    function validaNome() {
        $(FormsSecao).on("submit", function (event) { //Verifica se o nome está preenchido
            var nomeSecao = document.getElementsByName('SecaoObj.NomeSecao')[0].value;

            if (nomeSecao === "") {
                event.preventDefault(); //Isso aqui impede a página de ser recarregada
                swal({
                    title: "Erro no nome da Seção",
                    text: "O nome da seção não pode estar em branco!",
                    icon: "error",
                    buttons: true,
                    dangerMode: true,
                    buttons: {
                        ok: "Ok"
                    }
                })
            }
        });
    }

    function validaSetor() {
        $(FormsSecao).on("submit", function (event) { //Verificase o nome está preenchido
            var setorId = document.getElementById("cmbSetor").ej2_instances[0].value;

            if (setorId === "" || setorId == null) {
                event.preventDefault(); //Isso aqui impede a página de ser recarregada
                swal({
                    title: "Erro no Setor",
                    text: "O Setor da seção não pode estar em branco!",
                    icon: "error",
                    buttons: true,
                    dangerMode: true,
                    buttons: {
                        ok: "Ok"
                    }
                })
            }
        });
    }


    function loadListaSetores() {
        var comboBox = document.getElementById("cmbSetor").ej2_instances[0];
        var secaoId = document.getElementsByName("SecaoObj.SecaoId");
        var setorId;
        if (secaoId.length <= 0) {
            comboBox.value = "";
            console.log(secaoId > 0);
        } else {
            setorId = document.getElementById("cmbSetor").ej2_instances[0].value;
        }

        $.ajax({
            type: "get",
            url: "/api/Setor/ListaSetores",
            datatype: "json",
            success: function (res) {
                if (res != null && res.data.length) {
                    // Inicialize o ComboBox da Syncfusion

                    comboBox.fields = { text: "text", value: "value" }; //define os campos da comboBox

                    comboBox.dataSource = res.data; //Carrega os dados recebeidos na comboBox

                    if (setorId) { //Isso aqui vai trocar o id que aparece por causa do razor para o nome correto do id representado
                        var item = comboBox.dataSource.find(item => item.value.toLowerCase() == setorId.toString());
                        console.log("item: ", item);
                        if (item) {
                            comboBox.value = item.value;

                        }
                    }

                } else {
                    console.log("Nenhum setor encontrado.");
                }
            },
            error: function (error) {
                console.log("Erro ao carregar setores: " + error);
            }
        });


    }

    document.addEventListener("DOMContentLoaded", function () {
            // Pega o elemento que contém o Guid
            const infoDiv = document.getElementById("divSecaoIdEmpty");

            // Lê o valor do atributo data-patrimonioid
            const secaoId = infoDiv.dataset.secaoid;
            console.log("Guid da Seção:", secaoId);

            // Verifica se é um Guid vazio
            const isEmptyGuid = secaoId === "00000000-0000-0000-0000-000000000000";

            // Seleciona o checkbox pelo ID
            const checkbox = document.getElementById("chkStatus");

            // Se for Guid vazio, marca o checkbox
            if (isEmptyGuid && checkbox) {
                checkbox.checked = true;
            }
    });
        
}


