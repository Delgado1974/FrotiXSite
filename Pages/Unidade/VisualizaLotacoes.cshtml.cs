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
    public class VisualizaLotacoes : PageModel
    {

        public static IUnitOfWork _unitOfWork;


        public static void Initialize(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public VisualizaLotacoes(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public void OnGet()
        {

        }
    }


    public class ListaCategoria
    {
        public string Categoria { get; set; }
        public string CategoriaId { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaCategoria()
        {

        }

        public ListaCategoria(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaCategoria> CategoriasList()
        {
            List<ListaCategoria> status = new List<ListaCategoria>();

            status.Add(new ListaCategoria { Categoria = "Presidência", CategoriaId = "Presidência" });
            status.Add(new ListaCategoria { Categoria = "Mesa", CategoriaId = "Mesa" });
            status.Add(new ListaCategoria { Categoria = "DG", CategoriaId = "DG" });
            status.Add(new ListaCategoria { Categoria = "SGM", CategoriaId = "SGM" });
            status.Add(new ListaCategoria { Categoria = "Liderança", CategoriaId = "Liderança" });
            status.Add(new ListaCategoria { Categoria = "Secom", CategoriaId = "Secom" });
            status.Add(new ListaCategoria { Categoria = "SNE", CategoriaId = "SNE" });
            status.Add(new ListaCategoria { Categoria = "Fixos", CategoriaId = "Fixos" });
            status.Add(new ListaCategoria { Categoria = "Gerais", CategoriaId = "Gerais" });
            status.Add(new ListaCategoria { Categoria = "Depol", CategoriaId = "Depol" });

            return status;
        }
    }

}
