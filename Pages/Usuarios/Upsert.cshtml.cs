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
using OtpNet;

namespace FrotiX.Pages.Usuarios
{

    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;

        private readonly INotyfService _notyf;

        public static string UsuarioId;
        public static byte[] FotoUsuario;

        public UpsertModel(UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager, IUnitOfWork unitOfWork, ILogger<IndexModel> logger, IWebHostEnvironment hostingEnvironment, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
            _userManager = userManager;
            _signInManager = signInManager;
        }


        [BindProperty]
        public UsuarioViewModel UsuarioObj { get; set; }

        private void SetViewModel()
        {
            UsuarioObj= new UsuarioViewModel
            {
                AspNetUsers = new Models.AspNetUsers()
            };
        }

        public IActionResult OnGet(string? id)
        {
            SetViewModel();

            if (id != null)
            {
                UsuarioId = id;
            }


            if (id != null && id != "")
            {
                UsuarioObj.AspNetUsers = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == id);
                if (UsuarioObj== null)
                {
                    return NotFound();
                }
            }
            return Page();
        }


        public async Task<IActionResult> OnPostSubmit()
        {
            if (!ModelState.IsValid)
            {
                foreach (var modelState in ModelState.Values)
                {
                    foreach (var modelError in modelState.Errors)
                    {
                        var erromodel = modelError.ErrorMessage;
                        SetViewModel();
                        return Page();
                    }
                }
            }

            if (ChecaDuplicado(null))
            {
                SetViewModel();
                return Page();
            }

            string valor = UsuarioObj.AspNetUsers.Ponto.Trim();

            // Verifica se o valor inicia com "p_" ou "P_"
            if (!valor.StartsWith("p_") && !valor.StartsWith("P_"))
            {
                valor = "p_" + valor;
            }

            // Define o valor no segundo TextBox
            UsuarioObj.AspNetUsers.UserName = valor;

            var user = new Models.AspNetUsers
            {
                UserName = UsuarioObj.AspNetUsers.UserName,
                //NormalizedUserName = UsuarioObj.AspNetUsers.UserName.ToUpper(),
                Email = "a.degas@gmail.com", //UsuarioObj.AspNetUsers.Email,
                NomeCompleto = UsuarioObj.AspNetUsers.NomeCompleto,
                Ponto = UsuarioObj.AspNetUsers.Ponto,
                Ramal = UsuarioObj.AspNetUsers.Ramal,
                DetentorCargaPatrimonial = UsuarioObj.AspNetUsers.DetentorCargaPatrimonial,
                Status = UsuarioObj.AspNetUsers.Status
            };

            var result = await _userManager.CreateAsync(user, "visual");
            if (result.Succeeded)
            {
                var objRecursos = _unitOfWork.Recurso.GetAll();

                foreach (var recurso in objRecursos)
                {
                    var objAcesso = new ControleAcesso
                    {
                        UsuarioId = user.Id,
                        RecursoId = recurso.RecursoId,
                        Acesso = false
                    };

                    _unitOfWork.ControleAcesso.Add(objAcesso);
                    _unitOfWork.Save();
                }

                _notyf.Success("Usuario inserido com sucesso!", 3);

            }
            else
            {
                UsuarioObj.AspNetUsers.Id = Guid.NewGuid().ToString();

                UsuarioObj.AspNetUsers.PasswordHash = user.PasswordHash;
                UsuarioObj.AspNetUsers.SecurityStamp = user.SecurityStamp;
                UsuarioObj.AspNetUsers.ConcurrencyStamp = user.ConcurrencyStamp;
                UsuarioObj.AspNetUsers.Discriminator = "Usuario";

                _unitOfWork.AspNetUsers.Add(UsuarioObj.AspNetUsers);
                _unitOfWork.Save();

                _notyf.Success("Usuario inserido com sucesso!", 3);
            }
            return RedirectToPage("./Index");
        }


        public IActionResult OnPostEdit(string id)
        {


            if (!ModelState.IsValid)
            {
                SetViewModel();
                UsuarioObj.AspNetUsers.Id = id;
                return Page();
            }

            UsuarioObj.AspNetUsers.Id = id;

            //UsuarioObj.AspNetUsers.Id = id;

            //if (ChecaDuplicado(UsuarioObj.AspNetUsers.Id))
            //{
            //    SetViewModel();
            //    UsuarioObj.AspNetUsers.Id = id;
            //    return Page();
            //}
            UsuarioObj.AspNetUsers.Discriminator = "Usuario";

            _unitOfWork.AspNetUsers.Update(UsuarioObj.AspNetUsers);
            _unitOfWork.Save();

            _notyf.Success("Usuario atualizado com sucesso!", 3);

            return RedirectToPage("./Index");
        }

        private bool ChecaDuplicado(string? id)
        {

            //// Verifica Duplicidades
            //var existeNome = _unitOfWork.Usuario.GetFirstOrDefault(u => u.Nome.ToUpper() == UsuarioObj.Usuario.Nome.ToUpper());
            //if (id == null && existeNome != null)
            //{
            //    _notyf.Error("Já existe um Usuario com esse nome!", 3);
            //    return true;
            //}
            //if (existeNome != null && existeNome.UsuarioId != id)
            //{
            //    _notyf.Error("Já existe um Usuario com esse nome!", 3);
            //    return true;
            //}

            //var existeCPF = _unitOfWork.Usuario.GetFirstOrDefault(u => u.CPF == UsuarioObj.Usuario.CPF);
            //if (id == null && existeCPF!= null)
            //{
            //    _notyf.Error("Já existe um Usuario com esse CPF!", 3);
            //    return true;
            //}
            //if (existeCPF != null && existeCPF.UsuarioId != id)
            //{
            //    _notyf.Error("Já existe um Usuario com esse CPF!", 3);
            //    return true;
            //}
            return false;

        }

    }


}
