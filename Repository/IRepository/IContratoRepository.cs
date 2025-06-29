using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository.IRepository
{
    public interface IContratoRepository: IRepository<Contrato>
    {

        IEnumerable<SelectListItem> GetContratoListForDropDown(string tipoContrato, int status);

        void Update(Contrato contrato);

    }
}
