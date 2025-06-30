var dataTable;

$(document).ready(function () {
    loadList();

    $(document).on('click', '.btn-delete', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja apagar este motorista?",
            text: "Não será possível recuperar os dados eliminados!",
            icon: "warning",
            buttons: true,
            
            buttons: {
                cancel: "Cancelar",
                confirm: "Excluir"
            }
        }).then((willDelete) => {
            if (willDelete) {
                var dataToPost = JSON.stringify({ 'MotoristaId': id });
                var url = '/api/Motorista/Delete';
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

    $(document).on('click', '.updateStatusMotorista', function () {
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
    dataTable = $('#tblMotorista').DataTable({

        autoWidth: false,

        dom: 'Bfrtip',

        lengthMenu: [
            [10, 25, 50, -1],
            ['10 linhas', '25 linhas', '50 linhas', 'Todas as Linhas']
        ],

        buttons: ['pageLength', 'excel', {
            extend: 'pdfHtml5',
            orientation: 'landscape',
            pageSize: 'LEGAL'
        }],

        'columnDefs': [
            {
                "targets": 0,                //Nome
                "className": "text-left",
                "width": "15%",
            },
            {
                "targets": 1,               //Ponto
                "className": "text-center",
                "width": "3%",
            },
            {
                "targets": 2,               //CNH
                "className": "text-center",
                "width": "3%",
            },
            {
                "targets": 3,               //Cat.
                "className": "text-center",
                "width": "3%",
                "defaultContent": "",
            },
            {
                "targets": 4,               //Celular
                "className": "text-center",
                "width": "2%",
            },
            {
                "targets": 5,               //Unidade
                "className": "text-left",
                "width": "5%",
            },
            {
                "targets": 6,               //Contrato
                "className": "text-left",
                "width": "20%",
            },
            {
                "targets": 7,               //Efetivo/Ferista
                "className": "text-center",
                "width": "5%",
            },
            {
                "targets": 8,               //Status
                "className": "text-center",
                "width": "5%",
            },
            {
                "targets": 9,               //Ação
                "className": "text-center",
                "width": "13%",
            },
        ],
        responsive: true,
        "ajax": {
            "url": "/api/motorista",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "nome"},
            { "data": "ponto" },
            { "data": "cnh" },
            { "data": "categoriaCNH" },
            { "data": "celular01" },
            { "data": "sigla" },
            { "data": "contratoMotorista" },
            { "data": "efetivoFerista" },
            {
                "data": "status",
                "render": function (data, type, row, meta) {
                    if (data)
                        return '<a href="javascript:void" class="updateStatusMotorista btn btn-success btn-xs text-white" data-url="/api/Motorista/updateStatusMotorista?Id=' + row.motoristaId + '">Ativo</a>';
                    else
                        return '<a href="javascript:void" class="updateStatusMotorista btn  btn-xs fundo-cinza text-white text-bold" data-url="/api/Motorista/updateStatusMotorista?Id=' + row.motoristaId + '">Inativo</a>';
                },
            },
            {
                "data": "motoristaId",
                "render": function (data) {
                    return `<div class="text-center">
                                <a href="/Motorista/Upsert?id=${data}" class="btn btn-primary btn-xs text-white"  aria-label="Editar o Motorista!" data-microtip-position="top" role="tooltip"  style="cursor:pointer;">
                                    <i class="far fa-edit"></i> 
                                </a>
                                <a class="btn-delete btn btn-danger btn-xs text-white"   aria-label="Excluir o Motorista!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
                                    <i class="far fa-trash-alt"></i>
                                </a>
                                <a class="btn btn-foto btn-dark btn-xs text-white" data-toggle="modal" data-target="#modalFoto" id="rowdata" aria-label="Foto do Motorista!" data-microtip-position="top" role="tooltip" style="cursor:pointer; margin: 2px" data-id='${data}' data-backdrop="false">
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

