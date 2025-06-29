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
    public class CombustivelController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public CombustivelController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Json(new { data = _unitOfWork.Combustivel.GetAll()});
        }

        [Route("Delete")]
        [HttpPost]        
        public IActionResult Delete(CombustivelViewModel model)
        {
            if (model != null && model.CombustivelId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Combustivel.GetFirstOrDefault(u => u.CombustivelId == model.CombustivelId);
                if (objFromDb != null)
                {
                    var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.CombustivelId == model.CombustivelId);
                    if (veiculo != null)
                    {
                        return Json(new { success = false, message = "Existem veículos associados a essa combustível" });
                    }
                    _unitOfWork.Combustivel.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Tipo de Combustível removido com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar Tipo de Combustível" });
        }

        [Route("UpdateStatusCombustivel")]
        public JsonResult UpdateStatusCombustivel(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Combustivel.GetFirstOrDefault(u => u.CombustivelId == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == true)
                    {
                        //res["success"] = 0;
                        objFromDb.Status = false;
                        Description = string.Format("Atualizado Status do Tipo de Combustível [Nome: {0}] (Inativo)", objFromDb.Descricao);
                        type = 1;
                    }
                    else
                    {
                        //res["success"] = 1;
                        objFromDb.Status = true;
                        Description = string.Format("Atualizado Status do Tipo de Combustível  [Nome: {0}] (Ativo)", objFromDb.Descricao);
                        type = 0;
                    }
                    //_unitOfWork.Save();
                    _unitOfWork.Combustivel.Update(objFromDb);
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }
    }
}
