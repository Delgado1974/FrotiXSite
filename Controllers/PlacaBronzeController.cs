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
    public class PlacaBronzeController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public PlacaBronzeController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult Get()
        {

            var result = (from p in _unitOfWork.PlacaBronze.GetAll()
                          join v in _unitOfWork.Veiculo.GetAll() on p.PlacaBronzeId equals v.PlacaBronzeId into pb
                          from pbResult in pb.DefaultIfEmpty()
                          select new
                          {
                              p.PlacaBronzeId,
                              p.DescricaoPlaca,
                              p.Status,
                              PlacaVeiculo = pbResult != null ? pbResult.Placa : ""
                          }).ToList();

            return Json(new { data = result });
            //return Json(new { data = _unitOfWork.PlacaBronze.GetAll()});
        }

        [Route("Delete")]
        [HttpPost]        
        public IActionResult Delete(PlacaBronzeViewModel model)
        {
            if (model != null && model.PlacaBronzeId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.PlacaBronze.GetFirstOrDefault(u => u.PlacaBronzeId == model.PlacaBronzeId);
                if (objFromDb != null)
                {
                    var modelo = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.PlacaBronzeId == model.PlacaBronzeId);
                    if (modelo != null)
                    {
                        return Json(new { success = false, message = "Existem veículos associados a essa placa" });
                    }
                    _unitOfWork.PlacaBronze.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Placa de Bronze removida com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar placa de bronze" });
        }

        [Route("UpdateStatusPlacaBronze")]
        public JsonResult UpdateStatusPlacaBronze(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var objFromDb = _unitOfWork.PlacaBronze.GetFirstOrDefault(u => u.PlacaBronzeId == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == true)
                    {
                        //res["success"] = 0;
                        objFromDb.Status = false;
                        Description = string.Format("Atualizado Status da Placa [Nome: {0}] (Inativo)", objFromDb.DescricaoPlaca);
                        type = 1;
                    }
                    else
                    {
                        //res["success"] = 1;
                        objFromDb.Status = true;
                        Description = string.Format("Atualizado Status da Marca  [Nome: {0}] (Ativo)", objFromDb.DescricaoPlaca);
                        type = 0;
                    }
                    _unitOfWork.PlacaBronze.Update(objFromDb);
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }

        [Route("Desvincula")]
        [HttpPost]        
        public IActionResult Desvincula(PlacaBronzeViewModel model)
        {
            if (model.PlacaBronzeId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.PlacaBronzeId == model.PlacaBronzeId);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    objFromDb.PlacaBronzeId = null;
                    Description = string.Format("Placa de Bronze desassociada com sucesso!", objFromDb.Placa);
                    type = 1;
                    _unitOfWork.Veiculo.Update(objFromDb);
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }

    }
}
