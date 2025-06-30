var dataTable;

$(document).ready(function () {
    loadList();

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja apagar este modelo de veículo?",
            text: "Não será possível recuperar os dados eliminados!",
            icon: "warning",
            buttons: true,
            
            buttons: {
                cancel: "Cancelar",
                confirm: "Excluir"
            }
        }).then((willDelete) => {
            if (willDelete) {
                var dataToPost = JSON.stringify({ 'ModeloId': id });
                var url = '/api/ModeloVeiculo/Delete';
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

    $(document).on('click', '.updateStatusModeloVeiculo', function () {
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
    dataTable = $('#tblModeloVeiculo').DataTable({
        'columnDefs': [
            {
                "targets": 2, // your case first column
                "className": "text-center",
                "width": "20%"
            },
            {
                "targets": 3, // your case first column
                "className": "text-center",
                "width": "20%"
            }
        ],
        responsive: true,
        "ajax": {
            "url": "/api/modeloVeiculo",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "marcaVeiculo.descricaoMarca", "width": "30%" },
            { "data": "descricaoModelo", "width": "30%" },
            {
                "data": "status",
                "render": function (data, type, row, meta) {
                    if (data)
                        return '<a href="javascript:void" class="updateStatusModeloVeiculo btn btn-success btn-xs text-white" data-url="/api/ModeloVeiculo/updateStatusModeloVeiculo?Id=' + row.modeloId + '">Ativo</a>';
                    else
                        return '<a href="javascript:void" class="updateStatusModeloVeiculo btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/ModeloVeiculo/updateStatusModeloVeiculo?Id=' + row.modeloId + '">Inativo</a>';
                },
                "width": "10%"
            },
            {
                "data": "modeloId",
                "render": function (data) {
                    return `<div class="text-center">
                                <a href="/ModeloVeiculo/Upsert?id=${data}" class="btn btn-primary btn-xs text-white" style="cursor:pointer; width:75px;">
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

