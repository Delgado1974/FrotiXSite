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

namespace FrotiX.Pages.Veiculo
{
    public class UploadCRLVModel : PageModel
    {
        public static Guid veiculoId;
        public static int CRLV;

        private readonly IUnitOfWork _unitOfWork;

        private IHostingEnvironment hostingEnv;

        public UploadCRLVModel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }


        [BindProperty]
        public VeiculoViewModel VeiculoObj { get; set; }

        private void SetViewModel()
        {
            VeiculoObj = new VeiculoViewModel
            {
                Veiculo = new Models.Veiculo()
            };
        }

        public ActionResult OnGet(Guid id)
        {
            SetViewModel();

            veiculoId = id;
            CRLV = 0;

            if (id != Guid.Empty)
            {
                VeiculoObj.Veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.VeiculoId == id);
                if (VeiculoObj == null)
                {
                    return NotFound();
                }

                if (VeiculoObj.Veiculo.CRLV != null)
                {
                    CRLV = 1;
                }
            }

            return Page();
        }




    }
}
