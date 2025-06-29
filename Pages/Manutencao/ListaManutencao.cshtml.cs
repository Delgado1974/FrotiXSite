using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Manutencao
{
    public class ListaManutencaoModel : PageModel
    {

        public static IUnitOfWork _unitOfWork;

        public static void Initialize(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public ListaManutencaoModel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public void OnGet()
        {

        }
    }

    
    public class ListaVeiculosManutencao
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaVeiculosManutencao()
        {

        }

        public ListaVeiculosManutencao(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaVeiculosManutencao> VeiculosList()
        {
            List<ListaVeiculosManutencao> veiculos = new List<ListaVeiculosManutencao>();

            var result = (from v in _unitOfWork.Veiculo.GetAll()
                          join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                          join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                          orderby v.Placa
                          select new
                          {
                              Id = v.VeiculoId,

                              Descricao = v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo,

                          }).OrderBy(v => v.Descricao);

            foreach (var veiculo in result)
            {
                veiculos.Add(new ListaVeiculosManutencao { Descricao = veiculo.Descricao, Id = veiculo.Id });
            }

            return veiculos;
        }
    }


    public class ListaVeiculosReservaManutencao
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaVeiculosReservaManutencao()
        {

        }

        public ListaVeiculosReservaManutencao(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaVeiculosReservaManutencao> VeiculosReservaList()
        {
            List<ListaVeiculosReservaManutencao> veiculos = new List<ListaVeiculosReservaManutencao>();

            var result = (from v in _unitOfWork.Veiculo.GetAll()
                          join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                          join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                          where v.Reserva == true
                          orderby v.Placa
                          select new
                          {
                              Id = v.VeiculoId,

                              Descricao = v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo,

                          }).OrderBy(v => v.Descricao);

            foreach (var veiculo in result)
            {
                veiculos.Add(new ListaVeiculosReservaManutencao { Descricao = veiculo.Descricao, Id = veiculo.Id });
            }

            return veiculos;
        }
    }




    public class ListaStatusManutencao
    {
        public string Status { get; set; }
        public string StatusId { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaStatusManutencao()
        {

        }

        public ListaStatusManutencao(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaStatusManutencao> StatusList()
        {
            List<ListaStatusManutencao> status = new List<ListaStatusManutencao>();

            status.Add(new ListaStatusManutencao { Status = "Todas", StatusId = "Todas" });
            status.Add(new ListaStatusManutencao { Status = "Abertas", StatusId = "Aberta" });
            status.Add(new ListaStatusManutencao { Status = "Fechadas", StatusId = "Fechada" });

            return status;
        }
    }

}
