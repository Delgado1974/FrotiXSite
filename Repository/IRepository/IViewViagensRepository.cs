using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository.IRepository
{
    public interface IViewViagensRepository : IRepository<ViewViagens>
    {

        IEnumerable<SelectListItem> GetViewViagensListForDropDown();

        void Update(ViewViagens viewViagens);

    }
}
