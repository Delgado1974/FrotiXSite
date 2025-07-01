using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Cache;
using FrotiX.Helpers;
using FrotiX.Models;
using FrotiX.Models.DTO;
using FrotiX.Models.Views;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.CodeAnalysis.VisualBasic.Syntax;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NPOI.SS.Formula.Functions;
using Syncfusion.Blazor.Data;
using Syncfusion.EJ2.Base;
using Syncfusion.EJ2.DropDowns;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Telerik.Windows.Documents.Model.Drawing.Charts;
using static Stimulsoft.Report.Func;


namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AgendaController : Controller
    {
        private readonly ILogger<AbastecimentoController> _logger;
        private IWebHostEnvironment _hostingEnvironment;
        private readonly IUnitOfWork _unitOfWork;

        public AgendaController(
            ILogger<AbastecimentoController> logger,
            IWebHostEnvironment hostingEnvironment,
            IUnitOfWork unitOfWork
        )
        {
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _unitOfWork = unitOfWork;
        }

        [BindProperty]
        public Models.Abastecimento AbastecimentoObj { get; set; }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult Get()
        {
            return View();
        }

        [Route("RecuperaViagem")]
        [HttpGet]
        public ActionResult RecuperaViagem(Guid Id)
        {
            var viagemObj = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ViagemId == Id);

            return Json(new { data = viagemObj });
        }

        //[Route("CarregaViagens")]
        //[HttpGet]
        //public ActionResult CarregaViagens(DateTime start, DateTime end)
        //{
        //    List<Agenda> AgendaList = new List<Agenda>();

        //    // Normalize the start date to include all events from the beginning of the day
        //    start = start.Date; // This sets the time part to midnight (00:00:00)

        //    // Adjust the end date to make it inclusive (remove one day so that the full end date is covered)
        //    end = end.AddDays(-1).Date.AddDays(1).AddTicks(-1);

        //    // Filtra as viagens entre o período solicitado
        //    var viagemObj = _unitOfWork
        //        .ViewViagensAgenda.GetAllReduced(selector: v => new
        //        {
        //            v.DataInicial,
        //            v.HoraInicio,
        //            v.ViagemId,
        //            v.Finalidade,
        //            v.EventoId,
        //            v.Descricao,
        //            v.Status,
        //            v.StatusAgendamento,
        //            v.FoiAgendamento,
        //            v.VeiculoId,
        //            v.MotoristaId,
        //        })
        //        .Where(v => v.DataInicial >= start && v.DataInicial <= end);

        //    var eventosCache = new Dictionary<Guid, string>();
        //    var motoristasCache = new Dictionary<Guid, string>();
        //    var veiculosCache = new Dictionary<Guid, string>();

        //    foreach (var viagem in viagemObj)
        //    {
        //        DateTime dataInicio = Convert.ToDateTime(viagem.DataInicial);
        //        DateTime horaInicio = Convert.ToDateTime(viagem.HoraInicio);
        //        DateTime datahora = dataInicio.Date.Add(horaInicio.TimeOfDay);

        //        Agenda Viagem = new Agenda();
        //        Viagem.ViagemId = (Guid)viagem.ViagemId;

        //        if (viagem.Finalidade == "Evento" && viagem.EventoId is not null)
        //        {
        //            if (!eventosCache.ContainsKey(viagem.EventoId.Value))
        //            {
        //                var evento = _unitOfWork.Evento.GetFirstOrDefault(e =>
        //                    e.EventoId == viagem.EventoId
        //                );
        //                eventosCache[viagem.EventoId.Value] = evento.Nome;
        //            }

        //            Viagem.Titulo = viagem.Finalidade + " : " + eventosCache[viagem.EventoId.Value];
        //            Viagem.Finalidade = "Evento";
        //        }
        //        else
        //        {
        //            Viagem.Titulo = viagem.Finalidade;
        //        }

        //        //Tira o HTML e Coloca Motorista e Placa
        //        //======================================
        //        if (
        //            viagem.MotoristaId.HasValue
        //            && !motoristasCache.ContainsKey(viagem.MotoristaId.Value)
        //        )
        //        {
        //            var motorista = _unitOfWork.Motorista.GetFirstOrDefault(m =>
        //                m.MotoristaId == viagem.MotoristaId
        //            );
        //            motoristasCache[viagem.MotoristaId.Value] = motorista?.Nome;
        //        }

        //        string NomeMotorista;
        //        if (
        //            !viagem.MotoristaId.HasValue
        //            || motoristasCache[viagem.MotoristaId.Value] == null
        //        )
        //        {
        //            NomeMotorista = "(Motorista Não Identificado)";
        //        }
        //        else
        //        {
        //            NomeMotorista = motoristasCache[viagem.MotoristaId.Value];
        //        }

        //        if (viagem.VeiculoId.HasValue && !veiculosCache.ContainsKey(viagem.VeiculoId.Value))
        //        {
        //            var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v =>
        //                v.VeiculoId == viagem.VeiculoId
        //            );
        //            veiculosCache[viagem.VeiculoId.Value] = veiculo?.Placa;
        //        }

        //        string Placa;
        //        if (!viagem.VeiculoId.HasValue || veiculosCache[viagem.VeiculoId.Value] == null)
        //        {
        //            Placa = "(Sem Veículo)";
        //        }
        //        else
        //        {
        //            Placa = veiculosCache[viagem.VeiculoId.Value];
        //        }

        //        string descricao = viagem.Descricao;
        //        if (viagem.Descricao != null)
        //        {
        //            descricao = Servicos.ConvertHtml(descricao);
        //            descricao = NomeMotorista + " - (" + Placa + ") - " + descricao;
        //        }
        //        else
        //        {
        //            descricao = NomeMotorista + " - (" + Placa + ")";
        //        }

        //        if (viagem.Finalidade == "Evento" && viagem.EventoId is not null)
        //        {
        //            var eventoNome = eventosCache[viagem.EventoId.Value];

        //            if (viagem.Status == "Cancelada")
        //            {
        //                Viagem.Descricao = "Evento CANCELADO: " + eventoNome + " / " + descricao;
        //            }
        //            else if (true)
        //            {
        //                Viagem.Descricao = "Evento: " + eventoNome + " / " + descricao;
        //            }
        //        }
        //        else
        //        {
        //            Viagem.Descricao = descricao;
        //        }

        //        Viagem.DataInicial = datahora;
        //        //Viagem.HoraInicial = horaInicio;
        //        //Se botar "horainicio" ele pega o dia que está no campo hora, que foi o dia de cadastro da viagem, e bagunça a agenda
        //        Viagem.HoraInicial = datahora;

        //        if (viagem.StatusAgendamento == true && viagem.Status != "Cancelada")
        //        {
        //            Viagem.CorEvento = "#29B3FF";
        //            Viagem.CorTexto = "white";
        //            if (viagem.Finalidade == "Evento")
        //            {
        //                Viagem.CorEvento = "#E99B63";
        //                Viagem.CorTexto = "white";
        //            }
        //        }
        //        else if (viagem.Status == "Cancelada")
        //        {
        //            Viagem.CorEvento = "#E34234";
        //            Viagem.CorTexto = "white";
        //        }
        //        else if (viagem.Status == "Aberta" && viagem.StatusAgendamento == false)
        //        {
        //            Viagem.CorEvento = "#FFD774";
        //            Viagem.CorTexto = "#2B6670";
        //        }
        //        else if (viagem.Status == "Realizada" && viagem.FoiAgendamento == true)
        //        {
        //            Viagem.CorEvento = "#52688F";
        //            Viagem.CorTexto = "white";
        //        }
        //        else if (viagem.Status == "Realizada")
        //        {
        //            Viagem.CorEvento = "#75B390";
        //            Viagem.CorTexto = "white";
        //        }
        //        else if (viagem.Finalidade == "Evento")
        //        {
        //            Viagem.CorEvento = "#E99B63";
        //            Viagem.CorTexto = "white";
        //        }

        //        //if (viagem.HoraFim != null)
        //        //{
        //        //    Viagem.HoraFinal = (DateTime)viagem.HoraFim;
        //        //}

        //        AgendaList.Add(Viagem);
        //    }

        //    return Json(new { data = AgendaList });
        //}

        [Route("CarregaViagens")]
        [HttpGet]
        public ActionResult CarregaViagens(DateTime start, DateTime end)
        {
        //List<Agenda> AgendaList = new List<Agenda>();

        //// Normalize the start date to include all events from the beginning of the day
        //start = start.Date; // This sets the time part to midnight (00:00:00)

        //// Adjust the end date to make it inclusive (remove one day so that the full end date is covered)
        //end = end.AddDays(-1).Date.AddDays(1).AddTicks(-1);

        //// Consulta eficiente diretamente na view com todos os campos prontos
        //var viagens = _unitOfWork
        //    .ViewViagensAgenda.GetAll()
        //    .Where(v => v.DataInicial >= start && v.DataInicial <= end)
        //    .Select(v => new
        //        {
        //        id = v.ViagemId,
        //        title = v.Titulo,
        //        start = v.Start,

        //        //start = v.DataInicial.HasValue && v.HoraInicio.HasValue
        //        //    ? v.DataInicial.Value.ToString("yyyy-MM-dd")
        //        //        + "T"
        //        //        + v.HoraInicio.Value.ToString(@"hh\:mm\:ss")
        //        //    : null, // Ensure null safety

        //        end = v.HoraFim.HasValue ? v.HoraFim.Value.ToString(@"hh\:mm\:ss") : null, // Ensure null safety
        //        backgroundColor = v.CorEvento,
        //        textColor = v.CorTexto,
        //        descricao = v.DescricaoEvento ?? v.DescricaoMontada,
        //        })
        //    .ToList();

        //return Json(new { data = viagens });



        Expression<Func<ViewViagensAgenda, bool>> filtro = v =>
            v.DataInicial >= start && v.DataInicial < end;

        //Expressão lambda para selecionar só os campos necessários
        Expression<Func<ViewViagensAgenda, ViagemCalendarDTO>> seletor = v => new ViagemCalendarDTO
        {
            id = v.ViagemId,
            title = v.Titulo,
            dataInicial = v.DataInicial.Value,  // se no banco nunca é nulo, pode usar .Value
            horaInicio = v.HoraInicio.Value,
            dataFinal = v.DataFinal,
            horaFim = v.HoraFim,
            backgroundColor = v.CorEvento,
            textColor = v.CorTexto,
            descricao = v.DescricaoEvento ?? v.DescricaoMontada,
        };


        var viagensBrutas = _unitOfWork
            .ViewViagensAgenda
            .GetAllReducedIQueryable(seletor, filtro)
            .ToList();

        var viagens = viagensBrutas.Select(x =>
        {
            var inicio = x.dataInicial.HasValue
                ? x.dataInicial.Value.AddDays(-1).Date
                .AddHours(x.horaInicio?.Hour ?? 0)
                .AddMinutes(x.horaInicio?.Minute ?? 0)
                .AddSeconds(x.horaInicio?.Second ?? 0)
                : DateTime.MinValue; // Default value if dataInicial is null

            var fim = inicio.AddHours(1);

            return new
                {
                id = x.id,
                title = x.title,
                start = inicio.ToString("yyyy-MM-ddTHH:mm:ss"),
                end = fim.ToString("yyyy-MM-ddTHH:mm:ss"),
                backgroundColor = x.backgroundColor,
                textColor = x.textColor,
                descricao = x.descricao
                };
        }).ToList();


        foreach (var v in viagens)
            {
                 Console.WriteLine($"start={v.start}"); // debug: veja o formato!
            }


        //var viagens = new List<object>
        //{
        //    new {
        //        id = 1,
        //        title = "Teste Manual",
        //        start = "2025-07-01T07:00:00",
        //        end = "2025-07-01T08:00:00",
        //        backgroundColor = "#FF0000",
        //        textColor = "white",
        //        descricao = "Evento teste manual"
        //    }
        //};

        return Json(new { data = viagens });


            }

        //Recupera o nome do Usuário de Criação/Finalização
        //=================================================
        [Route("RecuperaUsuario")]
        public IActionResult RecuperaUsuario(string Id)
        {
            var objUsuario = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == Id);

            if (objUsuario == null)
            {
                return Json(new { data = "" });
            }
            else
            {
                return Json(new { data = objUsuario.NomeCompleto });
            }
        }

        // Cria ou Edita o Agendamento
        // ===========================
        [Route("Agendamento")]
        [HttpPost]
        public IActionResult Agendamento(AgendamentoViagem viagem, Viagem v)
        {
            try
            {
                // Pega o usuário corrente
                ClaimsPrincipal currentUser = this.User;
                if (currentUser == null || currentUser.FindFirst(ClaimTypes.NameIdentifier) == null)
                {
                    return Unauthorized();
                }
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;

                if (viagem.Status == "Realizada")
                {
                    viagem.UsuarioIdFinalizacao = currentUserID;
                    viagem.DataFinalizacao = DateTime.Now;

                    if (viagem.CriarViagemFechada == true)
                    {
                        viagem.UsuarioIdCriacao = currentUserID;
                        viagem.DataCriacao = DateTime.Now;
                    }
                }
                else if (viagem.Status == "Aberta")
                {
                    viagem.UsuarioIdCriacao = currentUserID;
                    viagem.DataCriacao = DateTime.Now;
                }

                // Verifica se a viagem é nova ou uma edição
                bool isNew = viagem.ViagemId == Guid.Empty;

                if (isNew == true && viagem.Recorrente == "S")
                {
                    if (viagem.DatasSelecionadas == null)
                    {
                        viagem.DatasSelecionadas = new List<DateTime>
                        {
                            viagem.DataInicial ?? DateTime.Now,
                        };
                    }

                    if (viagem.DatasSelecionadas.Count == 0)
                    {
                        viagem.DatasSelecionadas = new List<DateTime>
                        {
                            viagem.DataInicial ?? DateTime.Now,
                        };
                    }

                    Viagem novaViagem = new Viagem();

                    var DatasSelecionadasAdicao = viagem.DatasSelecionadas;
                    viagem.DatasSelecionadas = null;

                    // Configurações iniciais do agendamento
                    if (viagem.StatusAgendamento == null)
                    {
                        viagem.StatusAgendamento = true;
                        viagem.FoiAgendamento = true;
                    }

                    if (viagem.StatusAgendamento == true)
                    {
                        viagem.FoiAgendamento = true;
                    }

                    // Grava o primeiro registro fora do loop e armazena o ViagemId
                    var primeiraDataSelecionada = DatasSelecionadasAdicao.FirstOrDefault();
                    if (primeiraDataSelecionada != null)
                    {
                        // Parse DataInicial e HoraInicio corretamente
                        var DataInicial = primeiraDataSelecionada.ToString("dd/MM/yyyy");
                        var HoraInicio = viagem.HoraInicio?.ToString("HH:mm");

                        DateTime DataInicialCompleta;
                        DateTime.TryParseExact(
                            (DataInicial + " " + HoraInicio),
                            new string[] { "dd/MM/yyyy HH:mm" },
                            System.Globalization.CultureInfo.InvariantCulture,
                            System.Globalization.DateTimeStyles.None,
                            out DataInicialCompleta
                        );

                        AtualizarDadosAgendamento(novaViagem, viagem);
                        novaViagem.DataInicial = primeiraDataSelecionada;
                        novaViagem.HoraInicio = new DateTime(
                            DataInicialCompleta.Year,
                            DataInicialCompleta.Month,
                            DataInicialCompleta.Day,
                            DataInicialCompleta.Hour,
                            DataInicialCompleta.Minute,
                            DataInicialCompleta.Second
                        );

                        _unitOfWork.Viagem.Add(novaViagem);
                        _unitOfWork.Save();

                        // Armazena o ViagemId para reutilizar nas recorrências
                        var viagemIdRecorrente = novaViagem.ViagemId;

                        // Loop para as demais datas selecionadas
                        foreach (var dataSelecionada in DatasSelecionadasAdicao.Skip(1))
                        {
                            Viagem novaViagemRecorrente = new Viagem();

                            // Parse DataInicial e HoraInicio corretamente
                            DataInicial = dataSelecionada.ToString("dd/MM/yyyy");
                            DateTime.TryParseExact(
                                (DataInicial + " " + HoraInicio),
                                new string[] { "dd/MM/yyyy HH:mm" },
                                System.Globalization.CultureInfo.InvariantCulture,
                                System.Globalization.DateTimeStyles.None,
                                out DataInicialCompleta
                            );

                            AtualizarDadosAgendamento(novaViagemRecorrente, viagem);
                            novaViagemRecorrente.DataInicial = dataSelecionada;
                            novaViagemRecorrente.HoraInicio = new DateTime(
                                DataInicialCompleta.Year,
                                DataInicialCompleta.Month,
                                DataInicialCompleta.Day,
                                DataInicialCompleta.Hour,
                                DataInicialCompleta.Minute,
                                DataInicialCompleta.Second
                            );
                            novaViagemRecorrente.RecorrenciaViagemId = viagemIdRecorrente;

                            if (viagem.Status == "Realizada")
                            {
                                novaViagemRecorrente.UsuarioIdFinalizacao = currentUserID;
                                novaViagemRecorrente.DataFinalizacao = DateTime.Now;
                            }
                            else if (viagem.Status == "Aberta" || viagem.Status == "Agendada")
                            {
                                novaViagemRecorrente.UsuarioIdCriacao = currentUserID;
                                novaViagemRecorrente.DataCriacao = DateTime.Now;
                            }

                            _unitOfWork.Viagem.Add(novaViagemRecorrente);
                            _unitOfWork.Save();
                        }

                        // Lógica para gravação dos períodos 'D', 'S', 'Q', 'M'
                        if (
                            viagem.Intervalo == "D"
                            || viagem.Intervalo == "S"
                            || viagem.Intervalo == "Q"
                            || viagem.Intervalo == "M"
                        )
                        {
                            DateTime proximaData = primeiraDataSelecionada;
                            int incremento = 0;

                            switch (viagem.Intervalo)
                            {
                                case "D":
                                    incremento = 1;
                                    break;
                                case "S":
                                    incremento = 7;
                                    break;
                                case "Q":
                                    incremento = 15;
                                    break;
                                case "M":
                                    incremento = 30;
                                    break;
                            }

                            for (int i = 1; i < DatasSelecionadasAdicao.Count(); i++)
                            {
                                proximaData = proximaData.AddDays(incremento);

                                Viagem novaViagemPeriodo = new Viagem();
                                AtualizarDadosAgendamento(novaViagemPeriodo, viagem);
                                novaViagemPeriodo.DataInicial = proximaData;
                                novaViagemPeriodo.HoraInicio = new DateTime(
                                    proximaData.Year,
                                    proximaData.Month,
                                    proximaData.Day,
                                    DataInicialCompleta.Hour,
                                    DataInicialCompleta.Minute,
                                    DataInicialCompleta.Second
                                );
                                novaViagemPeriodo.RecorrenciaViagemId = viagemIdRecorrente;

                                if (viagem.Status == "Realizada")
                                {
                                    novaViagemPeriodo.UsuarioIdFinalizacao = currentUserID;
                                    novaViagemPeriodo.DataFinalizacao = DateTime.Now;
                                }
                                else if (viagem.Status == "Aberta" || viagem.Status == "Agendada")
                                {
                                    novaViagemPeriodo.UsuarioIdCriacao = currentUserID;
                                    novaViagemPeriodo.DataCriacao = DateTime.Now;
                                }

                                _unitOfWork.Viagem.Add(novaViagemPeriodo);
                                _unitOfWork.Save();
                            }
                        }
                    }

                    novaViagem.OperacaoBemSucedida = true;
                    return Json(new { novaViagem, success = true });
                }

                // Se for edição, trata a lógica de edição
                if (isNew == false)
                {
                    var agendamentoAtual = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                        v.ViagemId == viagem.ViagemId
                    );
                    if (agendamentoAtual == null)
                    {
                        return Json(new { data = false, message = "Viagem not found" });
                    }

                    var DataInicial = viagem.DataInicial.Value.ToString("dd/MM/yyyy");
                    var HoraInicio = viagem.HoraInicio?.ToString("HH:mm");

                    DateTime DataInicialCompleta;

                    //viagem.HoraInicio = DateTime.ParseExact("24/04/2025 12:00:00", "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture);
                    //DateTime.TryParseExact((DataInicial + " " + HoraInicio), new string[] { "dd/MM/yyyy HH:mm" }, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out DataInicialCompleta);

                    //viagem.HoraInicio = new DateTime(DataInicialCompleta.Year, DataInicialCompleta.Month, DataInicialCompleta.Day, DataInicialCompleta.Hour, DataInicialCompleta.Minute, DataInicialCompleta.Second);

                    // Atualiza o agendamento atual
                    agendamentoAtual.AtualizarDados(viagem);
                    _unitOfWork.Viagem.Update(agendamentoAtual);
                    _unitOfWork.Save();

                    //// Se for edição de recorrentes
                    //bool editarTodosRecorrentes = (bool)viagem.editarTodosRecorrentes;
                    //var editarAPartirData = viagem.EditarAPartirData;
                    ////DateTime? dataEspecifica = viagem.DataEspecifica?.FirstOrDefault();

                    //IEnumerable<Viagem> agendamentosRecorrentes = new List<Viagem>();
                    //if (editarTodosRecorrentes && viagem.Recorrente != null)
                    //{
                    //    agendamentosRecorrentes = _unitOfWork.Viagem.GetAll(v => v.RecorrenciaViagemId == viagem.RecorrenciaViagemId && v.ViagemId != viagem.ViagemId);
                    //}
                    //else if (editarTodosRecorrentes == false && viagem.Recorrente != null)
                    //{
                    //    agendamentosRecorrentes = _unitOfWork.Viagem.GetAll(v => v.RecorrenciaViagemId == viagem.RecorrenciaViagemId && v.DataInicial >= viagem.EditarAPartirData.Value && v.ViagemId != viagem.ViagemId);
                    //}
                    //else
                    //{
                    //    agendamentosRecorrentes = _unitOfWork.Viagem.GetAll(v => v.RecorrenciaViagemId == viagem.RecorrenciaViagemId && v.DataInicial >= viagem.EditarAPartirData.Value && v.ViagemId != viagem.ViagemId);
                    //}

                    //foreach (var agendamento in agendamentosRecorrentes)
                    //{
                    //    AtualizarDadosAgendamentoSemAlterarDataHora(agendamento, viagem);
                    //    _unitOfWork.Viagem.Update(agendamento);
                    //}
                    //_unitOfWork.Save(); // Salva os agendamentos recorrentes editados
                    return Json(
                        new
                        {
                            data = true,
                            message = "Viagem Atualizada com Sucesso",
                            viagemId = viagem.ViagemId,
                            objViagem = agendamentoAtual,
                            success = true,
                        }
                    );
                }

                if ((viagem.ViagemId == Guid.Empty))
                {
                    // Se for um novo agendamento
                    Viagem objViagem = new Viagem();
                    AtualizarDadosAgendamento(objViagem, viagem);
                    objViagem.UsuarioIdAgendamento = currentUserID;
                    objViagem.DataAgendamento = DateTime.Now;

                    _unitOfWork.Viagem.Add(objViagem);
                    _unitOfWork.Save(); // Salva o novo agendamento
                    objViagem.OperacaoBemSucedida = true;
                    return Json(
                        new
                        {
                            success = true,
                            message = "Agendamento inserido com sucesso",
                            viagemId = objViagem.ViagemId,
                            objViagem,
                        }
                    );
                }

                return Json(
                    new
                    {
                        success = true,
                        message = "Operação realizada com sucesso",
                        viagemId = viagem.ViagemId,
                    }
                );
            }
            catch (Exception ex)
            {
                return BadRequest(new { sucess = false, mensagem = ex.Message });
            }

            return BadRequest(new { success = false, mensagem = "Falha em Adicionar Viagem" });
        }

        private void AtualizarDadosAgendamento(Viagem objViagem, AgendamentoViagem viagem)
        {
            objViagem.DataInicial = viagem.DataInicial;
            objViagem.HoraInicio = viagem.HoraInicio;
            objViagem.Finalidade = viagem.Finalidade;
            objViagem.Origem = viagem.Origem;
            objViagem.Destino = viagem.Destino;
            objViagem.MotoristaId = viagem.MotoristaId;
            objViagem.VeiculoId = viagem.VeiculoId;
            objViagem.RequisitanteId = viagem.RequisitanteId;
            objViagem.RamalRequisitante = viagem.RamalRequisitante;
            objViagem.SetorSolicitanteId = viagem.SetorSolicitanteId;
            objViagem.Descricao = viagem.Descricao;
            objViagem.StatusAgendamento = viagem.StatusAgendamento;
            objViagem.FoiAgendamento = viagem.FoiAgendamento;
            objViagem.Status = viagem.Status;
            objViagem.DataFinal = viagem.DataFinal;
            objViagem.HoraFim = viagem.HoraFim;
            objViagem.NoFichaVistoria = viagem.NoFichaVistoria;
            objViagem.EventoId = viagem.EventoId;
            objViagem.KmAtual = viagem.KmAtual ?? 0;
            objViagem.KmInicial = viagem.KmInicial ?? 0;
            objViagem.KmFinal = viagem.KmFinal ?? 0;
            objViagem.CombustivelInicial = viagem.CombustivelInicial;
            objViagem.CombustivelFinal = viagem.CombustivelFinal;
            objViagem.UsuarioIdAgendamento = viagem.UsuarioIdAgendamento;
            objViagem.DataAgendamento = viagem.DataAgendamento;
            objViagem.UsuarioIdCriacao = viagem.UsuarioIdCriacao;
            objViagem.DataCriacao = viagem.DataCriacao;
            objViagem.UsuarioIdFinalizacao = viagem.UsuarioIdFinalizacao;
            objViagem.DataFinalizacao = viagem.DataFinalizacao;
            objViagem.Recorrente = viagem.Recorrente;
            objViagem.RecorrenciaViagemId = viagem.RecorrenciaViagemId;
            objViagem.Intervalo = viagem.Intervalo;
            objViagem.DataFinalRecorrencia = viagem.DataFinalRecorrencia;
            objViagem.Monday = viagem.Monday;
            objViagem.Tuesday = viagem.Tuesday;
            objViagem.Wednesday = viagem.Wednesday;
            objViagem.Thursday = viagem.Thursday;
            objViagem.Friday = viagem.Friday;
            objViagem.Saturday = viagem.Saturday;
            objViagem.Sunday = viagem.Sunday;
            objViagem.DiaMesRecorrencia = viagem.DiaMesRecorrencia;

            string descricao = objViagem.Descricao;
            if (objViagem.Descricao != null)
                descricao = Servicos.ConvertHtml(descricao);
            objViagem.DescricaoSemFormato = descricao;

        }

        [Route("ApagaAgendamento")]
        [HttpPost]
        public IActionResult ApagaAgendamento(AgendamentoViagem viagem)
        {
            //Guid ViagemId = Guid.Parse(Id);
            var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                v.ViagemId == viagem.ViagemId
            );
            _unitOfWork.Viagem.Remove(objFromDb);
            _unitOfWork.Save();
            return Json(new { success = true, message = "Agendamento apagado com sucesso" });
        }

        [Route("CancelaAgendamento")]
        [HttpPost]
        public IActionResult CancelaAgendamento(AgendamentoViagem viagem)
        {
            //Guid ViagemId = Guid.Parse(Id);
            var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                v.ViagemId == viagem.ViagemId
            );

            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            objFromDb.UsuarioIdCancelamento = currentUserID;
            objFromDb.DataCancelamento = DateTime.Now;

            objFromDb.Status = "Cancelada";
            objFromDb.Descricao = viagem.Descricao;
            _unitOfWork.Viagem.Update(objFromDb);
            _unitOfWork.Save();
            return Json(new { success = true, message = "Agendamento cancelado com sucesso" });
        }

        [Route("VerificarAgendamento")]
        [HttpGet("VerificarAgendamento")]
        public IActionResult VerificarAgendamento(
            string data,
            Guid? viagemIdRecorrente = null,
            string horaInicio = null
        )
        {
            try
            {
                if (string.IsNullOrEmpty(data))
                {
                    return BadRequest(
                        new
                        {
                            sucesso = false,
                            mensagem = "A data é obrigatória para verificar o agendamento.",
                        }
                    );
                }

                if (!DateTime.TryParse(data, out DateTime dataAgendamento))
                {
                    return BadRequest(new { sucesso = false, mensagem = "Data inválida." });
                }

                // Parse da hora se fornecida
                TimeSpan? horaAgendamento = null;
                if (
                    !string.IsNullOrEmpty(horaInicio)
                    && TimeSpan.TryParse(horaInicio, out TimeSpan parsedHora)
                )
                {
                    horaAgendamento = parsedHora;
                }

                // Obtém todas as viagens reduzidas
                var objViagens = _unitOfWork.Viagem.GetAllReduced(selector: v => new
                {
                    v.DataInicial,
                    v.HoraInicio,
                    v.RecorrenciaViagemId,
                    v.ViagemId,
                });

                // Verifica se já existe um agendamento para a data e hora informada
                var existeAgendamento = objViagens.Any(v =>
                    v.DataInicial.HasValue
                    && v.DataInicial.Value.Date == dataAgendamento.Date
                    && (
                        !horaAgendamento.HasValue || v.HoraInicio.Value.TimeOfDay == horaAgendamento
                    )
                    && (!viagemIdRecorrente.HasValue || v.RecorrenciaViagemId == viagemIdRecorrente)
                );

                return Ok(new { existe = existeAgendamento });
            }
            catch (Exception ex)
            {
                return BadRequest(new { sucesso = false, mensagem = ex.Message });
            }
        }

        [Route("GetDatasViagem")]
        [HttpGet("GetDatasViagem")]
        public IActionResult GetDatasViagem(
            Guid viagemId,
            Guid? recorrenciaViagemId = null,
            bool editarProximos = false
        )
        {
            try
            {
                // Obtém todas as viagens reduzidas
                var objViagens = _unitOfWork.Viagem.GetAllReduced(selector: v => new
                {
                    v.DataInicial,
                    v.RecorrenciaViagemId,
                    v.ViagemId,
                });

                List<DateTime> datasOrdenadas;

                if (recorrenciaViagemId == null || recorrenciaViagemId == Guid.Empty)
                {
                    // Primeiro registro ou não-recorrente: comparar com ViagemId
                    datasOrdenadas = objViagens
                        .Where(v => v.ViagemId == viagemId || v.RecorrenciaViagemId == viagemId)
                        .Select(v => v.DataInicial)
                        .Where(d => d.HasValue) // Filtra registros com DataInicial não nula
                        .Select(d => d.Value)
                        .OrderBy(d => d) // Ordena as datas de forma ascendente
                        .ToList(); // Converte para uma lista
                }
                else if (editarProximos)
                {
                    // Editar todos os próximos registros a partir do registro selecionado
                    var dataAtual = objViagens
                        .FirstOrDefault(v => v.ViagemId == viagemId)
                        ?.DataInicial;

                    if (dataAtual.HasValue)
                    {
                        datasOrdenadas = objViagens
                            .Where(v =>
                                v.RecorrenciaViagemId == recorrenciaViagemId
                                && v.DataInicial >= dataAtual
                            )
                            .Select(v => v.DataInicial)
                            .Where(d => d.HasValue) // Filtra registros com DataInicial não nula
                            .Select(d => d.Value)
                            .OrderBy(d => d) // Ordena as datas de forma ascendente
                            .ToList(); // Converte para uma lista
                    }
                    else
                    {
                        return BadRequest(
                            new { sucesso = false, mensagem = "Registro de viagem não encontrado." }
                        );
                    }
                }
                else
                {
                    // Registros subsequentes: comparar com RecorrenciaViagemId
                    datasOrdenadas = objViagens
                        .Where(v =>
                            v.RecorrenciaViagemId == recorrenciaViagemId
                            || v.ViagemId == viagemId
                            || v.ViagemId == recorrenciaViagemId
                        )
                        .Select(v => v.DataInicial)
                        .Where(d => d.HasValue) // Filtra registros com DataInicial não nula
                        .Select(d => d.Value)
                        .OrderBy(d => d) // Ordena as datas de forma ascendente
                        .ToList(); // Converte para uma lista
                }

                // Retorna as datas ordenadas em formato JSON
                return Ok(datasOrdenadas);
            }
            catch (Exception ex)
            {
                return BadRequest(new { sucesso = false, mensagem = ex.Message });
            }
        }

        [Route("ObterAgendamento")]
        [HttpGet("ObterAgendamento")]
        public async Task<IActionResult> ObterAgendamento(Guid viagemId)
        {
            try
            {
                var objViagem = _unitOfWork
                    .Viagem.GetAll()
                    .Where(v => v.RecorrenciaViagemId == v.ViagemId);
                return Json(objViagem);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new { mensagem = "Erro interno ao obter o agendamento", erro = ex.Message }
                );
            }
        }

        [Route("ObterAgendamentosRecorrentes")]
        [HttpGet]
        public async Task<IActionResult> ObterAgendamentosRecorrentes(
            string RecorrenciaViagemId,
            string DataInicialRecorrencia
        )
        {
            try
            {
                //// Converter DataInicialRecorrencia em DateTime
                //if (!DateTime.TryParse(DataInicialRecorrencia, out DateTime dataInicial))
                //{
                //    return BadRequest(new { mensagem = "Data inicial de recorrência inválida" });
                //}

                // Fazer a comparação com a data convertida
                //var objViagens = _unitOfWork.Viagem.GetAll()
                //    .Where(v => v.RecorrenciaViagemId == Guid.Parse(RecorrenciaViagemId) && v.DataInicial > DateTime.ParseExact(DataInicialRecorrencia, "yyyy-MM-dd", CultureInfo.InvariantCulture));

                var objViagens = _unitOfWork
                    .Viagem.GetAll()
                    .Where(v => v.RecorrenciaViagemId == Guid.Parse(RecorrenciaViagemId));

                if (objViagens == null || !objViagens.Any())
                {
                    return NotFound(new { mensagem = "Agendamentos recorrentes não encontrados" });
                }
                return Ok(objViagens);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        mensagem = "Erro interno ao obter os agendamentos recorrentes",
                        erro = ex.Message,
                    }
                );
            }
        }

        [Route("ObterAgendamentoExclusao")]
        [HttpGet("ObterAgendamentoExclusao")]
        public JsonResult ObterAgendamentoExclusao(Guid recorrenciaViagemId)
        {
            var objExclusao = _unitOfWork.Viagem.GetAll(v =>
                v.RecorrenciaViagemId == recorrenciaViagemId
            );
            if (objExclusao != null)
            {
                return Json(objExclusao);
            }
            return Json(new { sucesso = false, mensagem = "Registro de viagem não encontrado." });
        }

        [Route("ObterAgendamentoEdicao")]
        [HttpGet("ObterAgendamentoEdicao")]
        public JsonResult ObterAgendamentoEdicao(Guid viagemId)
        {
            var agendamentoEdicao = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                v.ViagemId == viagemId
            );
            if (agendamentoEdicao != null)
            {
                return Json(agendamentoEdicao);
            }
            return Json(new { sucesso = false, mensagem = "Registro de viagem não encontrado." });
        }

        [Route("ObterAgendamentoEdicaoInicial")]
        [HttpGet("ObterAgendamentoEdicaoInicial")]
        public JsonResult ObterAgendamentoEdicaoInicial(Guid viagemId)
        {
            var agendamentoEdicao = _unitOfWork.Viagem.GetAll(v => v.ViagemId == viagemId);
            if (agendamentoEdicao != null)
            {
                return Json(agendamentoEdicao);
            }
            return Json(new { sucesso = false, mensagem = "Registro de viagem não encontrado." });
        }
    }
}
