using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Multa
{
    public class RegistraCuponsModel : PageModel
    {

        public static IUnitOfWork _unitOfWork;

        private readonly IWebHostEnvironment _hostingEnvironment;

        public RegistraCuponsModel(IUnitOfWork unitOfWork, IWebHostEnvironment hostingEnvironment)
        {
            _unitOfWork = unitOfWork;
            _hostingEnvironment = hostingEnvironment;
        }

        public void OnGet()
        {

        }

        //------------- Salva o PDF no Diretório -------------------
        //==========================================================
        public ActionResult OnPostSavePDF(IEnumerable<IFormFile> files)
        {
            // The Name of the Upload component is "files"
            if (files != null)
            {
                foreach (var file in files)
                {

                    //IFormFile file = Request.Form.Files[0];
                    string folderName = "Cupons";
                    string webRootPath = _hostingEnvironment.WebRootPath;
                    string newPath = Path.Combine(webRootPath, folderName);
                    StringBuilder sb = new StringBuilder();
                    if (!Directory.Exists(newPath))
                    {
                        Directory.CreateDirectory(newPath);
                    }
                    if (file.Length > 0)
                    {
                        string sFileExtension = Path.GetExtension(file.FileName).ToLower();
                        string fullPath = Path.Combine(newPath, file.FileName.Replace(" ", "_"));
                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                    }

                }
            }

            // Return an empty string to signify success
            return Content("");
        }

    }

}
