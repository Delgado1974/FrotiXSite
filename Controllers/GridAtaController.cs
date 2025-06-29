using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FrotiX.Models;
using FrotiX.Repository.IRepository;

namespace FrotiX.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public class GridAtaController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public static List<ItensVeiculoAta> veiculo = new List<ItensVeiculoAta>();

        public class objItem
        {
            Guid RepactuacaoAtaId { get; set; }
        }

        public GridAtaController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [Route("DataSourceAta")]
        [HttpGet]
        public IActionResult DataSourceAta()
        {
            var veiculo = ItensVeiculoAta.GetAllRecords(_unitOfWork);

            return Json(veiculo);
        }

    }

    public class ItensVeiculoAta
    {

        public static List<ItensVeiculoAta> veiculo = new List<ItensVeiculoAta>();

        public ItensVeiculoAta(int numitem, string descricao, int quantidade, double valorunitario, double valortotal, Guid repactuacaoId)
            {
                this.numitem = numitem;
                this.descricao = descricao;
                this.quantidade = quantidade;
                this.valorunitario = valorunitario;
                this.valortotal = valortotal;
                this.repactuacaoId = repactuacaoId;
            }

        public static List<ItensVeiculoAta> GetAllRecords(IUnitOfWork _unitOfWork)
        {

            var objItemVeiculos = _unitOfWork.ItemVeiculoAta.GetAll().OrderBy(o => o.NumItem);

            veiculo.Clear();

            foreach (var item in objItemVeiculos)
            {
                veiculo.Add(new ItensVeiculoAta((int)item.NumItem, item.Descricao, (int)item.Quantidade, (double)item.ValorUnitario, (double)(item.Quantidade * item.ValorUnitario), item.RepactuacaoAtaId));
            }

            return veiculo;
        }

            public int? numitem { get; set; }
            public string descricao { get; set; }
            public int? quantidade { get; set; }
            public double? valorunitario { get; set; }
            public double? valortotal { get; set; }
            public Guid? repactuacaoId { get; set; }
    }
  }
