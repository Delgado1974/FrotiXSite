using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Text.Json;
//using Stimulsoft.System.Windows.Forms;
//using NPOI.SS.Formula.Functions;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatrimonioController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public PatrimonioViewModel PatrimonioObj { get; private set; }

        public PatrimonioController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult Get()
        {

            try
            { //Troquei pra sem ser a view só pra gente testar @Pedro
                //Rever depois
                var objPatrimonios = (from p in _unitOfWork.Patrimonio.GetAll()
                                      join s in _unitOfWork.SecaoPatrimonial.GetAllReduced(selector: s => new { s.SecaoId, s.NomeSecao }) on p.SecaoId equals s.SecaoId
                                      join t in _unitOfWork.SetorPatrimonial.GetAllReduced(selector: t => new { t.SetorId, t.NomeSetor }) on p.SetorId equals t.SetorId
                                      select new
                                      {
                                          p.PatrimonioId,
                                          p.NPR,
                                          p.Marca,
                                          p.Modelo,
                                          p.Descricao,
                                          p.NumeroSerie,
                                          nomeSetor = t.NomeSetor,
                                          nomeSecao = s.NomeSecao,
                                          p.Situacao,
                                          p.Status
                                      }).ToList();


                return Json(new { data = objPatrimonios });
            }
            catch (Exception ex)
            {
                throw;
            }

        }

        [Route("ListaPatrimonios")]
        public JsonResult OnGetListaPatrimonios()
        {
            var PatrimoniosList = _unitOfWork.Patrimonio.GetPatrimonioListForDropDown();
            return new JsonResult(new { data = PatrimoniosList });
        }


        //A partir daqui são endpoints da MovimentaçãoPatrimonio


        [Route("MovimentacaoPatrimonioGrid")]
        public IActionResult GetMovimentacoesPatrimonioPraGrid(string patrimonioId = null)
        {
            // Tenta converter o parametro 'patrimonioId' para Guid, se foi passado.
            Guid? patrimonioGuid = null;
            if (!string.IsNullOrEmpty(patrimonioId))
            {
                if (Guid.TryParse(patrimonioId, out var parsedGuid))
                {
                    patrimonioGuid = parsedGuid;
                }
                else
                {
                    return BadRequest(new { error = "ID de patrimônio inválido." });
                }
            }

            // Filtrar pela 'PatrimonioId' se foi fornecido
            try
            {
                var MovimentacaoList = (from mp in _unitOfWork.MovimentacaoPatrimonio.GetAll()

                                        join p in _unitOfWork.Patrimonio.GetAllReduced(selector: p => new { p.Descricao, p.NPR, p.PatrimonioId })
                                        on mp.PatrimonioId equals p.PatrimonioId

                                        join sto in _unitOfWork.SetorPatrimonial.GetAllReduced(selector: sto => new { sto.SetorId, sto.NomeSetor })
                                        on mp.SetorOrigemId equals sto.SetorId

                                        join so in _unitOfWork.SecaoPatrimonial.GetAllReduced(selector: so => new { so.SecaoId, so.NomeSecao })
                                        on mp.SecaoOrigemId equals so.SecaoId

                                        join std in _unitOfWork.SetorPatrimonial.GetAllReduced(selector: std => new { std.SetorId, std.NomeSetor })
                                        on mp.SetorDestinoId equals std.SetorId

                                        join sd in _unitOfWork.SecaoPatrimonial.GetAllReduced(selector: sd => new { sd.SecaoId, sd.NomeSecao })
                                        on mp.SecaoDestinoId equals sd.SecaoId

                                        join u in _unitOfWork.AspNetUsers.GetAllReduced(selector: u => new { u.Id, u.NomeCompleto })
                                        on mp.ResponsavelMovimentacao equals u.Id
                                        where !patrimonioGuid.HasValue || mp.PatrimonioId == patrimonioGuid

                                        select new
                                        {
                                            p.NPR,
                                            p.Descricao,
                                            setorOrigemNome = sto.NomeSetor,
                                            secaoOrigemNome = so.NomeSecao,
                                            setorDestinoNome = std.NomeSetor,
                                            secaoDestinoNome = sd.NomeSecao,
                                            DataMovimentacao = mp.DataMovimentacao.HasValue
                                                        ? mp.DataMovimentacao.Value.ToString("yyyy-MM-ddTHH:mm:ss") // Para exibição
                                                        : null,
                                            ResponsavelMovimentacao = u.NomeCompleto,
                                            MovimentacaoPatrimonioId = mp.MovimentacaoPatrimonioId.ToString()
                                        }).ToList();

                return Json(new { data = MovimentacaoList });
            }
            catch (Exception error)
            {// Tem que retornar um JSON independente se deu certo ou não para não quebrar o DataTable e ele imprimir empty list
                return Json(new { data = new List<object>() });
            }


        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(PatrimonioViewModel model)
        {
            if (model != null && model.PatrimonioId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Patrimonio.GetFirstOrDefault(u => u.PatrimonioId == model.PatrimonioId);
                if (objFromDb != null)
                {
                    //Verifica se pode apagar o patrimonio
                    var patrimonioMovimentacao = _unitOfWork.MovimentacaoPatrimonio.GetFirstOrDefault(mp => mp.PatrimonioId == model.PatrimonioId);
                    if (patrimonioMovimentacao != null)
                    {
                        return Json(new { sucess = false, message = "Não foi possível apagar porque tem movimentações desse patrimônio" });
                    }

                    _unitOfWork.Patrimonio.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Patrimônio removido com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar patrimônio, possível erro de apontamento" });
        }


        [Route("GetSingle")]
        [HttpGet]
        public IActionResult GetSinglePatrimonio(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var patrimonio = _unitOfWork.Patrimonio.GetFirstOrDefault(p => p.PatrimonioId == Id);
                if (patrimonio != null)
                {
                    var secao = _unitOfWork.SecaoPatrimonial.GetFirstOrDefault(sec => sec.SecaoId == patrimonio.SecaoId);
                    var setor = _unitOfWork.SetorPatrimonial.GetFirstOrDefault(set => set.SetorId == patrimonio.SetorId);

                    var movimentacaoPatrimonio = new MovimentacaoPatrimonioViewModel
                    {
                        SecaoOrigemId = secao.SecaoId,
                        SecaoOrigemNome = secao.NomeSecao,
                        SetorOrigemId = setor.SetorId,
                        SetorOrigemNome = setor.NomeSetor,
                        PatrimonioNome = patrimonio.NPR
                    };

                    return Json(new { success = true, data = movimentacaoPatrimonio, status = patrimonio.Status, message = "Patrimônio recuperado com sucesso" });
                }
                else
                {
                    return Json(new { success = false, message = "Patrimônio recebido não encontrado" });
                }
            }
            return Json(new { success = false, message = "Valor recebido não encontrado" });
        }


        [Route("DeleteMovimentacaoPatrimonio")]
        [HttpPost]
        public IActionResult Delete(MovimentacaoPatrimonioViewModel model)
        { //Tem que permitir a edição da última apenas aiaiaia
            if (model != null && model.MovimentacaoPatrimonioId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.MovimentacaoPatrimonio.GetFirstOrDefault(u => u.MovimentacaoPatrimonioId == model.MovimentacaoPatrimonioId);
                if (objFromDb != null)
                {


                    //Pega a última movimentação desse patrimonio
                    var ultimaMovimentacao = _unitOfWork.MovimentacaoPatrimonio.GetAll()
                        .Where(mp => mp.PatrimonioId == objFromDb.PatrimonioId)
                        .OrderByDescending(mp => mp.DataMovimentacao)
                        .FirstOrDefault();


                    if (!(objFromDb.MovimentacaoPatrimonioId == ultimaMovimentacao.MovimentacaoPatrimonioId)) //Verifica se essa é a última pra poder apagar
                    {
                        return Json(new { success = false, message = "Não foi possível apagar pois não é a última movimentação" });
                    }
                    MoverPatrimonio(objFromDb, true);
                    _unitOfWork.MovimentacaoPatrimonio.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Movimentação removida com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar movimentação" });
        }

        //Caso for uma volta, o bool vai ser true, ele vai usar a seção/setor origem ao invés da destino
        //Eu coloquei como void porque não consegui pensar em alguma situação que daria erro
        //Como o submit é feito na model page eu tive que fazer dois, um aqui pra deleção na controler e outro para o submit
        private void MoverPatrimonio(MovimentacaoPatrimonio movimentacaoPatrimonio, bool delecao)
        {
            var patrimonio = _unitOfWork.Patrimonio.GetFirstOrDefault(p => p.PatrimonioId == movimentacaoPatrimonio.PatrimonioId);

            if (delecao)
            { //"Volta" para o setor e secao antes da movimentação
                patrimonio.SecaoId = movimentacaoPatrimonio.SecaoOrigemId;
                patrimonio.SetorId = movimentacaoPatrimonio.SetorOrigemId;

            }
            else
            { //Troca a seção e o setor do patrimonio para os novos
                patrimonio.SecaoId = movimentacaoPatrimonio.SecaoDestinoId;
                patrimonio.SetorId = movimentacaoPatrimonio.SetorDestinoId;

            }
            _unitOfWork.Patrimonio.Update(patrimonio);

        }

        [Route("ListaMarcas")]
        public JsonResult OnGetListaMarcas()
        {
            var marcaList = _unitOfWork.Patrimonio.GetAll()
                .Select(p => p.Marca)
                //.Where(m => m != null)
                .Distinct()
                .Select(m => new { text = m, value = m })
                .ToList();

            return new JsonResult(new { data = marcaList });
        }

        [Route("ListaModelos")]
        public JsonResult ListaModelos(string marca)
        {
            var modeloList = _unitOfWork.Patrimonio.GetAll(m => m.Marca == marca)
                .Where(p => !string.IsNullOrEmpty(p.Modelo)) // Evita valores nulos
                .Select(p => p.Modelo)
                .Distinct()
                .Select(m => new { text = m, value = m })
                .ToList();

            return new JsonResult(new { data = modeloList });
        }

        [Route("UpdateStatusPatrimonio")]
        public JsonResult UpdateStatusPatrimonio(Guid Id)
        {
            if (Id != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Patrimonio.GetFirstOrDefault(u => u.PatrimonioId == Id);
                string Description = "";
                int type = 0;

                if (objFromDb != null)
                {
                    if (objFromDb.Status == true)
                    {
                        //res["success"] = 0;
                        objFromDb.Status = false;
                        Description = string.Format("Atualizado Status do Patrimônio [NPR: {0}] (Inativo)", objFromDb.NPR);
                        type = 1;
                    }
                    else
                    {
                        //res["success"] = 1;
                        objFromDb.Status = true;
                        Description = string.Format("Atualizado Status do Patrimônio [NPR: {0}] (Ativo)", objFromDb.NPR);
                        type = 0;
                    }
                    //db.SaveChanges();
                    //_unitOfWork.Save();
                    _unitOfWork.Patrimonio.Update(objFromDb);
                }
                return Json(new { success = true, message = Description, type = type });
            }
            return Json(new { success = false });
        }

        [Route("ListaSetores")]
        public JsonResult ListaSetores()
        {
            var setorList = _unitOfWork.SetorPatrimonial.GetAll()
                .Select(s => new { text = s.NomeSetor, value = s.SetorId.ToString() }) // Ensure text = NomeSetor
                .ToList();

            return new JsonResult(new { data = setorList });
        }

        [Route("ListaSecoes")]
        public JsonResult ListaSecoes(Guid setorId)
        {
            //var secaoList = _unitOfWork.SecaoPatrimonial.GetAll(s => s.SetorId == setorId)
            //    .Select(s => new { text = s.NomeSecao, value = s.SecaoId.ToString() }) // Ensure text = NomeSecao
            //    .ToList();

            var secaoList = _unitOfWork.SecaoPatrimonial.GetAll(s => s.SetorId == setorId)
                .Select(s => new { text = s.NomeSecao , value = s.SecaoId })
                .ToList();

            return new JsonResult(new { data = secaoList });
        }


    }



}