using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public class OcorrenciaController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private IHostingEnvironment hostingEnv;

        public OcorrenciaController(IUnitOfWork unitOfWork, IHostingEnvironment env)
        {
            _unitOfWork = unitOfWork;
            hostingEnv = env;
        }

        [Route("Ocorrencias")]
        [HttpGet]
        public IActionResult Ocorrencias(String Id)
        {
            var result = (
                from vv in _unitOfWork.ViewViagens.GetAll()
                where
                    (vv.StatusOcorrencia == "Aberta")
                    && (
                        (vv.ResumoOcorrencia != null && vv.ResumoOcorrencia != "")
                        || (vv.DescricaoOcorrencia != null && vv.DescricaoOcorrencia != "")
                    )
                select new
                {
                    vv.ViagemId,
                    vv.NoFichaVistoria,
                    vv.DataInicial,
                    vv.NomeMotorista,
                    vv.DescricaoVeiculo,
                    vv.ResumoOcorrencia,
                    vv.DescricaoOcorrencia,
                    vv.DescricaoSolucaoOcorrencia,
                    vv.StatusOcorrencia,
                    DescOcorrencia = vv.DescricaoOcorrencia != null
                        ? Servicos.ConvertHtml(vv.DescricaoOcorrencia)
                        : "Sem Descrição",
                }
            ).ToList();

            return Json(new { data = result });
        }

        [Route("OcorrenciasVeiculos")]
        [HttpGet]
        public IActionResult OcorrenciasVeiculos(string Id)
        {
            var result = (
                from vv in _unitOfWork.ViewViagens.GetAll()
                where
                    vv.VeiculoId == Guid.Parse(Id)
                    && (
                        (vv.ResumoOcorrencia != null && vv.ResumoOcorrencia != "")
                        || (vv.DescricaoOcorrencia != null && vv.DescricaoOcorrencia != "")
                    )
                select new
                {
                    vv.ViagemId,
                    vv.NoFichaVistoria,
                    vv.DataInicial,
                    vv.NomeMotorista,
                    vv.DescricaoVeiculo,
                    vv.ResumoOcorrencia,
                    vv.DescricaoOcorrencia,
                    vv.DescricaoSolucaoOcorrencia,
                    vv.StatusOcorrencia,
                    vv.MotoristaId,
                    vv.ImagemOcorrencia,
                    DescOcorrencia = vv.DescricaoOcorrencia != null
                        ? Servicos.ConvertHtml(vv.DescricaoOcorrencia)
                        : "Sem Descrição",
                }
            ).ToList().OrderByDescending(v => v.NoFichaVistoria).ThenByDescending(v => v.DataInicial);

            return Json(new { data = result });
        }

        [Route("OcorrenciasMotoristas")]
        [HttpGet]
        public IActionResult OcorrenciasMotoristas(string Id)
        {
            var result = (
                from vv in _unitOfWork.ViewViagens.GetAll()
                where
                    vv.MotoristaId == Guid.Parse(Id)
                    && (
                        (vv.ResumoOcorrencia != null && vv.ResumoOcorrencia != "")
                        || (vv.DescricaoOcorrencia != null && vv.DescricaoOcorrencia != "")
                    )
                select new
                {
                    vv.ViagemId,
                    vv.NoFichaVistoria,
                    vv.DataInicial,
                    vv.NomeMotorista,
                    vv.DescricaoVeiculo,
                    vv.ResumoOcorrencia,
                    vv.DescricaoOcorrencia,
                    vv.DescricaoSolucaoOcorrencia,
                    vv.StatusOcorrencia,
                    DescOcorrencia = vv.DescricaoOcorrencia != null
                        ? Servicos.ConvertHtml(vv.DescricaoOcorrencia)
                        : "Sem Descrição",
                }
            ).ToList().OrderByDescending(v => v.NoFichaVistoria).ThenByDescending(v => v.DataInicial);

            return Json(new { data = result });
        }

        [Route("OcorrenciasStatus")]
        [HttpGet]
        public IActionResult OcorrenciasStatus(string Id)
        {
            if (Id == "Todas")
            {
                var resultado = (
                    from vv in _unitOfWork.ViewViagens.GetAll()
                    where
                        (
                            (vv.ResumoOcorrencia != null && vv.ResumoOcorrencia != "")
                            || (vv.DescricaoOcorrencia != null && vv.DescricaoOcorrencia != "")
                        )
                    select new
                    {
                        vv.ViagemId,
                        vv.NoFichaVistoria,
                        vv.DataInicial,
                        vv.NomeMotorista,
                        vv.DescricaoVeiculo,
                        vv.ResumoOcorrencia,
                        vv.DescricaoOcorrencia,
                        vv.DescricaoSolucaoOcorrencia,
                        vv.StatusOcorrencia,
                        DescOcorrencia = vv.DescricaoOcorrencia != null
                            ? Servicos.ConvertHtml(vv.DescricaoOcorrencia)
                            : "Sem Descrição",
                    }
                ).ToList().OrderByDescending(v => v.NoFichaVistoria).ThenByDescending(v => v.DataInicial);

                return Json(new { data = resultado });
            }

            var result = (
                from vv in _unitOfWork.ViewViagens.GetAll()
                where
                    vv.StatusOcorrencia == Id
                    && (
                        (vv.ResumoOcorrencia != null && vv.ResumoOcorrencia != "")
                        || (vv.DescricaoOcorrencia != null && vv.DescricaoOcorrencia != "")
                    )
                select new
                {
                    vv.ViagemId,
                    vv.NoFichaVistoria,
                    vv.DataInicial,
                    vv.NomeMotorista,
                    vv.DescricaoVeiculo,
                    vv.ResumoOcorrencia,
                    vv.DescricaoOcorrencia,
                    vv.DescricaoSolucaoOcorrencia,
                    vv.StatusOcorrencia,
                    DescOcorrencia = vv.DescricaoOcorrencia != null
                        ? Servicos.ConvertHtml(vv.DescricaoOcorrencia)
                        : "Sem Descrição",
                }
            ).ToList().OrderByDescending(v => v.NoFichaVistoria).ThenByDescending(v => v.DataInicial);

            return Json(new { data = result });
        }

        [Route("OcorrenciasData")]
        [HttpGet]
        public IActionResult OcorrenciasData(string Id)
        {
            // Attempt to parse the string Id into a DateTime object
            if (DateTime.TryParse(Id, out DateTime parsedDate))
            {
                var result = (
                    from vv in _unitOfWork.ViewViagens.GetAll()
                    where
                        vv.DataInicial.HasValue
                        && vv.DataInicial.Value.Date == parsedDate.Date
                        && (
                            (vv.ResumoOcorrencia != null && vv.ResumoOcorrencia != "")
                            || (vv.DescricaoOcorrencia != null && vv.DescricaoOcorrencia != "")
                        )
                    select new
                    {
                        vv.ViagemId,
                        vv.NoFichaVistoria,
                        vv.DataInicial,
                        vv.NomeMotorista,
                        vv.DescricaoVeiculo,
                        vv.ResumoOcorrencia,
                        vv.DescricaoOcorrencia,
                        vv.DescricaoSolucaoOcorrencia,
                        vv.StatusOcorrencia,
                        DescOcorrencia = vv.DescricaoOcorrencia != null
                            ? Servicos.ConvertHtml(vv.DescricaoOcorrencia)
                            : "Sem Descrição",
                    }
                ).ToList().OrderByDescending(v => v.NoFichaVistoria).ThenByDescending(v => v.DataInicial);

                return Json(new { data = result });
            }

            // Return an error response if the Id is not a valid date
            return Json(new { success = false, message = "Data inválida fornecida." });
        }

        [Route("BaixarOcorrencia")]
        [HttpPost]
        public IActionResult BaixarOcorrencia(ViagemID id)
        {
            var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(u => u.ViagemId == id.ViagemId);
            if (objFromDb != null)
            {
                objFromDb.StatusOcorrencia = "Baixada";
                _unitOfWork.Viagem.Update(objFromDb);
                _unitOfWork.Save();
                return Json(new { success = true, message = "Ocorrência baixada com sucesso" });
            }
            return Json(new { success = false, message = "Erro ao baixar ocorrência" });
        }

        [Route("SaveImage")]
        public void SaveImage(IList<IFormFile> UploadFiles)
        {
            try
            {
                foreach (IFormFile file in UploadFiles)
                {
                    if (UploadFiles != null)
                    {
                        string filename = ContentDispositionHeaderValue
                            .Parse(file.ContentDisposition)
                            .FileName.Trim('"');
                        filename =
                            hostingEnv.WebRootPath
                            + "\\DadosEditaveis\\ImagensViagens"
                            + $@"\{filename}";

                        // Create a new directory, if it does not exists
                        if (
                            !Directory.Exists(
                                hostingEnv.WebRootPath + "\\DadosEditaveis\\ImagensViagens"
                            )
                        )
                        {
                            Directory.CreateDirectory(
                                hostingEnv.WebRootPath + "\\DadosEditaveis\\ImagensViagens"
                            );
                        }

                        if (!System.IO.File.Exists(filename))
                        {
                            using (FileStream fs = System.IO.File.Create(filename))
                            {
                                file.CopyTo(fs);
                                fs.Flush();
                            }
                            Response.StatusCode = 200;
                        }
                    }
                }
            }
            catch (Exception)
            {
                Response.StatusCode = 204;
            }
        }

        [Route("EditaOcorrencia")]
        [Consumes("application/json")]
        public IActionResult EditaOcorrencia([FromBody] FinalizacaoViagem viagem)
        {
            //Edita Ocorrência
            //================
            var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                v.ViagemId == viagem.ViagemId
            );
            objViagem.ResumoOcorrencia = viagem.ResumoOcorrencia;
            objViagem.DescricaoOcorrencia = viagem.DescricaoOcorrencia;
            objViagem.StatusOcorrencia = viagem.StatusOcorrencia;
            objViagem.DescricaoSolucaoOcorrencia = viagem.SolucaoOcorrencia;

            _unitOfWork.Viagem.Update(objViagem);

            _unitOfWork.Save();

            return Json(
                new
                {
                    success = true,
                    message = "Ocorrência atualizada com sucesso",
                    type = 0,
                }
            );
        }

        //Fecha Itens Manutenção/OS
        //================================================
        [Route("FechaItemOS")]
        [HttpPost]
        public JsonResult FechaItemOS(Models.ItensManutencao itensMmanutencao)
        {
            var objItensManutencao = _unitOfWork.ItensManutencao.GetFirstOrDefault(im =>
                im.ItemManutencaoId == itensMmanutencao.ItemManutencaoId
            );

            var objManutencao = _unitOfWork.Manutencao.GetFirstOrDefault(m =>
                m.ManutencaoId == itensMmanutencao.ManutencaoId
            );

            objItensManutencao.Status = "Baixada";
            _unitOfWork.ItensManutencao.Update(objItensManutencao);

            //-------Procura Ocorrências Ligadas à Manutenção
            var ObjOcorrencias = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                v.ItemManutencaoId == objItensManutencao.ItemManutencaoId
            );
            if (ObjOcorrencias != null)
            {
                ObjOcorrencias.StatusOcorrencia = "Baixada";
                ObjOcorrencias.DescricaoSolucaoOcorrencia =
                    "Baixada na OS nº "
                    + objManutencao.NumOS
                    + " de "
                    + objManutencao.DataSolicitacao;
                _unitOfWork.Viagem.Update(ObjOcorrencias);
            }

            _unitOfWork.Save();

            return new JsonResult(
                new { data = itensMmanutencao.ManutencaoId, message = "OS Baixada com Sucesso!" }
            );
        }
    }
}
