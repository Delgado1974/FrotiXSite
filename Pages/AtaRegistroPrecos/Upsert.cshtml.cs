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

namespace FrotiX.Pages.AtaRegistroPrecos
{

    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _hostingEnvironment;

        private readonly INotyfService _notyf;

        public static Guid ataId;


        public UpsertModel(IUnitOfWork unitOfWork, IWebHostEnvironment hostingEnvironment, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }


        [BindProperty]
        public AtaRegistroPrecosViewModel AtaObj { get; set; }

        private void SetViewModel()
        {
            AtaObj = new AtaRegistroPrecosViewModel
            {
                FornecedorList = _unitOfWork.Fornecedor.GetFornecedorListForDropDown(),
                AtaRegistroPrecos = new Models.AtaRegistroPrecos()
            };
        }

        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null && id != Guid.Empty)
            {
                AtaObj.AtaRegistroPrecos = _unitOfWork.AtaRegistroPrecos.GetFirstOrDefault(u => u.AtaId == id);
                if (AtaObj == null)
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
                SetViewModel();
                return Page();
            }

            var existeAta = _unitOfWork.AtaRegistroPrecos.GetFirstOrDefault(u => (u.AnoAta == AtaObj.AtaRegistroPrecos.AnoAta) && (u.NumeroAta == AtaObj.AtaRegistroPrecos.NumeroAta));
            if (existeAta != null)
            {
                _notyf.Error("Já existe uma Ata com esse número!", 3);
                SetViewModel();
                return Page();
            }

            _unitOfWork.AtaRegistroPrecos.Add(AtaObj.AtaRegistroPrecos);

            _unitOfWork.Save();

            _notyf.Success("Ata adicionada com sucesso!", 3);

            return RedirectToPage("./Index");
        }

        public IActionResult OnPostEdit(Guid id)
        {
            if (!ModelState.IsValid)
            {
                SetViewModel();
                AtaObj.AtaRegistroPrecos.AtaId = id;
                return Page();
            }

            AtaObj.AtaRegistroPrecos.AtaId = id;

            var existeAta = _unitOfWork.AtaRegistroPrecos.GetFirstOrDefault(u => (u.AnoAta == AtaObj.AtaRegistroPrecos.AnoAta) && (u.NumeroAta == AtaObj.AtaRegistroPrecos.NumeroAta));
            if (existeAta != null && existeAta.AtaId != AtaObj.AtaRegistroPrecos.AtaId)
            {
                _notyf.Error("Já existe uma Ata com esse número!", 3);
                SetViewModel();
                AtaObj.AtaRegistroPrecos.AtaId = id;
                return Page();
            }

            _unitOfWork.AtaRegistroPrecos.Update(AtaObj.AtaRegistroPrecos);
            _unitOfWork.Save();

            _notyf.Success("Ata atualizada com sucesso!", 3);

            return RedirectToPage("./Index");
        }

    }


}
