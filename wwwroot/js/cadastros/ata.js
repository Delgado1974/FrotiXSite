var dataTable;

$(document).ready(function () {
    loadList();

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja apagar esta ata?",
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
                var dataToPost = JSON.stringify({ 'AtaId': id });
                var url = '/api/AtaRegistroPrecos/Delete';
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

    $(document).on('click', '.updateStatusAta', function () {
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
    dataTable = $('#tblAta').DataTable({
        "order": [[0, 'desc']],
        'columnDefs': [
            {
                "targets": 0, // Ata
                "className": "text-center",
                "width": "5%"
            },
            {
                "targets": 1, // Processo Completo
                "className": "text-center",
                "width": "6%"
            },
            {
                "targets": 2, // Objeto
                "className": "text-left",
                "width": "12%"
            },
            {
                "targets": 3, // Fornecedor
                "className": "text-left",
                "width": "12%"
            },
            {
                "targets": 4, // Vigência
                "className": "text-center",
                "width": "9%"
            },
            {
                "targets": 5, // Valor
                "className": "text-right",
                "width": "8%"
            },
            {
                "targets": 6, // Status
                "className": "text-center",
                "width": "5%"
            },
           {
                "targets": 7, // Ação
                "className": "text-center",
                "width": "5%"
            }
        ],
        responsive: true,
        "ajax": {
            "url": "/api/ataregistroprecos",
            "type": "GET",
            "datatype": "json",
        },
        "columns": [
            { "data": "ataCompleta"},
            { "data": "processoCompleto"},
            { "data": "objeto"},
            { "data": "descricaoFornecedor"},
            { "data": "periodo"},
            { "data": "valorFormatado" },
            {
                "data": "status",
                "render": function (data, type, row, meta) {
                    if (data)
                        return '<a href="javascript:void" class="updateStatusAta btn btn-success btn-xs text-white" data-url="/api/AtaRegistroPrecos/updateStatusAta?Id=' + row.ataId + '">Ativo</a>';
                    else
                        return '<a href="javascript:void" class="updateStatusAta btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/AtaRegistroPrecos/updateStatusAta?Id=' + row.ataId + '">Inativo</a>';
                },
                
            },
            {
                "data": "ataId",
                "render": function (data) {
                    return `<div class="text-center">
                                <a href="/AtaRegistroPrecos/Upsert?id=${data}" class="btn btn-primary btn-xs text-white"  aria-label="Editar a Ata!" data-microtip-position="top" role="tooltip" style="cursor:pointer; ">
                                    <i class="far fa-edit"></i>
                                </a>
                                <a class="btn btn-delete btn-danger btn-xs text-white" aria-label="Excluir a Ata!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
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

