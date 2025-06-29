using FrotiX.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text;

namespace FrotiX.Controllers
{
    [Route("Editor")]
    public class EditorController : Controller
    {
        [HttpPost("DownloadImagemDocx")]
        public IActionResult DownloadImagemDocx(IFormFile docx)
        {
            using var stream = docx.OpenReadStream();
            using var memory = new MemoryStream();
            stream.CopyTo(memory);
            var bytes = memory.ToArray();

            var imagem = SfdtHelper.SalvarImagemDeDocx(bytes);
            System.IO.File.WriteAllBytes("wwwroot/uploads/Editor.png", imagem);
            return Ok();
        }
    }
}