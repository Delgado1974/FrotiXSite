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

namespace FrotiX.Pages.Motorista
{

    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        //private readonly UserManager<Usuario> _userManager;

        private readonly INotyfService _notyf;

        public static Guid motoristaId;
        public static byte[] FotoMotorista;
        public static byte[] CNHMotorista;

        public UpsertModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, IWebHostEnvironment hostingEnvironment, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }


        [BindProperty]
        public MotoristaViewModel MotoristaObj { get; set; }
        public IFormFile FotoUpload { get; set; }

        private void SetViewModel()
        {
            MotoristaObj = new MotoristaViewModel
            {
                UnidadeList = _unitOfWork.Unidade.GetUnidadeListForDropDown(),
                ContratoList = _unitOfWork.Contrato.GetContratoListForDropDown("Terceirização", 1),
                Motorista = new Models.Motorista()
            };
        }

        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null)
            {
                motoristaId = (Guid)id;
            }

            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            MotoristaObj.Motorista.UsuarioIdAlteracao = currentUserID;
            var usuarios = _unitOfWork.AspNetUsers.GetAspNetUsersListForDropDown();
            foreach (var usuario in usuarios)
            {
                if (usuario.Value == currentUserID)
                {
                    MotoristaObj.NomeUsuarioAlteracao = usuario.Text;
                }
            }


            if (id != null && id != Guid.Empty)
            {
                MotoristaObj.Motorista = _unitOfWork.Motorista.GetFirstOrDefault(u => u.MotoristaId == id);
                if (MotoristaObj == null)
                {
                    return NotFound();
                }
                if (MotoristaObj.Motorista.Foto != null)
                {
                    FotoMotorista = MotoristaObj.Motorista.Foto;
                }
                if (MotoristaObj.Motorista.CNHDigital != null)
                {
                    CNHMotorista = MotoristaObj.Motorista.CNHDigital;
                }

                // 👉 Aqui adiciona:
                if (MotoristaObj.Motorista.Status == false || MotoristaObj.Motorista.Status == null)
                {
                    MotoristaObj.Motorista.Status = true;
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
            MotoristaObj.Motorista.UsuarioIdAlteracao = currentUserID;

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

            MotoristaObj.Motorista.CategoriaCNH = MotoristaObj.Motorista.CategoriaCNH.ToUpper();
            MotoristaObj.Motorista.DataAlteracao = DateTime.Now;

            //Adiciona a Foto
            //===============
            if (FotoUpload != null)
            {
                var file = FotoUpload.FileName;

                using (var ms = new MemoryStream())
                {
                    FotoUpload.CopyTo(ms);
                    MotoristaObj.Motorista.Foto = ms.ToArray();
                }
            }
            else
            {
                var wwwroot = _hostingEnvironment.WebRootPath;
                var barbudo = wwwroot + "\\Images\\barbudo.jpg";
                byte[] imgdata = System.IO.File.ReadAllBytes(barbudo);
                MotoristaObj.Motorista.Foto = imgdata.ToArray();

            }


            //Adiciona o motorista
            //====================
            if (MotoristaObj.Motorista.MotoristaId == Guid.Empty)
            {
                _unitOfWork.Motorista.Add(MotoristaObj.Motorista);


                //Adiciona o motorista ao contrato, caso selecionado
                if (MotoristaObj.Motorista.ContratoId != null)
                {
                    MotoristaContrato motoristaContrato = new MotoristaContrato
                    {
                        ContratoId = (Guid)MotoristaObj.Motorista.ContratoId,
                        MotoristaId = MotoristaObj.Motorista.MotoristaId
                    };
                    _unitOfWork.MotoristaContrato.Add(motoristaContrato);
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
            MotoristaObj.Motorista.UsuarioIdAlteracao = currentUserID;

            if (FotoUpload != null)
            {
                var file = FotoUpload.FileName;

                using (var ms = new MemoryStream())
                {
                    FotoUpload.CopyTo(ms);
                    MotoristaObj.Motorista.Foto = ms.ToArray();
                }
            }
            else if (FotoMotorista != null)
            {
                MotoristaObj.Motorista.Foto = FotoMotorista;
            }

            if (CNHMotorista !=null)
            {
                MotoristaObj.Motorista.CNHDigital = CNHMotorista;
            }

            if (!ModelState.IsValid)
            {
                SetViewModel();
                MotoristaObj.Motorista.MotoristaId = id;
                return Page();
            }

            MotoristaObj.Motorista.MotoristaId = id;

            if (ChecaDuplicado(MotoristaObj.Motorista.MotoristaId))
            {
                SetViewModel();
                MotoristaObj.Motorista.MotoristaId = id;
                return Page();
            }

            // Atualiza Contrato do Motorista, se selecionado
            //=============================================
            var existeMotoristaContrato = _unitOfWork.MotoristaContrato.GetFirstOrDefault(u => (u.MotoristaId == MotoristaObj.Motorista.MotoristaId) && (u.ContratoId == MotoristaObj.Motorista.ContratoId));
            if (existeMotoristaContrato == null && MotoristaObj.Motorista.ContratoId != null)
            {
                MotoristaContrato motoristaContrato = new MotoristaContrato
                {
                    ContratoId = (Guid)MotoristaObj.Motorista.ContratoId,
                    MotoristaId = MotoristaObj.Motorista.MotoristaId
                };
                _unitOfWork.MotoristaContrato.Add(motoristaContrato);
            }

            MotoristaObj.Motorista.CategoriaCNH = MotoristaObj.Motorista.CategoriaCNH.ToUpper();
            MotoristaObj.Motorista.DataAlteracao = DateTime.Now;

            _unitOfWork.Motorista.Update(MotoristaObj.Motorista);
            _unitOfWork.Save();

            _notyf.Success("Motorista atualizado com sucesso!", 3);

            return RedirectToPage("./Index");
        }

        private bool ChecaDuplicado(Guid? id)
        {

            // Verifica Duplicidades
            var existeNome = _unitOfWork.Motorista.GetFirstOrDefault(u => u.Nome.ToUpper() == MotoristaObj.Motorista.Nome.ToUpper());
            if (id == null && existeNome != null)
            {
                _notyf.Error("Já existe um motorista com esse nome!", 3);
                return true;
            }
            if (existeNome != null && existeNome.MotoristaId != id)
            {
                _notyf.Error("Já existe um motorista com esse nome!", 3);
                return true;
            }

            var existeCPF = _unitOfWork.Motorista.GetFirstOrDefault(u => u.CPF == MotoristaObj.Motorista.CPF);
            if (id == null && existeCPF!= null)
            {
                _notyf.Error("Já existe um motorista com esse CPF!", 3);
                return true;
            }
            if (existeCPF != null && existeCPF.MotoristaId != id)
            {
                _notyf.Error("Já existe um motorista com esse CPF!", 3);
                return true;
            }

            var existeCNH = _unitOfWork.Motorista.GetFirstOrDefault(u => u.CNH == MotoristaObj.Motorista.CNH);
            if (id == null && existeCNH != null)
            {
                _notyf.Error("Já existe um motorista com essa CNH!", 3);
                return true;
            }
            if (existeCNH != null && existeCNH.MotoristaId != id)
            {
                _notyf.Error("Já existe um motorista com essa CNH!", 3);
                return true;
            }

            if (MotoristaObj.Motorista.TipoCondutor == null)
            {
                _notyf.Error("O Tipo de Condutor deve ser informado!", 3);
                return true;
            }

            return false;

        }

    }


}
