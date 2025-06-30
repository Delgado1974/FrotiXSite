var dataTable;

$(document).ready(function () {
    loadList();

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja apagar este fornecedor?",
            text: "Não será possível recuperar os dados eliminados!",
            icon: "warning",
            buttons: true,
            
            buttons: {
                cancel: "Cancelar",
                confirm: "Excluir"
            }
        }).then((willDelete) => {
            if (willDelete) {
                var dataToPost = JSON.stringify({ 'FornecedorId': id });
                var url = '/api/Fornecedor/Delete';
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

    $(document).on('click', '.updateStatusFornecedor', function () {
        var url = $(this).data('url');
        var currentElement = $(this);

        $.get(url, function (data) {
            if (data.success) {
                toastr.success("Status alterado com sucesso!");
                var text = 'Ativo';

                if (data.type == 1) {
                    text = 'Inativo';
                    currentElement.removeClass('btn-success').addClass('fundo-cinza');
                }
                else
                    currentElement.removeClass('fundo-cinza').addClass('btn-success');

                currentElement.text(text);
            }
            else alert('Something went wrong!');
        });
    });
});

function loadList() {
    dataTable = $('#tblFornecedor').DataTable({
        'columnDefs': [
            {
                "targets": 0,
                "className": "text-left",
            },
            {
                "targets": 1,
                "className": "text-left",
            },
            {
                "targets": 2,
                "className": "text-left",
            },
            {
                "targets": 3,
                "className": "text-center",
            },
            {
                "targets": 4,
                "className": "text-center",
            },
            {
                "targets": 5,
                "className": "text-center",
            }
        ],
        responsive: true,
        "ajax": {
            "url": "/api/fornecedor",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "cnpj", "width": "10%" },
            { "data": "descricaoFornecedor", "width": "25%" },
            { "data": "contato01", "width": "20%" },
            { "data": "telefone01", "width": "8%" },
            {
                "data": "status",
                "render": function (data, type, row, meta) {
                    if (data)
                        return '<a href="javascript:void" class="updateStatusFornecedor btn btn-success btn-xs text-white" data-url="/api/Fornecedor/updateStatusFornecedor?Id=' + row.fornecedorId + '">Ativo</a>';
                    else
                        return '<a href="javascript:void" class="updateStatusFornecedor btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Fornecedor/updateStatusFornecedor?Id=' + row.fornecedorId + '">Inativo</a>';
                },
                "width": "6%"
            },
            {
                "data": "fornecedorId",
                "render": function (data) {
                    return `<div class="text-center">
                                <a href="/Fornecedor/Upsert?id=${data}" class="btn btn-primary btn-xs text-white"   aria-label="Editar o Fornecedor!" data-microtip-position="top" role="tooltip"  style="cursor:pointer;">
                                    <i class="far fa-edit"></i>
                                </a>
                                <a class="btn-delete btn btn-danger btn-xs text-white" aria-label="Excluir o Fornecedor!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>
                    </div>`;
                }, "width": "8%"
            },
        ],
        "language": {
            "url": "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
            "emptyTable": "Sem Dados para Exibição"
        },
        "width": "100%"
    });
}

