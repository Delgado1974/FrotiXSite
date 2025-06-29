using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using NPOI.SS.Formula.Functions;
using static Stimulsoft.Report.StiRecentConnections;


namespace FrotiX.Services
{
    [Route("api/[controller]")]
    [ApiController]
    public class Servicos
    {

        private readonly IUnitOfWork _unitOfWork;

        public Servicos(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }



        public static double CalculaCustoCombustivel(Viagem viagemObj, IUnitOfWork _unitOfWork)
        {

            var veiculoObj = _unitOfWork.ViewVeiculos.GetFirstOrDefault(v => v.VeiculoId == viagemObj.VeiculoId);

            var combustivelObj = _unitOfWork.Abastecimento.GetAll(a => a.VeiculoId == viagemObj.VeiculoId).OrderByDescending(o => o.DataHora);

            //Verifica se tem abastecimento
            double ValorCombustivel = 0;
            if (combustivelObj.FirstOrDefault() == null)
            {
                var abastecimentoObj = _unitOfWork.MediaCombustivel.GetAll(a => a.CombustivelId == veiculoObj.CombustivelId).OrderByDescending(o => o.Ano).ThenByDescending(o => o.Mes);
                ValorCombustivel = (double)abastecimentoObj.FirstOrDefault().PrecoMedio;
            }
            else
            {
                ValorCombustivel = (double)combustivelObj.FirstOrDefault().ValorUnitario;
            }

            var Quilometragem = viagemObj.KmFinal - viagemObj.KmInicial;

            var ConsumoVeiculo = Convert.ToDouble(veiculoObj.Consumo);

            //Ainda não teve Abastecimento
            if (ConsumoVeiculo == 0)
            {
                ConsumoVeiculo = 10;
            }
            var CustoViagem = (Quilometragem / ConsumoVeiculo) * ValorCombustivel;

            return (double)CustoViagem;

        }

        public static double CalculaCustoMotorista(Viagem viagemObj, IUnitOfWork _unitOfWork, ref int minutos)
        {

            var motoristaObj = _unitOfWork.Motorista.GetFirstOrDefault(m => m.MotoristaId == viagemObj.MotoristaId);

            //// ----- Verifica se Motorista é Terceirizado
            double CustoMinutoMotorista = 0;

            if (motoristaObj.ContratoId == null)
            {
                CustoMinutoMotorista = 0;
                return (0);
            }

            Guid contratoId = (Guid)motoristaObj.ContratoId;

            var repactuacaoObj = _unitOfWork.RepactuacaoContrato.GetAll(r => r.ContratoId == contratoId).ToList();

            RepactuacaoContrato topRepactuacao = repactuacaoObj.OrderByDescending(item => item.DataRepactuacao).FirstOrDefault();

            RepactuacaoTerceirizacao topMotorista = _unitOfWork.RepactuacaoTerceirizacao.GetFirstOrDefault(rt => rt.RepactuacaoContratoId == topRepactuacao.RepactuacaoContratoId);

            var valorMotorista = topMotorista.ValorMotorista;

            CustoMinutoMotorista = ((double)(((valorMotorista / 22) / 9) / 60));

            DateTime DataInicial = (DateTime)viagemObj.DataInicial;
            DateTime DataFinal = (DateTime)viagemObj.DataFinal;

            int dias = 0;
            if (DataInicial != DataFinal)
            {
                // Verifica se a viagem começa num sábado ou termina num domingo
                if (DataInicial.DayOfWeek == DayOfWeek.Saturday || DataInicial.DayOfWeek == DayOfWeek.Sunday)
                {
                    dias++;
                }
                if (DataFinal.DayOfWeek == DayOfWeek.Sunday && DataFinal != DataInicial.AddDays(1))
                {
                    dias = dias + 2;
                }

                //Elimina os fins de semana na contagem dos dias
                while (DataInicial <= DataFinal)
                {
                    if (DataInicial.DayOfWeek != DayOfWeek.Saturday && DataInicial.DayOfWeek != DayOfWeek.Sunday)
                    {
                        dias++;
                    }
                    DataInicial = DataInicial.AddDays(1);
                }
            }


            double MinutosViagem = 0;
            if (dias == 0)
            {
                DateTime HoraInicial = DateTime.Parse(viagemObj.HoraInicio?.ToString("HH:mm"));
                DateTime HoraFinal = DateTime.Parse(viagemObj.HoraFim?.ToString("HH:mm"));
                MinutosViagem = (HoraFinal.Subtract(HoraInicial).TotalMinutes);
            }
            else if (dias == 1)
            {
                //var HorasAlemDia = (DateTime.Parse(viagemObj.DataFinal?.ToString("dd/MM/yyyy") + ' ' + viagemObj.HoraFim?.ToString("HH:mm")) - DateTime.Parse(viagemObj.DataInicial?.ToString("dd/MM/yyyy") + ' ' + viagemObj.HoraInicio?.ToString("HH:mm"))).Hours;
                var HorasAlemDia = (DateTime.Parse(viagemObj.DataFinal?.ToString("dd/MM/yyyy") + ' ' + viagemObj.HoraFim?.ToString("HH:mm")) - DateTime.Parse(viagemObj.DataFinal?.ToString("dd/MM/yyyy") + ' ' + "07:00:00")).Hours;
                MinutosViagem = (9 + HorasAlemDia) * 60;
            }
            else
            {
                MinutosViagem = (dias * 9) * 60;
            }

            var CustoViagem = MinutosViagem * CustoMinutoMotorista;

            //Registra a quantidade de minutos em uma viagem
            if (minutos == -1)
            {
                minutos = (int)MinutosViagem;
            }
            else
            {
                //var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ViagemId == viagemObj.ViagemId);
                //objViagem.Minutos = (int?)MinutosViagem;
                //_unitOfWork.Viagem.Update(objViagem);
                //_unitOfWork.Save();
            }


            return (double)CustoViagem;

        }

