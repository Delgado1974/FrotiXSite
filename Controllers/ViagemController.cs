using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Repository;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using NPOI.SS.Formula.Functions;
using Stimulsoft.Blockly.Model;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public class ViagemController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private IWebHostEnvironment hostingEnv;

        private readonly IViagemRepository _viagemRepo;

        private readonly MotoristaFotoService _fotoService;

        [ActivatorUtilitiesConstructor]
        public ViagemController(
            IUnitOfWork unitOfWork,
            IViagemRepository viagemRepo,
            IWebHostEnvironment webHostEnvironment,
            MotoristaFotoService fotoService
        )
        {
            _unitOfWork = unitOfWork;
            _viagemRepo = viagemRepo;
            hostingEnv = webHostEnvironment;
            _fotoService = fotoService;
        }

        static Expression<Func<ViewViagens, bool>> viagemsFilters(
            Guid? veiculoId,
            Guid? motoristaId,
            string dataViagem,
            string statusId,
            Guid? eventoId
        )
        {
            DateTime? parsedDataViagem = null;
            if (
                !string.IsNullOrEmpty(dataViagem) && DateTime.TryParse(dataViagem, out var tempDate)
            )
            {
                parsedDataViagem = tempDate;
            }

            return m =>
                (m.StatusAgendamento == false)
                && (
                    statusId == ""
                    || statusId == null
                    || statusId == "Todas"
                    || m.Status == statusId
                )
                && (!motoristaId.HasValue || m.MotoristaId == motoristaId)
                && (!veiculoId.HasValue || m.VeiculoId == veiculoId)
                && ((parsedDataViagem == null) || m.DataInicial == parsedDataViagem)
                && (!eventoId.HasValue || m.EventoId == eventoId);
        }

        static Guid? GetParsedId(string id)
        {
            Guid? parsed = null;
            if (id != null)
            {
                parsed = Guid.Parse(id);
            }
            return parsed;
        }

        [Route("MontaDescricaoSemFormato")]
        [HttpPost]
        public IActionResult MontaDescricaoSemFormato()
        {
            var objViagens = _unitOfWork.Viagem.GetAll(v => v.Descricao != null);

            foreach (var viagem in objViagens)
            {

                viagem.DescricaoSemFormato = Servicos.ConvertHtml(viagem.Descricao);

                _unitOfWork.Viagem.Update(viagem);
                _unitOfWork.Save();

            }


        return Json(new { success = true });
        }


        [HttpGet]
        [Route("FotoMotorista")]
        public IActionResult FotoMotorista(Guid id)
        {
            var motorista = _unitOfWork.Motorista.GetFirstOrDefault(m => m.MotoristaId == id);
            if (motorista == null || motorista.Foto == null)
                return Json(new { fotoBase64 = "" });

            string base64 = $"data:image/jpeg;base64,{Convert.ToBase64String(motorista.Foto)}";
            return Json(new { fotoBase64 = base64 });
        }

        [HttpGet("PegarStatusViagem")]
        public IActionResult PegarStatusViagem(Guid viagemId)
        {
            try
            {
                var viagem = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ViagemId == viagemId);

                if (viagem != null && viagem.Status == "Aberta")
                    return Ok(true);
                else
                    return Ok(false);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao verificar status da viagem: {ex.Message}");
            }
        }

        [HttpGet("ListaDistintos")]
        public IActionResult ListaDistintos()
        {
            try
            {
                var origens = _unitOfWork
                    .Viagem.GetAllReduced(
                        selector: v => v.Origem,
                        filter: v => !string.IsNullOrWhiteSpace(v.Origem)
                    )
                    .Select(o => o?.Trim())
                    .Where(o => !string.IsNullOrEmpty(o))
                    .Distinct()
                    .OrderBy(o => o)
                    .ToList();

                var destinos = _unitOfWork
                    .Viagem.GetAllReduced(
                        selector: v => v.Destino,
                        filter: v => !string.IsNullOrWhiteSpace(v.Destino)
                    )
                    .Select(d => d?.Trim())
                    .Where(d => !string.IsNullOrEmpty(d))
                    .Distinct()
                    .OrderBy(d => d)
                    .ToList();

                return Ok(new { origens, destinos });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao obter origens/destinos: {ex.Message}");
            }
        }

        public class UnificacaoRequest
        {
            public string NovoValor { get; set; }
            public List<string> OrigensSelecionadas { get; set; }
            public List<string> DestinosSelecionados { get; set; }
        }

        [HttpPost]
        [Route("Unificar")]
        public IActionResult Unificar([FromBody] UnificacaoRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.NovoValor))
                return BadRequest("O novo valor é obrigatório.");

            // Atualiza as origens
            if (request.OrigensSelecionadas != null)
            {
                var viagensOrigens = _unitOfWork
                    .Viagem.GetAllReduced(selector: v => new { v.ViagemId, v.Origem })
                    .Where(v => request.OrigensSelecionadas.Contains(v.Origem))
                    .ToList();

                foreach (var viagem in viagensOrigens)
                {
                    var entidade = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                        v.ViagemId == viagem.ViagemId
                    );
                    if (entidade != null)
                        entidade.Origem = request.NovoValor;
                    _unitOfWork.Viagem.Update(entidade);
                }
            }

            // Atualiza os destinos
            if (request.DestinosSelecionados != null && request.DestinosSelecionados.Any())
            {
                // Sanitiza os valores recebidos (remove espaços, ignora nulos)
                var destinosSelecionados = request
                    .DestinosSelecionados.Where(x => !string.IsNullOrWhiteSpace(x))
                    .Select(x => x.Trim())
                    .ToList();

                // Busca apenas ViagemId e Destino para ganho de performance
                var viagensDestinos = _unitOfWork
                    .Viagem.GetAllReduced(selector: v => new { v.ViagemId, v.Destino })
                    .Where(v => destinosSelecionados.Contains(v.Destino.Trim()))
                    .ToList();

                foreach (var viagem in viagensDestinos)
                {
                    var entidade = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                        v.ViagemId == viagem.ViagemId
                    );
                    if (entidade != null)
                    {
                        entidade.Destino = request.NovoValor;
                        _unitOfWork.Viagem.Update(entidade);
                    }
                }
            }

            _unitOfWork.Save();

            return Ok(new { mensagem = "Unificação realizada com sucesso." });
        }

        // ----------------------------------------------------------------------------
        // ENDPOINT Padrão (já existente) para ViewViagens, usando viagemsFilters
        // ----------------------------------------------------------------------------
        [HttpGet]
        public IActionResult Get(
            string veiculoId,
            string motoristaId,
            string statusId,
            string dataViagem,
            string eventoId
        )
        {
            var motoristaIdParam = GetParsedId(motoristaId);
            var veiculoIdParam = GetParsedId(veiculoId);
            var eventoIdParam = GetParsedId(eventoId);

            var result = _unitOfWork.ViewViagens.GetAllReduced(
                filter: viagemsFilters(
                    veiculoIdParam,
                    motoristaIdParam,
                    dataViagem,
                    statusId,
                    eventoIdParam
                ),
                selector: x => new
                {
                    x.CombustivelFinal,
                    x.CombustivelInicial,
                    x.DataFinal,
                    x.DataInicial,
                    x.Descricao,
                    x.DescricaoOcorrencia,
                    x.DescricaoSolucaoOcorrencia,
                    x.DescricaoVeiculo,
                    x.Finalidade,
                    x.HoraFim,
                    x.HoraInicio,
                    x.KmFinal,
                    x.KmInicial,
                    x.NoFichaVistoria,
                    x.NomeMotorista,
                    x.NomeRequisitante,
                    x.NomeSetor,
                    x.ResumoOcorrencia,
                    x.Status,
                    x.StatusAgendamento,
                    x.StatusCartaoAbastecimento,
                    x.StatusDocumento,
                    x.StatusOcorrencia,
                    x.ViagemId,
                    x.ImagemOcorrencia,
                }
            );

            return Json(new { data = result });
        }

        [HttpPost]
        [Route("AplicarCorrecaoOrigem")]
        public async Task<IActionResult> AplicarCorrecaoOrigem([FromBody] CorrecaoOrigemDto dto)
        {
            if (dto == null || dto.Origens == null || string.IsNullOrWhiteSpace(dto.NovaOrigem))
                return BadRequest();

            await _viagemRepo.CorrigirOrigemAsync(dto.Origens, dto.NovaOrigem);
            return Ok();
        }

        [HttpPost]
        [Route("AplicarCorrecaoDestino")]
        public async Task<IActionResult> AplicarCorrecaoDestino([FromBody] CorrecaoDestinoDto dto)
        {
            if (dto == null || dto.Destinos == null || string.IsNullOrWhiteSpace(dto.NovoDestino))
                return BadRequest();

            await _viagemRepo.CorrigirDestinoAsync(dto.Destinos, dto.NovoDestino);
            return Ok();
        }

        public class CorrecaoOrigemDto
        {
            public List<string> Origens { get; set; }
            public string NovaOrigem { get; set; }
        }

        public class CorrecaoDestinoDto
        {
            public List<string> Destinos { get; set; }
            public string NovoDestino { get; set; }
        }

        // ----------------------------------------------------------------------------
        // NOVO ENDPOINT: FluxoFiltrado para filtrar por Veículo, Motorista e/ou Data
        // ----------------------------------------------------------------------------
        [Route("FluxoFiltrado")]
        [HttpGet]
        public IActionResult FluxoFiltrado(string veiculoId, string motoristaId, string dataFluxo)
        {
            var query = _unitOfWork
                .ViewFluxoEconomildo.GetAllReduced(
                    filter: null,
                    selector: vf => new
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
                )
                .AsQueryable();

            if (!string.IsNullOrEmpty(veiculoId))
            {
                if (Guid.TryParse(veiculoId, out var veiculoGuid))
                {
                    query = query.Where(vf => vf.VeiculoId == veiculoGuid);
                }
            }

            if (!string.IsNullOrEmpty(motoristaId))
            {
                if (Guid.TryParse(motoristaId, out var motoristaGuid))
                {
                    query = query.Where(vf => vf.MotoristaId == motoristaGuid);
                }
            }

            if (!string.IsNullOrEmpty(dataFluxo))
            {
                if (DateTime.TryParse(dataFluxo, out var dataConvertida))
                {
                    query = query.Where(vf => vf.Data == dataConvertida);
                }
            }

            var resultado = query
                .Select(x => new
                {
                    x.ViagemEconomildoId,
                    x.MotoristaId,
                    x.VeiculoId,
                    x.NomeMotorista,
                    x.DescricaoVeiculo,
                    x.MOB,
                    DataFluxo = x.Data.HasValue ? x.Data.Value.ToString("dd/MM/yyyy") : "",
                    x.HoraInicio,
                    x.HoraFim,
                    x.QtdPassageiros,
                })
                .ToList();

            return Json(new { data = resultado });
        }

        // ----------------------------------------------------------------------------
        // FIM DO NOVO ENDPOINT
        // ----------------------------------------------------------------------------

        [HttpGet]
        [Route("ListaEventos")]
        public IActionResult ListaEventos()
        {
            try
            {
                var result = _unitOfWork
                    .ViewEventos.GetAllReduced(selector: ve => new
                    {
                        ve.EventoId,
                        ve.Nome,
                        ve.Descricao,
                        ve.DataInicial,
                        ve.DataFinal,
                        QtdParticipantes = ve.QtdParticipantes.ToString().PadLeft(3, '0'),
                        ve.Status,
                        ve.NomeRequisitante,
                        NomeRequisitanteHTML = Servicos.ConvertHtml(ve.NomeRequisitante),
                        ve.NomeSetor,
                        CustoViagem = string.Format("R$ {0:N2}", ve.CustoViagem),
                        CustoViagemNaoFormatado = ve.CustoViagem,
                    })
                    .ToList();

                return Json(new { data = result });
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [Route("UpdateStatusEvento")]
        public JsonResult UpdateStatusEvento(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Evento.GetFirstOrDefault(u => u.EventoId == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == "1")
                    {
                        objFromDb.Status = "0";
                        Description = string.Format(
                            "Atualizado Status do Evento [Nome: {0}] (Inativo)",
                            objFromDb.Nome
                        );
                        type = 1;
                    }
                    else
                    {
                        objFromDb.Status = "1";
                        Description = string.Format(
                            "Atualizado Status do Evento  [Nome: {0}] (Ativo)",
                            objFromDb.Nome
                        );
                        type = 0;
                    }
                    _unitOfWork.Evento.Update(objFromDb);
                }
                return Json(
                    new
                    {
                        success = true,
                        message = Description,
                        type = type,
                    }
                );
            }
            return Json(new { success = false });
        }

        [Route("ApagaEvento")]
        [HttpGet]
        public IActionResult ApagaEvento(string eventoId)
        {
            var objFromDb = _unitOfWork.Evento.GetFirstOrDefault(u =>
                u.EventoId == Guid.Parse(eventoId)
            );
            if (objFromDb != null)
            {
                var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(u =>
                    u.EventoId == Guid.Parse(eventoId)
                );
                if (objViagem != null)
                {
                    return Json(
                        new
                        {
                            success = false,
                            message = "Não foi possível remover o Evento. Ele está associado a uma ou mais viagens!",
                        }
                    );
                }

                _unitOfWork.Evento.Remove(objFromDb);
                _unitOfWork.Save();
                return Json(new { success = true, message = "Evento removido com sucesso!" });
            }

            return Json(new { success = false, message = "Erro ao apagar Evento!" });
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
            var objFluxo = _unitOfWork
                .ViewFluxoEconomildo.GetAllReduced(selector: vf => new
                {
                    vf.ViagemEconomildoId,
                    vf.MotoristaId,
                    vf.VeiculoId,
                    vf.NomeMotorista,
                    vf.DescricaoVeiculo,
                    vf.MOB,
                    DataFluxo = DateTime.Parse(vf.Data.ToString()).ToString("dd/MM/yyyy"),
                    vf.HoraInicio,
                    vf.HoraFim,
                    vf.QtdPassageiros,
                })
                .ToList();

            return Json(new { data = objFluxo });
        }

        [Route("FluxoVeiculos")]
        [HttpGet]
        public IActionResult FluxoVeiculos(string Id)
        {
            var objFluxo = _unitOfWork
                .ViewFluxoEconomildo.GetAllReduced(selector: vf => new
                {
                    vf.ViagemEconomildoId,
                    vf.MotoristaId,
                    vf.VeiculoId,
                    vf.NomeMotorista,
                    vf.DescricaoVeiculo,
                    vf.MOB,
                    DataFluxo = DateTime.Parse(vf.Data.ToString()).ToString("dd/MM/yyyy"),
                    vf.HoraInicio,
                    vf.HoraFim,
                    vf.QtdPassageiros,
                })
                .Where(vf => vf.VeiculoId == Guid.Parse(Id))
                .ToList();

            return Json(new { data = objFluxo });
        }

        [Route("FluxoMotoristas")]
        [HttpGet]
        public IActionResult FluxoMotoristas(string Id)
        {
            var objFluxo = _unitOfWork
                .ViewFluxoEconomildo.GetAllReduced(selector: vf => new
                {
                    vf.ViagemEconomildoId,
                    vf.MotoristaId,
                    vf.VeiculoId,
                    vf.NomeMotorista,
                    vf.DescricaoVeiculo,
                    vf.MOB,
                    DataFluxo = DateTime.Parse(vf.Data.ToString()).ToString("dd/MM/yyyy"),
                    vf.HoraInicio,
                    vf.HoraFim,
                    vf.QtdPassageiros,
                })
                .Where(vf => vf.MotoristaId == Guid.Parse(Id))
                .ToList();

            return Json(new { data = objFluxo });
        }

        [Route("FluxoData")]
        [HttpGet]
        public IActionResult FluxoData(string Id)
        {
            var dataFluxo = DateTime.Parse(Id);

            var objFluxo = _unitOfWork
                .ViewFluxoEconomildoData.GetAllReduced(selector: vf => new
                {
                    vf.ViagemEconomildoId,
                    vf.MotoristaId,
                    vf.VeiculoId,
                    vf.NomeMotorista,
                    vf.DescricaoVeiculo,
                    vf.MOB,
                    vf.Data,
                    DataFluxo = DateTime.Parse(vf.Data.ToString()).ToString("dd/MM/yyyy"),
                    vf.HoraInicio,
                    vf.HoraFim,
                    vf.QtdPassageiros,
                })
                .Where(vf => vf.Data == dataFluxo)
                .ToList();

            return Json(new { data = objFluxo });
        }

        [Route("ApagaFluxoEconomildo")]
        [HttpPost]
        public IActionResult ApagaFluxoEconomildo(ViagensEconomildo viagensEconomildo)
        {
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
            var viagens = _unitOfWork.ViewViagens.GetAllReduced(
                selector: x => new { x.VeiculoId, x.StatusAgendamento },
                filter: x => x.VeiculoId == Id && x.StatusAgendamento == false
            );
            return Ok(viagens);
        }

        [Route("ViagemMotoristas")]
        [HttpGet]
        public IActionResult ViagemMotoristas(Guid Id)
        {
            var viagens = _unitOfWork.ViewViagens.GetAllReduced(
                selector: x => new { x.MotoristaId, x.StatusAgendamento },
                filter: x => x.MotoristaId == Id && x.StatusAgendamento == false
            );
            return Ok(viagens);
        }

        [Route("ViagemStatus")]
        [HttpGet]
        public IActionResult ViagemStatus(string Id)
        {
            var viagens = _unitOfWork.ViewViagens.GetAllReduced(
                selector: x => new { x.Status, x.StatusAgendamento },
                filter: x => x.Status == Id && x.StatusAgendamento == false
            );
            return Ok(viagens);
        }

        [Route("ViagemSetores")]
        [HttpGet]
        public IActionResult ViagemSetores(Guid Id)
        {
            var viagens = _unitOfWork.ViewViagens.GetAllReduced(
                selector: x => new { x.SetorSolicitanteId, x.StatusAgendamento },
                filter: x => x.SetorSolicitanteId == Id && x.StatusAgendamento == false
            );
            return Ok(viagens);
        }

        [Route("ViagemData")]
        [HttpGet]
        public IActionResult ViagemData(string Id)
        {
            var viagens = _unitOfWork.ViewViagens.GetAllReduced(
                selector: x => new { x.DataInicial, x.StatusAgendamento },
                filter: x => x.DataInicial.ToString().Contains(Id) && x.StatusAgendamento == false
            );
            return Ok(viagens);
        }

        [Route("Ocorrencias")]
        [HttpGet]
        public IActionResult Ocorrencias(Guid Id)
        {
            var ocorrencias = _unitOfWork.ViewViagens.GetAllReduced(
                selector: x => new { x.ResumoOcorrencia, x.DescricaoOcorrencia },
                filter: x => x.ViagemId == Id
            );
            return Ok(ocorrencias);
        }

        [Route("Cancelar")]
        [HttpPost]
        public IActionResult Cancelar(ViagemID id)
        {
            var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(u => u.ViagemId == id.ViagemId);
            if (objFromDb != null)
            {
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                objFromDb.UsuarioIdCancelamento = currentUserID;
                objFromDb.DataCancelamento = DateTime.Now;

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
            _unitOfWork.ViagensEconomildo.Add(viagensEconomildo);
            _unitOfWork.Save();

            return Json(new { success = true, message = "Viagem Adicionada com Sucesso!" });
        }

        [Route("ExisteDataEconomildo")]
        [Consumes("application/json")]
        public JsonResult ExisteDataEconomildo([FromBody] ViagensEconomildo viagensEconomildo)
        {
            viagensEconomildo.Data = viagensEconomildo.Data;

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
                    eventoId = evento.EventoId,
                    eventoText = evento.Nome,
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

            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            setorSolicitante.UsuarioIdAlteracao = currentUserID;

            _unitOfWork.SetorSolicitante.Add(setorSolicitante);
            _unitOfWork.Save();

            return Json(
                new
                {
                    success = true,
                    message = "Setor Solicitante Adicionado com Sucesso",
                    setorId = setorSolicitante.SetorSolicitanteId,
                }
            );
        }

        [Route("ListaViagensEvento")]
        public IActionResult ListaViagensEvento(Guid Id)
        {
            var viagens = _unitOfWork.ViewViagens.GetAllReduced(
                selector: x => new
                {
                    x.EventoId,
                    x.NoFichaVistoria,
                    x.NomeRequisitante,
                    x.NomeSetor,
                    x.NomeMotorista,
                    x.DescricaoVeiculo,
                    x.CustoViagem,
                },
                filter: x => x.EventoId == Id
            );
            return Ok(viagens);
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

            if (!string.IsNullOrEmpty(viagem.ResumoOcorrencia))
            {
                objViagem.StatusOcorrencia = "Aberta";
            }

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
        [HttpPost]
        [Consumes("application/json")]
        public IActionResult AjustaViagem([FromBody] AjusteViagem viagem)
        {
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
            objViagem.Finalidade = viagem.Finalidade;
            objViagem.SetorSolicitanteId = viagem.SetorSolicitanteId;

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

            objViagem.EventoId = viagem.EventoId;

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

        // ------------------------------------------------------------------------
        // NOVO MÉTODO: "FluxoServerSide" EXEMPLO DE SERVER-SIDE PROCESSING
        // ------------------------------------------------------------------------
        [HttpPost]
        [Route("FluxoServerSide")]
        public IActionResult FluxoServerSide()
        {
            // 1) Ler parâmetros básicos do DataTables
            var draw = Request.Form["draw"].FirstOrDefault();
            var startStr = Request.Form["start"].FirstOrDefault();
            var lengthStr = Request.Form["length"].FirstOrDefault();
            var searchValue = Request.Form["search[value]"].FirstOrDefault();

            int pageSize = lengthStr != null ? Convert.ToInt32(lengthStr) : 10;
            int skip = startStr != null ? Convert.ToInt32(startStr) : 0;

            // 2) Ler parâmetros extras de filtro (Veículo, Motorista, Data)
            var veiculoIdStr = Request.Form["veiculoId"].FirstOrDefault(); // se vier Guid em string
            var motoristaIdStr = Request.Form["motoristaId"].FirstOrDefault();
            var dataFluxoStr = Request.Form["dataFluxo"].FirstOrDefault();

            // 3) Query base (por ex. ViewFluxoEconomildo)
            var query = _unitOfWork.ViewFluxoEconomildo.GetAll().AsQueryable();

            // 4) Filtro VEÍCULO
            if (
                !string.IsNullOrEmpty(veiculoIdStr) && Guid.TryParse(veiculoIdStr, out var veicGuid)
            )
            {
                query = query.Where(v => v.VeiculoId == veicGuid);
            }

            // 5) Filtro MOTORISTA
            if (
                !string.IsNullOrEmpty(motoristaIdStr)
                && Guid.TryParse(motoristaIdStr, out var motGuid)
            )
            {
                query = query.Where(v => v.MotoristaId == motGuid);
            }

            // 6) Filtro DATA (yyyy-MM-dd)
            if (!string.IsNullOrEmpty(dataFluxoStr))
            {
                if (DateTime.TryParse(dataFluxoStr, out var dataConv))
                {
                    query = query.Where(v => v.Data == dataConv);
                }
            }

            // 7) Contar total (sem filtros do DataTables search)
            int recordsTotal = _unitOfWork.ViewFluxoEconomildo.GetAll().Count();

            // 8) Filtro de busca global (searchValue)
            //    Exemplo: filtrar por MOB, NomeMotorista ou DescricaoVeiculo
            if (!string.IsNullOrEmpty(searchValue))
            {
                query = query.Where(v =>
                    v.MOB.Contains(searchValue)
                    || v.NomeMotorista.Contains(searchValue)
                    || v.DescricaoVeiculo.Contains(searchValue)
                );
            }

            // 9) Contar quantos registros após filtros
            int recordsFiltered = query.Count();

            // 10) Ordenar. Exemplo simples: order by Data desc
            //     Ou, se quiser mapear colunas do DataTables, pegue Request.Form["order[0][column]"]
            query = query.OrderByDescending(v => v.Data);

            // 11) Paginar
            var pageData = query.Skip(skip).Take(pageSize).ToList();

            // 12) Montar data final
            var data = pageData
                .Select(x => new
                {
                    x.ViagemEconomildoId,
                    x.MotoristaId,
                    x.VeiculoId,
                    x.NomeMotorista,
                    x.DescricaoVeiculo,
                    x.MOB,
                    DataFluxo = x.Data.HasValue ? x.Data.Value.ToString("dd/MM/yyyy") : "",
                    x.HoraInicio,
                    x.HoraFim,
                    x.QtdPassageiros,
                })
                .ToList();

            // 13) Montar objeto no formato DataTables
            var result = new
            {
                draw = draw,
                recordsTotal = recordsTotal,
                recordsFiltered = recordsFiltered,
                data = data,
            };
            return Json(result);
        }

        //[HttpPost]
        //[Route("DocumentEditorService")]
        //public IActionResult DocumentEditorService([FromBody] Dictionary<string, object> data)
        //{
        //    var controller = new Syncfusion.EJ2.DocumentEditor.DocumentEditorController();
        //    return controller.Post(data, null);
        //}

        [HttpGet("ObterDocumento")]
        public IActionResult ObterDocumento(Guid viagemId)
        {
            var viagem = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ViagemId == viagemId);
            if (viagem?.DescricaoViagemWord == null)
                return NotFound();

            var sfdtJson = System.Text.Encoding.UTF8.GetString(viagem.DescricaoViagemWord);
            return Ok(new { sfdt = sfdtJson });
        }

        // ------------------------------------------------------------------------
        // FIM DO MÉTODO SERVER-SIDE
        // ------------------------------------------------------------------------
    }

    // (Mantém as classes e atributos no final)
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
                KeyLengthLimit = valueCountLimit,
                ValueCountLimit = valueCountLimit,
                ValueLengthLimit = valueCountLimit,
            };
        }

        public int Order { get; set; }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var contextFeatures = context.HttpContext.Features;
            var formFeature = contextFeatures.Get<IFormFeature>();

            if (formFeature == null || formFeature.Form == null)
            {
                contextFeatures.Set<IFormFeature>(
                    new FormFeature(context.HttpContext.Request, _formOptions)
                );
            }
        }
    }
}
