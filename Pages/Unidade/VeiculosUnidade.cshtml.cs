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

namespace FrotiX.Pages.Unidade
{
    public class VeiculosUnidadeModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;

        private readonly INotyfService _notyf;


        public VeiculosUnidadeModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
             _logger = logger;
            _notyf = notyf;
        }

        public static Guid unidadeId;

        [BindProperty]
        public Models.Unidade UnidadeObj { get; set; }

        public IActionResult OnGet(Guid? id)
        {
            UnidadeObj = new Models.Unidade();
            if (id != null && id != Guid.Empty)
            {
                UnidadeObj = _unitOfWork.Unidade.GetFirstOrDefault(u => u.UnidadeId == id);
                if (UnidadeObj == null)
                {
                    return NotFound();
                }
            }
            unidadeId = UnidadeObj.UnidadeId;
            return Page();

        }


        public IActionResult OnPostSubmit()
        {
            return Page();
        }

    }
}
