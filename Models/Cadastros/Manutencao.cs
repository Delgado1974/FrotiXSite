using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Models
{

    public class ManutencaoViewModel
    {
        public Guid ManutencaoId { get; set; }
        public Manutencao Manutencao { get; set; }
    }

    public class Manutencao
    {

        [Key]
        public Guid ManutencaoId { get; set; }

        [StringLength(50, ErrorMessage = "O nº da OS não pode exceder 50 caracteres")]
        [Display(Name = "Número da OS")]
        public string? NumOS { get; set; }

        [DataType(DataType.DateTime)]
        [Display(Name = "Data da Solicitação")]
        public DateTime? DataSolicitacao { get; set; }

        [DataType(DataType.DateTime)]
        [Display(Name = "Data de Recolhimento")]
        public DateTime? DataRecolhimento { get; set; }

        [DataType(DataType.DateTime)]
        [Display(Name = "Data de Entrega")]
        public DateTime? DataEntrega { get; set; }

        [DataType(DataType.DateTime)]
        [Display(Name = "Data da Devolução")]
        public DateTime? DataDevolucao { get; set; }

        [DataType(DataType.DateTime)]
        [Display(Name = "Data da Entrega do Reserva")]
        public DateTime? DataRecebimentoReserva { get; set; }

        [DataType(DataType.DateTime)]
        [Display(Name = "Data da Devolução do Reserva")]
        public DateTime? DataDevolucaoReserva { get; set; }

        [Display(Name = "Carro Reserva")]
        public bool? ReservaEnviado { get; set; }

        [Display(Name = "Man.Preventiva")]
        public bool? ManutencaoPreventiva { get; set; }

        [Display(Name = "Quilometragem Manutenção")]
        public int? QuilometragemManutencao { get; set; }

        [StringLength(500, ErrorMessage = "O resumo da OS não pode exceder 500 caracteres")]
        [Display(Name = "Resumo da OS")]
        public string? ResumoOS { get; set; }

        [Display(Name = "Status")]
        public string? StatusOS { get; set; }

        [Display(Name = "IdUsuarioAlteracao")]
        public string IdUsuarioAlteracao { get; set; }

        [Display(Name = "Veículo")]
        public Guid? VeiculoId { get; set; }

        [ForeignKey("VeiculoId")]
        public virtual Veiculo Veiculo { get; set; }

        [Display(Name = "Veículo Reserva")]
        public Guid? VeiculoReservaId { get; set; }

        [ForeignKey("VeiculoReservaId ")]
        public virtual Veiculo VeiculoReserva { get; set; }

    }
}
