var dataTable;

$(document).ready(function () {
    loadList();

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja apagar este condutor?",
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
                var dataToPost = JSON.stringify({ 'CondutorId': id });
                var url = '/api/CondutorApoio/Delete';
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

    $(document).on('click', '.updateStatusCondutor', function () {
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
    dataTable = $('#tblCondutor').DataTable({
        'columnDefs': [
            {
                "targets": 1, // Descrição
                "className": "text-center",
                "width": "20%"
            },
            {
                "targets": 2, // Status
                "className": "text-center",
                "width": "20%"
            }
        ],
        responsive: true,
        "ajax": {
            "url": "/api/condutorapoio",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "descricao", "width": "30%" },
            {
                "data": "status",
                "render": function (data, type, row, meta) {
                    if (data)
                        return '<a href="javascript:void" class="updateStatusCondutor btn btn-success btn-xs text-white" data-url="/api/CondutorApoio/UpdateStatusCondutor?Id=' + row.condutorId + '">Ativo</a>';
                    else
                        return '<a href="javascript:void" class="updateStatusCondutor btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Combustivel/UpdateStatusCondutor?Id=' + row.condutorId + '">Inativo</a>';
                },
                "width": "10%"
            },
            {
                "data": "condutorId",
                "render": function (data) {
                    return `<div class="text-center">
                                <a href="/CondutorApoio/Upsert?id=${data}" class="btn btn-primary btn-xs text-white" style="cursor:pointer; width:75px;">
                                    <i class="far fa-edit"></i> Editar
                                </a>
                                <a class="btn-delete btn btn-danger btn-xs text-white" style="cursor:pointer; width:80px;" data-id='${data}'>
                                    <i class="far fa-trash-alt"></i> Excluir
                                </a>
                    </div>`;
                }, "width": "20%"
            },
        ],
        "language": {
            "url": "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
            "emptyTable": "Sem Dados para Exibição"
        },
        "width": "100%"
    });
}

