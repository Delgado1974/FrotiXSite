using FrotiX.Models.DTO; // ajuste o namespace real do seu DTO
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Threading.Tasks;
using FrotiX.Repository.IRepository;
using System.Collections.Generic;
using System.Linq;
using System;

namespace FrotiX.Pages.Administracao
{
    public class HigienizarViagensModel : PageModel
    {
        private readonly IViagemRepository _viagemRepo;
        public HigienizarViagensModel(IViagemRepository viagemRepo)
            => _viagemRepo = viagemRepo;

        [BindProperty] public List<string> OrigensDistintas { get; set; }
        [BindProperty] public List<string> OrigensParaCorrigir { get; set; } = new();
        [BindProperty] public List<string> OrigemSelecionada { get; set; }
        [BindProperty] public List<string> OrigemParaCorrigirSelecionada { get; set; }
        [BindProperty] public string NovaOrigem { get; set; }

        [BindProperty] public List<string> DestinosDistintos { get; set; }
        [BindProperty] public List<string> DestinosParaCorrigir { get; set; } = new();
        [BindProperty] public List<string> DestinoSelecionada { get; set; }
        [BindProperty] public List<string> DestinoParaCorrigirSelecionada { get; set; }
        [BindProperty] public string NovoDestino { get; set; }

        private async Task LoadDistinctAsync()
        {
            try
            {
                OrigensDistintas = await _viagemRepo.GetDistinctOrigensAsync();
                DestinosDistintos = await _viagemRepo.GetDistinctDestinosAsync();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Erro ao carregar dados distintos: {ex.Message}");
                OrigensDistintas = new List<string>();
                DestinosDistintos = new List<string>();
            }
        }

        public async Task OnGetAsync()
        {
            try
            {
                await LoadDistinctAsync();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Erro no OnGetAsync: {ex.Message}");
            }
        }

        public async Task<IActionResult> OnPostApplyOrigemAsync()
        {
            try
            {
                await LoadDistinctAsync();
                if (!string.IsNullOrWhiteSpace(NovaOrigem) && OrigensParaCorrigir.Any())
                {
                    await _viagemRepo.CorrigirOrigemAsync(OrigensParaCorrigir, NovaOrigem);
                    OrigensParaCorrigir.Clear();
                    NovaOrigem = string.Empty;
                    await LoadDistinctAsync();
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Erro ao aplicar correção de origem: {ex.Message}");
            }
            return Page();
        }

        public async Task<IActionResult> OnPostMoveDestinoAsync()
        {
            try
            {
                await LoadDistinctAsync();
                if (DestinoSelecionada != null)
                {
                    foreach (var item in DestinoSelecionada)
                    {
                        DestinosParaCorrigir.Add(item);
                        DestinosDistintos.Remove(item);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Erro ao mover destino: {ex.Message}");
            }
            return Page();
        }

        public async Task<IActionResult> OnPostRemoveDestinoAsync()
        {
            try
            {
                await LoadDistinctAsync();
                if (DestinoParaCorrigirSelecionada != null)
                {
                    foreach (var item in DestinoParaCorrigirSelecionada)
                    {
                        DestinosDistintos.Add(item);
                        DestinosParaCorrigir.Remove(item);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Erro ao remover destino: {ex.Message}");
            }
            return Page();
        }

        public async Task<IActionResult> OnPostApplyDestinoAsync()
        {
            try
            {
                await LoadDistinctAsync();
                if (!string.IsNullOrWhiteSpace(NovoDestino) && DestinosParaCorrigir.Any())
                {
                    await _viagemRepo.CorrigirDestinoAsync(DestinosParaCorrigir, NovoDestino);
                    DestinosParaCorrigir.Clear();
                    NovoDestino = string.Empty;
                    await LoadDistinctAsync();
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Erro ao aplicar correção de destino: {ex.Message}");
            }
            return Page();
        }
    }
}
