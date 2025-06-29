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
using Microsoft.AspNetCore.Hosting;
using AspNetCoreHero.ToastNotification.Abstractions;
using System.Security.Claims;

namespace FrotiX.Pages.Requisitante
{

    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _hostingEnvironment;

        private readonly INotyfService _notyf;

        public static Guid requisitanteId;


        public UpsertModel(IUnitOfWork unitOfWork, IWebHostEnvironment hostingEnvironment, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
            _hostingEnvironment = hostingEnvironment;
            _notyf = notyf;
        }


        [BindProperty]
        public RequisitanteViewModel RequisitanteObj { get; set; }

        private void SetViewModel()
        {
            RequisitanteObj = new RequisitanteViewModel
            {
                SetorSolicitanteList = _unitOfWork.SetorSolicitante.GetSetorSolicitanteListForDropDown(),
                Requisitante = new Models.Requisitante()
            };
        }

        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null && id != Guid.Empty)
            {
                RequisitanteObj.Requisitante = _unitOfWork.Requisitante.GetFirstOrDefault(u => u.RequisitanteId == id);
                if (RequisitanteObj == null)
                {
                    return NotFound();
                }
            }

            PreencheLista();

            return Page();
        }

        
        public IActionResult OnPostSubmit()
        {
            if (!ModelState.IsValid)
            {
                SetViewModel();
                return Page();
            }

            //Põe os pontos com "p_" na frente
            if (RequisitanteObj.Requisitante.Ponto.Substring(0, 2).ToUpper() != "P_")
            {
                RequisitanteObj.Requisitante.Ponto = "p_" + RequisitanteObj.Requisitante.Ponto;
            }
            else
            {
                RequisitanteObj.Requisitante.Ponto = "p_" + RequisitanteObj.Requisitante.Ponto.Substring(2, RequisitanteObj.Requisitante.Ponto.Length - 2);
            }

            var existeRequisitante = _unitOfWork.Requisitante.GetFirstOrDefault(u => (u.Ponto == RequisitanteObj.Requisitante.Ponto) || (u.Nome == RequisitanteObj.Requisitante.Nome));
            if (existeRequisitante != null && existeRequisitante.RequisitanteId != RequisitanteObj.Requisitante.RequisitanteId)
            {
                _notyf.Error("Já existe um Requisitante com esse Ponto/Nome!", 3);
                SetViewModel();
                PreencheLista();
                return Page();
            }


            RequisitanteObj.Requisitante.DataAlteracao = DateTime.Now;

            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            RequisitanteObj.Requisitante.UsuarioIdAlteracao = currentUserID;

            _unitOfWork.Requisitante.Add(RequisitanteObj.Requisitante);

            _unitOfWork.Save();

             return RedirectToPage("./Index");
        }

        public IActionResult OnPostEdit(Guid id)
        {
            if (!ModelState.IsValid)
            {
                SetViewModel();
                RequisitanteObj.Requisitante.RequisitanteId = id;
                PreencheLista();
                return Page();
            }

            RequisitanteObj.Requisitante.RequisitanteId = id;

            var existeRequisitante = _unitOfWork.Requisitante.GetFirstOrDefault(u => (u.Ponto == RequisitanteObj.Requisitante.Ponto) || (u.Nome == RequisitanteObj.Requisitante.Nome));
            if (existeRequisitante != null && existeRequisitante.RequisitanteId != RequisitanteObj.Requisitante.RequisitanteId)
            {
                _notyf.Error("Já existe um Requisitante com esse Ponto/Nome!", 3);
                SetViewModel();
                PreencheLista();
                return Page();
            }

            RequisitanteObj.Requisitante.DataAlteracao = DateTime.Now;

            //Pega o usuário corrente
            //=======================
            ClaimsPrincipal currentUser = this.User;
            var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
            RequisitanteObj.Requisitante.UsuarioIdAlteracao = currentUserID;


            _unitOfWork.Requisitante.Update(RequisitanteObj.Requisitante);
            _unitOfWork.Save();

            _notyf.Success("Requisitante atualizado com sucesso!", 3);

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
