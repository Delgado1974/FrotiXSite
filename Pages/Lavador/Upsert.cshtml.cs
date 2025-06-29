﻿using System;
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

namespace FrotiX.Pages.Lavador
{

    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        //private readonly UserManager<Usuario> _userManager;

        private readonly INotyfService _notyf;

        public static Guid LavadorId;
        public static byte[] FotoLavador;

        public UpsertModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, IWebHostEnvironment hostingEnvironment, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }


        [BindProperty]
        public LavadorViewModel LavadorObj { get; set; }
        public IFormFile FotoUpload { get; set; }

        private void SetViewModel()
        {
            LavadorObj = new LavadorViewModel
            {
                ContratoList = _unitOfWork.Contrato.GetContratoListForDropDown("Terceirização", 1),
                Lavador = new Models.Lavador()
            };
        }

        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null)
            {
                LavadorId = (Guid)id;
            }

            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            LavadorObj.Lavador.UsuarioIdAlteracao = currentUserID;
            var usuarios = _unitOfWork.AspNetUsers.GetAspNetUsersListForDropDown();
            foreach (var usuario in usuarios)
            {
                if (usuario.Value == currentUserID)
                {
                    LavadorObj.NomeUsuarioAlteracao = usuario.Text;
                }
            }


            if (id != null && id != Guid.Empty)
            {
                LavadorObj.Lavador = _unitOfWork.Lavador.GetFirstOrDefault(u => u.LavadorId == id);
                if (LavadorObj == null)
                {
                    return NotFound();
                }
                if (LavadorObj.Lavador.Foto != null)
                {
                    FotoLavador = LavadorObj.Lavador.Foto;
                }
            }
            return Page();
        }


        public IActionResult OnPostSubmit()
        {

            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            LavadorObj.Lavador.UsuarioIdAlteracao = currentUserID;

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

            LavadorObj.Lavador.DataAlteracao = DateTime.Now;

            //Põe os pontos com "p_" na frente
            //================================
            if (LavadorObj.Lavador.Ponto.Substring(0, 2).ToUpper() != "P_")
            {
                LavadorObj.Lavador.Ponto = "p_" + LavadorObj.Lavador.Ponto;
            }
            else
            {
                LavadorObj.Lavador.Ponto = "p_" + LavadorObj.Lavador.Ponto.Substring(2, LavadorObj.Lavador.Ponto.Length - 2);
            }

            //Adiciona a Foto
            //===============
            if (FotoUpload != null)
            {
                var file = FotoUpload.FileName;

                using (var ms = new MemoryStream())
                {
                    FotoUpload.CopyTo(ms);
                    LavadorObj.Lavador.Foto = ms.ToArray();
                }
            }
            else
            {
                var wwwroot = _hostingEnvironment.WebRootPath;
                var barbudo = wwwroot + "\\Images\\barbudo.jpg";
                byte[] imgdata = System.IO.File.ReadAllBytes(barbudo);
                LavadorObj.Lavador.Foto = imgdata.ToArray();

            }



            //Adiciona o motorista
            //====================
            if (LavadorObj.Lavador.LavadorId == Guid.Empty)
            {
                _unitOfWork.Lavador.Add(LavadorObj.Lavador);


                //Adiciona o motorista ao contrato, caso selecionado
                if (LavadorObj.Lavador.ContratoId != null)
                {
                    LavadorContrato LavadorContrato = new LavadorContrato
                    {
                        ContratoId = (Guid)LavadorObj.Lavador.ContratoId,
                        LavadorId = LavadorObj.Lavador.LavadorId
                    };
                    _unitOfWork.LavadorContrato.Add(LavadorContrato);
                }

            }
            _unitOfWork.Save();
            return RedirectToPage("./Index");
        }


        public IActionResult OnPostEdit(Guid id)
        {

            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            LavadorObj.Lavador.UsuarioIdAlteracao = currentUserID;

            if (FotoUpload != null)
            {
                var file = FotoUpload.FileName;

                using (var ms = new MemoryStream())
                {
                    FotoUpload.CopyTo(ms);
                    LavadorObj.Lavador.Foto = ms.ToArray();
                }
            }
            else if (FotoLavador != null)
            {
                LavadorObj.Lavador.Foto = FotoLavador;
            }
            else
            {
                var wwwroot = _hostingEnvironment.WebRootPath;
                var barbudo = wwwroot + "\\Images\\barbudo.jpg";
                byte[] imgdata = System.IO.File.ReadAllBytes(barbudo);
                LavadorObj.Lavador.Foto = imgdata.ToArray();

            }

            if (!ModelState.IsValid)
            {
                SetViewModel();
                LavadorObj.Lavador.LavadorId = id;
                return Page();
            }

            LavadorObj.Lavador.LavadorId = id;

            if (ChecaDuplicado(LavadorObj.Lavador.LavadorId))
            {
                SetViewModel();
                LavadorObj.Lavador.LavadorId = id;
                return Page();
            }

            // Atualiza Contrato do Motorista, se selecionado
            //=============================================
            var existeLavadorContrato = _unitOfWork.LavadorContrato.GetFirstOrDefault(u => (u.LavadorId == LavadorObj.Lavador.LavadorId) && (u.ContratoId == LavadorObj.Lavador.ContratoId));
            if (existeLavadorContrato == null && LavadorObj.Lavador.ContratoId != null)
            {
                LavadorContrato LavadorContrato = new LavadorContrato
                {
                    ContratoId = (Guid)LavadorObj.Lavador.ContratoId,
                    LavadorId = LavadorObj.Lavador.LavadorId
                };
                _unitOfWork.LavadorContrato.Add(LavadorContrato);
            }

            LavadorObj.Lavador.DataAlteracao = DateTime.Now;

            //Põe os pontos com "p_" na frente
            //================================
            if (LavadorObj.Lavador.Ponto.Substring(0, 2).ToUpper() != "P_")
            {
                LavadorObj.Lavador.Ponto = "p_" + LavadorObj.Lavador.Ponto;
            }
            else
            {
                LavadorObj.Lavador.Ponto = "p_" + LavadorObj.Lavador.Ponto.Substring(2, LavadorObj.Lavador.Ponto.Length - 2);
            }

            _unitOfWork.Lavador.Update(LavadorObj.Lavador);
            _unitOfWork.Save();

            _notyf.Success("Lavador atualizado com sucesso!", 3);

            return RedirectToPage("./Index");
        }

        private bool ChecaDuplicado(Guid? id)
        {

            // Verifica Duplicidades
            var existeNome = _unitOfWork.Lavador.GetFirstOrDefault(u => u.Nome.ToUpper() == LavadorObj.Lavador.Nome.ToUpper());
            if (id == null && existeNome != null)
            {
                _notyf.Error("Já existe um Lavador com esse nome!", 3);
                return true;
            }
            if (existeNome != null && existeNome.LavadorId != id)
            {
                _notyf.Error("Já existe um Lavador com esse nome!", 3);
                return true;
            }

            var existeCPF = _unitOfWork.Lavador.GetFirstOrDefault(u => u.CPF == LavadorObj.Lavador.CPF);
            if (id == null && existeCPF!= null)
            {
                _notyf.Error("Já existe um Lavador com esse CPF!", 3);
                return true;
            }
            if (existeCPF != null && existeCPF.LavadorId != id)
            {
                _notyf.Error("Já existe um Lavador com esse CPF!", 3);
                return true;
            }
            return false;

        }

    }


}
