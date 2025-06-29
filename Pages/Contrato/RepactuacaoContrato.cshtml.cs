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
using Microsoft.AspNetCore.Hosting;
using AspNetCoreHero.ToastNotification.Abstractions;

namespace FrotiX.Pages.Contrato
{

    [Consumes("application/json")]
    [IgnoreAntiforgeryToken]
    public class RepactuacaoContratoModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;

        private readonly INotyfService _notyf;

        public static Guid contratoId;


        public RepactuacaoContratoModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, IWebHostEnvironment hostingEnvironment, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
             _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }


        [BindProperty]
        public ContratoViewModel ContratoObj { get; set; }

        private void SetViewModel()
        {
            ContratoObj = new ContratoViewModel
            {
                FornecedorList = _unitOfWork.Fornecedor.GetFornecedorListForDropDown(),
                Contrato = new Models.Contrato()
            };
        }

        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null && id != Guid.Empty)
            {
                ContratoObj.Contrato = _unitOfWork.Contrato.GetFirstOrDefault(u => u.ContratoId == id);
                if (ContratoObj == null)
                {
                    return NotFound();
                }
            }
            else
            {
                ContratoObj.Contrato.Status = true;
            }
            return Page();
        }


        //Insere Novo Contrato
        //====================
        public JsonResult OnPostInsereContrato(Models.Contrato contrato)
        {
             var existeContrato = _unitOfWork.Contrato.GetFirstOrDefault(u => (u.AnoContrato == contrato.AnoContrato) && (u.NumeroContrato == contrato.NumeroContrato));
            if (existeContrato != null && existeContrato.ContratoId != contrato.ContratoId)
            {
                _notyf.Error("Já existe um contrato com esse número!", 3);
                SetViewModel();
                return new JsonResult(new { data = "00000000-0000-0000-0000-000000000000" });
            }

            _unitOfWork.Contrato.Add(contrato);

            _unitOfWork.Save();

            return new JsonResult(new { data = contrato.ContratoId, message = "Contrato Adicionado com Sucesso" });
        }

        //public IActionResult OnPostSubmit()
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        SetViewModel();
        //        return Page();
        //    }

        //    var existeContrato = _unitOfWork.Contrato.GetFirstOrDefault(u => (u.AnoContrato == ContratoObj.Contrato.AnoContrato) && (u.NumeroContrato == ContratoObj.Contrato.NumeroContrato));
        //    if (existeContrato != null && existeContrato.ContratoId != ContratoObj.Contrato.ContratoId)
        //    {
        //        _notyf.Error("Já existe um contrato com esse número!", 3);
        //        SetViewModel();
        //        return Page();
        //    }

        //    _unitOfWork.Contrato.Add(ContratoObj.Contrato);

        //    _unitOfWork.Save();

        //     return RedirectToPage("./Index");
        //}

        public IActionResult OnPostEdit(Guid id)
        {
            if (!ModelState.IsValid)
            {
                SetViewModel();
                ContratoObj.Contrato.ContratoId = id;
                return Page();
            }

            ContratoObj.Contrato.ContratoId = id;

            var existeContrato = _unitOfWork.Contrato.GetFirstOrDefault(u => (u.AnoContrato == ContratoObj.Contrato.AnoContrato) && (u.NumeroContrato == ContratoObj.Contrato.NumeroContrato));
            if (existeContrato != null && existeContrato.ContratoId != ContratoObj.Contrato.ContratoId)
            {
                _notyf.Error("Já existe um contrato com esse número!", 3);
                SetViewModel();
                ContratoObj.Contrato.ContratoId = id;
                return Page();
            }

            _unitOfWork.Contrato.Update(ContratoObj.Contrato);
            _unitOfWork.Save();

            _notyf.Success("Contrato atualizado com sucesso!", 3);

            return RedirectToPage("./Index");
        }

    }


}
