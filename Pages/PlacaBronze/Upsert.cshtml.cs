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
using AspNetCoreHero.ToastNotification.Abstractions;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace FrotiX.Pages.PlacaBronze
{

    public class UpsertModel : PageModel
    {
        private static Guid veiculoId;
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
        public PlacaBronzeViewModel PlacaBronzeObj { get; set; }

        private void SetViewModel()
        {
            PlacaBronzeObj = new PlacaBronzeViewModel
            {
                PlacaBronze = new Models.PlacaBronze()
            };
        }



        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null && id != Guid.Empty)
            {
                PlacaBronzeObj.PlacaBronze = _unitOfWork.PlacaBronze.GetFirstOrDefault(u => u.PlacaBronzeId == id);
                if (PlacaBronzeObj == null)
                {
                    return NotFound();
                }
            }

            //Verifica se tem veículo associado
            var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.PlacaBronzeId == PlacaBronzeObj.PlacaBronze.PlacaBronzeId);
            if (objFromDb != null)
            {
                veiculoId = objFromDb.VeiculoId;
                PlacaBronzeObj.VeiculoId = objFromDb.VeiculoId;
            }

            return Page();

        }

        
        public IActionResult OnPostSubmit()
        {

            veiculoId = PlacaBronzeObj.VeiculoId;

            //Valida o ModelState menos o campo VeiculoId
            if (ModelState.Where(k => k.Key != "VeiculoId").All(v => v.Value.ValidationState == ModelValidationState.Valid))
            {
                return Page();
            }

            //Verifica Duplicado
            var existePlaca = _unitOfWork.PlacaBronze.GetFirstOrDefault(u =>
                    u.DescricaoPlaca.ToUpper() == PlacaBronzeObj.PlacaBronze.DescricaoPlaca.ToUpper());

            if (PlacaBronzeObj.PlacaBronze.PlacaBronzeId != Guid.Empty && existePlaca != null)
            {
                if (PlacaBronzeObj.PlacaBronze.PlacaBronzeId != existePlaca.PlacaBronzeId)
                {
                    _notyf.Error("Já existe esta placa cadastrada!", 3);
                    return RedirectToPage("./Index");
                }
            }
            else if(existePlaca != null) 
            {
                _notyf.Error("Já existe esta placa cadastrada!", 3);
                return RedirectToPage("./Index");
            }


            if (PlacaBronzeObj.PlacaBronze.PlacaBronzeId == Guid.Empty)
            {
               _unitOfWork.PlacaBronze.Add(PlacaBronzeObj.PlacaBronze);
                _notyf.Success("Placa de Bronze cadastrada com sucesso!", 3);
            }
            else
            {
                _unitOfWork.PlacaBronze.Update(PlacaBronzeObj.PlacaBronze);
                _notyf.Success("Placa de Bronze atualizada com sucesso!", 3);
            }
            _unitOfWork.Save();

            //Atualiza Veículo, se escolhido
            if (veiculoId != Guid.Empty)
            {
                //Verifica se existe outro veículo associado à placa
                var veiculoFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.PlacaBronzeId == PlacaBronzeObj.PlacaBronze.PlacaBronzeId);
                if (veiculoFromDb != null)
                {
                    veiculoFromDb.PlacaBronzeId = null;
                    _unitOfWork.Veiculo.Update(veiculoFromDb);
                    _unitOfWork.Save();
                }

                //Atualiza o veículo escolhido
                var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.VeiculoId == veiculoId);
                objFromDb.PlacaBronzeId = PlacaBronzeObj.PlacaBronze.PlacaBronzeId;
                _unitOfWork.Veiculo.Update(objFromDb);
                _unitOfWork.Save();
            }


            return RedirectToPage("./Index");
        }


        // name is: OnGet[handler] 
        public Task<JsonResult> OnGetVeiculoData()
        {

            var data = (from v in _unitOfWork.Veiculo.GetAll()
                          join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                          join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                          join u in _unitOfWork.Unidade.GetAll() on v.UnidadeId equals u.UnidadeId into ud
                          from udResult in ud.DefaultIfEmpty()                                                  // <= Left Join
                          join ct in _unitOfWork.Contrato.GetAll() on v.ContratoId equals ct.ContratoId
                          join f in _unitOfWork.Fornecedor.GetAll() on ct.FornecedorId equals f.FornecedorId
                          join us in _unitOfWork.AspNetUsers.GetAll() on v.UsuarioIdAlteracao equals us.Id
                          select new
                          {

                              v.VeiculoId,
                              VeiculoCompleto = "(" + v.Placa + ")" + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo + "(" + (udResult != null ? udResult.Sigla : "") + " - " + ct.AnoContrato + "/" + ct.NumeroContrato + " - " + f.DescricaoFornecedor,
                              v.Placa
                          }).ToList();


            data = data.OrderBy(o => o.Placa).ToList();

            return Task.FromResult(new JsonResult(new SelectList(data, "VeiculoId", "VeiculoCompleto")));

        }


    }


}