        public static double CalculaCustoVeiculo(Viagem viagemObj, IUnitOfWork _unitOfWork)
        {


            var veiculoObj = _unitOfWork.Veiculo.GetFirstOrDefault(v => v.VeiculoId == viagemObj.VeiculoId);

            var veiculoProprio = false;

            double ValorUnitario = 0;

            if (veiculoObj.ContratoId != null)
            {
                var itemVeiculoObj = (from i in _unitOfWork.ItemVeiculoContrato.GetAll()

                                      join r in _unitOfWork.RepactuacaoContrato.GetAll() on i.RepactuacaoContratoId equals r.RepactuacaoContratoId

                                      orderby r.DataRepactuacao descending

                                      where i.ItemVeiculoId == veiculoObj.ItemVeiculoId

                                      select new
                                      {
                                          i.ValorUnitario,

                                      });

                if (itemVeiculoObj.FirstOrDefault() != null)
                {
                    ValorUnitario = (double)itemVeiculoObj.FirstOrDefault().ValorUnitario;
                }
                else
                {
                    ValorUnitario = 0;
                }

            }
            else if (veiculoObj.AtaId != null)
            {
                var itemVeiculoObj = (from i in _unitOfWork.ItemVeiculoAta.GetAll()

                                      join r in _unitOfWork.RepactuacaoAta.GetAll() on i.RepactuacaoAtaId equals r.RepactuacaoAtaId

                                      orderby r.DataRepactuacao descending

                                      where i.ItemVeiculoAtaId == veiculoObj.ItemVeiculoAtaId

                                      select new
                                      {
                                          i.ValorUnitario,

                                      });

                if (itemVeiculoObj.FirstOrDefault() != null)
                {
                    ValorUnitario = (double)itemVeiculoObj.FirstOrDefault().ValorUnitario;
                }
                else
                {
                    ValorUnitario = 0;
                }

            }
            else
            {
                veiculoProprio = true;

                //DEFINIR VALOR UNITÁRIO BASEADO NO VEÍCULO
                ValorUnitario = 100;
            }

            double CustoMinutoVeiculo = ((double)(((ValorUnitario / 30) / 24) / 60));

            DateTime DataInicial = (DateTime)viagemObj.DataInicial;
            DateTime DataFinal = (DateTime)viagemObj.DataFinal;

            int dias = 0;
            if (DataInicial != DataFinal)
            {
                dias = (DataFinal - DataInicial).Days;
            }

            double MinutosViagem = 0;
            if (dias == 0)
            {
                DateTime HoraInicial = DateTime.Parse(viagemObj.HoraInicio?.ToString("HH:mm"));
                DateTime HoraFinal = DateTime.Parse(viagemObj.HoraFim?.ToString("HH:mm"));
                MinutosViagem = (HoraFinal.Subtract(HoraInicial).TotalMinutes);
            }
            else if (dias == 1)
            {
                var HorasAlemDia = (DateTime.Parse(viagemObj.DataFinal?.ToString("dd/MM/yyyy") + ' ' + viagemObj.HoraFim?.ToString("HH:mm")) - DateTime.Parse(viagemObj.DataFinal?.ToString("dd/MM/yyyy") + ' ' + "00:00:01")).Hours;
                MinutosViagem = (24 + HorasAlemDia) * 60;
            }
            else
            {
                MinutosViagem = (dias * 24) * 60;
            }

            var CustoViagem = MinutosViagem * CustoMinutoVeiculo;

            return (double)CustoViagem;

        }


