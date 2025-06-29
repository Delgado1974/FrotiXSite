using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Text.Json;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VeiculosUnidadeController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public VeiculosUnidadeController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult Get(Guid? id)
        {
            var result = (from v in _unitOfWork.Veiculo.GetAll()
                          join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                          join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                          join u in _unitOfWork.Unidade.GetAll() on v.UnidadeId equals u.UnidadeId
                          join c in _unitOfWork.Combustivel.GetAll() on v.CombustivelId equals c.CombustivelId
                          join ct in _unitOfWork.Contrato.GetAll() on v.ContratoId equals ct.ContratoId
                          join f in _unitOfWork.Fornecedor.GetAll() on ct.FornecedorId equals f.FornecedorId
                          join us in _unitOfWork.AspNetUsers.GetAll() on v.UsuarioIdAlteracao equals us.Id
                          where v.UnidadeId == FrotiX.Pages.Unidade.VeiculosUnidadeModel.unidadeId
                          select new {
                              v.VeiculoId,
                              v.Placa,
                              MarcaModelo = ma.DescricaoMarca + "/" + m.DescricaoModelo,
                              u.Sigla,
                              CombustivelDescricao = c.Descricao,
                              ContratoVeiculo = ct.AnoContrato + "/" + ct.NumeroContrato + " - " + f.DescricaoFornecedor,
                              v.Status,
                              DatadeAlteracao = v.DataAlteracao.ToString("dd/MM/yy"),
                              us.NomeCompleto,
                              u.UnidadeId
                          }).ToList();


            return Json(new { data = result });
        }

        [Route("Delete")]
        [HttpPost]        
        public IActionResult Delete(VeiculoViewModel model)
        {
            if (model != null && model.VeiculoId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.VeiculoId == model.VeiculoId);
                if (objFromDb != null)
                {
                    objFromDb.UnidadeId = null;
                    _unitOfWork.Veiculo.Update(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Veículo removido com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar veículo" });
        }
    }
}
