using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository.IRepository
{
    public interface IViagemRepository: IRepository<Viagem>
    {

        IEnumerable<SelectListItem> GetViagemListForDropDown();

        void Update(Viagem viagem);

        Task<List<string>> GetDistinctOrigensAsync();
        Task<List<string>> GetDistinctDestinosAsync();
        Task CorrigirOrigemAsync(List<string> origensAntigas, string novaOrigem);
        Task CorrigirDestinoAsync(List<string> destinosAntigos, string novoDestino);

    }
}
