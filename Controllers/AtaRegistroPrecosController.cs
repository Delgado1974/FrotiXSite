using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AtaRegistroPrecosController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public AtaRegistroPrecosController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult Get()
        {

            var result = (from a in _unitOfWork.AtaRegistroPrecos.GetAll()
                          join f in _unitOfWork.Fornecedor.GetAll() on a.FornecedorId equals f.FornecedorId
                          orderby a.AnoAta descending
                          select new
                          {
                              AtaCompleta = a.AnoAta + "/" + a.NumeroAta,
                              ProcessoCompleto = a.NumeroProcesso + "/" + a.AnoProcesso.ToString().Substring(2,2),
                              a.Objeto,
                              f.DescricaoFornecedor,
                              Periodo = a.DataInicio?.ToString("dd/MM/yy") + " a " + a.DataFim?.ToString("dd/MM/yy"),
                              ValorFormatado = a.Valor?.ToString("C"),
                              a.Status,
                              a.AtaId
                          }).ToList();


            return Json(new { data = result });

        }

        [Route("Delete")]
        [HttpPost]        
        public IActionResult Delete(AtaRegistroPrecosViewModel model)
        {
            if (model != null && model.AtaId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.AtaRegistroPrecos.GetFirstOrDefault(u => u.AtaId == model.AtaId);
                if (objFromDb != null)
                {
                    // Verifica se existem veículos associados ao contrato
                    //====================================================
                    var veiculo = _unitOfWork.VeiculoAta.GetFirstOrDefault(u => u.AtaId == model.AtaId);
                    if (veiculo != null)
                    {
                        return Json(new { success = false, message = "Existem veículos associados a essa Ata" });
                    }
                    // Verifica se existem empenhos associados ao contrato
                    //====================================================
                    //var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u => u.ContratoId == model.ContratoId);
                    //if (empenho != null)
                    //{
                    //    return Json(new { success = false, message = "Existem emepenhos associados a esse contrato" });
                    //}

                    // Apaga Repactuações e Itens Contrato
                    //====================================
                    var objRepactuacao = _unitOfWork.RepactuacaoAta.GetAll(riv => riv.AtaId == model.AtaId);
                    foreach (var repactuacao in objRepactuacao)
                    {
                        var objItemRepactuacao = _unitOfWork.ItemVeiculoAta.GetAll(iva => iva.RepactuacaoAtaId == repactuacao.RepactuacaoAtaId);
                        foreach (var itemveiculo in objItemRepactuacao)
                        {
                            _unitOfWork.ItemVeiculoAta.Remove(itemveiculo);
                        }
                        _unitOfWork.RepactuacaoAta.Remove(repactuacao);
                    }




                    _unitOfWork.AtaRegistroPrecos.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Ata removida com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar Ata" });
        }

        [Route("UpdateStatusAta")]
        public JsonResult UpdateStatusAta(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var objFromDb = _unitOfWork.AtaRegistroPrecos.GetFirstOrDefault(u => u.AtaId == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == true)
                    {
                        //res["success"] = 0;
                        objFromDb.Status = false;
                        Description = string.Format("Atualizado Status da Ata [Nome: {0}] (Inativo)", objFromDb.AnoAta + "/" + objFromDb.NumeroAta);
                        type = 1;
                    }
                    else
                    {
                        //res["success"] = 1;
                        objFromDb.Status = true;
                        Description = string.Format("Atualizado Status da Ata  [Nome: {0}] (Ativo)", objFromDb.AnoAta + "/" + objFromDb.NumeroAta);
                        type = 0;
                    }
                    //_unitOfWork.Save();
                    _unitOfWork.AtaRegistroPrecos.Update(objFromDb);
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }


        //Insere Nova Ata
        //====================
        [Route("InsereAta")]
        [HttpPost]
        public JsonResult InsereAta(AtaRegistroPrecos ata)
        {
            var existeAta = _unitOfWork.AtaRegistroPrecos.GetFirstOrDefault(u => (u.AnoAta == ata.AnoAta) && (u.NumeroAta == ata.NumeroAta));
            if (existeAta != null && existeAta.AtaId != ata.AtaId)
            {
                //_notyf.Error("Já existe uma ata com esse número!", 3);
                //SetViewModel();
                return new JsonResult(new { success = false, data = "00000000-0000-0000-0000-000000000000", message = "Já existe uma ata com esse número!" });
            }

            _unitOfWork.AtaRegistroPrecos.Add(ata);

            var objRepactuacao = new RepactuacaoAta();
            objRepactuacao.DataRepactuacao = ata.DataInicio;
            objRepactuacao.Descricao = "Valor Inicial";
            objRepactuacao.AtaId = ata.AtaId;
            _unitOfWork.RepactuacaoAta.Add(objRepactuacao);

            _unitOfWork.Save();

            return new JsonResult(new { data = objRepactuacao.RepactuacaoAtaId, message = "Ata Adicionada com Sucesso" });
        }

        //Edita ATA
        //=========
        [Route("EditaAta")]
        [HttpPost]
        public JsonResult EditaAta(AtaRegistroPrecos ata)
        {
            var existeAta = _unitOfWork.AtaRegistroPrecos.GetFirstOrDefault(u => (u.AnoAta == ata.AnoAta) && (u.NumeroAta == ata.NumeroAta));
            if (existeAta != null && existeAta.AtaId != ata.AtaId)
            {
                //_notyf.Error("Já existe um contrato com esse número!", 3);
                //SetViewModel();
                return new JsonResult(new { data = "00000000-0000-0000-0000-000000000000", message = "Já existe uma Ata com esse número" });
            }

            _unitOfWork.AtaRegistroPrecos.Update(ata);

            _unitOfWork.Save();

            return new JsonResult(new { data = ata, message = "Ata Atualizada com Sucesso" });
        }

        //Insere Novo Item Contrato
        //=========================
        [Route("InsereItemAta")]
        [HttpPost]
        public JsonResult InsereItemAta(ItemVeiculoAta itemveiculo)
        {

            _unitOfWork.ItemVeiculoAta.Add(itemveiculo);

            _unitOfWork.Save();

            return new JsonResult(new { data = itemveiculo.ItemVeiculoAtaId, message = "Item Veiculo Ata adicionado com sucesso" });
        }

        //Preenche a lista de Repactuações baseado no contrato
        //====================================================
        [Route("RepactuacaoList")]
        public JsonResult RepactuacaoList(Guid id)
        {

            var RepactuacoList = (from r in _unitOfWork.RepactuacaoAta.GetAll()
                                  where r.AtaId == id
                                  orderby r.DataRepactuacao
                                  select new
                                  {
                                      r.RepactuacaoAtaId,
                                      Repactuacao = "(" + r.DataRepactuacao?.ToString("dd/MM/yy") + ") " + r.Descricao
                                  }).ToList();

            return new JsonResult(new { data = RepactuacoList });
        }


        //Preenche a lista de Atas
        //=============================
        [Route("ListaAtas")]
        public JsonResult OnGetListaAtas(string id)
        {
            var AtaList = _unitOfWork.AtaRegistroPrecos.GetAtaListForDropDown(Convert.ToInt32(id));
            return new JsonResult(new { data = AtaList });
        }

    }
}
