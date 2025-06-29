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
    public class PlacaBronzeViewModel
    {
        public Guid PlacaBronzeId { get; set; }
        public PlacaBronze PlacaBronze { get; set; }

        [NotMapped]
        [ValidateNever]
        [Display(Name = "Veículo Associado")]
        public Guid VeiculoId { get; set; }
    }

    public class PlacaBronze
    {

        [Key]
        public Guid PlacaBronzeId { get; set; }

        [StringLength(100, ErrorMessage = "A descrição não pode exceder 100 caracteres")]
        [Required(ErrorMessage ="(A descrição da placa é obrigatória)")]
        [Display(Name ="Placa de Bronze")]
        public string DescricaoPlaca { get; set; }

        [Display(Name = "Ativo/Inativo")]
        public bool Status { get; set; }

    }
}
