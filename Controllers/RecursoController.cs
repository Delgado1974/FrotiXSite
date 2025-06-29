﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Text.Json;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecursoController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public RecursoController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult Get()
        {

            try
            {
                var result = (from r in _unitOfWork.Recurso.GetAll()

                              select new
                              {
                                  r.RecursoId,
                                  r.Nome,
                                  r.NomeMenu,
                                  r.Descricao,
                                  r.Ordem,

                              }).ToList().OrderBy(r => r.Ordem);


                return Json(new { data = result });
            }
            catch (Exception ex)
            {
                throw;
            }

        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(Recurso model)
        {
            if (model != null && model.RecursoId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Recurso.GetFirstOrDefault(r => r.RecursoId == model.RecursoId);
                if (objFromDb != null)
                {

                    //Verifica se pode apagar o Recurso
                    var objControleAcesso = _unitOfWork.ControleAcesso.GetFirstOrDefault(ca => ca.RecursoId == model.RecursoId);
                    if (objControleAcesso != null)
                    {
                        return Json(new { success = false, message = "Não foi possível remover o Recurso. Ele está associado a um ou mais usuários!" });
                    }

                    _unitOfWork.Recurso.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Recurso removido com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar Recurso" });
        }
    }
}
