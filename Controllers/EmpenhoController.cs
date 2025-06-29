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
    [IgnoreAntiforgeryToken]
    public class EmpenhoController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public EmpenhoController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult Get(Guid Id, string instrumento)
        {

            if (instrumento == "contrato")
            {
                var result = (from ve in _unitOfWork.ViewEmpenhos.GetAll()
                              where ve.ContratoId == Id
                              select new
                              {
                                  ve.EmpenhoId,
                                  ve.NotaEmpenho,
                                  VigenciaInicialFormatada = ve.VigenciaInicial?.ToString("dd/MM/yyyy"),
                                  VigenciaFinalFormatada = ve.VigenciaFinal?.ToString("dd/MM/yyyy"),
                                  SaldoInicialFormatado = ve.SaldoInicial?.ToString("C"),
                                  SaldoFinalFormatado = ve.SaldoFinal?.ToString("C"),
                                  SaldoMovimentacaoFormatado = ve.SaldoMovimentacao?.ToString("C"),
                                  SaldoNFFormatado = ve.Movimentacoes != 0 ? (ve.SaldoNotas / ve.Movimentacoes)?.ToString("C") : ve.SaldoNotas?.ToString("C"),
                              }).ToList();
                return Json(new { data = result });
            }
            else
            {
                var result = (from ve in _unitOfWork.ViewEmpenhos.GetAll()
                              where ve.AtaId == Id
                              select new
                              {
                                  ve.EmpenhoId,
                                  ve.NotaEmpenho,
                                  ve.AnoVigencia,
                                  SaldoInicialFormatado = ve.SaldoInicial?.ToString("C"),
                                  SaldoFinalFormatado = ve.SaldoFinal?.ToString("C"),
                                  SaldoMovimentacaoFormatado = ve.SaldoMovimentacao?.ToString("C"),
                                  SaldoNFFormatado = ve.Movimentacoes != 0 ? (ve.SaldoNotas / ve.Movimentacoes)?.ToString("C") : ve.SaldoNotas?.ToString("C"),
                              }).ToList();
                return Json(new { data = result });
            }


        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(EmpenhoViewModel model)
        {
            if (model != null && model.EmpenhoId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Empenho.GetFirstOrDefault(u => u.EmpenhoId == model.EmpenhoId);
                if (objFromDb != null)
                {
                    // Verifica se existem notas associadas ao empenho
                    //================================================
                    var notas = _unitOfWork.NotaFiscal.GetFirstOrDefault(u => u.EmpenhoId == model.EmpenhoId);
                    if (notas != null)
                    {
                        return Json(new { success = false, message = "Existem notas associadas a esse empenho" });
                    }

                    // Verifica se existem movimentações associadas ao empenho
                    //========================================================
                    var movimentacao = _unitOfWork.MovimentacaoEmpenho.GetFirstOrDefault(u => u.EmpenhoId == model.EmpenhoId);
                    if (notas != null)
                    {
                        return Json(new { success = false, message = "Existem movimentações associadas a esse empenho" });
                    }

                    _unitOfWork.Empenho.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Empenho removido com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar Empenho" });
        }

        //[Route("UpdateStatusEmpenho")]
        //public JsonResult UpdateStatusEmpenho(Guid Id)
        //{
        //    if (Id != Guid.Empty)
        //    {
        //        var objFromDb = _unitOfWork.Empenho.GetFirstOrDefault(u => u.EmpenhoId == Id);
        //        string Description = "";
        //        int type = 0;

        //        if (objFromDb != null)
        //        {
        //            if (objFromDb.Status == true)
        //            {
        //                //res["success"] = 0;
        //                objFromDb.Status = false;
        //                Description = string.Format("Atualizado Status do Contrato [Nome: {0}] (Inativo)", objFromDb.NotaEmpenho);
        //                type = 1;
        //            }
        //            else
        //            {
        //                //res["success"] = 1;
        //                objFromDb.Status = true;
        //                Description = string.Format("Atualizado Status do Contrato  [Nome: {0}] (Ativo)", objFromDb.NotaEmpenho);
        //                type = 0;
        //            }
        //            //_unitOfWork.Save();
        //            _unitOfWork.Empenho.Update(objFromDb);
        //        }
        //        return Json(new { success = true, message = Description, type = type });
        //    }
        //    return Json(new { success = false });
        //}

        [Route("Aporte")]
        [Consumes("application/json")]
        public IActionResult Aporte([FromBody] MovimentacaoEmpenho movimentacao)
        {

            movimentacao.Valor = movimentacao.Valor / 100;
            _unitOfWork.MovimentacaoEmpenho.Add(movimentacao);

            //Atualiza Saldo Atual do Empenho
            //===============================
            var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u => u.EmpenhoId == movimentacao.EmpenhoId);
            empenho.SaldoFinal = empenho.SaldoFinal + movimentacao.Valor;
            _unitOfWork.Empenho.Update(empenho);

            _unitOfWork.Save();

            return Json(new { success = true, message = "Aporte realizado com sucesso", type = 0 });
        }

        [Route("EditarAporte")]
        [Consumes("application/json")]
        public IActionResult EditarAporte([FromBody] MovimentacaoEmpenho movimentacao)
        {

            var movimentacaoDb = _unitOfWork.MovimentacaoEmpenho.GetFirstOrDefault(u => u.MovimentacaoId == movimentacao.MovimentacaoId);

            var valorAnterior = movimentacaoDb.Valor;

            movimentacao.Valor = movimentacao.Valor / 100;
            _unitOfWork.MovimentacaoEmpenho.Update(movimentacao);

            //Atualiza Saldo Atual do Empenho
            //===============================
            var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u => u.EmpenhoId == movimentacao.EmpenhoId);
            empenho.SaldoFinal = empenho.SaldoFinal - valorAnterior + movimentacao.Valor;
            _unitOfWork.Empenho.Update(empenho);

            _unitOfWork.Save();

            return Json(new { success = true, message = "Aporte editado com sucesso", type = 0 });
        }

        [Route("EditarAnulacao")]
        [Consumes("application/json")]
        public IActionResult EditarAnulacao([FromBody] MovimentacaoEmpenho movimentacao)
        {

            var movimentacaoDb = _unitOfWork.MovimentacaoEmpenho.GetFirstOrDefault(u => u.MovimentacaoId == movimentacao.MovimentacaoId);

            var valorAnterior = movimentacaoDb.Valor;

            movimentacao.Valor = movimentacao.Valor / 100;
            _unitOfWork.MovimentacaoEmpenho.Update(movimentacao);

            //Atualiza Saldo Atual do Empenho
            //===============================
            var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u => u.EmpenhoId == movimentacao.EmpenhoId);
            empenho.SaldoFinal = empenho.SaldoFinal + valorAnterior - movimentacao.Valor;
            _unitOfWork.Empenho.Update(empenho);

            _unitOfWork.Save();

            return Json(new { success = true, message = "Anulação editada com sucesso", type = 0 });
        }


        [Route("DeleteMovimentacao")]
        [HttpPost]
        public IActionResult DeleteMovimentacao(MovimentacaoEmpenhoViewModel model)
        {
            if (model != null && model.MovimentacaoId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.MovimentacaoEmpenho.GetFirstOrDefault(u => u.MovimentacaoId == model.MovimentacaoId);
                if (objFromDb != null)
                {
                    //Atualiza Saldo Atual do Empenho
                    //===============================
                    var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u => u.EmpenhoId == objFromDb.EmpenhoId);

                    if (objFromDb.TipoMovimentacao == "A")
                    {
                        empenho.SaldoFinal = empenho.SaldoFinal - objFromDb.Valor;
                    }
                    else
                    {
                        empenho.SaldoFinal = empenho.SaldoFinal + objFromDb.Valor;
                    }
                    _unitOfWork.Empenho.Update(empenho);

                    _unitOfWork.MovimentacaoEmpenho.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Movimentação removida com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar Movimentação" });
        }

        [Route("Anulacao")]
        [Consumes("application/json")]
        public IActionResult Anulacao([FromBody] MovimentacaoEmpenho movimentacao)
        {

            movimentacao.Valor = (movimentacao.Valor / 100) * -1;
            _unitOfWork.MovimentacaoEmpenho.Update(movimentacao);

            //Atualiza Saldo Atual do Empenho
            //===============================
            var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u => u.EmpenhoId == movimentacao.EmpenhoId);
            empenho.SaldoFinal = empenho.SaldoFinal  + movimentacao.Valor;
            _unitOfWork.Empenho.Update(empenho);

            _unitOfWork.Save();

            return Json(new { success = true, message = "Anulação realizada com sucesso", type = 0 });
        }

        [Route("ListaAporte")]
        public IActionResult ListaAporte(Guid Id)
        {
            var result = (from p in _unitOfWork.MovimentacaoEmpenho.GetAll()
                          where p.TipoMovimentacao == "A"
                          orderby p.DataMovimentacao descending
                          where p.EmpenhoId == Id
                          select new
                          {
                              p.MovimentacaoId,
                              DataFormatada = p.DataMovimentacao?.ToString("dd/MM/yyyy"),
                              p.Descricao,
                              ValorFormatado = p.Valor?.ToString("C"),
                              ValorOriginal = p.Valor,
                          }).ToList();

            //result = result.OrderByDescending(x => x.DataFormatada).ToList();

            return Json(new { data = result });
        }

        [Route("ListaAnulacao")]
        public IActionResult ListaAnulacao(Guid Id)
        {
            var result = (from p in _unitOfWork.MovimentacaoEmpenho.GetAll()
                          where p.TipoMovimentacao == "G"
                          orderby p.DataMovimentacao descending
                          where p.EmpenhoId == Id
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

        [Route("SaldoNotas")]

        public IActionResult SaldoNotas(Guid Id)
        {
            var notas = _unitOfWork.NotaFiscal.GetAll(u => u.EmpenhoId == Id);

            double totalnotas = 0;

            foreach (var nota in notas)
            {
                totalnotas = (double)(totalnotas + (nota.ValorNF - nota.ValorGlosa));
            }
            return Json(new { saldonotas = totalnotas });
        }


        //Insere Novo Empenho
        //===================
        [Route("InsereEmpenho")]
        [HttpPost]
        public JsonResult InsereEmpenho(Empenho empenho)
        {
            var existeEmpenho = _unitOfWork.Empenho.GetFirstOrDefault(u => (u.NotaEmpenho == empenho.NotaEmpenho));
            if (existeEmpenho != null && existeEmpenho.EmpenhoId != empenho.EmpenhoId)
            {
                return new JsonResult(new { success = false, message = "Já existe um empenho com esse número" });
            }

            if (empenho.AtaId == Guid.Empty)
            {
                empenho.AtaId = null;
            }

            if (empenho.ContratoId == Guid.Empty)
            {
                empenho.ContratoId = null;
            }


            _unitOfWork.Empenho.Add(empenho);

            _unitOfWork.Save();

            return new JsonResult(new { success = true, message = "Empenho Adicionado com Sucesso" });
        }

        //Edita Empenho
        //===================
        [Route("EditaEmpenho")]
        [HttpPost]
        public JsonResult EditaEmpenho(Empenho empenho)
        {
            //var existeEmpenho = _unitOfWork.Empenho.GetFirstOrDefault(u => (u.NotaEmpenho == empenho.NotaEmpenho));
            //if (existeEmpenho != null && existeEmpenho.EmpenhoId != empenho.EmpenhoId)
            //{
            //    return new JsonResult(new { success = false, message = "Já existe um empenho com esse número" });
            //}

            var existeEmpenho = _unitOfWork.Empenho.GetFirstOrDefault(u => (u.NotaEmpenho == empenho.NotaEmpenho));
            if (existeEmpenho != null && existeEmpenho.EmpenhoId != empenho.EmpenhoId)
            {
                return new JsonResult(new { success = false, message = "Já existe um empenho com esse número" });

            }

            if (empenho.AtaId == Guid.Empty)
            {
                empenho.AtaId = null;
            }

            if (empenho.ContratoId == Guid.Empty)
            {
                empenho.ContratoId = null;
            }


            _unitOfWork.Empenho.Update(empenho);

            _unitOfWork.Save();

            return new JsonResult(new { success = true, message = "Empenho Alterado com Sucesso" });
        }



    }
}
