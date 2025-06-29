using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.MovimentacaoPatrimonio
{
    public class VisualizarMovimentacoesModel : PageModel
    {
        public Guid patrimonioId { get; set; } //Serve pra guarda o valor e poder chamar na cshtml com @model.patrimonioId
        public IActionResult OnGet(Guid? id)
        {

            if(id != null)
            {
                patrimonioId = (Guid)id;
            }

            return Page();
        }

    }
}
