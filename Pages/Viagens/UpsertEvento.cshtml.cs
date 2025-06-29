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
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using static FrotiX.Models.Evento;

namespace FrotiX.Pages.Viagens
{

    public class UpsertEventoModel : PageModel
    {
        private static Guid eventoId;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;

        private readonly INotyfService _notyf;

        public UpsertEventoModel(IUnitOfWork unitOfWork, ILogger<IndexModel> logger, INotyfService notyf)
        {
            _unitOfWork = unitOfWork;
             _logger = logger;
            _notyf = notyf;
        }


        [BindProperty]
        public EventoViewModel EventoObj { get; set; }

        private void SetViewModel()
        {
            EventoObj = new EventoViewModel
            {
                Evento = new Models.Evento()
            };
        }



        public IActionResult OnGet(Guid? id)
        {
            SetViewModel();

            if (id != null && id != Guid.Empty)
            {
                EventoObj.Evento = _unitOfWork.Evento.GetFirstOrDefault(u => u.EventoId == id);
                if (EventoObj == null)
                {
                    return NotFound();
                }
            }

            PreencheListaSetores();

            PreencheListaRequisitantes();

            return Page();

        }

        
        public IActionResult OnPostSubmit()
        {

            eventoId = EventoObj.EventoId;

            //Valida o ModelState menos o campo VeiculoId
            if (!ModelState.IsValid)
            {
                PreencheListaSetores();
                PreencheListaRequisitantes();
                return Page();
            }

            //Verifica Duplicado
            var existeEvento = _unitOfWork.Evento.GetFirstOrDefault(e =>
                    e.Nome.ToUpper() == EventoObj.Evento.Nome.ToUpper());

            if (EventoObj.Evento.EventoId != Guid.Empty && existeEvento != null)
            {
                if (EventoObj.Evento.EventoId != existeEvento.EventoId)
                {
                    _notyf.Error("Já existe este evento cadastrado!", 3);
                    PreencheListaSetores();
                    PreencheListaRequisitantes();
                    return Page();
                }
            }
            else if(existeEvento != null) 
            {
                _notyf.Error("Já existe este evento cadastrado!", 3);
                PreencheListaSetores();
                PreencheListaRequisitantes();
                return Page();

            }


            if (EventoObj.Evento.EventoId == Guid.Empty)
            {
               _unitOfWork.Evento.Add(EventoObj.Evento);
                _notyf.Success("Evento cadastrado com sucesso!", 3);
            }
            else
            {
                _unitOfWork.Evento.Update(EventoObj.Evento);
                _notyf.Success("Evento atualizado com sucesso!", 3);
            }
            _unitOfWork.Save();

            return RedirectToPage("./ListaEventos");
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

        public void PreencheListaSetores()
        {
            //    Preenche Treeview de Setores
            //================================
            var listaSetores = _unitOfWork.ViewSetores.GetAll();
            var treeDataSource = new List<TreeData>();


            foreach (var setor in listaSetores)
            {
                var temFilho = listaSetores.Any(u => u.SetorPaiId == setor.SetorSolicitanteId);

                if (setor.SetorPaiId != Guid.Empty)
                {
                    if (temFilho)
                    {
                        if (setor.SetorPaiId != Guid.Empty)
                        {
                            treeDataSource.Add(new TreeData
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
                            treeDataSource.Add(new TreeData
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
                        treeDataSource.Add(new TreeData
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
                        treeDataSource.Add(new TreeData
                        {
                            SetorSolicitanteId = (Guid)setor.SetorSolicitanteId,
                            Nome = setor.Nome,
                            HasChild = true,
                            //Sigla = setor.Sigla
                        });
                    }
                }

            }

            ViewData["dataSetor"] = treeDataSource;
        }

        class RequisitanteData
        {
            public Guid RequisitanteId { get; set; }
            public string Requisitante { get; set; }
        }

        public void PreencheListaRequisitantes()
        {
            //Preenche Treeview de Requisitantes
            //==================================
            //var ListaRequisitantes = _unitOfWork.ViewRequisitantes.GetAll();


            var listaRequisitantes = _unitOfWork.ViewRequisitantes
                .GetAllReduced(orderBy: r => r.OrderBy(r => r.Requisitante)
                                , selector: vr => new { vr.Requisitante, vr.RequisitanteId }).ToList();

            var requisitanteDataSource = new List<RequisitanteData>();

            //string requisitante = "8852C87D-90D8-4A16-8D13-08D97F8B08A4";
            //RequisitanteDataSource.Add(new RequisitanteData
            //{
            //    RequisitanteId = Guid.Parse(requisitante),
            //    Requisitante = "Alexandre Delgado",
            //});

            foreach (var requisitante in listaRequisitantes)
            {
                requisitanteDataSource.Add(new RequisitanteData
                {
                    RequisitanteId = (Guid)requisitante.RequisitanteId,
                    Requisitante = requisitante.Requisitante,
                });
            }

            ViewData["dataRequisitante"] = requisitanteDataSource;
        }
    }


}
