using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http.Features;
using System.IO;
using FrotiX.Repository.IRepository;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public partial class UploadCRLVController : Controller
    {
        //
        // GET: /UploadDefault/
        private IHostingEnvironment hostingEnv;

        private readonly IUnitOfWork _unitOfWork;

        public UploadCRLVController(IHostingEnvironment env, IUnitOfWork unitOfWork)
        {
            this.hostingEnv = env;
            _unitOfWork = unitOfWork;

        }
        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("Save")]
        public IActionResult Save(IList<IFormFile> UploadFiles)
        {
            if (UploadFiles != null)
            {
                foreach (var file in UploadFiles)
                {
                    var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.VeiculoId == FrotiX.Pages.Veiculo.UploadCRLVModel.veiculoId);
                    if (objFromDb != null)
                    {

                        using (var target = new MemoryStream())
                        {
                            file.CopyTo(target);
                            objFromDb.CRLV = target.ToArray();
                        }
                        _unitOfWork.Veiculo.Update(objFromDb);
                        _unitOfWork.Save();
                    }
                } 
    
                //var filename = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                //filename = hostingEnv.WebRootPath + $@"\{filename}" + " - " + FrotiX.Pages.Veiculo.UploadCRLVModel.veiculoId;
                //if (!System.IO.File.Exists(filename))
                //{
                //    using (FileStream fs = System.IO.File.Create(filename))
                //    {
                //        file.CopyTo(fs);
                //        fs.Flush();
                //    }
                //}
                //else
                //{
                //    Response.Clear();
                //    Response.StatusCode = 204;
                //    Response.HttpContext.Features.Get<IHttpResponseFeature>().ReasonPhrase = "File already exists.";
                //}
            }
             return Content("");
        }



        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("Remove")]
        public IActionResult Remove(IList<IFormFile> UploadFiles)
        {
            try
            {
                foreach (var file in UploadFiles)
                {
                    var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                    var filePath = Path.Combine(hostingEnv.WebRootPath);
                    var fileSavePath = filePath + "\\" + fileName;
                    if (!System.IO.File.Exists(fileSavePath))
                    {
                        System.IO.File.Delete(fileSavePath);
                    }
                }
            }
            catch (Exception e)
            {
                Response.Clear();
                Response.StatusCode = 200;
                Response.HttpContext.Features.Get<IHttpResponseFeature>().ReasonPhrase = "File removed successfully";
                Response.HttpContext.Features.Get<IHttpResponseFeature>().ReasonPhrase = e.Message;
            }
            return Content("");
        }
        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("UploadFeatures")]
        public ActionResult UploadFeatures()
        {
            return View();
        } 
    }
}
