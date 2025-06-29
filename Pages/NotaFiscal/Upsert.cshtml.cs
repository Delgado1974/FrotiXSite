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
using Microsoft.AspNetCore.Hosting;
using AspNetCoreHero.ToastNotification.Abstractions;

namespace FrotiX.Pages.NotaFiscal
{

    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;

        private readonly INotyfService _notyf;

        public static Guid notaFiscalId;
        //public static DateTime dataEmissaoAnterior;
        public static int anoReferenciaAnterior;
        public static int mesReferenciaAnterior;

        public UpsertModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, IWebHostEnvironment hostingEnvironment, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
             _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }


        [BindProperty]
        public NotaFiscalViewModel NotaFiscalObj { get; set; }
        public MediaCombustivel MediaCombustivelObj { get; set; }
        public CustoMensalItensContrato CustoItensObj { get; set; }

        private void SetViewModel()
        {
            NotaFiscalObj = new NotaFiscalViewModel
            {
                AtaList = _unitOfWork.AtaRegistroPrecos.GetAtaListForDropDown(1),
                ContratoList = _unitOfWork.Contrato.GetContratoListForDropDown("", 1),
                NotaFiscal = new Models.NotaFiscal()
            };
        }

        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null && id != Guid.Empty)
            {
                NotaFiscalObj.NotaFiscal = _unitOfWork.NotaFiscal.GetFirstOrDefault(u => u.NotaFiscalId == id);
                if (NotaFiscalObj == null)
                {
                    return NotFound();
                }
            }

            //Pega as médias de Gasolina e Diesel
            //===================================
            if (NotaFiscalObj.NotaFiscal.TipoNF == "Combustível")
            {
                //dataEmissaoAnterior = (DateTime)NotaFiscalObj.NotaFiscal.DataEmissao;
                anoReferenciaAnterior = (int)NotaFiscalObj.NotaFiscal.AnoReferencia;
                mesReferenciaAnterior = (int)NotaFiscalObj.NotaFiscal.MesReferencia;

                int ano = (int)NotaFiscalObj.NotaFiscal.AnoReferencia;
                int mes = (int)NotaFiscalObj.NotaFiscal.MesReferencia;

                var mediagasolinaObj = _unitOfWork.MediaCombustivel.GetFirstOrDefault(mc => (mc.NotaFiscalId == NotaFiscalObj.NotaFiscal.NotaFiscalId) && (mc.CombustivelId == Guid.Parse("F668F660-8380-4DF3-90CD-787DB06FE734")) && (mc.Ano == ano) && (mc.Mes == mes));
                NotaFiscalObj.NotaFiscal.MediaGasolina = mediagasolinaObj.PrecoMedio;

                var mediadieselObj = _unitOfWork.MediaCombustivel.GetFirstOrDefault(mc => (mc.NotaFiscalId == NotaFiscalObj.NotaFiscal.NotaFiscalId) && (mc.CombustivelId == Guid.Parse("A69AA86A-9162-4242-AB9A-8B184E04C4DA")) && (mc.Ano == ano) && (mc.Mes == mes));
                NotaFiscalObj.NotaFiscal.MediaDiesel = mediadieselObj.PrecoMedio;
            }

            //Pega os valores de Operador/Motorista/Terceirizado
            //==================================================
            if (NotaFiscalObj.NotaFiscal.TipoNF == "Terceirização")
            {
                anoReferenciaAnterior = (int)NotaFiscalObj.NotaFiscal.AnoReferencia;
                mesReferenciaAnterior = (int)NotaFiscalObj.NotaFiscal.MesReferencia;

                int ano = (int)NotaFiscalObj.NotaFiscal.AnoReferencia;
                int mes = (int)NotaFiscalObj.NotaFiscal.MesReferencia;

                var itensContratoObj = _unitOfWork.CustoMensalItensContrato.GetFirstOrDefault(cm => (cm.NotaFiscalId == NotaFiscalObj.NotaFiscal.NotaFiscalId) && (cm.Ano == ano) && (cm.Mes == mes));
                NotaFiscalObj.NotaFiscal.CustoMensalOperador = (double)itensContratoObj.CustoMensalOperador;
                NotaFiscalObj.NotaFiscal.CustoMensalMotorista = (double)itensContratoObj.CustoMensalMotorista;
                NotaFiscalObj.NotaFiscal.CustoMensalLavador = (double)itensContratoObj.CustoMensalLavador;
            }




            PreencheListaVeiculos();

            return Page();
        }

        
        public IActionResult OnPostSubmit()
        {
            if (!ModelState.IsValid)
            {
                //SetViewModel();
                //return Page();
            }

            var existeNotaFiscal = _unitOfWork.NotaFiscal.GetFirstOrDefault(u => (u.NumeroNF == NotaFiscalObj.NotaFiscal.NumeroNF) && (u.EmpenhoId == NotaFiscalObj.NotaFiscal.EmpenhoId));
            if (existeNotaFiscal != null && existeNotaFiscal.NotaFiscalId != NotaFiscalObj.NotaFiscal.NotaFiscalId)
            {
                _notyf.Error("Já existe uma Nota Fiscal com esse número!", 3);
                SetViewModel();
                return Page();
            }

            if (NotaFiscalObj.NotaFiscal.ValorGlosa > NotaFiscalObj.NotaFiscal.ValorNF)
            {
                _notyf.Error("O valor da Glosa não pode ser superior ao valor da Nota Fiscal!", 3);
                SetViewModel();
                return Page();
            }

            //Atualiza Valor do Empenho
            //=========================
            if (NotaFiscalObj.NotaFiscal.ValorGlosa == null)
            {
                NotaFiscalObj.NotaFiscal.ValorGlosa = 0;
            }
            var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u => (u.EmpenhoId == NotaFiscalObj.NotaFiscal.EmpenhoId));
            empenho.SaldoFinal = empenho.SaldoFinal - (NotaFiscalObj.NotaFiscal.ValorNF - NotaFiscalObj.NotaFiscal.ValorGlosa);
            _unitOfWork.Empenho.Update(empenho);

            _unitOfWork.NotaFiscal.Add(NotaFiscalObj.NotaFiscal);

            _unitOfWork.Save();

            //Insere Média Combustível, se houver
            //===================================
            if (NotaFiscalObj.NotaFiscal.TipoNF == "Combustível")
            {
                DateTime DataEmissao = (DateTime)NotaFiscalObj.NotaFiscal.DataEmissao;

                //Adiciona Gasolina
                MediaCombustivelObj = new MediaCombustivel();
                MediaCombustivelObj.CombustivelId = Guid.Parse("F668F660-8380-4DF3-90CD-787DB06FE734");
                MediaCombustivelObj.NotaFiscalId = NotaFiscalObj.NotaFiscal.NotaFiscalId;
                MediaCombustivelObj.Ano = (int)NotaFiscalObj.NotaFiscal.AnoReferencia;
                MediaCombustivelObj.Mes = (int)NotaFiscalObj.NotaFiscal.MesReferencia;
                MediaCombustivelObj.PrecoMedio = NotaFiscalObj.NotaFiscal.MediaGasolina;
                _unitOfWork.MediaCombustivel.Add(MediaCombustivelObj);

                //Adiciona Diesel
                MediaCombustivelObj = new MediaCombustivel();
                MediaCombustivelObj.CombustivelId = Guid.Parse("A69AA86A-9162-4242-AB9A-8B184E04C4DA");
                MediaCombustivelObj.NotaFiscalId = NotaFiscalObj.NotaFiscal.NotaFiscalId;
                MediaCombustivelObj.Ano = (int)NotaFiscalObj.NotaFiscal.AnoReferencia;
                MediaCombustivelObj.Mes = (int)NotaFiscalObj.NotaFiscal.MesReferencia;
                MediaCombustivelObj.PrecoMedio = NotaFiscalObj.NotaFiscal.MediaDiesel;
                _unitOfWork.MediaCombustivel.Add(MediaCombustivelObj);

            }

            //Insere valor de Pessoal, se houver
            //===================================
            if (NotaFiscalObj.NotaFiscal.TipoNF == "Terceirização")
            {
                CustoItensObj = new CustoMensalItensContrato();
                CustoItensObj.NotaFiscalId = NotaFiscalObj.NotaFiscal.NotaFiscalId;
                CustoItensObj.CustoMensalOperador = (double)NotaFiscalObj.NotaFiscal.CustoMensalOperador;
                CustoItensObj.CustoMensalMotorista = (double)NotaFiscalObj.NotaFiscal.CustoMensalMotorista;
                CustoItensObj.CustoMensalLavador = (double)NotaFiscalObj.NotaFiscal.CustoMensalLavador;
                CustoItensObj.Ano = (int)NotaFiscalObj.NotaFiscal.AnoReferencia;
                CustoItensObj.Mes = (int)NotaFiscalObj.NotaFiscal.MesReferencia;
                _unitOfWork.CustoMensalItensContrato.Add(CustoItensObj);
            }

            _unitOfWork.Save();

            _notyf.Success("Nota Fiscal inserida com sucesso!", 3);


            return RedirectToPage("./Index");
        }

        public IActionResult OnPostEdit(Guid id)
        {
            if (!ModelState.IsValid)
            {
                SetViewModel();
                NotaFiscalObj.NotaFiscal.NotaFiscalId = id;
                return Page();
            }

            NotaFiscalObj.NotaFiscal.NotaFiscalId = id;

            //Verifica se existe uma outra nota fiscal com o mesmo número para o mesmo empenho
            var existeNotaFiscal = _unitOfWork.NotaFiscal.GetFirstOrDefault(u => (u.NumeroNF == NotaFiscalObj.NotaFiscal.NumeroNF) && (u.EmpenhoId == NotaFiscalObj.NotaFiscal.EmpenhoId));
            if (existeNotaFiscal != null && existeNotaFiscal.NotaFiscalId != NotaFiscalObj.NotaFiscal.NotaFiscalId)
            {
                _notyf.Error("Já existe uma Nota Fiscal com esse número!", 3);
                SetViewModel();
                NotaFiscalObj.NotaFiscal.NotaFiscalId = id;
                return Page();
            }

            if (NotaFiscalObj.NotaFiscal.ValorGlosa > NotaFiscalObj.NotaFiscal.ValorNF)
            {
                _notyf.Error("O valor da Glosa não pode ser superior ao valor da Nota Fiscal!", 3);
                SetViewModel();
                NotaFiscalObj.NotaFiscal.NotaFiscalId = id;
                return Page();
            }

            //Atualiza Valor do Empenho
            //=========================

            var objNotaAtual = _unitOfWork.NotaFiscal.GetFirstOrDefault(u => (u.NotaFiscalId == NotaFiscalObj.NotaFiscal.NotaFiscalId));

            double diferencaValorNF = 0;
            if (NotaFiscalObj.NotaFiscal.ValorNF > objNotaAtual.ValorNF)
            {
                diferencaValorNF = (double)(NotaFiscalObj.NotaFiscal.ValorNF - objNotaAtual.ValorNF);
            }
            else if (NotaFiscalObj.NotaFiscal.ValorNF < objNotaAtual.ValorNF)
            {
                diferencaValorNF = (double)(objNotaAtual.ValorNF - NotaFiscalObj.NotaFiscal.ValorNF);
            }

            double diferencaValorGlosa = 0;
            if (NotaFiscalObj.NotaFiscal.ValorGlosa > objNotaAtual.ValorGlosa)
            {
                diferencaValorGlosa = (double)(NotaFiscalObj.NotaFiscal.ValorGlosa - objNotaAtual.ValorGlosa);
            }
            else if (NotaFiscalObj.NotaFiscal.ValorGlosa < objNotaAtual.ValorGlosa)
            {
                diferencaValorGlosa = (double)(objNotaAtual.ValorGlosa - NotaFiscalObj.NotaFiscal.ValorGlosa);
            }

            var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u => (u.EmpenhoId == NotaFiscalObj.NotaFiscal.EmpenhoId));
            empenho.SaldoFinal = empenho.SaldoFinal - (diferencaValorNF - diferencaValorGlosa);
            _unitOfWork.Empenho.Update(empenho);

            _unitOfWork.NotaFiscal.Update(NotaFiscalObj.NotaFiscal);
            _unitOfWork.Save();


            //Insere Média Combustível, se houver
            //===================================
            if (NotaFiscalObj.NotaFiscal.TipoNF == "Combustível")
            {
                int anoReferencia = (int)NotaFiscalObj.NotaFiscal.AnoReferencia;
                int mesReferencia = (int)NotaFiscalObj.NotaFiscal.MesReferencia;

                int ano = anoReferenciaAnterior;
                int mes = mesReferenciaAnterior;

                var mediagasolinaObj = _unitOfWork.MediaCombustivel.GetFirstOrDefault(mc => (mc.NotaFiscalId == NotaFiscalObj.NotaFiscal.NotaFiscalId) && (mc.CombustivelId == Guid.Parse("F668F660-8380-4DF3-90CD-787DB06FE734")) && (mc.Ano == ano) && (mc.Mes == mes));
                _unitOfWork.MediaCombustivel.Remove(mediagasolinaObj);

                var mediadieselObj = _unitOfWork.MediaCombustivel.GetFirstOrDefault(mc => (mc.NotaFiscalId == NotaFiscalObj.NotaFiscal.NotaFiscalId) && (mc.CombustivelId == Guid.Parse("A69AA86A-9162-4242-AB9A-8B184E04C4DA")) && (mc.Ano == ano) && (mc.Mes == mes));
                _unitOfWork.MediaCombustivel.Remove(mediadieselObj);

                if (anoReferencia != anoReferenciaAnterior || mesReferencia != mesReferenciaAnterior)
                {

                    //Adiciona Gasolina
                    MediaCombustivelObj = new MediaCombustivel();
                    MediaCombustivelObj.CombustivelId = Guid.Parse("F668F660-8380-4DF3-90CD-787DB06FE734");
                    MediaCombustivelObj.NotaFiscalId = NotaFiscalObj.NotaFiscal.NotaFiscalId;
                    MediaCombustivelObj.Ano = (int)NotaFiscalObj.NotaFiscal.AnoReferencia;
                    MediaCombustivelObj.Mes = (int)NotaFiscalObj.NotaFiscal.MesReferencia;
                    MediaCombustivelObj.PrecoMedio = NotaFiscalObj.NotaFiscal.MediaGasolina;
                    _unitOfWork.MediaCombustivel.Add(MediaCombustivelObj);

                    //Adiciona Diesel
                    MediaCombustivelObj = new MediaCombustivel();
                    MediaCombustivelObj.CombustivelId = Guid.Parse("A69AA86A-9162-4242-AB9A-8B184E04C4DA");
                    MediaCombustivelObj.NotaFiscalId = NotaFiscalObj.NotaFiscal.NotaFiscalId;
                    MediaCombustivelObj.Ano = (int)NotaFiscalObj.NotaFiscal.AnoReferencia;
                    MediaCombustivelObj.Mes = (int)NotaFiscalObj.NotaFiscal.MesReferencia;
                    MediaCombustivelObj.PrecoMedio = NotaFiscalObj.NotaFiscal.MediaDiesel;
                    _unitOfWork.MediaCombustivel.Add(MediaCombustivelObj);

                }
                else
                {
                    //Adiciona Gasolina
                    MediaCombustivelObj = new MediaCombustivel();
                    MediaCombustivelObj.CombustivelId = Guid.Parse("F668F660-8380-4DF3-90CD-787DB06FE734");
                    MediaCombustivelObj.NotaFiscalId = NotaFiscalObj.NotaFiscal.NotaFiscalId;
                    MediaCombustivelObj.Ano = (int)NotaFiscalObj.NotaFiscal.AnoReferencia;
                    MediaCombustivelObj.Mes = (int)NotaFiscalObj.NotaFiscal.MesReferencia;
                    MediaCombustivelObj.PrecoMedio = NotaFiscalObj.NotaFiscal.MediaGasolina;
                    _unitOfWork.MediaCombustivel.Add(MediaCombustivelObj);

                    //Adiciona Diesel
                    MediaCombustivelObj = new MediaCombustivel();
                    MediaCombustivelObj.CombustivelId = Guid.Parse("A69AA86A-9162-4242-AB9A-8B184E04C4DA");
                    MediaCombustivelObj.NotaFiscalId = NotaFiscalObj.NotaFiscal.NotaFiscalId;
                    MediaCombustivelObj.Ano = (int)NotaFiscalObj.NotaFiscal.AnoReferencia;
                    MediaCombustivelObj.Mes = (int)NotaFiscalObj.NotaFiscal.MesReferencia;
                    MediaCombustivelObj.PrecoMedio = NotaFiscalObj.NotaFiscal.MediaDiesel;
                    _unitOfWork.MediaCombustivel.Add(MediaCombustivelObj);
                }
            }

            //Insere valor de Pessoal, se houver
            //===================================
            if (NotaFiscalObj.NotaFiscal.TipoNF == "Terceirização")
            {
                int anoReferencia = (int)NotaFiscalObj.NotaFiscal.AnoReferencia;
                int mesReferencia = (int)NotaFiscalObj.NotaFiscal.MesReferencia;

                int ano = anoReferenciaAnterior;
                int mes = mesReferenciaAnterior;

                if (anoReferencia != anoReferenciaAnterior || mesReferencia != mesReferenciaAnterior)
                {

                    var RemoveItensObj = _unitOfWork.CustoMensalItensContrato.GetFirstOrDefault(cm => (cm.NotaFiscalId == NotaFiscalObj.NotaFiscal.NotaFiscalId) && (cm.Ano == ano) && (cm.Mes == mes));
                    _unitOfWork.CustoMensalItensContrato.Remove(RemoveItensObj);

                    CustoItensObj = new CustoMensalItensContrato();
                    CustoItensObj.NotaFiscalId = NotaFiscalObj.NotaFiscal.NotaFiscalId;
                    CustoItensObj.CustoMensalOperador = (double)NotaFiscalObj.NotaFiscal.CustoMensalOperador;
                    CustoItensObj.CustoMensalMotorista = (double)NotaFiscalObj.NotaFiscal.CustoMensalMotorista;
                    CustoItensObj.CustoMensalLavador = (double)NotaFiscalObj.NotaFiscal.CustoMensalLavador;
                    CustoItensObj.Ano = (int)NotaFiscalObj.NotaFiscal.AnoReferencia;
                    CustoItensObj.Mes = (int)NotaFiscalObj.NotaFiscal.MesReferencia;
                    _unitOfWork.CustoMensalItensContrato.Add(CustoItensObj);

                }
                else
                {
                    var RemoveItensObj = _unitOfWork.CustoMensalItensContrato.GetFirstOrDefault(cm => (cm.NotaFiscalId == NotaFiscalObj.NotaFiscal.NotaFiscalId) && (cm.Ano == ano) && (cm.Mes == mes));
                    _unitOfWork.CustoMensalItensContrato.Remove(RemoveItensObj);

                    CustoItensObj = new CustoMensalItensContrato();
                    CustoItensObj.NotaFiscalId = NotaFiscalObj.NotaFiscal.NotaFiscalId;
                    CustoItensObj.CustoMensalOperador = (double)NotaFiscalObj.NotaFiscal.CustoMensalOperador;
                    CustoItensObj.CustoMensalMotorista = (double)NotaFiscalObj.NotaFiscal.CustoMensalMotorista;
                    CustoItensObj.CustoMensalLavador = (double)NotaFiscalObj.NotaFiscal.CustoMensalLavador;
                    CustoItensObj.Ano = (int)NotaFiscalObj.NotaFiscal.AnoReferencia;
                    CustoItensObj.Mes = (int)NotaFiscalObj.NotaFiscal.MesReferencia;
                    _unitOfWork.CustoMensalItensContrato.Add(CustoItensObj);
                }
            }

            _notyf.Success("Nota Fiscal atualizada com sucesso!", 3);

            _unitOfWork.Save();

            return RedirectToPage("./Index");
        }

        //Preenche DDList de Veículos
        //==============================================================
        class VeiculoData
        {
            public Guid VeiculoId { get; set; }
            public string Descricao { get; set; }
        }

        public void PreencheListaVeiculos()
        {
            var ListaVeiculos = (from v in _unitOfWork.Veiculo.GetAll(v => (v.ContratoId == null && v.AtaId == null))
                                 join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                                 join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                                 where v.Status = true
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

    }


}
