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
    public class MarcaVeiculoController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public MarcaVeiculoController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Json(new { data = _unitOfWork.MarcaVeiculo.GetAll()});
        }

        [Route("Delete")]
        [HttpPost]        
        public IActionResult Delete(MarcaVeiculoViewModel model)
        {
            if (model != null && model.MarcaId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.MarcaVeiculo.GetFirstOrDefault(u => u.MarcaId == model.MarcaId);
                if (objFromDb != null)
                {
                    var modelo = _unitOfWork.ModeloVeiculo.GetFirstOrDefault(u => u.MarcaId == model.MarcaId);
                    if (modelo != null)
                    {
                        return Json(new { success = false, message = "Existem modelos associados a essa marca" });
                    }
                    _unitOfWork.MarcaVeiculo.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Marca de veículo removida com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar marca de veículo" });
        }

        [Route("UpdateStatusMarcaVeiculo")]
        public JsonResult UpdateStatusMarcaVeiculo(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var objFromDb = _unitOfWork.MarcaVeiculo.GetFirstOrDefault(u => u.MarcaId == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == true)
                    {
                        //res["success"] = 0;
                        objFromDb.Status = false;
                        Description = string.Format("Atualizado Status da Marca [Nome: {0}] (Inativo)", objFromDb.DescricaoMarca);
                        type = 1;
                    }
                    else
                    {
                        //res["success"] = 1;
                        objFromDb.Status = true;
                        Description = string.Format("Atualizado Status da Marca  [Nome: {0}] (Ativo)", objFromDb.DescricaoMarca);
                        type = 0;
                    }
                    //_unitOfWork.Save();
                    _unitOfWork.MarcaVeiculo.Update(objFromDb);
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }
    }
}
