using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Motorista
{
    public class UploadCNHModel : PageModel
    {
        public static Guid motoristaId;
        public static int CNHDigital;

        private readonly IUnitOfWork _unitOfWork;

        private IHostingEnvironment hostingEnv;

        public UploadCNHModel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }


        [BindProperty]
        public MotoristaViewModel MotoristaObj { get; set; }

        private void SetViewModel()
        {
            MotoristaObj = new MotoristaViewModel
            {
                Motorista = new Models.Motorista()
            };
        }

        public ActionResult OnGet(Guid id)
        {
            SetViewModel();

            motoristaId = id;
            CNHDigital = 0;

            if (id != Guid.Empty)
            {
                MotoristaObj.Motorista = _unitOfWork.Motorista.GetFirstOrDefault(u => u.MotoristaId == id);
                if (MotoristaObj == null)
                {
                    return NotFound();
                }

                if (MotoristaObj.Motorista.CNHDigital != null)
                {
                    CNHDigital = 1;
                }
            }

            return Page();
        }




    }
}
