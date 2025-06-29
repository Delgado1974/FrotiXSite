﻿using System;
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
    public class ViewSetores
    {

        public Guid? SetorSolicitanteId { get; set; }

        public string? Nome { get; set; }

        public Guid? SetorPaiId { get; set; }

    }
}
