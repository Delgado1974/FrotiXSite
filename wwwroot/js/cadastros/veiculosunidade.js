var dataTable;

$(document).ready(function () {
    loadList();

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja remover este veículo da Unidade Usuária?",
            text: "Você deverá associá-lo novamente se necessário!",
            icon: "warning",
            buttons: true,
            
            buttons: {
                cancel: "Cancelar",
                confirm: "Excluir"
            }
        }).then((willDelete) => {
            if (willDelete) {
                var dataToPost = JSON.stringify({ 'VeiculoId': id });
                var url = '/api/VeiculosUnidade/Delete';
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

function loadList() {
    dataTable = $('#tblVeiculosUnidade').DataTable({
        'columnDefs': [
            {
                "targets": 0,                //Placa
                "className": "text-center",
                "width": "7%",
            },
            {
                "targets": 1,               //Marca/Modelo
                "className": "text-left",
                "width": "17%",
            },
            {
                "targets": 2,               //Contrato
                "className": "text-left",
                "width": "25%",
            },
            {
                "targets": 3,               //Ação
                "className": "text-center",
                "width": "8%",
            }
        ],
        responsive: true,
        "ajax": {
            "url": "/api/veiculosunidade",
            "type": "GET",
            "datatype": "json",
            "data": "unidadeId"
        },
        "columns": [
            { "data": "placa" },
            { "data": "marcaModelo" },
            { "data": "contratoVeiculo" },
            {
                "data": "veiculoId",
                "render": function (data) {
                    return `<div class="text-center">
                                <a class="btn-delete btn btn-danger btn-xs text-white"   aria-label="Excluir o Veículo da Unidade Usuária!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
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

