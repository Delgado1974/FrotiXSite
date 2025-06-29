using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Net.Http.Headers;
using System.IO;
using OfficeOpenXml;
using System.Text;
using System.Collections;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Abastecimento
{
    public class ImportacaoModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHostingEnvironment _hostingEnvironment;

        public ImportacaoModel(IUnitOfWork unitOfWork, IHostingEnvironment hostingEnvironment)
        {
            _unitOfWork = unitOfWork;
            _hostingEnvironment = hostingEnvironment;
        }


         public IActionResult OnPostSubmit(IFormFile file)
        {

            Console.WriteLine("Entrei por aqui");
            return RedirectToPage("./Index");

            IList<ExcelViewModel> list = new List<ExcelViewModel>();
            var validTypes = new string[] { "application/octet-stream", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel" };
            if (file == null)
            {
                ModelState.AddModelError("file", "Please select excel (.xlsx) file.");
            }

            if (file != null)
            {
                if (file.Length > 0)
                {
                    if (!validTypes.Contains(file.ContentType))
                    {
                        ModelState.AddModelError("file", "Only the following file types are allowed: .xlsx");
                    }
                }
            }

            if (!ModelState.IsValid)
            {
                return Page();
            }
            else
            {
                if (file != null)
                {
                    if (file.Length > 0)
                    {
                        if (validTypes.Contains(file.ContentType))
                        {
                            string guid = Guid.NewGuid().ToString();
                            var parsedContentDisposition = ContentDispositionHeaderValue.Parse(file.ContentDisposition);
                            string uploadPath = "Uploads\\" + guid + "";
                            string path = Path.Combine(_hostingEnvironment.WebRootPath, uploadPath);
                            Directory.CreateDirectory(path);
                            var filePath = Path.Combine(path, parsedContentDisposition.FileName.ToString());
                            FileInfo fileInfo = new FileInfo(filePath);

                            using (var stream = new FileStream(filePath, FileMode.Create))
                            {
                                file.CopyToAsync(stream);
                            }

                            using (ExcelPackage package = new ExcelPackage(fileInfo))
                            {
                                var worksheets = package.Workbook.Worksheets;
                                foreach (ExcelWorksheet item in worksheets)
                                {
                                    StringBuilder sb = new StringBuilder();
                                    int rowCount = item.Dimension.Rows;
                                    int ColCount = item.Dimension.Columns;

                                    ExcelViewModel sheet = new ExcelViewModel();

                                    sheet.SheetName = item.Name;

                                    for (int row = 1; row <= rowCount; row++)
                                    {
                                        sb.Append("<tr>");
                                        for (int col = 1; col <= ColCount; col++)
                                        {
                                            if (row == 1)
                                            {
                                                sb.Append("<th>");
                                                sb.Append(Convert.ToString(item.Cells[row, col].Value));
                                                sb.Append("</th>");
                                            }
                                            else
                                            {
                                                sb.Append("<td>");
                                                sb.Append(Convert.ToString(item.Cells[row, col].Value));
                                                sb.Append("</td>");
                                            }
                                        }
                                        sb.Append("</tr>");
                                    }
                                    sheet.Data = sb.ToString();
                                    list.Add(sheet);
                                }
                            }
                        }
                    }
                }
            }

            return Page();
        }


    }

}
