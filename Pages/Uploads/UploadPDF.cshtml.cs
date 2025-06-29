using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Uploads
{
    public class UploadPDFModel : PageModel
    {
        private IHostingEnvironment _hostingEnvironment;

        public UploadPDFModel(IHostingEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        public void OnGet()
        {

        }

        public ActionResult OnPostSaveIMGManutencao(IEnumerable<IFormFile> files)
        {
            // The Name of the Upload component is "files"
            if (files != null)
            {
                foreach (var file in files)
                {

                    //IFormFile file = Request.Form.Files[0];
                    string folderName = "DadosEditaveis/ImagensOcorrencias";
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
                        string fullPath = Path.Combine(newPath, file.FileName);
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


        public ActionResult OnPostSaveIMGManutencaoNovo(IEnumerable<IFormFile> filesnovo)
        {
            // The Name of the Upload component is "files"
            if (filesnovo != null)
            {
                foreach (var file in filesnovo)
                {

                    //IFormFile file = Request.Form.Files[0];
                    string folderName = "DadosEditaveis/ImagensOcorrencias";
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
                        string fullPath = Path.Combine(newPath, file.FileName);
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


        public ActionResult OnPostRemoveIMGManutencao(string[] fileNames)
        {
            // The parameter of the Remove action must be called "fileNames"

            if (fileNames != null)
            {
                foreach (var fullName in fileNames)
                {
                    var fileName = Path.GetFileName(fullName);
                    var physicalPath = Path.Combine("App_Data", fileName);

                    // TODO: Verify user permissions

                    if (System.IO.File.Exists(physicalPath))
                    {
                        // The files are not actually removed in this demo
                        // System.IO.File.Delete(physicalPath);
                    }
                }
            }

            // Return an empty string to signify success
            return Content("");
        }
    }
}
