using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Logging;

namespace FrotiX.Pages.Veiculo
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;

        //private readonly UserManager<Usuario> _userManager;

        private readonly INotyfService _notyf;

        public static Guid veiculoId;
        public static byte[] CRLVveiculo;

        public UpsertModel(
            IUnitOfWork unitOfWork,
            ILogger<IndexModel> logger,
            IWebHostEnvironment hostingEnvironment,
            INotyfService notyf
        )
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }

        [BindProperty]
        public VeiculoViewModel VeiculoObj { get; set; }

        private void SetViewModel()
        {
            VeiculoObj = new VeiculoViewModel
            {
                MarcaList = _unitOfWork.MarcaVeiculo.GetMarcaVeiculoListForDropDown(),
                UnidadeList = _unitOfWork.Unidade.GetUnidadeListForDropDown(),
                CombustivelList = _unitOfWork.Combustivel.GetCombustivelListForDropDown(),
                ContratoList = _unitOfWork.Contrato.GetContratoListForDropDown("Locação", 1),
                AtaList = _unitOfWork.AtaRegistroPrecos.GetAtaListForDropDown(1),
                AspNetUsersList = _unitOfWork.AspNetUsers.GetAspNetUsersListForDropDown(),
                PlacaBronzeList = _unitOfWork.PlacaBronze.GetPlacaBronzeListForDropDown(),
                Veiculo = new Models.Veiculo(),
            };
        }

        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            VeiculoObj.Veiculo.UsuarioIdAlteracao = currentUserID;
            var usuarios = _unitOfWork.AspNetUsers.GetAspNetUsersListForDropDown();
            foreach (var usuario in usuarios)
            {
                if (usuario.Value == currentUserID)
                {
                    VeiculoObj.NomeUsuarioAlteracao = usuario.Text;
                }
            }

            if (id != null && id != Guid.Empty)
            {
                VeiculoObj.Veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.VeiculoId == id);
                if (VeiculoObj == null)
                {
                    return NotFound();
                }
            }

            CRLVveiculo = VeiculoObj.Veiculo.CRLV;

            return Page();
        }

        //Preenche a lista de modelos baseado no veículo
        //==============================================
        public JsonResult OnGetModeloList(Guid id)
        {
            var ModeloList = _unitOfWork.ModeloVeiculo.GetAll().Where(e => e.MarcaId == id);
            return new JsonResult(new { data = ModeloList });
        }

        //Preenche a lista de itens baseado no contrato
        //=============================================
        public JsonResult OnGetItemContratual(Guid id)
        {
            var ItemList = (
                from ivc in _unitOfWork.ItemVeiculoContrato.GetAll()
                join rc in _unitOfWork.RepactuacaoContrato.GetAll()
                    on ivc.RepactuacaoContratoId equals rc.RepactuacaoContratoId
                where rc.ContratoId == id
                orderby rc.DataRepactuacao descending, ivc.NumItem
                select new
                {
                    ivc.ItemVeiculoId,
                    Descricao = "{"
                        + rc.DataRepactuacao?.ToString("dd/MM/yy")
                        + " - "
                        + rc.Descricao
                        + "} - (nº "
                        + ivc.NumItem
                        + ") - "
                        + ivc.Descricao,
                }
            ).ToList();

            return new JsonResult(new { data = ItemList });
        }

        //Preenche a lista de itens baseado a Ata
        //=======================================
        public JsonResult OnGetItemAta(Guid id)
        {
            var ItemList = (
                from iva in _unitOfWork.ItemVeiculoAta.GetAll()
                join ra in _unitOfWork.RepactuacaoAta.GetAll()
                    on iva.RepactuacaoAtaId equals ra.RepactuacaoAtaId
                where ra.AtaId == id
                orderby ra.DataRepactuacao, iva.NumItem
                select new
                {
                    iva.ItemVeiculoAtaId,
                    Descricao = "{"
                        + ra.DataRepactuacao?.ToString("dd/MM/yy")
                        + " - "
                        + ra.Descricao
                        + "} - (nº "
                        + iva.NumItem
                        + ") - "
                        + iva.Descricao,
                }
            ).ToList();

            return new JsonResult(new { data = ItemList });
        }

        public IActionResult OnPostSubmit()
        {
            VeiculoObj.Veiculo.Placa = VeiculoObj.Veiculo.Placa.ToUpper();
            VeiculoObj.Veiculo.DataAlteracao = DateTime.Now;

            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            VeiculoObj.Veiculo.UsuarioIdAlteracao = currentUserID;

            if (
                ModelState
                    .Where(k => (k.Key != "UnidadeId"))
                    .All(v => v.Value.ValidationState == ModelValidationState.Valid)
            )
            {
                if (!ModelState.IsValid)
                {
                    SetViewModel();
                    return Page();
                }
            }

            if (ChecaInconstancias(null))
            {
                SetViewModel();
                return Page();
            }

            //Adiciona o veículo
            //==================
            if (VeiculoObj.Veiculo.VeiculoId == Guid.Empty)
            {
                _unitOfWork.Veiculo.Add(VeiculoObj.Veiculo);

                //Adiciona o veículo ao contrato, caso selecionado
                if (VeiculoObj.Veiculo.ContratoId != null)
                {
                    VeiculoContrato veiculoContrato = new VeiculoContrato
                    {
                        ContratoId = (Guid)VeiculoObj.Veiculo.ContratoId,
                        VeiculoId = VeiculoObj.Veiculo.VeiculoId,
                    };
                    _unitOfWork.VeiculoContrato.Add(veiculoContrato);
                }
            }
            _unitOfWork.Save();
            return RedirectToPage("./Index");
        }

        public IActionResult OnPostEdit(Guid id)
        {
            ////Pega o usuário corrente
            ////=======================
            //ClaimsPrincipal currentUser = this.User;
            //var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            //VeiculoObj.Veiculo.UsuarioIdAlteracao = currentUserID;

            if (
                ModelState
                    .Where(k => (k.Key != "UnidadeId"))
                    .All(v => v.Value.ValidationState == ModelValidationState.Valid)
            )
            {
                if (!ModelState.IsValid)
                {
                    SetViewModel();
                    VeiculoObj.Veiculo.VeiculoId = id;
                    return Page();
                }
            }

            VeiculoObj.Veiculo.VeiculoId = id;

            if (ChecaInconstancias(VeiculoObj.Veiculo.VeiculoId))
            {
                SetViewModel();
                VeiculoObj.Veiculo.VeiculoId = id;
                return Page();
            }

            // Atualiza Contrato do Veiculo, se selecionado
            //=============================================
            var existeVeiculoContrato = _unitOfWork.VeiculoContrato.GetFirstOrDefault(u =>
                (u.VeiculoId == VeiculoObj.Veiculo.VeiculoId)
                && (u.ContratoId == VeiculoObj.Veiculo.ContratoId)
            );
            if (existeVeiculoContrato == null && VeiculoObj.Veiculo.ContratoId != null)
            {
                VeiculoContrato veiculoContrato = new VeiculoContrato
                {
                    ContratoId = (Guid)VeiculoObj.Veiculo.ContratoId,
                    VeiculoId = VeiculoObj.Veiculo.VeiculoId,
                };
                _unitOfWork.VeiculoContrato.Add(veiculoContrato);
            }

            VeiculoObj.Veiculo.DataAlteracao = DateTime.Now;
            VeiculoObj.Veiculo.Placa = VeiculoObj.Veiculo.Placa.ToUpper();

            if (CRLVveiculo != null)
            {
                VeiculoObj.Veiculo.CRLV = CRLVveiculo;
            }

            _unitOfWork.Veiculo.Update(VeiculoObj.Veiculo);
            _unitOfWork.Save();

            _notyf.Success("Veículo atualizado com sucesso!", 3);

            return RedirectToPage("./Index");
        }

        private bool ChecaInconstancias(Guid? id)
        {
            // Verifica Duplicidades
            var existePlaca = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                u.Placa.ToUpper() == VeiculoObj.Veiculo.Placa.ToUpper()
            );
            if (id == null && existePlaca != null)
            {
                _notyf.Error("Já existe um veículo com essa placa!", 3);
                return true;
            }
            if (existePlaca != null && existePlaca.VeiculoId != id)
            {
                _notyf.Error("Já existe um veículo com essa placa!", 3);
                return true;
            }

            var existeRenavam = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                u.Renavam == VeiculoObj.Veiculo.Renavam
            );
            if (id == null && existeRenavam != null)
            {
                _notyf.Error("Já existe um veículo com esse Renavam!", 3);
                return true;
            }
            if (existeRenavam != null && existeRenavam.VeiculoId != id)
            {
                _notyf.Error("Já existe um veículo com esse Renavam!", 3);
                return true;
            }

            if (VeiculoObj.Veiculo.CombustivelId == null)
            {
                _notyf.Error("Você precisa informar o combustível!", 3);
                return true;
            }

            if (
                (
                    VeiculoObj.Veiculo.ContratoId == null
                    && VeiculoObj.Veiculo.AtaId == null
                    && VeiculoObj.Veiculo.VeiculoProprio == false
                )
            )
            {
                _notyf.Error(
                    "Você precisa definir se o veículo é próprio ou se pertence a um Contrato ou a uma Ata !",
                    3
                );
                return true;
            }

            if ((VeiculoObj.Veiculo.ContratoId != null && VeiculoObj.Veiculo.ItemVeiculoId == null))
            {
                _notyf.Error("Você precisa informar o Item Contratual do veículo!", 3);
                return true;
            }

            if ((VeiculoObj.Veiculo.AtaId != null && VeiculoObj.Veiculo.ItemVeiculoAtaId == null))
            {
                _notyf.Error("Você precisa informar o Item da Ata do veículo!", 3);
                return true;
            }

            if ((VeiculoObj.Veiculo.MarcaId == null || VeiculoObj.Veiculo.ModeloId == null))
            {
                _notyf.Error("Você precisa informar a Marca/Modelo do veículo!", 3);
                return true;
            }

            if (
                (VeiculoObj.Veiculo.VeiculoProprio == true && VeiculoObj.Veiculo.Patrimonio == null)
            )
            {
                _notyf.Error("Você precisa informar o número de patrimônio do veículo!", 3);
                return true;
            }

            return false;
        }

        // handler is GetSlaveData
        // name is: OnGet[handler]
        public Task<JsonResult> OnGetSlaveData(Guid id)
        {
            var data = _unitOfWork.ModeloVeiculo.GetAll(m => m.MarcaId == id).ToList();

            return Task.FromResult(
                new JsonResult(new SelectList(data, "ModeloId", "DescricaoModelo"))
            );
        }

        //Verifica Placa
        //==============
        public JsonResult OnGetVerificaPlaca(string id)
        {
            var objPlaca = _unitOfWork.Veiculo.GetFirstOrDefault(v => v.Placa.Contains(id));

            if (objPlaca != null)
            {
                return new JsonResult(new { data = "Existe Placa" });
            }
            else
            {
                return new JsonResult(new { data = "Não Existe Placa" });
            }
        }
    }
}
