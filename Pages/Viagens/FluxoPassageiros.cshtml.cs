using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Viagens
{
    public class FluxoPassageirosModel : PageModel
    {
        public static IUnitOfWork _unitOfWork;

        public static void Initialize(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public FluxoPassageirosModel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public void OnGet()
        {

  
        }


    }

    public class ListaEconomildos
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaEconomildos()
        {

        }

        public ListaEconomildos(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaEconomildos> VeiculosList()
        {
            List<ListaEconomildos> veiculos = new List<ListaEconomildos>();

            var result = (from v in _unitOfWork.Veiculo.GetAll()
                          join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                          join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                          where (v.Categoria == "Coletivos Pequenos" || v.Categoria == "Ônibus") && (v.Economildo == true)
                          select new
                          {
                              Id = v.VeiculoId,

                              Descricao = v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo,

                          }).OrderBy(v => v.Descricao);

            foreach (var veiculo in result)
            {
                veiculos.Add(new ListaEconomildos { Descricao = veiculo.Descricao, Id = veiculo.Id});
            }

            return veiculos;
        }

    }

    public class ListaMotoristaMOB
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaMotoristaMOB()
        {

        }

        public ListaMotoristaMOB(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaMotoristaMOB> MotoristaList()
        {
            List<ListaMotoristaMOB> motoristas = new List<ListaMotoristaMOB>();


            var objMotorista = _unitOfWork.ViewMotoristas.GetAll().OrderBy(n => n.Nome);

            foreach (var motorista in objMotorista)
            {
                motoristas.Add(new ListaMotoristaMOB { Descricao = motorista.MotoristaCondutor, Id = motorista.MotoristaId });
            }

            return motoristas;
        }
    }


}
