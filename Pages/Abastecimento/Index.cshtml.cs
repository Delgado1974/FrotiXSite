using System;
using System.Collections.Generic;
using System.Linq;
using FrotiX.Helpers;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Abastecimento
{
    public class IndexModel : PageModel
    {
        public static IUnitOfWork _unitOfWork;

        public static void Initialize(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public IndexModel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public void OnGet() { }
    }

    public class ListaVeiculos
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaVeiculos() { }

        public ListaVeiculos(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaVeiculos> VeiculosList()
        {
            List<ListaVeiculos> veiculos = new();
            try
            {
                var result = (
                    from v in _unitOfWork.Veiculo.GetAll()
                    join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                    join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                    orderby v.Placa
                    select new
                    {
                        Id = v.VeiculoId,
                        Descricao = v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo,
                    }
                ).OrderBy(v => v.Descricao);

                foreach (var veiculo in result)
                {
                    veiculos.Add(
                        new ListaVeiculos { Descricao = veiculo.Descricao, Id = veiculo.Id }
                    );
                }
            }
            catch (Exception ex)
            {
                // Aqui você pode armazenar ou retornar o erro como quiser
                throw new Exception(
                    ErroHelper.MontarScriptErro("ListaVeiculos", "VeiculosList", ex)
                );
            }

            return veiculos;
        }
    }

    public class ListaCombustivel
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaCombustivel() { }

        public ListaCombustivel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaCombustivel> CombustivelList()
        {
            List<ListaCombustivel> combustiveis = new();
            try
            {
                var result = _unitOfWork.Combustivel.GetAll();
                foreach (var combustivel in result)
                {
                    combustiveis.Add(
                        new ListaCombustivel
                        {
                            Descricao = combustivel.Descricao,
                            Id = combustivel.CombustivelId,
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                throw new Exception(
                    ErroHelper.MontarScriptErro("ListaCombustivel", "CombustivelList", ex)
                );
            }

            return combustiveis;
        }
    }

    public class ListaUnidade
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaUnidade() { }

        public ListaUnidade(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaUnidade> UnidadeList()
        {
            List<ListaUnidade> unidades = new();
            try
            {
                var result = _unitOfWork.Unidade.GetAll().OrderBy(d => d.Descricao);
                foreach (var unidade in result)
                {
                    unidades.Add(
                        new ListaUnidade { Descricao = unidade.Descricao, Id = unidade.UnidadeId }
                    );
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ErroHelper.MontarScriptErro("ListaUnidade", "UnidadeList", ex));
            }

            return unidades;
        }
    }

    public class ListaMotorista
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaMotorista() { }

        public ListaMotorista(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaMotorista> MotoristaList()
        {
            List<ListaMotorista> motoristas = new();
            try
            {
                var result = _unitOfWork.ViewMotoristas.GetAll().OrderBy(n => n.Nome);
                foreach (var motorista in result)
                {
                    motoristas.Add(
                        new ListaMotorista
                        {
                            Descricao = motorista.MotoristaCondutor,
                            Id = motorista.MotoristaId,
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                throw new Exception(
                    ErroHelper.MontarScriptErro("ListaMotorista", "MotoristaList", ex)
                );
            }

            return motoristas;
        }
    }
}
