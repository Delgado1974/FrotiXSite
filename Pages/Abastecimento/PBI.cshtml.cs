using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using FrotiX.Services;
using FrotiX.Models;
using System.IO;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using AspNetCoreHero.ToastNotification.Abstractions;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using HtmlAgilityPack;

namespace FrotiX.Pages.Viagens
{

    public class PBIModel : PageModel
    {
        static string usuarioCorrenteId;
        static string usuarioCorrenteNome;
        static Guid veiculoAtual;
        static int kmAtual;

        static string usuarioIdCriacao;
        static DateTime dataCriacao ;

        static string lstRequisitante;

        public static byte[] FichaVistoria;

        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;

        private readonly INotyfService _notyf;

        private IHostingEnvironment hostingEnv;

        private readonly IWebHostEnvironment _hostingEnvironment;

        public static Guid viagemId;



        public PBIModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, INotyfService notyf, IHostingEnvironment env, IWebHostEnvironment hostingEnvironment)
        {
            _unitOfWork = unitOfWork;
             _logger = logger;
            _notyf = notyf;
            hostingEnv = env;
            _hostingEnvironment = hostingEnvironment;
        }

        [BindProperty]
        public ViagemViewModel ViagemObj { get; set; }
        public IFormFile FotoUpload { get; set; }


