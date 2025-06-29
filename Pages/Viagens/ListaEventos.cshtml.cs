using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Viagens
{
    public class ListaEventosModel : PageModel
    {

        public static IUnitOfWork _unitOfWork;

        public static byte[] FotoMotorista;

        public static IFormFile FichaVIstoria;

        public static Guid ViagemId;


        [BindProperty]
        public Models.ViagemViewModel ViagemObj { get; set; }

        public static void Initialize(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public ListaEventosModel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public void OnGet()
        {

        }

        class CombustivelData
        {
            public string Nivel { get; set; }
            public string Descricao { get; set; }
            public string Imagem { get; set; }
        }

        public void PreencheListaCombustivel()
        {

            List<CombustivelData> CombustivelDataSource = new List<CombustivelData>();

            CombustivelDataSource.Add(new CombustivelData
            {
                Nivel = "tanquevazio",
                Descricao = "Vazio",
                Imagem = "../images/tanquevazio.png"
            });

            CombustivelDataSource.Add(new CombustivelData
            {
                Nivel = "tanqueumquarto",
                Descricao = "1/4",
                Imagem = "../images/tanqueumquarto.png"
            });

            CombustivelDataSource.Add(new CombustivelData
            {
                Nivel = "tanquemeiotanque",
                Descricao = "1/2",
                Imagem = "../images/tanquemeiotanque.png"
            });

            CombustivelDataSource.Add(new CombustivelData
            {
                Nivel = "tanquetresquartos",
                Descricao = "3/4",
                Imagem = "../images/tanquetresquartos.png"
            });

            CombustivelDataSource.Add(new CombustivelData
            {
                Nivel = "tanquecheio",
                Descricao = "Cheio",
                Imagem = "../images/tanquecheio.png"
            });

            ViewData["dataCombustivel"] = CombustivelDataSource;

        }

    }

}
