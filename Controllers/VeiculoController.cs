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
    public class VeiculoController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public VeiculoController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult Get()
        {

            try
            {
                //var objVeiculos = _unitOfWork.ViewVeiculos.GetAll();

                var objVeiculos = _unitOfWork.ViewVeiculos.GetAllReduced(selector: vv => new
                {
                    vv.VeiculoId,
                    vv.Placa,
                    vv.Quilometragem,
                    vv.MarcaModelo,
                    vv.Sigla,
                    vv.Descricao,
                    vv.Consumo,
                    vv.OrigemVeiculo,
                    vv.DataAlteracao,
                    vv.NomeCompleto,
                    vv.VeiculoReserva,
                    vv.Status,
                    vv.CombustivelId,
                    //vv.RowNum,
                    //vv.ContratoId,
                    //vv.AtaId,
                    //vv.ContratoVeiculo,
                    //vv.AtaVeiculo,
                }).ToList();

                return Json(new { data = objVeiculos });
            }
            catch (Exception ex)
            {
                throw;
            }

        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(VeiculoViewModel model)
        {
            if (model != null && model.VeiculoId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.VeiculoId == model.VeiculoId);
                if (objFromDb != null)
                {

                    //Verifica se pode apagar o veículo
                    var veiculoContrato = _unitOfWork.VeiculoContrato.GetFirstOrDefault(u => u.VeiculoId == model.VeiculoId);
                    if (veiculoContrato != null)
                    {
                        return Json(new { success = false, message = "Não foi possível remover o veículo. Ele está associado a um ou mais contratos!" });
                    }

                    var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(u => u.VeiculoId == model.VeiculoId);
                    if (objViagem != null)
                    {
                        return Json(new { success = false, message = "Não foi possível remover o veículo. Ele está associado a uma ou mais viagens!" });
                    }

                    _unitOfWork.Veiculo.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Veículo removido com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar veículo" });
        }

        [Route("UpdateStatusVeiculo")]
        public JsonResult UpdateStatusVeiculo(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.VeiculoId == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == true)
                    {
                        //res["success"] = 0;
                        objFromDb.Status = false;
                        Description = string.Format("Atualizado Status do Veículo [Nome: {0}] (Inativo)", objFromDb.Placa);
                        type = 1;
                    }
                    else
                    {
                        //res["success"] = 1;
                        objFromDb.Status = true;
                        Description = string.Format("Atualizado Status do Veículo  [Nome: {0}] (Ativo)", objFromDb.Placa);
                        type = 0;
                    }
                    //_unitOfWork.Save();
                    _unitOfWork.Veiculo.Update(objFromDb);
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }

        [HttpGet]
        [Route("VeiculoContratos")]
        public IActionResult VeiculoContratos(Guid Id)
        {

            try
            {
                var result = (from v in _unitOfWork.Veiculo.GetAll()

                              join vc in _unitOfWork.VeiculoContrato.GetAll() on v.VeiculoId equals vc.VeiculoId

                              join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                              join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId

                              join u in _unitOfWork.Unidade.GetAll() on v.UnidadeId equals u.UnidadeId into ud
                              from udResult in ud.DefaultIfEmpty()  // <= Left Join

                              join c in _unitOfWork.Combustivel.GetAll() on v.CombustivelId equals c.CombustivelId

                              where vc.ContratoId == Id

                              select new
                              {
                                  v.VeiculoId,
                                  v.Placa,

                                  MarcaModelo = ma.DescricaoMarca + "/" + m.DescricaoModelo,

                                  Sigla = udResult != null ? udResult.Sigla : "",

                                  CombustivelDescricao = c.Descricao,
                                  v.Status,
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
        public IActionResult DeleteContrato(VeiculoViewModel model)
        {
            if (model != null && model.VeiculoId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.VeiculoId == model.VeiculoId);
                if (objFromDb != null)
                {

                    //Verifica se pode apagar o veículo
                    var veiculoContrato = _unitOfWork.VeiculoContrato.GetFirstOrDefault(u => u.VeiculoId == model.VeiculoId && u.ContratoId == model.ContratoId);
                    if (veiculoContrato != null)
                    {
                        if (objFromDb.ContratoId == model.ContratoId)
                        {
                            objFromDb.ContratoId = null;
                            _unitOfWork.Veiculo.Update(objFromDb);
                        }
                        _unitOfWork.VeiculoContrato.Remove(veiculoContrato);
                        _unitOfWork.Save();
                        return Json(new { success = true, message = "Veículo removido com sucesso" });
                    }
                    return Json(new { success = false, message = "Erro ao remover veículo" });
                }
                return Json(new { success = false, message = "Erro ao remover veículo" });
            }
            return Json(new { success = false, message = "Erro ao remover veículo" });
        }


        //SelecionaValorMensalAta
        //==============================================
        [Route("SelecionaValorMensalAta")]
        [HttpGet]
        public JsonResult SelecionaValorMensalAta(Guid itemAta)
        {
            var ItemAta = _unitOfWork.ItemVeiculoAta.GetFirstOrDefault(i => i.ItemVeiculoAtaId == itemAta);

            return new JsonResult(new { valor = ItemAta.ValorUnitario });
        }

        //SelecionaValorMensalContrato
        //==============================================
        [Route("SelecionaValorMensalContrato")]
        [HttpGet]
        public JsonResult SelecionaValorMensalContrato(Guid itemContrato)
        {
            var ItemContrato = _unitOfWork.ItemVeiculoContrato.GetFirstOrDefault(i => i.ItemVeiculoId == itemContrato);

            return new JsonResult(new { valor = ItemContrato.ValorUnitario });
        }



    }
}
