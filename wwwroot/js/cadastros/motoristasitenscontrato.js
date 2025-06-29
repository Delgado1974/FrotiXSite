
var dataTableMotorista;

$(document).ready(function () {
    loadMotoristaList();
});

function loadMotoristaList() {
    dataTableMotorista = $('#tblMotorista').DataTable({
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
                "targets": 2,               //CNH
                "className": "text-center",
                "width": "6%",
            },
            {
                "targets": 3,               //Cat.
                "className": "text-center",
                "width": "5%",
                "defaultContent": "",
            },
            {
                "targets": 4,               //Celular
                "className": "text-center",
                "width": "8%",
            },
            {
                "targets": 5,               //Unidade
                "className": "text-left",
                "width": "5%",
            },
            {
                "targets": 6,               //Contrato
                "className": "text-left",
                "width": "10%",
            },
            {
                "targets": 7,               //Status
                "className": "text-center",
                "width": "5%",
            },
            {
                "targets": 8,               //Ação
                "className": "text-center",
                "width": "8%",
            }
        ],
        responsive: true,
        "ajax": {
            "url": "/api/motorista",
            "type": "GET",
            "datatype": "json"
        },
        "columns": [
            { "data": "nome" },
            { "data": "ponto" },
            { "data": "cnh" },
            { "data": "categoriaCNH" },
            { "data": "celular01" },
            { "data": "sigla" },
            { "data": "contratoMotorista" },
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
                                <a class="btn-delete btn btn-danger btn-xs text-white"   aria-label="Excluir o Motorista do Contrato!" data-microtip-position="top" role="tooltip" style="cursor:pointer;" data-id='${data}'>
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