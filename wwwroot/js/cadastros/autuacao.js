//Escolheu um Órgão
//=================
function lstOrgaoChange() {

    document.getElementById("lstEmpenhos").ej2_instances[0].dataSource = [];
    document.getElementById("lstEmpenhos").ej2_instances[0].dataBind();
    document.getElementById("lstEmpenhos").ej2_instances[0].text = "";
    $('#txtEmpenhoMultaId').attr('value', "");

    var lstOrgao = document.getElementById("lstOrgao").ej2_instances[0];
    console.log(lstOrgao.value);

    if (lstOrgao.value === null) {
        return;
    }

    var orgaoid = String(lstOrgao.value);

    $.ajax({
        url: "/Multa/UpsertPenalidade?handler=AJAXPreencheListaEmpenhos",
        method: "GET",
        datatype: "json",

        data: { id: orgaoid },

        success: function (res) {

            if (res.data.length != 0) {

                var empenhomultaid = res.data[0].empenhoMultaId;
                var notaempenho = res.data[0].notaEmpenho;

                let EmpenhoList = [{ "EmpenhoMultaId": empenhomultaid, "NotaEmpenho": notaempenho }];

                for (var i = 1; i < res.data.length; ++i) {
                    console.log(res.data[i].empenhoMultaId + " - " + res.data[i].notaEmpenho);

                    empenhomultaid = res.data[i].empenhoMultaId;
                    notaempenho = res.data[i].notaEmpenho;

                    let empenho = { EmpenhoMultaId: empenhomultaid, NotaEmpenho: notaempenho }
                    EmpenhoList.push(empenho);

                }

                document.getElementById("lstEmpenhos").ej2_instances[0].dataSource = EmpenhoList;
                document.getElementById("lstEmpenhos").ej2_instances[0].dataBind();
            }
        }
    })

    document.getElementById("lstEmpenhos").ej2_instances[0].refresh();

    Swal.fire(
        'Empenho do Órgão',
        'Já existe o empenho correto cadastrado para o órgão?',
        'info'
    )

}


// Por algum motivo o vínculo do lstEmpenho com o banco de dados não está funcionando. Então estou escondendo o ID do empenho em um text box escondido
function lstEmpenhosChange() {

    var lstEmpenhos = document.getElementById("lstEmpenhos").ej2_instances[0];
    $('#txtEmpenhoMultaId').attr('value', lstEmpenhos.value);

    var empenhoid = String(lstEmpenhos.value);

    $.ajax({
        url: "/Multa/UpsertAutuacao?handler=PegaSaldoEmpenho",
        method: "GET",
        datatype: "json",

        data: { id: empenhoid },

        success: function (res) {

            //debugger;

            var saldoempenho = res.data;

            $("#txtSaldoEmpenho").val(Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoempenho));

        }
    })


}