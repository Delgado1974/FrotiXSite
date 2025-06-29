var dataTable;

$(document).ready(function () {
    loadList();

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja apagar este veículo?",
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
                var dataToPost = JSON.stringify({ 'VeiculoId': id });
                var url = '/api/Veiculo/Delete';
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

    $(document).on('click', '.updateStatusVeiculo', function () {
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
    dataTable = $('#tblVeiculo').DataTable({

        'columnDefs': [
            {
                "targets": 0,                //Placa
                "className": "text-center",
                "width": "9%",
            },
            {
                "targets": 1,               //Marca/Modelo
                "className": "text-left",
                "width": "17%",
            },
            {
                "targets": 2,               //Contrato
                "className": "text-left",
                "width": "35%",
            },
            {
                "targets": 3,               //Sigla
                "className": "text-center",
                "width": "5%",
                "defaultContent": "",
            },
            {
                "targets": 4,               //Combustível
                "className": "text-center",
                "width": "5%",
            },
            {
                "targets": 5,               //Consumo
                "className": "text-right",
                "width": "3%",
            },
            {
                "targets": 6,               //Quilometragem
                "className": "text-right",
                "width": "3%",
            },
            {
                "targets": 7,               //Reserva
                "className": "text-center",
                "width": "5%",
            },
            {
                "targets": 8,               //Status
                "className": "text-center",
                "width": "7%",
            },
            {
                "targets": 9,               //Ação
                "className": "text-center",
                "width": "8%",
            }
        ],
        responsive: true,
        "ajax": {
            "url": "/api/veiculo",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "placa"},
            { "data": "marcaModelo"},
            { "data": "origemVeiculo"},
            { "data": "sigla" },
            { "data": "descricao" },
            { "data": "consumo" },
            { "data": "quilometragem" },
            { "data": "veiculoReserva" },
            {
                "data": "status",
                "render": function (data, type, row, meta) {
                    if (data)
                        return '<a href="javascript:void" class="updateStatusVeiculo btn btn-success btn-xs text-white" data-url="/api/Veiculo/updateStatusVeiculo?Id=' + row.veiculoId + '">Ativo</a>';
                    else
                        return '<a href="javascript:void" class="updateStatusVeiculo btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Veiculo/updateStatusVeiculo?Id=' + row.veiculoId + '">Inativo</a>';
                },
            },
            {
                "data": "veiculoId",
                "render": function (data) {
                    return `<div class="text-center">
                                <a href="/Veiculo/Upsert?id=${data}" class="btn btn-primary btn-xs text-white"  aria-label="Editar o Veículo!" data-microtip-position="top" role="tooltip"  style="cursor:pointer;">
                                    <i class="far fa-edit"></i> 
                                </a>
                                <a class="btn-delete btn btn-danger btn-xs text-white"   aria-label="Excluir o Veículo!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
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
}

