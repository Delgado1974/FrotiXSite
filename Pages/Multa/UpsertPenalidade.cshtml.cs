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
using System.Text;

namespace FrotiX.Pages.Multa
{

    public class UpsertPenalidadeModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;

        private readonly INotyfService _notyf;

        private readonly IWebHostEnvironment _hostingEnvironment;

        public static Guid multaId;

        public UpsertPenalidadeModel(IUnitOfWork unitOfWork, INotyfService notyf, IWebHostEnvironment hostingEnvironment)
        {
            _unitOfWork = unitOfWork;
            _notyf = notyf;
            _hostingEnvironment = hostingEnvironment;
        }

        [BindProperty]
        public MultaViewModel MultaObj { get; set; }

        private void SetViewModel()
        {
            MultaObj = new MultaViewModel
            {
                Multa = new Models.Multa()
            };
        }


        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null)
            {
                multaId = (Guid)id;
            }

            if (id != null && id != Guid.Empty)
            {
                MultaObj.Multa = _unitOfWork.Multa.GetFirstOrDefault(m => m.MultaId == id);
                if (MultaObj == null)
                {
                    return NotFound();
                }
            }

            PreencheListaMotoristas();

            PreencheListaVeiculos();

            PreencheListaStatus();

            PreencheListaOrgaos();

            if (MultaObj.Multa.OrgaoAutuanteId != null)
            {
                PreencheListaTodosEmpenhos((Guid)MultaObj.Multa.OrgaoAutuanteId);
            }

            PreencheListaInfracoes();

            PreencheListaContratoVeiculos();

            PreencheListaAtaVeiculos();

            PreencheListaContratoMotoristas();

            return Page();

        }


        public IActionResult OnPostSubmit()
        {

            Guid multaId = Guid.Empty;

            if (MultaObj.Multa.MultaId != Guid.Empty)
            {
                multaId = MultaObj.Multa.MultaId;
            }

            MultaObj.Multa.Fase = "Penalidade";

            if (MultaObj.Multa.ValorPago != null && MultaObj.Multa.DataPagamento != null)
            {
                MultaObj.Multa.Paga = true;
            }

            //Define o Status da Multa

            _notyf.Success("Penalidade adicionada com sucesso!", 3);
            _unitOfWork.Multa.Add(MultaObj.Multa);
            _unitOfWork.Save();

            return RedirectToPage("./ListaPenalidade");
        }

        public IActionResult OnPostEdit(Guid Id)
        {

            MultaObj.Multa.MultaId = Id;

            Guid multaId = Guid.Empty;

            if (MultaObj.Multa.MultaId != Guid.Empty)
            {
                multaId = MultaObj.Multa.MultaId;
            }

            if (MultaObj.Multa.ValorPago != null && MultaObj.Multa.DataPagamento != null)
            {
                MultaObj.Multa.Paga = true;
            }

            _notyf.Success("Penalidade atualizada com sucesso!", 3);
            _unitOfWork.Multa.Update(MultaObj.Multa);

            _unitOfWork.Save();

            return RedirectToPage("./ListaPenalidade");
        }

        //------------- Salva o PDF no Diretório -------------------
        //==========================================================
        public ActionResult OnPostSavePDF(IEnumerable<IFormFile> files)
        {
            // The Name of the Upload component is "files"
            if (files != null)
            {
                foreach (var file in files)
                {

                    //IFormFile file = Request.Form.Files[0];
                    string folderName = "DadosEditaveis/Multas";
                    string webRootPath = _hostingEnvironment.WebRootPath;
                    string newPath = Path.Combine(webRootPath, folderName);
                    StringBuilder sb = new StringBuilder();
                    if (!Directory.Exists(newPath))
                    {
                        Directory.CreateDirectory(newPath);
                    }
                    if (file.Length > 0)
                    {
                        string sFileExtension = Path.GetExtension(file.FileName).ToLower();
                        //string fullPath = Path.Combine(newPath, file.FileName.Replace(" ", "_"));
                        string fullPath = Path.Combine(newPath, TiraAcento(file.FileName));
                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                    }

                }
            }

            // Return an empty string to signify success
            return Content("");
        }

        //------------- Salva o PDF no Diretório -------------------
        //==========================================================
        public ActionResult OnPostSaveComprovantePDF(IEnumerable<IFormFile> flComprovante)
        {
            // The Name of the Upload component is "files"
            if (flComprovante != null)
            {
                foreach (var file in flComprovante)
                {

                    //IFormFile file = Request.Form.Files[0];
                    string folderName = "DadosEditaveis/Multas";
                    string webRootPath = _hostingEnvironment.WebRootPath;
                    string newPath = Path.Combine(webRootPath, folderName);
                    StringBuilder sb = new StringBuilder();
                    if (!Directory.Exists(newPath))
                    {
                        Directory.CreateDirectory(newPath);
                    }
                    if (file.Length > 0)
                    {
                        string sFileExtension = Path.GetExtension(file.FileName).ToLower();
                        string fullPath = Path.Combine(newPath, TiraAcento(file.FileName));
                        //string fullPath = Path.Combine(newPath, file.FileName.Replace(" ", "_"));
                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                    }

                }
            }

            // Return an empty string to signify success
            return Content("");
        }

        //------------- Salva o PDF no Diretório -------------------
        //==========================================================
        public ActionResult OnPostSaveRegistroPDF(IEnumerable<IFormFile> flRegistro)
        {
            // The Name of the Upload component is "files"
            if (flRegistro != null)
            {
                foreach (var file in flRegistro)
                {

                    //IFormFile file = Request.Form.Files[0];
                    string folderName = "DadosEditaveis/Multas";
                    string webRootPath = _hostingEnvironment.WebRootPath;
                    string newPath = Path.Combine(webRootPath, folderName);
                    StringBuilder sb = new StringBuilder();
                    if (!Directory.Exists(newPath))
                    {
                        Directory.CreateDirectory(newPath);
                    }
                    if (file.Length > 0)
                    {
                        string sFileExtension = Path.GetExtension(file.FileName).ToLower();
                        //string fullPath = Path.Combine(newPath, file.FileName.Replace(" ", "_"));
                        string fullPath = Path.Combine(newPath, TiraAcento(file.FileName));
                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                    }

                }
            }

            // Return an empty string to signify success
            return Content("");
        }


        //Preenche a Lista de Empenhos com TODOS os Empenhos
        //==================================================
        class TodosEmpenhosData
        {
            public Guid EmpenhoMultaId { get; set; }
            public string NotaEmpenho { get; set; }
        }

        public JsonResult PreencheListaTodosEmpenhos(Guid orgaoAutuanteId)
        {

            var ListaTodosEmpenhos = (from e in _unitOfWork.EmpenhoMulta.GetAll()
                                      where e.OrgaoAutuanteId == orgaoAutuanteId
                                      orderby e.NotaEmpenho
                                      select new
                                      {
                                          e.EmpenhoMultaId,
                                          e.NotaEmpenho,

                                      }).OrderByDescending(e => e.NotaEmpenho).ToList();


            List<TodosEmpenhosData> TodosEmpenhosDataSource = new List<TodosEmpenhosData>();

            foreach (var empenho in ListaTodosEmpenhos)
            {
                TodosEmpenhosDataSource.Add(new TodosEmpenhosData
                {
                    EmpenhoMultaId = (Guid)empenho.EmpenhoMultaId,
                    NotaEmpenho = empenho.NotaEmpenho,
                });

            }

            ViewData["dataTodosEmpenhos"] = TodosEmpenhosDataSource;

            return new JsonResult(new { data = TodosEmpenhosDataSource });

        }


        //Preenche a Lista de Empenhos via AJAX após Seleção
        //==================================================
        class EmpenhoData
        {
            public Guid EmpenhoMultaId { get; set; }
            public string NotaEmpenho { get; set; }
        }

        public JsonResult OnGetAJAXPreencheListaEmpenhos(string id)
        {

            var ListaEmpenhos = (from e in _unitOfWork.EmpenhoMulta.GetAll()
                                 where e.OrgaoAutuanteId == Guid.Parse(id)
                                 orderby e.NotaEmpenho
                                 select new
                                 {
                                     e.EmpenhoMultaId,
                                     e.NotaEmpenho,

                                 }).OrderByDescending(e => e.NotaEmpenho).ToList();
            List<EmpenhoData> EmpenhoDataSource = new List<EmpenhoData>();

            foreach (var empenho in ListaEmpenhos)
            {
                EmpenhoDataSource.Add(new EmpenhoData
                {
                    EmpenhoMultaId = (Guid)empenho.EmpenhoMultaId,
                    NotaEmpenho = empenho.NotaEmpenho,
                });

            }

            ViewData["dataEmpenho"] = EmpenhoDataSource;

            return new JsonResult(new { data = EmpenhoDataSource });

        }



        //Preenche Lista de Motoristas
        //============================
        class MotoristaData
        {
            public Guid MotoristaId { get; set; }
            public string MotoristaCondutor { get; set; }
        }

        public void PreencheListaMotoristas()
        {
            var ListaMotoristas = _unitOfWork.ViewMotoristas.GetAll().Where(m => m.Status == true).OrderBy(n => n.Nome);
            List<MotoristaData> MotoristaDataSource = new List<MotoristaData>();

            foreach (var motorista in ListaMotoristas)
            {
                MotoristaDataSource.Add(new MotoristaData
                {
                    MotoristaId = (Guid)motorista.MotoristaId,
                    MotoristaCondutor = "(" + motorista.Ponto + ") " + motorista.MotoristaCondutor,
                });
            }

            ViewData["dataMotorista"] = MotoristaDataSource;

        }

        //Preenche Lista de Veículos
        //==========================
        class VeiculoData
        {
            public Guid VeiculoId { get; set; }
            public string Descricao { get; set; }
        }

        public void PreencheListaVeiculos()
        {
            var ListaVeiculos = (from v in _unitOfWork.Veiculo.GetAll()
                                 join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                                 join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                                 orderby v.Placa
                                 select new
                                 {
                                     VeiculoId = v.VeiculoId,

                                     Descricao = v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo,

                                 }).OrderBy(v => v.Descricao);

            List<VeiculoData> VeiculoDataSource = new List<VeiculoData>();

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

        //Preenche Lista de Órgãos Autuantes
        //==================================
        class OrgaoData
        {
            public Guid OrgaoId { get; set; }
            public string Descricao { get; set; }
        }

        public void PreencheListaOrgaos()
        {
            var ListaOrgaos = (from o in _unitOfWork.OrgaoAutuante.GetAll()
                                 orderby o.Sigla
                                 select new
                                 {
                                     OrgaoId = o.OrgaoAutuanteId,

                                     Descricao = o.Sigla + " - " + o.Nome,

                                 }).OrderBy(v => v.Descricao);

            List<OrgaoData> OrgaoDataSource = new List<OrgaoData>();

            foreach (var orgao in ListaOrgaos)
            {
                OrgaoDataSource.Add(new OrgaoData
                {
                    OrgaoId = (Guid)orgao.OrgaoId,
                    Descricao = orgao.Descricao,
                });
            }

            ViewData["dataOrgao"] = OrgaoDataSource;

        }



        //Preenche Lista de Infrações
        //===========================
        class InfracaoData
        {
            public Guid TipoMultaId { get; set; }
            public string Descricao { get; set; }
        }

        public void PreencheListaInfracoes()
        {
            var ListaInfracoes = (from o in _unitOfWork.TipoMulta.GetAll()
                               orderby o.Artigo
                               select new
                               {
                                   TipoMultaId = o.TipoMultaId,

                                   Descricao = ("(" + o.Artigo + ")" + "-(" + o.CodigoDenatran + "/" + o.Desdobramento + ")" + " - " + Servicos.ConvertHtml(o.Descricao)),

                               }).OrderBy(v => v.Descricao);

            List<InfracaoData> InfracaoDataSource = new List<InfracaoData>();

            foreach (var infracao in ListaInfracoes)
            {
                InfracaoDataSource.Add(new InfracaoData
                {
                    TipoMultaId = (Guid)infracao.TipoMultaId,
                    Descricao = infracao.Descricao,
                });
            }

            ViewData["dataInfracao"] = InfracaoDataSource;

        }

        //Preenche Lista de Status
        //========================
        class StatusData
        {
            public string StatusId { get; set; }
            public string Descricao { get; set; }
        }

        public void PreencheListaStatus()
        {

            List<StatusData> StatusDataSource = new List<StatusData>();

            StatusDataSource.Add(new StatusData
            {
                StatusId = "À Pagar",
                Descricao = "À Pagar",
            });

            StatusDataSource.Add(new StatusData
            {
                StatusId = "Paga (Defin)",
                Descricao = "Paga (Defin)",
            });

            StatusDataSource.Add(new StatusData
            {
                StatusId = "Paga (Infrator)",
                Descricao = "Paga (Infrator)",
            });

            StatusDataSource.Add(new StatusData
            {
                StatusId = "À Enviar Secle",
                Descricao = "À Enviar Secle",
            });

            StatusDataSource.Add(new StatusData
            {
                StatusId = "Enviada Secle",
                Descricao = "Enviada Secle",
            });

            StatusDataSource.Add(new StatusData
            {
                StatusId = "Arquivada (Finalizada)",
                Descricao = "Arquivada (Finalizada)",
            });

            StatusDataSource.Add(new StatusData
            {
                StatusId = "Infração Cancelada",
                Descricao = "Infração Cancelada",
            });

            ViewData["dataStatus"] = StatusDataSource;

        }

        //Preenche Lista de Contratos de Veículos
        //=======================================
        class ContratoVeiculosData
        {
            public Guid ContratoId { get; set; }
            public string Descricao { get; set; }
        }

        public void PreencheListaContratoVeiculos()
        {
            var ListaContratoVeiculos = _unitOfWork.ViewContratoFornecedor.GetAll(cv => cv.TipoContrato == "Locação");

            List<ContratoVeiculosData> ContratoVeiculosDataSource = new List<ContratoVeiculosData>();

            foreach (var contrato in ListaContratoVeiculos)
            {
                ContratoVeiculosDataSource.Add(new ContratoVeiculosData
                {
                    ContratoId = (Guid)contrato.ContratoId,
                    Descricao = contrato.Descricao,
                });
            }

            ViewData["dataContratoVeiculos"] = ContratoVeiculosDataSource;

        }

        //Preenche Lista de Atas de Veículos
        //=======================================
        class AtaVeiculosData
        {
            public Guid AtaId { get; set; }
            public string Descricao { get; set; }
        }

        public void PreencheListaAtaVeiculos()
        {
            var ListaAtaVeiculos = _unitOfWork.ViewAtaFornecedor.GetAll();

            List<AtaVeiculosData> AtaVeiculosDataSource = new List<AtaVeiculosData>();

            foreach (var ata in ListaAtaVeiculos)
            {
                AtaVeiculosDataSource.Add(new AtaVeiculosData
                {
                    AtaId = (Guid)ata.AtaId,
                    Descricao = ata.AtaVeiculo,
                });
            }

            ViewData["dataAtaVeiculos"] = AtaVeiculosDataSource;

        }


        //Preenche Lista de Contratos de Motoristas
        //=========================================
        class ContratoMotoristasData
        {
            public Guid ContratoId { get; set; }
            public string Descricao { get; set; }
        }

        public void PreencheListaContratoMotoristas()
        {
            var ListaContratoMotoristas = _unitOfWork.ViewContratoFornecedor.GetAll(cv => cv.TipoContrato == "Terceirização");

            List<ContratoMotoristasData> ContratoMotoristasDataSource = new List<ContratoMotoristasData>();

            foreach (var contrato in ListaContratoMotoristas)
            {
                ContratoMotoristasDataSource.Add(new ContratoMotoristasData
                {
                    ContratoId = (Guid)contrato.ContratoId,
                    Descricao = contrato.Descricao,
                });
            }

            ViewData["dataContratoMotoristas"] = ContratoMotoristasDataSource;

        }

        static string TiraAcento(string frase)
        {
            StringBuilder resultado = new StringBuilder();

            foreach (char c in frase)
            {
                char caractereSemAcento = RemoveAcento(c);
                resultado.Append(caractereSemAcento == ' ' ? '_' : caractereSemAcento);
            }

            return resultado.ToString().ToUpper();
        }

        static char RemoveAcento(char c)
        {
            switch (c)
            {
                case 'Á': case 'á': return 'a';
                case 'É': case 'é': return 'e';
                case 'Í': case 'í': return 'i';
                case 'Ó': case 'ó': return 'o';
                case 'Ú': case 'ú': return 'u';
                case 'À': case 'à': return 'a';
                case 'È': case 'è': return 'e';
                case 'Ì': case 'ì': return 'i';
                case 'Ò': case 'ò': return 'o';
                case 'Ù': case 'ù': return 'u';
                case 'Â': case 'â': return 'a';
                case 'Ê': case 'ê': return 'e';
                case 'Î': case 'î': return 'i';
                case 'Ô': case 'ô': return 'o';
                case 'Û': case 'û': return 'u';
                case 'Ã': case 'ã': return 'a';
                case 'Õ': case 'õ': return 'o';
                case 'Ç': case 'ç': return 'c';
                default: return c;
            }
        }


    }

}
