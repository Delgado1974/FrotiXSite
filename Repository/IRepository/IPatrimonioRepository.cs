﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Models.Cadastros;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository.IRepository
{
    public interface IPatrimonioRepository : IRepository<Patrimonio>
    {

        IEnumerable<SelectListItem> GetPatrimonioListForDropDown();

        void Update(Patrimonio patrimonio);

    }
}
