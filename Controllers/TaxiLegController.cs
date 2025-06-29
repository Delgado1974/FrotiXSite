using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using FrotiX.Models;
using Microsoft.AspNetCore.Hosting;
using System.Text;
using System.IO;
using Microsoft.AspNetCore.Http;
using NPOI.SS.UserModel;
using NPOI.HSSF.UserModel;
using NPOI.XSSF.UserModel;
using FrotiX.Repository.IRepository;
using System.Transactions;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaxiLegController : Controller
    {
        private readonly ILogger<TaxiLegController> _logger;
        private IHostingEnvironment _hostingEnvironment;
        private readonly IUnitOfWork _unitOfWork;

        public TaxiLegController(ILogger<TaxiLegController> logger, IHostingEnvironment hostingEnvironment, IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _unitOfWork = unitOfWork;
        }


        [BindProperty]
        public Models.CorridasTaxiLeg TaxiLegObj { get; set; }
        public Models.CorridasCanceladasTaxiLeg TaxiLegCanceladasObj { get; set; }


        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]

        public IActionResult Get()
        {
            //return Json(new { data = _unitOfWork.ViewTaxiLegs.GetAll().OrderByDescending(va => va.DataHora)});
            return Json(true);
        }

        [Route("Import")]
        [HttpPost]
        public ActionResult Import()
        {
            IFormFile file = Request.Form.Files[0];
            string folderName = "DadosEditaveis/UploadExcel";
            string webRootPath = _hostingEnvironment.WebRootPath;
            string newPath = Path.Combine(webRootPath, folderName);
            StringBuilder sb = new StringBuilder();
            if (!Directory.Exists(newPath))
            {
                Directory.CreateDirectory(newPath);
            }
            if (file.Length > 0)
            {
                string sFileExtension = Path.GetExtension(file.FileName).ToLower();
                ISheet sheet;
                string fullPath = Path.Combine(newPath, file.FileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    file.CopyTo(stream);
                    stream.Position = 0;
                    if (sFileExtension == ".xls")
                    {
                        HSSFWorkbook hssfwb = new HSSFWorkbook(stream); //This will read the Excel 97-2000 formats  
                        sheet = hssfwb.GetSheetAt(0); //get first sheet from workbook  
                    }
                    else
                    {
                        XSSFWorkbook hssfwb = new XSSFWorkbook(stream); //This will read 2007 Excel format  
                        sheet = hssfwb.GetSheetAt(0); //get first sheet from workbook   
                    }


                    //******************** Faz o Cabeçalho *************
                    //==================================================
                    IRow headerRow = sheet.GetRow(0); //Get Header Row
                    int cellCount = headerRow.LastCellNum;
                    sb.Append("<table id='tblImportacao' class='display' style='width: 100%'><thead><tr>");
                    for (int j = 0; j < cellCount; j++)
                    {
                        NPOI.SS.UserModel.ICell cell = headerRow.GetCell(j);
                        //if (cell == null || string.IsNullOrWhiteSpace(cell.ToString()))
                        //{
                        //if (j == 5 || j == 7 || j == 10 || j == 11 || j == 12 || j == 13 || j == 14 || j == 15)
                        //{
                        sb.Append("<th>" + cell.ToString() + "</th>");

                        //}
                        //}
                    }
                    //Coluna de Duração
                    sb.Append("<th>" + "Duração" + "</th>");

                    //Coluna de Espera
                    sb.Append("<th>" + "Espera" + "</th>");

                    sb.Append("</tr></thead>");


                    //******************** Lê o arquivo Excel *************
                    //=====================================================

                    //try
                    //{
                    //using (TransactionScope scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TimeSpan(0, 30, 30)))
                    //{

                    sb.AppendLine("<tbody><tr>");
                    for (int i = (sheet.FirstRowNum + 1); i <= sheet.LastRowNum; i++) //Read Excel File
                    {
                        IRow row = sheet.GetRow(i);
                        if (row == null) continue;
                        if (row.Cells.All(d => d.CellType == CellType.Blank)) continue;
                        TaxiLegObj = new CorridasTaxiLeg();
                        for (int j = row.FirstCellNum; j < cellCount; j++)
                        {
                            //Célula da Origem
                            //--------------
                            if (j == 0)
                            {
                                TaxiLegObj.Origem = row.GetCell(j).ToString();
                                sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                            }

                            //Célula do Setor
                            //--------------
                            if (j == 1)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegObj.Setor = row.GetCell(j).ToString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da Descrição do Setor
                            //----------------------------
                            if (j == 2)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegObj.DescSetor = row.GetCell(j).ToString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da UNidade
                            //-----------------
                            if (j == 3)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegObj.Unidade = row.GetCell(j).ToString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da Descrição da Unidade
                            //------------------------------
                            if (j == 4)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegObj.DescUnidade = row.GetCell(j).ToString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da Qtd de Passageiros
                            //------------------------------
                            if (j == 5)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    try
                                    {
                                        TaxiLegObj.QtdPassageiros= int.Parse(row.GetCell(j).ToString());
                                    }
                                    catch (Exception)
                                    {
                                        TaxiLegObj.QtdPassageiros = 1;
                                    }
                                    sb.Append("<td>" + TaxiLegObj.QtdPassageiros + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula do Motivo de Uso
                            //------------------------------
                            if (j == 6)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegObj.MotivoUso = row.GetCell(j).ToString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da Data
                            //--------------
                            if (j == 7)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegObj.DataAgenda = Convert.ToDateTime(row.GetCell(j).ToString());
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da Hora Agenda
                            //-----------------------
                            if (j == 8)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegObj.HoraAgenda = DateTime.Parse(row.GetCell(j).ToString()).ToShortTimeString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da Hora Aceite
                            //-----------------------
                            if (j == 9)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    try
                                    {
                                        TaxiLegObj.HoraAceite = DateTime.Parse(row.GetCell(j).ToString()).ToShortTimeString();
                                    }
                                    catch (Exception)
                                    {
                                        TaxiLegObj.HoraAceite = TaxiLegObj.HoraAgenda;
                                    }
                                    sb.Append("<td>" + TaxiLegObj.HoraAceite + "</td>");
                                }
                                else
                                {
                                    TaxiLegObj.HoraAceite = TaxiLegObj.HoraAgenda;
                                    sb.Append("<td>" + TaxiLegObj.HoraAceite + "</td>");
                                }
                            }

                            //Célula da Hora Local
                            //-----------------------
                            if (j == 10)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    try
                                    {
                                        TaxiLegObj.HoraLocal = DateTime.Parse(row.GetCell(j).ToString()).ToShortTimeString();
                                    }
                                    catch (Exception)
                                    {
                                        TaxiLegObj.HoraLocal = TaxiLegObj.HoraAceite;
                                    }
                                    sb.Append("<td>" + TaxiLegObj.HoraLocal + "</td>");
                                }
                                else
                                {
                                    TaxiLegObj.HoraLocal = TaxiLegObj.HoraAceite;
                                    sb.Append("<td>" + TaxiLegObj.HoraLocal + "</td>");
                                }
                            }

                            //Célula da Hora Inicio
                            //-----------------------
                            if (j == 11)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    try
                                    {
                                        TaxiLegObj.HoraInicio = DateTime.Parse(row.GetCell(j).ToString()).ToShortTimeString();
                                    }
                                    catch (Exception)
                                    {
                                        TaxiLegObj.HoraInicio = TaxiLegObj.HoraAceite;
                                    }
                                    sb.Append("<td>" + TaxiLegObj.HoraInicio + "</td>");
                                }
                                else
                                {
                                    TaxiLegObj.HoraInicio = TaxiLegObj.HoraAceite;
                                    sb.Append("<td>" + TaxiLegObj.HoraInicio + "</td>");
                                }
                            }

                            //Célula da Hora Final
                            //-----------------------
                            if (j == 12)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegObj.HoraFinal = DateTime.Parse(row.GetCell(j).ToString()).ToShortTimeString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da Quilometragem
                            //-----------------------
                            if (j == 13)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegObj.KmReal = Double.Parse(row.GetCell(j).ToString());
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            ////Célula do Valor TOtal
                            ////-----------------------
                            //if (j == 14)
                            //{
                            //    if (row.GetCell(j) != null)
                            //    {
                            //        TaxiLegObj.Valor = Math.Round(Double.Parse(row.GetCell(j).ToString()),2);
                            //        sb.Append("<td>" + Math.Round(Double.Parse(row.GetCell(j).ToString()), 2) + "</td>");
                            //    }
                            //}

                            //Célula da Quantidade de Estrelas
                            //--------------------------------
                            if (j == 14)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegObj.QtdEstrelas = int.Parse(row.GetCell(j).ToString());
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da Avaliação
                            //-------------------
                            if (j == 15)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegObj.Avaliacao = row.GetCell(j).ToString();
                                }
                                else
                                {
                                    TaxiLegObj.Avaliacao = "N/A";
                                }
                                sb.Append("<td>" + TaxiLegObj.Avaliacao + "</td>");
                            }
                        }




                        //Calcula o Tempo de Duração da Viagem
                        //====================================
                        DateTime startTime = DateTime.Parse(TaxiLegObj.HoraInicio);
                        DateTime endTime = DateTime.Parse(TaxiLegObj.HoraFinal);

                        TimeSpan span = endTime.Subtract(startTime);

                        TaxiLegObj.Duracao = (int?)span.TotalMinutes;

                        if (TaxiLegObj.Duracao < 0)
                        {
                            DateTime startTimeAnterior = DateTime.Parse(TaxiLegObj.HoraInicio);
                            DateTime endTimeAnterior = DateTime.Parse("00:00:00");
                            endTimeAnterior = endTimeAnterior.AddDays(1);

                            TimeSpan spanAnterior = endTimeAnterior.Subtract(startTimeAnterior);

                            DateTime startTimePosterior = DateTime.Parse("00:00:00");
                            DateTime endTimePosterior = DateTime.Parse(TaxiLegObj.HoraFinal);

                            TimeSpan spanPosterior = endTimePosterior.Subtract(startTimePosterior);

                            TaxiLegObj.Duracao = (int?)spanAnterior.TotalMinutes + (int?)spanPosterior.TotalMinutes;
                        }

                        //Calcula o Tempo de Espera da Viagem
                        //===================================
                        startTime = DateTime.Parse(TaxiLegObj.HoraAceite);
                        endTime = DateTime.Parse(TaxiLegObj.HoraLocal);

                        span = endTime.Subtract(startTime);

                        TaxiLegObj.Espera = (int?)span.TotalMinutes;

                        if (TaxiLegObj.Espera < 0)
                        {
                            DateTime startTimeAnterior = DateTime.Parse(TaxiLegObj.HoraAgenda);
                            DateTime endTimeAnterior = DateTime.Parse("00:00:00");
                            endTimeAnterior = endTimeAnterior.AddDays(1);

                            TimeSpan spanAnterior = endTimeAnterior.Subtract(startTimeAnterior);

                            DateTime startTimePosterior = DateTime.Parse("00:00:00");
                            DateTime endTimePosterior = DateTime.Parse(TaxiLegObj.HoraAgenda);

                            TimeSpan spanPosterior = endTimePosterior.Subtract(startTimePosterior);

                            TaxiLegObj.Espera = (int?)spanAnterior.TotalMinutes + (int?)spanPosterior.TotalMinutes;
                        }


                        //Coluna da Duração
                        sb.Append("<td>" + TaxiLegObj.Duracao.ToString() + "</td>");

                        //Coluna da Espera
                        sb.Append("<td>" + TaxiLegObj.Espera.ToString() + "</td>");

                        sb.AppendLine("</tr>");



                        _unitOfWork.CorridasTaxiLeg.Add(TaxiLegObj);

                        _unitOfWork.Save();
                    }

                    sb.Append("</tbody></table>");
                    //        scope.Complete();

                    //    }
                    ////}
                    //catch (Exception)
                    //{

                    //    throw;
                    //}

                }
            }
            return Json(new { success = true, message = "Planilha Importada com Sucesso", response = this.Content(sb.ToString()) });

        }

        [Route("ImportCanceladas")]
        [HttpPost]
        public ActionResult ImportCanceladas()
        {
            IFormFile file = Request.Form.Files[0];
            string folderName = "DadosEditaveis/UploadExcel";
            string webRootPath = _hostingEnvironment.WebRootPath;
            string newPath = Path.Combine(webRootPath, folderName);
            StringBuilder sb = new StringBuilder();
            if (!Directory.Exists(newPath))
            {
                Directory.CreateDirectory(newPath);
            }
            if (file.Length > 0)
            {
                string sFileExtension = Path.GetExtension(file.FileName).ToLower();
                ISheet sheet;
                string fullPath = Path.Combine(newPath, file.FileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    file.CopyTo(stream);
                    stream.Position = 0;
                    if (sFileExtension == ".xls")
                    {
                        HSSFWorkbook hssfwb = new HSSFWorkbook(stream); //This will read the Excel 97-2000 formats  
                        sheet = hssfwb.GetSheetAt(0); //get first sheet from workbook  
                    }
                    else
                    {
                        XSSFWorkbook hssfwb = new XSSFWorkbook(stream); //This will read 2007 Excel format  
                        sheet = hssfwb.GetSheetAt(0); //get first sheet from workbook   
                    }


                    //******************** Faz o Cabeçalho *************
                    //==================================================
                    IRow headerRow = sheet.GetRow(0); //Get Header Row
                    int cellCount = headerRow.LastCellNum;
                    sb.Append("<table id='tblImportacao' class='display' style='width: 100%'><thead><tr>");
                    for (int j = 0; j < cellCount; j++)
                    {
                        NPOI.SS.UserModel.ICell cell = headerRow.GetCell(j);
                        //if (cell == null || string.IsNullOrWhiteSpace(cell.ToString()))
                        //{
                        //if (j == 5 || j == 7 || j == 10 || j == 11 || j == 12 || j == 13 || j == 14 || j == 15)
                        //{
                        sb.Append("<th>" + cell.ToString() + "</th>");

                        //}
                        //}
                    }
                    //Coluna de Espera
                    sb.Append("<th>" + "Espera" + "</th>");

                    sb.Append("</tr></thead>");


                    //******************** Lê o arquivo Excel *************
                    //=====================================================

                    sb.AppendLine("<tbody><tr>");
                    for (int i = (sheet.FirstRowNum + 1); i <= sheet.LastRowNum; i++) //Read Excel File
                    {
                        IRow row = sheet.GetRow(i);
                        if (row == null) continue;
                        if (row.Cells.All(d => d.CellType == CellType.Blank)) continue;
                        TaxiLegCanceladasObj = new CorridasCanceladasTaxiLeg();
                        for (int j = row.FirstCellNum; j < cellCount; j++)
                        {
                            //Célula da Origem
                            //--------------
                            if (j == 0)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegCanceladasObj.Origem = row.GetCell(j).ToString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula do Setor
                            //--------------
                            if (j == 1)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegCanceladasObj.Setor = row.GetCell(j).ToString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da Descrição do Setor
                            //----------------------------
                            if (j == 2)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegCanceladasObj.SetorExtra = row.GetCell(j).ToString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da UNidade
                            //-----------------
                            if (j == 3)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegCanceladasObj.Unidade = row.GetCell(j).ToString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da Descrição da Unidade
                            //------------------------------
                            if (j == 4)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegCanceladasObj.UnidadeExtra = row.GetCell(j).ToString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da Qtd de Passageiros
                            //------------------------------
                            if (j == 5)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    try
                                    {
                                        TaxiLegCanceladasObj.QtdPassageiros = int.Parse(row.GetCell(j).ToString());
                                    }
                                    catch (Exception)
                                    {
                                        TaxiLegCanceladasObj.QtdPassageiros = 1;
                                    }
                                    sb.Append("<td>" + TaxiLegCanceladasObj.QtdPassageiros + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula do Motivo de Uso
                            //------------------------------
                            if (j == 6)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegCanceladasObj.MotivoUso = row.GetCell(j).ToString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da Data
                            //--------------
                            if (j == 7)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegCanceladasObj.DataAgenda = Convert.ToDateTime(row.GetCell(j).ToString());
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da Hora Agenda
                            //-----------------------
                            if (j == 8)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegCanceladasObj.HoraAgenda = DateTime.Parse(row.GetCell(j).ToString()).ToShortTimeString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula da DataHoraCancelamento
                            //-----------------------
                            if (j == 9)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegCanceladasObj.DataHoraCancelamento = DateTime.Parse(row.GetCell(j).ToString());
                                    TaxiLegCanceladasObj.HoraCancelamento = Convert.ToDateTime(row.GetCell(j).ToString()).ToShortTimeString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula do Tipo de Cancelamento
                            //------------------------------
                            if (j == 10)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegCanceladasObj.TipoCancelamento = row.GetCell(j).ToString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }

                            //Célula do Motivo de Cancelamento
                            //--------------------------------
                            if (j == 11)
                            {
                                if (row.GetCell(j) != null)
                                {
                                    TaxiLegCanceladasObj.MotivoCancelamento = row.GetCell(j).ToString();
                                    sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td> N/A </td>");
                                }
                            }
                        }

                        DateTime startTime = DateTime.Parse(TaxiLegCanceladasObj.HoraAgenda);
                        DateTime endTime = DateTime.Parse(TaxiLegCanceladasObj.HoraCancelamento);

                        TimeSpan span = endTime.Subtract(startTime);

                        TaxiLegCanceladasObj.TempoEspera = (int?)span.TotalMinutes;

                        if (TaxiLegCanceladasObj.TempoEspera < 0)
                        {
                            DateTime startTimeAnterior = DateTime.Parse(TaxiLegCanceladasObj.HoraAgenda);
                            DateTime endTimeAnterior = DateTime.Parse("00:00:00");
                            endTimeAnterior = endTimeAnterior.AddDays(1);

                            TimeSpan spanAnterior = endTimeAnterior.Subtract(startTimeAnterior);

                            DateTime startTimePosterior = DateTime.Parse("00:00:00");
                            DateTime endTimePosterior = DateTime.Parse(TaxiLegCanceladasObj.HoraCancelamento);

                            TimeSpan spanPosterior = endTimePosterior.Subtract(startTimePosterior);

                            TaxiLegCanceladasObj.TempoEspera= (int?)spanAnterior.TotalMinutes + (int?)spanPosterior.TotalMinutes;
                        }

                        //Coluna da Duração
                        sb.Append("<td>" + TaxiLegCanceladasObj.TempoEspera.ToString() + "</td>");

                        sb.AppendLine("</tr>");

                        _unitOfWork.CorridasCanceladasTaxiLeg.Add(TaxiLegCanceladasObj);

                        _unitOfWork.Save();
                    }

                    sb.Append("</tbody></table>");

                }

                sb.Append("</tbody></table>");

                return Json(new { success = true, message = "Planilha Importada com Sucesso", response = this.Content(sb.ToString()) });

            }
            else
            {
                return Json(new { success = false, message = "Planilha Não Importada", response = this.Content(sb.ToString()) });
            }

        }

    }
}
