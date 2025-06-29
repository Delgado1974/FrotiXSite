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
    public class EventoRepository : Repository<Evento>, IEventoRepository
    {
        private readonly FrotiXDbContext _db;

        public EventoRepository(FrotiXDbContext db) : base(db)
        {
            _db = db;
        }

        public IEnumerable<SelectListItem> GetEventoListForDropDown()
        {
            return _db.Evento
            .OrderBy(o => o.Nome)
            .Select(i => new SelectListItem()
            {
                Text = i.Nome,
                Value = i.EventoId.ToString()
            }); ;
        }

        public void Update(Evento evento)
        {
            var objFromDb = _db.Evento.FirstOrDefault(s => s.EventoId == evento.EventoId);

            _db.Update(evento);
            _db.SaveChanges();

        }


    }
}
