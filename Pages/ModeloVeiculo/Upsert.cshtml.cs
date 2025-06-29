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


namespace FrotiX.Pages.ModeloVeiculo
{

    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;

        private readonly INotyfService _notyf;

        public UpsertModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, IWebHostEnvironment hostingEnvironment, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
             _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }


        [BindProperty]
        public ModeloVeiculoViewModel ModeloVeiculoObj { get; set; }

        private void SetViewModel()
        {
            ModeloVeiculoObj = new ModeloVeiculoViewModel
            {
                MarcaList = _unitOfWork.MarcaVeiculo.GetMarcaVeiculoListForDropDown(),
                ModeloVeiculo = new Models.ModeloVeiculo()
            };
        }

        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null && id != Guid.Empty)
            {
                ModeloVeiculoObj.ModeloVeiculo = _unitOfWork.ModeloVeiculo.GetFirstOrDefault(u => u.ModeloId == id);
                if (ModeloVeiculoObj == null)
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

            if (ChecaDuplicado(null))
            {
                _notyf.Error("Já existe este modelo para esta marca!", 3);
                SetViewModel();
                return Page();
            }

            _unitOfWork.ModeloVeiculo.Add(ModeloVeiculoObj.ModeloVeiculo);
            _unitOfWork.Save();

            _notyf.Success("Modelo cadastrado com sucesso!", 3);

            return RedirectToPage("./Index");
        }

        public IActionResult OnPostEdit(Guid id)
        {
             if (!ModelState.IsValid)
            {
                SetViewModel();
                ModeloVeiculoObj.ModeloVeiculo.ModeloId = id;
                return Page();
            }

            ModeloVeiculoObj.ModeloVeiculo.ModeloId = id;

            if (ChecaDuplicado(ModeloVeiculoObj.ModeloVeiculo.ModeloId))
            {
                _notyf.Error("Já existe este modelo para esta marca!", 3);
                SetViewModel();
                ModeloVeiculoObj.ModeloVeiculo.ModeloId = id;
                return Page();
            }

            _unitOfWork.ModeloVeiculo.Update(ModeloVeiculoObj.ModeloVeiculo);
            _unitOfWork.Save();

            _notyf.Success("Modelo atualizado com sucesso!", 3);

            return RedirectToPage("./Index");
        }

        private bool ChecaDuplicado(Guid? id)
        {
            var existeModelo = _unitOfWork.ModeloVeiculo.GetFirstOrDefault(u =>
                                u.DescricaoModelo.ToUpper() == ModeloVeiculoObj.ModeloVeiculo.DescricaoModelo.ToUpper() &&
                                u.MarcaId == ModeloVeiculoObj.ModeloVeiculo.MarcaId
                                );
            if (id == null && existeModelo != null)
            {
                return true;
            }
            if (existeModelo != null && existeModelo.ModeloId != ModeloVeiculoObj.ModeloVeiculo.ModeloId)
            {
                return true;
            }
            return false;
        }
    }


}
