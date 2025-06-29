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
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace FrotiX.Pages.Multa
{

    public class UpsertTipoMultaModel : PageModel
    {
        private static Guid veiculoId;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<UpsertTipoMultaModel> _logger;

        private readonly INotyfService _notyf;

        public UpsertTipoMultaModel(IUnitOfWork unitOfWork, ILogger<UpsertTipoMultaModel> logger, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
             _logger = logger;
            _notyf = notyf;
        }

        [BindProperty]
        public Models.TipoMulta TipoMultaObj { get; set; }

        public IActionResult OnGet(Guid? id)
        {
            TipoMultaObj = new Models.TipoMulta();

            if (id != null && id != Guid.Empty)
            {
                TipoMultaObj = _unitOfWork.TipoMulta.GetFirstOrDefault(u => u.TipoMultaId == id);
                if (TipoMultaObj == null)
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
            var existeTipoMulta = _unitOfWork.TipoMulta.GetFirstOrDefault(u =>
                    u.Artigo.ToUpper() == TipoMultaObj.Artigo.ToUpper());

            if (TipoMultaObj.TipoMultaId != Guid.Empty && existeTipoMulta != null)
            {
                if (TipoMultaObj.TipoMultaId != existeTipoMulta.TipoMultaId)
                {
                    _notyf.Error("Já existe esta infração cadastrada!", 3);
                    //return RedirectToPage("./ListaTiposMulta");
                    return Page();
                }
            }
            else if(existeTipoMulta != null) 
            {
                _notyf.Error("Já existe esta infração cadastrada!", 3);
                //return RedirectToPage("./ListaTiposMulta");
                return Page();
            }


            if (TipoMultaObj.TipoMultaId == Guid.Empty)
            {
               _unitOfWork.TipoMulta.Add(TipoMultaObj);
                _notyf.Success("Infração cadastrada com sucesso!", 3);
            }
            else
            {
                _unitOfWork.TipoMulta.Update(TipoMultaObj);
                _notyf.Success("Infração atualizada com sucesso!", 3);
            }
            _unitOfWork.Save();

            return RedirectToPage("./ListaTiposMulta");
        }

    }


}
