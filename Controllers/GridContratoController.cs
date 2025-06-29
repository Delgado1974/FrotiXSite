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
    public class GridContratoController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public static List<ItensVeiculo> veiculo = new List<ItensVeiculo>();

        public class objItem
        {
            Guid RepactuacaoContratoId { get; set; }
        }

        public GridContratoController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [Route("DataSource")]
        [HttpGet]
        public IActionResult DataSource()
        {
            var veiculo = ItensVeiculo.GetAllRecords(_unitOfWork);

            return Json(veiculo);
        }

    }

    public class ItensVeiculo
    {

        public static List<ItensVeiculo> veiculo = new List<ItensVeiculo>();

        public ItensVeiculo(int numitem, string descricao, int quantidade, double valorunitario, double valortotal, Guid repactuacaoId)
            {
                this.numitem = numitem;
                this.descricao = descricao;
                this.quantidade = quantidade;
                this.valorunitario = valorunitario;
                this.valortotal = valortotal;
                this.repactuacaoId = repactuacaoId;
            }

        public static List<ItensVeiculo> GetAllRecords(IUnitOfWork _unitOfWork)
        {

            var objItemVeiculos = _unitOfWork.ItemVeiculoContrato.GetAll().OrderBy(o => o.NumItem);

            veiculo.Clear();

            foreach (var item in objItemVeiculos)
            {
                veiculo.Add(new ItensVeiculo((int)item.NumItem, item.Descricao, (int)item.Quantidade, (double)item.ValorUnitario, (double)(item.Quantidade * item.ValorUnitario), item.RepactuacaoContratoId));
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
