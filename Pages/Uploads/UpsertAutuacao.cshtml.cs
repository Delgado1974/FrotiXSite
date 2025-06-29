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

namespace FrotiX.Pages.Uploads
{

    public class UpsertMultaModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;

        private readonly INotyfService _notyf;

        private readonly IWebHostEnvironment _hostingEnvironment;

        public static Guid multaId;

        public UpsertMultaModel(IUnitOfWork unitOfWork, INotyfService notyf, IWebHostEnvironment hostingEnvironment)
        {
            _unitOfWork = unitOfWork;
            _notyf = notyf;
            _hostingEnvironment = hostingEnvironment;
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
                    string folderName = "DadosEditaveis/Multas";
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


        //------------- Salva o PDF no Diretório -------------------
        //==========================================================
        public ActionResult OnPostSaveImagemOcorrencia(IEnumerable<IFormFile> files)
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
