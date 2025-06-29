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

namespace FrotiX.Pages.Agenda
{

    public class FichaAgendamentoModel : PageModel
    {
        private static Guid veiculoId;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;

        private readonly INotyfService _notyf;

        public FichaAgendamentoModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
             _logger = logger;
            _notyf = notyf;
        }


        [BindProperty]
        public ViagemViewModel ViagemObj { get; set; }

        private void SetViewModel()
        {
            ViagemObj = new ViagemViewModel
            {
                Viagem = new Models.Viagem()
            };
        }



        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null && id != Guid.Empty)
            {
                ViagemObj.Viagem = _unitOfWork.Viagem.GetFirstOrDefault(u => u.ViagemId == id);
                if (ViagemObj == null)
                {
                    return NotFound();
                }
            }

            return Page();

        }

    }

}
