using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Cache;
using FrotiX.Helpers;
using FrotiX.Models;
using FrotiX.Models.Views;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using Syncfusion.Blazor.Data;
using Syncfusion.EJ2.Base;
using Syncfusion.EJ2.DropDowns;

namespace FrotiX.Pages.Viagens
{
    public class UpsertModel : PageModel
    {
        static string usuarioCorrenteId;
        static string usuarioCorrenteNome;
        static Guid veiculoAtual;
        static int kmAtual;

        static string usuarioIdCriacao;

        static string UsuarioIdCancelamento;

        static DateTime dataCancelamento;

        static DateTime dataAgendamento;

        static DateTime dataCriacao;

        static DateTime dataFinalizacao;

        static string lstRequisitante;

        public static byte[] FichaVistoria;

        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;

        private readonly INotyfService _notyf;

        private IHostingEnvironment hostingEnv;

        private readonly IWebHostEnvironment _hostingEnvironment;

        public static Guid viagemId;

        private readonly MotoristaFotoService _fotoService;

        private readonly Stopwatch _watch = new Stopwatch();

        private readonly MotoristaCache _motoristaCache;

        public UpsertModel(
            IUnitOfWork unitOfWork,
            ILogger<IndexModel> logger,
            INotyfService notyf,
            IHostingEnvironment env,
            IWebHostEnvironment hostingEnvironment,
            MotoristaFotoService fotoService,
            MotoristaCache motoristaCache
        )
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _notyf = notyf;
            hostingEnv = env;
            _hostingEnvironment = hostingEnvironment;
            _fotoService = fotoService;
            _motoristaCache = motoristaCache;
        }

        [BindProperty]
        public ViagemViewModel ViagemObj { get; set; }
        public IFormFile FotoUpload { get; set; }

        private void SetViewModel()
        {
            ViagemObj = new ViagemViewModel { Viagem = new Models.Viagem() };
        }

