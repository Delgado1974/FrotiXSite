using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ManutencaoController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _hostingEnvironment;


        public ManutencaoController(IUnitOfWork unitOfWork, IWebHostEnvironment hostingEnvironment)
        {
            _unitOfWork = unitOfWork;
            _hostingEnvironment = hostingEnvironment;
        }

        static Expression<Func<ViewManutencao, bool>> manutencoesFilters(string StatusOS)
        {
            return mf =>
                (mf.StatusOS == "Aberta");
        }


        [Route("ListaManutencao")]
        [HttpGet]
        public IActionResult ListaManutencao(string id)
        {
            string StatusOS = "Aberta";

            var objManutencacao = _unitOfWork.ViewManutencao.GetAllReduced(filter: manutencoesFilters(StatusOS),
                          selector: vm => new
                          {
                              vm.ManutencaoId,
                              vm.NumOS,
                              vm.DescricaoVeiculo,
                              vm.DataSolicitacao,
                              vm.DataEntrega,
                              vm.DataRecolhimento,
                              DataDevolucao = vm.DataDevolucao == "01/01/2001" ? null : vm.DataDevolucao,
                              vm.ResumoOS,
                              vm.StatusOS,
                              Habilitado = vm.StatusOS == "Fechada" ? "" : "data-toggle='modal' data-target='#modalManutencao'",
                              Tooltip = vm.StatusOS == "Fechada" ? "OS Fechada/Baixada" : "Fecha a Ordem de Serviço!",
                              Icon = vm.StatusOS == "Fechada" ? "fa-regular fa-lock" : "far fa-flag-checkered",
                              Dias = (vm.DataDevolucao == null) || (vm.DataDevolucao == "01/01/2001") ? 0 : (DateTime.Parse(vm.DataDevolucao) - DateTime.Parse(vm.DataSolicitacao)).TotalDays,
                              vm.Reserva
                          }).ToList();

            return Json(new { data = objManutencacao });

        }


        [Route("ListaManutencaoVeiculo")]
        [HttpGet]
        public IActionResult ListaManutencaoVeiculo(Guid Id)
        {

            var result = (from vm in _unitOfWork.ViewManutencao.GetAll()
                          where vm.VeiculoId == Id 
                          select new
                          {
                              vm.ManutencaoId,
                              vm.NumOS,
                              vm.DescricaoVeiculo,
                              vm.DataSolicitacao,
                              vm.DataEntrega,
                              vm.DataRecolhimento,
                              DataDevolucao = vm.DataDevolucao == "01/01/2001" ? null : vm.DataDevolucao,
                              vm.ResumoOS,
                              vm.StatusOS,
                              Habilitado = vm.StatusOS == "Fechada" ? "" : "data-toggle='modal' data-target='#modalManutencao'",
                              Tooltip = vm.StatusOS == "Fechada" ? "OS Fechada/Baixada" : "Fecha a Ordem de Serviço!",
                              Icon = vm.StatusOS == "Fechada" ? "fa-regular fa-lock" : "far fa-flag-checkered",
                              Dias = (vm.DataDevolucao == null) || (vm.DataDevolucao == "01/01/2001") ? 0 : (DateTime.Parse(vm.DataDevolucao) - DateTime.Parse(vm.DataSolicitacao)).TotalDays,
                              vm.Reserva
                          }).ToList();

            return Json(new { data = result });

        }


        [Route("ListaManutencaoStatus")]
        [HttpGet]
        public IActionResult ListaManutencaoStatus(string Id)
        {

            if (Id == "Todas")
            {
                var resultado = (from vm in _unitOfWork.ViewManutencao.GetAll()
                              select new
                              {
                                  vm.ManutencaoId,
                                  vm.NumOS,
                                  vm.DescricaoVeiculo,
                                  vm.DataSolicitacao,
                                  vm.DataEntrega,
                                  vm.DataRecolhimento,
                                  DataDevolucao = vm.DataDevolucao == "01/01/2001" ? null : vm.DataDevolucao,
                                  vm.ResumoOS,
                                  vm.StatusOS,
                                  Habilitado = vm.StatusOS == "Fechada" ? "" : "data-toggle='modal' data-target='#modalManutencao'",
                                  Tooltip = vm.StatusOS == "Fechada" ? "OS Fechada/Baixada" : "Fecha a Ordem de Serviço!",
                                  Icon = vm.StatusOS == "Fechada" ? "fa-regular fa-lock" : "far fa-flag-checkered",
                                  Dias = (vm.DataDevolucao == null) || (vm.DataDevolucao == "01/01/2001") ? 0 : (DateTime.Parse(vm.DataDevolucao) - DateTime.Parse(vm.DataSolicitacao)).TotalDays,
                                  vm.Reserva
                              }).ToList();


                return Json(new { data = resultado });

            }

            var result = (from vm in _unitOfWork.ViewManutencao.GetAll()
                          where vm.StatusOS == Id 
                          select new
                          {
                              vm.ManutencaoId,
                              vm.NumOS,
                              vm.DescricaoVeiculo,
                              vm.DataSolicitacao,
                              vm.DataRecolhimento,
                              vm.DataEntrega,
                              DataDevolucao = vm.DataDevolucao == "01/01/2001" ? null : vm.DataDevolucao,
                              vm.ResumoOS,
                              vm.StatusOS,
                              Habilitado = vm.StatusOS == "Fechada" ? "" : "data-toggle='modal' data-target='#modalManutencao'",
                              Tooltip = vm.StatusOS == "Fechada" ? "OS Fechada/Baixada" : "Fecha a Ordem de Serviço!",
                              Icon = vm.StatusOS == "Fechada" ? "fa-regular fa-lock" : "far fa-flag-checkered",
                              Dias = (vm.DataDevolucao == null) || (vm.DataDevolucao == "01/01/2001") ? 0 : (DateTime.Parse(vm.DataDevolucao) - DateTime.Parse(vm.DataSolicitacao)).TotalDays,
                              vm.Reserva
                          }).ToList();


            return Json(new { data = result });

        }


        [Route("ListaManutencaoData")]
        [HttpGet]
        public IActionResult ListaManutencaoData(string Id)
        {
            var result = (from vm in _unitOfWork.ViewManutencao.GetAll()
                          where vm.DataSolicitacao == Id 
                          select new
                          {
                              vm.ManutencaoId,
                              vm.NumOS,
                              vm.DescricaoVeiculo,
                              vm.DataSolicitacao,
                              vm.DataEntrega,
                              vm.DataRecolhimento,
                              DataDevolucao = vm.DataDevolucao == "01/01/2001" ? null : vm.DataDevolucao,
                              vm.ResumoOS,
                              vm.StatusOS,
                              Habilitado = vm.StatusOS == "Fechada" ? "" : "data-toggle='modal' data-target='#modalManutencao'",
                              Tooltip = vm.StatusOS == "Fechada" ? "OS Fechada/Baixada" : "Fecha a Ordem de Serviço!",
                              Icon = vm.StatusOS == "Fechada" ? "fa-regular fa-lock" : "far fa-flag-checkered",
                              Dias = (vm.DataDevolucao == null) || (vm.DataDevolucao == "01/01/2001") ? 0 : (DateTime.Parse(vm.DataDevolucao) - DateTime.Parse(vm.DataSolicitacao)).TotalDays,
                              vm.Reserva
                          }).ToList();


            return Json(new { data = result });

        }

        [Route("ListaManutencaoIntervalo")]
        [HttpGet]
        public IActionResult ListaManutencaoIntervalo(string mes, string ano)
        {
            var result = (from vm in _unitOfWork.ViewManutencao.GetAll()
                          where (DateTime.Parse(vm.DataDevolucao).Month == int.Parse(mes)) && (DateTime.Parse(vm.DataDevolucao).Year == int.Parse(ano))
                          &&
                           (vm.DataDevolucao != "01/01/2001")
                          select new
                          {
                              vm.ManutencaoId,
                              vm.NumOS,
                              vm.DescricaoVeiculo,
                              vm.DataSolicitacao,
                              vm.DataEntrega,
                              vm.DataRecolhimento,
                              DataDevolucao = vm.DataDevolucao == "01/01/2001" ? null : vm.DataDevolucao,
                              vm.ResumoOS,
                              vm.StatusOS,
                              Habilitado = vm.StatusOS == "Fechada" ? "" : "data-toggle='modal' data-target='#modalManutencao'",
                              Tooltip = vm.StatusOS == "Fechada" ? "OS Fechada/Baixada" : "Fecha a Ordem de Serviço!",
                              Icon = vm.StatusOS == "Fechada" ? "fa-regular fa-lock" : "far fa-flag-checkered",
                              Dias = (vm.DataDevolucao == null) || (vm.DataDevolucao == "01/01/2001") ? 0 : (DateTime.Parse(vm.DataDevolucao) - DateTime.Parse(vm.DataSolicitacao)).TotalDays,
                              vm.Reserva
                          }).OrderBy(vm => DateTime.Parse(vm.DataSolicitacao)).ToList();


            return Json(new { data = result });

        }


        [Route("SaveImage")]
        public void SaveImage(IList<IFormFile> UploadFiles)
        {
            try
            {
                foreach (IFormFile file in UploadFiles)
                {
                    if (UploadFiles != null)
                    {
                        string filename = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                        filename = _hostingEnvironment.WebRootPath + "\\DadosEditaveis\\ImagensViagens" + $@"\{filename}";

                        // Create a new directory, if it does not exists
                        if (!Directory.Exists(_hostingEnvironment.WebRootPath + "\\DadosEditaveis\\ImagensViagens"))
                        {
                            Directory.CreateDirectory(_hostingEnvironment.WebRootPath + "\\DadosEditaveis\\ImagensViagens");
                        }

                        if (!System.IO.File.Exists(filename))
                        {
                            using (FileStream fs = System.IO.File.Create(filename))
                            {
                                file.CopyTo(fs);
                                fs.Flush();
                            }
                            Response.StatusCode = 200;
                        }
                    }
                }
            }
            catch (Exception)
            {
                Response.StatusCode = 204;
            }
        }

        [Route("OcorrenciasVeiculosManutencao")]
        [HttpGet]
        public IActionResult OcorrenciasVeiculosManutencao(Guid Id)
        {

            var result = (from vo in _unitOfWork.ViewOcorrencia.GetAll()
                          where vo.VeiculoId == Id && ((vo.ResumoOcorrencia != null && vo.ResumoOcorrencia != "") || (vo.DescricaoOcorrencia != null && vo.DescricaoOcorrencia != "")) && (vo.StatusOcorrencia == "Aberta")
                          select new
                          {
                              vo.ViagemId,
                              vo.NoFichaVistoria,
                              vo.DataInicial,
                              vo.NomeMotorista,
                              vo.DescricaoVeiculo,
                              vo.ResumoOcorrencia,
                              DescricaoOcorrencia = vo.DescricaoOcorrencia == null ? "Descrição não Informada" : Servicos.ConvertHtml(vo.DescricaoOcorrencia),
                              vo.DescricaoSolucaoOcorrencia,
                              vo.StatusOcorrencia,
                              vo.MotoristaId,
                              vo.ImagemOcorrencia,
                              vo.ItemManutencaoId
                          }).ToList().OrderByDescending(vo => vo.NoFichaVistoria).ThenByDescending(vo => vo.DataInicial);


            return Json(new { data = result });
        }

        [Route("OcorrenciasVeiculosPendencias")]
        [HttpGet]
        public IActionResult OcorrenciasVeiculosPendencias(Guid Id)
        {

            var result = (from vpm in _unitOfWork.ViewPendenciasManutencao.GetAll()
                          where vpm.VeiculoId == Id && vpm.Status == "Pendente"
                          select new
                          {
                              vpm.ItemManutencaoId,
                              vpm.ViagemId,
                              vpm.NumFicha,
                              vpm.DataItem,
                              vpm.Nome,
                              vpm.Resumo,
                              vpm.Descricao,
                              vpm.Status,
                              vpm.MotoristaId,
                              vpm.ImagemOcorrencia
                          }).ToList().OrderByDescending(v => v.NumFicha).ThenByDescending(v => v.DataItem);


            return Json(new { data = result });

        }

        [Route("ItensOS")]
        [HttpGet]
        public IActionResult ItensOS(string Id)
        {

            if (Id == null)
            {
                Id = "00000000-0000-0000-0000-000000000000";
            }

            var result = (from vim in _unitOfWork.ViewItensManutencao.GetAll()
                            where vim.ManutencaoId == Guid.Parse(Id) && (vim.Status == "Manutenção" || vim.Status == "Baixada")
                            select new
                            {
                                vim.ItemManutencaoId,
                                vim.ManutencaoId,
                                vim.TipoItem,
                                vim.NumFicha,
                                vim.DataItem,
                                vim.Resumo,
                                vim.Descricao,
                                vim.Status,
                                vim.MotoristaId,
                                vim.ViagemId,
                                vim.ImagemOcorrencia,
                                vim.NomeMotorista,
                            }).ToList().OrderByDescending(v => v.DataItem);

            return Json(new { data = result });

        }

        //Insere Nova Manutenção
        //======================
        [Route("InsereOS")]
        [HttpPost]
        public JsonResult InsereOS(Models.Manutencao manutencao)
        {

            ClaimsPrincipal currentUser = this.User;
            var currentUserAspId = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;

            manutencao.IdUsuarioAlteracao = currentUserAspId;

            if (manutencao.ManutencaoId == Guid.Empty)
            {
                _unitOfWork.Manutencao.Add(manutencao);
            }
            else
            {
                _unitOfWork.Manutencao.Update(manutencao);
            }

            _unitOfWork.Save();

            return new JsonResult(new { data = manutencao.ManutencaoId, message = "OS Registrada com Sucesso!" });
        }

        //Insere Novo Item de  Manutenção
        //===============================
        [Route("InsereItemOS")]
        [HttpPost]
        public JsonResult InsereItemOS(Models.ItensManutencao itensManutencao)
        {
            _unitOfWork.ItensManutencao.Add(itensManutencao);

            if (itensManutencao.ViagemId != null)
            {
                var Viagens = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ViagemId == itensManutencao.ViagemId);
                Viagens.StatusOcorrencia = itensManutencao.Status;
                if (itensManutencao.Status == "Baixada")
                {
                    Viagens.DescricaoSolucaoOcorrencia = "Baixada na OS nº " + itensManutencao.NumOS + " de " + itensManutencao.DataOS;
                }
                Viagens.ItemManutencaoId = itensManutencao.ItemManutencaoId;
                _unitOfWork.Viagem.Update(Viagens);
            }

            _unitOfWork.Save();

            return new JsonResult(new { message = "Item da OS Adicionado com Sucesso!" });
        }

        //Apaga Conexão Viagem-OS
        //=======================
        [Route("ApagaConexaoOcorrencia")]
        [HttpPost]
        public JsonResult ApagaConexaoOcorrencia(Models.Viagem viagem)
        {

            // ---- Remove a conexão entre OS e Ocorrência
            var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ItemManutencaoId == viagem.ItemManutencaoId);
            objViagem.StatusOcorrencia = "Aberta";
            objViagem.ItemManutencaoId = null;
            _unitOfWork.Viagem.Update(objViagem);

            _unitOfWork.Save();

            // ----- Apaga o Item de Ocorrência da OS
            var objItemOS = _unitOfWork.ItensManutencao.GetFirstOrDefault(im => im.ItemManutencaoId == viagem.ItemManutencaoId);
            _unitOfWork.ItensManutencao.Remove(objItemOS);

            _unitOfWork.Save();


            return new JsonResult(new { message = "Item da OS Adicionado com Sucesso!" });
        }


        //Apaga Conexão Pendência-OS
        //=========================
        [Route("ApagaConexaoPendencia")]
        [HttpPost]
        public JsonResult ApagaConexaoPendencia(Models.ItensManutencao itensManutencao)
        {

            // ---- Remove a conexão entre OS e Ocorrência
            var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ItemManutencaoId == itensManutencao.ItemManutencaoId);
            objViagem.StatusOcorrencia = "Pendente";
            objViagem.ItemManutencaoId = null;
            _unitOfWork.Viagem.Update(objViagem);

            // ----- Remove a conexão entre OS e Pendência
            var objItemOS = _unitOfWork.ItensManutencao.GetFirstOrDefault(im => im.ItemManutencaoId == itensManutencao.ItemManutencaoId);
            objItemOS.Status = "Pendente";
            objItemOS.ManutencaoId = null;
            _unitOfWork.ItensManutencao.Update(objItemOS);


            _unitOfWork.Save();

            return new JsonResult(new { message = "Item da OS Adicionado com Sucesso!" });
        }



        //Apaga Conexão Viagem-OS
        //=======================
        [Route("ApagaItens")]
        [HttpPost]
        public JsonResult ApagaItens(Models.ItensManutencao itensManutencao)
        {

            // ----- Apaga o Item de Ocorrência da OS
            var objItemOS = _unitOfWork.ItensManutencao.GetAll(im => (im.ManutencaoId == itensManutencao.ManutencaoId));

            foreach (var ItemOS in objItemOS)
            {

                // ---- Remove a conexão entre OS e Ocorrência
                var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ItemManutencaoId == ItemOS.ItemManutencaoId);

                if (objViagem != null)
                {
                    objViagem.StatusOcorrencia = "Pendente";
                    objViagem.ItemManutencaoId = null;
                    _unitOfWork.Viagem.Update(objViagem);
                }

                _unitOfWork.ItensManutencao.Remove(ItemOS);

                _unitOfWork.Save();

            }


            return new JsonResult(new { message = "Item da OS Adicionado com Sucesso!" });
        }


        //Apaga OS/Manutenção
        //===================
        [Route("DeleteOS")]
        [HttpGet]
        public JsonResult DeleteOS(string Id)
        {

            // ---- Percorre os Itens de Manutenção, Remove a Conexão com Viagem e Apaga-os
            //=============================================================================
            var objItemOS = _unitOfWork.ItensManutencao.GetAll(im => im.ManutencaoId == Guid.Parse(Id));
            foreach (var itemOS in objItemOS)
            {
                var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ItemManutencaoId == itemOS.ItemManutencaoId);
                if (objViagem != null)
                {
                    objViagem.StatusOcorrencia = "Aberta";
                    objViagem.ItemManutencaoId = null;
                    objViagem.DescricaoSolucaoOcorrencia = null;
                    _unitOfWork.Viagem.Update(objViagem);
                }

                _unitOfWork.ItensManutencao.Remove(itemOS);
            }

            //------Remove o Registro de Manutenção
            //=====================================
            var objManutencao = _unitOfWork.Manutencao.GetFirstOrDefault(m => m.ManutencaoId == Guid.Parse(Id));
            _unitOfWork.Manutencao.Remove(objManutencao);


            _unitOfWork.Save();

            return new JsonResult(new { success = true, message = "OS Excluída com Sucesso!" });
        }


        //Fecha Manutenção/OS
        //======================
        [Route("FechaOS")]
        [HttpPost]
        public JsonResult FechaOS(Models.Manutencao manutencao)
        {
            var objManutencao = _unitOfWork.Manutencao.GetFirstOrDefault(m => m.ManutencaoId == manutencao.ManutencaoId);

            objManutencao.StatusOS = "Fechada";
            objManutencao.DataDevolucao = manutencao.DataDevolucao;
            objManutencao.ResumoOS = manutencao.ResumoOS;

            if (manutencao.VeiculoReservaId != null)
            {
                objManutencao.ReservaEnviado = true;
            }
            _unitOfWork.Manutencao.Update(objManutencao);

            _unitOfWork.Save();

            return new JsonResult(new { data = manutencao.ManutencaoId, message = "OS Baixada com Sucesso!" });
        }

        //Zera Itens Manutenção/OS (coloca como pendência)
        //================================================
        [Route("ZeraItensOS")]
        [HttpPost]
        public JsonResult ZeraItensOS(Models.ItensManutencao manutencao)
        {
            var objItensPendencia = _unitOfWork.ItensManutencao.GetAll(im => im.ManutencaoId == manutencao.ManutencaoId);

            foreach (var item in objItensPendencia)
            {
                item.Status = "Pendente";
                _unitOfWork.ItensManutencao.Update(item);

                //-------Procura Ocorrências Ligadas à Manutenção
                var ObjOcorrencias = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ItemManutencaoId == item.ItemManutencaoId);
                if (ObjOcorrencias != null)
                {
                    ObjOcorrencias.StatusOcorrencia = "Pendente";
                    ObjOcorrencias.DescricaoSolucaoOcorrencia= "";
                    _unitOfWork.Viagem.Update(ObjOcorrencias);
                }
            }

            _unitOfWork.Save();

            return new JsonResult(new { data = manutencao.ManutencaoId, message = "OS Baixada com Sucesso!" });
        }


        //Recupera os nomes dos Lavadores
        //===============================
        [Route("RecuperaLavador")]
        public IActionResult RecuperaLavador()
        {

            var objLavador = _unitOfWork.Lavador.GetAll();

            return Json(new { data = objLavador.ToList()});
        }


        [Route("InsereLavagem")]
        [Consumes("application/json")]
        public IActionResult InsereLavagem([FromBody] Lavagem lavagem)
        {

            //Insere Lavagem
            //===============
            var objLavagem = new Lavagem();
            objLavagem.Data = lavagem.Data;
            objLavagem.Horario = lavagem.Horario;
            objLavagem.VeiculoId = lavagem.VeiculoId;
            objLavagem.MotoristaId= lavagem.MotoristaId;

            _unitOfWork.Lavagem.Add(objLavagem);

            _unitOfWork.Save();

            return Json(new { success = true, message = "Lavagem Cadastrada com Sucesso!", lavagemId = objLavagem.LavagemId });
        }

        [Route("InsereLavadoresLavagem")]
        [Consumes("application/json")]
        public IActionResult InsereLavadoresLavagem([FromBody] LavadoresLavagem lavadoreslavagem)
        {

            //Insere LavadoresLavagem
            //=======================
            var objLavadoresLavagem = new LavadoresLavagem();
            objLavadoresLavagem.LavagemId = lavadoreslavagem.LavagemId;
            objLavadoresLavagem.LavadorId = lavadoreslavagem.LavadorId;

            _unitOfWork.LavadoresLavagem.Add(objLavadoresLavagem);

            _unitOfWork.Save();

            return Json(new { success = true, message = "Lavadores Cadastrados com Sucesso!"});
        }


        [Route("ListaLavagens")]
        [HttpGet]
        public IActionResult ListaLavagens(string id)
        {
            var result = (from vl in _unitOfWork.ViewLavagem.GetAll()
                          select new
                          {
                              vl.LavagemId,
                              vl.Data,
                              Horario = DateTime.Parse(vl.Horario).ToString("HH:mm"),
                              vl.DescricaoVeiculo,
                              vl.Nome,
                              vl.Lavadores,
                          }).ToList();

            return Json(new { data = result });

        }

        [Route("ListaLavagemVeiculos")]
        [HttpGet]
        public IActionResult ListaLavagemVeiculos(Guid id)
        {
            var result = (from vl in _unitOfWork.ViewLavagem.GetAll()
                          where vl.VeiculoId == id
                          select new
                          {
                              vl.LavagemId,
                              vl.Data,
                              Horario = DateTime.Parse(vl.Horario).ToString("HH:mm"),
                              vl.DescricaoVeiculo,
                              vl.Nome,
                              vl.Lavadores,
                          }).ToList();

            return Json(new { data = result });

        }

        [Route("ListaLavagemMotoristas")]
        [HttpGet]
        public IActionResult ListaLavagemMotoristas(Guid id)
        {
            var result = (from vl in _unitOfWork.ViewLavagem.GetAll()
                          where vl.MotoristaId == id
                          select new
                          {
                              vl.LavagemId,
                              vl.Data,
                              Horario = DateTime.Parse(vl.Horario).ToString("HH:mm"),
                              vl.DescricaoVeiculo,
                              vl.Nome,
                              vl.Lavadores,
                          }).ToList();

            return Json(new { data = result });

        }


        [Route("ListaLavagemLavadores")]
        [HttpGet]
        public IActionResult ListaLavagemLavadores(Guid id)
        {
            var objLavagens = (from vl in _unitOfWork.ViewLavagem.GetAll()
                          select new
                          {
                              vl.LavagemId,
                              vl.Data,
                              Horario = DateTime.Parse(vl.Horario).ToString("HH:mm"),
                              vl.DescricaoVeiculo,
                              vl.Nome,
                              vl.Lavadores,
                              vl.LavadoresId,
                          }).ToList();

            var objLavadores = _unitOfWork.Lavador.GetAll();


            foreach (var lavador in objLavadores)
            {
                if (lavador.LavadorId == id)
                {
                }
                else
                {
                    var lavagens = objLavagens.Count;

                    for (int i = 0; i < lavagens; i++)
                    {
                        if (objLavagens[i].LavadoresId.Contains(id.ToString().ToUpper()))
                        {
                        }
                        else
                        {
                            objLavagens.RemoveAt(i);
                            lavagens--;
                            i = -1;
                        }
                    }
                }
            }


            return Json(new { data = objLavagens });

        }


        [Route("ListaLavagensData")]
        [HttpGet]
        public IActionResult ListaLavagensData(string id)
        {
            var result = (from vl in _unitOfWork.ViewLavagem.GetAll()
                          where vl.Data == id
                          select new
                          {
                              vl.LavagemId,
                              vl.Data,
                              Horario = DateTime.Parse(vl.Horario).ToString("HH:mm"),
                              vl.DescricaoVeiculo,
                              vl.Nome,
                              vl.Lavadores,
                          }).ToList();

            return Json(new { data = result });

        }

        [Route("ApagaLavagem")]
        [HttpPost]
        public IActionResult ApagaLavagem(Lavagem lavagem)
        {
            if (lavagem != null && lavagem.LavagemId != Guid.Empty)
            {
                var objFromDb = _unitOfWork.Lavagem.GetFirstOrDefault(u => u.LavagemId == lavagem.LavagemId);
                if (objFromDb != null)
                {

                    var objLavadoresLavagem = _unitOfWork.LavadoresLavagem.GetAll(ll => ll.LavagemId == lavagem.LavagemId);
                    foreach (var lavadorlavagem in objLavadoresLavagem)
                    {
                        _unitOfWork.LavadoresLavagem.Remove(lavadorlavagem);
                        _unitOfWork.Save();

                    }

                    _unitOfWork.Lavagem.Remove(objFromDb);
                    _unitOfWork.Save();
                    return Json(new { success = true, message = "Lavagem removida com sucesso" });
                }
            }
            return Json(new { success = false, message = "Erro ao apagar Lavagem" });
        }


    }
}
