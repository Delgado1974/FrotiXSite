using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.ItensContrato
{
    public class ItensContratoModel : PageModel
    {

        private readonly IUnitOfWork _unitOfWork;

        private readonly INotyfService _notyf;

        public ItensContratoModel(IUnitOfWork unitOfWork, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
            _notyf = notyf;
        }

        [BindProperty]
        public ItensContratoViewModel ItensContratoObj { get; set; }

        private void SetViewModel()
        {
            ItensContratoObj = new ItensContratoViewModel
            {
                ContratoList = _unitOfWork.Contrato.GetContratoListForDropDown("", 1),
                ItensContrato = new Models.ItensContrato()
            };
        }

        public IActionResult OnGet()
        {
            SetViewModel();
            return Page();

        }

    }
}
