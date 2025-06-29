using FrotiX.Models;
using FrotiX.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Helpers
{
    public class ListaFinalidade
    {
        public string Descricao { get; set; }
        public string FinalidadeId { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaFinalidade()
        {

        }

        public ListaFinalidade(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaFinalidade> FinalidadesList()
        {
            List<ListaFinalidade> finalidades = new List<ListaFinalidade>();

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Transporte de Funcionários",
                Descricao = "Transporte de Funcionários",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Transporte de Convidados",
                Descricao = "Transporte de Convidados",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Transporte de Materiais/Cargas",
                Descricao = "Transporte de Materiais/Cargas",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Economildo Norte(Cefor)",
                Descricao = "Economildo Norte(Cefor)",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Economildo Sul(PGR)",
                Descricao = "Economildo Sul(PGR)",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Economildo Rodoviária",
                Descricao = "Economildo Rodoviária",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Mesa (carros pretos)",
                Descricao = "Mesa (carros pretos)",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "TV/Rádio Câmara",
                Descricao = "TV/Rádio Câmara",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Aeroporto",
                Descricao = "Aeroporto",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Saída para Manutenção",
                Descricao = "Saída para Manutenção",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Chegada da Manutenção",
                Descricao = "Chegada da Manutenção",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Abastecimento",
                Descricao = "Abastecimento",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Recebimento da Locadora",
                Descricao = "Recebimento da Locadora",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Devolução à Locadora",
                Descricao = "Devolução à Locadora",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Saída Programada",
                Descricao = "Saída Programada",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Evento",
                Descricao = "Evento",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Ambulância",
                Descricao = "Ambulância",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Enviado Depol",
                Descricao = "Enviado Depol",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Demanda Política",
                Descricao = "Demanda Política",
            });

            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Passaporte",
                Descricao = "Passaporte",
            });
            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Aviso",
                Descricao = "Aviso",
            });
            finalidades.Add(new ListaFinalidade
            {
                FinalidadeId = "Cursos Depol",
                Descricao = "Cursos Depol",
            });




            return finalidades;
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
        public Guid VeiculoId { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaVeiculos()
        {

        }

        public ListaVeiculos(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public IEnumerable<ListaVeiculos> VeiculosList()
        {
            var veiculos = (from v in _unitOfWork.Veiculo.GetAllReduced(
                includeProperties: nameof(ModeloVeiculo) + "," + nameof(MarcaVeiculo),
                selector: v => new { v.VeiculoId, v.Placa, v.MarcaVeiculo.DescricaoMarca, v.ModeloVeiculo.DescricaoModelo, v.Status })
                            where v.Status == true
                            select new ListaVeiculos

                            {
                                VeiculoId = v.VeiculoId,
                                Descricao = v.Placa + " - " + v.DescricaoMarca + "/" + v.DescricaoModelo,
                            }).OrderBy(v => v.Descricao);

            return veiculos;
        }
    }

    public class ListaMotorista
    {
        public Guid MotoristaId { get; set; }
        public string Nome { get; set; }
        public string FotoBase64 { get; set; } // Agora é string diretamente
        public bool Status { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaMotorista()
        {
        }

        public ListaMotorista(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public IEnumerable<ListaMotorista> MotoristaList()
        {
            var motoristas = _unitOfWork.ViewMotoristas.GetAllReduced(
                orderBy: m => m.OrderBy(m => m.Nome),
                selector: motorista => new ListaMotorista
                {
                    MotoristaId = motorista.MotoristaId,
                    Nome = motorista.MotoristaCondutor,
                    FotoBase64 = motorista.Foto != null
                        ? $"data:image/jpeg;base64,{Convert.ToBase64String(motorista.Foto)}"
                        : null,
                    Status = motorista.Status
                });

            return motoristas.Where(m => m.Status == true);
        }
    }


    public class ListaRequisitante
    {
        public string Requisitante { get; set; }
        public Guid RequisitanteId { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaRequisitante()
        {

        }

        public ListaRequisitante(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public IEnumerable<ListaRequisitante> RequisitantesList()
        {
            var requisitantes = _unitOfWork.ViewRequisitantes.GetAllReduced(
               orderBy: n => n.OrderBy(n => n.Requisitante),
               selector: r => new ListaRequisitante
               {
                   Requisitante = r.Requisitante,
                   RequisitanteId = (Guid)r.RequisitanteId
               });

            return requisitantes;
        }
    }

    public class ListaEvento
    {
        public string Evento { get; set; }
        public Guid EventoId { get; set; }
        public string Status { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaEvento()
        {

        }

        public ListaEvento(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public IEnumerable<ListaEvento> EventosList()
        {
            var eventos = _unitOfWork.Evento.GetAllReduced(
                orderBy: n => n.OrderBy(n => n.Nome),
                selector: n => new ListaEvento { Evento = n.Nome, EventoId = n.EventoId, Status = n.Status });

            return eventos.Where(e => e.Status == "1");
        }
    }


    public class ListaSetores
    {
        public string SetorSolicitanteId { get; set; }
        public string? SetorPaiId { get; set; }
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
            // 2023/09/14 Improves logic when getting all setores.
            // 2023/09/14 Reduces the amount of attributes to bring from the database.
            var objSetores = _unitOfWork.ViewSetores.GetAllReduced(selector: x => new { x.SetorPaiId, x.SetorSolicitanteId, x.Nome });
            List<ListaSetores> TreeDataSource = new List<ListaSetores>();

            foreach (var setor in objSetores)
            {
                var temFilho = objSetores.Any(u => u.SetorPaiId == setor.SetorSolicitanteId);

                if (setor.SetorPaiId != Guid.Empty)
                {
                    if (temFilho)
                    {
                        if (setor.SetorPaiId != Guid.Empty)
                        {
                            TreeDataSource.Add(new ListaSetores
                            {
                                SetorSolicitanteId = (setor.SetorSolicitanteId).ToString(),
                                SetorPaiId = (setor.SetorPaiId).ToString(),
                                Nome = setor.Nome,
                                HasChild = true,
                                //Sigla = setor.Sigla
                            }); ; ;
                        }
                        else
                        {
                            TreeDataSource.Add(new ListaSetores
                            {
                                SetorSolicitanteId = (setor.SetorSolicitanteId).ToString(),
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
                            SetorSolicitanteId = (setor.SetorSolicitanteId).ToString(),
                            SetorPaiId = (setor.SetorPaiId).ToString(),
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
                            SetorSolicitanteId = (setor.SetorSolicitanteId).ToString(),
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

    public class ListaSetoresEvento
    {
        public string SetorSolicitanteId { get; set; }
        public string Nome { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaSetoresEvento()
        {

        }

        public ListaSetoresEvento(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaSetoresEvento> SetoresEventoList()
        {
            //    Preenche Treeview de Setores
            //================================
            var objSetores = _unitOfWork.SetorSolicitante.GetAll();
            List<ListaSetoresEvento> TreeDataSource = new List<ListaSetoresEvento>();

            foreach (var setor in objSetores)
            {
                TreeDataSource.Add(new ListaSetoresEvento
                {
                    SetorSolicitanteId = (setor.SetorSolicitanteId).ToString(),
                    Nome = setor.Nome + "(" + setor.Sigla + ")"
                });

            }

            return TreeDataSource;

        }
    }
    public class ListaDias
    {
        public string DiaId { get; set; }
        public string Dia { get; set; }

        private readonly IUnitOfWork _unitOfWork;

        public ListaDias()
        {

        }

        public ListaDias(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<ListaDias> DiasList()
        {
            //    Preenche Combo de Dias
            //================================
            List<ListaDias> TreeDataSource = new List<ListaDias>();

            TreeDataSource.Add(new ListaDias
            {
                DiaId = "Monday",
                Dia = "Segunda"
            });

            TreeDataSource.Add(new ListaDias
            {
                DiaId = "Tuesday",
                Dia = "Terça"
            });

            TreeDataSource.Add(new ListaDias
            {
                DiaId = "Wednesday",
                Dia = "Quarta"
            });

            TreeDataSource.Add(new ListaDias
            {
                DiaId = "Thursday",
                Dia = "Quinta"
            });

            TreeDataSource.Add(new ListaDias
            {
                DiaId = "Friday",
                Dia = "Sexta"
            });

            TreeDataSource.Add(new ListaDias
            {
                DiaId = "Saturday",
                Dia = "Sábado"
            });

            TreeDataSource.Add(new ListaDias
            {
                DiaId = "Sunday",
                Dia = "Domingo"
            });

            return TreeDataSource;

        }
    }

    public class ListaPeriodos
    {
        public string PeriodoId { get; set; }
        public string Periodo { get; set; }

        public ListaPeriodos()
        {

        }

        public List<ListaPeriodos> PeriodosList()
        {
            //    Preenche Combo de Períodos
            //================================
            List<ListaPeriodos> TreeDataSource = new List<ListaPeriodos>();

            TreeDataSource.Add(new ListaPeriodos
            {
                PeriodoId = "D",
                Periodo = "Diário"
            });

            TreeDataSource.Add(new ListaPeriodos
            {
                PeriodoId = "S",
                Periodo = "Semanal"
            });

            TreeDataSource.Add(new ListaPeriodos
            {
                PeriodoId = "Q",
                Periodo = "Quinzenal"
            });

            TreeDataSource.Add(new ListaPeriodos
            {
                PeriodoId = "M",
                Periodo = "Mensal"
            });

            return TreeDataSource;

        }
    }

    public class ListaRecorrente
    {
        public string RecorrenteId { get; set; }
        public string Recorrente { get; set; }

        public ListaRecorrente()
        {

        }

        public List<ListaRecorrente> RecorrenteList()
        {
            //    Preenche Combo de Períodos
            //================================
            List<ListaRecorrente> TreeDataSource = new List<ListaRecorrente>();

            TreeDataSource.Add(new ListaRecorrente
            {
                RecorrenteId = "S",
                Recorrente = "Sim"
            });

            TreeDataSource.Add(new ListaRecorrente
            {
                RecorrenteId = "N",
                Recorrente = "Não"
            });

            return TreeDataSource;

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
}