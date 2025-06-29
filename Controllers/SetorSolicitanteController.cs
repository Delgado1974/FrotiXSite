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
    public class SetorSolicitanteController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public SetorSolicitanteController (IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        //public IActionResult Get()
        //{

        //    var result = (from a in _unitOfWork.AtaRegistroPrecos.GetAll()
        //                  join f in _unitOfWork.Fornecedor.GetAll() on a.FornecedorId equals f.FornecedorId
        //                  select new
        //                  {
        //                      AtaCompleta = a.AnoAta + "/" + a.NumeroAta,
        //                      ProcessoCompleto = a.NumeroProcesso + "/" + a.AnoProcesso.ToString().Substring(2,2),
        //                      a.Objeto,
        //                      f.DescricaoFornecedor,
        //                      Periodo = a.DataInicio?.ToString("dd/MM/yy") + " a " + a.DataFim?.ToString("dd/MM/yy"),
        //                      ValorFormatado = a.Valor?.ToString("C"),
        //                      a.Status,
        //                      a.AtaId
        //                  }).ToList();


        //    return Json(new { data = result });

        //}

        [Route("Delete")]
        [HttpPost]        
        public IActionResult Delete(SetorSolicitanteViewModel model)
        {
            if (model != null && model.SetorSolicitanteId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.SetorSolicitante.GetFirstOrDefault(u => u.SetorSolicitanteId == model.SetorSolicitanteId);
                if (objFromDb != null)
                {
                    // Verifica se existem filhos associados ao setor
                    //===============================================
                    var filhos = _unitOfWork.SetorSolicitante.GetFirstOrDefault(u => u.SetorPaiId == model.SetorSolicitanteId);
                    if (filhos != null)
                    {
                        return Json(new { success = false, message = "Existem setores filho associados a esse Setor pai" });
                    }
                    // Verifica se existem viagens associados ao setor
                    //================================================
                    //var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u => u.ContratoId == model.ContratoId);
                    //if (empenho != null)
                    //{
                    //    return Json(new { success = false, message = "Existem emepenhos associados a esse contrato" });
                    //}
                    _unitOfWork.SetorSolicitante.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Setor Solicitante removido com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar Setor Solicitante" });
        }

        //[Route("UpdateStatusAta")]
        //public JsonResult UpdateStatusAta(Guid Id)
        //{
        //    if (Id != Guid.Empty)
        //    {
        //        var objFromDb = _unitOfWork.AtaRegistroPrecos.GetFirstOrDefault(u => u.AtaId == Id);
        //        string Description = "";
        //        int type = 0;

        //        if (objFromDb != null)
        //        {
        //            if (objFromDb.Status == true)
        //            {
        //                //res["success"] = 0;
        //                objFromDb.Status = false;
        //                Description = string.Format("Atualizado Status da Ata [Nome: {0}] (Inativo)", objFromDb.AnoAta + "/" + objFromDb.NumeroAta);
        //                type = 1;
        //            }
        //            else
        //            {
        //                //res["success"] = 1;
        //                objFromDb.Status = true;
        //                Description = string.Format("Atualizado Status da Ata  [Nome: {0}] (Ativo)", objFromDb.AnoAta + "/" + objFromDb.NumeroAta);
        //                type = 0;
        //            }
        //            //_unitOfWork.Save();
        //            _unitOfWork.AtaRegistroPrecos.Update(objFromDb);
        //        }
        //        return Json(new { success = true, message = Description, type = type });
        //    }
        //    return Json(new { success = false });
        //}
    }
}
