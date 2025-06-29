using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Validations;
using Microsoft.AspNetCore.Http;

namespace FrotiX.Models
{
    public class ViagemViewModel
    {
        public Guid ViagemId { get; set; }
        public Viagem Viagem { get; set; }

        public string NomeUsuarioAgendamento { get; set; }
        public string NomeUsuarioCriacao { get; set; }
        public string NomeUsuarioFinalizacao { get; set; }
        public string NomeUsuarioCancelamento { get; set; }
        public string DataFinalizacao { get; set; }
        public string HoraFinalizacao { get; set; }
        public string? UsuarioIdCancelamento { get; set; }
        public DateTime? DataCancelamento { get; set; }
        public byte[]? FichaVistoria { get; set; }
    }

    public class ProcuraViagemViewModel
    {
        public Viagem Viagem { get; set; }
        public Guid VeiculoId { get; set; }
        public string Data { get; set; }
        public string Hora { get; set; }
        public int NoFichaVistoria { get; set; }
    }

    public class Viagem
    {
        [Key]
        public Guid ViagemId { get; set; }

        [DataType(DataType.DateTime)]
        [Display(Name = "Data Inicial")]
        public DateTime? DataInicial { get; set; }

        [Display(Name = "Data Final")]
        public DateTime? DataFinal { get; set; }

        [DataType(DataType.DateTime)]
        [Display(Name = "Hora de Início")]
        public DateTime? HoraInicio { get; set; }

        [DataType(DataType.DateTime)]
        [Display(Name = "Hora Fim")]
        public DateTime? HoraFim { get; set; }

        [Display(Name = "Combustível Inicial")]
        public string? CombustivelInicial { get; set; }

        [Display(Name = "Combustível Final")]
        public string? CombustivelFinal { get; set; }

        [Display(Name = "Descrição")]
        public string? Descricao { get; set; }

        [Display(Name = "Ramal")]
        public string? RamalRequisitante { get; set; }

        [Display(Name = "Km Inicial")]
        public int? KmInicial { get; set; }

        [Display(Name = "Km Final")]
        public int? KmFinal { get; set; }

        [Display(Name = "Km Atual")]
        public int? KmAtual { get; set; }

        [Display(Name = "Nº Ficha Vistoria")]
        public int? NoFichaVistoria { get; set; }

        [Display(Name = "Finalidade")]
        public string? Finalidade { get; set; }

        [Display(Name = "Nome do Evento")]
        public string? NomeEvento { get; set; }

        public string? Status { get; set; }

        public string? ResumoOcorrencia { get; set; }

        public string? DescricaoOcorrencia { get; set; }

        public string? DescricaoSolucaoOcorrencia { get; set; }

        public string? StatusOcorrencia { get; set; }

        public string? StatusDocumento { get; set; }

        public string? StatusCartaoAbastecimento { get; set; }

        public bool? StatusAgendamento { get; set; }

        public bool? FoiAgendamento { get; set; }

        [Display(Name = "Origem")]
        public string? Origem { get; set; }

        [Display(Name = "Destino")]
        public string? Destino { get; set; }

        public string? DescricaoSemFormato { get; set; }

        [Display(Name = "Usuário Requisitante")]
        public Guid? RequisitanteId { get; set; }

        [ForeignKey("RequisitanteId")]
        public virtual Requisitante Requisitante { get; set; }

        [Display(Name = "Setor Solicitante")]
        public Guid? SetorSolicitanteId { get; set; }

        [ForeignKey("SetorSolicitanteId")]
        public virtual SetorSolicitante SetorSolicitante { get; set; }

        [Display(Name = "Motorista")]
        public Guid? MotoristaId { get; set; }

        [ForeignKey("MotoristaId")]
        public virtual Motorista Motorista { get; set; }

        [Display(Name = "Veículo")]
        public Guid? VeiculoId { get; set; }

        [ForeignKey("VeiculoId")]
        public virtual Veiculo Veiculo { get; set; }

        [Display(Name = "Item Manutenção")]
        public Guid? ItemManutencaoId { get; set; }

        [ForeignKey("ItemManutencaoId")]
        public virtual ItensManutencao ItensManutencao { get; set; }

        public DateTime? DataCriacao { get; set; }

        public string? UsuarioIdCriacao { get; set; }

