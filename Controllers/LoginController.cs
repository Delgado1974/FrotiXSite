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
//using NPOI.SS.UserModel;
//using NPOI.HSSF.UserModel;
//using NPOI.XSSF.UserModel;
using FrotiX.Repository.IRepository;
using System.Transactions;
using System;
//using HtmlAgilityPack;
using System.IO;
using System.Security.Claims;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : Controller
    {
        private readonly ILogger<AbastecimentoController> _logger;
        private IHostingEnvironment _hostingEnvironment;
        private readonly IUnitOfWork _unitOfWork;

        public LoginController(ILogger<AbastecimentoController> logger, IHostingEnvironment hostingEnvironment, IUnitOfWork unitOfWork)
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
            return View();
        }

        //Recupera o nome do Usuário de Criação/Finalização
        //=================================================
        [Route("RecuperaUsuarioAtual")]
        public  IActionResult RecuperaUsuarioAtual()
        {

            string usuarioCorrenteNome;
            string usuarioCorrentePonto;

            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;

            var objUsuario = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == currentUserID);

            usuarioCorrenteNome = objUsuario.NomeCompleto;
            usuarioCorrentePonto = objUsuario.Ponto;
            Settings.GlobalVariables.gPontoUsuario = objUsuario.Ponto;

            return Json(new { nome = usuarioCorrenteNome, ponto = usuarioCorrentePonto });
        }

    }
}

