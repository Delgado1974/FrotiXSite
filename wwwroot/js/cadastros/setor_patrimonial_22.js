
var path = window.location.pathname.toLowerCase();
console.log(path);

if (path == '/setorpatrimonial/index' || path == '/setorpatrimonial') {
    loadGrid();
    console.log("Entrou na primeira")

    $(document).ready(function () {

        $(document).on('click', '.btn-delete', function () {
            var id = $(this).data('id');
            console.log(id);

            swal({
                title: "Você tem certeza que deseja apagar este setor?",
                text: "Não será possível recuperar os dados eliminados!",
                icon: "warning",
                buttons: true,
                
                buttons: {
                    cancel: "Cancelar",
                    confirm: "Excluir"
                }
            }).then((willDelete) => {
                if (willDelete) {
                    $.ajax({
                        url: "/api/Setor/Delete",
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
    });

    $(document).on('click', '.updateStatusSetor', function () {
        var url = $(this).data('url');
        var currentElement = $(this);

        $.get(url, function (data) {
            if (data.success) {

                if (data.type == 1) {
                    text = 'Inativo';
                    currentElement.removeClass('btn-success').addClass('fundo-cinza');
                }
                else {
                    var text = 'Ativo';
                    currentElement.removeClass('fundo-cinza').addClass('btn-success');
                }

                toastr.success(data.message);

                currentElement.text(text);
            }
            else {
                alert('Something went wrong!');
            }
        });
    });

    function loadGrid() {
        console.log("Entrou na loadGrid setor");
        dataTable = $('#tblSetor').DataTable({

            'columnDefs': [
                {
                    "targets": 0,               //NOME SETOR
                    "className": "text-left",
                    "width": "15%",
                },
                {
                    "targets": 1,               //DETENTOR NOME
                    "className": "text-left",
                    "width": "20%",
                },
                {
                    "targets": 2,               //STATUS
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
                "url": "/api/setor/GetGrid",
                "type": "GET",
                "datatype": "json",
                "error": function (xhr, status, error) {
                    console.log("Erro ao carregar os dados: ", error);
                }
            },
            "columns": [
                { "data": "nomeSetor" },
                { "data": "nomeCompleto" },
                {
                    "data": "status",
                    "render": function (data, type, row, meta) {
                        if (data)
                            return '<a href="javascript:void" class="updateStatusSetor btn btn-success btn-xs text-white" data-url="/api/Setor/updateStatusSetor?Id=' + row.setorId + '">Ativo</a>';
                        else
                            return '<a href="javascript:void" class="updateStatusSetor btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Setor/updateStatusSetor?Id=' + row.setorId + '">Inativo</a>';
                    },
                    "width": "6%"
                },

                {
                    "data": "setorId",

                    "render": function (data) {
                        return `<div class="text-center">
                                <a href="/Setorpatrimonial/Upsert?id=${data}" class="btn btn-primary btn-xs text-white"  aria-label="Editar o setor!" data-microtip-position="top" role="tooltip"  style="cursor:pointer;">
                                    <i class="far fa-edit"></i> 
                                </a>
                                <a class="btn-delete btn btn-danger btn-xs text-white"   aria-label="Excluir o setor!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
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

} else if (path === '/setorpatrimonial/upsert') {
    console.log("Entrou no setor upsert");

    document.addEventListener('DOMContentLoaded', function () {
        loadListaUsuarios();
    });

    function validaNome() {
        $(FormsSetor).on("submit", function (event) { //Verifica se o nome está preenchido
            var nomeSetor = document.getElementsByName('SetorObj.NomeSetor')[0].value;

            if (nomeSetor === "") {
                event.preventDefault(); //Isso aqui impede a página de ser recarregada
                swal({
                    title: "Erro no nome do setor",
                    text: "O nome do setor não pode estar em branco!",
                    icon: "error",
                    buttons: true,
                    
                    buttons: {
                        ok: "Ok"
                    }
                })
            }
        });
    }

    function validaDetentor() {
        $(FormsSetor).on("submit", function (event) { //Verificase o setor foi selecinado
            var detentorId = document.getElementsByName('SetorObj.DetentorId')[0];

            if (detentorId === "" || detentorId == null) {
                event.preventDefault(); //Isso aqui impede a página de ser recarregada
                swal({
                    title: "Erro no Detentor",
                    text: "O detentor da seçãonão pode estar em branco!",
                    icon: "error",
                    buttons: true,
                    
                    buttons: {
                        ok: "Ok"
                    }
                })
            }
        });
    }

    function loadListaUsuarios() {
        var comboBox = document.getElementById("cmbDetentores").ej2_instances[0];
        //var setorId = document.getElementsByName("SetorObj.SetorId");
        //if (setorId <= 0) { //Verifica se é atualização ou criação pra saber se dar o clear na comboBox
        //    comboBox.value = "";
        //}
        $.ajax({
            type: "get",
            url: "/api/usuario/listaUsuariosDetentores",
            dataType: "json",
            success: function (res) {
                if (res != null && res.data.length) {
                    // Inicialize o ComboBox da Syncfusion

                    comboBox.dataSource = res.data;

                    comboBox.fields = { text: "nomeCompleto", value: "usuarioId" };

                } else {
                    console.log("Nenhum setor encontrado.");
                }
            },
            error: function (error) {
                console.log("Erro ao carregar setores: " + error)
            }
        })
    }

    document.addEventListener("DOMContentLoaded", function () {
        // Pega o elemento que contém o Guid
        const infoDiv = document.getElementById("divSetorIdEmpty");

        // Lê o valor do atributo data-patrimonioid
        const setorId = infoDiv.dataset.setorid;
        console.log("Guid do Setor:", setorId);

        // Verifica se é um Guid vazio
        const isEmptyGuid = setorId === "00000000-0000-0000-0000-000000000000";

        // Seleciona o checkbox pelo ID
        const checkbox = document.getElementById("chkStatus");

        // Se for Guid vazio, marca o checkbox
        if (isEmptyGuid && checkbox) {
            checkbox.checked = true;
        }
    });

}


