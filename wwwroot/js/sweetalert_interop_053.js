window.SweetAlertInterop = {
    ShowCustomAlert: async function (icon, iconHtml, title, message, confirmButtonText, cancelButtonText = null)
    {
        const msg = `
        <div style="background:#1e1e2f; border-radius: 8px; overflow: hidden; font-family: 'Segoe UI', sans-serif; color: #e0e0e0;">
          <div style="background:#2d2d4d; padding: 20px; text-align: center;">
          <div style="margin-bottom: 10px;">
            <div style="display: inline-block; max-width: 200px; width: 100%;">
            ${iconHtml}
            </div>
         </div>
         <div style="font-size: 20px; color: #c9a8ff; font-weight: bold;">${title}</div>
        </div>

          <div style="padding: 20px; font-size: 15px; line-height: 1.6; text-align: center; background:#1e1e2f">
            <p>${message}</p>
          </div>

          <div style="background:#3b3b5c; padding: 15px; text-align: center;">
            ${cancelButtonText ? `<button id="btnCancel" style="
              background: #555;
              border: none;
              color: #fff;
              padding: 10px 20px;
              margin-right: 10px;
              font-size: 14px;
              border-radius: 5px;
              cursor: pointer;
            ">${cancelButtonText}</button>` : ''}

            <button id="btnConfirm" style="
              background: #7b5ae0;
              border: none;
              color: #fff;
              padding: 10px 20px;
              font-size: 14px;
              border-radius: 5px;
              cursor: pointer;
            ">${confirmButtonText}</button>
          </div>
        </div>`;

        return new Promise((resolve) =>
        {
            Swal.fire({
                showConfirmButton: false,
                html: msg,
                backdrop: true,
                heightAuto: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                customClass: {
                    popup: 'swal2-popup swal2-no-border swal2-no-shadow'
                },
                didOpen: () =>
                {
                    const popup = document.querySelector('.swal2-popup');
                    if (popup)
                    {
                        popup.style.border = 'none';
                        popup.style.boxShadow = 'none';
                        popup.style.background = 'transparent';
                    }
                    const confirmBtn = document.getElementById('btnConfirm');
                    if (confirmBtn) confirmBtn.onclick = () => { Swal.close(); resolve(true); };
                    const cancelBtn = document.getElementById('btnCancel');
                    if (cancelBtn) cancelBtn.onclick = () => { Swal.close(); resolve(false); };

                    const swalContainer = document.querySelector('.swal2-container');
                    //if (swalContainer)
                    //{
                    //    swalContainer.style.zIndex = '3000';
                    //    document.body.appendChild(swalContainer);
                    //}

                },
                didClose: () =>
                {
                    // Limpeza universal após qualquer SweetAlert fechar
                    //if (typeof limparResiduosModalVanilla === "function")
                    //{
                    //    limparResiduosModalVanilla();
                    //}

                }
            });
        });
    },

    ShowInfo: async function (title, text, confirmButtonText = "OK") {
        const iconHtml = '<img src="/images/Feliz.jpg" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';
        return await this.ShowCustomAlert('info', iconHtml, title, text, confirmButtonText);
    },

    ShowSuccess: async function (title, text, confirmButtonText = "OK") {
        const iconHtml = '<img src="/images/success_oculos_transparente.png" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';
        return await this.ShowCustomAlert('success', iconHtml, title, text, confirmButtonText);
    },

    ShowWarning: async function (title, text, confirmButtonText = "OK")
    {
        const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 72 72" style="display:block;margin:0 auto 12px;">
                            <circle cx="36" cy="36" r="32" fill="#ffe066" stroke="#fff" stroke-width="4"/>
                            <rect x="32" y="18" width="8" height="28" rx="4" fill="#222"/>
                            <circle cx="36" cy="54" r="5" fill="#222"/>
                        </svg>`;
        const message = iconSvg + `<div>${text}</div>`;
        const iconHtml = '<img src="/images/alerta_transparente.png" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';
        return await this.ShowCustomAlert('warning', iconHtml, title, message, confirmButtonText);
    },

    //ShowWarning: async function (title, text, confirmButtonText = "OK") {
    //    const iconHtml = '<img src="/images/alerta_transparente.png" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';
    //    return await this.ShowCustomAlert('warning', iconHtml, title, text, confirmButtonText);
    //},

    ShowError: async function (title, text, confirmButtonText = "OK")
    {
        // Monta título com o ícone SVG antes do texto
        const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 72 72" style="display:block;margin:0 auto 12px;">
                            <circle cx="36" cy="36" r="32" fill="#ff4040" stroke="#fff" stroke-width="4"/>
                            <line x1="20" y1="20" x2="52" y2="52" stroke="#ffe066" stroke-width="8" stroke-linecap="round"/>
                            <line x1="52" y1="20" x2="20" y2="52" stroke="#ffe066" stroke-width="8" stroke-linecap="round"/>
                        </svg>`;
        const message = iconSvg + `<div>${text}</div>`;
        const iconHtml = '<img src="/images/erro_transparente.png" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';
        return await this.ShowCustomAlert('error', iconHtml, title, message, confirmButtonText);
    },

    ShowConfirm: async function (title, text, confirmButtonText, cancelButtonText) {
        const iconHtml = '<img src="/images/confirmar_transparente.png" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';
        return await this.ShowCustomAlert('question', iconHtml, title, text, confirmButtonText, cancelButtonText);
    },

    ShowErrorUnexpected: async function (classe, metodo, erro) {
        const obterInfoLinha = async (stack) => {
            try {
                const match = stack.match(/(\/[^:]+\.js):(\d+):(\d+)/);
                if (!match) return { linha: "desconhecida", trecho: null, arquivo: null };
                const [, arquivo, linha] = match;
                const response = await fetch(arquivo);
                const texto = await response.text();
                const linhas = texto.split('\n');
                return {
                    linha: linha,
                    trecho: linhas[parseInt(linha) - 1]?.trim() || '(não disponível)',
                    arquivo: arquivo
                };
            } catch {
                return { linha: "desconhecida", trecho: null, arquivo: null };
            }
        };

        const { linha, trecho, arquivo } = await obterInfoLinha(erro.stack || '');

        const iconHtml = '<img src="/images/assustado_radioativo_3D.png" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';
        const title = 'Erro Sem Tratamento';
        const message = `
            <p><b>📚 Classe:</b> ${classe}</p>
            <p><b>🖋️ Método:</b> ${metodo}</p>
            <p><img src="/images/ErroCirculoVermelho.png" style="width:16px;vertical-align:middle;margin-right:6px;">
               <b style="color:#ff6f6f;">Erro:</b> ${erro.message}</p>
            <p><img src="/images/Arquivos.png" style="width:16px;vertical-align:middle;margin-right:6px;">
               <b style="color:#64b5f6;">Arquivo:</b> ${arquivo || '(não identificado)'}</p>
            <p><b>🔢 Linha:</b> <span style="color:#f76c6c; font-weight:bold;">${linha}</span></p>
            ${trecho ? `<pre style="
              background: #2b2b40;
              border: 1px solid #444;
              padding: 10px;
              white-space: pre-wrap;
              word-break: break-word;
              font-family: monospace;
              max-height: 300px;
              overflow-y: auto;
              color: #e0e0e0;
            ">${trecho}</pre>` : ''}`;

        return await this.ShowCustomAlert('error', iconHtml, title, message, "OK");
    },

    ShowPreventionAlert: async function (message) {
        const iconHtml = '<img src="/images/confirmar_transparente.png" style="max-width: 150px; width: 100%; height: auto; margin-bottom: 10px;">';
        const title = 'Atenção ao Preenchimento dos Dados';
        const confirmText = 'Tenho certeza! 💪🏼';
        const cancelText = 'Me enganei! 😟';

        const confirmado = await this.ShowCustomAlert('warning', iconHtml, title, message, confirmText, cancelText);

        return confirmado;
    },

    ShowNotification: function (message, color = "#28a745") {
        let notify = document.getElementById("sweet-alert-notify");
        if (!notify) {
            notify = document.createElement("div");
            notify.id = "sweet-alert-notify";
            notify.style.position = "fixed";
            notify.style.top = "20px";
            notify.style.right = "20px";
            notify.style.zIndex = "10000";
            notify.style.minWidth = "200px";
            notify.style.padding = "12px 20px";
            notify.style.borderRadius = "8px";
            notify.style.fontSize = "16px";
            notify.style.fontFamily = "'Segoe UI', sans-serif";
            notify.style.color = "white";
            notify.style.display = "none";
            document.body.appendChild(notify);
        }

        notify.textContent = message;
        notify.style.backgroundColor = color;
        notify.style.display = "block";

        setTimeout(() => {
            notify.style.display = "none";
        }, 3000);
    },
};


/**
 * @typedef {{
 *   ShowConfirm: (titulo: string, texto: string, confirm?: string, cancel?: string) => Promise<boolean>,
 *   ShowError: Function,
 *   ShowInfo: Function,
 *   ShowSuccess: Function,
 *   ShowWarning: Function
 * }} SweetAlertInteropAPI
 */

/** @type {SweetAlertInteropAPI} */
window.SweetAlertInterop;


//  ——————————————————————————————————————————————————
//  Limpa a ^ Tela ^ depois do fechamento de um Modal
//  —————————————————————————————————————————————————— 
function limparResiduosModalVanilla()
{
    // Remove apenas overlays do SweetAlert
    document.querySelectorAll('.swal2-container, .swal2-backdrop-show').forEach(e => e.remove());
    // NÃO remove mais .modal-backdrop!
    // NÃO mexe mais na class modal-open ou no overflow/zIndex do body!

    // Remover apenas DIVs fullscreen criadas pelo SweetAlert, NÃO do Bootstrap!
    document.querySelectorAll('div').forEach(div =>
    {
        const style = getComputedStyle(div);
        if (
            (style.position === 'fixed' || style.position === 'absolute') &&
            parseInt(style.zIndex || 0) >= 2000 && // z-index mais alto para SweetAlert
            (parseInt(style.width) === window.innerWidth || style.width === '100vw' || style.left === '0px') &&
            (parseInt(style.height) === window.innerHeight || style.height === '100vh' || style.top === '0px')
        )
        {
            // NÃO remove divs de calendar ou do Bootstrap
            if (
                !div.classList.contains('fc') &&
                !div.classList.contains('fc-view-harness') &&
                !div.classList.contains('modal-backdrop') &&
                !div.closest('.modal') // não é filho de modal do Bootstrap
            )
            {
                div.remove();
            }
        }
    });
}



