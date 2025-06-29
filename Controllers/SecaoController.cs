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
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SecaoController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public SecaoController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        //[HttpPost]
        //[Route("AdicionarSetor")]
        //public IActionResult AdicionaSetor(Setor SetorObj)
        //{

        //    //if (ChecaDuplicado(null))
        //    //{
        //    //    SetViewModel();
        //    //    return Page();
        //    //}


        //    //Verifica se já não tem um Patrimonio com esse Id
        //    //====================
        //    if (SetorObj.SetorId == Guid.Empty)
        //    {
        //        _unitOfWork.Setor.Add(SetorObj);

        //    }
        //    _unitOfWork.Save();
        //    return RedirectToPage("./Index");
        //}


        [Route("GetGrid")]
        public IActionResult GetGrid()
        {

            try
            {
                var objSecoes = (from s in _unitOfWork.SecaoPatrimonial.GetAll()
                                 join st in _unitOfWork.SetorPatrimonial.GetAllReduced(selector: st => new { st.SetorId, st.NomeSetor }) on s.SetorId equals st.SetorId
                                 select new
                                 {
                                     s.NomeSecao,
                                     st.NomeSetor,
                                     s.Status,
                                     s.SecaoId,
                                 }).ToList();

                return Json(new { data = objSecoes });
            }
            catch
            {
                throw;
            }
        }


        [Route("ListaSecoes")]
        public JsonResult OnGetListaSecoes(string setorSelecionado)
        {
            var SecoesList = _unitOfWork.SecaoPatrimonial.GetSecaoListForDropDown();
            List<SelectListItem> SecoesListFiltradas = new List<SelectListItem>();

            foreach (var Secao in SecoesList)
            {

                var setorId = Secao.Text.Split('/').Last();
                if (setorId == setorSelecionado)
                {
                    SecoesListFiltradas.Add(Secao);
                }
            }




            return new JsonResult(new { data = SecoesListFiltradas });
        }


        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete([FromBody] string secaoStringId)
        {
            try
            {


                Guid secaoId = Guid.Parse(secaoStringId);
                //Guid secaoId = Guid.Parse(secaoStringId);
                if (secaoId != Guid.Empty) //Verifica se chegou o dado correto
                {
                    var objFromDb = _unitOfWork.SecaoPatrimonial.GetFirstOrDefault(se => se.SecaoId == secaoId); //Acha o obj que tem essa id
                    if (objFromDb != null)
                    {

                        var patrimonioSalvos = _unitOfWork.Patrimonio.GetFirstOrDefault(p => p.SecaoId == objFromDb.SecaoId);
                        if (patrimonioSalvos != null)
                        {
                            return Json(new { success = false, message = "Erro, tem patrimônios salvos nessa seção" });
                        }
                    }
                    _unitOfWork.SecaoPatrimonial.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Deu certo porra" });

                }
                return Json(new { success = false, message = "Erro ao apagar Seção, possível erro de apontamento" });
            } catch(Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [Route("UpdateStatusSecao")]
        public JsonResult UpdateStatusSecao(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var objFromDb = _unitOfWork.SecaoPatrimonial.GetFirstOrDefault(u => u.SecaoId == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == true)
                    {
                        //res["success"] = 0;
                        objFromDb.Status = false;
                        Description = string.Format("Atualizado Status da Seção {0} para (Inativa)", objFromDb.NomeSecao);
                        type = 1;
                    }
                    else
                    {
                        //res["success"] = 1;
                        objFromDb.Status = true;
                        Description = string.Format("Atualizado Status da Seção {0} para (Ativa)", objFromDb.NomeSecao);
                        type = 0;
                    }
                    //db.SaveChanges();
                    //_unitOfWork.Save();
                    _unitOfWork.SecaoPatrimonial.Update(objFromDb);
                    _unitOfWork.Save();
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }

    }

}
