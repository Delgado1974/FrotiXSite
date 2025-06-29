using System;
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
    public class UsuarioController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public UsuarioController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                var result = (from u in _unitOfWork.AspNetUsers.GetAll()

                              select new
                              {
                                  UsuarioId = u.Id,
                                  u.NomeCompleto,
                                  u.Ponto,
                                  u.DetentorCargaPatrimonial,
                                  u.Status

                              }).ToList();


                return Json(new { data = result });
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(AspNetUsers users)
        {
            var objFromDb = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == users.Id);
            if (objFromDb != null)
            {

                //Verifica se pode apagar o Usuário
                var objControleAcesso = _unitOfWork.ControleAcesso.GetFirstOrDefault(ca => ca.UsuarioId == users.Id);
                if (objControleAcesso != null)
                {
                    return Json(new { success = false, message = "Não foi possível remover o Usuário. Ele está associado a um ou mais recursos!" });
                }

                _unitOfWork.AspNetUsers.Remove(objFromDb);
                _unitOfWork.Save();
                return Json(new { success = true, message = "Usuário removido com sucesso" });
            }

            return Json(new { success = false, message = "Erro ao apagar Usuário" });
        }

        [Route("UpdateStatusUsuario")]
        public JsonResult UpdateStatusUsuario(String Id)
        {
            if (Id != "")
            {
                var objFromDb = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == true)
                    {
                        //res["success"] = 0;
                        objFromDb.Status = false;
                        Description = string.Format("Atualizado Status do Usuário [Nome: {0}] (Inativo)", objFromDb.NomeCompleto);
                        type = 1;
                    }
                    else
                    {
                        //res["success"] = 1;
                        objFromDb.Status = true;
                        Description = string.Format("Atualizado Status do Usuário  [Nome: {0}] (Ativo)", objFromDb.NomeCompleto);
                        type = 0;
                    }
                    //_unitOfWork.Save();
                    _unitOfWork.AspNetUsers.Update(objFromDb);
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }

        [Route("UpdateCargaPatrimonial")]
        public JsonResult UpdateCargaPatrimonial(String Id)
        {
            if (Id != "")
            {
                var objFromDb = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.DetentorCargaPatrimonial == true)
                    {
                        //res["success"] = 0;
                        objFromDb.DetentorCargaPatrimonial = false;
                        Description = string.Format("Atualizado Carga Patrimonial do Usuário [Nome: {0}] (Não)", objFromDb.NomeCompleto);
                        type = 1;
                    }
                    else
                    {
                        //res["success"] = 1;
                        objFromDb.DetentorCargaPatrimonial = true;
                        Description = string.Format("Atualizado Carga Patrimonial do Usuário  [Nome: {0}] (Ativo)", objFromDb.NomeCompleto);
                        type = 0;
                    }
                    //_unitOfWork.Save();
                    _unitOfWork.AspNetUsers.Update(objFromDb);
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }


        [Route("UpdateStatusAcesso")]
        public JsonResult UpdateStatusAcesso(String IDS)
        {

            string inputString = IDS;
            char separator = '|';

            // Split the string based on the separator
            string[] parts = inputString.Split(separator);

            string usuarioId = parts[0];
            string recursoId = parts[1];

            var objFromDb = _unitOfWork.ControleAcesso.GetFirstOrDefault(ca => ca.UsuarioId == usuarioId && ca.RecursoId == Guid.Parse(recursoId));
            string Description = "";
            int type = 0;

            if (objFromDb != null)
            {
                if (objFromDb.Acesso == true)
                {
                    //res["success"] = 0;
                    objFromDb.Acesso = false;
                    Description = string.Format("Atualizado Acesso do Usuário ao Recurso (Sem Acesso)");
                    type = 1;
                }
                else
                {
                    //res["success"] = 1;
                    objFromDb.Acesso = true;
                    Description = string.Format("Atualizado Acesso do Usuário ao Recurso (Com Acesso)");
                    type = 0;
                }
                _unitOfWork.Save();
                _unitOfWork.ControleAcesso.Update(objFromDb);
            }
            return Json(new { success = true, message = Description, type = type });
        }

        [Route("PegaRecursosUsuario")]
        [HttpGet]
        public IActionResult PegaRecursosUsuario(String UsuarioId)
        {
            var objRecursos = _unitOfWork.ViewControleAcesso.GetAll(vca => vca.UsuarioId == UsuarioId);

            return Json(new { data = objRecursos });

        }

        [Route("PegaUsuariosRecurso")]
        [HttpGet]
        public IActionResult PegaUsuariosRecurso(String RecursoId)
        {
            var objRecursos = _unitOfWork.ViewControleAcesso.GetAll(vca => vca.RecursoId == Guid.Parse(RecursoId)).OrderBy(vca => vca.NomeCompleto);

            return Json(new { data = objRecursos });

        }

        [Route("InsereRecursosUsuario")]
        [HttpPost]
        public IActionResult InsereRecursosUsuario()
        {

                var objUsuarios = (from u in _unitOfWork.AspNetUsers.GetAll()

                              select new
                              {
                                  UsuarioId = u.Id,
                                  u.NomeCompleto,
                                  u.Ponto,
                                  u.Ramal,
                                  u.Status

                              }).ToList();

                var objRecursos = _unitOfWork.Recurso.GetAll();

                foreach (var usuario in objUsuarios)
                {
                    foreach (var recurso in objRecursos)
                    {

                        var objAcesso = new ControleAcesso();

                        objAcesso.UsuarioId = usuario.UsuarioId;
                        objAcesso.RecursoId = recurso.RecursoId;
                        objAcesso.Acesso = true;

                        _unitOfWork.ControleAcesso.Add(objAcesso);
                        _unitOfWork.Save();
                    }
                }

                return Json(new { data = true });

        }

        [HttpGet]
        [Route("listaUsuariosDetentores")]
        public IActionResult listaUsuariosDetentores()
        {
            try
            {
                var result = (from u in _unitOfWork.AspNetUsers.GetAll(u => u.DetentorCargaPatrimonial == true && u.Status == true)

                              select new
                              {
                                  UsuarioId = u.Id,
                                  u.NomeCompleto,

                              }).ToList();


                return Json(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [Route("DeleteRecurso")]
        [HttpPost]
        public IActionResult DeleteRecurso([FromBody] string RecursoId)
        {
            var objRecursos = _unitOfWork.Recurso.GetFirstOrDefault(r => r.RecursoId == Guid.Parse(RecursoId));
            if (objRecursos != null)
            {

                //Verifica se pode apagar o Recurso
                var objControleAcesso = _unitOfWork.ControleAcesso.GetFirstOrDefault(ca => ca.RecursoId == objRecursos.RecursoId);
                if (objControleAcesso != null)
                {
                    return Json(new { success = false, message = "Não foi possível remover o Recursos. Ele está associado a um ou mais Usuários!" });
                }

                _unitOfWork.Recurso.Remove(objRecursos);
                _unitOfWork.Save();
                return Json(new { success = true, message = "Recurso removido com sucesso" });
            }

            return Json(new { success = false, message = "Erro ao apagar Usuário" });
        }

    }
}