        public IActionResult OnGet(Guid? id)
        {
            _watch.Restart(); // Inicia a medição de tempo

            Console.WriteLine($">>> [START] OnGet: {DateTime.Now:HH:mm:ss.fff}");

            SetViewModel();

            if (id != null)
            {
                viagemId = (Guid)id;
            }

            ViewData["fieldsMotorista"] = new ComboBoxFieldSettings
            {
                Text = "Nome",
                Value = "MotoristaId",
            };
            ViewData["itemTemplate"] = @"<div><img class='fotoGrid' src='${Foto}' /> ${Nome}</div>";
            ViewData["valueTemplate"] =
                @"<div><img class='fotoGrid' src='${Foto}' /> ${Nome}</div>";

            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            usuarioCorrenteId = currentUserID;
            var usuarios = _unitOfWork.AspNetUsers.GetAspNetUsersListForDropDown();
            foreach (var usuario in usuarios)
            {
                if (usuario.Value == currentUserID)
                {
                    usuarioCorrenteNome = usuario.Text;
                }
            }

            if (id != null && id != Guid.Empty)
            {
                var sw1 = Stopwatch.StartNew();
                ViagemObj.Viagem = _unitOfWork.Viagem.GetFirstOrDefault(u => u.ViagemId == id);
                if (ViagemObj == null)
                {
                    return NotFound();
                }
                Console.WriteLine($">>> Carregamento Viagem(Id): {sw1.ElapsedMilliseconds}ms");

                if (ViagemObj.Viagem.DescricaoViagemWord != null)
                {
                    DescricaoViagemWordJson = Encoding.UTF8.GetString(
                        ViagemObj.Viagem.DescricaoViagemWord
                    );
                }

                if (ViagemObj.Viagem.UsuarioIdAgendamento != null)
                {
                    //usuarioIdAgendamento = ViagemObj.Viagem.UsuarioIdAgendamento;
                    dataAgendamento = (DateTime)ViagemObj.Viagem.DataAgendamento;

                    var dbUsuarioAgendamento = _unitOfWork.AspNetUsers.GetFirstOrDefault(u =>
                        u.Id == ViagemObj.Viagem.UsuarioIdAgendamento
                    );
                    ViagemObj.NomeUsuarioAgendamento = dbUsuarioAgendamento.NomeCompleto;
                }

                if (ViagemObj.Viagem.UsuarioIdCriacao != null)
                {
                    usuarioIdCriacao = ViagemObj.Viagem.UsuarioIdCriacao;
                    dataCriacao = (DateTime)ViagemObj.Viagem.DataCriacao;

                    var dbUsuarioCriacao = _unitOfWork.AspNetUsers.GetFirstOrDefault(u =>
                        u.Id == ViagemObj.Viagem.UsuarioIdCriacao
                    );
                    ViagemObj.NomeUsuarioCriacao = dbUsuarioCriacao.NomeCompleto;
                }

                if (ViagemObj.Viagem.UsuarioIdCancelamento != null)
                {
                    UsuarioIdCancelamento = ViagemObj.Viagem.UsuarioIdCancelamento;
                    dataCancelamento = (DateTime)ViagemObj.Viagem.DataCancelamento;

                    var dbUsuarioCriacao = _unitOfWork.AspNetUsers.GetFirstOrDefault(u =>
                        u.Id == ViagemObj.Viagem.UsuarioIdCancelamento
                    );
                    ViagemObj.NomeUsuarioCancelamento = dbUsuarioCriacao.NomeCompleto;
                }

                //kmAtual = (int)ViagemObj.Viagem.KmAtual;
                veiculoAtual = (Guid)ViagemObj.Viagem.VeiculoId;
            }
            else
            {
                usuarioIdCriacao = usuarioCorrenteId;
                dataCriacao = DateTime.Now;
            }

            if (ViagemObj.Viagem.DataFinalizacao != null)
            {
                if (ViagemObj.Viagem.UsuarioIdFinalizacao != null)
                {
                    var dbUsuarioFinalizacao = _unitOfWork.AspNetUsers.GetFirstOrDefault(u =>
                        u.Id == ViagemObj.Viagem.UsuarioIdFinalizacao
                    );
                    ViagemObj.NomeUsuarioFinalizacao = dbUsuarioFinalizacao.NomeCompleto;
                }

                var dataFinalizacao = ViagemObj.Viagem.DataFinalizacao;

                ViagemObj.DataFinalizacao = dataFinalizacao?.ToString("dd/MM/yy");
                ViagemObj.HoraFinalizacao = dataFinalizacao?.ToString("HH:mm");
            }

            var sw2 = Stopwatch.StartNew();
            PreencheListaSetores();
            Console.WriteLine($">>> PreencheDropDownsVeiculo: {sw2.ElapsedMilliseconds}ms");

            var sw3 = Stopwatch.StartNew();
            PreencheListaRequisitantes();
            Console.WriteLine($">>> Preenche ListaRequisitantes: {sw3.ElapsedMilliseconds}ms");

            var sw4 = Stopwatch.StartNew();
            PreencheListaMotoristas();
            Console.WriteLine(
                $">>> Preenche ListaMotoristas sem Redimensionamento: {sw4.ElapsedMilliseconds}ms"
            );

            //var sw5 = Stopwatch.StartNew();
            //PreencheListaMotoristasComRedimensionamento();
            //Console.WriteLine($">>> Preenche ListaMotoristas com Redimensionamento: {sw5.ElapsedMilliseconds}ms");

            var sw6 = Stopwatch.StartNew();
            PreencheListaVeiculos();
            Console.WriteLine($">>> Preenche ListaVeiculos: {sw6.ElapsedMilliseconds}ms");

            var sw7 = Stopwatch.StartNew();
            PreencheListaCombustivel();
            Console.WriteLine($">>> Preenche ListaCombustível: {sw7.ElapsedMilliseconds}ms");

            var sw8 = Stopwatch.StartNew();
            PreencheListaFinalidade();
            Console.WriteLine($">>> Preenche ListaFinalidade: {sw8.ElapsedMilliseconds}ms");

            var sw9 = Stopwatch.StartNew();
            PreencheListaEventos();
            Console.WriteLine($">>> Preenche ListaEventos: {sw9.ElapsedMilliseconds}ms");

            FichaVistoria = ViagemObj.Viagem.FichaVistoria;

            var sw10 = Stopwatch.StartNew();
            var listaOrigem = _unitOfWork
                .Viagem.GetAllReduced(selector: v => v.Origem)
                .Where(o => o != null)
                .Distinct()
                .OrderBy(o => o)
                .ToList();
            ViewData["ListaOrigem"] = listaOrigem;
            Console.WriteLine($">>> Preenche ListaOrigem: {sw10.ElapsedMilliseconds}ms");

            var sw11 = Stopwatch.StartNew();
            var listaDestino = _unitOfWork
                .Viagem.GetAllReduced(selector: v => v.Destino)
                .Where(d => d != null)
                .Distinct()
                .OrderBy(d => d)
                .ToList();
            ViewData["ListaDestino"] = listaDestino;
            Console.WriteLine($">>> Preenche ListaDestino: {sw11.ElapsedMilliseconds}ms");

            Console.WriteLine($">>> [END] OnGet TOTAL: {_watch.ElapsedMilliseconds}ms");

            return Page();
        }

        public IActionResult OnPostSubmit()
        {
            if (ViagemObj.Viagem.HoraFim == null)
            {
                ViagemObj.Viagem.UsuarioIdCriacao = usuarioCorrenteId;
                ViagemObj.Viagem.DataCriacao = DateTime.Now;
            }
            else
            {
                ViagemObj.Viagem.UsuarioIdCriacao = usuarioIdCriacao;
                ViagemObj.Viagem.DataCriacao = DateTime.Now;
                ViagemObj.Viagem.UsuarioIdFinalizacao = usuarioCorrenteId;
                ViagemObj.Viagem.DataFinalizacao = DateTime.Now;
            }

            if (!ModelState.IsValid)
            {
                foreach (var modelState in ModelState.Values)
                {
                    foreach (var modelError in modelState.Errors)
                    {
                        if (modelError.ErrorMessage != "The UsuarioIdAlteracao field is required.")
                        {
                            PreencheListaSetores();
                            PreencheListaRequisitantes();
                            PreencheListaMotoristas();
                            PreencheListaVeiculos();
                            PreencheListaCombustivel();
                            PreencheListaFinalidade();
                            PreencheListaEventos();
                            return Page();
                        }
                    }
                }
            }

            Guid viagemId = Guid.Empty;

            if (ViagemObj.Viagem.ViagemId != Guid.Empty)
                viagemId = ViagemObj.Viagem.ViagemId;

            if (
                (ViagemObj.Viagem.HoraFim != null && ViagemObj.Viagem.KmFinal == null)
                || (ViagemObj.Viagem.HoraFim == null && ViagemObj.Viagem.KmFinal != null)
            )
            {
                _notyf.Error(
                    "Para finalizar a viagem, tanto a Hora Final como a Quilometragem Final precisam estar preenchidas!",
                    3
                );
                PreencheListaSetores();
                PreencheListaRequisitantes();
                PreencheListaMotoristas();
                PreencheListaVeiculos();
                PreencheListaCombustivel();
                PreencheListaFinalidade();
                PreencheListaEventos();

                ViagemObj.Viagem.ViagemId = viagemId;
                return Page();
            }

            if (ViagemObj.Viagem.HoraFim == null)
                ViagemObj.Viagem.Status = "Aberta";
            else
            {
                ViagemObj.Viagem.Status = "Realizada";
                ViagemObj.Viagem.CustoCombustivel = Servicos.CalculaCustoCombustivel(
                    ViagemObj.Viagem,
                    _unitOfWork
                );

                int minutos = -1;
                ViagemObj.Viagem.CustoMotorista = Servicos.CalculaCustoMotorista(
                    ViagemObj.Viagem,
                    _unitOfWork,
                    ref minutos
                );
                ViagemObj.Viagem.Minutos = minutos;

                ViagemObj.Viagem.CustoVeiculo = Servicos.CalculaCustoVeiculo(
                    ViagemObj.Viagem,
                    _unitOfWork
                );
                ViagemObj.Viagem.CustoOperador = 0;
                ViagemObj.Viagem.CustoLavador = 0;
            }

            var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v =>
                v.VeiculoId == ViagemObj.Viagem.VeiculoId
            );

