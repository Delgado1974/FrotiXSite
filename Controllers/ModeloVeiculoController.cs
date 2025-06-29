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
    public class ModeloVeiculoController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public ModeloVeiculoController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Json(new { data = _unitOfWork.ModeloVeiculo.GetAll(null, null, "MarcaVeiculo") });
        }

        [Route("Delete")]
        [HttpPost]        
        public IActionResult Delete(ModeloVeiculoViewModel model)
        {
            if (model != null && model.ModeloId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.ModeloVeiculo.GetFirstOrDefault(u => u.ModeloId == model.ModeloId);
                if (objFromDb != null)
                {
                    // Verifica se existem veículos associados ao modelo
                    //==================================================
                    var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.ModeloId == model.ModeloId);
                    if (veiculo != null)
                    {
                        return Json(new { success = false, message = "Existem veículos associados a esse modelo" });
                    }
                    _unitOfWork.ModeloVeiculo.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Modelo de veículo removido com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar modelo de veículo" });
        }

        [Route("UpdateStatusModeloVeiculo")]
        public JsonResult UpdateStatusModeloVeiculo(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var objFromDb = _unitOfWork.ModeloVeiculo.GetFirstOrDefault(u => u.ModeloId == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == true)
                    {
                        //res["success"] = 0;
                        objFromDb.Status = false;
                        Description = string.Format("Atualizado Status do Modelo [Nome: {0}] (Inativo)", objFromDb.DescricaoModelo);
                        type = 1;
                    }
                    else
                    {
                        //res["success"] = 1;
                        objFromDb.Status = true;
                        Description = string.Format("Atualizado Status do Modelo  [Nome: {0}] (Ativo)", objFromDb.DescricaoModelo);
                        type = 0;
                    }
                    //_unitOfWork.Save();
                    _unitOfWork.ModeloVeiculo.Update(objFromDb);
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }
    }
}