        public DateTime? DataFinalizacao { get; set; }

        public string? UsuarioIdFinalizacao { get; set; }

        public byte[]? FichaVistoria { get; set; }

        public string? Recorrente { get; set; }

        public Guid? RecorrenciaViagemId { get; set; }

        public string? Intervalo { get; set; }

        public DateTime? DataFinalRecorrencia { get; set; }

        public bool? Monday { get; set; }

        public bool? Tuesday { get; set; }

        public bool? Wednesday { get; set; }

        public bool? Thursday { get; set; }

        public bool? Friday { get; set; }

        public bool? Saturday { get; set; }

        public bool? Sunday { get; set; }

        [NotMapped]
        public IFormFile ArquivoFoto { get; set; }

        [NotMapped]
        public bool OperacaoBemSucedida { get; set; }

        public double? CustoCombustivel { get; set; }

        public double? CustoMotorista { get; set; }

        public double? CustoVeiculo { get; set; }

        public double? CustoOperador { get; set; }

        public double? CustoLavador { get; set; }

        public int? Minutos { get; set; }

        public string? ImagemOcorrencia { get; set; }

        [Display(Name = "Evento")]
        public Guid? EventoId { get; set; }

        [ForeignKey("EventoId")]
        public virtual Evento Evento { get; set; }

        public int? DiaMesRecorrencia { get; set; }

        public string? UsuarioIdAgendamento { get; set; }

        public DateTime? DataAgendamento { get; set; }

        public byte[] DescricaoViagemWord { get; set; }

        public byte[] DescricaoViagemImagem { get; set; }

        [NotMapped]
        public bool? editarTodosRecorrentes { get; set; }

        [NotMapped]
        public DateTime? EditarAPartirData { get; set; }

        public string? UsuarioIdCancelamento { get; set; }

        public DateTime? DataCancelamento { get; set; }

        public void AtualizarDados(AgendamentoViagem viagem)
        {
            this.DataInicial = viagem.DataInicial;
            this.HoraInicio = viagem.HoraInicio;
            this.Finalidade = viagem.Finalidade;
            this.Origem = viagem.Origem;
            this.Destino = viagem.Destino;
            this.MotoristaId = viagem.MotoristaId;
            this.VeiculoId = viagem.VeiculoId;
            this.RequisitanteId = viagem.RequisitanteId;
            this.RamalRequisitante = viagem.RamalRequisitante;
            this.SetorSolicitanteId = viagem.SetorSolicitanteId;
            this.Descricao = viagem.Descricao;
            this.StatusAgendamento = viagem.StatusAgendamento;
            this.FoiAgendamento = viagem.FoiAgendamento;
            this.Status = viagem.Status;
            this.DataFinal = viagem.DataFinal;
            this.HoraFim = viagem.HoraFim;
            this.NoFichaVistoria = viagem.NoFichaVistoria;
            this.EventoId = viagem.EventoId;
            this.KmAtual = viagem.KmAtual ?? 0;
            this.KmInicial = viagem.KmInicial ?? 0;
            this.KmFinal = viagem.KmFinal ?? 0;
            this.CombustivelInicial = viagem.CombustivelInicial;
            this.CombustivelFinal = viagem.CombustivelFinal;
            this.UsuarioIdCriacao = viagem.UsuarioIdCriacao;
            this.DataCriacao = viagem.DataCriacao;
            this.UsuarioIdFinalizacao = viagem.UsuarioIdFinalizacao;
            this.DataFinalizacao = viagem.DataFinalizacao;
            this.Recorrente = viagem.Recorrente;
            this.RecorrenciaViagemId = viagem.RecorrenciaViagemId;
            this.Intervalo = viagem.Intervalo;
            this.DataFinalRecorrencia = viagem.DataFinalRecorrencia;
            this.Monday = viagem.Monday;
            this.Tuesday = viagem.Tuesday;
            this.Wednesday = viagem.Wednesday;
            this.Thursday = viagem.Thursday;
            this.Friday = viagem.Friday;
            this.Saturday = viagem.Saturday;
            this.Sunday = viagem.Sunday;
            this.DiaMesRecorrencia = viagem.DiaMesRecorrencia;
            this.editarTodosRecorrentes = viagem.editarTodosRecorrentes;
            this.EditarAPartirData = viagem.EditarAPartirData;
        }
    }

