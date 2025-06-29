using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Stimulsoft.Report.Mvc;
using Stimulsoft.Report;


namespace FrotiX.Pages.SetorSolicitante
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

        public class TreeGridItems
        {
            public TreeGridItems() { }
            public Guid SetorSolicitanteId { get; set; }
            public string Nome { get; set; }
            public string Sigla { get; set; }
            public int Ramal { get; set; }
            public string Status { get; set; }
            public Guid? SetorPaiId { get; set; }

            public static List<TreeGridItems> GetSelfData()
            {

                var ListaSetores = _unitOfWork.SetorSolicitante.GetAll();

                List<TreeGridItems> BusinessObjectCollection = new List<TreeGridItems>();

                string status = "";
                string sigla = "";

                foreach (var setor in ListaSetores)
                {
                    status = "Inativo";
                    sigla = "";

                    if ((bool)setor.Status)
                    {
                        status = "Ativo";
                    }
                    if (setor.Sigla != null)
                    {
                        sigla = setor.Sigla;
                    }

                    BusinessObjectCollection.Add(new TreeGridItems()
                    {
                        SetorSolicitanteId = setor.SetorSolicitanteId,
                        Nome = setor.Nome,
                        Sigla = sigla,
                        Ramal = (int)setor.Ramal,
                        Status = status,
                        SetorPaiId = setor.SetorPaiId
                    });

                }

                return BusinessObjectCollection;
            }
        }
    }
}
