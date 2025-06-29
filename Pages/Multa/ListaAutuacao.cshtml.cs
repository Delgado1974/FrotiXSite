using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Multa
{
    public class ListaMultaModel : PageModel
    {

        public static IUnitOfWork _unitOfWork;

        public static byte[] PDFAutuacao;

        public static byte[] PDFNotificacao;

        public static Guid MultaId;


        [BindProperty]
        public Models.MultaViewModel MultaObj { get; set; }

        public static void Initialize(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public ListaMultaModel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public void OnGet()
        {

        }
    }

}
