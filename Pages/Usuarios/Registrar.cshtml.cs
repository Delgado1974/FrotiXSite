using System.ComponentModel.DataAnnotations;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using FrotiX.Models;
using FrotiX.Services;
using FrotiX.Validations;
using System.Net.Mail;
using System.Net;
using FrotiX.Repository.IRepository;

namespace FrotiX.Pages.Usuarios
{
    [IgnoreAntiforgeryToken(Order = 1001)]
    [AllowAnonymous]
    public class RegisterModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailSender _emailSender;
        private readonly ILogger<RegisterModel> _logger;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;
        private IMailService _mailService;

        public RegisterModel(UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager, ILogger<RegisterModel> logger,
            IEmailSender emailSender, IMailService mailService, IUnitOfWork unitOfWork)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _logger = logger;
            _emailSender = emailSender;
            _unitOfWork = unitOfWork;
        }

        [BindProperty] public InputModel Input { get; set; }

        public string ReturnUrl { get; set; }

        public void OnGet(string returnUrl = null) => ReturnUrl = returnUrl;

        public async Task<IActionResult> OnPostAsync(string returnUrl = null)
        {
            returnUrl = returnUrl ?? Url.Content("~/");
            if (ModelState.IsValid)
            {
                var user = new Models.AspNetUsers
                {
                                 UserName = Input.Ponto,
                                 Email = Input.Email,
                                 NomeCompleto = Input.NomeCompleto,
                                 Ponto=Input.Ponto
                                 };
                //var result = await _userManager.CreateAsync(user, Input.Senha);
                var result = await _userManager.CreateAsync(user, "visual");
                if (result.Succeeded)
                {
                    _logger.LogInformation("User created a new account with password.");

                    //var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    var code = "";
                    var callbackUrl = Url.Page("/Account/ConfirmarSenha", null, new {userId = user.Id, code}, Request.Scheme);

                    //Insere o Usuário nos Recursos Disponíveis
                    var objRecursos = _unitOfWork.Recurso.GetAll();

                    foreach (var recurso in objRecursos)
                    {

                        var objAcesso = new ControleAcesso();

                        objAcesso.UsuarioId = user.Id;
                        objAcesso.RecursoId = recurso.RecursoId;
                        objAcesso.Acesso = false;

                        _unitOfWork.ControleAcesso.Add(objAcesso);
                        _unitOfWork.Save();
                    }

                    //await _emailSender.SendEmailAsync(Input.Email, "Cadastre sua Senha",
                    //$"Cadastre sua Senha <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clicando aqui</a>.");

                    //MailRequest req = new MailRequest();
                    //req.ToEmail = user.Email;
                    //req.Subject = "Confirme sua Conta";
                    //req.Body = "<p>Aqui está o link para confirmar a sua conta:</p> <p> <a href=\"" + callbackUrl + "\">Clique Aqui</a> </p>";
                    //await _mailService.SendEmailAsync(req);


                    //------------ Teste de Email -----------------
                    //=============================================
                    //var body = "<p>Aqui está o link para confirmar a sua conta:</p> <p> <a href=\"" + callbackUrl + "\">Clique Aqui</a> </p>";
                    //using (var smtp = new SmtpClient())
                    //{
                    //    var credential = new NetworkCredential
                    //    {
                    //        UserName = "ctran@frotix.biz",  
                    //        Password = "efi3qae5C!" 
                    //    };
                    //    smtp.Credentials = credential;
                    //    smtp.Host = "plesk4100.is.cc";
                    //    smtp.Port = 587;
                    //    smtp.EnableSsl = true;
                    //    var message = new MailMessage();
                    //    message.To.Add(user.Email);
                    //    message.Subject = "Cadastre sua Senha";
                    //    message.Body = body;
                    //    message.IsBodyHtml = true;
                    //    message.From = new MailAddress("ctran@frotix.biz", "Frotix - Autenticação");
                    //    await smtp.SendMailAsync(message);
                    //}


                    await _signInManager.SignInAsync(user, false);
                    return LocalRedirect("/Identity/Account/LoginFrotiX");
                }

                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
            }

            // If we got this far, something failed, redisplay form
            return Page();
        }

        public class InputModel
        {
            [Required]
            [Display(Name = "Ponto")]
            public string Ponto { get; set; }

            [Required]
            [Display(Name = "Nome Completo")]
            public string NomeCompleto { get; set; }

            [Required]
            [EmailAddress]
            [ValidateDomainAtEnd(domainValue: "@camara.leg.br")]
            [Display(Name = "Email")]
            public string Email { get; set; }

            //[StringLength(10, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
            [DataType(DataType.Password)]
            [Display(Name = "Senha")]
            public string Senha { get; set; }

            [DataType(DataType.Password)]
            [Display(Name = "Confirmação de Senha")]
            [Compare("Senha", ErrorMessage = "A senha e a confirmação não combinam.")]
            public string ConfirmacaoSenha { get; set; }

            //[Required]
            //[Display(Name = "I agree to terms & conditions")]
            //public bool AgreeToTerms { get; set; }

            //[Display(Name = "Sign up for newsletters")]
            //public bool SignUp { get; set; }
        }
    }
}
