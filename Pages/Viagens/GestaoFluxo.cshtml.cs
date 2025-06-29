using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Viagens
{
    public class GestaoFluxoModel : PageModel
    {

        public static IUnitOfWork _unitOfWork;

        public static void Initialize(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public GestaoFluxoModel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public void OnGet()
        {

        }
    }

    
    public class ListaVeiculosMOB
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaVeiculosMOB()
        {

        }

        public ListaVeiculosMOB(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaVeiculosMOB> VeiculosList()
        {
            List<ListaVeiculosMOB> veiculos = new List<ListaVeiculosMOB>();

            var result = (from v in _unitOfWork.Veiculo.GetAll()
                          join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                          join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                          where (v.Categoria == "Coletivos Pequenos" || v.Categoria == "Ônibus") && (v.Economildo == true)
                          orderby v.Placa
                          select new
                          {
                              Id = v.VeiculoId,

                              Descricao = v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo,

                          }).OrderBy(v => v.Descricao);

            foreach (var veiculo in result)
            {
                veiculos.Add(new ListaVeiculosMOB { Descricao = veiculo.Descricao, Id = veiculo.Id });
            }

            return veiculos;
        }
    }

    public class ListaMotoristasMOB
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaMotoristasMOB()
        {

        }

        public ListaMotoristasMOB(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaMotoristasMOB> MotoristaList()
        {
            List<ListaMotoristasMOB> motoristas = new List<ListaMotoristasMOB>();

            var objMotorista = (from vm in _unitOfWork.ViewMotoristas.GetAll()

                                join ve in _unitOfWork.ViagensEconomildo.GetAll() on vm.MotoristaId equals ve.MotoristaId

                                select new
                                {
                                    vm.Nome,
                                    vm.TipoCondutor,
                                    vm.MotoristaId,
                                    vm.MotoristaCondutor,
                                }).Distinct().OrderBy(vm => vm.Nome);


            foreach (var motorista in objMotorista)
            {
                motoristas.Add(new ListaMotoristasMOB { Descricao = motorista.MotoristaCondutor, Id =  motorista.MotoristaId });
            }

            return motoristas;
        }
    }

}
