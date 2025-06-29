using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Ocorrencia
{
    public class OcorrenciasModel : PageModel
    {

        public static IUnitOfWork _unitOfWork;

        public static void Initialize(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public OcorrenciasModel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public void OnGet()
        {

        }
    }

    
    public class ListaVeiculosOcorrencias
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaVeiculosOcorrencias()
        {

        }

        public ListaVeiculosOcorrencias(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaVeiculosOcorrencias> VeiculosList()
        {
            List<ListaVeiculosOcorrencias> veiculos = new List<ListaVeiculosOcorrencias>();

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
                veiculos.Add(new ListaVeiculosOcorrencias { Descricao = veiculo.Descricao, Id = veiculo.Id });
            }

            return veiculos;
        }
    }

    public class ListaMotoristaOcorrencias
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaMotoristaOcorrencias()
        {

        }

        public ListaMotoristaOcorrencias(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaMotoristaOcorrencias> MotoristaList()
        {
            List<ListaMotoristaOcorrencias> motoristas = new List<ListaMotoristaOcorrencias>();


            var result = _unitOfWork.ViewMotoristas.GetAll().OrderBy(n => n.Nome);

            foreach (var motorista in result)
            {
                motoristas.Add(new ListaMotoristaOcorrencias { Descricao = motorista.MotoristaCondutor, Id = motorista.MotoristaId });
            }

            return motoristas;
        }
    }


    public class ListaUnidadeOcorrencias
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaUnidadeOcorrencias()
        {

        }

        public ListaUnidadeOcorrencias(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaUnidadeOcorrencias> UnidadeList()
        {
            List<ListaUnidadeOcorrencias> unidades = new List<ListaUnidadeOcorrencias>();


            var result = _unitOfWork.Unidade.GetAll().OrderBy(n => n.Descricao);

            foreach (var unidade in result)
            {
                unidades.Add(new ListaUnidadeOcorrencias { Descricao = unidade.Descricao, Id = unidade.UnidadeId });
            }

            return unidades;
        }
    }




    public class ListaStatusOcorrencias
    {
        public string Status { get; set; }
        public string StatusId { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaStatusOcorrencias()
        {

        }

        public ListaStatusOcorrencias(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaStatusOcorrencias> StatusList()
        {
            List<ListaStatusOcorrencias> status = new List<ListaStatusOcorrencias>();

            status.Add(new ListaStatusOcorrencias { Status = "Todas", StatusId = "Todas" });
            status.Add(new ListaStatusOcorrencias { Status = "Abertas", StatusId = "Aberta" });
            status.Add(new ListaStatusOcorrencias { Status = "Baixadas", StatusId = "Baixada" });
            status.Add(new ListaStatusOcorrencias { Status = "Pendentes", StatusId = "Pendente" });
            status.Add(new ListaStatusOcorrencias { Status = "Manutenção", StatusId = "Manutenção" });

            return status;
        }
    }

    //public class ListaSetoresOcorrencias
    //{
    //    public Guid SetorSolicitanteId { get; set; }
    //    public Guid? SetorPaiId { get; set; }
    //    public bool HasChild { get; set; }
    //    public string Sigla { get; set; }
    //    public bool Expanded { get; set; }
    //    public bool IsSelected { get; set; }
    //    public string Nome { get; set; }

    //    private readonly IUnitOfWork _unitOfWork;

    //    public ListaSetoresOcorrencias()
    //    {

    //    }

    //    public ListaSetoresOcorrencias(IUnitOfWork unitOfWork)
    //    {
    //        _unitOfWork = unitOfWork;
    //    }

    //    public List<ListaSetoresOcorrencias> SetoresList()
    //    {
    //        //    Preenche Treeview de Setores
    //        //================================
    //        var objSetores = _unitOfWork.ViewSetores.GetAll();
    //        Guid setorPai = Guid.Empty;
    //        bool temFilho;
    //        List<ListaSetoresOcorrencias> TreeDataSource = new List<ListaSetoresOcorrencias>();

    //        //string setorid = "2fd11a87-69e6-4f36-04c7-08d97d2150db";

    //        //TreeDataSource.Add(new ListaSetores
    //        //{
    //        //    SetorSolicitanteId = Guid.Parse(setorid),
    //        //    Nome = "Seção Administrativa",
    //        //    //Sigla = setor.Sigla
    //        //});


    //        foreach (var setor in objSetores)
    //        {
    //            temFilho = false;
    //            var objFromDb = _unitOfWork.ViewSetores.GetFirstOrDefault(u => u.SetorPaiId == setor.SetorSolicitanteId);

    //            if (objFromDb != null)
    //            {
    //                temFilho = true;
    //            }
    //            if (setor.SetorPaiId != Guid.Empty)
    //            {
    //                if (temFilho)
    //                {
    //                    if (setor.SetorPaiId != Guid.Empty)
    //                    {
    //                        TreeDataSource.Add(new ListaSetoresOcorrencias
    //                        {
    //                            SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
    //                            SetorPaiId = setor.SetorPaiId,
    //                            Nome = setor.Nome,
    //                            HasChild = true,
    //                            //Sigla = setor.Sigla
    //                        });
    //                    }
    //                    else
    //                    {
    //                        TreeDataSource.Add(new ListaSetoresOcorrencias
    //                        {
    //                            SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
    //                            Nome = setor.Nome,
    //                            HasChild = true,
    //                            //Sigla = setor.Sigla
    //                        });
    //                    }
    //                }
    //                else
    //                {
    //                    TreeDataSource.Add(new ListaSetoresOcorrencias
    //                    {
    //                        SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
    //                        SetorPaiId = setor.SetorPaiId,
    //                        Nome = setor.Nome,
    //                        //Sigla = setor.Sigla
    //                    });
    //                }
    //            }
    //            else
    //            {
    //                if (temFilho)
    //                {
    //                    TreeDataSource.Add(new ListaSetoresOcorrencias
    //                    {
    //                        SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
    //                        Nome = setor.Nome,
    //                        HasChild = true,
    //                        //Sigla = setor.Sigla
    //                    });
    //                }
    //            }

    //        }

    //        return TreeDataSource;

    //    }

    //}

}
