var AporteTable;

$(document).ready(function () {
 
    $(document).on('click', '.btn-deleteaporte', function () {
        var id = $(this).data('id');

        swal({
            title: "Você tem certeza que deseja apagar este aporte?",
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
                var dataToPost = JSON.stringify({ 'MovimentacaoId': id });
                var url = '/api/Empenho/DeleteMovimentacao';
                $.ajax({
                    url: url,
                    type: "POST",
                    data: dataToPost,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        if (data.success) {
                            toastr.success(data.message);
                            $('#tblAporte').DataTable().ajax.reload(null, false);
                            location.reload();
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



