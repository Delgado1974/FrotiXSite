var dataTable;

$(document).ready(function ()
{
    loadList();

    $(document).on('click', '.btn-delete', function ()
    {
        var Id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja apagar este Usuário?",
            text: "Não será possível recuperar os dados eliminados!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
            buttons: {
                cancel: "Cancelar",
                confirm: "Excluir"
            }
        }).then((willDelete) =>
        {
            if (willDelete)
            {
                var dataToPost = JSON.stringify({ 'Id': Id });
                var url = '/api/Usuario/Delete';
                $.ajax({
                    url: url,
                    type: "POST",
                    data: dataToPost,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data)
                    {
                        if (data.success)
                        {
                            toastr.success(data.message);
                            dataTable.ajax.reload();
                        }
                        else
                        {
                            toastr.error(data.message);
                        }
                    },
                    error: function (err)
                    {
                        console.log(err)
                        alert('something went wrong')
                    }
                });

            }
        });
    });

    $(document).on('click', '.updateStatusUsuario', function () {
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


    $(document).on('click', '.updateCargaPatrimonial', function ()
    {
        var url = $(this).data('url');
        var currentElement = $(this);

        $.get(url, function (data)
        {
            if (data.success)
            {
                toastr.success("Carga Patrimonial alterada com sucesso!");
                var text = 'Sim';

                if (data.type == 1)
                {
                    text = 'Não';
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


function loadList()
{
    dataTable = $('#tblUsuario').DataTable({
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
                "targets": 2,               //Carga Patrimonial
                "className": "text-center",
                "width": "10%",
            },
            {
                "targets": 3,               //Status
                "className": "text-center",
                "width": "8%",
            },
            {
                "targets": 4,               //Ação
                "className": "text-center",
                "width": "8%",
            },
        ],
        responsive: true,
        "ajax": {
            "url": "/api/usuario",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "nomeCompleto" },
            { "data": "ponto" },
            {
                "data": "detentorCargaPatrimonial",
                "render": function (data, type, row, meta) {
                    if (data)
                        return '<a href="javascript:void" class="updateCargaPatrimonial btn btn-success btn-xs text-white" data-url="/api/Usuario/updateCargaPatrimonial?Id=' + row.usuarioId + '">Sim</a>';
                    else
                        return '<a href="javascript:void" class="updateCargaPatrimonial btn btn-xs fundo-cinza text-white text-bold" data-url="/api/Usuario/updateCargaPatrimonial?Id=' + row.usuarioId + '">Não</a>';
                },
            },
            {
                "data": "status",
                "render": function (data, type, row, meta)
                {
                    if (data)
                        return '<a href="javascript:void" class="updateStatusUsuario btn btn-success btn-xs text-white" data-url="/api/Usuario/updateStatusUsuario?Id=' + row.usuarioId + '">Ativo</a>';
                    else
                        return '<a href="javascript:void" class="updateStatusUsuario btn btn-xs fundo-cinza text-white text-bold" data-url="/api/Usuario/updateStatusUsuario?Id=' + row.usuarioId + '">Inativo</a>';
                },
            },
            {
                "data": "usuarioId",
                "render": function (data)
                {
                    return `<div class="text-center">
                                <a href="/Usuarios/Upsert?id=${data}" class="btn btn-primary btn-xs text-white"  aria-label="Editar o Usuário!" data-microtip-position="top" role="tooltip"  style="cursor:pointer;">
                                    <i class="far fa-edit"></i> 
                                </a>
                                <a class="btn-delete btn btn-danger btn-xs text-white"   aria-label="Excluir o Usuário!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>
                                <a class="btn btn-foto btn-dark btn-xs text-white" data-toggle="modal" data-target="#modalSenha" id="rowdata" aria-label="Altera a Senha!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px" data-id='${data}' data-backdrop="false">
                                    <i class="fa-thin fa-camera-retro"></i>
                                </a>
                                <a class="btn btn-foto btn-xs text-white fundo-laranja" data-toggle="modal" data-target="#modalControleAcesso" id="rowdata" aria-label="Controle de Acesso!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px" data-id='${data}' data-backdrop="false">
                                    <i class="fa-thin fa-diagram-successor"></i>
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

