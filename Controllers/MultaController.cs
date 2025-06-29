using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public class MultaController : Controller
    {

        [BindProperty]
        public MovimentacaoEmpenhoMultaViewModel MovimentacaoObj { get; set; }

         private readonly IUnitOfWork _unitOfWork;

        public MultaController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [Route("ListaMultas")]
        [HttpGet]
        public IActionResult ListaMultas(string Fase, string Veiculo, string Orgao, string Motorista, string Infracao, string Status)
        {
            var result = (from vm in _unitOfWork.viewMultas.GetAll()
                          where vm.Fase == Fase
                          select new
                          {
                              vm.Fase,
                              vm.MultaId,
                              vm.NumInfracao,
                              vm.Data,
                              vm.Hora,
                              vm.Nome,
                              vm.Telefone,
                              vm.MotoristaId,
                              vm.Placa,
                              vm.VeiculoId,
                              vm.Sigla,
                              vm.OrgaoAutuanteId,
                              vm.Localizacao,
                              vm.Artigo,
                              vm.Vencimento,
                              vm.TipoMultaId,
                              ValorAteVencimento = vm.ValorAteVencimento?.ToString("C"),
                              ValorPosVencimento = vm.ValorPosVencimento?.ToString("C"),
                              vm.ProcessoEDoc,
                              vm.Status,
                              Descricao = Servicos.ConvertHtml(vm.Descricao),
                              Observacao = Servicos.ConvertHtml(vm.Observacao),
                              vm.Paga,
                              Habilitado = vm.Paga == true ? "" : "data-toggle='modal' data-target='#modalRegistraPagamento'",
                              Tooltip = vm.Paga == true ? "Pagamento já Registrado" : "Registra Pagamento",
                              DataPagamento = vm.DataPagamento != null ? vm.DataPagamento : "",
                              ValorPago = vm.ValorPago != null ? vm.ValorPago?.ToString("C") : ""
                          });

             var filtro = result.AsQueryable();

            filtro = filtro.Where(f => f.Fase == Fase);

            if (Motorista != null)
            {
                filtro = filtro.Where(m => m.MotoristaId == Guid.Parse(Motorista));
            }

            if (Orgao != null)
            {
                filtro = filtro.Where(o => o.OrgaoAutuanteId == Guid.Parse(Orgao));
            }

            if (Veiculo != null)
            {
                filtro = filtro.Where(v => v.VeiculoId == Guid.Parse(Veiculo));
            }

            if (Infracao != null)
            {
                filtro = filtro.Where(t => t.TipoMultaId == Guid.Parse(Infracao));
            }

            if (Status != null)
            {
                filtro = filtro.Where(t => t.Status == Status);
            }

            return Json(new { data = filtro.ToList() });
        }

        [Route("PegaTipoMulta")]
        [HttpGet]
        public IActionResult PegaTipoMulta()
        {

             var result = (from tm in _unitOfWork.TipoMulta.GetAll()
                          select new
                          {
                              tm.TipoMultaId,
                              tm.Artigo,
                              Denatran = tm.CodigoDenatran + " / " + tm.Desdobramento,
                              tm.Descricao,
                              tm.Infracao
                          }).ToList();

            return Json(new { data = result});
        }

        [Route("PegaOrgaoAutuante")]
        [HttpGet]
        public IActionResult PegaOrgaoAutuante()
        {

            var objOrgaoAutuante= _unitOfWork.OrgaoAutuante.GetAll();

            return Json(new { data = objOrgaoAutuante });
        }


        public class TipoMultaAjax
        {
            public Guid TipoMultaId { get; set; }
        }


        [Route("DeleteTipoMulta")]
        [HttpPost]
        public IActionResult DeleteTipoMulta(TipoMultaAjax model)
        {
            if (model != null && model.TipoMultaId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.TipoMulta.GetFirstOrDefault(u => u.TipoMultaId == model.TipoMultaId);
                if (objFromDb != null)
                {
                    // - Verifica Se Existem Multas Associadas
                    //========================================
                    //var modelo = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.PlacaBronzeId == model.PlacaBronzeId);
                    //if (modelo != null)
                    //{
                    //    return Json(new { success = false, message = "Existem veículos associados a essa placa" });
                    //}
                    _unitOfWork.TipoMulta.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Infração removida com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar Infração" });
        }


        public class OrgaoAutuanteAjax
        {
            public Guid OrgaoAutuanteId { get; set; }
        }


        [Route("DeleteOrgaoAutuante")]
        [HttpPost]
        public IActionResult DeleteOrgaoAutuante(OrgaoAutuanteAjax Orgao)
        {
            var objFromDb = _unitOfWork.OrgaoAutuante.GetFirstOrDefault(u => u.OrgaoAutuanteId == Orgao.OrgaoAutuanteId);
            if (objFromDb != null)
            {
                // - Verifica Se Existem Multas Associadas
                //========================================
                //var modelo = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.PlacaBronzeId == model.PlacaBronzeId);
                //if (modelo != null)
                //{
                //    return Json(new { success = false, message = "Existem veículos associados a essa placa" });
                //}
                _unitOfWork.OrgaoAutuante.Remove(objFromDb);
                _unitOfWork.Save();
                return Json(new { success = true, message = "Órgão Autuante removido com sucesso" });
            }
            return Json(new { success = false, message = "Erro ao apagar Órgão Autuante" });
        }

        [Route("PegaEmpenhos")]
        [HttpGet]
        public IActionResult PegaEmpenhos(Guid Id)
        {

            var objEmpenhoMulta = (from vem in _unitOfWork.ViewEmpenhoMulta.GetAll()
                                  where vem.OrgaoAutuanteId == Id
                                  select new
                                  {
                                      vem.EmpenhoMultaId,
                                      vem.NotaEmpenho,
                                      vem.AnoVigencia,
                                      SaldoInicialFormatado = vem.SaldoInicial?.ToString("C"),
                                      SaldoAtualFormatado = vem.SaldoAtual?.ToString("C"),
                                      SaldoMovimentacaoFormatado = vem.SaldoMovimentacao?.ToString("C"),
                                      SaldoMultaFormatado = vem.SaldoMultas?.ToString("C"),
                                  }).ToList();

            //var objFromDb = _unitOfWork.EmpenhoMulta.GetFirstOrDefault(e => e.OrgaoAutuanteId == Orgao.OrgaoAutuanteId);
            if (objEmpenhoMulta != null)
            {
                return Json(new { data = objEmpenhoMulta });
            }
            return Json(new { success = false, message = "Erro ao recuperar Empenhos" });
        }


        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(MultaViewModel model)
        {
            if (model != null && model.MultaId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Multa.GetFirstOrDefault(u => u.MultaId == model.MultaId);
                if (objFromDb != null)
                {
                    if ((bool)(objFromDb.Paga != null))
                    {
                        //Altera o valor do Empenho se Multa já paga
                        var objEmpenhoMulta = _unitOfWork.EmpenhoMulta.GetFirstOrDefault(m => m.EmpenhoMultaId == objFromDb.EmpenhoMultaId);
                        objEmpenhoMulta.SaldoAtual = objEmpenhoMulta.SaldoAtual + objFromDb.ValorPago;
                        _unitOfWork.EmpenhoMulta.Update(objEmpenhoMulta);

                        //Insere Movimentação se multa já paga
                        MovimentacaoObj = new MovimentacaoEmpenhoMultaViewModel
                        {
                            MovimentacaoEmpenhoMulta = new Models.MovimentacaoEmpenhoMulta()
                        };
                        MovimentacaoObj.MovimentacaoEmpenhoMulta.Descricao = objFromDb.NumInfracao;
                        MovimentacaoObj.MovimentacaoEmpenhoMulta.TipoMovimentacao = "P";
                        MovimentacaoObj.MovimentacaoEmpenhoMulta.Valor = objFromDb.ValorPago;
                        MovimentacaoObj.MovimentacaoEmpenhoMulta.DataMovimentacao = objFromDb.DataPagamento;
                        MovimentacaoObj.MovimentacaoEmpenhoMulta.MultaId = objFromDb.MultaId;
                        MovimentacaoObj.MovimentacaoEmpenhoMulta.EmpenhoMultaId = (Guid)objFromDb.EmpenhoMultaId;
                        _unitOfWork.MovimentacaoEmpenhoMulta.Add(MovimentacaoObj.MovimentacaoEmpenhoMulta);
                    }

                    _unitOfWork.Save();

                    //Remove a multa
                    _unitOfWork.Multa.Remove(objFromDb);

                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Notificação de Autuação removida com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar Notificação de Autuação" });
        }


        [Route("TransformaPenalidade")]
        [HttpGet]
        public IActionResult TransformaPenalidade(string MultaId , string DataVencimento, string ValorAteVencimento, string Observacao, string PenalidadePDF, string ProcessoEDoc)
        {
                var objFromDb = _unitOfWork.Multa.GetFirstOrDefault(u => u.MultaId == Guid.Parse(MultaId));
                if (objFromDb != null)
                {

                    objFromDb.Vencimento = DateTime.Parse(DataVencimento);
                    objFromDb.ValorAteVencimento = Double.Parse(ValorAteVencimento);
                    objFromDb.Observacao = Observacao;
                    objFromDb.PenalidadePDF = PenalidadePDF;
                    objFromDb.ProcessoEDoc= ProcessoEDoc;
                    objFromDb.Status = "À Pagar";
                    objFromDb.Fase = "Penalidade";

                _unitOfWork.Multa.Update(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Notificação de Autuação transformada com sucesso" });
                }
            return Json(new { success = false, message = "Erro ao transformar Notificação de Autuação" });
        }


        [Route("ProcuraViagem")]
        [HttpPost]
        public IActionResult ProcuraViagem(ProcuraViagemViewModel model)
        {
            if (model != null && model.VeiculoId != Guid.Empty)
            {
                DateTime DataAutuacao = DateTime.Parse(model.Data);
                DateTime HoraAutuacao = DateTime.Parse(model.Hora);


                //var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(v => v.VeiculoId == model.VeiculoId && (v.DataInicial <= DataAutuacao && v.DataFinal >= DataAutuacao) && (v.HoraInicio <= HoraAutuacao && v.HoraFim >= HoraAutuacao));
                var objFromDb = _unitOfWork.ViewProcuraFicha.GetAll(v => v.VeiculoId == model.VeiculoId && ((v.DataInicial <= DataAutuacao && v.DataFinal >= DataAutuacao) || (v.DataInicial <= DataAutuacao && v.DataFinal == null)));

                if (objFromDb != null)
                {
                    foreach (var viagem in objFromDb)
                    {

                        Console.WriteLine(viagem.NoFichaVistoria);

                        //Viagem ainda está em aberto (não deveria, mas....)
                        if (viagem.DataFinal == null)
                        {
                            return Json(new { success = true, message = "Viagem encontrada com sucesso!", nofichavistoria = viagem.NoFichaVistoria, motoristaid = viagem.MotoristaId });
                        }

                        //Viagem começou e terminou em dias diferentes
                        if (viagem.DataInicial < viagem.DataFinal)
                        {
                            //Multa ocorreu depois da data inicial da viagem
                            if (DataAutuacao > viagem.DataInicial)
                            {
                                //Multa ocorreu antes da data final da viagem - Multa Pertence à viagem
                                if (DataAutuacao < viagem.DataFinal)
                                {
                                    return Json(new { success = true, message = "Viagem encontrada com sucesso!", nofichavistoria = viagem.NoFichaVistoria, motoristaid = viagem.MotoristaId });
                                }
                                //Multa ocorreu no dia final da viagem
                                else
                                {
                                    //Multa ocorreu antes do horário final da viagem - Multa Pertence à viagem
                                    if (HoraAutuacao <= DateTime.Parse(viagem.HoraFim))
                                    {
                                        return Json(new { success = true, message = "Viagem encontrada com sucesso!", nofichavistoria = viagem.NoFichaVistoria, motoristaid = viagem.MotoristaId });
                                    }
                                    //Não foi encontrada viagem para essa multa
                                    //else
                                    //{
                                    //    return Json(new { success = false, message = "Não foi encontrada viagem para essa multa!", nofichavistoria = 0 });
                                    //}
                                }
                            }
                            //Multa ocorreu na data inicial da viagem
                            else
                            {
                                //Multa ocorreu depois do horário inicial da viagem - Multa Pertence à viagem
                                if (HoraAutuacao >= DateTime.Parse(viagem.HoraInicio))
                                {
                                    return Json(new { success = true, message = "Viagem encontrada com sucesso!", nofichavistoria = viagem.NoFichaVistoria, motoristaid = viagem.MotoristaId });
                                }
                                ////Não foi encontrada viagem para essa multa
                                //else
                                //{
                                //    return Json(new { success = false, message = "Não foi encontrada viagem para essa multa!", nofichavistoria = 0 });
                                //}
                            }
                        }
                        //Viagem começou e terminou no mesmo dia
                        else
                        {
                            //Multa ocorreu entre o horário inicial e final da viagem - Multa Pertence à viagem
                            if (HoraAutuacao >= DateTime.Parse(viagem.HoraInicio) && HoraAutuacao <= DateTime.Parse(viagem.HoraFim))
                            {
                                return Json(new { success = true, message = "Viagem encontrada com sucesso!", nofichavistoria = viagem.NoFichaVistoria, motoristaid = viagem.MotoristaId });
                            }
                            //Não foi encontrada viagem para essa multa
                            //else
                            //{
                            //    return Json(new { success = false, message = "Não foi encontrada viagem para essa multa!", nofichavistoria = 0 });
                            //}
                        }
                    }
                    return Json(new { success = false, message = "Não foi encontrada viagem para essa multa!", nofichavistoria = 0 });
                }
                return Json(new { success = false, message = "Não foi encontrada viagem para essa multa!", nofichavistoria = 0 });
            }
            return Json(new { success = false, message = "Não foi encontrada viagem para essa multa!" });
        }


        [Route("ProcuraFicha")]
        [HttpPost]
        public IActionResult ProcuraFicha(ProcuraViagemViewModel model)
        {
            if (model != null && model.NoFichaVistoria != 0)
            {
                var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(v => v.NoFichaVistoria == model.NoFichaVistoria && v.Status == "Realizada" );

                if (objFromDb != null)
                {
                    return Json(new { success = true, message = "Ficha encontrada com sucesso!", viagemid = objFromDb.ViagemId });
                }

                return Json(new { success = false, message = "Não foi encontrada viagem para essa Ficha"});
            }

            return Json(new { success = false, message = "Não foi encontrada viagem para essa Ficha"});
        }

        //Verifica se Multa Já existe
        //===========================
        [Route("MultaExistente")]
        [HttpGet]
        public JsonResult OnGetMultaExistente(string NumInfracao)
        {
            var objMulta = _unitOfWork.Multa.GetFirstOrDefault(m => m.NumInfracao == NumInfracao);

            if (objMulta == null)
            {
                return new JsonResult(new { data = false });
            }

            return new JsonResult(new { data = true });

        }

        //Altera Status da Multa
        //======================
        [Route("AlteraStatus")]
        [HttpGet]
        public JsonResult OnPostAlteraStatus(string MultaId, string Status)
        {
            var objMulta = _unitOfWork.Multa.GetFirstOrDefault(m => m.MultaId == Guid.Parse(MultaId));

            if (objMulta == null)
            {
                return new JsonResult(new { success = false, message = "Não foi possível alterar o Status!" });
            }

            objMulta.Status = Status;
            _unitOfWork.Multa.Update(objMulta);
            _unitOfWork.Save();

            return new JsonResult(new { success = true, message = "Status Alterado com sucesso!" });

        }

        //Pega Status da Multa
        //======================
        [Route("PegaStatus")]
        [HttpGet]
        public JsonResult OnPostPegaStatus(string Id)
        {
            var objMulta = _unitOfWork.viewMultas.GetFirstOrDefault(m => m.MultaId == Guid.Parse(Id));

            if (objMulta == null)
            {
                return new JsonResult(new { success = false });
            }

            return new JsonResult(new { success = true, numInfracao = objMulta.NumInfracao, nome = objMulta.Nome, status = objMulta.Status });

        }

        //Pega Contrato do Veículo
        //========================
        [Route("PegaInstrumentoVeiculo")]
        [HttpGet]
        public JsonResult OnPostPegaInstrumentoVeiculo(string Id)
        {
            var objDbContrato = _unitOfWork.Veiculo.GetFirstOrDefault(m => m.VeiculoId == Guid.Parse(Id));

            if (objDbContrato == null || objDbContrato.ContratoId == null)
            {
                if (objDbContrato.AtaId == null)
                {
                    return new JsonResult(new { success = false });
                }
                else
                {
                    return new JsonResult(new { success = true, instrumentoid = objDbContrato.AtaId, instrumento = "ata" });
                }
            }
            else
            {
                return new JsonResult(new { success = true, instrumentoid = objDbContrato.ContratoId, instrumento = "contrato" });
            }
        }


        ////Pega Contrato do Veículo
        ////========================
        //[Route("PegaContratoVeiculo")]
        //[HttpGet]
        //public JsonResult OnPostPegaContratoVeiculo(string Id)
        //{
        //    var objDb = _unitOfWork.Veiculo.GetFirstOrDefault(m => m.VeiculoId == Guid.Parse(Id));

        //    if (objDb == null || objDb.ContratoId == null)
        //    {
        //        return new JsonResult(new { success = false });
        //    }

        //    return new JsonResult(new { success = true, contratoid = objDb.ContratoId });
        //}


        //Valida Contrato do Veículo
        //==========================
        [Route("ValidaContratoVeiculo")]
        [HttpGet]
        public JsonResult OnPostValidaContratoVeiculo(string veiculoId, string contratoId)
        {

            if (veiculoId == null)
            {
                return new JsonResult(new { success = false });
            }

            var objDb = _unitOfWork.Veiculo.GetFirstOrDefault(m => m.VeiculoId == Guid.Parse(veiculoId) && m.ContratoId == Guid.Parse(contratoId));

            if (objDb == null)
            {
                return new JsonResult(new { success = false });
            }

            return new JsonResult(new { success = true });

        }

        //Valida Ata do Veículo
        //==========================
        [Route("ValidaAtaVeiculo")]
        [HttpGet]
        public JsonResult OnPostValidaAtaVeiculo(string veiculoId, string ataId)
        {
            if (veiculoId == null)
            {
                return new JsonResult(new { success = false });
            }

            var objDb = _unitOfWork.Veiculo.GetFirstOrDefault(m => m.VeiculoId == Guid.Parse(veiculoId) && m.AtaId == Guid.Parse(ataId));

            if (objDb == null)
            {
                return new JsonResult(new { success = false });
            }

            return new JsonResult(new { success = true });

        }

        //Pega Contrato do Motorista
        //==========================
        [Route("PegaContratoMotorista")]
        [HttpGet]
        public JsonResult OnPostPegaContratoMotorista(string Id)
        {
            var objDb = _unitOfWork.Motorista.GetFirstOrDefault(m => m.MotoristaId == Guid.Parse(Id));

            if (objDb == null || objDb.ContratoId == null)
            {
                return new JsonResult(new { success = false, contratoid = "" });
            }

            return new JsonResult(new { success = true, contratoid = objDb.ContratoId });

        }

        //Valida Contrato do Motorista
        //============================
        [Route("ValidaContratoMotorista")]
        [HttpGet]
        public JsonResult OnPostValidaContratoMotorista(string motoristaId, string contratoId)
        {
            if (motoristaId == null || contratoId == null)
            {
                return new JsonResult(new { success = false });
            }

            var objDb = _unitOfWork.Motorista.GetFirstOrDefault(m => m.MotoristaId == Guid.Parse(motoristaId) && m.ContratoId == Guid.Parse(contratoId));

            if (objDb == null || objDb.ContratoId == null)
            {
                return new JsonResult(new { success = false });
            }

            return new JsonResult(new { success = true });

        }

        //Pega Valor da Multa
        //===================
        [Route("PegaValor")]
        [HttpGet]
        public JsonResult OnPostPegaValor(string Id)
        {
            var objMulta = _unitOfWork.viewMultas.GetFirstOrDefault(m => m.MultaId == Guid.Parse(Id));

            if (objMulta == null)
            {
                return new JsonResult(new { success = false });
            }

            return new JsonResult(new { success = true, valor = objMulta.ValorAteVencimento });
        }

        //Pega EmpenhoId
        //==============
        [Route("PegaEmpenhoMultaId")]
        [HttpGet]
        public JsonResult OnPostPegaEmpenhoMultaId(string Id)
        {
            var objMulta = _unitOfWork.Multa.GetFirstOrDefault(m => m.MultaId == Guid.Parse(Id));

            if (objMulta == null)
            {
                return new JsonResult(new { success = false });
            }

            return new JsonResult(new { success = true, empenhoMultaId = objMulta.EmpenhoMultaId });
        }

        //Altera Status da Multa
        //======================
        [Route("RegistraPagamento")]
        [HttpGet]
        public JsonResult OnPostRegistraPagamento(string MultaId, string DataPagamento, string ValorPago, string Status, string FormaPagamento, String ComprovantePDF, string EmpenhoMultaId)
        {
            

            var objMulta = _unitOfWork.Multa.GetFirstOrDefault(m => m.MultaId == Guid.Parse(MultaId));

            if (objMulta == null)
            {
                return new JsonResult(new { success = false, message = "Não foi possível registrar o pagamento!" });
            }

            ValorPago = ValorPago.Replace(".", ",");

            objMulta.DataPagamento = DateTime.Parse(DataPagamento);
            objMulta.ValorPago = Double.Parse( ValorPago);
            objMulta.Status = Status;
            objMulta.FormaPagamento = FormaPagamento;
            objMulta.ComprovantePDF = ComprovantePDF;
            objMulta.Paga = true;

            _unitOfWork.Multa.Update(objMulta);

            //Atualiza o valor do Empenho da Multa
            var objEmpenhoMulta = _unitOfWork.EmpenhoMulta.GetFirstOrDefault(m => m.EmpenhoMultaId == Guid.Parse(EmpenhoMultaId));
            objEmpenhoMulta.SaldoAtual = objEmpenhoMulta.SaldoAtual - Double.Parse(ValorPago);
            _unitOfWork.EmpenhoMulta.Update(objEmpenhoMulta);

            //Insere a Movimentação do Empenho
            MovimentacaoObj = new MovimentacaoEmpenhoMultaViewModel
            {
                MovimentacaoEmpenhoMulta = new Models.MovimentacaoEmpenhoMulta()
            };
            MovimentacaoObj.MovimentacaoEmpenhoMulta.Descricao = objMulta.NumInfracao;
            MovimentacaoObj.MovimentacaoEmpenhoMulta.TipoMovimentacao = "M";
            MovimentacaoObj.MovimentacaoEmpenhoMulta.Valor = Double.Parse(ValorPago);
            MovimentacaoObj.MovimentacaoEmpenhoMulta.DataMovimentacao = DateTime.Parse(DataPagamento);
            MovimentacaoObj.MovimentacaoEmpenhoMulta.MultaId = objMulta.MultaId;
            MovimentacaoObj.MovimentacaoEmpenhoMulta.EmpenhoMultaId = (Guid)objMulta.EmpenhoMultaId;
            _unitOfWork.MovimentacaoEmpenhoMulta.Add(MovimentacaoObj.MovimentacaoEmpenhoMulta);

            //Salva todas as operações
            _unitOfWork.Save();

            return new JsonResult(new { success = true, message = "Pagamento registrado com sucesso!" });

        }

        //Pega Observacao da Multa
        //=========================
        [Route("PegaObservacao")]
        [HttpGet]
        public JsonResult OnPostPegaObservacao(string Id)
        {
            var objMulta = _unitOfWork.viewMultas.GetFirstOrDefault(m => m.MultaId == Guid.Parse(Id));

            if (objMulta == null)
            {
                return new JsonResult(new { success = false });
            }

            return new JsonResult(new { success = true, numInfracao = objMulta.NumInfracao, nomeMotorista = objMulta.Nome, observacao = objMulta.Observacao});

        }

        //Preenche a lista de Multas baseado no empenho
        //=============================================
        [Route("MultaEmpenho")]
        public IActionResult MultaEmpenho(Guid id)
        {
            var MultaList = (from m in _unitOfWork.Multa.GetAll()
                             orderby m.Data descending
                             where m.EmpenhoMultaId == id
                             select new
                             {
                                 DataFormatada = m.Data?.ToString("dd/MM/yyyy"),
                                 m.NumInfracao,
                                 m.Localizacao,
                                 DataPagamentoFormatada = m.DataPagamento?.ToString("dd/MM/yyyy"),
                                 m.ValorPago,
                                 m.MultaId,
                             }).ToList();

            return Json(new { data = MultaList });
        }

        //Preenche a lista de Multas baseado no empenho
        //=============================================
        [Route("MultaEmpenhoPagas")]
        public IActionResult MultaEmpenhoPagas(Guid id)
        {
            var MultaList = (from m in _unitOfWork.Multa.GetAll(m => m.ValorPago != null)
                             orderby m.Data descending
                             where m.EmpenhoMultaId == id
                             select new
                             {
                                 DataFormatada = m.Data?.ToString("dd/MM/yyyy"),
                                 m.NumInfracao,
                                 m.Localizacao,
                                 DataPagamentoFormatada = m.DataPagamento?.ToString("dd/MM/yyyy"),
                                 m.ValorPago,
                                 m.MultaId,
                             }).ToList();

            return Json(new { data = MultaList });
        }

        //Pega o Saldo das Multas do Empenho Selecionado
        //==============================================
        [Route("SaldoMultas")]

        public IActionResult SaldoMultas(Guid Id)
        {
            var multas = _unitOfWork.Multa.GetAll(m => m.EmpenhoMultaId == Id && m.ValorPago != null);

            double totalmultas = 0;

            foreach (var multa in multas)
            {
                totalmultas = (double)(totalmultas + (multa.ValorPago));
            }
            return Json(new { saldomultas = totalmultas});
        }

        [Route("ListaAporte")]
        public IActionResult ListaAporte(Guid Id)
        {
            var result = (from p in _unitOfWork.MovimentacaoEmpenhoMulta.GetAll()
                          where p.TipoMovimentacao == "A"
                          orderby p.DataMovimentacao descending
                          where p.EmpenhoMultaId == Id
                          select new
                          {
                              p.MovimentacaoId,
                              DataFormatada = p.DataMovimentacao?.ToString("dd/MM/yyyy"),
                              p.Descricao,
                              ValorFormatado = p.Valor?.ToString("C"),
                              ValorOriginal = p.Valor,
                          }).ToList();

             return Json(new { data = result });
        }

        [Route("ListaAnulacao")]
        public IActionResult ListaAnulacao(Guid Id)
        {
            var result = (from p in _unitOfWork.MovimentacaoEmpenhoMulta.GetAll()
                          where p.TipoMovimentacao == "G"
                          orderby p.DataMovimentacao descending
                          where p.EmpenhoMultaId == Id
                          select new
                          {
                              p.MovimentacaoId,
                              DataFormatada = p.DataMovimentacao?.ToString("dd/MM/yyyy"),
                              p.Descricao,
                              ValorFormatado = p.Valor?.ToString("C"),
                              ValorOriginal = p.Valor,
                          }).ToList();

            return Json(new { data = result });
        }

        [Route("Aporte")]
        [Consumes("application/json")]
        public IActionResult Aporte([FromBody] MovimentacaoEmpenhoMulta movimentacao)
        {

            movimentacao.Valor = movimentacao.Valor / 100;
            _unitOfWork.MovimentacaoEmpenhoMulta.Add(movimentacao);

            //Atualiza Saldo Atual do Empenho
            //===============================
            var empenhomulta = _unitOfWork.EmpenhoMulta.GetFirstOrDefault(u => u.EmpenhoMultaId == movimentacao.EmpenhoMultaId);
            empenhomulta.SaldoAtual = empenhomulta.SaldoAtual + movimentacao.Valor;
            _unitOfWork.EmpenhoMulta.Update(empenhomulta);

            _unitOfWork.Save();

            return Json(new { success = true, message = "Aporte realizado com sucesso", type = 0 });
        }

        [Route("Anulacao")]
        [Consumes("application/json")]
        public IActionResult Anulacao([FromBody] MovimentacaoEmpenhoMulta movimentacao)
        {

            movimentacao.Valor = (movimentacao.Valor / 100) * -1;
            _unitOfWork.MovimentacaoEmpenhoMulta.Update(movimentacao);

            //Atualiza Saldo Atual do Empenho
            //===============================
            var empenhomulta = _unitOfWork.EmpenhoMulta.GetFirstOrDefault(e => e.EmpenhoMultaId == movimentacao.EmpenhoMultaId);
            empenhomulta.SaldoAtual = empenhomulta.SaldoAtual + movimentacao.Valor;
            _unitOfWork.EmpenhoMulta.Update(empenhomulta);

            _unitOfWork.Save();

            return Json(new { success = true, message = "Anulação realizada com sucesso", type = 0 });
        }

        [Route("EditarAporte")]
        [Consumes("application/json")]
        public IActionResult EditarAporte([FromBody] MovimentacaoEmpenhoMulta movimentacao)
        {

            var movimentacaoDb = _unitOfWork.MovimentacaoEmpenhoMulta.GetFirstOrDefault(m => m.MovimentacaoId == movimentacao.MovimentacaoId);

            var valorAnterior = movimentacaoDb.Valor;

            movimentacao.Valor = movimentacao.Valor / 100;
            _unitOfWork.MovimentacaoEmpenhoMulta.Update(movimentacao);

            //Atualiza Saldo Atual do Empenho
            //===============================
            var empenhomulta = _unitOfWork.EmpenhoMulta.GetFirstOrDefault(u => u.EmpenhoMultaId == movimentacao.EmpenhoMultaId);
            empenhomulta.SaldoAtual = empenhomulta.SaldoAtual - valorAnterior + movimentacao.Valor;
            _unitOfWork.EmpenhoMulta.Update(empenhomulta);

            _unitOfWork.Save();

            return Json(new { success = true, message = "Aporte editado com sucesso", type = 0 });
        }

        [Route("EditarAnulacao")]
        [Consumes("application/json")]
        public IActionResult EditarAnulacao([FromBody] MovimentacaoEmpenhoMulta movimentacao)
        {

            var movimentacaoDb = _unitOfWork.MovimentacaoEmpenhoMulta.GetFirstOrDefault(u => u.MovimentacaoId == movimentacao.MovimentacaoId);

            var valorAnterior = movimentacaoDb.Valor;

            movimentacao.Valor = movimentacao.Valor / 100;
            _unitOfWork.MovimentacaoEmpenhoMulta.Update(movimentacao);

            //Atualiza Saldo Atual do Empenho
            //===============================
            var empenhomulta = _unitOfWork.EmpenhoMulta.GetFirstOrDefault(u => u.EmpenhoMultaId == movimentacao.EmpenhoMultaId);
            empenhomulta.SaldoAtual = empenhomulta.SaldoAtual + valorAnterior - movimentacao.Valor;
            _unitOfWork.EmpenhoMulta.Update(empenhomulta);

            _unitOfWork.Save();

            return Json(new { success = true, message = "Anulação editada com sucesso", type = 0 });
        }



    }
}
