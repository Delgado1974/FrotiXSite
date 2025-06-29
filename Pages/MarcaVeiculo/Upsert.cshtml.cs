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

namespace FrotiX.Pages.MarcaVeiculo
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
        public Models.MarcaVeiculo MarcaVeiculoObj { get; set; }

        public IActionResult OnGet(Guid? id)
        {
            MarcaVeiculoObj = new Models.MarcaVeiculo();
            if (id != null && id != Guid.Empty)
            {
                MarcaVeiculoObj = _unitOfWork.MarcaVeiculo.GetFirstOrDefault(u => u.MarcaId == id);
                if (MarcaVeiculoObj == null)
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

            //Verifica Duplicado
            var existeMarca = _unitOfWork.MarcaVeiculo.GetFirstOrDefault(u =>
                    u.DescricaoMarca.ToUpper() == MarcaVeiculoObj.DescricaoMarca.ToUpper());

            if (MarcaVeiculoObj.MarcaId != Guid.Empty && existeMarca != null)
            {
                if (MarcaVeiculoObj.MarcaId != existeMarca.MarcaId)
                {
                    _notyf.Error("Já existe esta marca cadastrada!", 3);
                    return Page();
                }
            }
            else if(existeMarca != null) 
            {
                _notyf.Error("Já existe esta marca cadastrada!", 3);
                return Page();
            }


            if (MarcaVeiculoObj.MarcaId == Guid.Empty)
            {
                _unitOfWork.MarcaVeiculo.Add(MarcaVeiculoObj);
                _notyf.Success("Marca cadastrada com sucesso!", 3);
            }
            else
            {
                _unitOfWork.MarcaVeiculo.Update(MarcaVeiculoObj);
                _notyf.Success("Marca atualizada com sucesso!", 3);
            }
            _unitOfWork.Save();
             return RedirectToPage("./Index");
        }


    }


}
