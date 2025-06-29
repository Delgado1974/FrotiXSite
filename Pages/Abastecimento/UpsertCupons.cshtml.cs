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

namespace FrotiX.Pages.Abastecimento
{

    public class UpsertCuponsModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;

        private readonly INotyfService _notyf;

        private readonly IWebHostEnvironment _hostingEnvironment;

        public static Guid RegistroCupomId;

        public UpsertCuponsModel(IUnitOfWork unitOfWork, INotyfService notyf, IWebHostEnvironment hostingEnvironment)
        {
            _unitOfWork = unitOfWork;
            _notyf = notyf;
            _hostingEnvironment = hostingEnvironment;
        }

        [BindProperty]
        public RegistroCupomAbastecimentoViewModel RegistroCupomAbastecimentoObj { get; set; }

        private void SetViewModel()
        {
            RegistroCupomAbastecimentoObj = new RegistroCupomAbastecimentoViewModel
            {
                RegistroCupomAbastecimento = new Models.RegistroCupomAbastecimento()
            };
        }


        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null)
            {
                RegistroCupomId = (Guid)id;
            }

            if (id != null && id != Guid.Empty)
            {
                RegistroCupomAbastecimentoObj.RegistroCupomAbastecimento = _unitOfWork.RegistroCupomAbastecimento.GetFirstOrDefault(m => m.RegistroCupomId == id);
                if (RegistroCupomAbastecimentoObj == null)
                {
                    return NotFound();
                }
            }

            return Page();

        }


        public IActionResult OnPostSubmit()
        {

            _notyf.Success("Registro adicionado com sucesso!", 3);
            _unitOfWork.RegistroCupomAbastecimento.Add(RegistroCupomAbastecimentoObj.RegistroCupomAbastecimento);
            _unitOfWork.Save();

            return RedirectToPage("./RegistraCupons");
        }

        public IActionResult OnPostEdit(Guid Id)
        {

            RegistroCupomAbastecimentoObj.RegistroCupomAbastecimento.RegistroCupomId = Id;

            Guid RegistroCupomId = Guid.Empty;

            if (RegistroCupomAbastecimentoObj.RegistroCupomAbastecimento.RegistroCupomId != Guid.Empty)
            {
                RegistroCupomId = RegistroCupomAbastecimentoObj.RegistroCupomAbastecimento.RegistroCupomId;
            }

            _notyf.Success("Registro atualizado com sucesso!", 3);
            _unitOfWork.RegistroCupomAbastecimento.Update(RegistroCupomAbastecimentoObj.RegistroCupomAbastecimento);

            _unitOfWork.Save();

            return RedirectToPage("./RegistraCupons");
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
                    string folderName = "DadosEditaveis/Cupons";
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
                        //string fullPath = Path.Combine(newPath, file.FileName.Replace(" ", "_"));
                        string fullPath = Path.Combine(newPath, TiraAcento(file.FileName));
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


        static string TiraAcento(string frase)
        {
            StringBuilder resultado = new StringBuilder();

            foreach (char c in frase)
            {
                char caractereSemAcento = RemoveAcento(c);
                resultado.Append(caractereSemAcento == ' ' ? '_' : caractereSemAcento);
            }

            return resultado.ToString().ToUpper();
        }

        static char RemoveAcento(char c)
        {
            switch (c)
            {
                case 'Á': case 'á': return 'a';
                case 'É': case 'é': return 'e';
                case 'Í': case 'í': return 'i';
                case 'Ó': case 'ó': return 'o';
                case 'Ú': case 'ú': return 'u';
                case 'À': case 'à': return 'a';
                case 'È': case 'è': return 'e';
                case 'Ì': case 'ì': return 'i';
                case 'Ò': case 'ò': return 'o';
                case 'Ù': case 'ù': return 'u';
                case 'Â': case 'â': return 'a';
                case 'Ê': case 'ê': return 'e';
                case 'Î': case 'î': return 'i';
                case 'Ô': case 'ô': return 'o';
                case 'Û': case 'û': return 'u';
                case 'Ã': case 'ã': return 'a';
                case 'Õ': case 'õ': return 'o';
                case 'Ç': case 'ç': return 'c';
                default: return c;
            }
        }


    }

}
