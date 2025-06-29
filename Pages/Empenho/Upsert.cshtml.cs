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

namespace FrotiX.Pages.Empenho
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;

        private readonly INotyfService _notyf;

        public static Guid empenhoId;


        public UpsertModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, IWebHostEnvironment hostingEnvironment, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }


        [BindProperty]
        public EmpenhoViewModel EmpenhoObj { get; set; }

        private void SetViewModel()
        {
            EmpenhoObj = new EmpenhoViewModel
            {
                ContratoList = _unitOfWork.Contrato.GetContratoListForDropDown("", 1),
                AtaList = _unitOfWork.AtaRegistroPrecos.GetAtaListForDropDown(1),
                Empenho = new Models.Empenho()
            };
        }

        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null && id != Guid.Empty)
            {
                EmpenhoObj.Empenho = _unitOfWork.Empenho.GetFirstOrDefault(u => u.EmpenhoId == id);
                if (EmpenhoObj == null)
                {
                    return NotFound();
                }
            }
            return Page();
        }


    }


}
