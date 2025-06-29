using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ViagemLimpezaController : ControllerBase
    {
        private readonly IViagemRepository _viagemRepo;

        public ViagemLimpezaController(IViagemRepository viagemRepo)
        {
            _viagemRepo = viagemRepo;
        }

        [HttpGet("origens")]
        public async Task<ActionResult<List<string>>> GetOrigens()
        {
            var origens = await _viagemRepo.GetDistinctOrigensAsync();
            return Ok(origens);
        }

        [HttpGet("destinos")]
        public async Task<ActionResult<List<string>>> GetDestinos()
        {
            var destinos = await _viagemRepo.GetDistinctDestinosAsync();
            return Ok(destinos);
        }

        [HttpPost("corrigir-origem")]
        public async Task<IActionResult> CorrigirOrigem([FromBody] CorrecaoRequest request)
        {
            await _viagemRepo.CorrigirOrigemAsync(request.Anteriores, request.NovoValor);
            return NoContent();
        }

        [HttpPost("corrigir-destino")]
        public async Task<IActionResult> CorrigirDestino([FromBody] CorrecaoRequest request)
        {
            await _viagemRepo.CorrigirDestinoAsync(request.Anteriores, request.NovoValor);
            return NoContent();
        }
    }

    public class CorrecaoRequest
    {
        public List<string> Anteriores { get; set; }
        public string NovoValor { get; set; }
    }

}
