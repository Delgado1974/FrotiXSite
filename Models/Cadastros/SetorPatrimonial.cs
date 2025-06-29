using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Rendering;
using FrotiX.Services;
using FrotiX.Validations;

namespace FrotiX.Models.Cadastros
{
    public class SetorPatrimonial
    {
        [Key]
        public Guid SetorId { get; set; }

        [StringLength(50, ErrorMessage = "O Nome do Setor não pode exceder 50 caracteres")]
        [Required(ErrorMessage = "(Obrigatória)")]

        [Display(Name = "Nome do Setor")]
        public string NomeSetor { get; set; }

        [Required]
        public string DetentorId { get; set; }

        [Required]
        public bool Status { get; set; }
    }
}
