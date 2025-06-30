var dataTable;

$(document).ready(function () {
    loadList();

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja apagar esta placa?",
            text: "Não será possível recuperar os dados eliminados!",
            icon: "warning",
            buttons: true,
            
            buttons: {
                cancel: "Cancelar",
                confirm: "Excluir"
            }
        }).then((willDelete) => {
            if (willDelete) {
                var dataToPost = JSON.stringify({ 'PlacaBronzeId': id });
                var url = '/api/PlacaBronze/Delete';
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

    $(document).on('click', '.btn-desvincular', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja desvincular esse veículo?",
            text: "Você precisará reassociá-lo se for o caso!",
            icon: "warning",
            buttons: true,
            
            buttons: {
                cancel: "Cancelar",
                confirm: "Desvincular"
            }
        }).then((willDelete) => {
            if (willDelete) {
                var dataToPost = JSON.stringify({ 'PlacaBronzeId': id });
                var url = '/api/PlacaBronze/Desvincula';
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

    $(document).on('click', '.updateStatusPlacaBronze', function () {
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
    dataTable = $('#tblPlacaBronze').DataTable({
        'columnDefs': [
            {
                "targets": 0, // Descrição da Placa
                "className": "text-left",
                "width": "40%"
            },
            {
                "targets": 1, // Veículo Associado
                "className": "text-center",
                "width": "15%"
            },
            {
                "targets": 2, // Status
                "className": "text-center",
                "width": "10%"
            },
            {
                "targets": 3, // Ações
                "className": "text-center",
                "width": "15%"
            }
        ],
        responsive: true,
        "ajax": {
            "url": "/api/placaBronze",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "descricaoPlaca"},
            { "data": "placaVeiculo" },
            {
                "data": "status",
                "render": function (data, type, row, meta) {
                    if (data)
                        return '<a href="javascript:void" class="updateStatusPlacaBronze btn btn-success btn-xs text-white" data-url="/api/PlacaBronze/updateStatusPlacaBronze?Id=' + row.placaBronzeId + '">Ativo</a>';
                    else
                        return '<a href="javascript:void" class="updateStatusPlacaBronze btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/PlacaBronze/updateStatusPlacaBronze?Id=' + row.placaBronzeId + '">Inativo</a>';
                },
            },
            {
                "data": "placaBronzeId",
                "render": function (data) {
                    return `<div class="text-center">
                                <a href="/PlacaBronze/Upsert?id=${data}" class="btn btn-primary btn-xs text-white" style="cursor:pointer; ">
                                    <i class="far fa-edit"></i>
                                </a>
                                <a class="btn-delete btn btn-danger btn-xs text-white" style="cursor:pointer; " data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>
                                <a class="btn-desvincular btn btn-info btn-xs text-white" style="cursor:pointer; " data-id='${data}'>
                                    <i class="far fa-car-crash"></i>
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
}

