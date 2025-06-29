using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Models.Cadastros;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Patrimonio
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        //private readonly UserManager<Usuario> _userManager;

        private readonly INotyfService _notyf;

        public static Guid patrimonioId;

        public UpsertModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, IWebHostEnvironment hostingEnvironment, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }

        [BindProperty]
        public PatrimonioViewModel PatrimonioObj { get; set; }

        //Tem que tirar essa ViewModel que não adianta pra porra nenhuma
        private void SetViewModel()
        {
            PatrimonioObj = new PatrimonioViewModel
            {
                //ContratoList = _unitOfWork.Contrato.GetContratoListForDropDown("Terceirização", 1),
                Patrimonio = new Models.Patrimonio()
            };

        }


        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null)
            {
                patrimonioId = (Guid)id;

            }

            if (id != null && id != Guid.Empty)
            {
                PatrimonioObj.Patrimonio = _unitOfWork.Patrimonio.GetFirstOrDefault(u => u.PatrimonioId == id);
                if (PatrimonioObj == null)
                {
                    return NotFound();
                }
                PatrimonioObj.PatrimonioId = PatrimonioObj.Patrimonio.PatrimonioId;

            }
            return Page();
        }

        public IActionResult OnPostSubmit(IFormFile UploadedFile)
        {
            //Validações:

            //Verifica se já não tem um Patrimonio com esse Id
            //====================
            if (PatrimonioObj.Patrimonio.PatrimonioId == Guid.Empty)
            { //Adicionei esse trecho para verificar se o NPR já existe
                if (_unitOfWork.Patrimonio.GetFirstOrDefault(n => n.NPR == PatrimonioObj.Patrimonio.NPR) != null)
                {
                    ModelState.AddModelError(string.Empty, "O NPR já existe no sistema");
                    SetViewModel();
                    return Page();
                }
                if(PatrimonioObj.Patrimonio.NPR == "")
                {
                    ModelState.AddModelError(string.Empty, "O NPR não pode estar vazio");
                    SetViewModel();
                    return Page();
                }
                if(PatrimonioObj.Patrimonio.SetorId == Guid.Empty)
                {
                    ModelState.AddModelError(string.Empty, "O setor não pode estar vazio");
                    SetViewModel();
                    return Page();

                } else if( PatrimonioObj.Patrimonio.SecaoId == Guid.Empty)
                {

                    ModelState.AddModelError(string.Empty, "A seção não pode estar vazia");
                    SetViewModel();
                    return Page();
                }
                else if (string.IsNullOrWhiteSpace(PatrimonioObj.Patrimonio.Descricao))
                {
                    ModelState.AddModelError(string.Empty, "A descrição não pode estar vazia");
                    SetViewModel();
                    return Page();
                }
                else if (PatrimonioObj.Patrimonio.Situacao == "")
                {

                    ModelState.AddModelError(string.Empty, "A situação não pode estar vazia");
                    SetViewModel();
                    return Page();
                }

                if (UploadedFile != null)
                {
                    string uploadsFolder = Path.Combine(_hostingEnvironment.WebRootPath, "ImagensPatrimonio");
                    Directory.CreateDirectory(uploadsFolder); // Ensure directory exists

                    string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(UploadedFile.FileName);
                    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        UploadedFile.CopyTo(fileStream);
                    }

                    PatrimonioObj.Patrimonio.ImageUrl = "/ImagensPatrimonio/" + uniqueFileName;
                }

                _unitOfWork.Patrimonio.Add(PatrimonioObj.Patrimonio);


            }
            _unitOfWork.Save();
            _notyf.Success("Patrimonio adicionado com sucesso!", 3);
            return RedirectToPage("./Index");
        }
        public IActionResult OnPostEdit(Guid id, string npratual)
        {
            if (!ModelState.IsValid)
            {
                SetViewModel(); // Recarregar listas em caso de erro
                PatrimonioObj.Patrimonio.PatrimonioId = id;
                return Page();
            }

            // Verificar se o NPR já existe
            var patrimonioExistente = _unitOfWork.Patrimonio.GetFirstOrDefault(n => n.NPR == PatrimonioObj.Patrimonio.NPR);
            if (patrimonioExistente != null && patrimonioExistente.NPR != npratual)
            {
                ModelState.AddModelError(string.Empty, "O NPR já existe no sistema");
                SetViewModel();
                return Page();
            }

            // Validações adicionais
            if (string.IsNullOrWhiteSpace(PatrimonioObj.Patrimonio.NPR))
            {
                ModelState.AddModelError(string.Empty, "O NPR não pode estar vazio");
                SetViewModel();
                return Page();
            }           
            if (PatrimonioObj.Patrimonio.SetorId == Guid.Empty)
            {
                ModelState.AddModelError(string.Empty, "O setor não pode estar vazio");
                SetViewModel();
                return Page();
            }
            if (PatrimonioObj.Patrimonio.SecaoId == Guid.Empty)
            {
                ModelState.AddModelError(string.Empty, "A seção não pode estar vazia");
                SetViewModel();
                return Page();
            }
            if (string.IsNullOrWhiteSpace(PatrimonioObj.Patrimonio.Descricao))
            {
                ModelState.AddModelError(string.Empty, "A descrição não pode estar vazia");
                SetViewModel();
                return Page();
            }
            if (string.IsNullOrWhiteSpace(PatrimonioObj.Patrimonio.Situacao))
            {
                ModelState.AddModelError(string.Empty, "A situação não pode estar vazia");
                SetViewModel();
                return Page();
            }           

            // Atualizar patrimônio
            PatrimonioObj.Patrimonio.PatrimonioId = id;

            _unitOfWork.Patrimonio.Update(PatrimonioObj.Patrimonio);
            _unitOfWork.Save();

            _notyf.Success("Patrimônio atualizado com sucesso!", 3);

            return RedirectToPage("./Index");
        }


        //    public IActionResult OnPostEdit(Guid id, string npratual)          
        //    {

        //        if (!ModelState.IsValid)
        //        {
        //            SetViewModel();
        //            PatrimonioObj.Patrimonio.PatrimonioId = id;
        //            return Page();
        //        }
        //        if (_unitOfWork.Patrimonio.GetFirstOrDefault(n => n.NPR == PatrimonioObj.Patrimonio.NPR) != null &&
        //            _unitOfWork.Patrimonio.GetFirstOrDefault(n => n.NPR == PatrimonioObj.Patrimonio.NPR).NPR != npratual)
        //        {
        //            ModelState.AddModelError(string.Empty, "O NPR já existe no sistema");
        //            SetViewModel();
        //            return Page();
        //        }
        //        if (PatrimonioObj.Patrimonio.NPR == "")
        //        {
        //            ModelState.AddModelError(string.Empty, "O NPR não pode estar vazio");
        //            SetViewModel();
        //            return Page();
        //        }
        //        if (PatrimonioObj.Patrimonio.SetorId == Guid.Empty)
        //        {
        //            ModelState.AddModelError(string.Empty, "O setor não pode estar vazio");
        //            SetViewModel();
        //            return Page();

        //        }
        //        else if (PatrimonioObj.Patrimonio.SecaoId == Guid.Empty)
        //        {

        //            ModelState.AddModelError(string.Empty, "A seção não pode estar vazia");
        //            SetViewModel();
        //            return Page();
        //        }
        //        else if (PatrimonioObj.Patrimonio.Situacao == "")
        //        {

        //            ModelState.AddModelError(string.Empty, "A situação não pode estar vazia");
        //            SetViewModel();
        //            return Page();
        //        }
        //        PatrimonioObj.Patrimonio.PatrimonioId = id;

        //        //if (ChecaDuplicado(OperadorObj.Operador.OperadorId))
        //        //{
        //        //    SetViewModel();
        //        //    OperadorObj.Operador.OperadorId = id;
        //        //    return Page();
        //        //}

        //        //OperadorObj.Operador.DataAlteracao = DateTime.Now;

        //        _unitOfWork.Patrimonio.Update(PatrimonioObj.Patrimonio);
        //        _unitOfWork.Save();

        //        _notyf.Success("Patrimonio atualizado com sucesso!", 3);

        //        return RedirectToPage("./Index");
        //    }

    }
}
