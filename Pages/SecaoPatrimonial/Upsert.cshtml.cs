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
using Microsoft.CodeAnalysis.VisualBasic.Syntax;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Secao
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        //private readonly UserManager<Usuario> _userManager;

        private readonly INotyfService _notyf;

        public static Guid secaoId;

        public UpsertModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, IWebHostEnvironment hostingEnvironment, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }

        [BindProperty]
        public FrotiX.Models.Cadastros.SecaoPatrimonial SecaoObj { get; set; }
        //Aqui eu usei o nome completo porque tava conflitando com o nameSpace daqui

        private void SetModel()
        {
            SecaoObj = new Models.Cadastros.SecaoPatrimonial();
        }

        public IActionResult OnGet(Guid? id)
        {

            SetModel();
            if (id != null)
            {
                secaoId = (Guid)id;

            }

            if (id != null && id != Guid.Empty)
            {
                SecaoObj = _unitOfWork.SecaoPatrimonial.GetFirstOrDefault(u => u.SecaoId == id);
                if (SecaoObj == null)
                {
                    return NotFound();
                }

                //Nos outros eu usei esse pra carregar o valor do id do obj na ViewModel
                //PatrimonioObj.PatrimonioId = PatrimonioObj.Patrimonio.PatrimonioId;

            }
            return Page();
        }

        public IActionResult OnPostSubmit()
        {
            //As validações estão no back e no front pelo JS
            //Verifica se existe um Nome da Seção
            if(SecaoObj.NomeSecao == "" || SecaoObj.NomeSecao == null)
            {
                ModelState.AddModelError(string.Empty, "O nome da seção não pode estar vazia");
                SetModel();
                return Page();
            }
            //Verifica se já não tem um Setor com esse Id
            //====================
            if (SecaoObj.SecaoId == Guid.Empty) 
            { 
                if(SecaoObj.SetorId == Guid.Empty) 
                {
                    ModelState.AddModelError(string.Empty, "O Setor não pode estar vazio");
                    SetModel();
                    return Page();
                }

                _unitOfWork.SecaoPatrimonial.Add(SecaoObj);


            }
            
            _unitOfWork.Save();
            _notyf.Success("Seção adicionado com sucesso!", 3);
            return RedirectToPage("./Index");
        }

        public IActionResult OnPostEdit(Guid id)
        {

            if (!ModelState.IsValid)
            {
                SetModel();
                SecaoObj.SecaoId = id;
                return Page();
            }

            if (SecaoObj.NomeSecao == "" || SecaoObj.NomeSecao == null)
            {
                ModelState.AddModelError(string.Empty, "O nome da seção não pode estar vazia");
                SetModel();
                return Page();
            }
            if (SecaoObj.SetorId == Guid.Empty)
            {
                ModelState.AddModelError(string.Empty, "O Setor não pode estar vazio");
                SetModel();
                return Page();
            }

            SecaoObj.SecaoId = id;

            //if (ChecaDuplicado(OperadorObj.Operador.OperadorId))
            //{
            //    SetViewModel();
            //    OperadorObj.Operador.OperadorId = id;
            //    return Page();
            //}

            //OperadorObj.Operador.DataAlteracao = DateTime.Now;

            _unitOfWork.SecaoPatrimonial.Update(SecaoObj);
            _unitOfWork.Save();

            _notyf.Success("Seção atualizado com sucesso!", 3);

            return RedirectToPage("./Index");
        }

    }
}
