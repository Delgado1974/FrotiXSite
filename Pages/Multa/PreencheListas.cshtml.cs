using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Multa
{
    public class PreencheListasModel : PageModel
    {
        public static IUnitOfWork _unitOfWork;

        public static byte[] PDFAutuacao;

        public static byte[] PDFNotificacao;

        public static Guid MultaId;


        [BindProperty]
        public Models.MultaViewModel MultaObj { get; set; }

        public PreencheListasModel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public void OnGet()
        {
        }
    }

    public class ListaVeiculos
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaVeiculos()
        {

        }

        public ListaVeiculos(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaVeiculos> VeiculosList()
        {
            List<ListaVeiculos> veiculos = new List<ListaVeiculos>();

            var result = (from v in _unitOfWork.Veiculo.GetAll()
                          join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                          join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                          orderby v.Placa
                          select new
                          {
                              Id = v.VeiculoId,

                              Descricao = v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo,

                          }).OrderBy(v => v.Descricao);

            foreach (var veiculo in result)
            {
                veiculos.Add(new ListaVeiculos { Descricao = veiculo.Descricao, Id = veiculo.Id });
            }

            return veiculos;
        }
    }

    public class ListaMotorista
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaMotorista()
        {

        }

        public ListaMotorista(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaMotorista> MotoristaList()
        {
            List<ListaMotorista> motoristas = new List<ListaMotorista>();


            var result = _unitOfWork.ViewMotoristas.GetAll().OrderBy(n => n.Nome);

            foreach (var motorista in result)
            {
                motoristas.Add(new ListaMotorista { Descricao = motorista.MotoristaCondutor, Id = motorista.MotoristaId });
            }

            return motoristas;
        }
    }

    public class ListaOrgaoAutuanteMulta
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaOrgaoAutuanteMulta()
        {

        }

        public ListaOrgaoAutuanteMulta(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaOrgaoAutuanteMulta> OrgaoAutuanteList()
        {
            List<ListaOrgaoAutuanteMulta> orgaos = new List<ListaOrgaoAutuanteMulta>();


            var result = _unitOfWork.OrgaoAutuante.GetAll().OrderBy(o => o.Nome);

            foreach (var orgao in result)
            {
                orgaos.Add(new ListaOrgaoAutuanteMulta { Descricao = (orgao.Nome + " (" + orgao.Sigla + ")"), Id = orgao.OrgaoAutuanteId });
            }

            return orgaos;
        }
    }

    public class ListaTipoMulta
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaTipoMulta()
        {

        }

        public ListaTipoMulta(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaTipoMulta> TipoMultaList()
        {
            List<ListaTipoMulta> tiposmulta = new List<ListaTipoMulta>();


            var result = _unitOfWork.TipoMulta.GetAll().OrderBy(tm => tm.Artigo);

            foreach (var tipomulta in result)
            {
                tiposmulta.Add(new ListaTipoMulta { Descricao = ("(" + tipomulta.Artigo + ")" + "-(" + tipomulta.CodigoDenatran + "/" + tipomulta.Desdobramento + ")" + " - " + Servicos.ConvertHtml(tipomulta.Descricao)), Id = tipomulta.TipoMultaId });
            }

            return tiposmulta;
        }
    }


    public class ListaStatusAutuacao
    {
        public string Status { get; set; }
        public string StatusId { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaStatusAutuacao()
        {

        }

        public ListaStatusAutuacao(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaStatusAutuacao> StatusList()
        {
            List<ListaStatusAutuacao> status = new List<ListaStatusAutuacao>();

            status.Add(new ListaStatusAutuacao { Status = "Todas", StatusId = "Todas" });
            status.Add(new ListaStatusAutuacao { Status = "Pendente", StatusId = "Pendente" });
            status.Add(new ListaStatusAutuacao { Status = "Notificado", StatusId = "Notificado" });
            status.Add(new ListaStatusAutuacao { Status = "Reconhecido", StatusId = "Reconhecido" });

            return status;
        }
    }

    public class ListaStatusAutuacaoAlteracao
    {
        public string Status { get; set; }
        public string StatusId { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaStatusAutuacaoAlteracao()
        {

        }

        public ListaStatusAutuacaoAlteracao(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaStatusAutuacaoAlteracao> StatusList()
        {
            List<ListaStatusAutuacaoAlteracao> status = new List<ListaStatusAutuacaoAlteracao>();

            status.Add(new ListaStatusAutuacaoAlteracao { Status = "Pendente", StatusId = "Pendente" });
            status.Add(new ListaStatusAutuacaoAlteracao { Status = "Notificado", StatusId = "Notificado" });
            status.Add(new ListaStatusAutuacaoAlteracao { Status = "Reconhecido", StatusId = "Reconhecido" });

            return status;
        }
    }


    public class ListaStatusPenalidade
    {
        public string Status { get; set; }
        public string StatusId { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaStatusPenalidade()
        {

        }

        public ListaStatusPenalidade(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaStatusPenalidade> StatusList()
        {
            List<ListaStatusPenalidade> status = new List<ListaStatusPenalidade>();

            status.Add(new ListaStatusPenalidade { Status = "Todas", StatusId = "Todas" });
            status.Add(new ListaStatusPenalidade { Status = "À Pagar", StatusId = "À Pagar" });
            status.Add(new ListaStatusPenalidade { Status = "Paga (Defin)", StatusId = "Enviada Defin" });
            status.Add(new ListaStatusPenalidade { Status = "Paga (Infrator)", StatusId = "Paga (Infrator)" });
            status.Add(new ListaStatusPenalidade { Status = "À Enviar Secle", StatusId = "À Enviar Secle" });
            status.Add(new ListaStatusPenalidade { Status = "Enviada Secle", StatusId = "Enviada Secle" });
            status.Add(new ListaStatusPenalidade { Status = "Arquivada (Finalizada)", StatusId = "Arquivada (Finalizada)" });

            return status;
        }
    }

    public class ListaStatusPenalidadeAlteracao
    {
        public string Status { get; set; }
        public string StatusId { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaStatusPenalidadeAlteracao()
        {

        }

        public ListaStatusPenalidadeAlteracao(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaStatusPenalidadeAlteracao> StatusList()
        {
            List<ListaStatusPenalidadeAlteracao> status = new List<ListaStatusPenalidadeAlteracao>();

            status.Add(new ListaStatusPenalidadeAlteracao { Status = "Todas", StatusId = "Todas" });
            status.Add(new ListaStatusPenalidadeAlteracao { Status = "À Pagar", StatusId = "À Pagar" });
            status.Add(new ListaStatusPenalidadeAlteracao { Status = "Paga (Defin)", StatusId = "Enviada Defin" });
            status.Add(new ListaStatusPenalidadeAlteracao { Status = "Paga (Infrator)", StatusId = "Paga (Infrator)" });
            status.Add(new ListaStatusPenalidadeAlteracao { Status = "À Enviar Secle", StatusId = "À Enviar Secle" });
            status.Add(new ListaStatusPenalidadeAlteracao { Status = "Enviada Secle", StatusId = "Enviada Secle" });

            return status;
        }
    }


}
