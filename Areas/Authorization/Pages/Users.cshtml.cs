﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Areas.Authorization.Pages
{
    [Authorize]
    public class UserModel : PageModel
    {
    }
}
