var dataTable;

$(document).ready(function () {
    loadList();

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja apagar este operador?",
            text: "Não será possível recuperar os dados eliminados!",
            icon: "warning",
            buttons: true,
            
            buttons: {
                cancel: "Cancelar",
                confirm: "Excluir"
            }
        }).then((willDelete) => {
            if (willDelete) {
                var dataToPost = JSON.stringify({ 'OperadorId': id });
                var url = '/api/Operador/Delete';
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

    $(document).on('click', '.updateStatusOperador', function () {
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
    dataTable = $('#tblOperador').DataTable({
        'columnDefs': [
            {
                "targets": 0,                //Nome
                "className": "text-left",
                "width": "15%",
            },
            {
                "targets": 1,               //Ponto
                "className": "text-center",
                "width": "6%",
            },
            {
                "targets": 2,               //Celular
                "className": "text-center",
                "width": "8%",
            },
            {
                "targets": 3,               //Contrato
                "className": "text-left",
                "width": "10%",
            },
            {
                "targets": 4,               //Status
                "className": "text-center",
                "width": "5%",
            },
            {
                "targets": 5,               //Ação
                "className": "text-center",
                "width": "8%",
            }
        ],
        responsive: true,
        "ajax": {
            "url": "/api/operador",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "nome"},
            { "data": "ponto" },
            { "data": "celular01" },
            { "data": "contratoOperador"},
            {
                "data": "status",
                "render": function (data, type, row, meta) {
                    if (data)
                        return '<a href="javascript:void" class="updateStatusOperador btn btn-success btn-xs text-white" data-url="/api/Operador/updateStatusOperador?Id=' + row.operadorId + '">Ativo</a>';
                    else
                        return '<a href="javascript:void" class="updateStatusOperador btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Motorista/updateStatusOperador?Id=' + row.operadorId + '">Inativo</a>';
                },
            },
            {
                "data": "operadorId",
                "render": function (data) {
                    return `<div class="text-center">
                                <a href="/Operador/Upsert?id=${data}" class="btn btn-primary btn-xs text-white"  aria-label="Editar o Operador!" data-microtip-position="top" role="tooltip"  style="cursor:pointer;">
                                    <i class="far fa-edit"></i> 
                                </a>
                                <a class="btn-delete btn btn-danger btn-xs text-white"   aria-label="Excluir o Operador!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>
                                 <a class="btn btn-foto btn-dark btn-xs text-white" data-toggle="modal" data-target="#modalFoto" id="rowdata" aria-label="Foto do Operador!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px" data-id='${data}' data-backdrop="false">
                                    <i class="far fa-camera-retro"></i>
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

