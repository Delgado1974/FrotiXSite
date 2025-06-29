using Microsoft.JSInterop;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FrotiX.Helpers
{
    public static class Alerta
    {
        public static async Task Aviso(this IJSRuntime js, string titulo, string texto = "", string confirm = "OK")
            => await js.InvokeVoidAsync("SweetAlertInterop.ShowWarning", titulo, texto, confirm);

        public static async Task Erro(this IJSRuntime js, string titulo, string texto, string confirm = "Ok")
            => await js.InvokeVoidAsync("SweetAlertInterop.ShowError", titulo, texto, confirm);

        public static async Task<bool> Confirmacao(this IJSRuntime js, string titulo, string texto, string confirm = "Sim", string cancel = "Cancelar")
            => await js.InvokeAsync<bool>("SweetAlertInterop.ShowConfirm", titulo, texto, confirm, cancel);

        public static ValueTask Sucesso(this IJSRuntime js, string titulo, string? mensagem = null, string botao = "OK")
        {
            return js.InvokeVoidAsync("SweetAlertInterop.ShowSuccess", titulo, mensagem ?? "", botao);
        }

        public static ValueTask Info(this IJSRuntime js, string titulo, string? mensagem = null, string botao = "OK")
        {
            return js.InvokeVoidAsync("SweetAlertInterop.ShowInfo", titulo, mensagem ?? "", botao);
        }

    }

}
