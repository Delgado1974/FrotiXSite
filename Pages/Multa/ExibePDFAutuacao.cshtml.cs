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
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using HtmlAgilityPack;
using System.Text;

namespace FrotiX.Pages.Multa
{

    public class ExibePDFAutuacaoModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;

        private readonly INotyfService _notyf;

        private readonly IWebHostEnvironment _hostingEnvironment;

        public static Guid multaId;

        public ExibePDFAutuacaoModel(IUnitOfWork unitOfWork, INotyfService notyf, IWebHostEnvironment hostingEnvironment)
        {
            _unitOfWork = unitOfWork;
            _notyf = notyf;
            _hostingEnvironment = hostingEnvironment;
        }

        [BindProperty]
        public MultaViewModel MultaObj { get; set; }

        private void SetViewModel()
        {
            MultaObj = new MultaViewModel
            {
                Multa = new Models.Multa()
            };
        }


        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null)
            {
                multaId = (Guid)id;
            }

            if (id != null && id != Guid.Empty)
            {
                MultaObj.Multa = _unitOfWork.Multa.GetFirstOrDefault(m => m.MultaId == id);
                if (MultaObj == null)
                {
                    return NotFound();
                }
            }

            return Page();

        }
    }

}