        private void SetViewModel()
        {
            ViagemObj = new ViagemViewModel
            {
                Viagem = new Models.Viagem()
            };
        }


        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null)
            {
                viagemId = (Guid)id;
            }

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
                ViagemObj.Viagem = _unitOfWork.Viagem.GetFirstOrDefault(u => u.ViagemId == id);
                if (ViagemObj == null)
                {
                    return NotFound();
                }

                usuarioIdCriacao = ViagemObj.Viagem.UsuarioIdCriacao;
                dataCriacao = (DateTime)ViagemObj.Viagem.DataCriacao;

                var dbUsuarioCriacao = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == ViagemObj.Viagem.UsuarioIdCriacao);
                ViagemObj.NomeUsuarioCriacao = dbUsuarioCriacao.NomeCompleto;
                kmAtual = (int)ViagemObj.Viagem.KmAtual;
                veiculoAtual = (Guid)ViagemObj.Viagem.VeiculoId;
            }
            else
            {
                usuarioIdCriacao = usuarioCorrenteId;
                dataCriacao = DateTime.Now;
            }

            if (ViagemObj.Viagem.DataFinalizacao != null)
            {

                var dbUsuarioFinalizacao = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == ViagemObj.Viagem.UsuarioIdCriacao);
                ViagemObj.NomeUsuarioFinalizacao = dbUsuarioFinalizacao.NomeCompleto;

                var dataFinalizacao = ViagemObj.Viagem.DataFinalizacao;

                ViagemObj.DataFinalizacao = dataFinalizacao?.ToString("dd/MM/yy");
                ViagemObj.HoraFinalizacao = dataFinalizacao?.ToString("HH:mm");
            }

            PreencheListaSetores();

            PreencheListaRequisitantes();

            PreencheListaMotoristas();

            PreencheListaVeiculos();

            PreencheListaCombustivel();

            PreencheListaFinalidade();

            FichaVistoria = ViagemObj.Viagem.FichaVistoria;


            return Page();


        }


        public IActionResult OnPostSubmit()
        {
            //Define Usuário Criação/Finalização
            //==================================
            if (ViagemObj.Viagem.HoraFim == null)
            {
                ViagemObj.Viagem.UsuarioIdCriacao = usuarioCorrenteId;
                ViagemObj.Viagem.DataCriacao = DateTime.Now;
            }
            else
            {
                ViagemObj.Viagem.UsuarioIdCriacao = usuarioIdCriacao;
                ViagemObj.Viagem.DataCriacao = dataCriacao;

                ViagemObj.Viagem.UsuarioIdFinalizacao = usuarioCorrenteId;
                ViagemObj.Viagem.DataFinalizacao = DateTime.Now;
            }

            if (!ModelState.IsValid)
            {
                //var modelErrors = new List<string>();
                foreach (var modelState in ModelState.Values)
                {
                    foreach (var modelError in modelState.Errors)
                    {
                        if (modelError.ErrorMessage != "The UsuarioIdAlteracao field is required.")
                        {
                            var erromodel = modelError.ErrorMessage;
                            PreencheListaSetores();
                            PreencheListaRequisitantes();
                            PreencheListaMotoristas();
                            PreencheListaVeiculos();
                            PreencheListaCombustivel();
                            PreencheListaFinalidade();

                            //SetViewModel();
                            return Page();
                        }
                    }
                }
                // do something with the error list :)
            }

            Guid viagemId = Guid.Empty;

            if (ViagemObj.Viagem.ViagemId != Guid.Empty)
            {
                viagemId = ViagemObj.Viagem.ViagemId;
            }

            //Verifica se preeencheu Hora Final sem Km Final ou Vice Versa
            if ((ViagemObj.Viagem.HoraFim != null && ViagemObj.Viagem.KmFinal == null) || (ViagemObj.Viagem.HoraFim == null && ViagemObj.Viagem.KmFinal != null))
            {
                _notyf.Error("Para finalizar a viagem, tanto a Hora Final como a Quilometragem Final precisam estar preenchidas!", 3);
                //SetViewModel();
                PreencheListaSetores();
                PreencheListaRequisitantes();
                PreencheListaMotoristas();
                PreencheListaVeiculos();
                PreencheListaCombustivel();
                PreencheListaFinalidade();

                ViagemObj.Viagem.ViagemId= viagemId;
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
                ViagemObj.Viagem.CustoCombustivel = Servicos.CalculaCustoCombustivel(ViagemObj.Viagem, _unitOfWork);

                int minutos = -1;
                ViagemObj.Viagem.CustoMotorista = Servicos.CalculaCustoMotorista(ViagemObj.Viagem, _unitOfWork, ref minutos);
                ViagemObj.Viagem.Minutos = minutos;

                ViagemObj.Viagem.CustoVeiculo = Servicos.CalculaCustoVeiculo(ViagemObj.Viagem, _unitOfWork);
            }

            //Define a quilometragem atual do veículo
            //var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v => v.VeiculoId == ViagemObj.Viagem.VeiculoId);

            //if (ViagemObj.Viagem.KmFinal != null)
            //{
            //    veiculo.Quilometragem = ViagemObj.Viagem.KmFinal;
            //    _unitOfWork.Veiculo.Update(veiculo);
            //    _unitOfWork.Save();
            //}


            //Tira o HTML
            string descricao = ViagemObj.Viagem.Descricao;
            if (ViagemObj.Viagem.Descricao != null)
            {
                descricao = ConvertHtml(descricao);
            }
            ViagemObj.Viagem.DescricaoSemFormato = descricao;


            ViagemObj.Viagem.StatusAgendamento = false;
            ViagemObj.Viagem.KmAtual = ViagemObj.Viagem.KmInicial;


            //Adiciona a Ficha de Vistoria
            //============================
            if (FotoUpload != null)
            {
                var file = FotoUpload.FileName;

                using (var ms = new MemoryStream())
                {
                    FotoUpload.CopyTo(ms);
                    ViagemObj.Viagem.FichaVistoria = ms.ToArray();
                }
            }
            else
            {
                var wwwroot = _hostingEnvironment.WebRootPath;
                var barbudo = wwwroot + "\\Images\\FichaAmarelaNova.jpg";
                byte[] imgdata = System.IO.File.ReadAllBytes(barbudo);
                ViagemObj.Viagem.FichaVistoria = imgdata.ToArray();

            }


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
                ViagemObj.Viagem.UsuarioIdCriacao = usuarioIdCriacao;
                ViagemObj.Viagem.DataCriacao = dataCriacao;

                ViagemObj.Viagem.UsuarioIdFinalizacao = usuarioCorrenteId;
                ViagemObj.Viagem.DataFinalizacao = DateTime.Now;
            }

            Guid viagemId = Guid.Empty;

            if (ViagemObj.Viagem.ViagemId != Guid.Empty)
            {
                viagemId = ViagemObj.Viagem.ViagemId;
            }

            //Verifica se preeencheu Hora Final sem Km Final ou Vice Versa
            if ((ViagemObj.Viagem.HoraFim != null && ViagemObj.Viagem.KmFinal == null) || (ViagemObj.Viagem.HoraFim == null && ViagemObj.Viagem.KmFinal != null))
            {
                _notyf.Error("Para finalizar a viagem, tanto a Hora Final como a Quilometragem Final precisam estar preenchidas!", 3);
                //SetViewModel();
                PreencheListaSetores();
                PreencheListaRequisitantes();
                PreencheListaMotoristas();
                PreencheListaVeiculos();
                PreencheListaCombustivel();
                PreencheListaFinalidade();

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
                ViagemObj.Viagem.CustoCombustivel = Servicos.CalculaCustoCombustivel(ViagemObj.Viagem, _unitOfWork);

                int minutos = -1;
                ViagemObj.Viagem.CustoMotorista = Servicos.CalculaCustoMotorista(ViagemObj.Viagem, _unitOfWork, ref minutos);
                ViagemObj.Viagem.Minutos = minutos;

                ViagemObj.Viagem.CustoVeiculo = Servicos.CalculaCustoVeiculo(ViagemObj.Viagem, _unitOfWork);
            }

            ////Define a quilometragem atual do veículo
            //var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v => v.VeiculoId == ViagemObj.Viagem.VeiculoId);

            //if (ViagemObj.Viagem.KmFinal != null)
            //{
            //    veiculo.Quilometragem = ViagemObj.Viagem.KmFinal;
            //    _unitOfWork.Veiculo.Update(veiculo);
            //    _unitOfWork.Save();
            //}

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




            ViagemObj.Viagem.StatusAgendamento = false;
            _notyf.Success("Viagem atualizada com sucesso!", 3);
            _unitOfWork.Viagem.Update(ViagemObj.Viagem);

            _unitOfWork.Save();

            return RedirectToPage("./Index");
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
            int NoFichaVistoria = int.Parse(id);

            var objViagem = _unitOfWork.Viagem.GetAll().Max(n => n.NoFichaVistoria);

            return new JsonResult(new { data = objViagem.Value });
        }


        //Pega o Setor baseado no Requisitante
        //==============================================
        public JsonResult OnGetPegaSetor(string id)
        {
            Guid requisitanteid = Guid.Parse(id);
            var requisitante = _unitOfWork.Requisitante.GetFirstOrDefault(e => e.RequisitanteId == requisitanteid);
            var setorrequisitante = _unitOfWork.SetorSolicitante.GetFirstOrDefault(e => e.SetorSolicitanteId == requisitante.SetorSolicitanteId);
            return new JsonResult(new { data = setorrequisitante.SetorSolicitanteId });
        }


        //Pega o Ramal baseado no Requisitante
        //====================================
        public JsonResult OnGetPegaRamal(string id)
        {
            Guid requisitanteid = Guid.Parse(id);
            var requisitante = _unitOfWork.Requisitante.GetFirstOrDefault(e => e.RequisitanteId == requisitanteid);
            return new JsonResult(new { data = requisitante.Ramal});
        }


        //Verifica se Motorista encontra-se em viagem não terminada
        //=========================================================
        public JsonResult OnGetVerificaMotoristaViagem(string id)
        {

            Guid motoristaid = Guid.Parse(id);
            var viagens = _unitOfWork.Viagem.GetFirstOrDefault(e => (e.MotoristaId == motoristaid && e.HoraFim == null && e.Status == "Aberta"));
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
                var viagens = _unitOfWork.Viagem.GetFirstOrDefault(e => (e.VeiculoId == veiculoid && e.HoraFim == null && e.Status == "Aberta" && e.StatusAgendamento == false));
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

            Guid guidOutput;
            bool isValid = Guid.TryParse(id, out guidOutput);

            if (id != null && isValid)
            {
                Guid veiculoid = Guid.Parse(id);
                var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v => (v.VeiculoId == veiculoid));
                return new JsonResult(new { data = veiculo.Quilometragem });
            }

            return new JsonResult(new { data = 0 });

        }


        //Preenche a Lista de Requisitantes via AJAX após inserção de novo registro
        //=========================================================================
        public JsonResult OnGetAJAXPreencheListaRequisitantes()
        {

            //Preenche Treeview de Requisitantes
            //==================================
            //var ListaRequisitantes = _unitOfWork.ViewRequisitantes.GetAll();

            var ListaRequisitantes = (from vr in _unitOfWork.ViewRequisitantes.GetAll()
                                      orderby vr.Requisitante
                                      select new
                                      {
                                          vr.Requisitante,
                                          vr.RequisitanteId,

                                      }).ToList();


            List<RequisitanteData> RequisitanteDataSource = new List<RequisitanteData>();

            var requisitantesList = "";

            foreach (var requisitante in ListaRequisitantes)
            {
                RequisitanteDataSource.Add(new RequisitanteData
                {
                    RequisitanteId = (Guid)requisitante.RequisitanteId,
                    Requisitante = requisitante.Requisitante,
                });

                requisitantesList = requisitantesList + "{ RequisitanteId: '" + (Guid)requisitante.RequisitanteId + "', Requisitante: '" + requisitante.Requisitante + "'},";

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
            var ListaSetores = _unitOfWork.ViewSetores.GetAll();
            Guid setorPai = Guid.Empty;
            bool temFilho;
            List<TreeData> TreeDataSource = new List<TreeData>();

            //string setorid = "2fd11a87-69e6-4f36-04c7-08d97d2150db";

            //TreeDataSource.Add(new TreeData
            //{
            //    SetorSolicitanteId = Guid.Parse(setorid),
            //    Nome = "Seção Administrativa",
            //    //Sigla = setor.Sigla
            //});


            foreach (var setor in ListaSetores)
            {
                temFilho = false;
                var objFromDb = _unitOfWork.ViewSetores.GetFirstOrDefault(u => u.SetorPaiId == setor.SetorSolicitanteId);

                if (objFromDb != null)
                {
                    temFilho = true;
                }
                if (setor.SetorPaiId != Guid.Empty)
                {
                    if (temFilho)
                    {
                        if (setor.SetorPaiId != Guid.Empty)
                        {
                            TreeDataSource.Add(new TreeData
                            {
                                SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                SetorPaiId = setor.SetorPaiId,
                                Nome = setor.Nome,
                                HasChild = true,
                                //Sigla = setor.Sigla
                            });
                        }
                        else
                        {
                            TreeDataSource.Add(new TreeData
                            {
                                SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                Nome = setor.Nome,
                                HasChild = true,
                                //Sigla = setor.Sigla
                            });
                        }
                    }
                    else
                    {
                        TreeDataSource.Add(new TreeData
                        {
                            SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                            SetorPaiId = setor.SetorPaiId,
                            Nome = setor.Nome,
                            //Sigla = setor.Sigla
                        });
                    }
                }
                else
                {
                    if (temFilho)
                    {
                        TreeDataSource.Add(new TreeData
                        {
                            SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                            Nome = setor.Nome,
                            HasChild = true,
                            //Sigla = setor.Sigla
                        });
                    }
                }

            }

            ViewData["dataSetor"] = TreeDataSource;
            return new JsonResult(new { data = TreeDataSource });

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
            var ListaSetores = _unitOfWork.ViewSetores.GetAll();
            Guid setorPai = Guid.Empty;
            bool temFilho;
            List<TreeData> TreeDataSource = new List<TreeData>();

            //string setorid = "2fd11a87-69e6-4f36-04c7-08d97d2150db";

            //TreeDataSource.Add(new TreeData
            //{
            //    SetorSolicitanteId = Guid.Parse(setorid),
            //    Nome = "Seção Administrativa",
            //    //Sigla = setor.Sigla
            //});


            foreach (var setor in ListaSetores)
            {
                temFilho = false;
                var objFromDb = _unitOfWork.ViewSetores.GetFirstOrDefault(u => u.SetorPaiId == setor.SetorSolicitanteId);

                if (objFromDb != null)
                {
                    temFilho = true;
                }
                if (setor.SetorPaiId != Guid.Empty)
                {
                    if (temFilho)
                    {
                        if (setor.SetorPaiId != Guid.Empty)
                        {
                            TreeDataSource.Add(new TreeData
                            {
                                SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                SetorPaiId = setor.SetorPaiId,
                                Nome = setor.Nome,
                                HasChild = true,
                                //Sigla = setor.Sigla
                            });
                        }
                        else
                        {
                            TreeDataSource.Add(new TreeData
                            {
                                SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                Nome = setor.Nome,
                                HasChild = true,
                                //Sigla = setor.Sigla
                            });
                        }
                    }
                    else
                    {
                        TreeDataSource.Add(new TreeData
                        {
                            SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                            SetorPaiId = setor.SetorPaiId,
                            Nome = setor.Nome,
                            //Sigla = setor.Sigla
                        });
                    }
                }
                else
                {
                    if (temFilho)
                    {
                        TreeDataSource.Add(new TreeData
                        {
                            SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                            Nome = setor.Nome,
                            HasChild = true,
                            //Sigla = setor.Sigla
                        });
                    }
                }

            }

            ViewData["dataSetor"] = TreeDataSource;

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


            var ListaRequisitantes = (from vr in _unitOfWork.ViewRequisitantes.GetAll()
                                      orderby vr.Requisitante
                                      select new
                                      {
                                          vr.Requisitante,
                                          vr.RequisitanteId,

                                      }).ToList();

            List<RequisitanteData> RequisitanteDataSource = new List<RequisitanteData>();

            //string requisitante = "8852C87D-90D8-4A16-8D13-08D97F8B08A4";
            //RequisitanteDataSource.Add(new RequisitanteData
            //{
            //    RequisitanteId = Guid.Parse(requisitante),
            //    Requisitante = "Alexandre Delgado",
            //});

            foreach (var requisitante in ListaRequisitantes)
            {
                RequisitanteDataSource.Add(new RequisitanteData
                {
                    RequisitanteId = (Guid)requisitante.RequisitanteId,
                    Requisitante = requisitante.Requisitante,
                });
            }

            ViewData["dataRequisitante"] = RequisitanteDataSource;

        }


        class MotoristaData
        {
            public Guid MotoristaId { get; set; }
            public string Nome { get; set; }
        }

        public void PreencheListaMotoristas()
        {
            //Preenche Treeview de Requisitantes
            //==================================
            var ListaMotoristas = _unitOfWork.ViewMotoristas.GetAll().Where(m => m.Status == true).OrderBy(n => n.Nome);
            List<MotoristaData> MotoristaDataSource = new List<MotoristaData>();

            //string motorista = "96928BEC-2834-4408-639C-08D97D10B46C";
            //MotoristaDataSource.Add(new MotoristaData
            //{
            //    MotoristaId = Guid.Parse(motorista),
            //    Nome = "Willians Aparecido Peixoto",
            //});

            foreach (var motorista in ListaMotoristas)
            {
                MotoristaDataSource.Add(new MotoristaData
                {
                    MotoristaId = (Guid)motorista.MotoristaId,
                    Nome = motorista.Nome,
                });
            }

            ViewData["dataMotorista"] = MotoristaDataSource;

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
            var ListaVeiculos = (from v in _unitOfWork.Veiculo.GetAll()
                                 join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                                 join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                                 where v.Status != false
                                 orderby v.Placa
                                 select new
                                 {
                                     VeiculoId = v.VeiculoId,

                                     Descricao = v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo,

                                 }).OrderBy(v => v.Descricao);

            List<VeiculoData> VeiculoDataSource = new List<VeiculoData>();

            //string veiculo = "C6B20D9C-4CF8-4C82-AD74-08D9779389BB";
            //VeiculoDataSource.Add(new VeiculoData
            //{
            //    VeiculoId = Guid.Parse(veiculo),
            //    Descricao = "JJU-3811 - Ford/Fusion",
            //});

            foreach (var veiculo in ListaVeiculos)
            {
                VeiculoDataSource.Add(new VeiculoData
                {
                    VeiculoId = (Guid)veiculo.VeiculoId,
                    Descricao = veiculo.Descricao,
                });
            }

            ViewData["dataVeiculo"] = VeiculoDataSource;

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

            CombustivelDataSource.Add(new CombustivelData
            {
                Nivel = "tanquevazio",
                Descricao = "Vazio",
                Imagem = "../images/tanquevazio.png"
            });

            CombustivelDataSource.Add(new CombustivelData
            {
                Nivel = "tanqueumquarto",
                Descricao = "1/4",
                Imagem = "../images/tanqueumquarto.png"
            });

            CombustivelDataSource.Add(new CombustivelData
            {
                Nivel = "tanquemeiotanque",
                Descricao = "1/2",
                Imagem = "../images/tanquemeiotanque.png"
            });

            CombustivelDataSource.Add(new CombustivelData
            {
                Nivel = "tanquetresquartos",
                Descricao = "3/4",
                Imagem = "../images/tanquetresquartos.png"
            });

            CombustivelDataSource.Add(new CombustivelData
            {
                Nivel = "tanquecheio",
                Descricao = "Cheio",
                Imagem = "../images/tanquecheio.png"
            });

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

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "Transporte de Funcionários",
                Descricao = "Transporte de Funcionários",
            });

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "Transporte de Convidados",
                Descricao = "Transporte de Convidados",
            });

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "Transporte de Materiais/Cargas",
                Descricao = "Transporte de Materiais/Cargas",
            });

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "Economildo Norte(Cefor)",
                Descricao = "Economildo Norte(Cefor)",
            });

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "Economildo Sul(PGR)",
                Descricao = "Economildo Sul(PGR)",
            });

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "Economildo Rodoviária",
                Descricao = "Economildo Rodoviária",
            });

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "Mesa (carros pretos)",
                Descricao = "Mesa (carros pretos)",
            });

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "TV/Rádio Câmara",
                Descricao = "TV/Rádio Câmara",
            });

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "Aeroporto",
                Descricao = "Aeroporto",
            });

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "Manutenção",
                Descricao = "Manutenção",
            });

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "Abastecimento",
                Descricao = "Abastecimento",
            });

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "Devolução à Locadora",
                Descricao = "Devolução à Locadora",
            });

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "Recebimento da Locadora",
                Descricao = "Recebimento da Locadora",
            });

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "Saída Programada",
                Descricao = "Saída Programada",
            });

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "Evento",
                Descricao = "Evento",
            });

            FinalidadeDataSource.Add(new FinalidadeData
            {
                FinalidadeId = "Ambulância",
                Descricao = "Ambulância",
            });


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
