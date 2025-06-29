using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UnidadeController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotyfService _notyf;

        public UnidadeController(IUnitOfWork unitOfWork, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
            _notyf = notyf;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Json(new { data = _unitOfWork.Unidade.GetAll() });
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(UnidadeViewModel model)
        {
            if (model != null && model.UnidadeId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Unidade.GetFirstOrDefault(u => u.UnidadeId == model.UnidadeId);
                if (objFromDb != null)
                {
                    var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.UnidadeId == model.UnidadeId);
                    if (veiculo != null)
                    {
                        return Json(new { success = false, message = "Existem veículos associados a essa unidade" });
                    }
                    _unitOfWork.Unidade.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Unidade removida com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar Unidade" });
        }

        [Route("UpdateStatus")]
        public JsonResult UpdateStatus(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Unidade.GetFirstOrDefault(u => u.UnidadeId == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == true)
                    {
                        //res["success"] = 0;
                        objFromDb.Status = false;
                        Description = string.Format("Atualizado Status da Unidade [Nome: {0}] (Inativo)", objFromDb.Descricao);
                        type = 1;
                    }
                    else
                    {
                        //res["success"] = 1;
                        objFromDb.Status = true;
                        Description = string.Format("Atualizado Status da Unidade  [Nome: {0}] (Ativo)", objFromDb.Descricao);
                        type = 0;
                    }
                    //db.SaveChanges();
                    //_unitOfWork.Save();
                    _unitOfWork.Unidade.Update(objFromDb);
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }

        [HttpGet]
        [Route("ListaLotacao")]
        public IActionResult ListaLotacao(string motoristaId)
        {

            var result = _unitOfWork.ViewLotacaoMotorista.GetAll(lm => lm.MotoristaId == null);

            if (motoristaId != null)
            {
                result = _unitOfWork.ViewLotacaoMotorista.GetAll(lm => lm.MotoristaId == Guid.Parse(motoristaId));
            }

            //var result = (from lm in _unitOfWork.LotacaoMotorista.GetAll()
            //              join u in _unitOfWork.Unidade.GetAll() on lm.UnidadeId equals u.UnidadeId
            //              orderby lm.DataInicio descending
            //              where lm.MotoristaId == null
            //              select new
            //              {
            //                  u.UnidadeId,
            //                  lm.LotacaoMotoristaId,
            //                  lm.Lotado,
            //                  lm.Motivo,
            //                  Unidade = u.Descricao,
            //                  DataInicio = lm.DataInicio?.ToString("dd/MM/yyyy"),
            //                  DataFim = lm.DataFim?.ToString("dd/MM/yyyy"),
            //              }).ToList();

            //if (motoristaId != null)
            //{
            //    result = (from lm in _unitOfWork.LotacaoMotorista.GetAll()
            //              join u in _unitOfWork.Unidade.GetAll() on lm.UnidadeId equals u.UnidadeId
            //              orderby lm.DataInicio descending
            //              where lm.MotoristaId == Guid.Parse(motoristaId)
            //              select new
            //              {
            //                  u.UnidadeId,
            //                  lm.LotacaoMotoristaId,
            //                  lm.Lotado,
            //                  lm.Motivo,
            //                  Unidade = u.Descricao,
            //                  DataInicio = lm.DataInicio?.ToString("dd/MM/yyyy"),
            //                  DataFim = lm.DataFim?.ToString("dd/MM/yyyy"),
            //              }).ToList();

            //}


            return Json(new { data = result });

        }

        [HttpGet]
        [Route("LotaMotorista")] //Lida com o endpoint de criação de nova lotação
        public IActionResult LotaMotorista(string MotoristaId, string UnidadeId, string DataInicio, string DataFim, bool Lotado, string Motivo) //Recebe todos os dados necessários
        {


            var existeLotacao = _unitOfWork.LotacaoMotorista.GetFirstOrDefault(lm => (lm.MotoristaId == Guid.Parse(MotoristaId)) && (lm.UnidadeId == Guid.Parse(UnidadeId)) && lm.DataInicio.ToString() == DataInicio);
            if (existeLotacao != null)
            {
                _notyf.Error("Já existe uma lotação com essas informações!", 3);
                return new JsonResult(new { data = "00000000-0000-0000-0000-000000000000" });
            }

            var objLotacaoMotorista = new LotacaoMotorista();
            objLotacaoMotorista.MotoristaId = Guid.Parse(MotoristaId);
            objLotacaoMotorista.UnidadeId = Guid.Parse(UnidadeId);
            objLotacaoMotorista.DataInicio = DateTime.Parse(DataInicio);
            if (DataFim != null)
            {
                objLotacaoMotorista.DataFim = DateTime.Parse(DataFim);
            }
            objLotacaoMotorista.Lotado = Lotado;
            objLotacaoMotorista.Motivo = Motivo;

            _unitOfWork.LotacaoMotorista.Add(objLotacaoMotorista);

            var obJMotorista = _unitOfWork.Motorista.GetFirstOrDefault(m => m.MotoristaId == Guid.Parse(MotoristaId));
            obJMotorista.UnidadeId = Guid.Parse(UnidadeId);
            _unitOfWork.Motorista.Update(obJMotorista);
            //RemoveLotacoes(MotoristaId, objLotacaoMotorista.LotacaoMotoristaId);

            _unitOfWork.Save();

            return new JsonResult(new { data = MotoristaId, message = "Lotação Adicionada com Sucesso", lotacaoId = objLotacaoMotorista.LotacaoMotoristaId });//Estou retornando o id da nova lotação para chamar lá

        }

        [HttpGet]
        [Route("EditaLotacao")]
        public IActionResult EditaLotacao(string LotacaoId, string MotoristaId, string UnidadeId, string DataInicio, string DataFim, bool Lotado, string Motivo)
        {

            var objLotacaoMotorista = _unitOfWork.LotacaoMotorista.GetFirstOrDefault(lm => (lm.LotacaoMotoristaId == Guid.Parse(LotacaoId)));
            objLotacaoMotorista.MotoristaId = Guid.Parse(MotoristaId);
            objLotacaoMotorista.UnidadeId = Guid.Parse(UnidadeId);
            objLotacaoMotorista.DataInicio = DateTime.Parse(DataInicio);
            if (DataFim != null)
            {
                objLotacaoMotorista.DataFim = DateTime.Parse(DataFim);
            }
            else
            {
                objLotacaoMotorista.DataFim = null;
            }
            objLotacaoMotorista.Lotado = Lotado;
            objLotacaoMotorista.Motivo = Motivo;
            _unitOfWork.LotacaoMotorista.Update(objLotacaoMotorista);

            var obJMotorista = _unitOfWork.Motorista.GetFirstOrDefault(m => m.MotoristaId == Guid.Parse(MotoristaId));
            obJMotorista.UnidadeId = Guid.Parse(UnidadeId);
            _unitOfWork.Motorista.Update(obJMotorista);


            _unitOfWork.Save();

            return new JsonResult(new { data = MotoristaId, message = "Lotação Alterada com Sucesso" });

        }

        [Route("DeleteLotacao")]
        [HttpGet]
        public IActionResult DeleteLotacao(string Id)
        {
            var objFromDb = _unitOfWork.LotacaoMotorista.GetFirstOrDefault(u => u.LotacaoMotoristaId == Guid.Parse(Id));
            var motoristaId = objFromDb.MotoristaId;
            _unitOfWork.LotacaoMotorista.Remove(objFromDb);
            _unitOfWork.Save();

            var obJMotorista = _unitOfWork.Motorista.GetFirstOrDefault(m => m.MotoristaId == motoristaId);
            obJMotorista.UnidadeId = null;
            _unitOfWork.Motorista.Update(obJMotorista);


            return Json(new { success = true, message = "Lotação removida com sucesso", motoristaId = motoristaId });
        }


        [HttpGet]
        [Route("AtualizaMotoristaLotacaoAtual")]
        public IActionResult AtualizaMotoristaLotacaoAtual(
                                                    string MotoristaId,
                                                    string UnidadeAtualId,
                                                    string UnidadeNovaId,
                                                    string DataFimLotacaoAnterior,
                                                    string DataInicioNovoMotivo,
                                                    string MotivoLotacaoAtual)
        {

            // ============================= Atualiza Motorista =====================================
            if (UnidadeNovaId == null)
            {
                var obJMotorista = _unitOfWork.Motorista.GetFirstOrDefault(m => m.MotoristaId == Guid.Parse(MotoristaId));
                obJMotorista.UnidadeId = Guid.Empty;
                _unitOfWork.Motorista.Update(obJMotorista);

                var obJLotacao = _unitOfWork.LotacaoMotorista.GetFirstOrDefault(lm => lm.UnidadeId == Guid.Parse(UnidadeAtualId));
                //obJLotacao.Motivo = MotivoLotacaoAtual;
                obJLotacao.Lotado = false;
                obJLotacao.DataFim = DateTime.Parse(DataFimLotacaoAnterior);
                _unitOfWork.LotacaoMotorista.Update(obJLotacao);

            }
            else if(UnidadeAtualId != UnidadeNovaId)
            {
                var obJMotorista = _unitOfWork.Motorista.GetFirstOrDefault(m => m.MotoristaId == Guid.Parse(MotoristaId));
                obJMotorista.UnidadeId = Guid.Parse(UnidadeNovaId);
                _unitOfWork.Motorista.Update(obJMotorista);

                var obJLotacao = _unitOfWork.LotacaoMotorista.GetFirstOrDefault(lm => lm.UnidadeId == Guid.Parse(UnidadeAtualId));
                obJLotacao.Lotado = false;
                obJLotacao.DataFim = DateTime.Parse(DataFimLotacaoAnterior);
                _unitOfWork.LotacaoMotorista.Update(obJLotacao);

                var objLotacaoMotorista = new LotacaoMotorista();
                objLotacaoMotorista.MotoristaId = Guid.Parse(MotoristaId);
                objLotacaoMotorista.UnidadeId = Guid.Parse(UnidadeNovaId);
                objLotacaoMotorista.DataInicio = DateTime.Parse(DataInicioNovoMotivo);
                objLotacaoMotorista.Lotado = true;
                objLotacaoMotorista.Motivo = MotivoLotacaoAtual;
                _unitOfWork.LotacaoMotorista.Update(objLotacaoMotorista);
            }
            // ========================================================================================

            _unitOfWork.Save();

            return new JsonResult(new { data = MotoristaId, message = "Remoção feita com Sucesso" });

        }

        // ===================== Aloca Motorista Cobertura na Lotação Atual =============================================
        [HttpGet]
        [Route("AlocaMotoristaCobertura")]
        public IActionResult AlocaMotoristaCobertura(
                                                string MotoristaId,
                                                string MotoristaCoberturaId,
                                                string DataFimLotacao,
                                                string DataInicioLotacao,
                                                string DataInicioCobertura,
                                                string DataFimCobertura,
                                                string UnidadeId)
        {

            // ===================== Desabilita Motorista Atual da Sua Locacao =============================================
            var objMotoristaAtual = _unitOfWork.LotacaoMotorista.GetFirstOrDefault(lm => (lm.MotoristaId == Guid.Parse(MotoristaId) && lm.Lotado == true));
            if (objMotoristaAtual != null)
            {
                objMotoristaAtual.DataFim = DateTime.Parse(DataFimLotacao);
                objMotoristaAtual.Lotado = false;
                objMotoristaAtual.Motivo = "Férias";
                if (MotoristaCoberturaId != null)
                {
                    objMotoristaAtual.MotoristaCoberturaId = Guid.Parse(MotoristaCoberturaId);
                }
                _unitOfWork.LotacaoMotorista.Update(objMotoristaAtual);
            }

            // ===================== Insere Motorista Atual em Nova Locacao =============================================
                var objMotoristaLotacaoNova = new LotacaoMotorista();
                objMotoristaLotacaoNova.MotoristaId = Guid.Parse(MotoristaId);
                objMotoristaLotacaoNova.DataInicio = DateTime.Parse(DataInicioLotacao);
                objMotoristaLotacaoNova.DataFim = DateTime.Parse(DataFimLotacao);
                objMotoristaLotacaoNova.Lotado = true;
                objMotoristaLotacaoNova.Motivo = "Férias";
                if (MotoristaCoberturaId != null)
                {
                    objMotoristaAtual.MotoristaCoberturaId = Guid.Parse(MotoristaCoberturaId);
                }
                _unitOfWork.LotacaoMotorista.Add(objMotoristaLotacaoNova);

            // ===================== Remove Motorista Cobertura da Lotação Atual =============================================
            if (MotoristaCoberturaId != null)
            {
                var objCobertura = _unitOfWork.LotacaoMotorista.GetFirstOrDefault(lm => (lm.MotoristaId == Guid.Parse(MotoristaCoberturaId) && lm.Lotado == true));
                if (objCobertura != null)
                {
                    objCobertura.DataFim = DateTime.Parse(DataInicioCobertura);
                    objCobertura.Lotado = false;
                    _unitOfWork.LotacaoMotorista.Update(objCobertura);
                }
            }

            // ===================== Aloca Motorista em Nova Lotação =============================================
            if (MotoristaCoberturaId != null)
            {
                var objLotacaoMotorista = new LotacaoMotorista();
                objLotacaoMotorista.MotoristaId = Guid.Parse(MotoristaCoberturaId);
                objLotacaoMotorista.UnidadeId = Guid.Parse(UnidadeId);
                objLotacaoMotorista.DataInicio = DateTime.Parse(DataInicioCobertura);
                objLotacaoMotorista.DataFim = DateTime.Parse(DataFimCobertura);
                objLotacaoMotorista.Lotado = true;
                objLotacaoMotorista.Motivo = "Cobertura";
                _unitOfWork.LotacaoMotorista.Add(objLotacaoMotorista);
            }

            _unitOfWork.Save();

            return new JsonResult(new { data = MotoristaId, message = "Remoção feita com Sucesso" });
        }
        // ======================================================================================================


        // ===================== Aloca Motorista em Nova Lotação =============================================
        //[HttpGet]
        //[Route("AlocaMotoristaNovaLotacao")]
        //public IActionResult AlocaMotoristaNovaLotacao(
        //                                        string MotoristaId,
        //                                        string UnidadeNovaId,
        //                                        string DataInicioNovoMotivo,
        //                                        string MotivoLotacaoAtual)
        //{
        //        var objLotacaoMotorista = new LotacaoMotorista();
        //        objLotacaoMotorista.MotoristaId = Guid.Parse(MotoristaId);
        //        objLotacaoMotorista.UnidadeId = Guid.Parse(UnidadeNovaId);
        //        objLotacaoMotorista.DataInicio = DateTime.Parse(DataInicioNovoMotivo);
        //        objLotacaoMotorista.Lotado = true;
        //        objLotacaoMotorista.Motivo = MotivoLotacaoAtual;
        //        _unitOfWork.LotacaoMotorista.Add(objLotacaoMotorista);

        //        var obJMotorista = _unitOfWork.Motorista.GetFirstOrDefault(m => m.MotoristaId == Guid.Parse(MotoristaId));
        //        obJMotorista.UnidadeId = Guid.Parse(UnidadeNovaId);
        //        _unitOfWork.Motorista.Update(obJMotorista);

        //        _unitOfWork.Save();

        //        return new JsonResult(new { data = MotoristaId, message = "Remoção feita com Sucesso" });

        //}
        // ======================================================================================================

        // ================= Acrescenta Nova Lotação Cobertura ==================================================
        //[HttpGet]
        //[Route("AcrescentaNovaLotacaoCobertura")]
        //public IActionResult AcrescentaNovaLotacaoCobertura(
        //                                        string MotoristaId,
        //                                        string MotoristaCoberturaId,
        //                                        string DataInicioCobertura,
        //                                        string DataFimCobertura,
        //                                        string UnidadeId)
        //{
        //    var objLotacaoMotorista = new LotacaoMotorista();
        //    objLotacaoMotorista.MotoristaId = Guid.Parse(MotoristaCoberturaId);
        //    objLotacaoMotorista.UnidadeId = Guid.Parse(UnidadeId);
        //    objLotacaoMotorista.DataInicio = DateTime.Parse(DataInicioCobertura);
        //    objLotacaoMotorista.DataFim = DateTime.Parse(DataFimCobertura);
        //    objLotacaoMotorista.Lotado = true;
        //    objLotacaoMotorista.Motivo = "Cobertura";
        //    _unitOfWork.LotacaoMotorista.Add(objLotacaoMotorista);
        //    _unitOfWork.Save();

        //    var obJMotorista = _unitOfWork.Motorista.GetFirstOrDefault(m => m.MotoristaId == Guid.Parse(MotoristaId));
        //    obJMotorista.UnidadeId = Guid.Parse(UnidadeId);
        //    _unitOfWork.Motorista.Update(obJMotorista);

        //    _unitOfWork.Save();

        //    return new JsonResult(new { data = MotoristaId, message = "Remoção feita com Sucesso" });

        //}
        // ======================================================================================================

        [HttpGet]
        [Route("ListaLotacoes")]
        public IActionResult ListaLotacoes(string categoriaId)
        {

            var result = _unitOfWork.ViewLotacoes.GetAll().OrderBy(vl => vl.NomeCategoria).ThenBy(vl => vl.Unidade).ToList();

            if (categoriaId != null)
            {
                result = _unitOfWork.ViewLotacoes.GetAll(vl => vl.NomeCategoria == categoriaId).OrderBy(O => O.NomeCategoria).ThenBy(vl => vl.Unidade).ToList();
            }

            return Json(new { data = result });

        }

        private void DesativarLotacoes(string motoristaId, Guid lotacaoAtualId) // Método pra desativar as lotações anteriores que vai ser chamado por RemoveLotacoes
        {
            var lotacoesAnteriores = _unitOfWork.LotacaoMotorista.GetAll(lm => lm.MotoristaId == Guid.Parse(motoristaId) && (lm.Lotado == true || lm.Lotado == null));
            foreach (var lotacao in lotacoesAnteriores)
            {
                if (lotacao.LotacaoMotoristaId == lotacaoAtualId) // Verifica se o id da lotação é o mesmo da nova lotação para não desativar esse
                {
                    continue;
                }
                else
                {
                    lotacao.Lotado = false; //Aqui define a lotação como falsa, indicando que está "desativada", é possível adicionar outras operações aqui caso necessári
                    _unitOfWork.LotacaoMotorista.Update(lotacao);
                }

            }
            _unitOfWork.Save();
        }

        [HttpGet]
        [Route("RemoveLotacoes")] //Remove a lotação anterior
        public IActionResult RemoveLotacoes(string motoristaId, Guid lotacaoAtualId) //Ta recebendo isso aqui de um ajax dentro do ajax que chama a LotaMotorista
        {
            DesativarLotacoes(motoristaId, lotacaoAtualId);
            return new JsonResult(new { success = true });
        }

    }

}
