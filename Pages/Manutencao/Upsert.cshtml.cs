using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace FrotiX.Pages.Manutencao
{
    [Consumes("application/json")]
    [IgnoreAntiforgeryToken]
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;

        private readonly INotyfService _notyf;

        public static Guid ManutencaoId;

        public UpsertModel(
            IUnitOfWork unitOfWork,
            ILogger<IndexModel> logger,
            IWebHostEnvironment hostingEnvironment,
            INotyfService notyf
        )
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }

        [BindProperty]
        public ManutencaoViewModel ManutencaoObj { get; set; }

        private void SetViewModel()
        {
            ManutencaoObj = new ManutencaoViewModel { Manutencao = new Models.Manutencao() };
        }

        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null && id != Guid.Empty)
            {
                ManutencaoObj.Manutencao = _unitOfWork.Manutencao.GetFirstOrDefault(u =>
                    u.ManutencaoId == id
                );
                if (ManutencaoObj == null)
                {
                    return NotFound();
                }
            }

            PreencheListaVeiculos();
            PreencheListaVeiculosReserva();
            PreencheListaMotoristas();

            return Page();
        }

        ////Insere Nova Manutencao
        ////======================
        //public JsonResult OnPostInsereManutencao(Models.Manutencao Manutencao)
        //{
        //    _unitOfWork.Manutencao.Add(Manutencao);

        //    _unitOfWork.Save();

        //    return new JsonResult(new { data = Manutencao.ManutencaoId, message = "Registro de Manutenção Adicionado com Sucesso" });
        //}

        //public IActionResult OnPostEdit(Guid id)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        SetViewModel();
        //        ManutencaoObj.Manutencao.ManutencaoId = id;
        //        return Page();
        //    }

        //    ManutencaoObj.Manutencao.ManutencaoId = id;

        //    //var existeManutencao = _unitOfWork.Manutencao.GetFirstOrDefault(u => (u.AnoManutencao == ManutencaoObj.Manutencao.AnoManutencao) && (u.NumeroManutencao == ManutencaoObj.Manutencao.NumeroManutencao));
        //    //if (existeManutencao != null && existeManutencao.ManutencaoId != ManutencaoObj.Manutencao.ManutencaoId)
        //    //{
        //    //    _notyf.Error("Já existe um Registro de Manutencao com esse número!", 3);
        //    //    SetViewModel();
        //    //    ManutencaoObj.Manutencao.ManutencaoId = id;
        //    //    return Page();
        //    //}

        //    _unitOfWork.Manutencao.Update(ManutencaoObj.Manutencao);
        //    _unitOfWork.Save();

        //    _notyf.Success("Registro de Manutencao atualizado com sucesso!", 3);

        //    return RedirectToPage("./Index");
        //}

        class VeiculoData
        {
            public Guid VeiculoId { get; set; }
            public string Descricao { get; set; }
        }

        public void PreencheListaVeiculos()
        {
            //Preenche DDList de Veículos
            //===========================
            var ListaVeiculos = (
                from v in _unitOfWork.Veiculo.GetAll()
                join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                where v.Status != false
                select new
                {
                    VeiculoId = v.VeiculoId,

                    Descricao = v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo,
                }
            ).OrderBy(v => v.Descricao);

            List<VeiculoData> VeiculoDataSource = new List<VeiculoData>();

            foreach (var veiculo in ListaVeiculos)
            {
                VeiculoDataSource.Add(
                    new VeiculoData
                    {
                        VeiculoId = (Guid)veiculo.VeiculoId,
                        Descricao = veiculo.Descricao,
                    }
                );
            }

            ViewData["dataVeiculo"] = VeiculoDataSource;
        }

        class VeiculoReservaData
        {
            public Guid VeiculoId { get; set; }
            public string Descricao { get; set; }
        }

        public void PreencheListaVeiculosReserva()
        {
            //Preenche DDList de Veículos Reservas
            //====================================
            var ListaVeiculosReservas = (
                from v in _unitOfWork.Veiculo.GetAll()
                join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                where v.Status != false && v.Reserva == true
                orderby v.Placa
                select new
                {
                    VeiculoId = v.VeiculoId,

                    Descricao = v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo,
                }
            ).OrderBy(v => v.Descricao);

            List<VeiculoReservaData> VeiculoReservaDataSource = new List<VeiculoReservaData>();

            foreach (var veiculo in ListaVeiculosReservas)
            {
                VeiculoReservaDataSource.Add(
                    new VeiculoReservaData
                    {
                        VeiculoId = (Guid)veiculo.VeiculoId,
                        Descricao = veiculo.Descricao,
                    }
                );
            }

            ViewData["dataVeiculoReserva"] = VeiculoReservaDataSource;
        }

        class MotoristaData
        {
            public Guid MotoristaId { get; set; }
            public string Nome { get; set; }
        }

        public void PreencheListaMotoristas()
        {
            //Preenche Lista de Motoristas
            //============================
            var ListaMotoristas = _unitOfWork
                .ViewMotoristas.GetAll()
                .Where(m => m.Status == true)
                .OrderBy(n => n.Nome);
            List<MotoristaData> MotoristaDataSource = new List<MotoristaData>();

            foreach (var motorista in ListaMotoristas)
            {
                MotoristaDataSource.Add(
                    new MotoristaData
                    {
                        MotoristaId = (Guid)motorista.MotoristaId,
                        Nome = motorista.MotoristaCondutor,
                    }
                );
            }

            ViewData["dataMotorista"] = MotoristaDataSource;
        }
    }
}
