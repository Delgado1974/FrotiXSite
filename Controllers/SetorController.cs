using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Models.Cadastros;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SetorController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public SetorController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        [Route("GetGrid")]
        public IActionResult GetGrid()
        {
            try
            {
                var objSetores = (from s in _unitOfWork.SetorPatrimonial.GetAll()
                                  join u in _unitOfWork.AspNetUsers.GetAllReduced(selector: u => new { u.Id, u.NomeCompleto }) on s.DetentorId equals u.Id
                                  select new
                                  {
                                      s.NomeSetor,
                                      u.NomeCompleto,
                                      s.SetorId,
                                      s.Status,
                                  }).ToList();

                return Json(new { data = objSetores });
            }
            catch
            {
                throw;
            }
        }

        [HttpPost]
        [Route("AdicionarSetor")]
        public IActionResult AdicionaSetor(SetorPatrimonial SetorObj)
        {

            //if (ChecaDuplicado(null))
            //{
            //    SetViewModel();
            //    return Page();
            //}


            //Verifica se já não tem um Patrimonio com esse Id
            //====================
            if (SetorObj.SetorId == Guid.Empty)
            {
                _unitOfWork.SetorPatrimonial.Add(SetorObj);

            }

            _unitOfWork.Save();
            return RedirectToPage("./Index");
        }

        [Route("ListaSetores")]
        public JsonResult OnGetListaSetores()
        {
            var SetoresList = _unitOfWork.SetorPatrimonial.GetSetorListForDropDown();
            return new JsonResult(new { data = SetoresList });
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete([FromBody] string setorStringId)
        {
            try
            {
                Guid setorId = Guid.Parse(setorStringId);

                if (setorId != Guid.Empty) //Verifica se chegou o dado correto
                {
                    var objFromDb = _unitOfWork.SetorPatrimonial.GetFirstOrDefault(se => se.SetorId == setorId); //Acha o obj que tem essa id
                    if (objFromDb != null)
                    {

                        var secoesSalvas = _unitOfWork.SecaoPatrimonial.GetFirstOrDefault(se => se.SetorId == objFromDb.SetorId);//Verifica se tem seção dentro do setor
                        if (secoesSalvas != null)
                        {
                            return Json(new { success = false, message = "Erro, tem seções salvas nessa seção" });
                        }
                    }
                    _unitOfWork.SetorPatrimonial.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Deu certo porra" });

                }
                return Json(new { success = false, message = "Erro ao apagar Setor, possível erro de apontamento" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [Route("UpdateStatusSetor")]
        public JsonResult UpdateStatusSetor(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var objFromDb = _unitOfWork.SetorPatrimonial.GetFirstOrDefault(u => u.SetorId == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == true)
                    {
                        //res["success"] = 0;
                        objFromDb.Status = false;
                        Description = string.Format("Atualizado Status do Setor {0} para (Inativo)", objFromDb.NomeSetor);
                        type = 1;
                    }
                    else
                    {
                        //res["success"] = 1;
                        objFromDb.Status = true;
                        Description = string.Format("Atualizado Status do Setor {0} para (Ativo)", objFromDb.NomeSetor);
                        type = 0;
                    }
                    _unitOfWork.SetorPatrimonial.Update(objFromDb);
                    _unitOfWork.Save();
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }

    }

}
