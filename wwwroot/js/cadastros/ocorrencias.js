var dataTable;

$(document).ready(function () {

    $(document).on('click', '.btn-baixar', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja dar baixa nesta ocorrência?",
            text: "Verifique se as condições do veículo já retornaram ao normal",
            icon: "warning",
            buttons: true,
            
            buttons: {
                cancel: "Desistir",
                confirm: "Baixar"
            }
        }).then((willDelete) => {
            if (willDelete) {
                var dataToPost = JSON.stringify({ 'ViagemId': id });
                var url = '/api/Ocorrencia/BaixarOcorrencia';
                $.ajax({
                    url: url,
                    type: "POST",
                    data: dataToPost,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        if (data.success) {
                            toastr.success(data.message);
                            dataTable = $('#tblOcorrencia').DataTable();
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
});


