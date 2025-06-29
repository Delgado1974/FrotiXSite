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
    public class RequisitanteController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public RequisitanteController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult Get()
        {

            var result = (from r in _unitOfWork.Requisitante.GetAll()
                          join s in _unitOfWork.SetorSolicitante.GetAll() on r.SetorSolicitanteId equals s.SetorSolicitanteId
                          orderby r.Nome
                          select new
                          {
                              r.Ponto,
                              r.Nome,
                              r.Ramal,
                              NomeSetor = s.Nome,
                              r.Status,
                              r.RequisitanteId
                          }).ToList();


            return Json(new { data = result });

        }

        [Route("Delete")]
        [HttpPost]        
        public IActionResult Delete(RequisitanteViewModel model)
        {
            if (model != null && model.RequisitanteId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Requisitante.GetFirstOrDefault(u => u.RequisitanteId == model.RequisitanteId);
                if (objFromDb != null)
                {
                    // Verifica se existem viagens associadas ao requisitante
                    //=======================================================
                    //var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u => u.ContratoId == model.ContratoId);
                    //if (empenho != null)
                    //{
                    //    return Json(new { success = false, message = "Existem emepenhos associados a esse contrato" });
                    //}

                    _unitOfWork.Requisitante.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Requisitante removido com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar Requisitante" });
        }

        [Route("UpdateStatusRequisitante")]
        public JsonResult UpdateStatusRequisitante(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Requisitante.GetFirstOrDefault(u => u.RequisitanteId == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == true)
                    {
                        //res["success"] = 0;
                        objFromDb.Status = false;
                        Description = string.Format("Atualizado Status do Requisitante [Nome: {0}] (Inativo)", objFromDb.Nome);
                        type = 1;
                    }
                    else
                    {
                        //res["success"] = 1;
                        objFromDb.Status = true;
                        Description = string.Format("Atualizado Status do Requisitante [Nome: {0}] (Ativo)", objFromDb.Nome);
                        type = 0;
                    }
                    //_unitOfWork.Save();
                    _unitOfWork.Requisitante.Update(objFromDb);
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }
    }
}
