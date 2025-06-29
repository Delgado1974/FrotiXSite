using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Pages.Agenda
{ 
    public class DatepickerModel : PageModel
    {
        //public List<DateTime> SelectedDates { get; set; }
        //public List<string> SelectedDatesStrings { get; set; }

        public void OnGet()
        {
            // Initialize with today's date or an empty list
            //SelectedDates = new List<DateTime>();
            //SelectedDatesStrings = SelectedDates.Select(d => d.ToShortDateString()).ToList();
        }
    }
}
