using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Rendering;
using FrotiX.Services;
using FrotiX.Validations;
using Microsoft.EntityFrameworkCore.SqlServer.Query.Internal;

namespace FrotiX.Models
{
    public class MovimentacaoPatrimonioViewModel
    {
        public MovimentacaoPatrimonio MovimentacaoPatrimonio { get; set; }
        public Guid MovimentacaoPatrimonioId { get; set; }
        public Guid SecaoOrigemId { get; set; }
        public Guid SetorOrigemId { get; set; }
        public Guid SecaoDestinoId { get; set; }
        public Guid SetorDestinoId { get; set; }
        public Guid PatrimonioId { get; set; }
        public string NomeUsuarioAlteracao { get; set; }
        public string PatrimonioNome { get; set; }
        public string SetorOrigemNome { get; set; }
        public string SecaoOrigemNome { get; set;  }
        public string SetorDestinoNome { get; set; }
        public string SecaoDestinoNome { get; set; }

    }
    public class MovimentacaoPatrimonio
    {
        [Key]
        public Guid MovimentacaoPatrimonioId { get; set; }

        [DataType(DataType.DateTime)]
        [Display(Name = "Data")]
        public DateTime? DataMovimentacao { get; set; }

        [Required]
        public string ResponsavelMovimentacao { get; set; }

        [ForeignKey("SetorId")]
        public virtual Guid SetorOrigemId { get; set; }

        [ForeignKey("SetorId")]
        public virtual Guid SetorDestinoId { get; set; }

        [ForeignKey("SecaoId")]
        public virtual Guid SecaoOrigemId { get; set; }

        [ForeignKey("SecaoId")]
        public virtual Guid SecaoDestinoId { get; set; }

        [ForeignKey("PatrimonioId")]
        public virtual Guid PatrimonioId { get; set; }


    }

}
