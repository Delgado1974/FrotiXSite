var dataTable;

$(document).ready(function () {
    loadList();

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja apagar este tipo de multa?",
            text: "Não será possível recuperar os dados eliminados!",
            icon: "warning",
            buttons: true,
            
            buttons: {
                cancel: "Cancelar",
                confirm: "Excluir"
            }
        }).then((willDelete) => {
            if (willDelete) {
                var dataToPost = JSON.stringify({ 'TipoMultaId': id });
                var url = '/api/Multa/DeleteTipoMulta';
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
    dataTable = $('#tblTipoMulta').DataTable({
        'columnDefs': [
            {
                "targets": 0, // Artigo
                "className": "text-left",
                "width": "20%"
            },
            {
                "targets": 1, // Denatran
                "className": "text-left",
                "width": "20%"
            },
            {
                "targets": 2, // Descrição
                "className": "text-left",
                "width": "64%"
            },
            {
                "targets": 3, // Infração
                "className": "text-center",
                "width": "8%"
            },
            {
                "targets": 4, // Ações
                "className": "text-center",
                "width": "8%"
            }
        ],
        responsive: true,
        "ajax": {
            "url": "/api/Multa/PegaTipoMulta",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "artigo" },
            { "data": "denatran" },
            { "data": "descricao" },
            { "data": "infracao" },
            {
                "data": "tipoMultaId",
                "render": function (data) {
                    return `<div class="text-center">
                                <a href="/Multa/UpsertTipoMulta?id=${data}" class="btn btn-primary btn-xs text-white" style="cursor:pointer; ">
                                    <i class="far fa-edit"></i>
                                </a>
                                <a class="btn-delete btn btn-danger btn-xs text-white" style="cursor:pointer; " data-id='${data}'>
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

