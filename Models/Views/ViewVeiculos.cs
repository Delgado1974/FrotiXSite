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
    public class ViewVeiculos
    {

        public Guid VeiculoId { get; set; }

        public string? Placa { get; set; }

        public string? MarcaModelo { get; set; }

        public string? Sigla { get; set; }

        public string? Descricao { get; set; }

        public decimal? Consumo { get; set; }

        public string? Quilometragem { get; set; }

        public string? OrigemVeiculo { get; set; }

        public string? DataAlteracao { get; set; }

        public string? NomeCompleto { get; set; }

        public string? VeiculoReserva { get; set; }

        public bool? Status { get; set; }

        public Guid? CombustivelId { get; set; }

    }
}
