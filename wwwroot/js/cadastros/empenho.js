var dataTable;

$(document).ready(function () {
    loadList();

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja apagar este empenho?",
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
                var dataToPost = JSON.stringify({ 'EmpenhoId': id });
                var url = '/api/Empenho/Delete';
                $.ajax({
                    url: url,
                    type: "POST",
                    data: dataToPost,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        if (data.success) {
                            toastr.success(data.message);
                            $('#tblEmpenho').DataTable().ajax.reload(null, false);
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

    $(document).on('click', '.updateStatusEmpenho', function () {
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
    //dataTable = $('#tblEmpenho').DataTable({
    //    'columnDefs': [
    //        {
    //            "targets": 0, // Nota de Empenho
    //            "className": "text-center",
    //            "width": "5%"
    //        },
    //        {
    //            "targets": 1, // Contrato
    //            "className": "text-center",
    //            "width": "5%"
    //        },
    //        {
    //            "targets": 2, // Vigência
    //            "className": "text-center",
    //            "width": "5%"
    //        },
    //        {
    //            "targets": 3, // Saldo Inicial
    //            "className": "text-left",
    //            "width": "8%"
    //        },
    //        {
    //            "targets": 4, // Saldo Atual
    //            "className": "text-left",
    //            "width": "8%"
    //        },
    //        {
    //            "targets": 5, // Ação
    //            "className": "text-center",
    //            "width": "10%"
    //        },
    //        {
    //            "targets": 6, // Aporte/Anulação
    //            "className": "text-center",
    //            "width": "10%"
    //        },
    //        {
    //            "targets": 7, // EmpenhoId
    //            "className": "text-center",
    //            "visible": false
    //        }
    //    ],
    //    responsive: true,
    //    "ajax": {
    //        "url": "/api/empenho",
    //        "type": "GET",
    //        "datatype": "json",
    //    },
    //    "columns": [
    //        { "data": "notaEmpenho"},
    //        { "data": "contratoCompleto"},
    //        { "data": "anoVigencia"},
    //        { "data": "saldoInicialFormatado"},
    //        { "data": "saldoFinalFormatado"},
    //        {
    //            "data": "empenhoId",
    //            "render": function (data) {
    //                return `<div class="text-center">
    //                            <a href="/Empenho/Upsert?id=${data}" class="btn btn-primary btn-xs text-white"  aria-label="Editar o Empenho!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px">
    //                                <i class="far fa-edit"></i>
    //                            </a>
    //                            <a class="btn btn-delete btn-danger btn-xs text-white" aria-label="Excluir o Empenho!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px" data-id='${data}'>
    //                                <i class="far fa-trash-alt"></i>
    //                            </a>
    //                            <a class="btn btn-documentos btn-info btn-xs text-white" aria-label="Notas do Empenho!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px" data-id='${data}'>
    //                                <i class="fal fa-file-pdf"></i>
    //                </div>`;
    //            },
    //        },
    //        {
    //            "data": "empenhoId",
    //            "render": function (data) {
    //                return `<div class="text-center">
    //                            <a class="btn btn-aporte btn-dark btn-xs text-white" data-toggle="modal" data-target="#modalAporte" id="rowdata" aria-label="Aporte ao Empenho!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px" data-id='${data}' data-backdrop="false">
    //                                <i class="fal fa-plus-circle"></i>
    //                            <a class="btn btn-anulacao btn-danger btn-xs text-white" data-toggle="modal" data-target="#modalAnulacao" id="rowdata" aria-label="Anulação do Empenho!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px" data-id='${data}' data-backdrop="false">
    //                                <i class="fal fa-minus-circle"></i>
    //                </div>`;
    //            },
    //        },
    //        { "data": "empenhoId" },
    //    ],
    //    "language": {
    //        "url": "https://cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json",
    //        "emptyTable": "Sem Dados para Exibição"
    //    },
    //    "width": "100%"
    //});

}

