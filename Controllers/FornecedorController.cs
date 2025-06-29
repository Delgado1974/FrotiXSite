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
    public class FornecedorController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public FornecedorController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Json(new { data = _unitOfWork.Fornecedor.GetAll() });
        }

        [Route("Delete")]
        [HttpPost]        
        public IActionResult Delete(FornecedorViewModel model)
        {
            if (model != null && model.FornecedorId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Fornecedor.GetFirstOrDefault(u => u.FornecedorId == model.FornecedorId);
                if (objFromDb != null)
                {
                    var contrato = _unitOfWork.Contrato.GetFirstOrDefault(u => u.FornecedorId == model.FornecedorId);
                    if (contrato != null)
                    {
                        return Json(new { success = false, message = "Existem contratos associados a esse fornecedor" });
                    }
                    _unitOfWork.Fornecedor.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Fornecedor removido com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar Fornecedor" });
        }

        [Route("UpdateStatusFornecedor")]
        public JsonResult UpdateStatusFornecedor(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Fornecedor.GetFirstOrDefault(u => u.FornecedorId == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == true)
                    {
                        //res["success"] = 0;
                        objFromDb.Status = false;
                        Description = string.Format("Atualizado Status do Fornecedor [Nome: {0}] (Inativo)", objFromDb.DescricaoFornecedor);
                        type = 1;
                    }
                    else
                    {
                        objFromDb.Status = true;
                        Description = string.Format("Atualizado Status do Fornecedor  [Nome: {0}] (Ativo)", objFromDb.DescricaoFornecedor);
                        type = 0;
                    }
                    _unitOfWork.Fornecedor.Update(objFromDb);
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }

    }
}
