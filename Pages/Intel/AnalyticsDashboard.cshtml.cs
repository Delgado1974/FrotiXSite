using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Intel
{
    public class AnalyticsDashboardModel : PageModel
    {
        private readonly ILogger<AnalyticsDashboardModel> _logger;
        private readonly IUnitOfWork _unitOfWork;

        public AnalyticsDashboardModel(ILogger<AnalyticsDashboardModel> logger, IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _unitOfWork = unitOfWork;
        }

        public void OnGet()
        {
            string usuarioCorrentePonto;
            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            var objUsuario = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == currentUserID);
            usuarioCorrentePonto = objUsuario.Ponto;
            Settings.GlobalVariables.gPontoUsuario = objUsuario.Ponto;

        }
    }
}
