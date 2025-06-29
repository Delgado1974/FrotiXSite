using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Text.Json;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MotoristaController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public MotoristaController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult Get()
        {

            try
            {
                var result = (from vm in _unitOfWork.ViewMotoristas.GetAll()

                              select new
                              {
                                  vm.MotoristaId,
                                  vm.Nome,
                                  vm.Ponto,
                                  vm.CNH,
                                  vm.Celular01,
                                  vm.CategoriaCNH,

                                  Sigla = vm.Sigla != null ? vm.Sigla : "",

                                  ContratoMotorista = vm.AnoContrato != null ? (vm.AnoContrato + "/" + vm.NumeroContrato + " - " + vm.DescricaoFornecedor) : vm.TipoCondutor != null ? vm.TipoCondutor : "(sem contrato)",

                                  vm.Status,

                                  DatadeAlteracao = vm.DataAlteracao.ToString("dd/MM/yy"),

                                  vm.NomeCompleto,

                                  vm.EfetivoFerista,

                                  vm.Foto


                              }).ToList();


                return Json(new { data = result });
            }
            catch (Exception ex)
            {
                throw;
            }

        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(MotoristaViewModel model)
        {
            if (model != null && model.MotoristaId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Motorista.GetFirstOrDefault(u => u.MotoristaId == model.MotoristaId);
                if (objFromDb != null)
                {

                    //Verifica se pode apagar o motorista
                    var motoristaContrato = _unitOfWork.MotoristaContrato.GetFirstOrDefault(u => u.MotoristaId == model.MotoristaId);
                    if (motoristaContrato != null)
                    {
                        return Json(new { success = false, message = "Não foi possível remover o motorista. Ele está associado a um ou mais contratos!" });
                    }

                    _unitOfWork.Motorista.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Motorista removido com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar motorista" });
        }

        [Route("UpdateStatusMotorista")]
        public JsonResult UpdateStatusMotorista(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Motorista.GetFirstOrDefault(u => u.MotoristaId == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == true)
                    {
                        //res["success"] = 0;
                        objFromDb.Status = false;
                        Description = string.Format("Atualizado Status do Motorista [Nome: {0}] (Inativo)", objFromDb.Nome);
                        type = 1;
                    }
                    else
                    {
                        //res["success"] = 1;
                        objFromDb.Status = true;
                        Description = string.Format("Atualizado Status do Motorista  [Nome: {0}] (Ativo)", objFromDb.Nome);
                        type = 0;
                    }
                    //_unitOfWork.Save();
                    _unitOfWork.Motorista.Update(objFromDb);
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }

        [HttpGet]
        [Route("PegaFoto")]
        public JsonResult PegaFoto(Guid id)
        {
            if (FrotiX.Pages.Motorista.UpsertModel.motoristaId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Motorista.GetFirstOrDefault(u => u.MotoristaId == FrotiX.Pages.Motorista.UpsertModel.motoristaId);
                if (objFromDb.Foto != null)
                {
                    objFromDb.Foto = this.GetImage(Convert.ToBase64String(objFromDb.Foto));
                    return Json(objFromDb);
                }
                return Json(false);
            }
            else
            {
                return Json(false);
            }
         }

        [HttpGet]
        [Route("PegaFotoModal")]
        public JsonResult PegaFotoModal(Guid id)
        {
                var objFromDb = _unitOfWork.Motorista.GetFirstOrDefault(u => u.MotoristaId == id);
                if (objFromDb.Foto != null)
                {
                    objFromDb.Foto = this.GetImage(Convert.ToBase64String(objFromDb.Foto));
                    return Json(objFromDb.Foto);
                }
                return Json(false);
        }


        public byte[] GetImage(string sBase64String)
        {
            byte[] bytes = null;
            if (!string.IsNullOrEmpty(sBase64String))
            {
                bytes = Convert.FromBase64String(sBase64String);
            }
            return bytes;
        }

        [HttpGet]
        [Route("MotoristaContratos")]
        public IActionResult MotoristaContratos(Guid Id)
        {

            try
            {
                var result = (from vm in _unitOfWork.ViewMotoristas.GetAll()

                              join mc in _unitOfWork.MotoristaContrato.GetAll() on vm.MotoristaId equals mc.MotoristaId

                              where mc.ContratoId == Id

                              select new
                              {
                                  vm.MotoristaId,
                                  vm.Nome,
                                  vm.Ponto,
                                  vm.CNH,
                                  vm.Celular01,
                                  vm.CategoriaCNH,

                                  Sigla = vm.Sigla != null ? vm.Sigla : "",

                                  ContratoMotorista = vm.AnoContrato != null ? (vm.AnoContrato + "/" + vm.NumeroContrato + " - " + vm.DescricaoFornecedor) : "<b>(Veículo Próprio)</b>",

                                  vm.Status,

                                  DatadeAlteracao = vm.DataAlteracao.ToString("dd/MM/yy"),

                                  vm.NomeCompleto

                              }).ToList();


                return Json(new { data = result });
            }
            catch (Exception ex)
            {
                throw;
            }

        }

        [Route("DeleteContrato")]
        [HttpPost]
        public IActionResult DeleteContrato(MotoristaViewModel model)
        {
            if (model != null && model.MotoristaId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Motorista.GetFirstOrDefault(u => u.MotoristaId == model.MotoristaId);
                if (objFromDb != null)
                {

                    //Verifica se pode apagar o motorista
                    var motoristaContrato = _unitOfWork.MotoristaContrato.GetFirstOrDefault(u => u.MotoristaId == model.MotoristaId && u.ContratoId == model.ContratoId);
                    if (motoristaContrato != null)
                    {
                        if (objFromDb.ContratoId == model.ContratoId)
                        {
                            objFromDb.ContratoId = null;
                            _unitOfWork.Motorista.Update(objFromDb);
                        }
                        _unitOfWork.MotoristaContrato.Remove(motoristaContrato);
                        _unitOfWork.Save();
                        return Json(new { success = true, message = "Motorista removido com sucesso" });
                    }
                    return Json(new { success = false, message = "Erro ao remover motorista" });
                }
                return Json(new { success = false, message = "Erro ao remover motorista" });
            }
            return Json(new { success = false, message = "Erro ao remover motorista" });
        }

    }
}
