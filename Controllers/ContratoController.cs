using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
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
    [IgnoreAntiforgeryToken]
    public class ContratoController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public ContratoController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult Get()
        {

            var result = (from c in _unitOfWork.Contrato.GetAll()
                          join f in _unitOfWork.Fornecedor.GetAll() on c.FornecedorId equals f.FornecedorId
                          orderby c.AnoContrato descending
                          select new
                          {
                              ContratoCompleto = c.AnoContrato + "/" + c.NumeroContrato,
                              ProcessoCompleto = c.NumeroProcesso + "/" + c.AnoProcesso.ToString().Substring(2,2),
                              c.Objeto,
                              f.DescricaoFornecedor,
                              Periodo = c.DataInicio?.ToString("dd/MM/yy") + " a " + c.DataFim?.ToString("dd/MM/yy"),
                              ValorFormatado = c.Valor?.ToString("C"),
                              ValorMensal = (c.Valor/12)?.ToString("C"),
                              VigenciaCompleta = c.Vigencia  + "ª vigência + " + c.Prorrogacao  + " prorrog.",
                              c.Status,
                              c.ContratoId
                          }).ToList().OrderByDescending(c => c.ContratoCompleto);


            return Json(new { data = result });

        }

        [Route("Delete")]
        [HttpPost]        
        public IActionResult Delete(ContratoViewModel model)
        {
            if (model != null && model.ContratoId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Contrato.GetFirstOrDefault(u => u.ContratoId == model.ContratoId);
                if (objFromDb != null)
                {

                    // Verifica se existem veículos associados ao contrato
                    //====================================================
                    var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v => v.ContratoId == model.ContratoId);
                    if (veiculo != null)
                    {
                        return Json(new { success = false, message = "Existem veículos associados a esse contrato" });
                    }

                    // Verifica se existem empenhos associados ao contrato
                    //====================================================
                    var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u => u.ContratoId == model.ContratoId);
                    if (empenho != null)
                    {
                        return Json(new { success = false, message = "Existem empenhos associados a esse contrato" });
                    }

                    // Apaga Repactuações e Itens Contrato
                    //====================================
                    var objRepactuacao = _unitOfWork.RepactuacaoContrato.GetAll(riv => riv.ContratoId == model.ContratoId);
                    foreach (var repactuacao in objRepactuacao)
                    {
                        var objItemRepactuacao = _unitOfWork.ItemVeiculoContrato.GetAll(ivc => ivc.RepactuacaoContratoId == repactuacao.RepactuacaoContratoId);
                        foreach (var itemveiculo in objItemRepactuacao)
                        {
                            _unitOfWork.ItemVeiculoContrato.Remove(itemveiculo);
                        }
                        _unitOfWork.RepactuacaoContrato.Remove(repactuacao);
                    }

                    _unitOfWork.Contrato.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Contrato removido com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar Contrato" });
        }

        [Route("UpdateStatusContrato")]
        public JsonResult UpdateStatusContrato(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Contrato.GetFirstOrDefault(u => u.ContratoId == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == true)
                    {
                        //res["success"] = 0;
                        objFromDb.Status = false;
                        Description = string.Format("Atualizado Status do Contrato [Nome: {0}] (Inativo)", objFromDb.AnoContrato + "/" + objFromDb.NumeroContrato);
                        type = 1;
                    }
                    else
                    {
                        //res["success"] = 1;
                        objFromDb.Status = true;
                        Description = string.Format("Atualizado Status do Contrato  [Nome: {0}] (Ativo)", objFromDb.AnoContrato + "/" + objFromDb.NumeroContrato);
                        type = 0;
                    }
                    //_unitOfWork.Save();
                    _unitOfWork.Contrato.Update(objFromDb);
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }

        //Preenche a lista de contratos
        //=============================
        [Route("ListaContratos")]
        public JsonResult OnGetListaContratos(string id)
        {
            var ContratoList = _unitOfWork.Contrato.GetContratoListForDropDown("",Convert.ToInt32(id));
            return new JsonResult(new { data = ContratoList });
        }

        [Route("PegaContrato")]
        [HttpGet]
        public IActionResult PegaContrato(Guid id)
        {

            var result = (from c in _unitOfWork.Contrato.GetAll()
                          where c.ContratoId == id
                          select new
                          {
                              c.ContratoLavadores,
                              c.ContratoMotoristas,
                              c.ContratoOperadores,
                              c.TipoContrato,
                              c.ContratoId
                          }).ToList();


            return Json(new { data = result });

        }

        //Insere Novo Contrato
        //====================
        [Route("InsereContrato")]
        [HttpPost]
        public JsonResult InsereContrato(Models.Contrato contrato)
        {
            var existeContrato = _unitOfWork.Contrato.GetFirstOrDefault(u => (u.AnoContrato == contrato.AnoContrato) && (u.NumeroContrato == contrato.NumeroContrato));
            if (existeContrato != null && existeContrato.ContratoId != contrato.ContratoId)
            {
                //_notyf.Error("Já existe um contrato com esse número!", 3);
                //SetViewModel();
                return new JsonResult(new { data = "00000000-0000-0000-0000-000000000000", message = "Já existe um contrato com esse número" });
            }

            _unitOfWork.Contrato.Add(contrato);

            //Cria a tabela de repactuação para o contrato
            var objRepactuacao = new RepactuacaoContrato();
            objRepactuacao.DataRepactuacao = contrato.DataInicio;
            objRepactuacao.Descricao = "Valor Inicial";
            objRepactuacao.ContratoId = contrato.ContratoId;
            objRepactuacao.Valor= contrato.Valor;
            _unitOfWork.RepactuacaoContrato.Add(objRepactuacao);

            _unitOfWork.Save();

            return new JsonResult(new { data = objRepactuacao.RepactuacaoContratoId, message = "Contrato Adicionado com Sucesso" });

        }

        //Insere Repactuacao
        //====================
        [Route("InsereRepactuacao")]
        [HttpPost]
        public JsonResult InsereRepactuacao(RepactuacaoContrato repactuacaoContrato)
        {
            var objRepactuacao = new RepactuacaoContrato();
            objRepactuacao.DataRepactuacao = repactuacaoContrato.DataRepactuacao;
            objRepactuacao.Valor = repactuacaoContrato.Valor;
            objRepactuacao.Descricao = repactuacaoContrato.Descricao;
            objRepactuacao.ContratoId = repactuacaoContrato.ContratoId;
            objRepactuacao.Vigencia = repactuacaoContrato.Vigencia;
            objRepactuacao.Prorrogacao = repactuacaoContrato.Prorrogacao;

            _unitOfWork.RepactuacaoContrato.Add(objRepactuacao);

            var objContrato = _unitOfWork.Contrato.GetFirstOrDefault(c => c.ContratoId == repactuacaoContrato.ContratoId);

            objContrato.Valor = repactuacaoContrato.Valor;
            objContrato.DataRepactuacao = repactuacaoContrato.DataRepactuacao;
            objContrato.Prorrogacao = repactuacaoContrato.Prorrogacao;
            objContrato.Vigencia = repactuacaoContrato.Vigencia;

            _unitOfWork.Contrato.Update(objContrato);

            _unitOfWork.Save();

            return new JsonResult(new { data = objRepactuacao.RepactuacaoContratoId, message = "Repactuação Adicionada com Sucesso" });
        }

        //Atualiza Repactuacao
        //====================
        [Route("AtualizaRepactuacao")]
        [HttpPost]
        public JsonResult AtualizaRepactuacao(RepactuacaoContrato repactuacaoContrato)
        {
            _unitOfWork.RepactuacaoContrato.Update(repactuacaoContrato);

            if (repactuacaoContrato.AtualizaContrato == true)
            {
                var objContrato = _unitOfWork.Contrato.GetFirstOrDefault(c => c.ContratoId == repactuacaoContrato.ContratoId);

                objContrato.Valor = repactuacaoContrato.Valor;
                objContrato.DataRepactuacao = repactuacaoContrato.DataRepactuacao;
                objContrato.Prorrogacao = repactuacaoContrato.Prorrogacao;
                objContrato.Vigencia = repactuacaoContrato.Vigencia;

                _unitOfWork.Contrato.Update(objContrato);

            }

            _unitOfWork.Save();

            return new JsonResult(new { data = repactuacaoContrato.RepactuacaoContratoId, message = "Repactuação Adicionada com Sucesso" });
        }

        //Insere Edita Contrato
        //=====================
        [Route("EditaContrato")]
        [HttpPost]
        public JsonResult EditaContrato(Models.Contrato contrato)
        {
            var existeContrato = _unitOfWork.Contrato.GetFirstOrDefault(u => (u.AnoContrato == contrato.AnoContrato) && (u.NumeroContrato == contrato.NumeroContrato));
            if (existeContrato != null && existeContrato.ContratoId != contrato.ContratoId)
            {
                //_notyf.Error("Já existe um contrato com esse número!", 3);
                //SetViewModel();
                return new JsonResult(new { data = "00000000-0000-0000-0000-000000000000", message = "Já existe um contrato com esse número" });
            }

            _unitOfWork.Contrato.Update(contrato);

            _unitOfWork.Save();

            return new JsonResult(new { data = contrato, message = "Contrato Atualizado com Sucesso" });
        }

        //Insere Novo Item Contrato
        //=========================
        [Route("InsereItemContrato")]
        [HttpPost]
        public JsonResult InsereItemContrato(ItemVeiculoContrato itemveiculo)
        {

            _unitOfWork.ItemVeiculoContrato.Add(itemveiculo);

            _unitOfWork.Save();

            return new JsonResult(new { data = itemveiculo.ItemVeiculoId, message = "Item Veiculo Contrato adicionado com sucesso" });
        }

        //Insere Novo Item Contrato
        //=========================
        [Route("AtualizaItemContrato")]
        [HttpPost]
        public JsonResult AtualizaItemContrato(ItemVeiculoContrato itemveiculo)
        {

            if (itemveiculo.ItemVeiculoId == Guid.Empty)
            {
                var newItemContrato = new ItemVeiculoContrato();
                newItemContrato.NumItem = itemveiculo.NumItem;
                newItemContrato.Quantidade = itemveiculo.Quantidade;
                newItemContrato.Descricao = itemveiculo.Descricao;
                newItemContrato.ValorUnitario = itemveiculo.ValorUnitario;
                newItemContrato.RepactuacaoContratoId = itemveiculo.RepactuacaoContratoId;

                _unitOfWork.ItemVeiculoContrato.Add(newItemContrato);

            }
            else
            {
                _unitOfWork.ItemVeiculoContrato.Update(itemveiculo);
            }
            _unitOfWork.Save();

            return new JsonResult(new { data = itemveiculo.ItemVeiculoId, message = "Item Veiculo Contrato adicionado com sucesso" });
        }

        //Apaga Item Contrato
        //=========================
        [Route("ApagaItemContrato")]
        [HttpPost]
        public JsonResult ApagaItemContrato(ItemVeiculoContrato itemveiculo)
        {

            _unitOfWork.ItemVeiculoContrato.Remove(itemveiculo);

            _unitOfWork.Save();

            return new JsonResult(new { data = itemveiculo.ItemVeiculoId, message = "Item Veiculo Contrato Eliminado com sucesso" });
        }

        //Insere Nova Repactuação de Terceirização
        //========================================
        [Route("InsereRepactuacaoTerceirizacao")]
        [HttpPost]
        public JsonResult InsereRepactuacaoTerceirizacao(RepactuacaoTerceirizacao repactuacaoTerceirizacao)
        {

            _unitOfWork.RepactuacaoTerceirizacao.Add(repactuacaoTerceirizacao);

            _unitOfWork.Save();

            return new JsonResult(new { data = repactuacaoTerceirizacao.RepactuacaoTerceirizacaoId, message = "Repactuação do Contrato adicionada com sucesso" });
        }

        //Atualiza Repactuação de Terceirização
        //========================================
        [Route("AtualizaRepactuacaoTerceirizacao")]
        [HttpPost]
        public JsonResult AtualizaRepactuacaoTerceirizacao(RepactuacaoTerceirizacao repactuacaoTerceirizacao)
        {

            _unitOfWork.RepactuacaoTerceirizacao.Update(repactuacaoTerceirizacao);

            _unitOfWork.Save();

            return new JsonResult(new { data = repactuacaoTerceirizacao.RepactuacaoTerceirizacaoId, message = "Repactuação do Contrato adicionada com sucesso" });
        }

        //Insere Nova Repactuação de Serviços
        //========================================
        [Route("InsereRepactuacaoServicos")]
        [HttpPost]
        public JsonResult InsereRepactuacaoServicos(RepactuacaoServicos repactuacaoServicos)
        {

            _unitOfWork.RepactuacaoServicos.Add(repactuacaoServicos);

            _unitOfWork.Save();

            return new JsonResult(new { data = repactuacaoServicos.RepactuacaoServicoId, message = "Repactuação do Contrato adicionada com sucesso" });
        }

        //Atualiza Repactuação de Serviços
        //========================================
        [Route("AtualizaRepactuacaoServicos")]
        [HttpPost]
        public JsonResult AtualizaRepactuacaoServicos(RepactuacaoServicos repactuacaoServicos)
        {

            _unitOfWork.RepactuacaoServicos.Update(repactuacaoServicos);

            _unitOfWork.Save();

            return new JsonResult(new { data = repactuacaoServicos.RepactuacaoServicoId, message = "Repactuação do Contrato adicionada com sucesso" });
        }

        //Preenche a lista de Repactuações baseado no contrato
        //====================================================
        [Route("RepactuacaoList")]
        [HttpGet]
        public JsonResult RepactuacaoList(Guid id)
        {

            var RepactuacaoList = (from r in _unitOfWork.RepactuacaoContrato.GetAll()
                                  where r.ContratoId == id
                                  orderby r.DataRepactuacao descending
                                  select new
                                  {
                                      DataFormatada = r.DataRepactuacao?.ToString("dd/MM/yy"),
                                      r.Descricao,
                                      r.RepactuacaoContratoId,
                                      Valor =  r.Valor?.ToString("C"),
                                      ValorMensal = (r.Valor/ 12)?.ToString("C"),
                                      r.Vigencia,
                                      r.Prorrogacao,
                                      Repactuacao = "(" + r.DataRepactuacao?.ToString("dd/MM/yy") + ") " + r.Descricao
                                  }).ToList();

            return new JsonResult(new { data = RepactuacaoList });
        }


        [Route("RecuperaTipoContrato")]
        [HttpGet]
        public ActionResult RecuperaTipoContrato(Guid Id)
        {

            var contratoObj = _unitOfWork.Contrato.GetFirstOrDefault(c => c.ContratoId == Id);

            return Json(new { data = contratoObj });

        }

        [Route("RecuperaRepactuacaoTerceirizacao")]
        [HttpGet]
        public ActionResult RecuperaRepactuacaoTerceirizacao(string RepactuacaoContratoId)
        {

            var objRepactuacaoTerceirizacao = _unitOfWork.RepactuacaoTerceirizacao.GetFirstOrDefault(r => r.RepactuacaoContratoId == Guid.Parse(RepactuacaoContratoId));

            return Json(new { objRepactuacaoTerceirizacao });

        }

        [Route("ExisteItem")]
        [HttpGet]
        public ActionResult ExisteItem(Guid RepactuacaoContratoId)
        {

            var objRepactuacaoLocacao = (from v in _unitOfWork.Veiculo.GetAll()
                          join ivc in _unitOfWork.ItemVeiculoContrato.GetAll() on v.ItemVeiculoId equals ivc.ItemVeiculoId
                          where ivc.RepactuacaoContratoId == RepactuacaoContratoId
                          orderby ivc.NumItem
                          select new
                          {
                              v.VeiculoId,
                          }).ToList();

            //var objRepactuacaoLocacao = _unitOfWork.ItemVeiculoContrato.GetFirstOrDefault(r => r.RepactuacaoContratoId == RepactuacaoContratoId);

            if (objRepactuacaoLocacao.Count() == 0)
            {
                return Json(new { existeItem = false });
            }
            else
            {
                return Json(new { existeItem = true });
            }
            

        }


        //Apaga Repactuação
        //=================
        [Route("ApagaRepactuacao")]
        [HttpGet]
        public JsonResult DeleteOS(Guid Id)
        {
            try
            {
                // ---- Percorre os Itens de Repactuação e Apaga-os (Locação, Terceirização, Serviços)
                //====================================================================================
                var objRepactuacaoLocacao = _unitOfWork.ItemVeiculoContrato.GetAll(iv => iv.RepactuacaoContratoId == Id);
                foreach (var itemLocacao in objRepactuacaoLocacao)
                {
                    _unitOfWork.ItemVeiculoContrato.Remove(itemLocacao);
                }

                var objRepactuacaoTerceirizacao = _unitOfWork.RepactuacaoTerceirizacao.GetAll(rt => rt.RepactuacaoContratoId == Id);
                foreach (var itemTerceirizacao in objRepactuacaoTerceirizacao)
                {
                    _unitOfWork.RepactuacaoTerceirizacao.Remove(itemTerceirizacao);
                }

                var objRepactuacaoServicos = _unitOfWork.RepactuacaoServicos.GetAll(rs => rs.RepactuacaoContratoId == Id);
                foreach (var itemServico in objRepactuacaoServicos)
                {
                    _unitOfWork.RepactuacaoServicos.Remove(itemServico);
                }


                //------Remove o Registro de Repactuação
                //======================================
                var objRepactuacao = _unitOfWork.RepactuacaoContrato.GetFirstOrDefault(rc => rc.RepactuacaoContratoId == Id);
                _unitOfWork.RepactuacaoContrato.Remove(objRepactuacao);


                _unitOfWork.Save();

                return new JsonResult(new { success = true, message = "Repactuação Excluída com Sucesso!" });
            }
            catch (Exception)
            {

                return new JsonResult(new { success = false, message = "Existem Veículos Associados a Essa Repactuação!" });

            }

        }

        [Route("UltimaRepactuacao")]
        [HttpGet]
        public IActionResult UltimaRepactuacao(Guid contratoId)
        {
            try
            {
                var objRepactuacao = _unitOfWork.RepactuacaoContrato.GetAll(rc => rc.ContratoId == contratoId).OrderByDescending(rc => rc.DataRepactuacao).First();

                var objRepactuacaoContratoId = objRepactuacao.RepactuacaoContratoId;

                return Json(objRepactuacaoContratoId);

            }
            catch (Exception)
            {

                return Json(Guid.Empty);
            }
        }

        [Route("RecuperaItensUltimaRepactuacao")]
        [HttpGet]
        public IActionResult RecuperaItensUltimaRepactuacao(Guid repactuacaoContratoId)
        {
            //var objItensRepactuacao = _unitOfWork.ItemVeiculoContrato.GetAll(ivc => ivc.RepactuacaoContratoId == repactuacaoContratoId);

            var result = (from ivc in _unitOfWork.ItemVeiculoContrato.GetAll()
                          where ivc.RepactuacaoContratoId == repactuacaoContratoId
                          orderby ivc.NumItem ascending
                          select new
                          {
                              ivc.ItemVeiculoId,
                              ivc.RepactuacaoContratoId,
                              ivc.NumItem,
                              ivc.Descricao,
                              ivc.Quantidade,
                              valUnitario = ivc.ValorUnitario?.ToString("C"),
                              valTotal = (ivc.ValorUnitario * ivc.Quantidade)?.ToString("C")
                          }).ToList().OrderBy(ivc => ivc.NumItem);

            return Json(result);
        }

        [Route("ListaItensRepactuacao")]
        [HttpGet]
        public IActionResult ListaItensRepactuacao(Guid repactuacaoContratoId)
        {
            var result = (from veic in _unitOfWork.ViewExisteItemContrato.GetAll()
                          where veic.RepactuacaoContratoId == repactuacaoContratoId
                          orderby veic.NumItem ascending
                          select new
                          {
                              veic.ItemVeiculoId,
                              veic.RepactuacaoContratoId,
                              veic.NumItem,
                              veic.Descricao,
                              veic.Quantidade,
                              valUnitario = veic.ValUnitario?.ToString("C"),
                              valTotal = (veic.ValUnitario * veic.Quantidade)?.ToString("C"),
                              veic.ExisteVeiculo
                          }).ToList().OrderBy(ivc => ivc.NumItem);

            return Json(result);
        }


    }

}
