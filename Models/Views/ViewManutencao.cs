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
    public class ViewManutencao
    {

        public Guid? ManutencaoId { get; set; }

        public Guid? VeiculoId { get; set; }

        public string? NumOS { get; set; }

        public string? DataSolicitacao { get; set; }

        public string? DataEntrega{ get; set; }

        public string? DataRecolhimento { get; set; }

        public string? DataDevolucao { get; set; }

        public string? DataRecebimentoReserva { get; set; }

        public string? DataDevolucaoReserva { get; set; }

        public string? ResumoOS { get; set; }

        public string? StatusOS { get; set; }

        public string? DescricaoVeiculo { get; set; }

        public string? Reserva { get; set; }

    }
}
