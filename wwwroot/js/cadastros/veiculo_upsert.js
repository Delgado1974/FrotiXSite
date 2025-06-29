var selectItemAta = document.getElementById("lstItemVeiculoAta");
//debugger;

selectItemAta.addEventListener("change", function () {


    itemAta = selectItemAta.value;

    $.ajax({

        "url": "/api/Veiculo/SelecionaValorMensalAta",
        "data": { itemAta: itemAta },
        "type": "GET",
        "datatype": "json",
        success: function (valor) {

            for (var key in valor) {
                if (valor.hasOwnProperty(key)) {
                    document.getElementById("txtValorMensal").value = valor[key];
                }
            }

        }
    })

});

var selectItemContrato = document.getElementById("lstItemVeiculo");
//debugger;

selectItemContrato.addEventListener("change", function () {

    itemContrato = selectItemContrato.value;
    //debugger;

    $.ajax({

        "url": "/api/Veiculo/SelecionaValorMensalContrato",
        "data": { itemContrato: itemContrato },
        "type": "GET",
        "datatype": "json",
        success: function (valor) {

            for (var key in valor) {
                if (valor.hasOwnProperty(key)) {

                    //debugger;

                    var valorItem = valor[key];
                    valorItem = valorItem.toString().replace('.', ',');
                    $('#txtValorMensal').val(valorItem);


                }
            }

        }
    })

});
