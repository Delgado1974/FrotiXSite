window.Alerta = {
    Erro: function (titulo, texto, confirm = "OK") {
        if (window.SweetAlertInterop && SweetAlertInterop.ShowError) {
            SweetAlertInterop.ShowError(titulo, texto, confirm);
        } else {
            console.error("SweetAlertInterop.ShowError não está disponível.");
        }
    },

    Sucesso: function (titulo, texto, confirm = "OK") {
        if (window.SweetAlertInterop && SweetAlertInterop.ShowSuccess) {
            SweetAlertInterop.ShowSuccess(titulo, texto, confirm);
        } else {
            console.error("SweetAlertInterop.ShowSuccess não está disponível.");
        }
    },

    Info: function (titulo, texto, confirm = "OK") {
        if (window.SweetAlertInterop && SweetAlertInterop.ShowInfo) {
            SweetAlertInterop.ShowInfo(titulo, texto, confirm);
        } else {
            console.error("SweetAlertInterop.ShowInfo não está disponível.");
        }
    },

    Alerta: function (titulo, texto, confirm = "OK") {
        if (window.SweetAlertInterop && SweetAlertInterop.ShowWarning)
        {
            SweetAlertInterop.ShowWarning(titulo, texto, confirm);
        }
        else
        {
            console.error("SweetAlertInterop.ShowWarning não está disponível.");
        }
    },

    Confirmar: function (titulo, texto, confirm = "Sim", cancel = "Cancelar") {
        if (window.SweetAlertInterop && SweetAlertInterop.ShowConfirm) {
            return SweetAlertInterop.ShowConfirm(titulo, texto, confirm, cancel);
        } else {
            console.error("SweetAlertInterop.ShowConfirm não está disponível.");
            return Promise.resolve(false);
        }
    }
};

// ===== Utilitários de Tratamento de Erros =====

function extrairLinhaDoErro(stack) {
    try {
        const linhaRegex = /:(\d+):\d+\)?$/;
        const match = stack.match(linhaRegex);
        return match ? parseInt(match[1]) : "desconhecida";
    } catch {
        return "desconhecida";
    }
}

function TratamentoErroComLinha(classe, metodo, erro) {
    SweetAlertInterop.ShowErrorUnexpected(classe, metodo, erro, "Ok");
}

/**
* @typedef {{
*   Confirmar: (titulo: string, texto: string, confirm?: string, cancel?: string) => Promise<boolean>,
*   Erro: (titulo: string, texto: string, confirm?: string) => void,
*   Sucesso: (titulo: string, texto: string, confirm?: string) => void,
*   Info: (titulo: string, texto: string, confirm?: string) => void,
*   Alerta: (titulo: string, texto: string, confirm?: string) => void
* }} AlertaAPI
*/

/** @type {AlertaAPI} */
window.Alerta;