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
    public class ContratoRepository : Repository<Contrato>, IContratoRepository
    {
        private readonly FrotiXDbContext _db;

        public ContratoRepository(FrotiXDbContext db) : base(db)
        {
            _db = db;
        }

        public IEnumerable<SelectListItem> GetContratoListForDropDown(string tipoContrato, int status)
        {
            if (tipoContrato != "")
            {
                return _db.Contrato
                .Where(s => (bool)s.Status)
                .Where(s => s.TipoContrato == tipoContrato)
                .Join(_db.Fornecedor, contrato => contrato.FornecedorId, fornecedor => fornecedor.FornecedorId, (contrato, fornecedor) => new { contrato, fornecedor })
                .OrderByDescending(o => o.contrato.AnoContrato + "/" + o.contrato.NumeroContrato + " - " + o.fornecedor.DescricaoFornecedor)
                .Select(i => new SelectListItem()
                {
                    Text = i.contrato.AnoContrato + "/" + i.contrato.NumeroContrato + " - " + i.fornecedor.DescricaoFornecedor,
                    Value = i.contrato.ContratoId.ToString()
                });
            }
            else
            {
                return _db.Contrato
                .Where(s => s.Status == Convert.ToBoolean(status))
                .Join(_db.Fornecedor, contrato => contrato.FornecedorId, fornecedor => fornecedor.FornecedorId, (contrato, fornecedor) => new { contrato, fornecedor })
                .OrderByDescending(o => o.contrato.AnoContrato + "/" + o.contrato.NumeroContrato + " - " + o.fornecedor.DescricaoFornecedor)
                .Select(i => new SelectListItem()
                {
                    Text = i.contrato.AnoContrato + "/" + i.contrato.NumeroContrato + " - " + i.fornecedor.DescricaoFornecedor + " (" + i.contrato.TipoContrato + ")",
                    Value = i.contrato.ContratoId.ToString()
                });
            }
        }

        public void Update(Contrato contrato)
        {
            var objFromDb = _db.Contrato.FirstOrDefault(s => s.ContratoId == contrato.ContratoId);

            _db.Update(contrato);
            _db.SaveChanges();

        }


    }
}
