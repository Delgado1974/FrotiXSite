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

    public class UpsertEmpenhosMultaModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotyfService _notyf;

        public UpsertEmpenhosMultaModel(IUnitOfWork unitOfWork, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
            _notyf = notyf;
        }

        [BindProperty]
        public EmpenhoMultaViewModel EmpenhoMultaObj { get; set; }

        private void SetViewModel()
        {
            EmpenhoMultaObj = new EmpenhoMultaViewModel
            {
                OrgaoList = _unitOfWork.OrgaoAutuante.GetOrgaoAutuanteListForDropDown(),
                EmpenhoMulta = new Models.EmpenhoMulta()
            };
        }

        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null && id != Guid.Empty)
            {
                EmpenhoMultaObj.EmpenhoMulta = _unitOfWork.EmpenhoMulta.GetFirstOrDefault(e => e.EmpenhoMultaId == id);
                if (EmpenhoMultaObj == null)
                {
                    return NotFound();
                }
            }

            return Page();

        }

        
        public IActionResult OnPostSubmit()
        {

            //if (!ModelState.IsValid)
            //{
            //    SetViewModel();
            //    return Page();
            //}

            if (EmpenhoMultaObj.EmpenhoMulta.OrgaoAutuanteId == null)
            {
                _notyf.Error("Você deve informar o Órgão Autuante!", 3);
                SetViewModel();
                return Page();
            }

            if (EmpenhoMultaObj.EmpenhoMulta.NotaEmpenho == null)
            {
                _notyf.Error("Você deve informar o número da Nota de Empenho!", 3);
                SetViewModel();
                return Page();
            }

            if (EmpenhoMultaObj.EmpenhoMulta.NotaEmpenho.Length != 12)
            {
                _notyf.Error("A Nota de Empenho deve ter 12 (doze) dígitos!", 3);
                SetViewModel();
                return Page();
            }

            if (EmpenhoMultaObj.EmpenhoMulta.AnoVigencia == null)
            {
                _notyf.Error("Você deve informar o Ano de Vigência!", 3);
                SetViewModel();
                return Page();
            }

            if (EmpenhoMultaObj.EmpenhoMulta.SaldoInicial == null)
            {
                _notyf.Error("Você deve informar o Saldo Inicial!", 3);
                SetViewModel();
                return Page();
            }

            //Verifica Duplicado
            var existeEmpenho = _unitOfWork.EmpenhoMulta.GetFirstOrDefault(e =>
                    e.NotaEmpenho == EmpenhoMultaObj.EmpenhoMulta.NotaEmpenho);

            if (EmpenhoMultaObj.EmpenhoMulta.EmpenhoMultaId != Guid.Empty && existeEmpenho != null)
            {
                if (EmpenhoMultaObj.EmpenhoMulta.EmpenhoMultaId != existeEmpenho.EmpenhoMultaId)
                {
                    _notyf.Error("Já existe este Empenho cadastrada!", 3);
                    SetViewModel();
                    return Page();
                }
            }
            else if(existeEmpenho != null) 
            {
                _notyf.Error("Já existe este Empenho cadastrado!", 3);
                SetViewModel();
                return Page();
            }

            if (EmpenhoMultaObj.EmpenhoMulta.EmpenhoMultaId == Guid.Empty)
            {
                EmpenhoMultaObj.EmpenhoMulta.SaldoAtual = EmpenhoMultaObj.EmpenhoMulta.SaldoInicial;
               _unitOfWork.EmpenhoMulta.Add(EmpenhoMultaObj.EmpenhoMulta);
                _notyf.Success("Nota de Empenho cadastrada com sucesso!", 3);
            }
            else
            {
                _unitOfWork.EmpenhoMulta.Update(EmpenhoMultaObj.EmpenhoMulta);
                _notyf.Success("Nota de Empenho atualizada com sucesso!", 3);
            }
            _unitOfWork.Save();

            return RedirectToPage("./ListaEmpenhosMulta");
        }

    }


}
