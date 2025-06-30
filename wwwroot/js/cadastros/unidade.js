var dataTable;

$(document).ready(function () {
    loadList();

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja apagar esta unidade?",
            text: "Não será possível recuperar os dados eliminados!",
            icon: "warning",
            buttons: true,
            
            buttons: {
                cancel: "Cancelar",
                confirm: "Excluir"
            }
        }).then((willDelete) => {
            if (willDelete) {
                var dataToPost = JSON.stringify({ 'UnidadeId': id });
                var url = '/api/Unidade/Delete';
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

    $(document).on('click', '.updateStatus', function () {
        var url = $(this).data('url');
        var currentElement = $(this);

        $.get(url, function (data) {
            if (data.success) {
                /*alert(data.message);*/
                //toastr.success("Status alterado com sucesso!");
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
    dataTable = $('#tblUnidade').DataTable({
        'columnDefs': [
            {
                "targets": 0,               //Sigla
                "className": "text-left",
                "width": "6%",
            },
            {
                "targets": 1,               //Descrição
                "className": "text-left",
                "width": "25%",
            },
            {
                "targets": 2,               //Contato
                "className": "text-left",
                "width": "15%",
            },
            {
                "targets": 3,               //Ponto
                "className": "text-center",
                "width": "7%",
            },
            {
                "targets": 4,               //Ramal
                "className": "text-center",
                "width": "8%",
            },
            {
                "targets": 5,               //Status
                "className": "text-center",
                "width": "7%",
            },
            {
                "targets": 6,               //Ação
                "className": "text-center",
                "width": "10%",
            }
        ],
        responsive: true,
        "ajax": {
            "url": "/api/unidade",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "sigla" },
            { "data": "descricao" },
            { "data": "primeiroContato" },
            { "data": "pontoPrimeiroContato" },
            { "data": "primeiroRamal" },
            {
                "data": "status",
                "render": function (data, type, row, meta) {
                    if (data)
                        return '<a href="javascript:void" class="updateStatus btn btn-success btn-xs text-white" data-url="/api/Unidade/UpdateStatus?Id=' + row.unidadeId + '">Ativo</a>';
                    else
                        return '<a href="javascript:void" class="updateStatus btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Unidade/UpdateStatus?Id=' + row.unidadeId + '">Inativo</a>';
                },
                "width": "6%"
            },
            {
                "data": "unidadeId",
                "render": function (data) {
                    return `<div class="text-center">
                                <a href="/Unidade/Upsert?id=${data}" class="btn btn-primary btn-xs text-white"  aria-label="Editar a Unidade!" data-microtip-position="top" role="tooltip" style="cursor:pointer; ">
                                    <i class="far fa-edit"></i>
                                </a>
                                <a class="btn-delete btn btn-danger btn-xs text-white" aria-label="Excluir a Unidade!" data-microtip-position="top" role="tooltip" style="cursor:pointer; " data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>
                                <a href="/Unidade/VeiculosUnidade?id=${data}" class="btn btn-info btn-xs text-white"  aria-label="Veículos da Unidade!" data-microtip-position="top" role="tooltip" style="cursor:pointer;">
                                    <i class="far fa-car"></i>
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

