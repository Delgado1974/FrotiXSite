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

    public class UpsertOrgaoAutuanteModel : PageModel
    {
        private static Guid veiculoId;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<UpsertOrgaoAutuanteModel> _logger;

        private readonly INotyfService _notyf;

        public UpsertOrgaoAutuanteModel(IUnitOfWork unitOfWork, ILogger<UpsertOrgaoAutuanteModel> logger, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
             _logger = logger;
            _notyf = notyf;
        }

        [BindProperty]
        public Models.OrgaoAutuante OrgaoAutuanteObj { get; set; }

        public IActionResult OnGet(Guid? id)
        {
            OrgaoAutuanteObj = new Models.OrgaoAutuante();

            if (id != null && id != Guid.Empty)
            {
                OrgaoAutuanteObj = _unitOfWork.OrgaoAutuante.GetFirstOrDefault(u => u.OrgaoAutuanteId == id);
                if (OrgaoAutuanteObj == null)
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
            var existeOrgaoAutuante = _unitOfWork.OrgaoAutuante.GetFirstOrDefault(u =>
                    u.Nome.ToUpper() == OrgaoAutuanteObj.Nome.ToUpper());

            if (OrgaoAutuanteObj.OrgaoAutuanteId != Guid.Empty && existeOrgaoAutuante != null)
            {
                if (OrgaoAutuanteObj.OrgaoAutuanteId != existeOrgaoAutuante.OrgaoAutuanteId)
                {
                    _notyf.Error("Já existe este Órgão cadastrada!", 3);
                    //return RedirectToPage("./ListaTiposMulta");
                    return Page();
                }
            }
            else if(existeOrgaoAutuante != null) 
            {
                _notyf.Error("Já existe este órgão cadastrada!", 3);
                //return RedirectToPage("./ListaTiposMulta");
                return Page();
            }


            if (OrgaoAutuanteObj.OrgaoAutuanteId == Guid.Empty)
            {
               _unitOfWork.OrgaoAutuante.Add(OrgaoAutuanteObj);
                _notyf.Success("Órgão Autuante cadastrado com sucesso!", 3);
            }
            else
            {
                _unitOfWork.OrgaoAutuante.Update(OrgaoAutuanteObj);
                _notyf.Success("Órgão Autuante atualizado com sucesso!", 3);
            }
            _unitOfWork.Save();

            return RedirectToPage("./ListaOrgaosAutuantes");
        }

    }


}
