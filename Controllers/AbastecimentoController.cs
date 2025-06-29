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
    public class AbastecimentoController : Controller
    {
        private readonly ILogger<AbastecimentoController> _logger;
        private IHostingEnvironment _hostingEnvironment;
        private readonly IUnitOfWork _unitOfWork;

        public AbastecimentoController(ILogger<AbastecimentoController> logger, IHostingEnvironment hostingEnvironment, IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _unitOfWork = unitOfWork;
        }


        [BindProperty]
        public Models.Abastecimento AbastecimentoObj { get; set; }


        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]

        public IActionResult Get()
        {
            return Json(new { data = _unitOfWork.ViewAbastecimentos.GetAll().OrderByDescending(va => va.DataHora)});
        }

        [Route("AbastecimentoVeiculos")]
        [HttpGet]
        public IActionResult AbastecimentoVeiculos(Guid Id)
        {
            return Json(new { data = _unitOfWork.ViewAbastecimentos.GetAll().Where(va => va.VeiculoId == Id).OrderByDescending(va => va.DataHora) });
        }

        [Route("AbastecimentoCombustivel")]
        [HttpGet]
        public IActionResult AbastecimentoCombustivel(Guid Id)
        {
            return Json(new { data = _unitOfWork.ViewAbastecimentos.GetAll().Where(va => va.CombustivelId == Id).OrderByDescending(va => va.DataHora) });
        }

        [Route("AbastecimentoUnidade")]
        [HttpGet]
        public IActionResult AbastecimentoUnidade(Guid Id)
        {
            return Json(new { data = _unitOfWork.ViewAbastecimentos.GetAll().Where(va => va.UnidadeId == Id).OrderByDescending(va => va.DataHora) });
        }

        [Route("AbastecimentoMotorista")]
        [HttpGet]
        public IActionResult AbastecimentoMotorista(Guid Id)
        {
            return Json(new { data = _unitOfWork.ViewAbastecimentos.GetAll().Where(va => va.MotoristaId == Id).OrderByDescending(va => va.DataHora) });
        }

        [Route("AbastecimentoData")]
        [HttpGet]
        public IActionResult AbastecimentoData(string dataAbastecimento)
        {
            return Json(new { data = _unitOfWork.ViewAbastecimentos.GetAll().Where(va => va.Data == dataAbastecimento).OrderByDescending(va => va.DataHora) });
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
                            if (j == 5 || j == 7 || j == 10 || j == 11 || j == 12 || j == 13 || j == 14 || j == 15)
                            {
                                sb.Append("<th>" + cell.ToString() + "</th>");

                            }
                        //}
                    }
                    //Colunas de Consumo
                    sb.Append("<th>" + "Consumo" + "</th>");
                    sb.Append("<th>" + "Média" + "</th>");

                    sb.Append("</tr></thead>");


                    //******************** Lê o arquivo Excel *************
                    //=====================================================

                    try
                    {
                        using (TransactionScope scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TimeSpan(0, 30, 30)))
                        {

                            sb.AppendLine("<tbody><tr>");
                            for (int i = (sheet.FirstRowNum + 1); i <= sheet.LastRowNum; i++) //Read Excel File
                            {
                                IRow row = sheet.GetRow(i);
                                if (row == null) continue;
                                if (row.Cells.All(d => d.CellType == CellType.Blank)) continue;
                                AbastecimentoObj = new Abastecimento();
                                for (int j = row.FirstCellNum; j < cellCount; j++)
                                {
                                    if (row.GetCell(j) != null)
                                    {
                                        //----- Confere se essa data já não foi importada -------
                                        //=======================================================
                                        if (i == 1)
                                        {
                                            if (j == 0)
                                            {
                                                var objFromDb = _unitOfWork.Abastecimento.GetFirstOrDefault(u => u.DataHora == Convert.ToDateTime(row.GetCell(j).ToString()));
                                                if (objFromDb != null)
                                                {
                                                    return Json(new { success = false, message = "Os registros pra o dia " + Convert.ToDateTime(row.GetCell(j).ToString()) + " já foram importados!" });
                                                }
                                            }
                                        }


                                        //Célula da Data
                                        //--------------
                                        if (j == 7)
                                        {
                                            AbastecimentoObj.DataHora = Convert.ToDateTime(row.GetCell(j).ToString());
                                            sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                        }

                                        //Célula do Veículo
                                        //-----------------
                                        if (j == 5)
                                        {
                                            string placaVeiculo = row.GetCell(j).ToString();

                                            var veiculoObj = _unitOfWork.Veiculo.GetFirstOrDefault(m => m.Placa == placaVeiculo);
                                            if (veiculoObj != null)
                                            {
                                                AbastecimentoObj.VeiculoId = veiculoObj.VeiculoId;
                                                sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                            }
                                            else
                                            {
                                                return Json(new { success = false, message = "Veículo de placa <b>" + placaVeiculo + "</b> não cadastrado - Registro na Linha <b>" + (i + 1)  + "</b> da tabela" });
                                            }
                                        }

                                        //Célula do Motorista
                                        //-------------------
                                        if (j == 10)
                                        {
                                            string pontoMotorista = row.GetCell(j).ToString();

                                            var motoristaObj = _unitOfWork.Motorista.GetFirstOrDefault(m => m.Ponto == pontoMotorista);

                                            if (motoristaObj != null)
                                            {
                                                AbastecimentoObj.MotoristaId = motoristaObj.MotoristaId;
                                                sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                            }
                                            else
                                            {
                                                return Json(new { success = false, message = "Motorista de Ponto <b>" + pontoMotorista + "</b> não cadastrado - Registro na Linha <b>" + (i + 1) + "</b> da tabela" });
                                            }
                                        }

                                        //Célula do Hodometro
                                        //-------------------
                                        if (j == 12)
                                        {
                                            AbastecimentoObj.Hodometro = Convert.ToInt32(row.GetCell(j).ToString());
                                            sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                        }

                                        //Célula do Km Rodado
                                        //-------------------
                                        if (j == 11)
                                        {
                                            AbastecimentoObj.KmRodado = Convert.ToInt32(row.GetCell(12).ToString()) - Convert.ToInt32(row.GetCell(11).ToString());
                                            sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                        }

                                        //Célula do Combustível
                                        //---------------------
                                        if (j == 13)
                                        {
                                            if (row.GetCell(j).ToString() == "GASOLINA")
                                            {
                                                AbastecimentoObj.CombustivelId = Guid.Parse("F668F660-8380-4DF3-90CD-787DB06FE734");
                                            }
                                            else
                                            {
                                                AbastecimentoObj.CombustivelId = Guid.Parse("A69AA86A-9162-4242-AB9A-8B184E04C4DA");
                                            }
                                            sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                        }

                                        //Célula do valor unitário
                                        //------------------------
                                        if (j == 14)
                                        {
                                            AbastecimentoObj.ValorUnitario = Convert.ToDouble(row.GetCell(j).ToString());
                                            sb.Append("<td>" + Math.Round((double)AbastecimentoObj.ValorUnitario, 2).ToString("0.00") + "</td>");
                                        }

                                        //Célula da Quantidade
                                        //--------------------
                                        if (j == 15)
                                        {
                                            AbastecimentoObj.Litros = Convert.ToDouble(row.GetCell(j).ToString());
                                            sb.Append("<td>" + Math.Round((double)AbastecimentoObj.Litros, 2).ToString("0.00") + "</td>");
                                        }

                                    }
                                }

                                //Células de Consumo
                                sb.Append("<td>" + Math.Round(((double)AbastecimentoObj.KmRodado/(double)AbastecimentoObj.Litros), 2).ToString("0.00") + "</td>");
                                var mediaveiculo = _unitOfWork.ViewMediaConsumo.GetFirstOrDefault(v => v.VeiculoId == AbastecimentoObj.VeiculoId);
                                if (mediaveiculo != null)
                                {
                                    sb.Append("<td>" + mediaveiculo.ConsumoGeral + "</td>");
                                }
                                else
                                {
                                    sb.Append("<td>" + Math.Round(((double)AbastecimentoObj.KmRodado / (double)AbastecimentoObj.Litros), 2).ToString("0.00") + "</td>");
                                }

                                sb.AppendLine("</tr>");
                                _unitOfWork.Abastecimento.Add(AbastecimentoObj);
                                _unitOfWork.Save();
                            }

                            sb.Append("</tbody></table>");
                            scope.Complete();

                        }
                    }
                    catch (Exception)
                    {

                        throw;
                    }

                }
            }
            return Json(new { success = true, message = "Planilha Importada com Sucesso", response = this.Content(sb.ToString()) });

        }

        [Route("MotoristaList")]
        [HttpGet]
        public IActionResult MotoristaList()
        {

            var result = _unitOfWork.ViewMotoristas.GetAll().OrderBy(vm => vm.Nome);

             return Json(new { data = result });

        }

        [Route("UnidadeList")]
        [HttpGet]
        public IActionResult UnidadeList()
        {

            var result = _unitOfWork.Unidade.GetAll().OrderBy(u => u.Descricao);

            return Json(new { data = result });

        }

        [Route("CombustivelList")]
        [HttpGet]
        public IActionResult CombustivelList()
        {

            var result = _unitOfWork.Combustivel.GetAll().OrderBy(u => u.Descricao);

            return Json(new { data = result });

        }

        [Route("VeiculoList")]
        [HttpGet]
        public IActionResult VeiculoList()
        {

            var result = (from v in _unitOfWork.Veiculo.GetAll()
                          join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                          join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                          orderby v.Placa
                          select new
                          {
                              v.VeiculoId,

                              PlacaMarcaModelo = v.Placa + " - " + ma.DescricaoMarca + "/" + m.DescricaoModelo,

                          }).OrderBy(v => v.PlacaMarcaModelo);


            return Json(new { data = result });

        }

        [Route("EditaKm")]
        [Consumes("application/json")]
        public IActionResult EditaKm([FromBody] Abastecimento abastecimento)
        {

            //Edita a Quilometragem
            //=====================
            var objAbastecimento = _unitOfWork.Abastecimento.GetFirstOrDefault(a => a.AbastecimentoId == abastecimento.AbastecimentoId);
            objAbastecimento.KmRodado= abastecimento.KmRodado;

            _unitOfWork.Abastecimento.Update(objAbastecimento);

            _unitOfWork.Save();

            return Json(new { success = true, message = "Abastecimento atualizado com sucesso", type = 0 });
        }


        [Route("ListaRegistroCupons")]
        [HttpGet]
        public IActionResult ListaRegistroCupons(string IDapi)
        {

            var result = (from rc in _unitOfWork.RegistroCupomAbastecimento.GetAll()
                          orderby rc.DataRegistro descending
                          select new
                          {
                              DataRegistro = rc.DataRegistro.ToShortDateString(),
                              rc.RegistroCupomId
                          });


            return Json(new { data = result });

        }

        [Route("PegaRegistroCupons")]
        [HttpGet]
        public IActionResult PegaRegistroCupons(string IDapi)
        {

            var objRegistro = _unitOfWork.RegistroCupomAbastecimento.GetFirstOrDefault(rc => rc.RegistroCupomId == Guid.Parse(IDapi));

            return Json(new { RegistroPDF = objRegistro.RegistroPDF }); 
        }

        [Route("PegaRegistroCuponsData")]
        [HttpGet]
        public IActionResult PegaRegistroCuponsData(string id)
        {

            var result = (from rc in _unitOfWork.RegistroCupomAbastecimento.GetAll()
                          where rc.DataRegistro == DateTime.Parse(id)
                          orderby rc.DataRegistro descending
                          select new
                          {
                              DataRegistro = rc.DataRegistro.ToShortDateString(),
                              rc.RegistroCupomId
                          });


            return Json(new { data = result });

        }

        [Route("DeleteRegistro")]
        [HttpGet]
        public IActionResult DeleteRegistro(string IDapi)
        {

            var objRegistro = _unitOfWork.RegistroCupomAbastecimento.GetFirstOrDefault(rc => rc.RegistroCupomId == Guid.Parse(IDapi));

            _unitOfWork.RegistroCupomAbastecimento.Remove(objRegistro);
            _unitOfWork.Save();

            return Json(new { success = true, message = "Registro excluído com sucesso!" });
        }


    }
}
