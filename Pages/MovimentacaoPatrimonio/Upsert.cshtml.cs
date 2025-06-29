using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Models.Cadastros;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.MovimentacaoPatrimonio
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        //private readonly UserManager<Usuario> _userManager;

        private readonly INotyfService _notyf;

        public static Guid movimentacaoPatrimonioId;

        [BindProperty]
        public bool StatusCheckbox { get; set; }

        public UpsertModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, IWebHostEnvironment hostingEnvironment, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }

        [BindProperty]
        public MovimentacaoPatrimonioViewModel MovimentacaoPatrimonioObj { get; set; }

        private void SetViewModel()
        {
            MovimentacaoPatrimonioObj = new MovimentacaoPatrimonioViewModel
            {
                MovimentacaoPatrimonio = new Models.MovimentacaoPatrimonio()
            };
            ViewData["Setores"] = _unitOfWork.SetorPatrimonial.GetAll()
            .Select(s => new { text = s.NomeSetor, value = s.SetorId })
            .ToList();
        }

        public IActionResult OnGet(Guid? id, Guid? patrimonioId) //Adicionei a possibilidade de passar o patrimonioId pra já carregar o patrimonio
        {
            SetViewModel();

            if (id != null)
            {
                movimentacaoPatrimonioId = (Guid)id;
                MovimentacaoPatrimonioObj.MovimentacaoPatrimonioId = movimentacaoPatrimonioId;
            }

            if (patrimonioId != null)
            {
                MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.PatrimonioId = (Guid)patrimonioId;
            }


            if (id != null && id != Guid.Empty)
            {
                MovimentacaoPatrimonioObj.MovimentacaoPatrimonio = _unitOfWork.MovimentacaoPatrimonio.GetFirstOrDefault
                    (u => u.MovimentacaoPatrimonioId == id);
                if (MovimentacaoPatrimonioObj == null)
                {
                    return NotFound();
                }
                MovimentacaoPatrimonioObj.MovimentacaoPatrimonioId = MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.MovimentacaoPatrimonioId;

                //Teste pra ver se dá pra puxar as informações sem criar uma view no banco de dados
                var patrimonioSelecionado = _unitOfWork.Patrimonio.GetFirstOrDefault(p => p.PatrimonioId == MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.PatrimonioId);
                var setorOrigemNome = _unitOfWork.SetorPatrimonial.GetFirstOrDefault(set => set.SetorId == MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SetorOrigemId);
                var secaoOrigemNome = _unitOfWork.SecaoPatrimonial.GetFirstOrDefault(sec => sec.SecaoId == MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SecaoOrigemId);

                MovimentacaoPatrimonioObj.PatrimonioNome = patrimonioSelecionado.NPR;
                MovimentacaoPatrimonioObj.SetorOrigemNome = setorOrigemNome.NomeSetor;
                MovimentacaoPatrimonioObj.SecaoOrigemNome = secaoOrigemNome.NomeSecao;
                //-----------------------------------------------------------------------//
            }


            PreencheListaPatrimonios();


            return Page();
        }


        //Criei esse aqui pra poder preencher a lista utilizar o formato do razor pages que nem tá e motoristas na viagens
        //Acho que posso tirar porque to usando JS agora, verificar isso depois
        class PatrimonioData
        {
            public Guid PatrimonioId { get; set; }
            public string NPR { get; set; }
        }

        //Esse aqui que tá preenchendo a lista de patrimônios pela model page -> trocar para JS
        public void PreencheListaPatrimonios()
        {
            var listaPatrimonios = _unitOfWork.Patrimonio.GetAllReduced(selector: p => new { p.NPR, p.PatrimonioId });
            var listaDePatrimoniosObj = new List<PatrimonioData>();

            foreach (var patrimonio in listaPatrimonios)
            {
                listaDePatrimoniosObj.Add(new PatrimonioData
                {
                    NPR = patrimonio.NPR,
                    PatrimonioId = patrimonio.PatrimonioId
                });
            }

            ViewData["dataPatrimonio"] = listaDePatrimoniosObj;
            

        }

        public IActionResult OnPostSubmit()
        {
            // Pega o usuário atual
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.ResponsavelMovimentacao = currentUserID;

            Console.WriteLine("Current user Id: " + currentUserID);
            Console.WriteLine("DataMovimentacao: " + MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.DataMovimentacao);

            // ===== Validações =====
            if (MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.PatrimonioId == Guid.Empty)
            {
                ModelState.AddModelError(string.Empty, "O Patrimônio não pode estar vazio");
                SetViewModel();
                return Page();
            }
            if (!MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.DataMovimentacao.HasValue)
            {
                ModelState.AddModelError(string.Empty, "A data não pode estar vazia");
                SetViewModel();
                return Page();
            }
            if (MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SetorOrigemId == Guid.Empty)
            {
                ModelState.AddModelError(string.Empty, "O Setor de origem não pode estar vazio");
                SetViewModel();
                return Page();
            }
            if (MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SecaoOrigemId == Guid.Empty)
            {
                ModelState.AddModelError(string.Empty, "A Seção de origem não pode estar vazia");
                SetViewModel();
                return Page();
            }
            if (MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SetorDestinoId == Guid.Empty)
            {
                ModelState.AddModelError(string.Empty, "O Setor de destino não pode estar vazio");
                SetViewModel();
                return Page();
            }
            if (MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SecaoDestinoId == Guid.Empty)
            {
                ModelState.AddModelError(string.Empty, "A Seção de destino não pode estar vazia");
                SetViewModel();
                return Page();
            }
            if (MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SecaoDestinoId == MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SecaoOrigemId)
            {
                ModelState.AddModelError(string.Empty, "A Seção de destino não pode ser a mesma da origem");
                SetViewModel();
                return Page();
            }

            // ===== Criação de Nova Movimentação =====
            if (MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.MovimentacaoPatrimonioId == Guid.Empty)
            {
                // Ajusta a data
                MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.DataMovimentacao = (DateTime)MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.DataMovimentacao;

                // Busca o patrimônio
                var patrimonio = _unitOfWork.Patrimonio.GetFirstOrDefault(p => p.PatrimonioId == MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.PatrimonioId);

                if (patrimonio == null)
                {
                    ModelState.AddModelError(string.Empty, "Patrimônio não encontrado");
                    SetViewModel();
                    return Page();
                }

                // Atualiza o setor e seção do patrimônio
                patrimonio.SetorId = MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SetorDestinoId;
                patrimonio.SecaoId = MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SecaoDestinoId;

                // Atualiza o status do patrimônio conforme o checkbox
                patrimonio.Status = StatusCheckbox;

                // Salva alterações
                _unitOfWork.Patrimonio.Update(patrimonio);
                _unitOfWork.MovimentacaoPatrimonio.Add(MovimentacaoPatrimonioObj.MovimentacaoPatrimonio);
                _unitOfWork.Save();

                return RedirectToPage("./Index");
            }
            else
            {
                // Teoricamente nunca deveria entrar aqui porque na criação o ID é sempre vazio
                ModelState.AddModelError(string.Empty, "O ID da movimentação não está vazio?");
                SetViewModel();
                return Page();
            }
        }


        //Tem que mexer aqui ainda
        public IActionResult OnPostEdit(Guid id)
        {

            if (!ModelState.IsValid)
            {
                SetViewModel();
                MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.MovimentacaoPatrimonioId = id;
                return Page();
            }
            if (MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.PatrimonioId == Guid.Empty)
            {
                ModelState.AddModelError(string.Empty, "O Patrimonio não pode estar vazio");
                SetViewModel();
                return Page();
            }
            if (!MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.DataMovimentacao.HasValue)
            {
                ModelState.AddModelError(string.Empty, "A data não pode estar vazia");
                SetViewModel();
                return Page();
            }
            if (MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SetorOrigemId == Guid.Empty)
            {
                ModelState.AddModelError(string.Empty, "O Setor origem não pode estar vazio");
                SetViewModel();
                return Page();
            }
            if (MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SecaoOrigemId == Guid.Empty)
            {
                ModelState.AddModelError(string.Empty, "A seção origem não pode estar vazio");
                SetViewModel();
                return Page();
            }
            if (MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SetorDestinoId == Guid.Empty)
            {
                ModelState.AddModelError(string.Empty, "O Setor destino não pode estar vazio");
                SetViewModel();
                return Page();
            }
            if (MovimentacaoPatrimonioObj.MovimentacaoPatrimonio.SecaoDestinoId == Guid.Empty)
            {
                ModelState.AddModelError(string.Empty, "A seção destino não pode estar vazio");
                SetViewModel();
                return Page();
            }

            _unitOfWork.MovimentacaoPatrimonio.Update(MovimentacaoPatrimonioObj.MovimentacaoPatrimonio);
            _unitOfWork.Save();

            _notyf.Success("Movimentação atualizada com sucesso!", 3);

            return RedirectToPage("./Index");
        }

    }
}
