using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
    public class NotaFiscalController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public NotaFiscalController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public void Get()
        {

        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(NotaFiscalViewModel model)
        {
            if (model != null && model.NotaFiscalId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.NotaFiscal.GetFirstOrDefault(u => u.NotaFiscalId == model.NotaFiscalId);
                if (objFromDb != null)
                {
                    // Atualiza saldo do Empenho
                    //================================================
                    var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u => u.EmpenhoId == objFromDb.EmpenhoId);
                    empenho.SaldoFinal = empenho.SaldoFinal + (objFromDb.ValorNF - objFromDb.ValorGlosa);
                    _unitOfWork.Empenho.Update(empenho);

                    _unitOfWork.NotaFiscal.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Nota Fiscal removida com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar Nota Fiscal" });
        }

        [Route("Glosa")]
        [Consumes("application/json")]
        public IActionResult Glosa([FromBody] GlosaNota glosanota)
        {

            glosanota.ValorGlosa = glosanota.ValorGlosa / 100;

            //Atualiza Valor da Nota
            //======================
            var notaFiscal = _unitOfWork.NotaFiscal.GetFirstOrDefault(u => u.NotaFiscalId == glosanota.NotaFiscalId);
            notaFiscal.ValorGlosa = glosanota.ValorGlosa;
            _unitOfWork.NotaFiscal.Update(notaFiscal);

            //Atualiza Saldo Atual do Empenho
            //===============================
            var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u => u.EmpenhoId == notaFiscal.EmpenhoId);
            empenho.SaldoFinal = empenho.SaldoFinal + glosanota.ValorGlosa;
            _unitOfWork.Empenho.Update(empenho);

            _unitOfWork.Save();

            return Json(new { success = true, message = "Glosa realizada com sucesso", type = 0 });
        }

        //Preenche a lista de empenhos baseado no contrato
        //==============================================
        [Route("EmpenhoList")]
        public JsonResult EmpenhoList(Guid id)
        {

            var EmpenhoList = _unitOfWork.Empenho.GetAll().Where(e => e.ContratoId == id);
            EmpenhoList = EmpenhoList.OrderByDescending(e => e.NotaEmpenho).ToList();
            return new JsonResult(new { data = EmpenhoList });
        }

        //Preenche a lista de empenhos baseado no contrato
        //==============================================
        [Route("EmpenhoListAta")]
        public JsonResult EmpenhoListAta(Guid id)
        {

            var EmpenhoList = _unitOfWork.Empenho.GetAll().Where(e => e.AtaId == id);
            EmpenhoList.OrderByDescending(e => e.NotaEmpenho);
            return new JsonResult(new { data = EmpenhoList });
        }


        //Preenche a lista de empenhos baseado no contrato
        //==============================================
        [Route("GetContrato")]
        public JsonResult GetContrato(Guid id)
        {
            var objContrato = _unitOfWork.Contrato.GetAll().Where(c => c.ContratoId == id);
            return new JsonResult(new { data = objContrato});
        }


        //Preenche a lista de NFs baseado no contrato
        //============================================
        [Route("NFContratos")]
        public IActionResult NFContratos(Guid id)
        {

            var NFList = (from nf in _unitOfWork.NotaFiscal.GetAll()
                          orderby nf.NumeroNF descending
                          where nf.ContratoId == id
                          select new
                          {
                              nf.NotaFiscalId,
                              nf.NumeroNF,
                              nf.Objeto,
                              nf.TipoNF,
                              DataFormatada = nf.DataEmissao?.ToString("dd/MM/yyyy"),
                              ValorNFFormatado = nf.ValorNF?.ToString("C"),
                              ValorGlosaFormatado = nf.ValorGlosa?.ToString("C"),
                              nf.MotivoGlosa,
                              nf.ContratoId,
                              nf.EmpenhoId,
                          }).ToList();

            //var NFList = _unitOfWork.NotaFiscal.GetAll().Where(e => e.ContratoId == id);
            //NFList.OrderByDescending(e => e.NumeroNF);

            return Json(new { data = NFList });
        }

        //Preenche a lista de NFs baseado no empenho
        //============================================
        [Route("NFEmpenhos")]
        public IActionResult NFEmpenhos(Guid id)
        {
            var NFList = (from nf in _unitOfWork.NotaFiscal.GetAll()
                          orderby nf.NumeroNF descending
                          where nf.EmpenhoId == id
                          select new
                          {
                              nf.NotaFiscalId,
                              nf.NumeroNF,
                              nf.Objeto,
                              nf.TipoNF,
                              DataFormatada = nf.DataEmissao?.ToString("dd/MM/yyyy"),
                              ValorNFFormatado = nf.ValorNF?.ToString("C"),
                              ValorGlosaFormatado = nf.ValorGlosa?.ToString("C"),
                              nf.MotivoGlosa,
                              nf.ContratoId,
                              nf.EmpenhoId,
                          }).ToList();

            //var NFList = _unitOfWork.NotaFiscal.GetAll().Where(e => e.EmpenhoId == id);
            //NFList.OrderByDescending(e => e.NumeroNF);

            return Json(new { data = NFList });
        }

    }

    public class GlosaNota
    {
        [Key]
        public Guid NotaFiscalId { get; set; }

        public double? ValorGlosa { get; set; }

        public string? MotivoGlosa { get; set; }

    }
}
