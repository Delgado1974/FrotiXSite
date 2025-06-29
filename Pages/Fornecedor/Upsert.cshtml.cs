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
using Newtonsoft.Json;
using AspNetCoreHero.ToastNotification.Abstractions;

namespace FrotiX.Pages.Fornecedor
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
        public Models.Fornecedor FornecedorObj { get; set; }

        public IActionResult OnGet(Guid? id)
        {

            FornecedorObj = new Models.Fornecedor();
            if (id != null && id != Guid.Empty)
            {
                FornecedorObj = _unitOfWork.Fornecedor.GetFirstOrDefault(u => u.FornecedorId == id);
                if (FornecedorObj == null)
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
            var existeCNPJ = _unitOfWork.Fornecedor.GetFirstOrDefault(u => u.CNPJ == FornecedorObj.CNPJ);
            if (existeCNPJ != null && existeCNPJ.FornecedorId != FornecedorObj.FornecedorId)
            {
                _notyf.Error("Já existe um fornecedor com este CNPJ!", 3);
                return Page();
            }

            if (FornecedorObj.FornecedorId == Guid.Empty)
            {
                _unitOfWork.Fornecedor.Add(FornecedorObj);
            }
            else
            {
                _unitOfWork.Fornecedor.Update(FornecedorObj);
            }
            _unitOfWork.Save();
             return RedirectToPage("./Index");
        }


    }


}
