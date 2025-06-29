using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Manutencao
{
    public class ControleLavagemModel : PageModel
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

        public ControleLavagemModel(IUnitOfWork unitOfWork)
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

    public class ListaNivelCombustivel
    {
        public string Nivel { get; set; }
        public string Descricao { get; set; }
        public string Imagem { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaNivelCombustivel()
        {

        }

        public ListaNivelCombustivel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaNivelCombustivel> NivelCombustivelList()
        {
            List<ListaNivelCombustivel> niveis = new List<ListaNivelCombustivel>();

            niveis.Add(new ListaNivelCombustivel
            {
                Nivel = "tanquevazio",
                Descricao = "Vazio",
                Imagem = "../images/tanquevazio.png"
            });

            niveis.Add(new ListaNivelCombustivel
            {
                Nivel = "tanqueumquarto",
                Descricao = "1/4",
                Imagem = "../images/tanqueumquarto.png"
            });

            niveis.Add(new ListaNivelCombustivel
            {
                Nivel = "tanquemeiotanque",
                Descricao = "1/2",
                Imagem = "../images/tanquemeiotanque.png"
            });

            niveis.Add(new ListaNivelCombustivel
            {
                Nivel = "tanquetresquartos",
                Descricao = "3/4",
                Imagem = "../images/tanquetresquartos.png"
            });

            niveis.Add(new ListaNivelCombustivel
            {
                Nivel = "tanquecheio",
                Descricao = "Cheio",
                Imagem = "../images/tanquecheio.png"
            });

            return niveis;
        }
    }

    public class ListaVeiculos
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaVeiculos()
        {

        }

        public ListaVeiculos(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaVeiculos> VeiculosList()
        {
            List<ListaVeiculos> veiculos = new List<ListaVeiculos>();

            var result = (from v in _unitOfWork.Veiculo.GetAll()
                          join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                          join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                          orderby v.Placa
                          select new
                          {
                              Id = v.VeiculoId,

                              Descricao = v.PlacaVinculada == null ? v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo : v.Placa + " (" + v.PlacaVinculada + ") - " + ma.DescricaoMarca + "/" + m.DescricaoModelo,

                          }).OrderBy(v => v.Descricao);

            foreach (var veiculo in result)
            {
                veiculos.Add(new ListaVeiculos { Descricao = veiculo.Descricao, Id = veiculo.Id });
            }

            return veiculos;
        }
    }

    public class ListaMotorista
    {
        public string Descricao { get; set; }
        public Guid Id { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaMotorista()
        {

        }

        public ListaMotorista(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaMotorista> MotoristaList()
        {
            List<ListaMotorista> motoristas = new List<ListaMotorista>();


            var result = _unitOfWork.ViewMotoristas.GetAll().OrderBy(n => n.Nome);

            foreach (var motorista in result)
            {
                motoristas.Add(new ListaMotorista { Descricao = motorista.MotoristaCondutor, Id = motorista.MotoristaId });
            }

            return motoristas;
        }
    }


    public class ListaLavador
    {
        public string Nome { get; set; }
        public Guid LavadorId { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaLavador()
        {

        }
        public ListaLavador(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaLavador> LavadorList()
        {
            List<ListaLavador> lavadores = new List<ListaLavador>();


            var result = _unitOfWork.Lavador.GetAll().OrderBy(n => n.Nome);

            foreach (var lavador in result)
            {
                lavadores.Add(new ListaLavador { Nome = (lavador.Nome ), LavadorId = lavador.LavadorId });
            }

            return lavadores;
        }
    }




    public class ListaStatus
    {
        public string Status { get; set; }
        public string StatusId { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaStatus()
        {

        }

        public ListaStatus(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaStatus> StatusList()
        {
            List<ListaStatus> status = new List<ListaStatus>();

            status.Add(new ListaStatus { Status = "Todas", StatusId = "Todas" });
            status.Add(new ListaStatus { Status = "Abertas", StatusId = "Aberta" });
            status.Add(new ListaStatus { Status = "Realizadas", StatusId = "Realizada" });
            status.Add(new ListaStatus { Status = "Canceladas", StatusId = "Cancelada" });

            return status;
        }
    }

    public class ListaSetores
    {
        public Guid SetorSolicitanteId { get; set; }
        public Guid? SetorPaiId { get; set; }
        public bool HasChild { get; set; }
        public string Sigla { get; set; }
        public bool Expanded { get; set; }
        public bool IsSelected { get; set; }
        public string Nome { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaSetores()
        {

        }

        public ListaSetores(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaSetores> SetoresList()
        {
            //    Preenche Treeview de Setores
            //================================
            var objSetores = _unitOfWork.ViewSetores.GetAll();
            Guid setorPai = Guid.Empty;
            bool temFilho;
            List<ListaSetores> TreeDataSource = new List<ListaSetores>();

            //string setorid = "2fd11a87-69e6-4f36-04c7-08d97d2150db";

            //TreeDataSource.Add(new ListaSetores
            //{
            //    SetorSolicitanteId = Guid.Parse(setorid),
            //    Nome = "Seção Administrativa",
            //    //Sigla = setor.Sigla
            //});


            foreach (var setor in objSetores)
            {
                temFilho = false;
                var objFromDb = _unitOfWork.ViewSetores.GetFirstOrDefault(u => u.SetorPaiId == setor.SetorSolicitanteId);

                if (objFromDb != null)
                {
                    temFilho = true;
                }
                if (setor.SetorPaiId != Guid.Empty)
                {
                    if (temFilho)
                    {
                        if (setor.SetorPaiId != Guid.Empty)
                        {
                            TreeDataSource.Add(new ListaSetores
                            {
                                SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                SetorPaiId = setor.SetorPaiId,
                                Nome = setor.Nome,
                                HasChild = true,
                                //Sigla = setor.Sigla
                            });
                        }
                        else
                        {
                            TreeDataSource.Add(new ListaSetores
                            {
                                SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                Nome = setor.Nome,
                                HasChild = true,
                                //Sigla = setor.Sigla
                            });
                        }
                    }
                    else
                    {
                        TreeDataSource.Add(new ListaSetores
                        {
                            SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                            SetorPaiId = setor.SetorPaiId,
                            Nome = setor.Nome,
                            //Sigla = setor.Sigla
                        });
                    }
                }
                else
                {
                    if (temFilho)
                    {
                        TreeDataSource.Add(new ListaSetores
                        {
                            SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                            Nome = setor.Nome,
                            HasChild = true,
                            //Sigla = setor.Sigla
                        });
                    }
                }

            }

            return TreeDataSource;

        }

    }

}
