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
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using FrotiX.Settings;
using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Data;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Diagnostics;

namespace FrotiX.Pages.Usuarios
{

    public class UpsertRecursoModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        //private readonly UserManager<Usuario> _userManager;

        private readonly INotyfService _notyf;

        public static Guid recursoId;
        public static byte[] FotoRecurso;

        public UpsertRecursoModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, IWebHostEnvironment hostingEnvironment, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }


        [BindProperty]
        public RecursoViewModel RecursoObj { get; set; }

        private void SetViewModel()
        {
            RecursoObj= new RecursoViewModel
            {
                Recurso = new Models.Recurso()
            };
        }

        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null)
            {
                recursoId = (Guid)id;
            }


            if (id != null && id != Guid.Empty)
            {
                RecursoObj.Recurso = _unitOfWork.Recurso.GetFirstOrDefault(u => u.RecursoId == id);
                if (RecursoObj== null)
                {
                    return NotFound();
                }
            }
            return Page();
        }


        public IActionResult OnPostSubmit()
        {

            if (!ModelState.IsValid)
            {
                //var modelErrors = new List<string>();
                foreach (var modelState in ModelState.Values)
                {
                    foreach (var modelError in modelState.Errors)
                    {
                        var erromodel = modelError.ErrorMessage;
                        //modelErrors.Add(modelError.ErrorMessage);
                        SetViewModel();
                        return Page();
                    }
                }
                // do something with the error list :)
            }

            if (ChecaDuplicado(null))
            {
                SetViewModel();
                return Page();
            }
          

            _unitOfWork.Recurso.Add(RecursoObj.Recurso);

            Guid RecursoId = RecursoObj.Recurso.RecursoId;

            _unitOfWork.Save();

            //Insere o Recursos nos Usuários Disponíveis
            var objUsers = _unitOfWork.AspNetUsers.GetAll();

            foreach (var user in objUsers)
            {

                var objAcesso = new ControleAcesso();

                objAcesso.UsuarioId = user.Id;
                objAcesso.RecursoId = RecursoId;
                objAcesso.Acesso = false;

                _unitOfWork.ControleAcesso.Add(objAcesso);
                _unitOfWork.Save();
            }


            return RedirectToPage("./Recursos");
        }


        public IActionResult OnPostEdit(Guid id)
        {


            if (!ModelState.IsValid)
            {
                SetViewModel();
                RecursoObj.Recurso.RecursoId = id;
                return Page();
            }

            RecursoObj.Recurso.RecursoId = id;

            if (ChecaDuplicado(RecursoObj.Recurso.RecursoId))
            {
                SetViewModel();
                RecursoObj.Recurso.RecursoId = id;
                return Page();
            }

            _unitOfWork.Recurso.Update(RecursoObj.Recurso);
            _unitOfWork.Save();

            _notyf.Success("Recurso atualizado com sucesso!", 3);

            return RedirectToPage("./Recursos");
        }

        private bool ChecaDuplicado(Guid? id)
        {

            //// Verifica Duplicidades
            //var existeNome = _unitOfWork.Recurso.GetFirstOrDefault(u => u.Nome.ToUpper() == RecursoObj.Recurso.Nome.ToUpper());
            //if (id == null && existeNome != null)
            //{
            //    _notyf.Error("Já existe um Recurso com esse nome!", 3);
            //    return true;
            //}
            //if (existeNome != null && existeNome.RecursoId != id)
            //{
            //    _notyf.Error("Já existe um Recurso com esse nome!", 3);
            //    return true;
            //}

            //var existeCPF = _unitOfWork.Recurso.GetFirstOrDefault(u => u.CPF == RecursoObj.Recurso.CPF);
            //if (id == null && existeCPF!= null)
            //{
            //    _notyf.Error("Já existe um Recurso com esse CPF!", 3);
            //    return true;
            //}
            //if (existeCPF != null && existeCPF.RecursoId != id)
            //{
            //    _notyf.Error("Já existe um Recurso com esse CPF!", 3);
            //    return true;
            //}
            return false;

        }

    }


}
