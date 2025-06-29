var dataTable;

$(document).ready(function () {
    loadList();

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja apagar este requisitante?",
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
                var dataToPost = JSON.stringify({ 'RequisitanteId': id });
                var url = '/api/Requisitante/Delete';
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

    $(document).on('click', '.updateStatusRequisitante', function () {
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
    dataTable = $('#tblRequisitante').DataTable({
        "order": [],
        'columnDefs': [
            {
                "targets": 0, // Ponto
                "className": "text-center",
                "width": "5%"
            },
            {
                "targets": 1, // Nome
                "className": "text-left",
                "width": "20%"
            },
            {
                "targets": 2, // Ramal
                "className": "text-center",
                "width": "8%"
            },
            {
                "targets": 3, // Setor
                "className": "text-left",
                "width": "20%"
            },
            {
                "targets": 4, // Status
                "className": "text-center",
                "width": "5%"
            },
           {
                "targets": 5, // Ação
                "className": "text-center",
                "width": "5%"
            }
        ],
        responsive: true,
        "ajax": {
            "url": "/api/requisitante",
            "type": "GET",
            "datatype": "json",
        },
        "columns": [
            { "data": "ponto"},
            { "data": "nome"},
            { "data": "ramal"},
            { "data": "nomeSetor"},
            {
                "data": "status",
                "render": function (data, type, row, meta) {
                    if (data)
                        return '<a href="javascript:void" class="updateStatusRequisitante btn btn-success btn-xs text-white" data-url="/api/Requisitante/updateStatusRequisitante?Id=' + row.requisitanteId + '">Ativo</a>';
                    else
                        return '<a href="javascript:void" class="updateStatusRequisitante btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Requisitante/updateStatusRequisitante?Id=' + row.requisitanteId  + '">Inativo</a>';
                },
                
            },
            {
                "data": "requisitanteId",
                "render": function (data) {
                    return `<div class="text-center">
                                <a href="/Requisitante/Upsert?id=${data}" class="btn btn-primary btn-xs text-white"  aria-label="Editar o Requisitante!" data-microtip-position="top" role="tooltip" style="cursor:pointer; ">
                                    <i class="far fa-edit"></i>
                                </a>
                                <a class="btn btn-delete btn-danger btn-xs text-white" aria-label="Excluir o Requisitante!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
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

