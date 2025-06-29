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
    public class ViagemEventoController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private IHostingEnvironment hostingEnv;
        private readonly IWebHostEnvironment webHostEnvironment;

        public ViagemEventoController(
            IUnitOfWork unitOfWork,
            IHostingEnvironment env,
            IWebHostEnvironment webHostEnvironment
        )
        {
            _unitOfWork = unitOfWork;
            hostingEnv = env;
            this.webHostEnvironment = webHostEnvironment;
        }

        [HttpGet]
        public IActionResult Get(string Id)
        {
            return Json(
                new
                {
                    data = _unitOfWork
                        .ViewViagens.GetAll()
                        .Where(v => v.Finalidade == "Evento" && v.StatusAgendamento == false),
                }
            );
        }

        [Route("ViagemEventos")]
        [HttpGet]
        public IActionResult ViagemEventos()
        {
            return Json(
                new
                {
                    data = _unitOfWork
                        .ViewViagens.GetAll()
                        .Where(v => v.Finalidade == "Evento" && v.StatusAgendamento == false),
                }
            );
        }

        [Route("Fluxo")]
        [HttpGet]
        public IActionResult Fluxo()
        {
            var result = (
                from vf in _unitOfWork.ViewFluxoEconomildo.GetAll()
                select new
                {
                    vf.ViagemEconomildoId,
                    vf.MotoristaId,
                    vf.VeiculoId,
                    vf.NomeMotorista,
                    vf.DescricaoVeiculo,
                    vf.MOB,
                    vf.Data,
                    vf.HoraInicio,
                    vf.HoraFim,
                    vf.QtdPassageiros,
                }
            ).ToList().OrderByDescending(vf => vf.Data).ThenByDescending(vf => vf.MOB).ThenByDescending(vf => vf.HoraInicio);

            return Json(new { data = result });
        }

        [Route("FluxoVeiculos")]
        [HttpGet]
        public IActionResult FluxoVeiculos(string Id)
        {
            var result = (
                from vf in _unitOfWork.ViewFluxoEconomildo.GetAll()
                where vf.VeiculoId == Guid.Parse(Id)
                select new
                {
                    vf.ViagemEconomildoId,
                    vf.MotoristaId,
                    vf.VeiculoId,
                    vf.NomeMotorista,
                    vf.DescricaoVeiculo,
                    vf.MOB,
                    vf.Data,
                    vf.HoraInicio,
                    vf.HoraFim,
                    vf.QtdPassageiros,
                }
            ).ToList().OrderByDescending(vf => vf.Data).ThenByDescending(vf => vf.MOB).ThenByDescending(vf => vf.HoraInicio);

            return Json(new { data = result });
        }

        [Route("FluxoMotoristas")]
        [HttpGet]
        public IActionResult FluxoMotoristas(string Id)
        {
            var result = (
                from vf in _unitOfWork.ViewFluxoEconomildo.GetAll()
                where vf.MotoristaId == Guid.Parse(Id)
                select new
                {
                    vf.ViagemEconomildoId,
                    vf.MotoristaId,
                    vf.VeiculoId,
                    vf.NomeMotorista,
                    vf.DescricaoVeiculo,
                    vf.MOB,
                    vf.Data,
                    vf.HoraInicio,
                    vf.HoraFim,
                    vf.QtdPassageiros,
                }
            ).ToList().OrderByDescending(vf => vf.Data).ThenByDescending(vf => vf.MOB).ThenByDescending(vf => vf.HoraInicio);

            return Json(new { data = result });
        }

        [Route("FluxoData")]
        [HttpGet]
        public IActionResult FluxoData(string Id)
        {
            var dataFluxo = DateTime.Parse(Id);

            var result = (
                from vf in _unitOfWork.ViewFluxoEconomildoData.GetAll()
                where vf.Data == dataFluxo
                select new
                {
                    vf.ViagemEconomildoId,
                    vf.MotoristaId,
                    vf.VeiculoId,
                    vf.NomeMotorista,
                    vf.DescricaoVeiculo,
                    vf.MOB,
                    vf.Data,
                    vf.HoraInicio,
                    vf.HoraFim,
                    vf.QtdPassageiros,
                }
            ).ToList().OrderByDescending(vf => vf.Data).ThenByDescending(vf => vf.MOB).ThenByDescending(vf => vf.HoraInicio);

            return Json(new { data = result });
        }

        [Route("ApagaFluxoEconomildo")]
        [HttpPost]
        public IActionResult ApagaFluxoEconomildo(ViagensEconomildo viagensEconomildo)
        {
            //Guid ViagemId = Guid.Parse(Id);
            var objFromDb = _unitOfWork.ViagensEconomildo.GetFirstOrDefault(v =>
                v.ViagemEconomildoId == viagensEconomildo.ViagemEconomildoId
            );
            _unitOfWork.ViagensEconomildo.Remove(objFromDb);
            _unitOfWork.Save();
            return Json(new { success = true, message = "Viagem apagada com sucesso" });
        }

        [Route("MyUploader")]
        [HttpPost]
        public IActionResult MyUploader(IFormFile MyUploader, [FromForm] string ViagemId)
        {
            if (MyUploader != null)
            {
                var viagemObj = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                    v.ViagemId == Guid.Parse(ViagemId)
                );
                using (var ms = new MemoryStream())
                {
                    MyUploader.CopyTo(ms);
                    viagemObj.FichaVistoria = ms.ToArray();
                }

                _unitOfWork.Viagem.Update(viagemObj);
                _unitOfWork.Save();

                return new ObjectResult(new { status = "success" });
            }
            return new ObjectResult(new { status = "fail" });
        }

        [Route("CalculaCustoViagens")]
        [HttpPost]
        public IActionResult CalculaCustoViagens()
        {
            //var objViagens = _unitOfWork.Viagem.GetAll(v => v.StatusAgendamento == false && v.Status == "Realizada" && (v.Finalidade != "Manutenção" && v.Finalidade != "Devolução à Locadora") && v.NoFichaVistoria != null && v.NoFichaVistoria == 94282);
            var objViagens = _unitOfWork.Viagem.GetAll(v =>
                v.StatusAgendamento == false
                && v.Status == "Realizada"
                && (
                    v.Finalidade != "Manutenção"
                    && v.Finalidade != "Devolução à Locadora"
                    && v.Finalidade != "Recebimento da Locadora"
                    && v.Finalidade != "Saída para Manutenção"
                    && v.Finalidade != "Chegada da Manutenção"
                )
                && v.NoFichaVistoria != null
            );

            foreach (var viagem in objViagens)
            {
                if (viagem.MotoristaId != null)
                {
                    int minutos = -1;
                    viagem.CustoMotorista = Servicos.CalculaCustoMotorista(
                        viagem,
                        _unitOfWork,
                        ref minutos
                    );
                    viagem.Minutos = minutos;
                }
                if (viagem.VeiculoId != null)
                {
                    viagem.CustoVeiculo = Servicos.CalculaCustoVeiculo(viagem, _unitOfWork);
                    viagem.CustoCombustivel = Servicos.CalculaCustoCombustivel(viagem, _unitOfWork);
                }
                viagem.CustoOperador = 0;
                viagem.CustoLavador = 0;
                _unitOfWork.Viagem.Update(viagem);
            }

            _unitOfWork.Save();

            return Json(new { success = true });
        }

        [Route("ViagemVeiculos")]
        [HttpGet]
        public IActionResult ViagemVeiculos(Guid Id)
        {
            return Json(
                new
                {
                    data = _unitOfWork
                        .ViewViagens.GetAll()
                        .Where(vv => vv.VeiculoId == Id && vv.StatusAgendamento == false),
                }
            );
        }

        [Route("ViagemMotoristas")]
        [HttpGet]
        public IActionResult ViagemMotoristas(Guid Id)
        {
            return Json(
                new
                {
                    data = _unitOfWork
                        .ViewViagens.GetAll()
                        .Where(vv => vv.MotoristaId == Id && vv.StatusAgendamento == false),
                }
            );
        }

        [Route("ViagemStatus")]
        [HttpGet]
        public IActionResult ViagemStatus(string Id)
        {
            return Json(
                new
                {
                    data = _unitOfWork
                        .ViewViagens.GetAll()
                        .Where(vv => vv.Status == Id && vv.StatusAgendamento == false),
                }
            );
        }

        [Route("ViagemSetores")]
        [HttpGet]
        public IActionResult ViagemSetores(Guid Id)
        {
            return Json(
                new
                {
                    data = _unitOfWork
                        .ViewViagens.GetAll()
                        .Where(vv => vv.SetorSolicitanteId == Id && vv.StatusAgendamento == false),
                }
            );
        }

        [Route("ViagemData")]
        [HttpGet]
        public IActionResult ViagemData(string Id)
        {
            if (DateTime.TryParse(Id, out DateTime parsedDate))
            {
                return Json(
                    new
                    {
                        data = _unitOfWork
                            .ViewViagens.GetAll()
                            .Where(vv =>
                                vv.DataInicial == parsedDate && vv.StatusAgendamento == false
                            ),
                    }
                );
            }
            return Json(new { success = false, message = "Data inválida fornecida." });
        }

        [Route("Ocorrencias")]
        [HttpGet]
        public IActionResult Ocorrencias(Guid Id)
        {
            return Json(
                new
                {
                    data = _unitOfWork
                        .ViewViagens.GetAll()
                        .Where(vv =>
                            (vv.ResumoOcorrencia != null || vv.DescricaoOcorrencia != null)
                        ),
                }
            );
        }

        [Route("Cancelar")]
        [HttpPost]
        public IActionResult Cancelar(ViagemID id)
        {
            var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(u => u.ViagemId == id.ViagemId);
            if (objFromDb != null)
            {
                objFromDb.Status = "Cancelada";
                _unitOfWork.Viagem.Update(objFromDb);
                _unitOfWork.Save();
                return Json(new { success = true, message = "Viagem cancelada com sucesso" });
            }
            return Json(new { success = false, message = "Erro ao cancelar Viagem" });
        }

        [HttpGet]
        [Route("PegaFicha")]
        public JsonResult PegaFicha(Guid id)
        {
            if (FrotiX.Pages.Viagens.UpsertModel.viagemId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(u =>
                    u.ViagemId == FrotiX.Pages.Viagens.UpsertModel.viagemId
                );
                if (objFromDb.FichaVistoria != null)
                {
                    objFromDb.FichaVistoria = this.GetImage(
                        Convert.ToBase64String(objFromDb.FichaVistoria)
                    );
                    return Json(objFromDb);
                }
                return Json(false);
            }
            else
            {
                return Json(false);
            }
        }

        [Route("AdicionarViagensEconomildo")]
        [Consumes("application/json")]
        public JsonResult AdicionarViagensEconomildo([FromBody] ViagensEconomildo viagensEconomildo)
        {
            //viagensEconomildo.Data = viagensEconomildo.Data;

            _unitOfWork.ViagensEconomildo.Add(viagensEconomildo);

            _unitOfWork.Save();

            return Json(new { success = true, message = "Viagem Adicionada com Sucesso!" });
        }

        [Route("ExisteDataEconomildo")]
        [Consumes("application/json")]
        public JsonResult ExisteDataEconomildo([FromBody] ViagensEconomildo viagensEconomildo)
        {
            //viagensEconomildo.Data = viagensEconomildo.Data;

            if (viagensEconomildo.Data != null)
            {
                var existeData = _unitOfWork.ViagensEconomildo.GetFirstOrDefault(u =>
                    u.Data == viagensEconomildo.Data
                    && u.VeiculoId == viagensEconomildo.VeiculoId
                    && u.MOB == viagensEconomildo.MOB
                    && u.MotoristaId == viagensEconomildo.MotoristaId
                );
                if (existeData != null)
                {
                    return Json(
                        new { success = false, message = "Já existe registro para essa data!" }
                    );
                }
            }

            return Json(new { success = true, message = "" });
        }

        [HttpGet]
        [Route("PegaFichaModal")]
        public JsonResult PegaFichaModal(Guid id)
        {
            var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(u => u.ViagemId == id);
            if (objFromDb.FichaVistoria != null)
            {
                objFromDb.FichaVistoria = this.GetImage(
                    Convert.ToBase64String(objFromDb.FichaVistoria)
                );
                return Json(objFromDb.FichaVistoria);
            }
            return Json(false);
        }

        [HttpGet]
        [Route("PegaCategoria")]
        public JsonResult PegaCategoria(Guid id)
        {
            var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(v => v.VeiculoId == id);
            if (objFromDb.Categoria != null)
            {
                return Json(objFromDb.Categoria);
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

        [Route("AdicionarEvento")]
        [Consumes("application/json")]
        public JsonResult AdicionarEvento([FromBody] Evento evento)
        {
            var existeEvento = _unitOfWork.Evento.GetFirstOrDefault(u => (u.Nome == evento.Nome));
            if (existeEvento != null)
            {
                return Json(new { success = false, message = "Já existe um evento com este nome" });
            }

            _unitOfWork.Evento.Add(evento);

            _unitOfWork.Save();

            return Json(
                new
                {
                    success = true,
                    message = "Evento Adicionado com Sucesso",
                    eventoid = evento.EventoId,
                }
            );
        }

        [Route("AdicionarRequisitante")]
        [Consumes("application/json")]
        public JsonResult AdicionarRequisitante([FromBody] Requisitante requisitante)
        {
            var existeRequisitante = _unitOfWork.Requisitante.GetFirstOrDefault(u =>
                (u.Ponto == requisitante.Ponto) || (u.Nome == requisitante.Nome)
            );
            if (existeRequisitante != null)
            {
                return Json(
                    new
                    {
                        success = false,
                        message = "Já existe um requisitante com este ponto/nome",
                    }
                );
            }

            requisitante.Status = true;
            requisitante.DataAlteracao = DateTime.Now;

            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            requisitante.UsuarioIdAlteracao = currentUserID;

            _unitOfWork.Requisitante.Add(requisitante);

            _unitOfWork.Save();

            return Json(
                new
                {
                    success = true,
                    message = "Requisitante Adicionado com Sucesso",
                    requisitanteid = requisitante.RequisitanteId,
                }
            );
        }

        [Route("AdicionarSetor")]
        [Consumes("application/json")]
        public JsonResult AdicionarSetor([FromBody] SetorSolicitante setorSolicitante)
        {
            if (setorSolicitante.Sigla != null)
            {
                var existeSigla = _unitOfWork.SetorSolicitante.GetFirstOrDefault(u =>
                    u.Sigla.ToUpper() == setorSolicitante.Sigla.ToUpper()
                    && u.SetorPaiId == setorSolicitante.SetorPaiId
                );
                if (
                    existeSigla != null
                    && existeSigla.SetorSolicitanteId != setorSolicitante.SetorSolicitanteId
                    && existeSigla.SetorPaiId == setorSolicitante.SetorPaiId
                )
                {
                    return Json(
                        new
                        {
                            success = false,
                            message = "Já existe um setor com esta sigla neste nível hierárquico",
                        }
                    );
                }
            }

            var existeSetor = _unitOfWork.SetorSolicitante.GetFirstOrDefault(u =>
                u.Nome.ToUpper() == setorSolicitante.Nome.ToUpper()
                && u.SetorPaiId != setorSolicitante.SetorPaiId
            );
            if (
                existeSetor != null
                && existeSetor.SetorSolicitanteId != setorSolicitante.SetorSolicitanteId
            )
            {
                if (existeSetor.SetorPaiId == setorSolicitante.SetorPaiId)
                {
                    return Json(
                        new { success = false, message = "Já existe um setor com este nome" }
                    );
                }
            }

            setorSolicitante.Status = true;
            setorSolicitante.DataAlteracao = DateTime.Now;

            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            setorSolicitante.UsuarioIdAlteracao = currentUserID;

            _unitOfWork.SetorSolicitante.Add(setorSolicitante);

            _unitOfWork.Save();

            return Json(
                new { success = true, message = "Setor Solicitante Adicionado com Sucesso" }
            );
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

        [Route("FinalizaViagem")]
        [Consumes("application/json")]
        public IActionResult FinalizaViagem([FromBody] FinalizacaoViagem viagem)
        {
            //Finaliza Viagem
            //===============
            var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                v.ViagemId == viagem.ViagemId
            );
            objViagem.DataFinal = viagem.DataFinal;
            objViagem.HoraFim = viagem.HoraFim;
            objViagem.KmFinal = viagem.KmFinal;
            objViagem.CombustivelFinal = viagem.CombustivelFinal;
            objViagem.ResumoOcorrencia = viagem.ResumoOcorrencia;
            objViagem.Descricao = viagem.Descricao;
            objViagem.DescricaoOcorrencia = viagem.DescricaoOcorrencia;
            objViagem.Status = "Realizada";
            objViagem.StatusDocumento = viagem.StatusDocumento;
            objViagem.StatusCartaoAbastecimento = viagem.StatusCartaoAbastecimento;

            if (viagem.ResumoOcorrencia != null && viagem.ResumoOcorrencia != "")
            {
                objViagem.StatusOcorrencia = "Aberta";
            }

            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            objViagem.UsuarioIdFinalizacao = currentUserID;
            objViagem.DataFinalizacao = DateTime.Now;

            objViagem.CustoCombustivel = Servicos.CalculaCustoCombustivel(objViagem, _unitOfWork);

            int minutos = -1;
            objViagem.CustoMotorista = Servicos.CalculaCustoMotorista(
                objViagem,
                _unitOfWork,
                ref minutos
            );
            objViagem.Minutos = minutos;

            objViagem.CustoVeiculo = Servicos.CalculaCustoVeiculo(objViagem, _unitOfWork);

            objViagem.CustoOperador = 0;
            objViagem.CustoLavador = 0;

            objViagem.ImagemOcorrencia = viagem.ImagemOcorrencia;

            _unitOfWork.Viagem.Update(objViagem);

            //Define a quilometragem atual do veículo
            var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v =>
                v.VeiculoId == objViagem.VeiculoId
            );
            veiculo.Quilometragem = viagem.KmFinal;

            _unitOfWork.Veiculo.Update(veiculo);

            _unitOfWork.Save();

            return Json(
                new
                {
                    success = true,
                    message = "Viagem finalizada com sucesso",
                    type = 0,
                }
            );
        }

        [Route("AjustaViagem")]
        [Consumes("application/json")]
        public IActionResult AjustaViagem([FromBody] AjusteViagem viagem)
        {
            //Finaliza Viagem
            //===============
            var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                v.ViagemId == viagem.ViagemId
            );
            objViagem.NoFichaVistoria = viagem.NoFichaVistoria;
            objViagem.DataInicial = viagem.DataInicial;
            objViagem.HoraInicio = viagem.HoraInicial;
            objViagem.KmInicial = viagem.KmInicial;
            objViagem.DataFinal = viagem.DataFinal;
            objViagem.HoraFim = viagem.HoraFim;
            objViagem.KmFinal = viagem.KmFinal;

            objViagem.MotoristaId = viagem.MotoristaId;
            objViagem.VeiculoId = viagem.VeiculoId;

            objViagem.CustoCombustivel = Servicos.CalculaCustoCombustivel(objViagem, _unitOfWork);

            int minutos = -1;
            objViagem.CustoMotorista = Servicos.CalculaCustoMotorista(
                objViagem,
                _unitOfWork,
                ref minutos
            );
            objViagem.Minutos = minutos;

            objViagem.CustoVeiculo = Servicos.CalculaCustoVeiculo(objViagem, _unitOfWork);

            objViagem.CustoOperador = 0;
            objViagem.CustoLavador = 0;

            _unitOfWork.Viagem.Update(objViagem);

            _unitOfWork.Save();

            return Json(
                new
                {
                    success = true,
                    message = "Viagem ajustada com sucesso",
                    type = 0,
                }
            );
        }

        [AttributeUsage(
            AttributeTargets.Class | AttributeTargets.Method,
            AllowMultiple = false,
            Inherited = true
        )]
        public class RequestSizeLimitAttribute : Attribute, IAuthorizationFilter, IOrderedFilter
        {
            private readonly FormOptions _formOptions;

            public RequestSizeLimitAttribute(int valueCountLimit)
            {
                _formOptions = new FormOptions()
                {
                    // tip: you can use different arguments to set each properties instead of single argument
                    KeyLengthLimit = valueCountLimit,
                    ValueCountLimit = valueCountLimit,
                    ValueLengthLimit = valueCountLimit,

                    // uncomment this line below if you want to set multipart body limit too
                    // MultipartBodyLengthLimit = valueCountLimit
                };
            }

            public int Order { get; set; }

            // taken from /a/38396065
            public void OnAuthorization(AuthorizationFilterContext context)
            {
                var contextFeatures = context.HttpContext.Features;
                var formFeature = contextFeatures.Get<IFormFeature>();

                if (formFeature == null || formFeature.Form == null)
                {
                    // Setting length limit when the form request is not yet being read
                    contextFeatures.Set<IFormFeature>(
                        new FormFeature(context.HttpContext.Request, _formOptions)
                    );
                }
            }
        }

        public class Objfile
        {
            public string file { get; set; }
            public string viagemid { get; set; }
        }

        [Route("FileUpload")]
        [HttpPost]
        [RequestSizeLimit(valueCountLimit: 1999483648)] // e.g. 2 GB request limit
        public JsonResult FileUpload(Objfile objFile)
        {
            if (objFile.viagemid == "")
            {
                return Json(false);
            }

            String viagemid = objFile.viagemid;
            var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                v.ViagemId == Guid.Parse(viagemid)
            );

            string base64 = objFile.file;
            int tamanho = objFile.file.Length;

            _unitOfWork.Viagem.Update(objViagem);

            return Json(viagemid);
        }
    }
}
