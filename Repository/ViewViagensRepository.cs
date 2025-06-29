using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository
{
    public class ViewViagensRepository : Repository<ViewViagens>, IViewViagensRepository
    {
        private readonly FrotiXDbContext _db;

        public ViewViagensRepository(FrotiXDbContext db) : base(db)
        {
            _db = db;
        }

        public IEnumerable<SelectListItem> GetViewViagensListForDropDown()
        {
            return _db.ViewViagens
            .OrderBy(o => o.DataInicial)
            .Select(i => new SelectListItem()
            {
                Text = i.DataInicial.ToString(),
                Value = i.ViagemId.ToString()
            }); ; ;
        }

        public void Update(ViewViagens viewViagens)
        {
            var objFromDb = _db.ViewViagens.FirstOrDefault(s => s.ViagemId == viewViagens.ViagemId);

            _db.Update(viewViagens);
            _db.SaveChanges();

        }


    }
}
