using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace FrotiX.Repository.IRepository
{
    public interface IUnitOfWork : IDisposable
    {
        IUnidadeRepository Unidade { get; }
        ICombustivelRepository Combustivel { get; }
        IMarcaVeiculoRepository MarcaVeiculo { get; }
        IModeloVeiculoRepository ModeloVeiculo { get; }
        IVeiculoRepository Veiculo { get; }
        IFornecedorRepository Fornecedor { get; }
        IContratoRepository Contrato { get; }
        IVeiculoContratoRepository VeiculoContrato { get; }
        IVeiculoAtaRepository VeiculoAta { get; }
        IAspNetUsersRepository AspNetUsers { get; }
        IPlacaBronzeRepository PlacaBronze { get; }
        IAtaRegistroPrecosRepository AtaRegistroPrecos { get; }
        IMotoristaRepository Motorista { get; }
        IMotoristaContratoRepository MotoristaContrato { get; }
        ISetorSolicitanteRepository SetorSolicitante { get; }
        IRequisitanteRepository Requisitante { get; }
        IOperadorRepository Operador { get; }
        IOperadorContratoRepository OperadorContrato { get; }
        ILavadorRepository Lavador { get; }
        ILavadorContratoRepository LavadorContrato { get; }
        IEmpenhoRepository Empenho { get; }
        IMovimentacaoEmpenhoRepository MovimentacaoEmpenho { get; }
        INotaFiscalRepository NotaFiscal { get; }
        IAbastecimentoRepository Abastecimento { get; }
        IViagemRepository Viagem { get; }
        IMediaCombustivelRepository MediaCombustivel { get; }
        ITipoMultaRepository TipoMulta { get; }
        IOrgaoAutuanteRepository OrgaoAutuante { get; }
        ICustoMensalItensContratoRepository CustoMensalItensContrato { get; }
        IRepactuacaoContratoRepository RepactuacaoContrato { get; }
        IItemVeiculoContratoRepository ItemVeiculoContrato { get; }
        IRepactuacaoAtaRepository RepactuacaoAta { get; }
        IItemVeiculoAtaRepository ItemVeiculoAta { get; }
        IEmpenhoMultaRepository EmpenhoMulta { get; }
        IMultaRepository Multa { get; }
        IRegistroCupomAbastecimentoRepository RegistroCupomAbastecimento { get; }
        IManutencaoRepository Manutencao { get; }
        IItensManutencaoRepository ItensManutencao { get; }
        ILavagemRepository Lavagem { get; }
        ILavadoresLavagemRepository LavadoresLavagem { get; }
        ICorridasTaxiLegRepository CorridasTaxiLeg { get; }
        ICorridasCanceladasTaxiLegRepository CorridasCanceladasTaxiLeg { get; }
        IMovimentacaoEmpenhoMultaRepository MovimentacaoEmpenhoMulta { get; }
        IViagensEconomildoRepository ViagensEconomildo { get; }
        IEventoRepository Evento { get; }
        ILotacaoMotoristaRepository LotacaoMotorista { get; }
        IRepactuacaoTerceirizacaoRepository RepactuacaoTerceirizacao { get; }
        IRepactuacaoServicosRepository RepactuacaoServicos { get; }
        IRecursoRepository Recurso { get; }
        IControleAcessoRepository ControleAcesso { get; }

        ISecaoPatrimonialRepository SecaoPatrimonial { get; }
        ISetorPatrimonialRepository SetorPatrimonial { get; }
        IPatrimonioRepository Patrimonio { get; }
        IMovimentacaoPatrimonioRepository MovimentacaoPatrimonio { get; }



        IViewEmpenhosRepository ViewEmpenhos { get; }
        IViewMotoristasRepository ViewMotoristas { get; }
        IViewAbastecimentosRepository ViewAbastecimentos { get; }
        IViewVeiculosRepository ViewVeiculos { get; }
        IViewMediaConsumoRepository ViewMediaConsumo { get; }
        IViewViagensRepository ViewViagens { get; }
        IViewSetoresRepository ViewSetores { get; }
        IViewRequisitantesRepository ViewRequisitantes { get; }
        IViewCustosViagemRepository ViewCustosViagem { get; }
        IViewViagensAgendaRepository ViewViagensAgenda { get; }
        IviewMultasRepository viewMultas { get; }
        IViewContratoFornecedorRepository ViewContratoFornecedor { get; }
        IViewAtaFornecedorRepository ViewAtaFornecedor { get; }
        IViewProcuraFichaRepository ViewProcuraFicha { get; }
        IViewManutencaoRepository ViewManutencao { get; }
        IViewPendenciasManutencaoRepository ViewPendenciasManutencao { get; }
        IViewItensManutencaoRepository ViewItensManutencao { get; }
        IViewOcorrenciaRepository ViewOcorrencia{ get; }
        IViewViagensAgendaTodosMesesRepository ViewViagensAgendaTodosMeses { get; }
        IViewLavagemRepository ViewLavagem { get; }
        IViewEmpenhoMultaRepository ViewEmpenhoMulta { get; }
        IViewFluxoEconomildoRepository ViewFluxoEconomildo { get; }
        IViewFluxoEconomildoDataRepository ViewFluxoEconomildoData { get; }
        IViewMotoristaFluxoRepository ViewMotoristaFluxo { get; }
        IViewLotacoesRepository ViewLotacoes { get; }
        IViewLotacaoMotoristaRepository ViewLotacaoMotorista { get; }
        IViewNoFichaVistoriaRepository ViewNoFichaVistoria { get; }
        IViewExisteItemContratoRepository ViewExisteItemContrato { get; }
        IViewEventosRepository ViewEventos { get; }
        IViewControleAcessoRepository ViewControleAcesso { get; }
        IViewMotoristasViagemRepository ViewMotoristasViagem { get; }

        void Save();

        //public IActionResult ExecuteStoredProcedure(string procedureName);

    }
}