        //---------------  Conversão de HTML para texto Simples  --------------------
        //===========================================================================
        public static string ConvertHtml(string html)
        {

            if (html != null)
            {
                HtmlDocument doc = new HtmlDocument();
                doc.LoadHtml(html);

                StringWriter sw = new StringWriter();
                ConvertTo(doc.DocumentNode, sw);
                sw.Flush();
                var resultado = sw.ToString();

                if (resultado.Length >= 4)
                {
                    if (resultado != "" && resultado.Substring(0, 4) == "\r\n")
                    {
                        return resultado.Remove(0, 2);
                    }
                    else
                    {
                        return resultado;
                    }
                }
                else
                {
                    return resultado;
                }
            }
            else
            {
                return "";
            }
        }

        public static void ConvertTo(HtmlNode node, TextWriter outText)
        {
            string html;
            switch (node.NodeType)
            {
                case HtmlNodeType.Comment:
                    // don't output comments
                    break;

                case HtmlNodeType.Document:
                    ConvertContentTo(node, outText);
                    break;

                case HtmlNodeType.Text:
                    // script and style must not be output
                    string parentName = node.ParentNode.Name;
                    if ((parentName == "script") || (parentName == "style"))
                        break;

                    // get text
                    html = ((HtmlTextNode)node).Text;

                    // is it in fact a special closing node output as text?
                    if (HtmlNode.IsOverlappedClosingElement(html))
                        break;

                    // check the text is meaningful and not a bunch of whitespaces
                    if (html.Trim().Length > 0)
                    {
                        outText.Write(HtmlEntity.DeEntitize(html));
                    }
                    break;

                case HtmlNodeType.Element:
                    switch (node.Name)
                    {
                        case "p":
                            // treat paragraphs as crlf
                            outText.Write("\r\n");
                            break;
                    }

                    if (node.HasChildNodes)
                    {
                        ConvertContentTo(node, outText);
                    }
                    break;
            }
        }

        public static void ConvertContentTo(HtmlNode node, TextWriter outText)
        {
            foreach (HtmlNode subnode in node.ChildNodes)
            {
                ConvertTo(subnode, outText);
            }
        }

        [Route("Employees")]
        [HttpGet]
        public JsonResult Employees()
        {
            var result = _unitOfWork.SetorSolicitante.GetAll();
            {
                var employees = from e in result
                                select new
                                {
                                    id = e.SetorSolicitanteId,
                                    Name = e.Nome,
                                    hasChildren = (from q in _unitOfWork.SetorSolicitante.GetAll()
                                                   where (q.SetorPaiId == e.SetorSolicitanteId)
                                                   select q
                                                   ).Count() > 0
                                };

                return new JsonResult(employees.ToList());
            }
        }


        public class HierarchicalViewModel
        {
            public int ID { get; set; }
            public int? ParendID { get; set; }
            public bool HasChildren { get; set; }
            public string Name { get; set; }
        }

            public static IList<HierarchicalViewModel> GetHierarchicalData()
        {
            var result = new List<HierarchicalViewModel>()
            {
                new HierarchicalViewModel() { ID = 1, ParendID = null, HasChildren = true, Name = "Parent item" },
                new HierarchicalViewModel() { ID = 2, ParendID = 1, HasChildren = true, Name = "Parent item" },
                new HierarchicalViewModel() { ID = 3, ParendID = 1, HasChildren = false, Name = "Item" },
                new HierarchicalViewModel() { ID = 4, ParendID = 2, HasChildren = false, Name = "Item" },
                new HierarchicalViewModel() { ID = 5, ParendID = 2, HasChildren = false, Name = "Item" }
            };

            return result;
        }

        public IActionResult Read_TreeViewData(int? id)
        {
            var result = GetHierarchicalData()
                .Where(x => id.HasValue ? x.ParendID == id : x.ParendID == null)
                .Select(item => new {
                    id = item.ID,
                    Name = item.Name,
                    //expanded = item.Expanded,
                    //imageUrl = item.ImageUrl,
                    hasChildren = item.HasChildren
                });

            return new JsonResult(result);
        }


        public static string TiraAcento(string frase)
        {
            if (string.IsNullOrEmpty(frase))
            {
                return frase;
            }

            // Utiliza o encoding Latin1 (ISO-8859-1) para remover os acentos
            byte[] bytes = Encoding.GetEncoding("ISO-8859-1").GetBytes(frase);
            string resultado = Encoding.UTF8.GetString(bytes);

            // Substitui os espaços em branco por underscores
            resultado = resultado.Replace(' ', '_');

            return resultado;
        }
    }
}
