using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Page
{
    public class LoginAltModel : PageModel
    {
        private readonly ILogger<LoginAltModel> _logger;

        public LoginAltModel(ILogger<LoginAltModel> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {
        }
    }
}
