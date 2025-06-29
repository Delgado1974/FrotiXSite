using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Unidade
{
    public class LotacaoMotoristas : PageModel
    {

        public static IUnitOfWork _unitOfWork;


        public static void Initialize(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public LotacaoMotoristas(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public void OnGet()
        {

        }
    }

    public class ListaUnidades
    {
        public Guid UnidadeId { get; set; }
        public string Descricao { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaUnidades()
        {

        }

        public ListaUnidades(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaUnidades> UnidadesList()
        {
            List<ListaUnidades> unidades = new List<ListaUnidades>();


            var result = _unitOfWork.Unidade.GetAll().OrderBy(u => u.Descricao);

            foreach (var unidade in result)
            {
                unidades.Add(new ListaUnidades { Descricao = unidade.Descricao , UnidadeId = unidade.UnidadeId});
            }

            return unidades;

        }

    }

    public class ListaMudanças
    {
        public string MudancaId { get; set; }
        public string Descricao { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaMudanças()
        {

        }

        public ListaMudanças(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaMudanças> MudançasList()
        {
            List<ListaMudanças> mudancas = new List<ListaMudanças>();

            mudancas.Add(new ListaMudanças { Descricao = "Férias", MudancaId = "Férias" });
            mudancas.Add(new ListaMudanças { Descricao = "Cobertura", MudancaId = "Cobertura" });
            mudancas.Add(new ListaMudanças { Descricao = "Retorno", MudancaId = "Retorno" });
            mudancas.Add(new ListaMudanças { Descricao = "Devolução", MudancaId = "Devolução" });
            mudancas.Add(new ListaMudanças { Descricao = "À Pedido", MudancaId = "À Pedido" });
            mudancas.Add(new ListaMudanças { Descricao = "Lotação Inicial", MudancaId = "Lotação Inicial" });
            mudancas.Add(new ListaMudanças { Descricao = "Desligamento", MudancaId = "Desligamento" });

            return mudancas;

        }

    }

}
