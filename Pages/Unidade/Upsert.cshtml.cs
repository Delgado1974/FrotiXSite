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

namespace FrotiX.Pages.Unidade
{

    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;

        private readonly INotyfService _notyf;


        public UpsertModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
             _logger = logger;
            _notyf = notyf;
        }


        [BindProperty]
        public Models.Unidade UnidadeObj { get; set; }

        public IActionResult OnGet(Guid? id)
        {
            UnidadeObj = new Models.Unidade();
            if (id != null && id != Guid.Empty)
            {
                UnidadeObj = _unitOfWork.Unidade.GetFirstOrDefault(u => u.UnidadeId == id);
                if (UnidadeObj == null)
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
                return Page();
            }

            //Põe a sigla em maiúscula
            UnidadeObj.Sigla = UnidadeObj.Sigla.ToUpper();

            //Põe os pontos com "p_" na frente
            if (UnidadeObj.PontoPrimeiroContato.Substring(0, 2).ToUpper() != "P_")
            {
                UnidadeObj.PontoPrimeiroContato = "p_" + UnidadeObj.PontoPrimeiroContato;
            }
            else
            {
                UnidadeObj.PontoPrimeiroContato = "p_" + UnidadeObj.PontoPrimeiroContato.Substring(2, UnidadeObj.PontoPrimeiroContato.Length - 2);
            }

            if (UnidadeObj.PontoSegundoContato != null)
            {
                if (UnidadeObj.PontoSegundoContato.Substring(0, 2).ToUpper() != "P_")
                {
                    UnidadeObj.PontoSegundoContato = "p_" + UnidadeObj.PontoSegundoContato;
                }
                else
                {
                    UnidadeObj.PontoSegundoContato = "p_" + UnidadeObj.PontoSegundoContato.Substring(2, UnidadeObj.PontoSegundoContato.Length - 2);
                }
            }

            if (UnidadeObj.PontoTerceiroContato != null)
            {
                if (UnidadeObj.PontoTerceiroContato.Substring(0, 2).ToUpper() != "P_")
                {
                    UnidadeObj.PontoTerceiroContato = "p_" + UnidadeObj.PontoTerceiroContato;
                }
                else
                {
                    UnidadeObj.PontoTerceiroContato = "p_" + UnidadeObj.PontoTerceiroContato.Substring(2, UnidadeObj.PontoTerceiroContato.Length - 2);
                }
            }


            // Verifica Duplicidades
            var existeUnidade = _unitOfWork.Unidade.GetFirstOrDefault(u => u.Descricao.ToUpper() == UnidadeObj.Descricao.ToUpper());
            if (existeUnidade != null && existeUnidade.UnidadeId != UnidadeObj.UnidadeId)
            {
                _notyf.Error("Já existe uma unidade com esse nome!", 3);
                return Page();
            }
            var existeSigla = _unitOfWork.Unidade.GetFirstOrDefault(u => u.Sigla.ToUpper() == UnidadeObj.Sigla.ToUpper());
            if (existeSigla != null && existeSigla.UnidadeId != UnidadeObj.UnidadeId)
            {
                _notyf.Error("Já existe uma unidade com essa sigla!", 3);
                return Page();
            }


            if (UnidadeObj.UnidadeId == Guid.Empty)
            {
                _notyf.Success("Unidade adicionada com sucesso!", 3);
                _unitOfWork.Unidade.Add(UnidadeObj);
            }
            else
            {
                _notyf.Success("Unidade atualizada com sucesso!", 3);
                _unitOfWork.Unidade.Update(UnidadeObj);
            }
            _unitOfWork.Save();
            return RedirectToPage("./Index");
        }


    }


}