    public class FinalizacaoViagem
    {
        public Guid ViagemId { get; set; }

        public DateTime? DataFinal { get; set; }

        public DateTime? HoraFim { get; set; }

        public string? CombustivelFinal { get; set; }

        public int? KmFinal { get; set; }

        public string? Descricao { get; set; }

        public string? ResumoOcorrencia { get; set; }

        public string? DescricaoOcorrencia { get; set; }

        public string? StatusOcorrencia { get; set; }

        public string? StatusDocumento { get; set; }

        public string? StatusCartaoAbastecimento { get; set; }

        public string? SolucaoOcorrencia { get; set; }

        [NotMapped]
        public IFormFile ArquivoFoto { get; set; }

        public string? ImagemOcorrencia { get; set; }
    }

    public class AjusteViagem
    {
        public Guid ViagemId { get; set; }

        public Guid? MotoristaId { get; set; }

        public Guid? VeiculoId { get; set; }

        public Guid? SetorSolicitanteId { get; set; }

        public Guid? EventoId { get; set; }

        public int? NoFichaVistoria { get; set; }

        public DateTime? DataInicial { get; set; }

        public DateTime? HoraInicial { get; set; }

        public int? KmInicial { get; set; }

        public DateTime? DataFinal { get; set; }

        public DateTime? HoraFim { get; set; }

        public int? KmFinal { get; set; }

        public string? Finalidade { get; set; }

        [NotMapped]
        public IFormFile ArquivoFoto { get; set; }
    }

    public class ViagemID
    {
        public Guid ViagemId { get; set; }
    }

    public class AgendamentoViagem
    {
        public Guid ViagemId { get; set; }
        public DateTime? DataInicial { get; set; }
        public DateTime? HoraInicio { get; set; }
        public DateTime? DataFinal { get; set; }
        public DateTime? HoraFim { get; set; }
        public string? Finalidade { get; set; }
        public string? Origem { get; set; }
        public string? Destino { get; set; }
        public Guid? MotoristaId { get; set; }
        public Guid? VeiculoId { get; set; }
        public Guid? RequisitanteId { get; set; }
        public string? RamalRequisitante { get; set; }
        public Guid? SetorSolicitanteId { get; set; }
        public string? Descricao { get; set; }
        public bool? StatusAgendamento { get; set; }
        public bool? FoiAgendamento { get; set; }
        public string? Status { get; set; }
        public Guid? EventoId { get; set; }
        public int? NoFichaVistoria { get; set; }
        public int? KmAtual { get; set; }
        public int? KmInicial { get; set; }
        public int? KmFinal { get; set; }
        public string? CombustivelInicial { get; set; }
        public string? CombustivelFinal { get; set; }
        public string? UsuarioIdCriacao { get; set; }
        public DateTime? DataCriacao { get; set; }
        public string? UsuarioIdFinalizacao { get; set; }
        public DateTime? DataFinalizacao { get; set; }
        public string? Recorrente { get; set; }
        public Guid? RecorrenciaViagemId { get; set; }
        public string? Intervalo { get; set; }
        public DateTime? DataFinalRecorrencia { get; set; }
        public bool? Monday { get; set; }
        public bool? Tuesday { get; set; }
        public bool? Wednesday { get; set; }
        public bool? Thursday { get; set; }
        public bool? Friday { get; set; }
        public bool? Saturday { get; set; }
        public bool? Sunday { get; set; }

        public List<DateTime>? DatasSelecionadas { get; set; }

        [NotMapped]
        public List<DateTime>? DataEspecifica { get; set; }

        [NotMapped]
        public bool OperacaoBemSucedida { get; set; }

        public int? DiaMesRecorrencia { get; set; }

        [NotMapped]
        public bool? editarTodosRecorrentes { get; set; }

        [NotMapped]
        public DateTime? EditarAPartirData { get; set; }

        [NotMapped]
        public bool? CriarViagemFechada { get; set; }
        public string UsuarioIdAgendamento { get; internal set; }
        public DateTime? DataAgendamento { get; internal set; }

        public string? UsuarioIdCancelamento { get; set; }

        public DateTime? DataCancelamento { get; set; }
    }
}
