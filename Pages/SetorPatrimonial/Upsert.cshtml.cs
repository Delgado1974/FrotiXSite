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
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Setor
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        //private readonly UserManager<Usuario> _userManager;

        private readonly INotyfService _notyf;

        public static Guid setorId;

        public UpsertModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, IWebHostEnvironment hostingEnvironment, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }

        [BindProperty]
        public FrotiX.Models.Cadastros.SetorPatrimonial SetorObj { get; set; }
        //Aqui eu usei o nome completo porque tava conflitando com o nameSpace daqui

        //private void SetViewModel()
        //{
        //    PatrimonioObj = new PatrimonioViewModel
        //    {
        //        //ContratoList = _unitOfWork.Contrato.GetContratoListForDropDown("Terceirização", 1),
        //        Patrimonio = new Models.Patrimonio()
        //    };
        //}

        private void SetModel()
        {
            SetorObj = new Models.Cadastros.SetorPatrimonial();
        }

        public IActionResult OnGet(Guid? id)
        {

            SetModel();
            if (id != null)
            {
                setorId = (Guid)id;

            }

            if (id != null && id != Guid.Empty)
            {
                SetorObj = _unitOfWork.SetorPatrimonial.GetFirstOrDefault(u => u.SetorId == id);
                if (SetorObj == null)
                {
                    return NotFound();
                }

                //Nos outros eu usei esse pra carregar o valor do id do obj Patrimonio no PatrimonioViewModel
                //PatrimonioObj.PatrimonioId = PatrimonioObj.Patrimonio.PatrimonioId;

            }
            return Page();
        }

        public IActionResult OnPostSubmit()
        {
            if(SetorObj.NomeSetor == "" || SetorObj.NomeSetor== null)
            {
                ModelState.AddModelError(string.Empty, "O Nome do setor não pode estar vazio");
                SetModel();
                return Page();
            }
            //Verifica se já não tem um Setor com esse Id
            //====================
            if (SetorObj.SetorId == Guid.Empty)
            { 
                if(SetorObj.DetentorId == null || SetorObj.DetentorId == "") //Verifica se o DetentorId tem um valor
                {
                    ModelState.AddModelError(string.Empty, "O detentor não pode estar vazio");
                    SetModel();
                    return Page();
                }

                _unitOfWork.SetorPatrimonial.Add(SetorObj);


            }
            _unitOfWork.Save();
            _notyf.Success("Setor adicionado com sucesso!", 3);
            return RedirectToPage("./Index");
        }

        public IActionResult OnPostEdit(Guid id)
        {

            if (!ModelState.IsValid)
            {
                SetorObj.SetorId = id;
                return Page();
            }
            if (SetorObj.NomeSetor == "" || SetorObj.NomeSetor == null)
            {
                ModelState.AddModelError(string.Empty, "O Nome do setor não pode estar vazio");
                SetModel();
                return Page();
            }
            if (SetorObj.DetentorId == null || SetorObj.DetentorId == "")
            {
                ModelState.AddModelError(string.Empty, "O detentor não pode estar vazio");
                SetModel();
                return Page();
            }


            SetorObj.SetorId = id;

            _unitOfWork.SetorPatrimonial.Update(SetorObj);
            _unitOfWork.Save();

            _notyf.Success("Setor atualizado com sucesso!", 3);

            return RedirectToPage("./Index");
        }

    }
}
