using System.Collections.Generic;
using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages.Agenda
{
    public class BlackboxModel : PageModel
    {
        public List<DateTime> Dates { get; set; } = new List<DateTime>();

        public void OnGet()
        {
        }
    }
}
