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

namespace FrotiX.Pages.Operador
{

    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        //private readonly UserManager<Usuario> _userManager;

        private readonly INotyfService _notyf;

        public static Guid operadorId;
        public static byte[] FotoOperador;

        public UpsertModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, IWebHostEnvironment hostingEnvironment, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }


        [BindProperty]
        public OperadorViewModel OperadorObj { get; set; }
        public IFormFile FotoUpload { get; set; }

        private void SetViewModel()
        {
            OperadorObj = new OperadorViewModel
            {
                ContratoList = _unitOfWork.Contrato.GetContratoListForDropDown("Terceirização", 1),
                Operador = new Models.Operador()
            };
        }

        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null)
            {
                operadorId = (Guid)id;
            }

            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            OperadorObj.Operador.UsuarioIdAlteracao = currentUserID;
            var usuarios = _unitOfWork.AspNetUsers.GetAspNetUsersListForDropDown();
            foreach (var usuario in usuarios)
            {
                if (usuario.Value == currentUserID)
                {
                    OperadorObj.NomeUsuarioAlteracao = usuario.Text;
                }
            }


            if (id != null && id != Guid.Empty)
            {
                OperadorObj.Operador = _unitOfWork.Operador.GetFirstOrDefault(u => u.OperadorId == id);
                if (OperadorObj == null)
                {
                    return NotFound();
                }
                if (OperadorObj.Operador.Foto != null)
                { 
                    FotoOperador = OperadorObj.Operador.Foto;
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
            OperadorObj.Operador.UsuarioIdAlteracao = currentUserID;

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

            OperadorObj.Operador.DataAlteracao = DateTime.Now;

            //Põe os pontos com "p_" na frente
            //================================
            if (OperadorObj.Operador.Ponto.Substring(0, 2).ToUpper() != "P_")
            {
                OperadorObj.Operador.Ponto = "p_" + OperadorObj.Operador.Ponto;
            }
            else
            {
                OperadorObj.Operador.Ponto = "p_" + OperadorObj.Operador.Ponto.Substring(2, OperadorObj.Operador.Ponto.Length - 2);
            }

            //Adiciona a Foto
            //===============
            if (FotoUpload != null)
            {
                var file = FotoUpload.FileName;

                using (var ms = new MemoryStream())
                {
                    FotoUpload.CopyTo(ms);
                    OperadorObj.Operador.Foto = ms.ToArray();
                }
            }
            else
            {
                var wwwroot = _hostingEnvironment.WebRootPath;
                var barbudo = wwwroot + "\\Images\\barbudo.jpg";
                byte[] imgdata = System.IO.File.ReadAllBytes(barbudo);
                OperadorObj.Operador.Foto = imgdata.ToArray();

            }


            //Adiciona o motorista
            //====================
            if (OperadorObj.Operador.OperadorId == Guid.Empty)
            {
                _unitOfWork.Operador.Add(OperadorObj.Operador);


                //Adiciona o motorista ao contrato, caso selecionado
                if (OperadorObj.Operador.ContratoId != null)
                {
                    OperadorContrato operadorContrato = new OperadorContrato
                    {
                        ContratoId = (Guid)OperadorObj.Operador.ContratoId,
                        OperadorId = OperadorObj.Operador.OperadorId
                    };
                    _unitOfWork.OperadorContrato.Add(operadorContrato);
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
            OperadorObj.Operador.UsuarioIdAlteracao = currentUserID;

            if (FotoUpload != null)
            {
                var file = FotoUpload.FileName;

                using (var ms = new MemoryStream())
                {
                    FotoUpload.CopyTo(ms);
                    OperadorObj.Operador.Foto = ms.ToArray();
                }
            }
            else if (FotoOperador != null)
            {
                OperadorObj.Operador.Foto = FotoOperador;
            }
            else
            {
                var wwwroot = _hostingEnvironment.WebRootPath;
                var barbudo = wwwroot + "\\Images\\barbudo.jpg";
                byte[] imgdata = System.IO.File.ReadAllBytes(barbudo);
                OperadorObj.Operador.Foto = imgdata.ToArray();

            }


            if (!ModelState.IsValid)
            {
                SetViewModel();
                OperadorObj.Operador.OperadorId = id;
                return Page();
            }

            OperadorObj.Operador.OperadorId = id;

            if (ChecaDuplicado(OperadorObj.Operador.OperadorId))
            {
                SetViewModel();
                OperadorObj.Operador.OperadorId = id;
                return Page();
            }

            // Atualiza Contrato do Motorista, se selecionado
            //=============================================
            var existeOperadorContrato = _unitOfWork.OperadorContrato.GetFirstOrDefault(u => (u.OperadorId == OperadorObj.Operador.OperadorId) && (u.ContratoId == OperadorObj.Operador.ContratoId));
            if (existeOperadorContrato == null && OperadorObj.Operador.ContratoId != null)
            {
                OperadorContrato operadorContrato = new OperadorContrato
                {
                    ContratoId = (Guid)OperadorObj.Operador.ContratoId,
                    OperadorId = OperadorObj.Operador.OperadorId
                };
                _unitOfWork.OperadorContrato.Add(operadorContrato);
            }

            OperadorObj.Operador.DataAlteracao = DateTime.Now;

            //Põe os pontos com "p_" na frente
            //================================
            if (OperadorObj.Operador.Ponto.Substring(0, 2).ToUpper() != "P_")
            {
                OperadorObj.Operador.Ponto = "p_" + OperadorObj.Operador.Ponto;
            }
            else
            {
                OperadorObj.Operador.Ponto = "p_" + OperadorObj.Operador.Ponto.Substring(2, OperadorObj.Operador.Ponto.Length - 2);
            }

            _unitOfWork.Operador.Update(OperadorObj.Operador);
            _unitOfWork.Save();

            _notyf.Success("Operador atualizado com sucesso!", 3);

            return RedirectToPage("./Index");
        }

        private bool ChecaDuplicado(Guid? id)
        {

            // Verifica Duplicidades
            var existeNome = _unitOfWork.Operador.GetFirstOrDefault(u => u.Nome.ToUpper() == OperadorObj.Operador.Nome.ToUpper());
            if (id == null && existeNome != null)
            {
                _notyf.Error("Já existe um operador com esse nome!", 3);
                return true;
            }
            if (existeNome != null && existeNome.OperadorId != id)
            {
                _notyf.Error("Já existe um operador com esse nome!", 3);
                return true;
            }

            var existeCPF = _unitOfWork.Operador.GetFirstOrDefault(u => u.CPF == OperadorObj.Operador.CPF);
            if (id == null && existeCPF!= null)
            {
                _notyf.Error("Já existe um operador com esse CPF!", 3);
                return true;
            }
            if (existeCPF != null && existeCPF.OperadorId != id)
            {
                _notyf.Error("Já existe um operador com esse CPF!", 3);
                return true;
            }
            return false;

        }

    }


}
