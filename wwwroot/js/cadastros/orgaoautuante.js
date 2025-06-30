var dataTable;

$(document).ready(function () {
    loadList();

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja apagar este órgão?",
            text: "Não será possível recuperar os dados eliminados!",
            icon: "warning",
            buttons: true,
            
            buttons: {
                cancel: "Cancelar",
                confirm: "Excluir"
            }
        }).then((willDelete) => {
            if (willDelete) {
                var dataToPost = JSON.stringify({ 'OrgaoAutuanteId': id });
                var url = '/api/Multa/DeleteOrgaoAutuante';
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
    dataTable = $('#tblOrgaoAutuante').DataTable({
        'columnDefs': [
            {
                "targets": 0, // Sigla
                "className": "text-left",
                "width": "10%"
            },
            {
                "targets": 1, // Nome
                "className": "text-left",
                "width": "75%"
            },
            {
                "targets": 2, // Ações
                "className": "text-center",
                "width": "15%"
            }
        ],
        responsive: true,
        "ajax": {
            "url": "/api/Multa/PegaOrgaoAutuante",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "sigla" },
            { "data": "nome" },
            {
                "data": "orgaoAutuanteId",
                "render": function (data) {
                    return `<div class="text-center">
                                <a href="/Multa/UpsertOrgaoAutuante?id=${data}" class="btn btn-primary btn-xs text-white" style="cursor:pointer; ">
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

