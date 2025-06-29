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
    public partial class UploadCNHController : Controller
    {
        //
        // GET: /UploadDefault/
        private IHostingEnvironment hostingEnv;

        private readonly IUnitOfWork _unitOfWork;

        public UploadCNHController(IHostingEnvironment env, IUnitOfWork unitOfWork)
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
                    var objFromDb = _unitOfWork.Motorista.GetFirstOrDefault(u => u.MotoristaId == FrotiX.Pages.Motorista.UploadCNHModel.motoristaId);
                    if (objFromDb != null)
                    {

                        using (var target = new MemoryStream())
                        {
                            file.CopyTo(target);
                            objFromDb.CNHDigital= target.ToArray();
                        }
                        _unitOfWork.Motorista.Update(objFromDb);
                        _unitOfWork.Save();
                    }
                } 
    
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
