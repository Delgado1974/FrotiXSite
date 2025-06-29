using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.NewtonsoftJson;
using Newtonsoft.Json.Linq;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public class CustosViagemController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private IHostingEnvironment hostingEnv;


        public CustosViagemController(IUnitOfWork unitOfWork, IHostingEnvironment env)
        {
            _unitOfWork = unitOfWork;
            hostingEnv = env;
        }

        [HttpGet]
        public IActionResult Get(string Id)
        {
                //var objCustos = _unitOfWork.ViewCustosViagem.GetAll().Where(v => v.Status == "Realizada");
            var objCustos = _unitOfWork.ViewCustosViagem.GetAllReduced(selector: v => new
            {
                v.NoFichaVistoria,
                v.ViagemId,
                v.DataInicial,
                v.DataFinal,
                v.HoraInicio,
                v.HoraFim,
                v.Finalidade,
                v.Status,
                v.KmInicial,
                v.KmFinal,
                v.Quilometragem,
                v.CustoMotorista,
                v.CustoCombustivel,
                v.CustoVeiculo,
                v.NomeMotorista,
                v.MotoristaId,
                v.VeiculoId,
                v.StatusAgendamento,
                v.SetorSolicitanteId,
                v.DescricaoVeiculo,
                v.RowNum
            });

            return Json(new { data = objCustos });

        }

        //public IActionResult Get(string Id)
        //{
        //    if (Id == "" || Id == null || Id == "Realizada")
        //    {

        //        //var objCustos = _unitOfWork.ViewCustosViagem.GetAll().Where(v => v.Status == "Realizada");
        //        var objCustos = _unitOfWork.ViewCustosViagem.GetAllReduced(selector: v => new
        //        {
        //            v.NoFichaVistoria,
        //            v.ViagemId,
        //            v.DataInicial,
        //            v.DataFinal,
        //            v.HoraInicio,
        //            v.HoraFim,
        //            v.Finalidade,
        //            v.Status,
        //            v.KmInicial,
        //            v.KmFinal,
        //            v.Quilometragem,
        //            v.CustoMotorista,
        //            v.CustoCombustivel,
        //            v.CustoVeiculo,
        //            v.NomeMotorista,
        //            v.MotoristaId,
        //            v.VeiculoId,
        //            v.StatusAgendamento,
        //            v.SetorSolicitanteId,
        //            v.DescricaoVeiculo,
        //            v.RowNum
        //        }).Where(v => v.Status == "Realizada");

        //        return Json(new { data = objCustos });

        //    }
        //    else
        //    {
        //        var objCustos = _unitOfWork.ViewCustosViagem.GetAllReduced(selector: v => new
        //        {
        //            v.NoFichaVistoria,
        //            v.ViagemId,
        //            v.DataInicial,
        //            v.DataFinal,
        //            v.HoraInicio,
        //            v.HoraFim,
        //            v.Finalidade,
        //            v.Status,
        //            v.KmInicial,
        //            v.KmFinal,
        //            v.Quilometragem,
        //            v.CustoMotorista,
        //            v.CustoCombustivel,
        //            v.CustoVeiculo,
        //            v.NomeMotorista,
        //            v.MotoristaId,
        //            v.VeiculoId,
        //            v.StatusAgendamento,
        //            v.SetorSolicitanteId,
        //            v.DescricaoVeiculo,
        //            v.RowNum
        //        }).Where(v => v.Status != "Cancelada" && v.Status != "Agendada");

        //        //return Json(new { data = _unitOfWork.ViewCustosViagem.GetAll().Where(v => v.Status != "Cancelada" && v.Status != "Agendada") });
        //        return Json(new { data = objCustos });
        //    }
        //}


        [Route("CalculaCustoViagens")]
        [HttpPost]
        public IActionResult CalculaCustoViagens()
        {
            var objViagens = _unitOfWork.Viagem.GetAll(v => v.StatusAgendamento == false && v.Status == "Realizada");

            foreach (var viagem in objViagens)
            {
                if (viagem.MotoristaId != null)
                {
                    var minutos = 0;
                    viagem.CustoMotorista = Servicos.CalculaCustoMotorista(viagem, _unitOfWork, ref minutos);
                }
                if (viagem.VeiculoId != null)
                {
                    viagem.CustoVeiculo = Servicos.CalculaCustoVeiculo(viagem, _unitOfWork);
                    viagem.CustoCombustivel = Servicos.CalculaCustoCombustivel(viagem, _unitOfWork);
                }
                _unitOfWork.Viagem.Update(viagem);
            }
            _unitOfWork.Save();

            return Json(new { success = true });
        }


        [Route("ViagemVeiculos")]
        [HttpGet]
        public IActionResult ViagemVeiculos(Guid Id)
        {
            return Json(new { data = _unitOfWork.ViewCustosViagem.GetAll().Where(vv => vv.VeiculoId == Id && vv.StatusAgendamento == false) });
        }


        [Route("ViagemMotoristas")]
        [HttpGet]
        public IActionResult ViagemMotoristas(Guid Id)
        {
            return Json(new { data = _unitOfWork.ViewCustosViagem.GetAll().Where(vv => vv.MotoristaId == Id && vv.StatusAgendamento == false)});
        }


        [Route("ViagemStatus")]
        [HttpGet]
        public IActionResult ViagemStatus(string Id)
        {
            return Json(new { data = _unitOfWork.ViewCustosViagem.GetAll().Where(vv => vv.Status == Id && vv.StatusAgendamento == false) });
        }


        [Route("ViagemFinalidade")]
        [HttpGet]
        public IActionResult ViagemFinalidade(string Id)
        {
            return Json(new { data = _unitOfWork.ViewCustosViagem.GetAll().Where(vv => vv.Finalidade == Id && vv.StatusAgendamento == false) });
        }


        [Route("ViagemSetores")]
        [HttpGet]
        public IActionResult ViagemSetores(Guid Id)
        {
            return Json(new { data = _unitOfWork.ViewCustosViagem.GetAll().Where(vv => vv.SetorSolicitanteId == Id && vv.StatusAgendamento == false)});
        }

        [Route("ViagemData")]
        [HttpGet]
        public IActionResult ViagemData(string Id)
        {
            return Json(new { data = _unitOfWork.ViewCustosViagem.GetAll().Where(vv => vv.DataInicial == Id && vv.StatusAgendamento == false)});
        }

        [HttpGet]
        [Route("PegaFicha")]
        public JsonResult PegaFicha(Guid id)
        {
            if (FrotiX.Pages.Viagens.UpsertModel.viagemId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(u => u.ViagemId == FrotiX.Pages.Viagens.UpsertModel.viagemId);
                if (objFromDb.FichaVistoria != null)
                {
                    objFromDb.FichaVistoria = this.GetImage(Convert.ToBase64String(objFromDb.FichaVistoria));
                    return Json(objFromDb);
                }
                return Json(false);
            }
            else
            {
                return Json(false);
            }
        }

        [HttpGet]
        [Route("PegaFichaModal")]
        public JsonResult PegaFichaModal(Guid id)
        {
            var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(u => u.ViagemId == id);
            if (objFromDb.FichaVistoria != null)
            {
                objFromDb.FichaVistoria = this.GetImage(Convert.ToBase64String(objFromDb.FichaVistoria));
                return Json(objFromDb.FichaVistoria);
            }
            return Json(false);
        }

        public byte[] GetImage(string sBase64String)
        {
            byte[] bytes = null;
            if (!string.IsNullOrEmpty(sBase64String))
            {
                bytes = Convert.FromBase64String(sBase64String);
            }
            return bytes;
        }

        [HttpGet]
        [Route("PegaMotoristaVeiculo")]
        public JsonResult PegaMotoristaVeiculo(Guid id)
        {
            var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ViagemId == id);
            if (objFromDb != null)
            {
                return Json(new { success = true, motoristaId = objFromDb.MotoristaId, veiculoId = objFromDb.VeiculoId, finalidadeId = objFromDb.Finalidade, setorsolicitanteId = objFromDb.SetorSolicitanteId, eventoId = objFromDb.EventoId});
            }
            return Json(new { success =  false });
        }


    }

}
