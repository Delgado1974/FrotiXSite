using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using FrotiX.Services;
using FrotiX.Models;
using System.IO;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using AspNetCoreHero.ToastNotification.Abstractions;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace FrotiX.Pages.SetorSolicitante
{

    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;

        private readonly INotyfService _notyf;


        public UpsertModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
             _logger = logger;
            _notyf = notyf;
        }


        [BindProperty]
        public Models.SetorSolicitante SetorSolicitanteObj { get; set; }

        public IActionResult OnGet(Guid? id)
        {
            SetorSolicitanteObj = new Models.SetorSolicitante();
            if (id != null && id != Guid.Empty)
            {
                SetorSolicitanteObj = _unitOfWork.SetorSolicitante.GetFirstOrDefault(u => u.SetorSolicitanteId == id);
                if (SetorSolicitanteObj == null)
                {
                    return NotFound();
                }
            }

            PreencheLista();

            return Page();


        }


        public IActionResult OnPostSubmit()
        {
            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            SetorSolicitanteObj.UsuarioIdAlteracao = currentUserID;
            SetorSolicitanteObj.DataAlteracao = DateTime.Now;

            //if (ModelState.Where(k => k.Key != "UsuarioIdAlteracao").All(v => v.Value.ValidationState == ModelValidationState.Valid))
            //{
            //    return Page();
            //}

            if (!ModelState.IsValid)
            {
                //var modelErrors = new List<string>();
                foreach (var modelState in ModelState.Values)
                {
                    foreach (var modelError in modelState.Errors)
                    {
                        if (modelError.ErrorMessage != "The UsuarioIdAlteracao field is required.")
                        {
                            var erromodel = modelError.ErrorMessage;
                            PreencheLista();
                            return Page();
                        }
                    }
                }
                // do something with the error list :)
            }



            // Verifica Duplicidades

            if (SetorSolicitanteObj.Sigla != null)
            {
                var existeSigla = _unitOfWork.SetorSolicitante.GetFirstOrDefault(u => u.Sigla.ToUpper() == SetorSolicitanteObj.Sigla.ToUpper() && u.SetorPaiId == SetorSolicitanteObj.SetorPaiId);
                if (existeSigla != null && existeSigla.SetorSolicitanteId != SetorSolicitanteObj.SetorSolicitanteId && existeSigla.SetorPaiId == SetorSolicitanteObj.SetorPaiId)
                {
                    _notyf.Error("Já existe um Setor com essa sigla!", 3);
                    PreencheLista();
                    return Page();
                }
            }

            var existeSetor = _unitOfWork.SetorSolicitante.GetFirstOrDefault(u => u.Nome.ToUpper() == SetorSolicitanteObj.Nome.ToUpper() && u.SetorPaiId != SetorSolicitanteObj.SetorPaiId);
            if (existeSetor != null && existeSetor.SetorSolicitanteId != SetorSolicitanteObj.SetorSolicitanteId)
            {
                if (existeSetor.SetorPaiId == SetorSolicitanteObj.SetorPaiId)
                {
                    _notyf.Error("Já existe um Setor com esse nome!", 3);
                    PreencheLista();
                    return Page();
                }
            }


            if (SetorSolicitanteObj.SetorSolicitanteId == Guid.Empty)
            {
                _notyf.Success("Setor adicionado com sucesso!", 3);
                _unitOfWork.SetorSolicitante.Add(SetorSolicitanteObj);
            }
            else
            {
                _notyf.Success("Setor atualizado com sucesso!", 3);
                _unitOfWork.SetorSolicitante.Update(SetorSolicitanteObj);
            }
            _unitOfWork.Save();
            return RedirectToPage("./Index");
        }

        class TreeData
        {
            public Guid SetorSolicitanteId { get; set; }
            public Guid? SetorPaiId { get; set; }
            public bool HasChild { get; set; }
            public string Sigla { get; set; }
            public bool Expanded { get; set; }
            public bool IsSelected { get; set; }
            public string Nome { get; set; }
        }

        //public void PreencheLista()
        //{
        //    //    Preenche Treeview de Setores
        //    //================================
        //    var ListaSetores = _unitOfWork.SetorSolicitante.GetAll();
        //    Guid setorPai = Guid.Empty;
        //    bool temFilho;
        //    List<TreeData> TreeDataSource = new List<TreeData>();

        //    foreach (var setor in ListaSetores)
        //    {
        //        temFilho = false;
        //        var objFromDb = _unitOfWork.SetorSolicitante.GetFirstOrDefault(u => u.SetorPaiId == setor.SetorSolicitanteId);

        //        if (objFromDb != null)
        //        {
        //            temFilho = true;
        //        }
        //        if (setor.SetorPaiId != Guid.Empty)
        //        {
        //            if (temFilho)
        //            {
        //                if (setor.SetorPaiId != Guid.Empty)
        //                {
        //                    TreeDataSource.Add(new TreeData
        //                    {
        //                        SetorSolicitanteId = setor.SetorSolicitanteId,
        //                        SetorPaiId = setor.SetorPaiId,
        //                        Nome = setor.Nome,
        //                        HasChild = true,
        //                        Sigla = setor.Sigla
        //                    });
        //                }
        //                else
        //                {
        //                    TreeDataSource.Add(new TreeData
        //                    {
        //                        SetorSolicitanteId = setor.SetorSolicitanteId,
        //                        Nome = setor.Nome,
        //                        HasChild = true,
        //                        Sigla = setor.Sigla
        //                    });
        //                }
        //            }
        //            else
        //            {
        //                TreeDataSource.Add(new TreeData
        //                {
        //                    SetorSolicitanteId = setor.SetorSolicitanteId,
        //                    SetorPaiId = setor.SetorPaiId,
        //                    Nome = setor.Nome,
        //                    Sigla = setor.Sigla
        //                });
        //            }
        //        }
        //        else
        //        {
        //            if (temFilho)
        //            {
        //                TreeDataSource.Add(new TreeData
        //                {
        //                    SetorSolicitanteId = setor.SetorSolicitanteId,
        //                    Nome = setor.Nome,
        //                    HasChild = true,
        //                    Sigla = setor.Sigla
        //                });
        //            }
        //        }

        //    }

        //    ViewData["dataSource"] = TreeDataSource;

        //}

        public void PreencheLista()
        {
            //    Preenche Treeview de Setores
            //================================
            var ListaSetores = _unitOfWork.ViewSetores.GetAll();
            Guid setorPai = Guid.Empty;
            bool temFilho;
            List<TreeData> TreeDataSource = new List<TreeData>();

            foreach (var setor in ListaSetores)
            {
                temFilho = false;
                var objFromDb = _unitOfWork.ViewSetores.GetFirstOrDefault(u => u.SetorPaiId == setor.SetorSolicitanteId);

                if (objFromDb != null)
                {
                    temFilho = true;
                }
                if (setor.SetorPaiId != Guid.Empty)
                {
                    if (temFilho)
                    {
                        if (setor.SetorPaiId != Guid.Empty)
                        {
                            TreeDataSource.Add(new TreeData
                            {
                                SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                SetorPaiId = setor.SetorPaiId,
                                Nome = setor.Nome,
                                HasChild = true,
                                //Sigla = setor.Sigla
                            });
                        }
                        else
                        {
                            TreeDataSource.Add(new TreeData
                            {
                                SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                                Nome = setor.Nome,
                                HasChild = true,
                                //Sigla = setor.Sigla
                            });
                        }
                    }
                    else
                    {
                        TreeDataSource.Add(new TreeData
                        {
                            SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                            SetorPaiId = setor.SetorPaiId,
                            Nome = setor.Nome,
                            //Sigla = setor.Sigla
                        });
                    }
                }
                else
                {
                    if (temFilho)
                    {
                        TreeDataSource.Add(new TreeData
                        {
                            SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                            Nome = setor.Nome,
                            HasChild = true,
                            //Sigla = setor.Sigla
                        });
                    }
                }

            }

            ViewData["dataSource"] = TreeDataSource;

        }
    }


}
