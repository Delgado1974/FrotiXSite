using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Rendering;
using FrotiX.Services;
using FrotiX.Validations;
using Microsoft.AspNetCore.Http;

namespace FrotiX.Models
{
    public class CorridasTaxiLegViewModel
    {
        public Guid AbastecimentoId { get; set; }
        public Guid VeiculoId { get; set; }
        public Guid MotoristaId { get; set; }
        public Guid CombustivelId { get; set; }
    }

    public class CorridasTaxiLeg
    {

        [Key]
        public Guid CorridaId { get; set; }

        public string? Origem { get; set; }

        public string? Setor { get; set; }

        public string? DescSetor { get; set; }

        public string? Unidade { get; set; }

        public string? DescUnidade { get; set; }

        public int? QtdPassageiros { get; set; }

        public string? MotivoUso { get; set; }

        public DateTime? DataAgenda { get; set; }

        public string? HoraAgenda { get; set; }

        public string? HoraAceite { get; set; }

        public string? HoraLocal { get; set; }

        public string? HoraInicio { get; set; }

        public string? HoraFinal { get; set; }

        public double? KmReal { get; set; }

        public int? QtdEstrelas { get; set; }

        public string? Avaliacao { get; set; }

        public int? Duracao { get; set; }

        public int? Espera { get; set; }

    }
}
