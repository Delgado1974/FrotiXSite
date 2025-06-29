using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace FrotiX.Repository
{
    public class ViagemRepository : Repository<Viagem>, IViagemRepository
    {
        private readonly FrotiXDbContext _db;

        public ViagemRepository(FrotiXDbContext db) : base(db)
        {
            _db = db;
        }

        public IEnumerable<SelectListItem> GetViagemListForDropDown()
        {
            return _db.Viagem
                .OrderBy(o => o.DataInicial)
                .Select(i => new SelectListItem()
                {
                    Text = i.DataInicial.ToString(),
                    Value = i.ViagemId.ToString()
                });
        }

        public void Update(Viagem viagem)
        {
            var objFromDb = _db.Viagem.FirstOrDefault(s => s.ViagemId == viagem.ViagemId);

            _db.Update(viagem);
            _db.SaveChanges();

        }

        public async Task<List<string>> GetDistinctOrigensAsync()
        {
            return await _db.Viagem
                .Where(v => !string.IsNullOrWhiteSpace(v.Origem))
                .Select(v => v.Origem.Trim())
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();
        }

        public async Task<List<string>> GetDistinctDestinosAsync()
        {
            return await _db.Viagem
                .Where(v => !string.IsNullOrWhiteSpace(v.Destino))
                .Select(v => v.Destino.Trim())
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();
        }

        public async Task CorrigirOrigemAsync(List<string> origensAntigas, string novaOrigem)
        {
            if (string.IsNullOrWhiteSpace(novaOrigem) || !origensAntigas.Any()) return;

            var origensNormalizadas = origensAntigas
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => x.Trim().ToLowerInvariant())
                .ToList();

            var viagens = await _db.Viagem
                .Where(v => !string.IsNullOrWhiteSpace(v.Origem))
                .ToListAsync();

            var viagensParaCorrigir = viagens
                .Where(v => origensNormalizadas.Contains(v.Origem.Trim().ToLowerInvariant()))
                .ToList();

            foreach (var viagem in viagensParaCorrigir)
            {
                viagem.Origem = novaOrigem;
            }

            await _db.SaveChangesAsync();
        }

        public async Task CorrigirDestinoAsync(List<string> destinosAntigos, string novoDestino)
        {
            if (string.IsNullOrWhiteSpace(novoDestino) || !destinosAntigos.Any()) return;

            var destinosNormalizados = destinosAntigos
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => x.Trim().ToLowerInvariant())
                .ToList();

            var viagens = await _db.Viagem
                .Where(v => !string.IsNullOrWhiteSpace(v.Destino))
                .ToListAsync();

            var viagensParaCorrigir = viagens
                .Where(v => destinosNormalizados.Contains(v.Destino.Trim().ToLowerInvariant()))
                .ToList();

            foreach (var viagem in viagensParaCorrigir)
            {
                viagem.Destino = novoDestino;
            }

            await _db.SaveChangesAsync();
        }
    }
}