            if (ViagemObj.Viagem.KmFinal != null)
            {
                veiculo.Quilometragem = ViagemObj.Viagem.KmFinal;
                _unitOfWork.Veiculo.Update(veiculo);
                _unitOfWork.Save();
            }

            string descricao = ViagemObj.Viagem.Descricao;
            if (ViagemObj.Viagem.Descricao != null)
                descricao = ConvertHtml(descricao);
            ViagemObj.Viagem.DescricaoSemFormato = descricao;

            ViagemObj.Viagem.StatusAgendamento = false;
            ViagemObj.Viagem.KmAtual = veiculo.Quilometragem;

            if (FotoUpload != null)
            {
                using var ms = new MemoryStream();
                FotoUpload.CopyTo(ms);
                ViagemObj.Viagem.FichaVistoria = ms.ToArray();
            }
            //else
            //{
            //    var wwwroot = _hostingEnvironment.WebRootPath;
            //    var ficha = wwwroot + "/Images/FichaAmarelaNova.jpg";
            //    ViagemObj.Viagem.FichaVistoria = System.IO.File.ReadAllBytes(ficha);
            //}

            //if (!string.IsNullOrWhiteSpace(DescricaoViagemWordBase64))
            //{
            //    var descricaoBytes = Convert.FromBase64String(DescricaoViagemWordBase64);
            //    ViagemObj.Viagem.DescricaoViagemWord = descricaoBytes;

            //    try
            //    {
            //        ViagemObj.Viagem.DescricaoViagemImagem = SfdtHelper.SfdtParaImagemPrimeiraPagina(descricaoBytes);
            //    }
            //    catch
            //    {
            //        ViagemObj.Viagem.DescricaoViagemImagem = null;
            //    }
            //}

            _notyf.Success("Viagem adicionada com sucesso!", 3);
            _unitOfWork.Viagem.Add(ViagemObj.Viagem);
            _unitOfWork.Save();

