using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using FrotiX.Services;
using FrotiX.Models;
using System.IO;
using Microsoft.Extensions.Configuration;
using AspNetCoreHero.ToastNotification.Abstractions;

namespace FrotiX.Pages.Combustivel
{

    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly INotyfService _notyf;

        public UpsertModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
             _logger = logger;
            _notyf = notyf;
        }


        [BindProperty]
        public Models.Combustivel CombustivelObj { get; set; }

        public IActionResult OnGet(Guid? id)
        {
            CombustivelObj = new Models.Combustivel();
            if (id != null && id != Guid.Empty)
            {
                CombustivelObj = _unitOfWork.Combustivel.GetFirstOrDefault(u => u.CombustivelId == id);
                if (CombustivelObj == null)
                {
                    return NotFound();
                }
            }
            return Page();

        }

        
        public IActionResult OnPostSubmit()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            // Verifica Duplicidades
            var existeCombustivel = _unitOfWork.Combustivel.GetFirstOrDefault(u => u.Descricao.ToUpper() == CombustivelObj.Descricao.ToUpper());
            if (existeCombustivel != null && existeCombustivel.CombustivelId != CombustivelObj.CombustivelId)
            {
                _notyf.Error("Já existe um combustível com esse nome!", 3);
                return Page();
            }


            if (CombustivelObj.CombustivelId == Guid.Empty)
            {
                _notyf.Success("Combustível adicionado com sucesso!", 3);
                _unitOfWork.Combustivel.Add(CombustivelObj);
            }
            else
            {
                _notyf.Success("Combustível atualizado com sucesso!", 3);
                _unitOfWork.Combustivel.Update(CombustivelObj);
            }
            _unitOfWork.Save();
             return RedirectToPage("./Index");
        }


    }


}
