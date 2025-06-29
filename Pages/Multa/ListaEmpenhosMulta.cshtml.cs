using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Multa
{
    public class ListaEmpenhosMultaModel : PageModel
    {
        public static IUnitOfWork _unitOfWork;

        public ListaEmpenhosMultaModel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public static void Initialize(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public void OnGet()
        {
        }
    }

    public class ListaOrgaoAutuante
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaOrgaoAutuante()
        {

        }

        public ListaOrgaoAutuante(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaOrgaoAutuante> OrgaoAutuanteList()
        {
            List<ListaOrgaoAutuante> orgaosautuantes = new List<ListaOrgaoAutuante>();


            var result = _unitOfWork.OrgaoAutuante.GetAll().OrderBy(n => n.Nome);

            foreach (var orgao in result)
            {
                orgaosautuantes.Add(new ListaOrgaoAutuante { Descricao = orgao.Nome + " (" + orgao.Sigla + ")", Id = orgao.OrgaoAutuanteId });
            }

            return orgaosautuantes;
        }
    }

}