            return RedirectToPage("./Index");
        }

        public IActionResult OnPostEdit(Guid Id)
        {
            ViagemObj.Viagem.ViagemId = Id;

            //Define Usuário Criação/Finalização
            //==================================
            if (ViagemObj.Viagem.HoraFim == null)
            {
                ViagemObj.Viagem.UsuarioIdCriacao = usuarioCorrenteId;
                ViagemObj.Viagem.DataCriacao = DateTime.Now;
            }
            else
            {
                if (ViagemObj.Viagem.UsuarioIdCriacao == null)
                {
                    ViagemObj.Viagem.UsuarioIdCriacao = usuarioCorrenteId;
                    ViagemObj.Viagem.DataCriacao = dataCriacao;
                }

                ViagemObj.Viagem.UsuarioIdFinalizacao = usuarioCorrenteId;
                ViagemObj.Viagem.DataFinalizacao = DateTime.Now;
            }

            Guid viagemId = Guid.Empty;

            if (ViagemObj.Viagem.ViagemId != Guid.Empty)
            {
                viagemId = ViagemObj.Viagem.ViagemId;
            }

            //Verifica se preeencheu Hora Final sem Km Final ou Vice Versa
            if (
                (ViagemObj.Viagem.HoraFim != null && ViagemObj.Viagem.KmFinal == null)
                || (ViagemObj.Viagem.HoraFim == null && ViagemObj.Viagem.KmFinal != null)
            )
            {
                _notyf.Error(
                    "Para finalizar a viagem, tanto a Hora Final como a Quilometragem Final precisam estar preenchidas!",
                    3
                );
                //SetViewModel();
                PreencheListaSetores();
                PreencheListaRequisitantes();
                PreencheListaMotoristas();
                PreencheListaVeiculos();
                PreencheListaCombustivel();
                PreencheListaFinalidade();
                PreencheListaEventos();

                ViagemObj.Viagem.ViagemId = viagemId;
                return Page();
            }

            //Define o Status da Viagem
            if (ViagemObj.Viagem.HoraFim == null)
            {
                ViagemObj.Viagem.Status = "Aberta";
            }
            else
            {
                ViagemObj.Viagem.Status = "Realizada";
                ViagemObj.Viagem.CustoCombustivel = Servicos.CalculaCustoCombustivel(
                    ViagemObj.Viagem,
                    _unitOfWork
                );

                int minutos = -1;
                ViagemObj.Viagem.CustoMotorista = Servicos.CalculaCustoMotorista(
                    ViagemObj.Viagem,
                    _unitOfWork,
                    ref minutos
                );
                ViagemObj.Viagem.Minutos = minutos;

                ViagemObj.Viagem.CustoVeiculo = Servicos.CalculaCustoVeiculo(
                    ViagemObj.Viagem,
                    _unitOfWork
                );
            }

            //Temporário até saber como calcular esse custo
            ViagemObj.Viagem.CustoOperador = 0;
            ViagemObj.Viagem.CustoLavador = 0;

            //Define a quilometragem atual do veículo
            var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v =>
                v.VeiculoId == ViagemObj.Viagem.VeiculoId
            );

            if (ViagemObj.Viagem.KmFinal != null)
            {
                veiculo.Quilometragem = ViagemObj.Viagem.KmFinal;
                _unitOfWork.Veiculo.Update(veiculo);
                _unitOfWork.Save();
            }

            //if (ViagemObj.Viagem.VeiculoId == veiculoAtual)
            //{
            //    ViagemObj.Viagem.KmAtual = kmAtual;
            //}
            //else
            //{
            //    ViagemObj.Viagem.KmAtual = veiculo.Quilometragem;
            //}

            //Tira o HTML
            string descricao = ViagemObj.Viagem.Descricao;
            if (ViagemObj.Viagem.Descricao != null)
            {
                descricao = ConvertHtml(descricao);
            }
            ViagemObj.Viagem.DescricaoSemFormato = descricao;

            if (FotoUpload != null)
            {
                var file = FotoUpload.FileName;

                using (var ms = new MemoryStream())
                {
                    FotoUpload.CopyTo(ms);
                    ViagemObj.Viagem.FichaVistoria = ms.ToArray();
                }
            }
            else if (FichaVistoria != null)
            {
                ViagemObj.Viagem.FichaVistoria = FichaVistoria;
            }

            if (!string.IsNullOrWhiteSpace(DescricaoViagemWordBase64))
                ViagemObj.Viagem.DescricaoViagemWord = Convert.FromBase64String(
                    DescricaoViagemWordBase64
                );

            ViagemObj.Viagem.StatusAgendamento = false;
            _notyf.Success("Viagem atualizada com sucesso!", 3);
            _unitOfWork.Viagem.Update(ViagemObj.Viagem);

            _unitOfWork.Save();

            return RedirectToPage("./Index");
        }

        // 👇 Este método responde ao JavaScript e salva a descrição
        public async Task<IActionResult> OnPostSalvarDescricaoAsync()
        {
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();

            var input = JsonSerializer.Deserialize<ViagemDescricaoInput>(body);

            if (input is null || input.ViagemId == Guid.Empty)
                return new JsonResult(new { message = "Dados inválidos." }) { StatusCode = 400 };

            var viagem = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ViagemId == input.ViagemId);
            if (viagem is null)
                return new JsonResult(new { message = "Viagem não encontrada." })
                {
                    StatusCode = 404,
                };

            viagem.DescricaoViagemWord = Encoding.UTF8.GetBytes(input.DescricaoWord ?? "");
            _unitOfWork.Save();

            return new JsonResult(new { message = "Descrição salva com sucesso!" });
        }

        public class ViagemDescricaoInput
        {
            public Guid ViagemId { get; set; }
            public string DescricaoWord { get; set; }
        }

        [BindProperty]
        public string DescricaoViagemWordBase64 { get; set; }

        public string DescricaoViagemWordJson { get; set; }

        //public async Task<IActionResult> OnPostAsync()
        //{
        //    if (!ModelState.IsValid)
        //        return Page();

        //    var viagem = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ViagemId == Viagem.ViagemId);
        //    if (viagem == null)
        //        return NotFound();

        //    if (!string.IsNullOrWhiteSpace(DescricaoViagemWordBase64))
        //        viagem.DescricaoViagemWord = Convert.FromBase64String(DescricaoViagemWordBase64);

        //    _unitOfWork.Viagem.Update(viagem);
        //    _unitOfWork.Save();
        //    return RedirectToPage("Index");
        //}

        public JsonResult OnGetMotoristasJson()
        {
            var lista = _motoristaCache.GetMotoristas();
            return new JsonResult(lista);
        }

        public IActionResult OnPostInsereFicha(Guid Id)
        {
            var viagemObj = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ViagemId == Id);

            if (FotoUpload != null)
            {
                var file = FotoUpload.FileName;

                using (var ms = new MemoryStream())
                {
                    FotoUpload.CopyTo(ms);
                    viagemObj.FichaVistoria = ms.ToArray();
                }
            }
            else if (FichaVistoria != null)
            {
                viagemObj.FichaVistoria = FichaVistoria;
            }

            _notyf.Success("Ficha de Vistoria Inserida com Sucesso!", 3);

            _unitOfWork.Viagem.Update(viagemObj);

            _unitOfWork.Save();

            return RedirectToPage("./Index");
        }

        //Pega a última ficha
        //===================
        public JsonResult OnGetVerificaFicha(string id)
        {
            var objFicha = _unitOfWork
                .Viagem.GetAllReduced(selector: f => new { f.NoFichaVistoria })
                .Max(n => n.NoFichaVistoria);

            return new JsonResult(new { data = objFicha.Value });
        }

        //Verifica se Ficha Já existe
        //===========================
        public JsonResult OnGetFichaExistente(string id)
        {
            int NoFichaVistoria = int.Parse(id);

            var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(n =>
                n.NoFichaVistoria == NoFichaVistoria
            );

            if (objViagem == null)
            {
                return new JsonResult(new { data = false });
            }

            return new JsonResult(new { data = true });
        }

        //Pega o Setor baseado no Requisitante
        //==============================================
        public JsonResult OnGetPegaSetor(string id)
        {
            if (Guid.TryParse(id, out var requisitanteid))
            {
                var requisitante = _unitOfWork.Requisitante.GetFirstOrDefault(e =>
                    e.RequisitanteId == requisitanteid
                );
                var setorrequisitante = _unitOfWork.SetorSolicitante.GetFirstOrDefault(e =>
                    e.SetorSolicitanteId == requisitante.SetorSolicitanteId
                );
                return new JsonResult(new { data = setorrequisitante.SetorSolicitanteId });
            }
            else
            {
                return new JsonResult(new { data = "" });
            }
        }

        //Pega o Ramal baseado no Requisitante
        //====================================
        public JsonResult OnGetPegaRamal(string id)
        {
            if (Guid.TryParse(id, out var requisitanteid))
            {
                var requisitante = _unitOfWork.Requisitante.GetFirstOrDefault(e =>
                    e.RequisitanteId == requisitanteid
                );
                return new JsonResult(new { data = requisitante.Ramal });
            }
            else
            {
                return new JsonResult(new { data = "" });
            }
        }

        //Verifica se Motorista encontra-se em viagem não terminada
        //=========================================================
        public JsonResult OnGetVerificaMotoristaViagem(string id)
        {
            Guid motoristaid = Guid.Parse(id);
            //var viagens = _unitOfWork.Viagem.GetFirstOrDefault(e => (e.MotoristaId == motoristaid && e.Status == "Aberta" && e.Finalidade != "Evento"));
            var viagens = _unitOfWork.Viagem.GetFirstOrDefault(e =>
                (
                    e.MotoristaId == motoristaid
                    && e.Status == "Aberta"
                    && e.StatusAgendamento == false
                )
            );
            if (viagens == null)
            {
                return new JsonResult(new { data = false });
            }
            else
            {
                return new JsonResult(new { data = true });
            }
        }

        //Verifica se Veículo encontra-se em viagem não terminada
        //=========================================================
        public JsonResult OnGetVerificaVeiculoViagem(string id)
        {
            Guid guidOutput;
            bool isValid = Guid.TryParse(id, out guidOutput);

            if (id != null && isValid)
            {
                Guid veiculoid = Guid.Parse(id);
                var viagens = _unitOfWork.Viagem.GetFirstOrDefault(e =>
                    (
                        e.VeiculoId == veiculoid
                        && e.Status == "Aberta"
                        && e.StatusAgendamento == false
                    )
                );
                if (viagens == null)
                {
                    return new JsonResult(new { data = false });
                }
                else
                {
                    return new JsonResult(new { data = true });
                }
            }
            return new JsonResult(new { data = false });
        }

        //Recupera Km Atual do Veículo
        //============================
        public JsonResult OnGetPegaKmAtualVeiculo(string id)
        {
            try
            {
                Guid guidOutput;
                bool isValid = Guid.TryParse(id, out guidOutput);

                if (id != null && isValid)
                {
                    Guid veiculoid = Guid.Parse(id);
                    var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v =>
                        (v.VeiculoId == veiculoid)
                    );
                    return new JsonResult(new { data = veiculo.Quilometragem });
                }

                return new JsonResult(new { data = 0 });
            }
            catch (Exception ex)
            {
                // This catch block will handle any other exceptions that derive from Exception
                return new JsonResult(new { data = 0 });
            }
        }

        //Preenche a Lista de Eventos via AJAX após inserção de novo registro
        //=========================================================================
        class EventoData
        {
            public Guid EventoId { get; set; }
            public string Nome { get; set; }
        }

        public JsonResult OnGetAJAXPreencheListaEventos()
        {
            //Preenche Treeview de Eventos
            //==================================

            var listaEventos = (
                from e in _unitOfWork.Evento.GetAll(orderBy: e => e.OrderBy(e => e.Nome))
                select new { e.Nome, e.EventoId }
            ).ToList();

            var eventoDataSource = new List<EventoData>();

            var eventosList = "";

            foreach (var evento in listaEventos)
            {
                eventoDataSource.Add(
                    new EventoData { EventoId = evento.EventoId, Nome = evento.Nome }
                );

                eventosList =
                    eventosList
                    + "{ EventoId: '"
                    + evento.EventoId
                    + "', Nome: '"
                    + evento.Nome
                    + "'},";
            }

            eventosList = "[" + eventosList.Remove(eventosList.Length - 1) + "]";

            ViewData["dataEvento"] = eventoDataSource;

            return new JsonResult(new { data = eventoDataSource });
        }

        //Preenche a Lista de Requisitantes via AJAX após inserção de novo registro
        //=========================================================================
        public JsonResult OnGetAJAXPreencheListaRequisitantes()
        {
            //Preenche Treeview de Requisitantes
            //==================================
            //var ListaRequisitantes = _unitOfWork.ViewRequisitantes.GetAll();

            var ListaRequisitantes = (
                from vr in _unitOfWork.ViewRequisitantes.GetAll(orderBy: r =>
                    r.OrderBy(r => r.Requisitante)
                )
                select new { vr.Requisitante, vr.RequisitanteId }
            ).ToList();

            List<RequisitanteData> RequisitanteDataSource = new List<RequisitanteData>();

            var requisitantesList = "";

            foreach (var requisitante in ListaRequisitantes)
            {
                RequisitanteDataSource.Add(
                    new RequisitanteData
                    {
                        RequisitanteId = (Guid)requisitante.RequisitanteId,
                        Requisitante = requisitante.Requisitante,
                    }
                );

                requisitantesList =
                    requisitantesList
                    + "{ RequisitanteId: '"
                    + (Guid)requisitante.RequisitanteId
                    + "', Requisitante: '"
                    + requisitante.Requisitante
                    + "'},";
            }

            requisitantesList = "[" + requisitantesList.Remove(requisitantesList.Length - 1) + "]";

            ViewData["dataRequisitante"] = RequisitanteDataSource;

            return new JsonResult(new { data = RequisitanteDataSource });
        }

        //Preenche a Lista de Setores via AJAX após inserção de novo registro
        //===================================================================
        public JsonResult OnGetAJAXPreencheListaSetores()
        {
            //    Preenche Treeview de Setores
            //================================
            var listaSetores = _unitOfWork.ViewSetores.GetAll();
            var treeDataSource = new List<TreeData>();

            //string setorid = "2fd11a87-69e6-4f36-04c7-08d97d2150db";

            //TreeDataSource.Add(new TreeData
            //{
            //    SetorSolicitanteId = Guid.Parse(setorid),
            //    Nome = "Seção Administrativa",
            //    //Sigla = setor.Sigla
            //});
            foreach (var setor in listaSetores)
            {
                var temFilho = listaSetores.Any(u => u.SetorPaiId == setor.SetorSolicitanteId);

                if (setor.SetorPaiId != Guid.Empty)
                {
                    if (temFilho)
                    {
                        if (setor.SetorPaiId != Guid.Empty)
                        {
                            treeDataSource.Add(
                                new TreeData
                                {
                                    SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                    SetorPaiId = setor.SetorPaiId,
                                    Nome = setor.Nome,
                                    HasChild = true,
                                    //Sigla = setor.Sigla
                                }
                            );
                        }
                        else
                        {
                            treeDataSource.Add(
                                new TreeData
                                {
                                    SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                    Nome = setor.Nome,
                                    HasChild = true,
                                    //Sigla = setor.Sigla
                                }
                            );
                        }
                    }
                    else
                    {
                        treeDataSource.Add(
                            new TreeData
                            {
                                SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                SetorPaiId = setor.SetorPaiId,
                                Nome = setor.Nome,
                                //Sigla = setor.Sigla
                            }
                        );
                    }
                }
                else
                {
                    if (temFilho)
                    {
                        treeDataSource.Add(
                            new TreeData
                            {
                                SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                Nome = setor.Nome,
                                HasChild = true,
                                //Sigla = setor.Sigla
                            }
                        );
                    }
                }
            }

            ViewData["dataSetor"] = treeDataSource;

            return new JsonResult(new { data = treeDataSource });
        }

        public void PreencheListaEventos()
        {
            //Preenche Lista de Eventos
            //=========================
            var ListaEventos = _unitOfWork.Evento.GetAll(e => e.Status == "1").OrderBy(e => e.Nome);

            List<EventoData> EventoDataSource = new List<EventoData>();

            foreach (var evento in ListaEventos)
            {
                EventoDataSource.Add(
                    new EventoData { EventoId = evento.EventoId, Nome = evento.Nome }
                );
            }

            ViewData["dataEvento"] = EventoDataSource;
        }

        class TreeData
        {
            public Guid SetorSolicitanteId { get; set; }
            public Guid? SetorPaiId { get; set; }
            public bool HasChild { get; set; }
            public string Sigla { get; set; }
            public bool Expanded { get; set; }
            public bool IsSelected { get; set; }
            public string Nome { get; set; }
        }

        public void PreencheListaSetores()
        {
            //    Preenche Treeview de Setores
            //================================
            var listaSetores = _unitOfWork.ViewSetores.GetAll();
            var treeDataSource = new List<TreeData>();

            foreach (var setor in listaSetores)
            {
                var temFilho = listaSetores.Any(u => u.SetorPaiId == setor.SetorSolicitanteId);

                if (setor.SetorPaiId != Guid.Empty)
                {
                    if (temFilho)
                    {
                        if (setor.SetorPaiId != Guid.Empty)
                        {
                            treeDataSource.Add(
                                new TreeData
                                {
                                    SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                    SetorPaiId = setor.SetorPaiId,
                                    Nome = setor.Nome,
                                    HasChild = true,
                                    //Sigla = setor.Sigla
                                }
                            );
                        }
                        else
                        {
                            treeDataSource.Add(
                                new TreeData
                                {
                                    SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                    Nome = setor.Nome,
                                    HasChild = true,
                                    //Sigla = setor.Sigla
                                }
                            );
                        }
                    }
                    else
                    {
                        treeDataSource.Add(
                            new TreeData
                            {
                                SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                SetorPaiId = setor.SetorPaiId,
                                Nome = setor.Nome,
                                //Sigla = setor.Sigla
                            }
                        );
                    }
                }
                else
                {
                    if (temFilho)
                    {
                        treeDataSource.Add(
                            new TreeData
                            {
                                SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                Nome = setor.Nome,
                                HasChild = true,
                                //Sigla = setor.Sigla
                            }
                        );
                    }
                }
            }

            ViewData["dataSetor"] = treeDataSource;
        }

        class RequisitanteData
        {
            public Guid RequisitanteId { get; set; }
            public string Requisitante { get; set; }
        }

        public void PreencheListaRequisitantes()
        {
            //Preenche Treeview de Requisitantes
            //==================================
            //var ListaRequisitantes = _unitOfWork.ViewRequisitantes.GetAll();

            var listaRequisitantes = _unitOfWork
                .ViewRequisitantes.GetAllReduced(
                    orderBy: r => r.OrderBy(r => r.Requisitante),
                    selector: vr => new { vr.Requisitante, vr.RequisitanteId }
                )
                .ToList();

            var requisitanteDataSource = new List<RequisitanteData>();

            //string requisitante = "8852C87D-90D8-4A16-8D13-08D97F8B08A4";
            //RequisitanteDataSource.Add(new RequisitanteData
            //{
            //    RequisitanteId = Guid.Parse(requisitante),
            //    Requisitante = "Alexandre Delgado",
            //});

            foreach (var requisitante in listaRequisitantes)
            {
                requisitanteDataSource.Add(
                    new RequisitanteData
                    {
                        RequisitanteId = (Guid)requisitante.RequisitanteId,
                        Requisitante = requisitante.Requisitante,
                    }
                );
            }

            ViewData["dataRequisitante"] = requisitanteDataSource;
        }

        class MotoristaData
        {
            public Guid MotoristaId { get; set; }
            public string Nome { get; set; }
            public string Foto { get; set; }
        }

        public void PreencheListaMotoristas()
        {
            var stopwatch = new System.Diagnostics.Stopwatch();
            stopwatch.Start();

            var ListaMotoristas = _unitOfWork
                .ViewMotoristasViagem.GetAllReduced(
                    selector: m => new
                    {
                        m.MotoristaId,
                        m.MotoristaCondutor,
                        m.Foto,
                    },
                    orderBy: m => m.OrderBy(m => m.Nome)
                )
                .ToList();

            var motoristaDataSource = new List<object>();

            foreach (var motorista in ListaMotoristas)
            {
                string fotoBase64 =
                    motorista.Foto != null
                        ? $"data:image/jpeg;base64,{Convert.ToBase64String(motorista.Foto)}"
                        : null;

                motoristaDataSource.Add(
                    new
                    {
                        MotoristaId = motorista.MotoristaId,
                        Nome = motorista.MotoristaCondutor,
                        Foto = fotoBase64,
                    }
                );
            }

            ViewData["dataMotorista"] = motoristaDataSource;

            stopwatch.Stop();
            Console.WriteLine($"[SEM redimensionamento] Tempo: {stopwatch.ElapsedMilliseconds}ms");
        }

        public void PreencheListaMotoristasComRedimensionamento()
        {
            var stopwatch = new System.Diagnostics.Stopwatch();
            stopwatch.Start();

            var lista = _unitOfWork
                .ViewMotoristasViagem.GetAllReduced(
                    selector: m => new
                    {
                        m.MotoristaId,
                        m.MotoristaCondutor,
                        m.Foto,
                    },
                    orderBy: m => m.OrderBy(x => x.MotoristaCondutor)
                )
                .ToList();

            var listaComFoto = lista
                .Select(m => new
                {
                    MotoristaId = m.MotoristaId,
                    Nome = m.MotoristaCondutor,
                    Foto = _fotoService.ObterFotoBase64(m.MotoristaId, m.Foto),
                })
                .ToList();

            ViewData["dataMotorista"] = listaComFoto;
            ;

            stopwatch.Stop();
            Console.WriteLine($"[COM redimensionamento] Tempo: {stopwatch.ElapsedMilliseconds}ms");
        }

        class VeiculoData
        {
            public Guid VeiculoId { get; set; }
            public string Descricao { get; set; }
        }

        public void PreencheListaVeiculos()
        {
            //Preenche DDList de Veículos
            //===========================
            var listaVeiculos = (
                from v in _unitOfWork.Veiculo.GetAllReduced(
                    filter: v => v.Status != false,
                    includeProperties: nameof(ModeloVeiculo) + "," + nameof(MarcaVeiculo),
                    selector: v => new
                    {
                        v.VeiculoId,
                        v.Placa,
                        v.MarcaVeiculo.DescricaoMarca,
                        v.ModeloVeiculo.DescricaoModelo,
                    }
                )
                select new
                {
                    v.VeiculoId,
                    Descricao = v.Placa + " - " + v.DescricaoMarca + "/" + v.DescricaoModelo,
                }
            ).OrderBy(v => v.Descricao);

            var veiculoDataSource = new List<VeiculoData>();

            //string veiculo = "C6B20D9C-4CF8-4C82-AD74-08D9779389BB";
            //VeiculoDataSource.Add(new VeiculoData
            //{
            //    VeiculoId = Guid.Parse(veiculo),
            //    Descricao = "JJU-3811 - Ford/Fusion",
            //});

            foreach (var veiculo in listaVeiculos)
            {
                veiculoDataSource.Add(
                    new VeiculoData { VeiculoId = veiculo.VeiculoId, Descricao = veiculo.Descricao }
                );
            }

            ViewData["dataVeiculo"] = veiculoDataSource;
        }

        class RequisicaoData
        {
            public Guid RepactuacaoContratoId { get; set; }
            public string Descricao { get; set; }
        }

        class CombustivelData
        {
            public string Nivel { get; set; }
            public string Descricao { get; set; }
            public string Imagem { get; set; }
        }

        public void PreencheListaCombustivel()
        {
            List<CombustivelData> CombustivelDataSource = new List<CombustivelData>();

            CombustivelDataSource.Add(
                new CombustivelData
                {
                    Nivel = "tanquevazio",
                    Descricao = "Vazio",
                    Imagem = "../images/tanquevazio.png",
                }
            );

            CombustivelDataSource.Add(
                new CombustivelData
                {
                    Nivel = "tanqueumquarto",
                    Descricao = "1/4",
                    Imagem = "../images/tanqueumquarto.png",
                }
            );

            CombustivelDataSource.Add(
                new CombustivelData
                {
                    Nivel = "tanquemeiotanque",
                    Descricao = "1/2",
                    Imagem = "../images/tanquemeiotanque.png",
                }
            );

            CombustivelDataSource.Add(
                new CombustivelData
                {
                    Nivel = "tanquetresquartos",
                    Descricao = "3/4",
                    Imagem = "../images/tanquetresquartos.png",
                }
            );

            CombustivelDataSource.Add(
                new CombustivelData
                {
                    Nivel = "tanquecheio",
                    Descricao = "Cheio",
                    Imagem = "../images/tanquecheio.png",
                }
            );

            ViewData["dataCombustivel"] = CombustivelDataSource;
        }

        class FinalidadeData
        {
            public string FinalidadeId { get; set; }
            public string Descricao { get; set; }
        }

        public void PreencheListaFinalidade()
        {
            List<FinalidadeData> FinalidadeDataSource = new List<FinalidadeData>();

            FinalidadeDataSource.Add(
                new FinalidadeData
                {
                    FinalidadeId = "Transporte de Funcionários",
                    Descricao = "Transporte de Funcionários",
                }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData
                {
                    FinalidadeId = "Transporte de Convidados",
                    Descricao = "Transporte de Convidados",
                }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData
                {
                    FinalidadeId = "Transporte de Materiais/Cargas",
                    Descricao = "Transporte de Materiais/Cargas",
                }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData
                {
                    FinalidadeId = "Economildo Norte(Cefor)",
                    Descricao = "Economildo Norte(Cefor)",
                }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData
                {
                    FinalidadeId = "Economildo Sul(PGR)",
                    Descricao = "Economildo Sul(PGR)",
                }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData
                {
                    FinalidadeId = "Economildo Rodoviária",
                    Descricao = "Economildo Rodoviária",
                }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData
                {
                    FinalidadeId = "Mesa (carros pretos)",
                    Descricao = "Mesa (carros pretos)",
                }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData
                {
                    FinalidadeId = "TV/Rádio Câmara",
                    Descricao = "TV/Rádio Câmara",
                }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData { FinalidadeId = "Aeroporto", Descricao = "Aeroporto" }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData
                {
                    FinalidadeId = "Saída para Manutenção",
                    Descricao = "Saída para Manutenção",
                }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData
                {
                    FinalidadeId = "Chegada da Manutenção",
                    Descricao = "Chegada da Manutenção",
                }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData { FinalidadeId = "Abastecimento", Descricao = "Abastecimento" }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData
                {
                    FinalidadeId = "Recebimento da Locadora",
                    Descricao = "Recebimento da Locadora",
                }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData
                {
                    FinalidadeId = "Devolução à Locadora",
                    Descricao = "Devolução à Locadora",
                }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData
                {
                    FinalidadeId = "Saída Programada",
                    Descricao = "Saída Programada",
                }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData { FinalidadeId = "Evento", Descricao = "Evento" }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData { FinalidadeId = "Ambulância", Descricao = "Ambulância" }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData { FinalidadeId = "Enviado Depol", Descricao = "Enviado Depol" }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData { FinalidadeId = "Recebido Depol", Descricao = "Recebido Depol" }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData
                {
                    FinalidadeId = "Demanda Política",
                    Descricao = "Demanda Política",
                }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData { FinalidadeId = "Passaporte", Descricao = "Passaporte" }
            );

            FinalidadeDataSource.Add(
                new FinalidadeData { FinalidadeId = "Cursos Depol", Descricao = "Cursos Depol" }
            );

            ViewData["dataFinalidade"] = FinalidadeDataSource;
        }

        public static string ConvertHtml(string html)
        {
            HtmlDocument doc = new HtmlDocument();
            doc.LoadHtml(html);

            StringWriter sw = new StringWriter();
            ConvertTo(doc.DocumentNode, sw);
            sw.Flush();
            return sw.ToString();
        }

        public static void ConvertTo(HtmlNode node, TextWriter outText)
        {
            string html;
            switch (node.NodeType)
            {
                case HtmlNodeType.Comment:
                    // don't output comments
                    break;

                case HtmlNodeType.Document:
                    ConvertContentTo(node, outText);
                    break;

                case HtmlNodeType.Text:
                    // script and style must not be output
                    string parentName = node.ParentNode.Name;
                    if ((parentName == "script") || (parentName == "style"))
                        break;

                    // get text
                    html = ((HtmlTextNode)node).Text;

                    // is it in fact a special closing node output as text?
                    if (HtmlNode.IsOverlappedClosingElement(html))
                        break;

                    // check the text is meaningful and not a bunch of whitespaces
                    if (html.Trim().Length > 0)
                    {
                        outText.Write(HtmlEntity.DeEntitize(html));
                    }
                    break;

                case HtmlNodeType.Element:
                    switch (node.Name)
                    {
                        case "p":
                            // treat paragraphs as crlf
                            outText.Write("\r\n");
                            break;
                    }

                    if (node.HasChildNodes)
                    {
                        ConvertContentTo(node, outText);
                    }
                    break;
            }
        }

        public static void ConvertContentTo(HtmlNode node, TextWriter outText)
        {
            foreach (HtmlNode subnode in node.ChildNodes)
            {
                ConvertTo(subnode, outText);
            }
        }
    }
}
