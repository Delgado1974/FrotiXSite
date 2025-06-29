
// ——————————————————————————————————————————————————
//  Extrai dinamicamente "ViagemUpsert_###" do nome do .js atual
// ——————————————————————————————————————————————————
const __scriptName = (function ()
{
    // Em páginas comuns, document.currentScript aponta pro <script> que está sendo executado
    let script = document.currentScript;
    if (!script)
    {
        // fallback: pega o último <script> carregado
        const scripts = document.getElementsByTagName('script');
        script = scripts[scripts.length - 1];
    }
    const src = script.src || "";
    // procura algo como "ViagemUpsert_056.js" ou "…/ViagemUpsert_056.min.js"
    const m = src.match(/(ViagemUpsert_\d+)(?:\.min)?\.js$/i);
    return m ? m[1] : "ViagemUpsert";
})();

//Para controlar a exibição de ToolTips
var CarregandoViagemBloqueada = false;


// Corrige a duplicação de registros no agendamento;

let viagemId_AJAX = '';
let viagemId = '';
let recorrenciaViagemId = '';
let recorrenciaViagemId_AJAX = '';
let dataInicial_List = '';
let dataInicial = '';
let horaInicial = '';
let agendamentosRecorrentes = [];
let editarTodosRecorrentes = false;
let transformandoEmViagem = false;
let datasSelecionadas = [];

function limpaTooltipsGlobais(timeout = 200) {
    setTimeout(() => {
        // Tooltips Syncfusion
        document.querySelectorAll('.e-tooltip-wrap').forEach(t => t.remove());
        document.querySelectorAll('.e-control.e-tooltip').forEach(el => {
            const instance = el.ej2_instances?.[0];
            if (instance?.destroy) instance.destroy();
        });

        // Tooltips nativas HTML
        document.querySelectorAll('[title]').forEach(el => el.removeAttribute('title'));

        // Tooltips Bootstrap
        $('[data-bs-toggle="tooltip"]').tooltip('dispose');
        $('.tooltip').remove();
    }, timeout);
}

// Atualização na função btnConfirma para uso do arquivo v551 quando periodoRecorrente === 'V'
let isSubmitting = false;
$("#btnConfirma").off("click").on("click", async function (event) {
    try {
        event.preventDefault();
        const $btn = $(this);
        if ($btn.prop("disabled")) {
            console.log("⛔ Botão desabilitado, impedindo clique duplo.");
            return;
        }

        $btn.prop("disabled", true);
        try {
            const viagemId = document.getElementById("txtViagemId").value;
            const validado = await ValidaCampos(viagemId);

            if (!validado) {
                console.warn("⛔ Validação de campos reprovada.");
                return;
            }

            dataInicial = moment(document.getElementById("txtDataInicial").ej2_instances[0].value).toISOString().split('T')[0];
            const periodoRecorrente = document.getElementById("lstPeriodos").ej2_instances[0].value;

            if (!viagemId) {
                if (periodoRecorrente === null) {
                    try {
                        let objViagem = criarAgendamentoUnico();
                        const response = await fetch('/api/Agenda/Agendamento', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(objViagem)
                        });
                        const data = await response.json();
                        if (data.success) {
                            toastr.success("Agendamento Criado com Sucesso");
                            await Swal.fire({
                                iconHtml: '<img src="/images/barbudo.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                                customClass: { popup: 'custom-popup' },
                                title: 'Sucesso',
                                text: 'Agendamento Criado com Sucesso',
                                icon: 'success',
                                confirmButtonText: 'Ok',
                                backdrop: true,
                                heightAuto: false,
                                willOpen: () => {
                                    try {
                                        $('.modal-backdrop').css('z-index', '1040').hide();
                                        $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                                        $('.swal2-backdrop-show').css('z-index', 9998);
                                        Swal.getPopup().focus();
                                    } catch (error) {
                                        TratamentoErroComLinha("agendamento_viagem<num>.js", "willOpen", error);
                                    }
                                },
                                didClose: () => {
                                    try {
                                        $('#modalViagens').modal('hide');
                                        $('.modal-backdrop').css('z-index', '1040').show();
                                    } catch (error) {
                                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                                    }
                                }
                            });
                        } else {
                            toastr.error("Erro ao Criar Viagem", 500);
                            await Swal.fire({
                                iconHtml: '<img src="/images/assustado.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                                customClass: { popup: 'custom-popup' },
                                title: 'Falha',
                                text: 'Viagem Não Criada.',
                                icon: 'error',
                                confirmButtonText: 'Ok',
                                backdrop: true,
                                heightAuto: false,
                                willOpen: () => {
                                    try {
                                        $('.modal-backdrop').css('z-index', '1040').hide();
                                        $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                                        $('.swal2-backdrop-show').css('z-index', 9998);
                                        Swal.getPopup().focus();
                                    } catch (error) {
                                        TratamentoErroComLinha("agendamento_viagem<num>.js", "willOpen", error);
                                    }
                                },
                                didClose: () => {
                                    try {
                                        $('#modalViagens').modal('hide');
                                        $('.modal-backdrop').css('z-index', '1040').show();
                                    } catch (error) {
                                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                                    }
                                }
                            });
                        }
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "(criarAgendamentoUnico)", error);
                    }
                } else if (periodoRecorrente === 'M') {
                    const datasRecorrentes = ajustarDataInicialRecorrente(periodoRecorrente);
                    const datasUnicas = [...new Set(datasRecorrentes)];
                    await handleRecurrence(periodoRecorrente, datasUnicas);
                    exibirMensagemSucesso();
                } else {
                    const datasRecorrentes = ajustarDataInicialRecorrente(periodoRecorrente);
                    await handleRecurrence(periodoRecorrente, datasRecorrentes);
                    exibirMensagemSucesso();
                }
            } else if (viagemId != null && viagemId !== '' && $("#btnConfirma").text() === 'Registra Viagem') {
                transformandoEmViagem = true;

                if (await ValidaCampos(viagemId)) {
                    try {
                        const agendamentoUnicoAlterado = await recuperarViagemEdicao(viagemId);
                        let objViagem = criarAgendamentoViagem(agendamentoUnicoAlterado);
                        const response = await fetch('/api/Agenda/Agendamento', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(objViagem)
                        });
                        const data = await response.json();
                        if (data.success) {
                            toastr.success("Viagem Criada com Sucesso", 500);
                        } else {
                            toastr.error("Erro ao Criar Viagem", 500);
                        }
                        await Swal.fire({
                            iconHtml: '<img src="/images/barbudo.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                            customClass: { popup: 'custom-popup' },
                            title: 'Sucesso',
                            text: 'Viagem Criada com Sucesso.',
                            icon: 'success',
                            confirmButtonText: 'Ok',
                            backdrop: true,
                            heightAuto: false,
                            willOpen: () => {
                                try {
                                    $('.modal-backdrop').css('z-index', '1040').hide();
                                    $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                                    $('.swal2-backdrop-show').css('z-index', 9998);
                                    Swal.getPopup().focus();
                                } catch (error) {
                                    TratamentoErroComLinha("agendamento_viagem<num>.js", "willOpen", error);
                                }
                            },
                            didClose: () => {
                                try {
                                    $('#modalViagens').modal('hide');
                                    $('.modal-backdrop').css('z-index', '1040').show();
                                } catch (error) {
                                    TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                                }
                            }
                        });
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "RegistraViagem", error);
                    }
                }
            } else {
                $.ajax({
                    url: `/api/Viagem/PegarStatusViagem`,
                    type: 'GET',
                    data: { viagemId: viagemId },
                    success: async function (isAberta) {
                        if (isAberta) {
                            try {
                                await editarAgendamento(viagemId);
                            } catch (error) {
                                TratamentoErroComLinha("agendamento_viagem<num>.js", "editarAgendamentoViagemAberta", error);
                            }
                        } else {
                            try {
                                const objViagem = await recuperarViagemEdicao(viagemId);
                                if (objViagem.recorrente === "S") {
                                    const result = await Swal.fire({
                                        iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                                        customClass: { popup: 'custom-popup' },
                                        title: 'Editar Agendamento Recorrente',
                                        text: 'Deseja aplicar as alterações a todos os agendamentos recorrentes ou apenas ao atual?',
                                        icon: 'question',
                                        showCancelButton: true,
                                        confirmButtonText: 'Todos',
                                        cancelButtonText: 'Apenas Atual',
                                        backdrop: true,
                                        heightAuto: false,
                                        willOpen: () => {
                                            try {
                                                $('.modal-backdrop').css('z-index', '1040').hide();
                                                $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                                                $('.swal2-backdrop-show').css('z-index', 9998);
                                                Swal.getPopup().focus();
                                            } catch (error) {
                                                TratamentoErroComLinha("agendamento_viagem<num>.js", "willOpen", error);
                                            }
                                        },
                                        didClose: () => {
                                            try {
                                                $('.modal-backdrop').css('z-index', '1040').show();
                                            } catch (error) {
                                                TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                                            }
                                        }
                                    });
                                    if (result.isConfirmed) {
                                        editarTodosRecorrentes = true;
                                        await editarAgendamentoRecorrente(viagemId, true, objViagem.dataInicial, objViagem.recorrenciaViagemId, editarTodosRecorrentes);
                                    } else {
                                        editarTodosRecorrentes = false;
                                        await editarAgendamentoRecorrente(viagemId, false, objViagem.dataInicial, objViagem.recorrenciaViagemId, editarTodosRecorrentes);
                                    }
                                } else {
                                    await editarAgendamento(viagemId);
                                }
                            } catch (error) {
                                TratamentoErroComLinha("agendamento_viagem<num>.js", "editarAgendamentoRecorrente", error);
                            }
                        }
                    },
                    error: function (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "PegarStatusViagem", error);
                    }
                });
            }
        } catch (error) {
            TratamentoErroComLinha("agendamento_viagem<num>.js", "btnConfirma_inner", error);
        } finally {
            $btn.prop("disabled", false);
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "btnConfirma_global", error);
    }
});

// ===================================================================
// 🧠 Função: obterAgendamentosRecorrenteInicial
// 📌 Descrição: Obtém o agendamento recorrente inicial para edição via chamada AJAX.
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: editarAgendamentoRecorrente, editarAgendamentoRecorrente
// ✅ Status: Ativa
// ===================================================================

async function obterAgendamentosRecorrenteInicial(viagemId) {
    try {
        return new Promise((resolve, reject) => {
            try {
                $.ajax({
                    url: 'api/Agenda/ObterAgendamentoEdicaoInicial',
                    type: 'GET',
                    contentType: 'application/json',
                    data: {
                        viagemId: viagemId
                    },
                    success: function (data) {
                        try {
                            console.log("Requisição AJAX bem-sucedida, dados recebidos:", data);
                            resolve(data);
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                        }
                    },
                    error: function (err) {
                        try {
                            console.error("Erro na requisição AJAX:", err);
                            alert('Algo deu errado');
                            reject(err);
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "error", error);
                        }
                    }
                });
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
            }
        });
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'obterAgendamentosRecorrenteInicial', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "obterAgendamentosRecorrenteInicial", error);
    }
}


// ===================================================================
// 🧠 Função: obterAgendamentosRecorrentes
// 📌 Descrição: Obtém todos os agendamentos recorrentes associados a um ID de recorrência.
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: editarAgendamentoRecorrente, editarAgendamentoRecorrente
// ✅ Status: Ativa
// ===================================================================

async function obterAgendamentosRecorrentes(recorrenciaViagemId) {
    try {
        return new Promise((resolve, reject) => {
            try {
                $.ajax({
                    url: 'api/Agenda/ObterAgendamentoExclusao',
                    type: 'GET',
                    contentType: 'application/json',
                    data: {
                        recorrenciaViagemId: recorrenciaViagemId
                    },
                    success: function (data) {
                        try {
                            console.log("Requisição AJAX bem-sucedida, dados recebidos:", data);
                            resolve(data);
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                        }
                    },
                    error: function (err) {
                        try {
                            console.error("Erro na requisição AJAX:", err);
                            alert('Algo deu errado');
                            reject(err);
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "error", error);
                        }
                    }
                });
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
            }
        });
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'obterAgendamentosRecorrentes', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "obterAgendamentosRecorrentes", error);
    }
}

// ===================================================================
// 🧠 Função: editarAgendamentoRecorrente
// 📌 Descrição: Edita agendamentos recorrentes, aplicando alterações a todos ou apenas ao atual.
// 📤 Chama: criarAgendamentoEdicao, obterAgendamentosRecorrenteInicial, obterAgendamentosRecorrentes, recuperarViagemEdicao
// 📥 Chamado por: [#btnConfirma]
// ✅ Status: Ativa
// ===================================================================

async function editarAgendamentoRecorrente(viagemId, editaTodos, dataInicialRecorrencia, recorrenciaViagemId, editarAgendamentoRecorrente) {
    try {
        if (!viagemId) {
            throw new Error("ViagemId não fornecido.");
        }
        try {
            if (editaTodos) {
                // Lógica para editar todos os agendamentos recorrentes

                //Se for o primeiro registro da série
                if (recorrenciaViagemId === '00000000-0000-0000-0000-000000000000') {
                    recorrenciaViagemId = viagemId;
                    const [agendamentoRecorrente = {}] = await obterAgendamentosRecorrenteInicial(viagemId);
                    let objViagem = criarAgendamentoEdicao(agendamentoRecorrente);
                    objViagem.editarTodosRecorrentes = true;
                    objViagem.editarAPartirData = dataInicial;
                    const response = await fetch('/api/Agenda/Agendamento', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(objViagem)
                    });
                    const data = await response.json();
                    if (data.data) {
                        toastr.success(data.message);
                    } else {
                        toastr.error(data.message);
                    }
                }
                const agendamentosRecorrentes = await obterAgendamentosRecorrentes(recorrenciaViagemId);
                for (const agendamentoRecorrente of agendamentosRecorrentes) {
                    if (agendamentoRecorrente.dataInicial >= dataInicialRecorrencia) {
                        let objViagem = criarAgendamentoEdicao(agendamentoRecorrente);
                        //objViagem.editarTodosRecorrentes = true;
                        //objViagem.editarAPartirData = dataInicial;
                        const response = await fetch('/api/Agenda/Agendamento', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(objViagem)
                        });
                        const data = await response.json();
                        if (data.data) {
                            toastr.success(data.message);
                        } else {
                            toastr.error(data.message);
                        }
                    }
                }
            } else {
                // Lógica para editar apenas o agendamento atual
                const agendamentoUnicoAlterado = await recuperarViagemEdicao(viagemId);
                let objViagem = criarAgendamentoEdicao(agendamentoUnicoAlterado);
                //objViagem.editarTodosRecorrentes = false;
                //objViagem.EditarAPartirData = objViagem.dataInicial;
                const response = await fetch('/api/Agenda/Agendamento', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(objViagem)
                });
                const data = await response.json();
                if (data.data) {
                    toastr.success(data.message);
                } else {
                    toastr.error(data.message);
                }
            }
            Swal.fire({
                iconHtml: '<img src="/images/barbudo.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup'
                },
                title: 'Sucesso',
                text: 'Agendamento Editado com Sucesso.',
                icon: 'success',
                confirmButtonText: 'Ok',
                backdrop: true,
                heightAuto: false,
                didOpen: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').hide();
                        $('.swal2-container').css({
                            'z-index': 9999,
                            'position': 'fixed'
                        });
                        $('.swal2-backdrop-show').css('z-index', 9998);
                        Swal.getPopup().focus();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                    }
                },
                didClose: () => {
                    try {
                        $('#modalViagens').modal('hide');
                        $('.modal-backdrop').css('z-index', '1040').show();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                    }
                }
            });
        } catch (error) {
            /* CATCH ORIGINAL:
            console.error("Erro ao editar o agendamento:", error);
            alert('something went wrong');
             */
            TratamentoErroComLinha("agendamento_viagem<num>.js", "editarAgendamentoRecorrente", error);
        }
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'editarAgendamentoRecorrente', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "editarAgendamentoRecorrente", error);
    }
}

// ===================================================================
// 🧠 Função: editarAgendamento
// 📌 Descrição: Edita um único agendamento existente, preservando o status "Aberta" e atualizando apenas a data.
// 📤 Chama: ValidaCampos, criarAgendamentoEdicao, recuperarViagemEdicao
// 📥 Chamado por: [btnConfirma]
// ✅ Status: Ativa
// ===================================================================

async function editarAgendamento(viagemId) {
    try {
        if (!viagemId) {
            throw new Error("ViagemId é obrigatório.");
        }
        try {
            const agendamentoBase = await recuperarViagemEdicao(viagemId);
            if (!agendamentoBase) {
                throw new Error("Agendamento inexistente.");
            }

            // Aqui está a correção: coleta todos os campos atualizados da UI
            const agendamentoEditado = criarAgendamentoEdicao(agendamentoBase);

            //Valida os Campos do Formulário  
            if (ValidaCampos(agendamentoEditado.ViagemId)) {

                const response = await fetch('/api/Agenda/Agendamento', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(agendamentoEditado)
                });

                let tipoAgendamento = "Viagem";

                if (agendamentoEditado.Status === "Aberta") {
                    tipoAgendamento = "Viagem";
                }
                else {
                    tipoAgendamento = "Agendamento";
                }

                const resultado = await response.json();
                if (resultado.success) {
                    toastr.success(tipoAgendamento + ' atualizado com sucesso!');
                } else {
                    toastr.error('Erro ao atualizar ' + tipoAgendamento);
                }
                if (window.calendar?.refetchEvents) {
                    window.calendar.refetchEvents();
                }
                await Swal.fire({
                    iconHtml: '<img src="/images/barbudo.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                    title: 'Sucesso!',
                    text: tipoAgendamento + ' alterado com sucesso!',
                    confirmButtonText: 'Ok',
                    backdrop: true,
                    heightAuto: false,
                    customClass: {
                        popup: 'custom-popup'
                    },
                    didOpen: () => {
                        try {
                            $('.modal-backdrop').hide().css('z-index', '1040');
                            $('.swal2-container').css({
                                'z-index': 9999,
                                position: 'fixed'
                            });
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                        }
                    },
                    didClose: () => {
                        try {
                            $('.modal-backdrop').show().css('z-index', '1040');
                            $('#modalViagens').modal('hide');
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                        }
                    }
                });
            }

        } catch (error) {
            TratamentoErroComLinha("agendamento_viagem<num>.js", "editarAgendamento", error);
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "editarAgendamento", error);
    }
}

/**
 * Controla a criação de agendamentos recorrentes a partir de uma lista de datas.
 * Chamado de: localizar no fluxo principal (ex: btnConfirma click).
 */
// ===================================================================
// 🧠 Função: handleRecurrence
// 📌 Descrição: Controla a criação de agendamentos recorrentes a partir de uma lista de datas.
// 📤 Chama: criarAgendamento, enviarNovoAgendamento
// 📥 Chamado por: [#btnConfirma]
// ✅ Status: Ativa
// ===================================================================

async function handleRecurrence(periodoRecorrente, datasRecorrentes) {
    try {
        if (!datasRecorrentes || datasRecorrentes.length === 0) {
            console.error("Nenhuma data inicial válida retornada para o período.");
            return;
        }

        // Enviar o primeiro agendamento e salvar o viagemId gerado
        let primeiroAgendamento = criarAgendamento(null, null, datasRecorrentes[0]);
        let agendamentoObj;
        try {
            agendamentoObj = await enviarNovoAgendamento(primeiroAgendamento, datasRecorrentes.length === 1);
            if (!agendamentoObj || !agendamentoObj.novaViagem || !agendamentoObj.novaViagem.viagemId) {
                throw new Error("Erro ao criar o primeiro agendamento.");
            }
        } catch (error) {
            /* CATCH ORIGINAL:
            console.error("Erro ao criar o primeiro agendamento:", error);
            throw error;
             */
            TratamentoErroComLinha("agendamento_viagem<num>.js", "handleRecurrence", error);
        }

        // Criar agendamentos subsequentes para as demais datas
        if (datasRecorrentes.length > 1) {
            for (let i = 1; i < datasRecorrentes.length; i++) {
                const agendamentoSubsequente = criarAgendamento(null, agendamentoObj.novaViagem.viagemId, datasRecorrentes[i]);
                try {
                    await enviarNovoAgendamento(agendamentoSubsequente, i === datasRecorrentes.length - 1);
                } catch (error) {
                    /* CATCH ORIGINAL:
                    console.error(`Erro ao criar agendamento subsequente para ${datasRecorrentes[i]}:`, error);
                     */
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "handleRecurrence", error);
                }
            }
        }
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'handleRecurrence', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "handleRecurrence", error);
    }
}

// ===================================================================
// 🧠 Função: enviarNovoAgendamento
// 📌 Descrição: Envia um novo agendamento ao backend e exibe sucesso no último envio.
// 📤 Chama: enviarAgendamento, exibirMensagemSucesso, handleAgendamentoError
// 📥 Chamado por: handleRecurrence
// ✅ Status: Ativa
// ===================================================================

async function enviarNovoAgendamento(agendamento, isUltimoAgendamento = true) {
    try {
        try {
            const objViagem = await enviarAgendamento(agendamento);
            if (!objViagem.operacaoBemSucedida) {
                console.error("Erro ao criar novo agendamento: operação não bem-sucedida", objViagem);
                throw new Error("Erro ao criar novo agendamento");
            }
            if (isUltimoAgendamento) {
                exibirMensagemSucesso();
            }
            return objViagem;
        } catch (error) {
            /* CATCH ORIGINAL:
            console.error("Erro ao criar novo agendamento:", error);
            handleAgendamentoError(error);
            throw error;
             */
            TratamentoErroComLinha("agendamento_viagem<num>.js", "enviarNovoAgendamento", error);
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "enviarNovoAgendamento", error);
    }
}

// ===================================================================
// 🧠 Função: enviarAgendamentoComOpcao
// 📌 Descrição: Função para enviar agendamento com a opção de editar todos ou todos os próximos;
// 📤 Chama: criarAgendamento, enviarAgendamento
// 📥 Chamado por: editarAgendamentoRecorrente
// ✅ Status: Ativa
// ===================================================================

async function enviarAgendamentoComOpcao(viagemId, editarTodos, editarProximos, dataInicial = null, viagemIdRecorrente = null) {
    try {
        try {
            // Verifica se a data inicial foi passada, senão usa a data atual como default;
            if (!dataInicial) {
                dataInicial = moment().format('YYYY-MM-DD');
            }
            const agendamento = criarAgendamento(viagemId, viagemIdRecorrente, dataInicial);

            // Adiciona as opções de edição ao agendamento;
            agendamento.EditarTodos = editarTodos;
            agendamento.EditarProximos = editarProximos;
            const objViagem = await enviarAgendamento(agendamento);
            if (objViagem) {
                Swal.fire({
                    title: 'Sucesso',
                    text: 'Agendamento atualizado com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                });
            }
        } catch (error) {
            TratamentoErroComLinha("agendamento_viagem<num>.js", "enviarAgendamentoComOpcao", error);
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "enviarAgendamentoComOpcao", error);
    }
}

// ===================================================================
// 🧠 Função: obterEDefinirDatasCalendario
// 📌 Descrição: Recupera dados de uma fonte (ex: servidor ou cache)
// 📤 Chama: atualizarCalendarioExistente, getDatasIniciais
// 📥 Chamado por: ExibeViagem
// ✅ Status: Ativa
// ===================================================================

async function obterEDefinirDatasCalendario(viagem, viagemIdRecorrente) {
    try {
        try {
            console.log("Testando chamada a getDatasIniciais...");
            const datasIniciais = await getDatasIniciais(viagem, viagemIdRecorrente);
            if (datasIniciais && datasIniciais.length > 0) {
                console.log("Datas iniciais recebidas:", datasIniciais);
                atualizarCalendarioExistente(datasIniciais);
            } else {
                console.error("Nenhuma data inicial foi recebida.");
            }
        } catch (error) {
            TratamentoErroComLinha("agendamento_viagem<num>.js", "obterEDefinirDatasCalendario", error);
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "obterEDefinirDatasCalendario", error);
    }
}

// ===================================================================
// 🧠 Função: getDatasIniciais
// 📌 Descrição: Recupera dados de uma fonte (ex: servidor ou cache)
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: obterEDefinirDatasCalendario
// ✅ Status: Ativa
// ===================================================================

async function getDatasIniciais(viagemId, recorrenciaViagemId) {
    try {
        console.log("Chamando getDatasIniciais com viagemId:", viagemId_AJAX, "e recorrenciaViagemId:", recorrenciaViagemId_AJAX);
        try {
            return new Promise((resolve, reject) => {
                try {
                    $.ajax({
                        url: 'api/Agenda/GetDatasViagem',
                        // Mantenha o caminho correto para seu método no controller;
                        type: 'GET',
                        contentType: 'application/json',
                        data: {
                            viagemId: viagemId_AJAX,
                            recorrenciaViagemId: recorrenciaViagemId_AJAX
                        },
                        // Envie os GUIDs como parâmetros de consulta;
                        success: function (data) {
                            try {
                                console.log("Requisição AJAX bem-sucedida, dados recebidos:", data);
                                resolve(data);
                            } catch (error) {
                                TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                            }
                        },
                        error: function (err) {
                            try {
                                console.error("Erro na requisição AJAX:", err);
                                alert('Algo deu errado');
                                reject(err);
                            } catch (error) {
                                TratamentoErroComLinha("agendamento_viagem<num>.js", "error", error);
                            }
                        }
                    });
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                }
            });
        } catch (error) {
            TratamentoErroComLinha("agendamento_viagem<num>.js", "getDatasIniciais", error);
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "getDatasIniciais", error);
    }
}

// ===================================================================
// 🧠 Função: atualizarListBoxHTMLComDatas
// 📌 Descrição:  Função para atualizar o componente HTML ListBox com as datas selecionadas;
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: atualizarCalendarioExistente
// ✅ Status: Ativa
// ===================================================================

function atualizarListBoxHTMLComDatas(datas) {
    try {

        // Atualiza a lista global com as datas recebidas
        datasSelecionadas = [...datas];

        const listBoxHTML = document.getElementById("lstDiasCalendarioHTML");
        const divDiasSelecionados = document.getElementById("diasSelecionadosTexto");

        if (!listBoxHTML) return;

        listBoxHTML.innerHTML = "";
        let contDatas = 0;

        datas.forEach(data => {
            const dataFormatada = moment(data).format("DD/MM/YYYY");
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";

            li.innerHTML = `
                <span>${dataFormatada}</span>
            `;

            listBoxHTML.appendChild(li);

            contDatas += 1;

        });

        const badge2 = document.getElementById("itensBadgeHTML");
        if (badge2) badge2.textContent = contDatas;

        if (divDiasSelecionados) {
            divDiasSelecionados.textContent = `Dias Selecionados (${datas.length})`;
        }

    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "atualizarListBoxHTMLComDatas", error);
    }
}


// ===================================================================
// 🧠 Função: atualizarCalendarioExistente
// 📌 Descrição: Edita ou atualiza informações existentes
// 📤 Chama: atualizarListBoxHTMLComDatas
// 📥 Chamado por: obterEDefinirDatasCalendario
// ✅ Status: Ativa
// ===================================================================

function atualizarCalendarioExistente(datas) {
    try {
        var selectedDates = datas.map(data => {
            try {
                return new Date(data);
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
            }
        });
        let calendarObj = document.getElementById('calDatasSelecionadas').ej2_instances[0];
        if (calendarObj) {
            // Atualiza as datas selecionadas;
            calendarObj.values = selectedDates;

            // Desabilita a escolha de datas, mas permite a navegação entre meses;
            calendarObj.renderDayCell = function (args) {
                try {
                    // Obter a data atual;
                    let today = new Date();
                    today.setHours(0, 0, 0, 0); // Zerar horas para comparação precisa;

                    // Verificar se a célula é o dia corrente;
                    if (args.date.getTime() === today.getTime()) {
                        // Desabilitar o dia corrente;
                        args.isDisabled = true;

                        // Opcional: Remover a classe que destaca o dia corrente;
                        args.element.classList.remove('e-today');
                    }
                    const isDateSelected = selectedDates.some(selectedDate => {
                        try {
                            return args.date.getFullYear() === selectedDate.getFullYear() && args.date.getMonth() === selectedDate.getMonth() && args.date.getDate() === selectedDate.getDate();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                        }
                    });
                    if (isDateSelected) {
                        // Desativa as datas que vieram do backend, mantendo-as selecionadas;
                        args.isDisabled = true;
                        args.element.classList.add('e-selected'); // Assegura que a data esteja visivelmente selecionada;
                    }
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
                }
            };

            // Bloquear a seleção/desseleção de datas pelo usuário;
            calendarObj.change = function (args) {
                try {
                    // Impedir que o usuário desmarque qualquer data ou marque novas;
                    calendarObj.values = selectedDates;
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
                }
            };

            // Atualiza o calendário para aplicar as novas configurações;
            calendarObj.refresh();

            // Atualiza o ListBox também;
            atualizarListBoxHTMLComDatas(datas);
        } else {
            console.error("Calendário não inicializado!");
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "atualizarCalendarioExistente", error);
    }
}

/// ===================================================================
// 🧠 Função: enviarAgendamento
// 📌 Descrição: Função para enviar agendamento ao backend;
// 📤 Chama: handleAgendamentoError
// 📥 Chamado por: enviarNovoAgendamento, enviarAgendamentoComOpcao, executarEdicao, enviarAgendamentoRecorrente
// ✅ Status: Ativa
// ===================================================================

async function enviarAgendamento(agendamento) {
    try {
        // Verificar se já há uma submissão em andamento;
        if (isSubmitting) {
            console.warn("Tentativa de enviar enquanto outra requisição está em andamento.");
            return;
        }
        isSubmitting = true; // Sinalizar que estamos enviando um agendamento;
        $("#btnConfirma").prop("disabled", true); // Desabilitar botão para evitar múltiplas requisições;

        try {
            // Enviar o agendamento para o backend;
            const response = await $.ajax({
                type: "POST",
                url: "/api/Agenda/Agendamento",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(agendamento)
            });
            if (response && response.novaViagem.operacaoBemSucedida) {
                console.log("Agendamento enviado com sucesso.");
            } else {
                console.error("Erro ao enviar agendamento: operação não bem-sucedida.", response);
                throw new Error("Erro ao criar agendamento. Operação não bem-sucedida.");
            }
            response.operacaoBemSucedida = true;
            return response;
        } catch (error) {
            TratamentoErroComLinha("agendamento_viagem<num>.js", "enviarAgendamento", error);
        } finally {
            isSubmitting = false; // Liberar a sinalização de envio em andamento;
            $("#btnConfirma").prop("disabled", false); // Habilitar o botão novamente;
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "enviarAgendamento", error);
    }
}

// ===================================================================
// 🧠 Função: handleAgendamentoError
// 📌 Descrição: Lida com erros durante o processo de criação de agendamento, exibindo uma mensagem apropriada.
// 📤 Chama: exibirErroAgendamento
// 📥 Chamado por: enviarNovoAgendamento, enviarAgendamento
// ✅ Status: Ativa
// ===================================================================

function handleAgendamentoError(error) {
    try {
        exibirErroAgendamento();
        //    }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "handleAgendamentoError", error);
    }
}

// ===================================================================
// 🧠 Função: exibirErroAgendamento
// 📌 Descrição: Exibe uma mensagem de erro ao usuário se ocorrer um problema ao criar o agendamento.
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: handleAgendamentoError
// ✅ Status: Ativa
// ===================================================================

function exibirErroAgendamento() {
    try {
        Swal.fire({
            iconHtml: '<img src="/images/assustado.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup'
            },
            title: 'Erro ao criar agendamento',
            text: 'Não foi possível criar o agendamento com os dados informados!',
            icon: 'error',
            confirmButtonText: 'Ok',
            backdrop: true,
            heightAuto: false,
            timer: 3000,
            didOpen: () => {
                try {
                    // Garantir que todos os backdrops e modais relacionados ao modal estejam ocultos;
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Ocultar o backdrop do Bootstrap;

                    // Definir z-index para o container e backdrop do SweetAlert2;
                    $('.swal2-container').css({
                        'z-index': 9999,
                        // Maior valor de z-index possível;
                        'position': 'fixed' // Garantir que esteja posicionado corretamente;
                    });
                    $('.swal2-backdrop-show').css('z-index', 9998); // Logo abaixo da janela de alerta;

                    // Focar no SweetAlert2 para evitar interferências dos modais;
                    Swal.getPopup().focus();
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                }
            },
            didClose: () => {
                try {
                    // Restaurar o backdrop do Bootstrap após o fechamento do SweetAlert;
                    $('.modal-backdrop').css('z-index', '1040').show();
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                }
            }
        });
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "exibirErroAgendamento", error);
    }
}

// ===================================================================
// 🧠 Função: ajustarDataInicialRecorrente
// 📌 Descrição: Função para ajustar datas iniciais para períodos recorrentes
// 📤 Chama: gerarRecorrenciaDiaria, gerarRecorrenciaMensal, gerarRecorrenciaPorPeriodo, gerarRecorrenciaVariada
// 📥 Chamado por: [#btnConfirma]
// ✅ Status: Ativa
// ===================================================================

function ajustarDataInicialRecorrente(tipoRecorrencia) {
    try {
        const datas = [];
        if (tipoRecorrencia === 'V') {
            // Trata o caso de 'Dias Variados' separadamente
            gerarRecorrenciaVariada(datas);
            return datas.length > 0 ? datas : null;
        }

        // Lógica para outros tipos de recorrência que consideram data inicial e final
        let dataAtual = document.getElementById("txtDataInicial")?.ej2_instances?.[0]?.value;
        const dataFinal = document.getElementById("txtFinalRecorrencia")?.ej2_instances?.[0]?.value;
        if (!dataAtual || !dataFinal) {
            console.error("Data Inicial ou Data Final não encontrada.");
            return null;
        }
        dataAtual = moment(dataAtual).toISOString().split('T')[0];
        const dataFinalFormatada = moment(dataFinal).toISOString().split('T')[0];
        let diasSelecionados = document.getElementById("lstDias")?.ej2_instances?.[0]?.value || [];
        if (tipoRecorrencia === 'M') {
            diasSelecionados = [].concat(document.getElementById("lstDiasMes")?.ej2_instances?.[0]?.value || []);
        }
        let diasSelecionadosIndex = [];
        if (tipoRecorrencia !== 'M') {
            diasSelecionadosIndex = diasSelecionados.map(dia => {
                try {
                    return {
                        "Sunday": 0,
                        "Monday": 1,
                        "Tuesday": 2,
                        "Wednesday": 3,
                        "Thursday": 4,
                        "Friday": 5,
                        "Saturday": 6
                    }[dia];
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                }
            });
        }
        if (tipoRecorrencia === 'D') {
            gerarRecorrenciaDiaria(dataAtual, dataFinalFormatada, datas);
        } else if (tipoRecorrencia === 'M') {
            gerarRecorrenciaMensal(dataAtual, dataFinalFormatada, diasSelecionados, datas);
        } else {
            gerarRecorrenciaPorPeriodo(tipoRecorrencia, dataAtual, dataFinalFormatada, diasSelecionadosIndex, datas);
        }
        return datas.length > 0 ? datas : null;
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "ajustarDataInicialRecorrente", error);
    }
}

// ===================================================================
// 🧠 Função: gerarRecorrenciaVariada
// 📌 Descrição: Extrai datas variadas selecionadas no calendário para recorrência.
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: ajustarDataInicialRecorrente
// ✅ Status: Ativa
// ===================================================================

function gerarRecorrenciaVariada(datas) {
    try {
        let calendarObj = document.getElementById('calDatasSelecionadas')?.ej2_instances?.[0];
        if (!calendarObj || !calendarObj.values || calendarObj.values.length === 0) {
            console.error("Nenhuma data selecionada no calendário para recorrência do tipo 'V'.");
            return;
        }

        // Adiciona cada data selecionada ao array de datas no formato 'YYYY-MM-DD'
        calendarObj.values.forEach(date => {
            try {
                if (date) {
                    datas.push(moment(date).format('YYYY-MM-DD'));
                }
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
            }
        });
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "gerarRecorrenciaVariada", error);
    }
}

// ===================================================================
// 🧠 Função: gerarRecorrenciaMensal
// 📌 Descrição:  Gera datas mensais para recorrência entre intervalo definido.
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: ajustarDataInicialRecorrente
// ✅ Status: Ativa
// ===================================================================

function gerarRecorrenciaMensal(dataAtual, dataFinal, diasSelecionados, datas) {
    try {
        dataAtual = moment(dataAtual);
        dataFinal = moment(dataFinal);
        while (dataAtual.isSameOrBefore(dataFinal)) {
            diasSelecionados.forEach(dia => {
                try {
                    let proximaData = moment(dataAtual).date(dia);

                    // Certifique-se de que a data não seja anterior à data inicial
                    if (proximaData.isBefore(dataAtual)) {
                        return;
                    }

                    // Verifica se a data gerada está dentro do intervalo permitido e se corresponde ao padrão de recorrência
                    if (proximaData.isSameOrBefore(dataFinal) && proximaData.isSameOrAfter(dataAtual.startOf('month'))) {
                        datas.push(proximaData.format('YYYY-MM-DD'));
                    }
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                }
            });

            // Incrementa para o próximo mês, sem ultrapassar a data final
            dataAtual.add(1, 'month').startOf('month');
            if (dataAtual.isAfter(dataFinal)) break;
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "gerarRecorrenciaMensal", error);
    }
}

// ===================================================================
// 🧠 Função: gerarRecorrenciaDiaria
// 📌 Descrição: Gera datas diárias (segunda a sexta) entre intervalo definido.
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: ajustarDataInicialRecorrente
// ✅ Status: Ativa
// ===================================================================

function gerarRecorrenciaDiaria(dataAtual, dataFinal, datas) {
    try {
        dataAtual = moment(dataAtual);
        dataFinal = moment(dataFinal);
        while (dataAtual.isSameOrBefore(dataFinal)) {
            const dayOfWeek = dataAtual.isoWeekday();
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                // Recorrência de segunda a sexta-feira
                datas.push(dataAtual.format('YYYY-MM-DD'));
            }
            dataAtual.add(1, 'days');
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "gerarRecorrenciaDiaria", error);
    }
}

// ===================================================================
// 🧠 Função: gerarRecorrenciaPorPeriodo
// 📌 Descrição: Gera datas semanais ou quinzenais para recorrência.
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: ajustarDataInicialRecorrente
// ✅ Status: Ativa
// ===================================================================
function gerarRecorrenciaPorPeriodo(tipoRecorrencia, dataAtual, dataFinal, diasSelecionadosIndex, datas) {
    try {
        dataAtual = moment(dataAtual);
        dataFinal = moment(dataFinal);

        // Ajusta a dataAtual para a próxima segunda-feira quando a recorrência for quinzenal
        if (tipoRecorrencia === 'Q') {
            dataAtual = moment(dataAtual).day(8); // Define para a próxima segunda-feira
        }
        while (dataAtual.isSameOrBefore(dataFinal)) {
            diasSelecionadosIndex.forEach(diaSelecionado => {
                try {
                    let proximaData = moment(dataAtual).day(diaSelecionado);
                    if (proximaData.isBefore(dataAtual)) proximaData.add(1, 'week');
                    if (proximaData.isSameOrBefore(dataFinal) && !datas.includes(proximaData.format('YYYY-MM-DD'))) {
                        datas.push(proximaData.format('YYYY-MM-DD'));
                    }
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                }
            });
            switch (tipoRecorrencia) {
                case 'S':
                    dataAtual.add(1, 'week');
                    break;
                case 'Q':
                    dataAtual.add(2, 'weeks');
                    break;
                default:
                    console.error("Tipo de recorrência inválido: ", tipoRecorrencia);
                    return;
            }
            if (dataAtual.isAfter(dataFinal)) break;
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "gerarRecorrenciaPorPeriodo", error);
    }
}

// ===================================================================
// 🧠 Função: exibirMensagemSucesso
// 📌 Descrição: Exibe uma mensagem de sucesso após a criação dos agendamentos.
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: enviarNovoAgendamento
// ✅ Status: Ativa
// ===================================================================

function exibirMensagemSucesso() {
    try {
        Swal.fire({
            iconHtml: '<img src="/images/barbudo.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup'
            },
            title: 'Sucesso',
            text: 'Agendamentos criados com sucesso para todas as datas selecionadas.',
            icon: 'success',
            confirmButtonText: 'Ok',
            backdrop: true,
            heightAuto: false,
            didOpen: () => {
                try {
                    // Garantir que todos os backdrops e modais relacionados ao modal estejam ocultos;
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Ocultar o backdrop do Bootstrap;

                    // Definir z-index para o container e backdrop do SweetAlert2;
                    $('.swal2-container').css({
                        'z-index': 9999,
                        // Maior valor de z-index possível;
                        'position': 'fixed' // Garantir que esteja posicionado corretamente;
                    });
                    $('.swal2-backdrop-show').css('z-index', 9998); // Logo abaixo da janela de alerta;

                    // Focar no SweetAlert2 para evitar interferências dos modais;
                    Swal.getPopup().focus();
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                }
            },
            didClose: () => {
                try {
                    // Fechar o modal "modalViagens" após o fechamento do SweetAlert;
                    $('#modalViagens').modal('hide');
                    // Restaurar o backdrop do Bootstrap após o fechamento do SweetAlert;
                    $('.modal-backdrop').css('z-index', '1040').show();
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                }
            }
        });
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "exibirMensagemSucesso", error);
    }
}

// ===================================================================
// 🧠 Função: ValidaCampos
// 📌 Descrição: Valida dados do formulário ou regras de negócio
// 📤 Chama: validarDatas, validarKmInicialFinal, validarQuilometragem
// 📥 Chamado por: editarAgendamento
// ✅ Status: Ativa
// ===================================================================

async function ValidaCampos(viagemId) {
    try {
        console.log("Entrei na validação: " + viagemId);

        const datasOk = await validarDatas();
        if (!datasOk) return false;

        if (document.getElementById("txtHoraInicial").value === "") {
            await Swal.fire({
                title: '⚠️ Atenção',
                text: 'A Hora Inicial é obrigatória',
                icon: 'error',
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: { popup: 'custom-popup' },
                confirmButtonText: 'OK',
                heightAuto: false,
                willOpen: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').hide();
                        $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                        $('.swal2-backdrop-show').css('z-index', 9998);
                        Swal.getPopup().focus();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                    }
                },
                didClose: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').show();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                    }
                }
            });
            return false;
        }

        const finalidade = document.getElementById("lstFinalidade").ej2_instances[0].value;
        if (finalidade === '') {
            await Swal.fire({
                title: '⚠️ Atenção',
                text: 'A Finalidade é obrigatória',
                icon: 'error',
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: { popup: 'custom-popup' },
                confirmButtonText: 'OK',
                heightAuto: false,
                willOpen: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').hide();
                        $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                        $('.swal2-backdrop-show').css('z-index', 9998);
                        Swal.getPopup().focus();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                    }
                },
                didClose: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').show();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                    }
                }
            });
            return false;
        }
        const origem = document.getElementById("cmbOrigem").ej2_instances[0].value;
        if (origem === "") {
            await Swal.fire({
                title: '⚠️ Atenção',
                text: 'A Origem é obrigatória',
                icon: 'error',
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: { popup: 'custom-popup' },
                confirmButtonText: 'OK',
                heightAuto: false,
                willOpen: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').hide();
                        $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                        $('.swal2-backdrop-show').css('z-index', 9998);
                        Swal.getPopup().focus();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                    }
                },
                didClose: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').show();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                    }
                }
            });
            document.getElementById("cmbOrigem").ej2_instances[0].focus();
            return false;
        }

        if (viagemId != null && viagemId !== '' && $("#btnConfirma").text() !== 'Edita Agendamento') {
            if (document.getElementById("txtNoFichaVistoria").value === "") {
                await Swal.fire({
                    title: "⚠️ Atenção",
                    text: "O Nº da Ficha de Vistoria é obrigatório!",
                    icon: 'warning',
                    iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                    customClass: { popup: 'custom-popup' },
                    confirmButtonText: 'OK',
                    heightAuto: false,
                    willOpen: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').hide();
                            $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                            $('.swal2-backdrop-show').css('z-index', 9998);
                            Swal.getPopup().focus();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                        }
                    },
                    didClose: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').show();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                        }
                    }
                });
                return false;
            }
            const lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
            if (lstMotorista.value === null) {
                await Swal.fire({
                    title: "⚠️ Atenção",
                    text: "O Motorista é obrigatório",
                    icon: 'warning',
                    iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                    customClass: { popup: 'custom-popup' },
                    confirmButtonText: 'OK',
                    heightAuto: false,
                    willOpen: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').hide();
                            $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                            $('.swal2-backdrop-show').css('z-index', 9998);
                            Swal.getPopup().focus();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                        }
                    },
                    didClose: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').show();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                        }
                    }
                });
                return false;
            }

            const lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
            if (lstVeiculo.value === null) {
                await Swal.fire({
                    title: "⚠️ Atenção",
                    text: "O Veículo é obrigatório",
                    icon: 'warning',
                    iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                    customClass: { popup: 'custom-popup' },
                    confirmButtonText: 'OK',
                    heightAuto: false,
                    willOpen: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').hide();
                            $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                            $('.swal2-backdrop-show').css('z-index', 9998);
                            Swal.getPopup().focus();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                        }
                    },
                    didClose: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').show();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                        }
                    }
                });
                return false;
            }

            const kmOk = await validarKmInicialFinal();
            if (!kmOk) return false;

            const ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0];
            if (ddtCombustivelInicial.value === "") {
                await Swal.fire({
                    title: "⚠️ Atenção",
                    text: "O Combustível Inicial é obrigatório!",
                    icon: "error",
                    iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                    customClass: { popup: 'custom-popup' },
                    confirmButtonText: 'OK',
                    heightAuto: false,
                    willOpen: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').hide();
                            $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                            $('.swal2-backdrop-show').css('z-index', 9998);
                            Swal.getPopup().focus();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                        }
                    },
                    didClose: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').show();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                        }
                    }
                });
                return false;
            }
        }
        const lstRequisitante = document.getElementById("lstRequisitante").ej2_instances[0];
        if (!lstRequisitante.value) {
            await Swal.fire({
                title: "⚠️ Atenção",
                text: "O Requisitante é obrigatório",
                icon: 'error',
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: { popup: 'custom-popup' },
                confirmButtonText: 'OK',
                heightAuto: false,
                willOpen: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').hide();
                        $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                        $('.swal2-backdrop-show').css('z-index', 9998);
                        Swal.getPopup().focus();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                    }
                },
                didClose: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').show();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                    }
                }
            });
            return false;
        }

        if (document.getElementById("txtRamalRequisitante").value === "") {
            await Swal.fire({
                title: "⚠️ Atenção",
                text: "O Ramal do Requisitante é obrigatório",
                icon: 'error',
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: { popup: 'custom-popup' },
                confirmButtonText: 'OK',
                heightAuto: false,
                willOpen: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').hide();
                        $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                        $('.swal2-backdrop-show').css('z-index', 9998);
                        Swal.getPopup().focus();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                    }
                },
                didClose: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').show();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                    }
                }
            });
            return false;
        }
        const ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
        if (ddtSetor.value === null) {
            await Swal.fire({
                title: "⚠️ Atenção",
                text: "O Setor Solicitante é obrigatório",
                icon: 'error',
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: { popup: 'custom-popup' },
                confirmButtonText: 'OK',
                heightAuto: false,
                willOpen: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').hide();
                        $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                        $('.swal2-backdrop-show').css('z-index', 9998);
                        Swal.getPopup().focus();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                    }
                },
                didClose: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').show();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                    }
                }
            });
            return false;
        }

        if (document.getElementById("lstFinalidade").ej2_instances[0].value[0] === 'Evento') {
            const evento = document.getElementById("lstEventos").ej2_instances[0].value;
            if (!evento) {
                await Swal.fire({
                    title: "⚠️ Atenção",
                    text: "O nome do evento é obrigatório",
                    icon: 'error',
                    iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                    customClass: { popup: 'custom-popup' },
                    confirmButtonText: 'OK',
                    heightAuto: false,
                    willOpen: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').hide();
                            $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                            $('.swal2-backdrop-show').css('z-index', 9998);
                            Swal.getPopup().focus();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                        }
                    },
                    didClose: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').show();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                        }
                    }
                });
                return false;
            }
        }

        if (viagemId != null && viagemId !== '' && $("#btnConfirma").text() === 'Registra Viagem') {
            transformandoEmViagem = true;
        }

        if (transformandoEmViagem === false) {
            const recorrente = document.getElementById("lstRecorrente").ej2_instances[0].value;
            const periodo = document.getElementById("lstPeriodos").ej2_instances[0].value;

            if (recorrente === 'S' && (!periodo || periodo === '')) {
                await Swal.fire({
                    title: "⚠️ Atenção",
                    text: "Se o Agendamento é Recorrente, você precisa escolher o Período de Recorrência!",
                    icon: 'error',
                    iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                    customClass: { popup: 'custom-popup' },
                    confirmButtonText: 'OK',
                    heightAuto: false,
                    willOpen: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').hide();
                            $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                            $('.swal2-backdrop-show').css('z-index', 9998);
                            Swal.getPopup().focus();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                        }
                    },
                    didClose: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').show();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                        }
                    }
                });
                return false;
            }

            if ((periodo === 'S' || periodo === 'Q' || periodo === 'M') && (document.getElementById("lstDias").ej2_instances[0].value === '' || document.getElementById("lstDias").ej2_instances[0].value === null)) {
                await Swal.fire({
                    title: "⚠️ Atenção",
                    text: "Se o período foi escolhido como semanal, quinzenal ou mensal, você precisa escolher os Dias da Semana!",
                    icon: 'error',
                    iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                    customClass: { popup: 'custom-popup' },
                    confirmButtonText: 'OK',
                    heightAuto: false,
                    willOpen: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').hide();
                            $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                            $('.swal2-backdrop-show').css('z-index', 9998);
                            Swal.getPopup().focus();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                        }
                    },
                    didClose: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').show();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                        }
                    }
                });
                return false;
            }
        }
        const periodo = document.getElementById("lstPeriodos").ej2_instances[0].value;
        if ((periodo === 'D' || periodo === 'S' || periodo === 'Q' || periodo === 'M') &&
            (document.getElementById("txtFinalRecorrencia").ej2_instances[0].value === '' ||
                document.getElementById("txtFinalRecorrencia").ej2_instances[0].value === null)) {

            await Swal.fire({
                title: "⚠️ Atenção",
                text: "Se o período foi escolhido como diário, semanal, quinzenal ou mensal, você precisa escolher a Data Final!",
                icon: 'error',
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: { popup: 'custom-popup' },
                confirmButtonText: 'OK',
                heightAuto: false,
                willOpen: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').hide();
                        $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                        $('.swal2-backdrop-show').css('z-index', 9998);
                        Swal.getPopup().focus();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                    }
                },
                didClose: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').show();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                    }
                }
            });
            return false;
        }

        if (periodo === 'V') {
            const calendarObj = document.getElementById('calDatasSelecionadas').ej2_instances[0];
            const selectedDates = calendarObj.values;
            if (!selectedDates || selectedDates.length === 0) {
                await Swal.fire({
                    title: "⚠️ Atenção",
                    text: "Se o período foi escolhido como Dias Variados, você precisa escolher ao menos um dia no Calendário!",
                    icon: 'warning',
                    iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                    customClass: { popup: 'custom-popup' },
                    confirmButtonText: 'OK',
                    heightAuto: false,
                    willOpen: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').hide();
                            $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                            $('.swal2-backdrop-show').css('z-index', 9998);
                            Swal.getPopup().focus();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                        }
                    },
                    didClose: () => {
                        try {
                            $('.modal-backdrop').css('z-index', '1040').show();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                        }
                    }
                });
                return false;
            }
        }
        StatusViagem = "Aberta";

        const ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0];
        const ddtCombustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0];
        const dataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;
        const horaFinal = document.getElementById("txtHoraFinal").value;
        const kmInicial = document.getElementById("txtKmInicial").value;
        const kmFinal = document.getElementById("txtKmFinal").value;

        if (dataInicial && horaFinal && kmInicial && ddtCombustivelInicial.value !== "") {
            StatusViagem = "Realizada";
        }

        const dataFinal = $("#txtDataFinal").val();
        const combustivelFinal = ddtCombustivelFinal.value;

        const algumFinalPreenchido = dataFinal || horaFinal || combustivelFinal || kmFinal;
        const todosFinalPreenchidos = dataFinal && horaFinal && combustivelFinal && kmFinal;

        if (kmFinal && parseFloat(kmFinal) <= 0) {
            Alerta.Erro("⚠️ Informação Incorreta", "A Quilometragem Final deve ser maior que zero");
            return false;
        }

        if (algumFinalPreenchido && !todosFinalPreenchidos) {
            Alerta.Erro("⚠️ Informação Incompleta", "Todos os campos de Finalização devem ser preenchidos para encerrar a viagem");
            return false;
        }

        if (todosFinalPreenchidos) {
            const confirmacao = await Alerta.Confirmar(
                "Confirmar Fechamento",
                'Você está criando a viagem como "Realizada". Deseja continuar?',
                "Sim, criar!",
                "Cancelar"
            );
            if (!confirmacao) return false;
        }

        console.log("Terminei Validação!");
        return true;
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "ValidaCampos", error);
        return false;
    }
}


// ===================================================================
// 🧠 Função: delay
// 📌 Descrição: Função de espera para adicionar atraso entre as requisições;
// 📤 Chama: [#btnCancela, #btnApaga]
// 📥 Chamado por: [Nenhuma função detectada]
// ✅ Status: Ativa
// ===================================================================

function delay(ms) {
    try {
        return new Promise(resolve => {
            try {
                return setTimeout(resolve, ms);
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
            }
        });
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "delay", error);
    }
}

// ===================================================================
// 🧠 Função: criarAgendamento
// 📌 Descrição: Gerencia dados relacionados a agendamento
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: handleRecurrence, enviarAgendamentoComOpcao, executarEdicao
// ✅ Status: Ativa
// ===================================================================

function criarAgendamento(viagemId, viagemIdRecorrente, dataInicial) {
    try {
        // Editor de Texto para descrição
        const rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];
        const rteDescricaoHtmlContent = rteDescricao.getHtml(); // Captura o conteúdo em HTML

        // Componentes de seleção
        const lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
        const lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
        const ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];

        // Captura da data final da recorrência
        const dataFinalInput = document.getElementById("txtFinalRecorrencia").ej2_instances[0].value;
        const momentDate = moment(dataFinalInput);
        const DataFinalRecorrencia = momentDate.isValid() ? momentDate.format("YYYY-MM-DD") : null;

        // Dias da semana selecionados
        const lstDias = document.getElementById("lstDias").ej2_instances[0].value;
        const diasSemana = {
            Monday: lstDias.includes("Monday"),
            Tuesday: lstDias.includes("Tuesday"),
            Wednesday: lstDias.includes("Wednesday"),
            Thursday: lstDias.includes("Thursday"),
            Friday: lstDias.includes("Friday"),
            Saturday: lstDias.includes("Saturday"),
            Sunday: lstDias.includes("Sunday")
        };

        // Captura da data inicial (parâmetro convertido com segurança)
        const dataInicialFormatada = moment(dataInicial).isValid() ? moment(dataInicial).format("YYYY-MM-DD") : null;

        // Evento relacionado, se houver
        let eventoId = null;
        const eventoCombo = document.getElementById("lstEventos").ej2_instances[0];
        if (eventoCombo.value != null && eventoCombo.value.length > 0) {
            eventoId = eventoCombo.value[0];
        }

        // Construção do objeto de agendamento
        const agendamento = {
            ViagemId: viagemId || "00000000-0000-0000-0000-000000000000",
            DataInicial: dataInicialFormatada,
            HoraInicio: $('#txtHoraInicial').val(),
            Finalidade: document.getElementById("lstFinalidade").ej2_instances[0].value[0],
            Origem: document.getElementById("cmbOrigem").ej2_instances[0].value,
            Destino: document.getElementById("cmbDestino").ej2_instances[0].value,
            MotoristaId: lstMotorista.value || null,
            VeiculoId: lstVeiculo.value || null,
            KmAtual: parseInt($('#txtKmAtual').val(), 10) || null,
            RequisitanteId: document.getElementById("lstRequisitante").ej2_instances[0].value || null,
            RamalRequisitante: $('#txtRamalRequisitante').val(),
            SetorSolicitanteId: ddtSetor.value[0] || null,
            Descricao: rteDescricaoHtmlContent,
            StatusAgendamento: true,
            FoiAgendamento: true,
            Status: "Agendada",
            EventoId: eventoId,
            Recorrente: document.getElementById("lstRecorrente").ej2_instances[0].value,
            RecorrenciaViagemId: viagemIdRecorrente || "00000000-0000-0000-0000-000000000000",
            DatasSelecionadas: null,
            // pode ser preenchido conforme necessidade
            Intervalo: document.getElementById("lstPeriodos").ej2_instances[0].value,
            DataFinalRecorrencia: DataFinalRecorrencia,
            Monday: diasSemana.Monday,
            Tuesday: diasSemana.Tuesday,
            Wednesday: diasSemana.Wednesday,
            Thursday: diasSemana.Thursday,
            Friday: diasSemana.Friday,
            Saturday: diasSemana.Saturday,
            Sunday: diasSemana.Sunday,
            DiaMesRecorrencia: document.getElementById("lstDiasMes").ej2_instances[0].value
        };
        console.log("Agendamento criado:", agendamento);
        return agendamento;
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "criarAgendamento", error);
    }
}

// ===================================================================
// 🧠 Função: recuperarViagemEdicao
// 📌 Descrição: Recupera dados de uma fonte (ex: servidor ou cache)
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: editarAgendamentoRecorrente, editarAgendamentoRecorrente, editarAgendamento, editarAgendamento
// ✅ Status: Ativa
// ===================================================================

async function recuperarViagemEdicao(viagemId) {
    try {
        try {
            const response = await $.ajax({
                url: '/api/Agenda/ObterAgendamentoEdicao',
                type: "GET",
                data: {
                    viagemId: viagemId
                },
                dataType: "json" // Defina o tipo de dado esperado
            });
            console.log("Response: ", response);

            // Verifique se o tipo de resposta é um array ou objeto
            const objViagem = Array.isArray(response) ? response[0] : response;
            return objViagem;
        } catch (err) {
            TratamentoErroComLinha("agendamento_viagem<num>.js", "recuperarViagemEdicao", error);
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "recuperarViagemEdicao", error);
    }
}

// ===================================================================
// 🧠 Função: criarAgendamentoUnico
// 📌 Descrição: Gerencia dados relacionados a agendamento
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: [btnConfirma]
// ✅ Status: Ativa
// ===================================================================

function criarAgendamentoUnico() {
    try {
        // Editor de Texto para descrição;
        const rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];
        const rteDescricaoHtmlContent = rteDescricao.getHtml(); // Captura o conteúdo em HTML;

        // Verificar componentes para motorista, veículo e setor;
        const lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
        const lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
        const ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
        let motoristaId = document.getElementById("lstMotorista").ej2_instances[0].value;
        let veiculoId = document.getElementById("lstVeiculo").ej2_instances[0].value;
        let eventoId = "";
        if (document.getElementById("lstEventos").ej2_instances[0].value != null) {
            //let eventoId = document.getElementById("lstEventos").ej2_instances[0].value[0];
            let valor = document.getElementById("lstEventos").ej2_instances[0].value;
            console.log(valor);
            let flattened = valor.flat(); // Remove qualquer array aninhado
            console.log(flattened);
            eventoId = flattened.join(','); // Junta como string (se tiver mais de um UUID)
            console.log("EventoID:" & eventoId);
        } else {
            eventoId = null;
        }
        let setorId = document.getElementById("ddtSetor").ej2_instances[0].value[0];
        let ramal = $('#txtRamalRequisitante').val();
        let requisitanteId = document.getElementById("lstRequisitante").ej2_instances[0].value;
        let kmAtual = parseInt($('#txtKmAtual').val(), 10);
        let destino = document.getElementById("cmbDestino").ej2_instances[0].value;
        let origem = document.getElementById("cmbOrigem").ej2_instances[0].value;
        let finalidade = document.getElementById("lstFinalidade").ej2_instances[0].value[0];

        // Criação do objeto de agendamento;
        const agendamento = {
            DataInicial: dataInicial,
            HoraInicio: $('#txtHoraInicial').val(),
            Finalidade: finalidade,
            Origem: origem,
            Destino: destino,
            MotoristaId: motoristaId,
            VeiculoId: veiculoId,
            KmAtual: kmAtual,
            RequisitanteId: requisitanteId,
            RamalRequisitante: ramal,
            SetorSolicitanteId: setorId,
            Descricao: rteDescricaoHtmlContent,
            StatusAgendamento: true,
            FoiAgendamento: true,
            Status: "Agendada",
            EventoId: eventoId,
            Recorrente: "N"
        };
        console.log("Agendamento criado:", agendamento);
        return agendamento;
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "criarAgendamentoUnico", error);
    }
}

// ===================================================================
// 🧠 Função: criarAgendamentoEdicao
// 📌 Descrição: Gerencia dados relacionados a agendamento
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: editarAgendamentoRecorrente, editarAgendamentoRecorrente, editarAgendamentoRecorrente, editarAgendamentoRecorrente, editarAgendamento, editarAgendamento
// ✅ Status: Ativa
// ===================================================================

function criarAgendamentoEdicao(agendamentoUnicoAlterado) {
    try {
        // Editor de Texto para descrição
        const rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];
        const rteDescricaoHtmlContent = rteDescricao.getHtml();

        // Componentes de seleção
        const lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
        const lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
        const ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
        const motoristaId = lstMotorista.value;
        const veiculoId = lstVeiculo.value;
        const setorId = ddtSetor.value[0];
        const requisitanteId = document.getElementById("lstRequisitante").ej2_instances[0].value;
        const kmAtual = parseInt($('#txtKmAtual').val(), 10);
        const kmInicial = parseInt($('#txtKmInicial').val(), 10);
        const kmFinal = parseInt($('#txtKmFinal').val(), 10);
        const destino = document.getElementById("cmbDestino").ej2_instances[0].value;
        const origem = document.getElementById("cmbOrigem").ej2_instances[0].value;
        const horaInicio = $('#txtHoraInicial').val();
        const finalidade = document.getElementById("lstFinalidade").ej2_instances[0].value[0];

        const noFichaVistoria = $('#txtNoFichaVistoria').val();
        const combustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0].value[0];
        const combustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0].value[0];

        // Evento (se existir)
        let eventoId = null;
        const eventosInst = document.getElementById("lstEventos").ej2_instances[0].value;
        if (eventosInst && eventosInst.length) {
            eventoId = eventosInst[0];
        }

        // ✅ Correção definitiva da DataInicial
        let dataInicialFormatada;
        const dataCampo = document.getElementById("txtDataInicial").ej2_instances[0].value;
        if (dataCampo && moment(dataCampo).isValid()) {
            // Se o usuário alterou a data no formulário, essa será usada
            dataInicialFormatada = moment(dataCampo).format("YYYY-MM-DD");
        } else if (agendamentoUnicoAlterado.dataInicial && moment(agendamentoUnicoAlterado.dataInicial).isValid()) {
            // Fallback: usa a data original vinda do objeto
            dataInicialFormatada = moment(agendamentoUnicoAlterado.dataInicial).format("YYYY-MM-DD");
        } else {
            // Valor nulo se nada for válido
            dataInicialFormatada = null;
        }

        const ddtCombustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0];
        const dataFinal = document.getElementById("txtDataFinal").ej2_instances[0].value;
        const horaFinal = document.getElementById("txtHoraFinal").value;

        // ✅ Correção definitiva da DataFinal
        let dataFinalFormatada;
        const dataFinalCampo = document.getElementById("txtDataFinal").ej2_instances[0].value;
        if (dataFinalCampo && moment(dataFinalCampo).isValid()) {
            // Se o usuário alterou a data no formulário, essa será usada
            dataFinalFormatada = moment(dataFinalCampo).format("YYYY-MM-DD");
        } else if (agendamentoUnicoAlterado.dataFinal && moment(agendamentoUnicoAlterado.dataFinal).isValid()) {
            // Fallback: usa a data original vinda do objeto
            dataFinalFormatada = moment(agendamentoUnicoAlterado.dataFinal).format("YYYY-MM-DD");
        } else {
            // Valor nulo se nada for válido
            dataFinalFormatada = null;
        }

        if (dataFinal && horaFinal && kmInicial && ddtCombustivelInicial.value !== "") {
            agendamentoUnicoAlterado.status = "Realizada";
        }

        let statusAgendamento = true;

        if (agendamentoUnicoAlterado.status === "Aberta" || agendamentoUnicoAlterado.status === "Realizada") {
            statusAgendamento = false;
        }
        else {
            statusAgendamento = true;
        }

        let foiAgendamento = true;

        if (agendamentoUnicoAlterado.foiAgendamento) {
            foiAgendamento = true;
        }
        else {
            foiAgendamento = false;
        }

        // Construção completa do objeto
        const agendamento = {
            ViagemId: agendamentoUnicoAlterado.viagemId,
            NoFichaVistoria: noFichaVistoria,
            DataInicial: dataInicialFormatada,
            HoraInicio: horaInicio,
            DataFinal: dataFinalFormatada,
            HoraFim: horaFinal,
            Finalidade: finalidade,
            Origem: origem,
            Destino: destino,
            MotoristaId: motoristaId,
            VeiculoId: veiculoId,
            CombustivelInicial: combustivelInicial,
            CombustivelFinal: combustivelFinal,
            KmAtual: kmAtual,
            KmInicial: kmInicial,
            KmFinal: kmFinal,
            RequisitanteId: requisitanteId,
            RamalRequisitante: $('#txtRamalRequisitante').val(),
            SetorSolicitanteId: setorId,
            Descricao: rteDescricaoHtmlContent,
            StatusAgendamento: statusAgendamento,
            FoiAgendamento: foiAgendamento,
            Status: agendamentoUnicoAlterado.status,
            EventoId: eventoId,
            Recorrente: agendamentoUnicoAlterado.recorrente,
            RecorrenciaViagemId: agendamentoUnicoAlterado.recorrenciaViagemId,
            DatasSelecionadas: agendamentoUnicoAlterado.datasSelecionadas,
            Intervalo: agendamentoUnicoAlterado.intervalo,
            DataFinalRecorrencia: agendamentoUnicoAlterado.dataFinalRecorrencia,
            Monday: agendamentoUnicoAlterado.monday,
            Tuesday: agendamentoUnicoAlterado.tuesday,
            Wednesday: agendamentoUnicoAlterado.wednesday,
            Thursday: agendamentoUnicoAlterado.thursday,
            Friday: agendamentoUnicoAlterado.friday,
            Saturday: agendamentoUnicoAlterado.saturday,
            Sunday: agendamentoUnicoAlterado.sunday,
            DiaMesRecorrencia: agendamentoUnicoAlterado.diaMesRecorrencia
        };
        console.log("Agendamento criado (edição):", agendamento);
        return agendamento;
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "criarAgendamentoEdicao", error);
    }
}

// ===================================================================
// 🧠 Função: criarAgendamentoViagem
// 📌 Descrição: Gerencia dados relacionados a agendamento
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: [Nenhuma função detectada]
// ⛔ Status: ✅ Status: Ativa
// ===================================================================
function criarAgendamentoViagem(agendamentoUnicoAlterado) {
    try {
        //objViagemId =
        // Editor de Texto para descrição;
        const rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];
        const rteDescricaoHtmlContent = rteDescricao.getHtml(); // Captura o conteúdo em HTML;


        // Verificar componentes para motorista, veículo e setor;
        const lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
        const lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
        const ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
        let motoristaId = document.getElementById("lstMotorista").ej2_instances[0].value;
        let veiculoId = document.getElementById("lstVeiculo").ej2_instances[0].value;
        let eventoId = "";
        if (document.getElementById("lstEventos").ej2_instances[0].value != null) {
            eventoId = document.getElementById("lstEventos").ej2_instances[0].value[0];
        } else {
            eventoId = null;
        }
        let setorId = document.getElementById("ddtSetor").ej2_instances[0].value[0];
        let ramal = $('#txtRamalRequisitante').val();
        let requisitanteId = document.getElementById("lstRequisitante").ej2_instances[0].value;
        let kmAtual = parseInt($('#txtKmAtual').val(), 10);
        let kmInicial = parseInt($('#txtKmInicial').val(), 10);
        let kmFinal = parseInt($('#txtKmFinal').val(), 10);
        let destino = document.getElementById("cmbDestino").ej2_instances[0].value;
        let origem = document.getElementById("cmbOrigem").ej2_instances[0].value;
        let finalidade = document.getElementById("lstFinalidade").ej2_instances[0].value[0];
        let combustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0].value[0];
        let combustivelFinal = "";
        if (document.getElementById("ddtCombustivelFinal").ej2_instances[0].value[0] === null || document.getElementById("ddtCombustivelFinal").ej2_instances[0].value[0] === undefined) {
            combustivelFinal = null;
        } else {
            combustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0].value[0];
        }
        let dataFinal = "";
        if (document.getElementById("txtDataFinal").ej2_instances[0].value === null || document.getElementById("txtDataFinal").ej2_instances[0].value === undefined) {
            dataFinal = null;
        } else {
            dataFinal = moment(document.getElementById("txtDataFinal").ej2_instances[0].value).format('YYYY-MM-DD');
        }
        let horaInicio = $('#txtHoraInicial').val();
        let horaFim = "";
        if (document.getElementById("txtHoraFinal").value === null || document.getElementById("txtHoraFinal").value === undefined || document.getElementById("txtHoraFinal").value === '') {
            horaFim = null;
        } else {
            horaFim = document.getElementById("txtHoraFinal").value;
        }
        let statusAgendamento = document.getElementById("txtStatusAgendamento").value;
        let criarViagemFechada = true;
        let noFichaVistoria = document.getElementById("txtNoFichaVistoria").value;
        if (dataFinal && horaFim && combustivelFinal && kmFinal) {
            status = "Realizada";
            if (statusAgendamento) {
                criarViagemFechada = true;
            }
            else {
                criarViagemFechada = false;
            }
        } else {
            status = "Aberta";
        }

        // Criação do objeto de agendamento;
        const agendamento = {
            ViagemId: viagemId,
            NoFichaVistoria: noFichaVistoria,
            DataInicial: dataInicial,
            HoraInicio: horaInicio,
            DataFinal: dataFinal,
            HoraFim: horaFim,
            Finalidade: finalidade,
            Origem: origem,
            Destino: destino,
            MotoristaId: motoristaId,
            VeiculoId: veiculoId,
            KmAtual: kmAtual,
            KmInicial: kmInicial,
            KmFinal: kmFinal,
            CombustivelInicial: combustivelInicial,
            CombustivelFinal: combustivelFinal,
            RequisitanteId: requisitanteId,
            RamalRequisitante: ramal,
            SetorSolicitanteId: setorId,
            Descricao: rteDescricaoHtmlContent,
            StatusAgendamento: false,
            FoiAgendamento: true,
            Status: status,
            EventoId: eventoId,
            Recorrente: agendamentoUnicoAlterado.recorrente,
            RecorrenciaViagemId: agendamentoUnicoAlterado.recorrenciaViagemId,
            DatasSelecionadas: agendamentoUnicoAlterado.datasSelecionadas,
            Intervalo: agendamentoUnicoAlterado.intervalo,
            DataFinalRecorrencia: agendamentoUnicoAlterado.dataFinalRecorrencia,
            Monday: agendamentoUnicoAlterado.monday,
            Tuesday: agendamentoUnicoAlterado.tuesday,
            Wednesday: agendamentoUnicoAlterado.wednesday,
            Thursday: agendamentoUnicoAlterado.thursday,
            Friday: agendamentoUnicoAlterado.friday,
            Saturday: agendamentoUnicoAlterado.saturday,
            Sunday: agendamentoUnicoAlterado.sunday,
            DiaMesRecorrencia: agendamentoUnicoAlterado.diaMesRecorrencia,
            CriarViagemFechada: criarViagemFechada
        };
        console.log("Agendamento criado:", agendamento);
        return agendamento;
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'criarAgendamentoViagem', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "criarAgendamentoViagem", error);
    }
}


$(document).ready(function () {
    try {
        // Ajustar altura dos controles Syncfusion;
        document.getElementById('lstRecorrente').ej2_instances[0].setProperties({
            height: '200px'
        });
        document.getElementById('lstPeriodos').ej2_instances[0].setProperties({
            height: '200px'
        });
        document.getElementById('lstDias').ej2_instances[0].setProperties({
            height: '200px'
        });
        document.getElementById('txtFinalRecorrencia').ej2_instances[0].setProperties({
            height: '200px'
        });

        // Esconde os controles da Recorrência;
        //document.getElementById("divPeriodo").style.display = "none";
        document.getElementById("divDias").style.display = "none";
        document.getElementById("divFinalRecorrencia").style.display = "none";
        document.getElementById("divFinalFalsoRecorrencia").style.display = "none";

        //Esconde a parte do relatório para novos agendamentos
        document.getElementById("ReportContainer").classList.remove("d-flex");
        document.getElementById("ReportContainer").style.display = "none";
        $("#txtFinalRecorrencia").val('');
        var calendarContainer = document.getElementById("calendarContainer");
        calendarContainer.style.display = "none";
        var listboxContainer = document.getElementById("listboxContainer");
        listboxContainer.style.display = "none";

        // Botão para fechar a modal de Viagens;
        $('#btnFecha').on('click', function () {
            try {
                $('#modalViagens').hide();
                $("div").removeClass("modal-backdrop");
                $('body').removeClass('modal-open');
                $("body").css("overflow", "auto");
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
            }
        });

        // Botão para fechar a Ficha de impressão;
        $('#btnFecharFicha').on('click', function () {
            try {
                $('#modalPrint').hide();
                $("div").removeClass("modal-backdrop");
                $('body').removeClass('modal-open');
                $("body").css("overflow", "auto");
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
            }
        });

        // Desabilita o botão de evento;
        var lstEvento = document.getElementById("lstEventos").ej2_instances[0];
        lstEvento.enabled = false;
        document.getElementById("btnEvento").style.display = "none";

        // Inicializa o calendário;
        InitializeCalendar("api/Agenda/CarregaViagens");
        PreencheListaSetores();

        // Configura a Exibição do Modal de Requisitantes;
        $("#modalRequisitante").modal({
            keyboard: true,
            backdrop: "static",
            show: false
        }).on("hide.bs.modal", function () {
            try {
                var setores = document.getElementById('ddtSetorRequisitante').ej2_instances[0];
                setores.value = "";
                $("#txtPonto").val('');
                $("#txtNome").val('');
                $("#txtRamal").val('');
                $("#txtEmail").val('');
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
            }
        });

        // Configura a Exibição do Modal de Setores;
        $("#modalSetor").modal({
            keyboard: true,
            backdrop: "static",
            show: false
        }).on("hide.bs.modal", function () {
            try {
                //var setores = document.getElementById('ddtSetorPai').ej2_instances[0];
                //setores.value = "";
                $("#txtSigla").val('');
                $("#txtNomeSetor").val('');
                $("#txtRamalSetor").val('');
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
            }
        });
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

// ===================================================================
// 🧠 Função: ExibeViagem
// 📌 Descrição: Função utilitária
// 📤 Chama: calcularDistanciaViagem, obterEDefinirDatasCalendario
// 📥 Chamado por: InitializeCalendar
// ✅ Status: Ativa
// ===================================================================

function ExibeViagem(viagem) {
    try {
        // Habilita e Limpa Controles;
        StatusViagem = "Aberta";
        var childNodes = document.getElementById("divModal").getElementsByTagName('*');
        for (var node of childNodes) {
            if (node.id !== "divBotoes") {
                node.disabled = false;
                node.value = "";
            }
        }

        // - Definir o texto da label de Agendamento;
        if (viagem.statusAgendamento || viagem.foiAgendamento) {
            if (viagem.usuarioIdAgendamento != null) {
                document.getElementById("lblUsuarioAgendamento").style.display = "block";
                const DataAgendamento = moment(viagem.dataAgendamento).format("DD/MM/YYYY");
                const HoraAgendamento = moment(viagem.dataAgendamento).format("HH:mm");
                $.ajax({
                    url: '/api/Agenda/RecuperaUsuario',
                    type: "Get",
                    data: {
                        id: viagem.usuarioIdAgendamento
                    },
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        try {
                            let usuarioAgendamento;
                            $.each(data, function (key, val) {
                                try {
                                    usuarioAgendamento = val;
                                } catch (error) {
                                    TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
                                }
                            });
                            document.getElementById("lblUsuarioAgendamento").innerHTML = '<i class="fa-duotone fa-solid fa-user-clock"></i> <span>Agendado por:</span> ' + usuarioAgendamento + " em " + DataAgendamento + " às " + HoraAgendamento;
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                        }
                    },
                    error: function (err) {
                        try {
                            console.log(err);
                            alert('something went wrong');
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "error", error);
                        }
                    }
                });
            } else {
                document.getElementById("lblUsuarioAgendamento").innerHTML = "";
            }
        } else {
            document.getElementById("lblUsuarioAgendamento").innerHTML = "";
        }

        // - Definir o texto da label de Criação;
        if (viagem.statusAgendamento === false) {
            const DataCriacao = moment(viagem.dataCriacao).format("DD/MM/YYYY");
            const HoraCriacao = moment(viagem.dataCriacao).format("HH:mm");
            $.ajax({
                url: '/api/Agenda/RecuperaUsuario',
                type: "Get",
                data: {
                    id: viagem.usuarioIdCriacao
                },
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    try {
                        let usuarioCriacao;
                        $.each(data, function (key, val) {
                            try {
                                usuarioCriacao = val;
                            } catch (error) {
                                TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
                            }
                        });
                        document.getElementById("lblUsuarioCriacao").innerHTML = '<i class="fa-sharp-duotone fa-solid fa-user-plus"></i> <span>Criado/Alterado por:</span> ' + usuarioCriacao + " em " + DataCriacao + " às " + HoraCriacao;
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                    }
                },
                error: function (err) {
                    try {
                        console.log(err);
                        alert('something went wrong');
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "error", error);
                    }
                }
            });
        } else {
            document.getElementById("lblUsuarioCriacao").innerHTML = "";
        }

        // - Definir o texto da label de Finalização;
        if (viagem.horaFim != null)
        {
            const DataFinalizacao = moment(viagem.dataFinalizacao).format("DD/MM/YYYY");
            const HoraFinalizacao = moment(viagem.dataFinalizacao).format("HH:mm");
            $.ajax({
                url: '/api/Agenda/RecuperaUsuario',
                type: "Get",
                data: {
                    id: viagem.usuarioIdFinalizacao
                },
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data)
                {
                    try
                    {
                        let usuarioFinalizacao;
                        $.each(data, function (key, val)
                        {
                            try
                            {
                                usuarioFinalizacao = val;
                            } catch (error)
                            {
                                TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
                            }
                        });
                        document.getElementById("lblUsuarioFinalizacao").innerHTML = '<i class="fa-duotone fa-solid fa-user-check"></i> <span>Finalizado por:</span> ' + usuarioFinalizacao + " em " + DataFinalizacao + " às " + HoraFinalizacao;
                    } catch (error)
                    {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                    }
                },
                error: function (err)
                {
                    try
                    {
                        console.log(err);
                        alert('something went wrong');
                    } catch (error)
                    {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "error", error);
                    }
                }
            });
        } else
        {
            document.getElementById("lblUsuarioFinalizacao").innerHTML = "";
        }

        // - Definir o texto da label de Cancelamento;
        if (viagem.usuarioIdCancelamento != null)
        {
            const DataCancelamento = moment(viagem.dataCancelamento).format("DD/MM/YYYY");
            $.ajax({
                url: '/api/Agenda/RecuperaUsuario',
                type: "Get",
                data: {
                    id: viagem.usuarioIdCancelamento
                },
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data)
                {
                    try
                    {
                        let usuarioCancelamento;
                        $.each(data, function (key, val)
                        {
                            try
                            {
                                usuarioCancelamento = val;
                            } catch (error)
                            {
                                TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
                            }
                        });
                        document.getElementById("lblUsuarioCancelamento").innerHTML = '<i class="fa-duotone fa-regular fa-trash-can-xmark"></i> <span>Cancelado por:</span> ' + usuarioCancelamento + " em " + DataCancelamento;
                    } catch (error)
                    {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                    }
                },
                error: function (err)
                {
                    try
                    {
                        console.log(err);
                        alert('something went wrong');
                    } catch (error)
                    {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "error", error);
                    }
                }
            });
        } else
        {
            document.getElementById("lblUsuarioCancelamento").innerHTML = "";
        }

        //$('#txtDataInicial').attr('type', 'date');
        //$('#txtDataFinal').attr('type', 'date');
        $('#txtHoraInicial').attr('type', 'time');
        $('#txtHoraFinal').attr('type', 'time');
        document.getElementById("divNoFichaVistoria").style.display = 'none';
        document.getElementById("divDataFinal").style.display = 'none';
        document.getElementById("divHoraFinal").style.display = 'none';
        document.getElementById("divDuracao").style.display = 'none';
        document.getElementById("divKmAtual").style.display = 'none';
        document.getElementById("divKmInicial").style.display = 'none';
        document.getElementById("divKmFinal").style.display = 'none';
        document.getElementById("divQuilometragem").style.display = 'none';
        var rte = document.getElementById("rteDescricao").ej2_instances[0];
        rte.enabled = true;
        rte.value = "";
        var lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
        lstMotorista.enabled = true;
        lstMotorista.value = "";
        var lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
        lstVeiculo.enabled = true;
        lstVeiculo.value = "";
        var lstRequisitante = document.getElementById("lstRequisitante").ej2_instances[0];
        lstRequisitante.enabled = true;
        lstRequisitante.value = "";
        var ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
        ddtSetor.enabled = true;
        ddtSetor.value = "";
        var ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0];
        ddtCombustivelInicial.value = "";
        document.getElementById("divCombustivelInicial").style.display = 'none';
        var ddtCombustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0];
        ddtCombustivelFinal.value = "";
        document.getElementById("divCombustivelFinal").style.display = 'none';
        //$("#btnViagem").show();
        $("#btnImprime").show();
        $("#btnConfirma").show();
        $("#btnApaga").show();
        $("#btnCancela").show();

        //document.getElementById("lblUsuarioCriacao").innerHTML = "";

        var lstEvento = document.getElementById("lstEventos").ej2_instances[0];
        lstEvento.enabled = false;
        document.getElementById("btnEvento").style.display = "none";

        //Limpa Controles Recorrência;
        document.getElementById("lstRecorrente").ej2_instances[0].value = "";
        document.getElementById("lstPeriodos").ej2_instances[0].value = "";
        document.getElementById("lstDias").ej2_instances[0].value = "";
        document.getElementById('txtFinalRecorrencia').value = null;
        document.getElementById('calDatasSelecionadas').ej2_instances[0].value = null;
        var listBox = document.getElementById("lstDiasCalendario").ej2_instances[0];
        listBox.dataSource = [];
        document.getElementById("itensBadge").textContent = 0;
        const btnRequisitante = document.getElementById("btnRequisitante");
        // Remove a classe "disabled" que desativa o link
        btnRequisitante.classList.remove('disabled');
        // Reativa o comportamento do clique (se for necessário, remova o evento preventivo adicionado antes)
        btnRequisitante.addEventListener('click', function (event) {
            try {
                // Aqui você adiciona o comportamento desejado ao clique, ou simplesmente restaura o padrão
                console.log('Link clicado!'); // Exemplo de ação
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
            }
        });

        //const btnAbrirNovoSetor = document.getElementById("btnAbrirNovoSetor");
        //// Remove a classe "disabled" que desativa o link
        //btnAbrirNovoSetor.classList.remove('disabled');
        //// Reativa o comportamento do clique (se for necessário, remova o evento preventivo adicionado antes)
        //btnAbrirNovoSetor.addEventListener('click', function (event) {
        //    // Aqui você adiciona o comportamento desejado ao clique, ou simplesmente restaura o padrão
        //    console.log('Link clicado!'); // Exemplo de ação
        //});

        if (viagem === "") {
            // Cria Agendamento;
            document.getElementById("Titulo").innerHTML = "<h3 class='modal-title'><i class='fad fa-calendar-alt' aria-hidden='true'></i> Criar Agendamento</h3>";
            console.log("Criar Agendamento");
            $("#btnViagem").hide();
            $("#btnImprime").hide();
            $("#btnApaga").hide();
            $("#btnCancela").hide();
            $("#btnConfirma").html("<i class='fa fa-save' aria-hidden='true'></i>Cria Agendamento");
        } else {
            // Carregar viagem existente e preencher os campos;
            console.log("Status Agendamento: " + viagem.statusAgendamento);
            document.getElementById("ReportContainer").classList.add("d-flex");
            document.getElementById("ReportContainer").style.display = "block";
            $("#txtViagemId").val(viagem.viagemId);
            $("#txtRecorrenciaViagemId").val(viagem.recorrenciaViagemId);
            $("#txtStatusAgendamento").val(viagem.statusAgendamento);
            $("#txtUsuarioIdCriacao").val(viagem.usuarioIdCriacao);
            $("#txtDataCriacao").val(viagem.dataCriacao);

            $("#txtNoFichaVistoria").val(viagem.noFichaVistoria);

            var datePicker = document.getElementById("txtDataInicial").ej2_instances[0];
            datePicker.value = moment(viagem.dataInicial).toDate(); // Ou use o método correto para definir o valor;
            datePicker.dataBind(); // Atualiza a interface;

            $('#txtHoraInicial').removeAttr("type");
            document.getElementById("txtHoraInicial").value = viagem.horaInicio.substring(11, 16);
            $('#txtHoraInicial').attr('type', 'time');
            document.getElementById("lstFinalidade").ej2_instances[0].value = [viagem.finalidade];
            document.getElementById("lstFinalidade").ej2_instances[0].text = viagem.finalidade;
            /*$("#cmbOrigem").val(viagem.origem);*/
            document.getElementById("cmbOrigem").ej2_instances[0].value = viagem.origem;
            document.getElementById("cmbDestino").ej2_instances[0].value = viagem.destino;
            if (viagem.eventoId != null) {
                lstEvento.enabled = true;
                lstEvento.value = [viagem.eventoId];
                document.getElementById("btnEvento").style.display = "block";
            }
            if (viagem.motoristaId != null) {
                lstMotorista.value = viagem.motoristaId;
            }
            if (viagem.veiculoId != null) {
                lstVeiculo.value = viagem.veiculoId;
            }
            if (viagem.kmAtual != null) {
                document.getElementById("txtKmAtual").value = viagem.kmAtual;
            }
            if (viagem.kmInicial != null) {
                document.getElementById("txtKmInicial").value = viagem.kmInicial;
            }
            if (viagem.kmFinal != null && viagem.kmFinal != 0) {
                document.getElementById("txtKmFinal").value = viagem.kmFinal;
            }
            if (viagem.requisitanteId != null) {
                lstRequisitante.value = viagem.requisitanteId;
            }
            if (viagem.ramalRequisitante != null) {
                document.getElementById("txtRamalRequisitante").value = viagem.ramalRequisitante;
            }

            calcularDistanciaViagem();
            if (viagem.combustivelInicial != null && viagem.combustivelInicial !== '') {
                ddtCombustivelInicial.value = [viagem.combustivelInicial];
            }
            if (viagem.combustivelFinal != null && viagem.combustivelFinal !== '') {
                ddtCombustivelFinal.value = [viagem.combustivelFinal];
            }


            //if ([viagem.setorSolicitanteId] != null) {
            //    ddtSetor.value = [viagem.setorSolicitanteId];
            //}

            //lstMotorista.value = viagem.motoristaId;
            //lstVeiculo.value = viagem.veiculoId;
            //document.getElementById("txtKmAtual").value = viagem.kmAtual;
            //lstRequisitante.value = viagem.requisitanteId;
            //document.getElementById("txtRamalRequisitante").value = viagem.ramalRequisitante;
            //ddtSetor.value = [viagem.setorSolicitanteId];

            //rte.value = viagem.descricao;

            document.getElementById("txtPeriodos").display = "none";

            //Recorrência;
            document.getElementById("lstRecorrente").ej2_instances[0].enabled = false;
            document.getElementById("lstRecorrente").ej2_instances[0].value = viagem.recorrente;
            if (viagem.recorrente === 'S') {
                if (viagem.intervalo === "D") {
                    document.getElementById("txtPeriodos").value = "Diário";
                }
                else if (viagem.intervalo === "S") {
                    document.getElementById("txtPeriodos").value = "Semanal";
                }
                else if (viagem.intervalo === "Q") {
                    document.getElementById("txtPeriodos").value = "Quinzenal";
                }
                else if (viagem.intervalo === "M") {
                    document.getElementById("txtPeriodos").value = "Mensal";
                }
                else if (viagem.intervalo === "V") {
                    document.getElementById("txtPeriodos").value = "Dias Variados";
                }

                document.getElementById("divPeriodo").style.display = "none";
                document.getElementById("divTxtPeriodo").style.display = "block";
                document.getElementById("txtPeriodos").disabled = true;
            }
            else {
                document.getElementById("divPeriodo").style.display = "none";
            }
            if (viagem.intervalo === 'S' || viagem.intervalo === 'Q') {
                //Exibe a DIV com o controle lstDias;
                document.getElementById("divDias").style.display = "block";

                // Array que irá conter os dias a serem selecionados;
                const diasSelecionados = [];

                // Adiciona os dias à lista com base nos valores booleanos;
                if (viagem.monday) diasSelecionados.push("Monday");
                if (viagem.tuesday) diasSelecionados.push("Tuesday");
                if (viagem.wednesday) diasSelecionados.push("Wednesday");
                if (viagem.thursday) diasSelecionados.push("Thursday");
                if (viagem.friday) diasSelecionados.push("Friday");
                if (viagem.saturday) diasSelecionados.push("Saturday");
                if (viagem.sunday) diasSelecionados.push("Sunday");
                var multiSelect = document.querySelector('#lstDias').ej2_instances[0];

                // Filtra o dataSource para conter apenas os dias selecionados;
                multiSelect.dataSource = multiSelect.dataSource.filter(item => {
                    try {
                        return diasSelecionados.includes(item.id);
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                    }
                });
                multiSelect.dataBind(); // Aplica a nova lista de opções;

                // Define os valores selecionados no MultiSelect;
                multiSelect.value = diasSelecionados;
                multiSelect.dataBind(); // Aplica a seleção inicial;

                // Atualiza o texto exibido para o nome correspondente;
                const selectedTexts = diasSelecionados.map(val => {
                    try {
                        const item = multiSelect.dataSource.find(dsItem => {
                            try {
                                return dsItem.id === val;
                            } catch (error) {
                                TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                            }
                        });
                        return item ? item.name : val;
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                    }
                });
                multiSelect.inputElement.value = selectedTexts.join(', ');

                // Desabilita o MultiSelect completamente (impede edição)
                multiSelect.readonly = true;
                multiSelect.enabled = false;
            } else {
                document.getElementById("divDias").style.display = "none";
            }
            if (viagem.intervalo === 'M') {
                document.getElementById("divDiaMes").style.display = "block";
                document.getElementById("lstDiasMes").ej2_instances[0].enabled = false;
                document.getElementById("lstDiasMes").ej2_instances[0].value = viagem.diaMesRecorrencia;
                document.getElementById("lstDiasMes").ej2_instances[0].text = viagem.diaMesRecorrencia;
            } else {
                document.getElementById("divDiaMes").style.display = "none";
                document.getElementById("lstDiasMes").ej2_instances[0].value = "";
            }
            if (viagem.intervalo === 'D' || viagem.intervalo === 'S' || viagem.intervalo === 'Q' || viagem.intervalo === 'M') {
                document.getElementById("txtDataFinalRecorrencia").disabled = true;
                document.getElementById("txtDataFinalRecorrencia").value = moment(viagem.dataFinalRecorrencia).format('DD/MM/YYYY');
                document.getElementById("divFinalRecorrencia").style.display = "none";
                document.getElementById("divFinalFalsoRecorrencia").style.display = "block";
            } else {
                document.getElementById("divFinalRecorrencia").style.display = "none";
                document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
            }
            if (viagem.intervalo === 'V') {
                var calendarContainer = document.getElementById("calendarContainer");
                calendarContainer.style.display = "none";
                var listboxContainer = document.getElementById("listboxContainer");
                listboxContainer.style.display = "none";
                var listboxContainerHTML = document.getElementById("listboxContainerHTML");
                listboxContainerHTML.style.display = "block";

                // Garantir que a função está sendo chamada corretamente;
                obterEDefinirDatasCalendario(viagem.viagemId, viagem.viagemIdRecorrente);
            }
            document.getElementById("rteDescricao").ej2_instances[0].value = viagem.descricao;

            // Configuração do botão e exibição da ficha;
            if (viagem.statusAgendamento === true) {
                document.getElementById("Titulo").innerHTML = "<h3 class='modal-title'><i class='fad fa-calendar-alt' aria-hidden='true'></i> Editar Agendamento</h3>";
                $("#btnConfirma").html("<i class='fa fa-save' aria-hidden='true'></i>Edita Agendamento");
                $("#btnViagem").show();
                $("#btnImprime").show();
                $("#btnConfirma").show();
                $("#btnApaga").show();
                $("#btnCancela").show();
                if (viagem.status === "Cancelada") {
                    document.getElementById("Titulo").innerHTML = "<h3 class='modal-title'><i class='fad fa-calendar-alt' aria-hidden='true'></i> Agendamento Cancelado</h3>";
                    $("#btnViagem").hide();
                    $("#btnImprime").hide();
                    $("#btnConfirma").hide();
                    $("#btnApaga").hide();
                    $("#btnCancela").hide();
                }
            } 
            else 
            {
                // Exibe detalhes da viagem;
                document.getElementById("Titulo").innerHTML = "<h3 class='modal-title'><i class='fa-duotone fa-solid fa-suitcase-rolling' aria-hidden='true'></i> Exibindo Viagem (Aberta) </h3>";
                document.getElementById("divNoFichaVistoria").style.display = 'block';
                document.getElementById("divDataFinal").style.display = 'block';
                document.getElementById("divHoraFinal").style.display = 'block';
                document.getElementById("divDuracao").style.display = 'block';
                document.getElementById("divKmAtual").style.display = 'block';
                document.getElementById("divKmInicial").style.display = 'block';
                document.getElementById("divKmFinal").style.display = 'block';
                document.getElementById("divQuilometragem").style.display = 'block';
                document.getElementById("txtNoFichaVistoria").value = viagem.noFichaVistoria;
                document.getElementById("divCombustivelInicial").style.display = 'block';
                document.getElementById("divCombustivelFinal").style.display = 'block';

                if (viagem.status === "Realizada" || viagem.status === "Cancelada")  {
                    $("#btnViagem").hide();
                    if (viagem.status === "Realizada" )
                    {
                        document.getElementById("Titulo").innerHTML =
                            "<h3 class='modal-title'>" +
                            "<i class='fa-duotone fa-solid fa-suitcase-rolling' aria-hidden='true'></i> " +
                            "Exibindo Viagem (Realizada - " +
                            "<span class='text-danger fw-bold fst-italic'>Edição Não Permitida</span>" +
                            ") " +
                            "</h3>";
                    }
                    else
                    {
                        document.getElementById("Titulo").innerHTML =
                            "<h3 class='modal-title'>" +
                            "<i class='fa-duotone fa-solid fa-suitcase-rolling' aria-hidden='true'></i> " +
                            "Exibindo Viagem (Cancelada - " +
                            "<span class='text-danger fw-bold fst-italic'>Edição Não Permitida</span>" +
                            ") " +
                            "</h3>";
                    }
                    var childNodes = document.getElementById("divModal").getElementsByTagName('*');
                    for (var node of childNodes) {
                        node.disabled = true;
                    }
                    $("#btnViagem").hide();
                    $("#btnImprime").hide();
                    $("#btnConfirma").hide();
                    $("#btnApaga").hide();
                    $("#btnCancela").show();
                    $("#btnCancela").prop('disabled', false);
                    ;
                    $("#btnFecha").prop('disabled', false);
                    ;
                    var rte = document.getElementById("rteDescricao").ej2_instances[0];
                    rte.enabled = false;
                    var datePicker = document.getElementById("txtDataFinal").ej2_instances[0];
                    datePicker.value = moment(viagem.dataInicial).toDate(); // Ou use o método correto para definir o valor;
                    datePicker.dataBind(); // Atualiza a interface;

                    $('#txtHoraFinal').removeAttr("type");
                    document.getElementById("txtHoraFinal").value = viagem.horaFim.substring(11, 16);
                    $('#txtHoraFinal').attr('type', 'time');
                    document.getElementById("txtDataInicial").ej2_instances[0].enabled = false;
                    document.getElementById("txtDataFinal").ej2_instances[0].enabled = false;
                    document.getElementById("lstFinalidade").ej2_instances[0].enabled = false;
                    document.getElementById("lstFinalidade").ej2_instances[0].enabled = false;
                    document.getElementById("lstMotorista").ej2_instances[0].enabled = false;
                    document.getElementById("lstVeiculo").ej2_instances[0].enabled = false;
                    document.getElementById("lstRequisitante").ej2_instances[0].enabled = false;
                    document.getElementById("ddtSetor").ej2_instances[0].enabled = false;
                    document.getElementById("divCombustivelInicial").enabled = false;
                    document.getElementById("divCombustivelFinal").enabled = false;
                    document.getElementById("cmbOrigem").ej2_instances[0].enabled = false
                    document.getElementById("cmbDestino").ej2_instances[0].enabled = false

                    document.getElementById("ddtCombustivelInicial").ej2_instances[0].enabled = false
                    document.getElementById("ddtCombustivelFinal").ej2_instances[0].enabled = false

                    const btnRequisitante = document.getElementById("btnRequisitante");
                    // Adiciona uma classe indicando que está desabilitado
                    btnRequisitante.classList.add('disabled');
                    // Remove o comportamento de clique
                    btnRequisitante.addEventListener('click', function (event) {
                        try {
                            event.preventDefault();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
                        }
                    });

                    //const btnAbrirNovoSetor = document.getElementById("btnAbrirNovoSetor");
                    //// Adiciona uma classe indicando que está desabilitado
                    //btnAbrirNovoSetor.classList.add('disabled');
                    //// Remove o comportamento de clique
                    //btnAbrirNovoSetor.addEventListener('click', function (event) {
                    //    event.preventDefault();
                    //});

                    //document.getElementById("txtKmInicial").value = viagem.kmInicial;
                    //document.getElementById("txtKmFinal").value = viagem.kmFinal;
                    //calcularDistanciaViagem
                    //  ddtCombustivelInicial.value = [viagem.combustivelInicial];
                    //  if (viagem.combustivelFinal != null && viagem.combustivelFinal !== '') {
                    //    ddtCombustivelFinal.value = [viagem.combustivelFinal];
                    //  }
                }
            }
        }
        $("#btnFecha").enabled = true;
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'ExibeViagem', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "ExibeViagem", error);
    }
}

// ===================================================================
// 🧠 Função: InitializeCalendar
// 📌 Descrição: Função utilitária
// 📤 Chama: ExibeViagem, calcularDuracaoViagem
// 📥 Chamado por: [Nenhuma função detectada]
// ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
// ===================================================================

function InitializeCalendar(URL) {
    try {
        var calendarEl = document.getElementById('agenda');
        calendar = new FullCalendar.Calendar(calendarEl, {
            lazyFetching: true,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            initialView: 'diaSemana',
            views: {
                diaSemana: {
                    buttonText: 'Dia',
                    type: 'timeGridDay',
                    weekends: true
                },
                listDay: {
                    buttonText: 'Lista do dia',
                    weekends: true
                },
                weekends: {
                    buttonText: 'Fins de Semana',
                    type: 'timeGridWeek',
                    weekends: true,
                    hiddenDays: [1, 2, 3, 4, 5]
                }
            },
            locale: "pt",
            selectable: true,
            editable: true,
            navLinks: true,
            events: function (fetchInfo, successCallback, failureCallback) {
                try {
                    var start = fetchInfo.startStr;
                    var end = fetchInfo.endStr;
                    $.ajax({
                        url: URL,
                        type: 'GET',
                        dataType: 'json',
                        data: {
                            start: start,
                            end: end
                        },
                        success: function (data) {
                            try {
                                var events = $.map(data.data, function (item) {
                                    try {
                                        return {
                                            id: item.viagemId,
                                            title: item.titulo,
                                            description: item.descricao,
                                            start: item.horaInicial,
                                            end: item.horaFinal,
                                            backgroundColor: item.corEvento,
                                            textColor: item.corTexto,
                                            allDay: false
                                        };
                                    } catch (error) {
                                        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
                                    }
                                });
                                successCallback(events);
                            } catch (error) {
                                TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                            }
                        },
                        error: function () {
                            try {
                                failureCallback();
                            } catch (error) {
                                TratamentoErroComLinha("agendamento_viagem<num>.js", "error", error);
                            }
                        }
                    });
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "events", error);
                }
            },
            eventClick: function (info) {
                try {
                    var idViagem = info.event.id;
                    console.log("ID: " + idViagem);
                    info.jsEvent.preventDefault();
                    $.ajax({
                        type: "GET",
                        url: '/api/Agenda/RecuperaViagem',
                        data: {
                            id: idViagem
                        },
                        contentType: "application/json",
                        dataType: "json",
                        success: function (response) {
                            try {
                                console.log(response.data.viagemId);
                                console.log(response.data.dataInicial);
                                console.log(response.data.horaInicio);
                                viagemId_AJAX = response.data.viagemId;
                                viagemId = response.data.viagemId;
                                recorrenciaViagemId_AJAX = response.data.recorrenciaViagemId;
                                recorrenciaViagemId = response.data.recorrenciaViagemId;
                                dataInicial_List = response.data.dataInicial;
                                const dataInicialISO = response.data.dataInicial;
                                const dataTemp = new Date(dataInicialISO);

                                // Usando Intl.DateTimeFormat para formatar a data;
                                dataInicial = new Intl.DateTimeFormat('pt-BR').format(dataTemp);
                                ExibeViagem(response.data);
                            } catch (error) {
                                TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                            }
                        }
                    });
                    $('#modalViagens').modal('show');
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "eventClick", error);
                }
            },
            eventDidMount: function (info) {
                try {
                    // Certifique-se de que a descrição está sendo capturada corretamente
                    const description = info.event.extendedProps.description || "Sem descrição";

                    // Adicione o atributo de título ao elemento
                    info.el.setAttribute('title', description);

                    // Inicialize o Bootstrap Tooltip
                    new bootstrap.Tooltip(info.el);
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "eventDidMount", error);
                }
            },
            loading: function (isLoading) {
                try {
                    if (isLoading) {
                        $(".example").show();
                    } else {
                        $(".example").hide();
                    }
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "loading", error);
                }
            },
            select: function (info) {
                try {
                    const startStr = moment(info.start).format("YYYY-MM-DD");
                    const HoraInicio = moment(info.start).format("HH:mm:ss");
                    console.log(startStr);
                    ExibeViagem("");
                    CarregandoAgendamento = true;
                    $('#modalViagens').modal('show');
                    document.getElementById("txtDataInicial").ej2_instances[0].value = moment(startStr).format('DD/MM/YYYY');
                    document.getElementById("txtHoraInicial").value = HoraInicio;
                    calcularDuracaoViagem();
                    CarregandoAgendamento = false;
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "select", error);
                }
            },
            selectOverlap: function (event) {
                try {
                    return !event.block;
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "selectOverlap", error);
                }
            }
        });
        calendar.render();
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'InitializeCalendar', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "InitializeCalendar", error);
    }
}

// Function to fetch events based on the date range;
let isFetching = false;

// ===================================================================
// 🧠 Função: fetchEvents
// 📌 Descrição: Função utilitária
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: [Nenhuma função detectada]
// ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
// ===================================================================

function fetchEvents(start, end, successCallback, failureCallback) {
    try {
        if (isFetching) return; // Prevent multiple calls;
        isFetching = true;
        console.log("Fetching events from", start, "to", end);

        // Simulating an async operation;
        setTimeout(() => {
            try {
                // Your event fetching logic...
                isFetching = false; // Reset flag after fetching;
                successCallback(); // Call success callback;
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
            }
        }, 1000);
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'fetchEvents', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "fetchEvents", error);
    }
}


// ===================================================================
// 🧠 Função: formatDate
// 📌 Descrição: Formata uma data em um formato de dia/mês/ano.
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: addDate, addDate
// ✅ Status: Ativa
// ===================================================================

function formatDate(dateObj) {
    try {
        const day = ("0" + dateObj.getDate()).slice(-2);
        const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'formatDate', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "formatDate", error);
    }
}

// ===================================================================
// 🧠 Função: updateBadge
// 📌 Descrição: Atualiza o contador de itens exibidos no componente de seleção múltipla.
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: addDate, addDate
// ✅ Status: Ativa
// ===================================================================

//function updateBadge() {
//  try {
//    document.getElementById("itemCount").textContent = $("#lstDias").data("kendoMultiSelect").dataSource.total();
//  } catch (error) {
//    /* CATCH ORIGINAL:
//    TratamentoErroComLinha('agendamento_viagem<num>.js', 'updateBadge', error);
//     */
//    TratamentoErroComLinha("agendamento_viagem<num>.js", "updateBadge", error);
//  }
//}

// ===================================================================
// 🧠 Função: updateBadge
// 📌 Descrição: Function to update the Badge (Bootstrap Badge)
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: addDate, addDate
// ✅ Status: Ativa
// ===================================================================
function updateBadge() {
    //setTimeout(() => {
    //    try {
    //        const itensHTML = document.querySelectorAll("#divDiasSelecionados li");
    //        const quantidade = itensHTML.length;

    //        const badge1 = document.getElementById("itensBadge");
    //        const badge2 = document.getElementById("itensBadgeHTML");

    //        if (badge1) badge1.textContent = quantidade;
    //        if (badge2) badge2.textContent = quantidade;
    //    } catch (error) {
    //        TratamentoErroComLinha("agendamento_viagem<num>.js", "updateBadge", error);
    //    }
    //}, 100);
}


//< !--JavaScript to initialize the accordion-- >

//REQUISITANTES;

// Initialize the Syncfusion Accordion;
var accordionRequisitante = new ej.navigations.Accordion({
    width: 600,
    height: 'auto',
    margintop: 100,
    marginleft: -300,
    expandMode: 'Single',
    // Allows only one item to be expanded at a time;
    animation: {
        expand: {
            effect: 'fadeIn',
            duration: 500
        },
        // Animation for expanding;
        collapse: {
            effect: 'fadeOut',
            duration: 500
        } // Animation for collapsing;
    }
});

// Inicialize o accordion.
accordionRequisitante.appendTo('#accordionRequisitante');

// ===================================================================
// 🧠 Função: hideAccordionRequisitante
// 📌 Descrição: Função para esconder o Accordion e limpar os campos
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: [Nenhuma função detectada]
// ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
// ===================================================================

function hideAccordionRequisitante() {
    try {
        // Limpa os campos desejados
        $("#txtPonto").val("");
        $("#txtNome").val("");
        $("#txtRamal").val("");
        $("#txtEmail").val("");
        document.getElementById('ddtSetorRequisitante').ej2_instances[0].value = "";

        // Esconde a div do Accordion
        document.getElementById("accordionRequisitante").style.display = "none";
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'hideAccordionRequisitante', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "hideAccordionRequisitante", error);
    }
}

// Listener para detectar quando o foco é perdido
document.addEventListener("click", function (event) {
    try {
        var accordionElement = document.getElementById("accordionRequisitante");
        var btnRequisitante = document.getElementById("btnRequisitante");

        // Verifica se o clique foi fora do Accordion e fora do botão "btnRequisitante"
        if (!accordionElement.contains(event.target) && event.target !== btnRequisitante) {
            hideAccordionRequisitante();
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

// Show/Hide functionality;
var toggleAccordionBtnRequisitante = document.getElementById("btnRequisitante");
var accordionElementRequisitante = document.getElementById("accordionRequisitante");
// Inicialize o estado de visibilidade do elemento.
accordionElementRequisitante.style.display = "none";
toggleAccordionBtnRequisitante.addEventListener("click", function () {
    try {
        var displayValue = window.getComputedStyle(accordionElementRequisitante).display;
        if (displayValue === "none") {
            accordionElementRequisitante.style.display = "block";
        } else {
            hideAccordionRequisitante();
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

//Eventos;

// Inicializa o Accordion da Syncfusion
var accordionEvento = new ej.navigations.Accordion({
    width: 800,
    height: 'auto',
    margintop: 100,
    marginleft: -1300,
    expandMode: 'Single',
    animation: {
        expand: {
            effect: 'fadeIn',
            duration: 500
        },
        collapse: {
            effect: 'fadeOut',
            duration: 500
        }
    }
});

// Inicializa o Accordion
accordionEvento.appendTo('#accordionEvento');


// ===================================================================
// 🧠 Função: hideAccordionEvento
// 📌 Descrição: Função utilitária
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: [Nenhuma função detectada]
// ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
// ===================================================================

function hideAccordionEvento() {
    try {
        // Limpa os campos desejados
        $("#txtNomeDoEvento").val("");
        $("#txtDescricaoEvento").val("");
        $("#txtDataInicialEvento").val("");
        $("#txtDataFinalEvento").val("");
        $("#txtQtdPessoas").val("");
        document.getElementById('lstRequisitanteEvento').ej2_instances[0].value = "";
        document.getElementById('lstSetorRequisitanteEvento').ej2_instances[0].value = "";

        // Esconde a div do Accordion
        document.getElementById("accordionEvento").style.display = "none";
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'hideAccordionEvento', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "hideAccordionEvento", error);
    }
}
var toggleAccordionBtnEvento = document.getElementById("btnEvento");
var accordionElementEvento = document.getElementById("accordionEvento");
accordionElementEvento.style.display = "none";

//Show/Hide functionality;

toggleAccordionBtnEvento.addEventListener("click", function () {
    try {
        var displayValue = window.getComputedStyle(accordionElementEvento).display;
        if (displayValue === "none") {
            accordionElementEvento.style.display = "block";
        } else {
            hideAccordionEvento();
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});
let dialogRecorrencia = new ej.popups.Dialog({
    header: '<div style="display: flex; align-items: center; justify-content: space-between;">' + '<span style="font-size: 18px; color: #e74c3c; font-weight: bold;">Atenção ao Prazo</span>' + '<img src="./images/barbudo.jpg" alt="Warning Icon" style="width: 48px; height: 48px; margin-left: auto;">' + '</div>',
    content: '<div style="font-size: 16px; color: #333;">A data final não pode ser maior que 365 dias após a data inicial.</div>',
    position: {
        X: 'center',
        Y: 'center'
    },
    width: '350px',
    cssClass: 'custom-dialog-style',
    // Custom CSS class for applying additional styles;
    visible: false,
    // Initializes as hidden;
    buttons: [{
        click: () => {
            try {
                return dialogRecorrencia.hide();
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "click", error);
            }
        },
        buttonModel: {
            content: 'OK',
            isPrimary: true,
            cssClass: 'custom-ok-button'
        }
    }]
});
dialogRecorrencia.appendTo('#dialogRecorrencia');

// Custom CSS for dialog styles;
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .custom-dialog-style .e-dlg-header {
            background: none; /* No background color */,
            border-bottom: none;
        }
        .custom-dialog-style .e-footer-content {
            text-align: center;
        }
        .custom-ok-button {
            background-color: #3498db !important; /* Custom button color */,
            color: white !important;
            border: none;
            font-size: 14px;
            padding: 8px 16px;
        }
        .custom-ok-button:hover {
            background-color: #2980b9 !important;
        }
    </style>
    `);

// Função a ser chamada no evento focusout do controle txtFinalRecorrencia;
document.getElementById('txtFinalRecorrencia').addEventListener('focusout', function () {
    try {
        const txtDataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;
        const txtFinalRecorrencia = document.getElementById('txtFinalRecorrencia').value;
        if (txtDataInicial && txtFinalRecorrencia) {
            // Especifica claramente o formato esperado (ex: 'DD/MM/YYYY' ou 'YYYY-MM-DD'),
            const dataInicial = moment(txtDataInicial, 'DD-MM-YYYY'); // 'true' para validar o formato;
            const dataFinal = moment(txtFinalRecorrencia, 'DD-MM-YYYY');

            // Verifica se a diferença entre as datas é maior que 365 dias;
            const diferencaDias = dataFinal.diff(dataInicial, 'days');
            if (diferencaDias > 365) {
                // Mostra o dialog e esvazia o campo txtFinalRecorrencia;
                //dialogRecorrencia.show();

                Swal.fire({
                    iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                    customClass: {
                        popup: 'custom-popup'
                    },
                    title: '⚠️ Atenção',
                    text: 'A data final não pode ser maior que 365 dias após a data inicial.',
                    icon: 'warning',
                    confirmButtonText: 'Ok',
                    backdrop: true,
                    // Ensures SweetAlert2 has a backdrop like a modal;
                    heightAuto: false,
                    // Prevent layout issues;
                    didOpen: () => {
                        try {
                            // Ensure all modal-related backdrops and modals are hidden behind;
                            $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                            // Set z-index for SweetAlert2 container and backdrop;
                            $('.swal2-container').css({
                                'z-index': 9999,
                                // Highest possible z-index;
                                'position': 'fixed' // Ensure it's positioned correctly;
                            });
                            $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                            // Force focus to SweetAlert2 to prevent modals from interfering;
                            Swal.getPopup().focus();
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                        }
                    },
                    didClose: () => {
                        try {
                            // Restore the Bootstrap backdrop after SweetAlert closes;
                            $('.modal-backdrop').css('z-index', '1040').show();

                            // Close the modal after success;
                            $("#modalAgendamento").hide();
                            $("body").removeClass("modal-open");
                            $("body").css("overflow", "auto");
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                        }
                    }
                });
                document.getElementById('txtFinalRecorrencia').value = '';
            }
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});
$(document).ready(function () {
    try {

        $("#btnViagem").hide();

        $('#btnFecha').on('click', function () {
            try {
                $('#modalViagens').hide();
                $("div").removeClass("modal-backdrop");
                $('body').removeClass('modal-open');
                $("body").css("overflow", "auto");
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
            }
        });
        $('#btnFecharFicha').on('click', function () {
            try {
                $('#modalPrint').hide();
                $("div").removeClass("modal-backdrop");
                $('body').removeClass('modal-open');
                $("body").css("overflow", "auto");
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
            }
        });
        var lstEvento = document.getElementById("lstEventos").ej2_instances[0];
        lstEvento.enabled = false; // To disable;

        document.getElementById("btnEvento").style.display = "none";
        InitializeCalendar("api/Agenda/CarregaViagens");
        PreencheListaSetores();
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

// Configura a Exibição do Modal de Viagens;
$('#modalViagens').on('shown.bs.modal', function (event) {

    try {



        const tooltipTargets = [
            { id: '#txtDuracao', msg: 'Se a <strong>Duração da Viagem</strong> estiver muito longa, verifique primeiro se ela está <strong>Correta</strong> antes de confirmar.' },
            { id: '#cmbOrigem', msg: 'Se a <strong>Origem</strong> não estiver presente na Lista, verifique primeiro se ela não está <strong>Inativa</strong> antes de cadastrar uma nova.' },
            { id: '#cmbDestino', msg: 'Se o <strong>Destino</strong> não estiver presente na Lista, verifique primeiro se ele não está <strong>Inativo</strong> antes de cadastrar um novo.' },
            { id: '#lstEventos', msg: 'Se o <strong>Evento</strong> não estiver presente na Lista, verifique primeiro se ele não está <strong>Inativo</strong> antes de cadastrar um novo.' },
            { id: '#lstRequisitante', msg: 'Se o <strong>Requisitante</strong> não estiver presente na Lista, verifique primeiro se ele não está <strong>Inativo</strong> antes de cadastrar um novo.' },
            { id: '#lstRequisitanteEvento', msg: 'Se o <strong>Requisitante do Evento</strong> não estiver presente na Lista, verifique primeiro se ele não está <strong>Inativo</strong> antes de cadastrar um novo.' },
            { id: '#lstMotorista', msg: 'Se o <strong>Motorista</strong> não estiver presente na Lista, verifique primeiro se ele não está <strong>Inativo</strong> antes de cadastrar um novo.' },
            { id: '#lblMotorista', msg: 'Se o <strong>Motorista</strong> não estiver presente na Lista, verifique primeiro se ele não está <strong>Inativo</strong> antes de cadastrar um novo.' },
            { id: '#icoMotorista', msg: 'Se o <strong>Motorista</strong> não estiver presente na Lista, verifique primeiro se ele não está <strong>Inativo</strong> antes de cadastrar um novo.' },
            { id: '#lstVeiculo', msg: 'Se o <strong>Veículo</strong> não estiver presente na Lista, verifique primeiro se ele não está <strong>Inativo</strong> antes de cadastrar um novo.' },
            { id: '#txtQuilometragem', msg: 'Se a <strong>Quilometragem Percorrida</strong> estiver muito grande, verifique primeiro se ela está <strong>Correta</strong> antes de confirmar.' }
        ];

        tooltipTargets.forEach(t => {
            const el = document.querySelector(t.id);
            if (el && window.ej && ej.popups) {
                const tooltip = new ej.popups.Tooltip({
                    content: t.msg,
                    opensOn: 'Hover',
                    cssClass: 'tooltip-laranja',
                    position: 'TopCenter',
                    afterOpen: function (args) {
                        if (args?.element) {
                            args.element.style.zIndex = '1065';
                        }
                    },
                    beforeOpen: (args) =>
                    {
                        if (CarregandoViagemBloqueada)
                        {
                            args.cancel = true;
                        }
                    }
                });
                tooltip.appendTo(el);
            }
        });


        //defaultRTE.refreshUI();
        $(document).off('focusin.modal');
        $("#btnConfirma").prop("disabled", false);
        var viagemId = document.getElementById("txtViagemId").value;
        var relatorioAsString = "";
        $.ajax({
            type: "GET",
            url: '/api/Agenda/RecuperaViagem',
            data: {
                id: viagemId
            },
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                try {
                    if (response.data.status == "Cancelada")
                    {
                        $("#btnCancela").hide();
                        CarregandoViagemBloqueada = true;
                        relatorioAsString = response.data.finalidade != "Evento" ? "FichaCancelada.trdp" : "FichaEventoCancelado.trdp";
                    }
                    else if (response.data.finalidade == "Evento" && response.data.status != "Cancelada")
                    {
                        relatorioAsString = "FichaEvento.trdp";
                    }
                    else if (response.data.status == "Aberta" && response.data.finalidade != "Evento")
                    {
                        relatorioAsString = "FichaAberta.trdp";
                    }
                    else if (response.data.status == "Realizada")
                    {
                        CarregandoViagemBloqueada = true;
                        relatorioAsString = response.data.finalidade != "Evento" ? "FichaRealizada.trdp" : "FichaEventoRealizado.trdp";
                    }
                    else if (response.data.statusAgendamento == true)
                    {
                        relatorioAsString = response.data.finalidade != "Evento" ? "FichaAgendamento.trdp" : "FichaEventoAgendado.trdp";
                    }

                    calcularDistanciaViagem();
                    calcularDuracaoViagem();

                    // Renderiza o relatório;
                    $("#fichaReport").telerik_ReportViewer({
                        serviceUrl: "/api/reports/",
                        reportSource: {
                            report: relatorioAsString,
                            parameters: {
                                ViagemId: viagemId.toString().toUpperCase()
                            }
                        },
                        viewMode: telerikReportViewer.ViewModes.PRINT_PREVIEW,
                        scaleMode: telerikReportViewer.ScaleModes.SPECIFIC,
                        scale: 1.0,
                        enableAccessibility: false,
                        sendEmail: {
                            enabled: true
                        }
                    });

                    //ExibeViagem(response.data);
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                }
            }
        });
        const novaDataMinima = new Date();
        const datePickerElement = document.getElementById('txtDataInicial');
        const datePickerInstance = datePickerElement.ej2_instances[0]; // Acessando a instância;
        novaDataMinima.setDate(novaDataMinima.getDate() - 1); // Um dia antes de hoje;
        datePickerInstance.setProperties({
            min: novaDataMinima
        });
        datePickerInstance.min = novaDataMinima;
        console.log("datePickerInstance");

        //if (viagemId === "" || viagemId === null)
        //{
        //    // Pega Data/Hora Atual
        //    debugger;
        //    const agora = new Date();
        //    const dataAtual = moment().format('DD/MM/YYYY');
        //    const horaAtual = agora.toTimeString().split(':').slice(0, 2).join(':');
        //    document.getElementById("txtHoraInicial").value = horaAtual;
        //}

    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
}).on("hide.bs.modal", function (event) {
    try {
        // Remove o relatório e recria o container para o próximo uso;
        $("#fichaReport").remove();
        $("#ReportContainer").append("<div id='fichaReport' style='width:100%' class='pb-3'> Carregando... </div>");
        $("div").removeClass("modal-backdrop");
        $('body').removeClass('modal-open');
        location.reload();
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});
var defaultRTE;
var StatusViagem = "Aberta";
var calendar;
var InserindoRequisitante = false;
var CarregandoAgendamento = false;
$.fn.modal.Constructor.prototype.enforceFocus = function () {
    try { } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
};

// ===================================================================
// 🧠 Função: onCreate
// 📌 Descrição: Função utilitária
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: [Nenhuma função detectada]
// ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
// ===================================================================

function onCreate() {
    try {
        defaultRTE = this;
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'onCreate', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "onCreate", error);
    }
}

// ===================================================================
// 🧠 Função: toolbarClick
// 📌 Descrição: Função necessária para o RTE;
// 📤 Chama: upload
// 📥 Chamado por: [Nenhuma função detectada]
// ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
// ===================================================================

function toolbarClick(e) {
    try {
        if (e.item.id == "rte_toolbar_Image") {
            var element = document.getElementById('rte_upload');
            element.ej2_instances[0].uploading = function upload(args) {
                try {
                    args.currentRequest.setRequestHeader('XSRF-TOKEN', document.getElementsByName('__RequestVerificationToken')[0].value);
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
                }
            };
        }
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'toolbarClick', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "toolbarClick", error);
    }
}

//Controla o Submit do Agendamento;
//================================
$("#btnViagem").click(function (event) {
    try {
        event.preventDefault();
        $("#btnViagem").hide();
        $("#btnConfirma").html("<i class='fa fa-save' aria-hidden='true'></i>Registra Viagem");
        document.getElementById("divNoFichaVistoria").style.display = 'block';
        document.getElementById("divDataFinal").style.display = 'block';
        document.getElementById("divHoraFinal").style.display = 'block';
        document.getElementById("divDuracao").style.display = 'block';
        document.getElementById("divKmAtual").style.display = 'block';
        document.getElementById("divKmInicial").style.display = 'block';
        document.getElementById("txtKmInicial").value = '';
        document.getElementById("divKmFinal").style.display = 'block';
        document.getElementById("txtKmFinal").value = '';
        document.getElementById("divQuilometragem").style.display = 'block';
        document.getElementById("divCombustivelInicial").style.display = 'block';
        document.getElementById("divCombustivelFinal").style.display = 'block';

        $("#txtStatusAgendamento").val(false);
        // Pega a Nova Ficha
        $.ajax({
            url: "/Viagens/Upsert?handler=VerificaFicha",
            method: "GET",
            datatype: "json",
            data: { id: 0 },
            success: function (res) {
                const ultimaFicha = parseInt(res.data);
                if (!isNaN(ultimaFicha)) {
                    const novaFicha = ultimaFicha + 1;
                    $('#txtNoFichaVistoria').val(novaFicha);
                }
            },
            error: function (err) {
                Alerta.Erro("⚠️ Erro ao buscar número da última ficha", "Classe: Viagem_050 | Método: document.ready | Erro: " + err.statusText);
            }
        });

    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'click', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

//Controla o Apagar do Agendamento;
//================================
$("#btnApaga").click(async function (event) {
    try {
        var viagemId = document.getElementById("txtViagemId").value;
        var recorrenciaViagemId = document.getElementById("txtRecorrenciaViagemId").value;
        var rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];
        let titulo = '';
        if (recorrenciaViagemId != null && recorrenciaViagemId != "" || recorrenciaViagemId != '00000000-0000-0000-0000-000000000000') {
            titulo = "Você gostaria de apagar todos os agendamentos recorrentes? Ou somente o atual?";
        } else {
            titulo = "Você gostaria de apagar este agendamento?";
        }
        const result = await Swal.fire({
            title: titulo,
            text: "Não será possível recuperar os dados eliminados!",
            icon: "warning",
            iconHtml: '<img src="/images/assustado.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup'
            },
            showCancelButton: true,
            confirmButtonText: 'Apagar Todos',
            cancelButtonText: 'Apenas Atual',
            dangerMode: true,
            heightAuto: false,
            showCloseButton: true,
            // Habilita o botão de fechamento no canto superior direito
            didOpen: () => {
                try {
                    $('.modal-backdrop').css('z-index', '1040').hide();
                    $('.swal2-container').css({
                        'z-index': 9999,
                        'position': 'fixed'
                    });
                    $('.swal2-backdrop-show').css('z-index', 9998);
                    Swal.getPopup().focus();
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                }
            },
            didClose: () => {
                try {
                    $('.modal-backdrop').css('z-index', '1040').show();
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                }
            }
        });
        if (result.isConfirmed) {
            try {
                if (recorrenciaViagemId === '00000000-0000-0000-0000-000000000000') {
                    await excluirAgendamento(viagemId);
                    recorrenciaViagemId = viagemId;
                }
                const agendamentosRecorrentes = await obterAgendamentosRecorrentes(recorrenciaViagemId);
                for (const agendamento of agendamentosRecorrentes) {
                    await excluirAgendamento(agendamento.viagemId);
                    await delay(200); // Adiciona um pequeno atraso para evitar problemas de múltiplas requisições.
                }
                toastr.success('Todos os agendamentos foram excluídos com sucesso!', {
                    timeOut: 3000
                });
                await delay(2000);
                $("#modalAgendamento").hide();
                $('body').removeClass('modal-open');
                $("body").css("overflow", "auto");
                location.reload();
            } catch (error) {
                /* CATCH ORIGINAL:
                console.error("Erro ao excluir agendamentos recorrentes:", error);
                toastr.error('Erro ao excluir os agendamentos recorrentes.');
                 */
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
            }
        } else {
            excluirAgendamento(viagemId);
            toastr.success('O agendamento foi excluído com sucesso!', {
                timeOut: 3000
            });
            await delay(2000);
            $("#modalAgendamento").hide();
            $('body').removeClass('modal-open');
            $("body").css("overflow", "auto");
            location.reload();
        }
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'click', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

// ===================================================================
// 🧠 Função: excluirAgendamento
// 📌 Descrição: Gerencia dados relacionados a agendamento
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: [Nenhuma função detectada]
// ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
// ===================================================================

async function excluirAgendamento(viagemId) {
    try {
        var objAgendamento = JSON.stringify({
            "ViagemId": viagemId
        });
        $.ajax({
            type: "post",
            url: '/api/Agenda/ApagaAgendamento',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: objAgendamento,
            success: function (data) {
                try {
                    if (data.success) {
                        toastr.success(data.message);
                        //    $("#modalAgendamento").hide();
                        //    $('body').removeClass('modal-open');
                        //    $("body").css("overflow", "auto");
                        //    location.reload();
                    } else {
                        toastr.error(data.message);
                    }
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                }
            },
            error: function (err) {
                try {
                    console.log("Erro:  " + err.responseText);
                    alert('something went wrong');
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "error", error);
                }
            }
        });
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'excluirAgendamento', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "excluirAgendamento", error);
    }
}

// Controla o Cancelar do Agendamento;
// ==================================
$("#btnCancela").click(async function (event) {
    try {
        var viagemId = document.getElementById("txtViagemId").value;
        var recorrenciaViagemId = document.getElementById("txtRecorrenciaViagemId").value;
        var rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];
        let titulo = '';
        if (recorrenciaViagemId != null && recorrenciaViagemId != "" || recorrenciaViagemId != '00000000-0000-0000-0000-000000000000') {
            titulo = "Você gostaria de cancelar todos os agendamentos recorrentes? Ou somente o atual?";
        } else {
            titulo = "Você gostaria de cancelar este agendamento?";
        }
        const result = await Swal.fire({
            title: titulo,
            text: "Não será possível desfazer essa ação!",
            icon: "warning",
            iconHtml: '<img src="/images/assustado.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup',
                confirmButton: 'confirm-button-custom',
                cancelButton: 'cancel-button-custom'
            },
            showCancelButton: true,
            confirmButtonText: 'Cancelar Todos',
            cancelButtonText: 'Apenas Atual',
            heightAuto: false,
            showCloseButton: true,
            // Habilita o botão de fechamento no canto superior direito
            didOpen: () => {
                try {
                    $('.modal-backdrop').css('z-index', '1040').hide();
                    $('.swal2-container').css({
                        'z-index': 9999,
                        'position': 'fixed'
                    });
                    $('.swal2-backdrop-show').css('z-index', 9998);
                    Swal.getPopup().focus();
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                }
            },
            didClose: () => {
                try {
                    $('.modal-backdrop').css('z-index', '1040').show();
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                }
            }
        });
        if (result.isConfirmed) {
            try {
                if (recorrenciaViagemId === '00000000-0000-0000-0000-000000000000') {
                    await excluirAgendamento(viagemId);
                    recorrenciaViagemId = viagemId;
                }
                const agendamentosRecorrentes = await obterAgendamentosRecorrentes(recorrenciaViagemId);
                for (const agendamento of agendamentosRecorrentes) {
                    await cancelarAgendamento(agendamento.viagemId, rteDescricao.value);
                    await delay(200); // Adiciona um pequeno atraso para evitar problemas de múltiplas requisições.
                }
                toastr.success('Todos os agendamentos foram cancelados com sucesso!');
                await delay(2000);
                $("#modalAgendamento").hide();
                $('body').removeClass('modal-open');
                $("body").css("overflow", "auto");
                location.reload();
            } catch (error) {
                /* CATCH ORIGINAL:
                console.error("Erro ao cancelar agendamentos recorrentes:", error);
                toastr.error('Erro ao cancelar os agendamentos recorrentes.');
                 */
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
            }
        } else {
            cancelarAgendamento(viagemId, rteDescricao.value);
            toastr.success('O agendamento foi cancelado com sucesso!');
            await delay(4000);
            $("#modalAgendamento").hide();
            $('body').removeClass('modal-open');
            $("body").css("overflow", "auto");
            location.reload();
        }
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'click', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

// ===================================================================
// 🧠 Função: cancelarAgendamento
// 📌 Descrição: Gerencia dados relacionados a agendamento
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: [Nenhuma função detectada]
// ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
// ===================================================================

async function cancelarAgendamento(viagemId, descricao) {
    try {
        var objAgendamento = JSON.stringify({
            "ViagemId": viagemId,
            "Descricao": descricao
        });
        $.ajax({
            type: "post",
            url: '/api/Agenda/CancelaAgendamento',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: objAgendamento,
            success: function (data) {
                try {
                    if (data.success) {
                        toastr.success(data.message);
                    } else {
                        toastr.error(data.message);
                    }
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                }
            },
            error: function (err) {
                try {
                    console.log("Erro: " + err.responseText);
                    alert('something went wrong');
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "error", error);
                }
            }
        });
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'cancelarAgendamento', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "cancelarAgendamento", error);
    }
}

//Controla o Imprimir do Agendamento;
//==================================
$("#btnImprime").click(function (event) {
    try {
        //Imprime a Ficha do Agendamento;
        var viagemId = document.getElementById("txtViagemId").value;
        $("#fichaReport").telerik_ReportViewer({
            serviceUrl: "/api/reports/",
            reportSource: {
                report: 'Agendamento.trdp',
                parameters: {
                    ViagemId: viagemId.toString().toUpperCase()
                }
            },
            viewMode: telerikReportViewer.ViewModes.PRINT_PREVIEW,
            scaleMode: telerikReportViewer.ScaleModes.SPECIFIC,
            scale: 1.0,
            enableAccessibility: false,
            sendEmail: {
                enabled: true
            }
        });
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'click', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});
ej.base.L10n.load({
    "pt-BR": {
        "richtexteditor": {
            "alignments": "Alinhamentos",
            "justifyLeft": "Alinhar à Esquerda",
            "justifyCenter": "Centralizar",
            "justifyRight": "Alinhar à Direita",
            "justifyFull": "Justificar",
            "fontName": "Nome da Fonte",
            "fontSize": "Tamanho da Fonte",
            "fontColor": "Cor da Fonte",
            "backgroundColor": "Cor de Fundo",
            "bold": "Negrito",
            "italic": "Itálico",
            "underline": "Sublinhado",
            "strikethrough": "Tachado",
            "clearFormat": "Limpa Formatação",
            "clearAll": "Limpa Tudo",
            "cut": "Cortar",
            "copy": "Copiar",
            "paste": "Colar",
            "unorderedList": "Lista com Marcadores",
            "orderedList": "Lista Numerada",
            "indent": "Aumentar Identação",
            "outdent": "Diminuir Identação",
            "undo": "Desfazer",
            "redo": "Refazer",
            "superscript": "Sobrescrito",
            "subscript": "Subscrito",
            "createLink": "Inserir Link",
            "openLink": "Abrir Link",
            "editLink": "Editar Link",
            "removeLink": "Remover Link",
            "image": "Inserir Imagem",
            "replace": "Substituir",
            "align": "Alinhar",
            "caption": "Título da Imagem",
            "remove": "Remover",
            "insertLink": "Inserir Link",
            "display": "Exibir",
            "altText": "Texto Alternativo",
            "dimension": "Mudar Tamanho",
            "fullscreen": "Maximizar",
            "maximize": "Maximizar",
            "minimize": "Minimizar",
            "lowerCase": "Caixa Baixa",
            "upperCase": "Caixa Alta",
            "print": "Imprimir",
            "formats": "Formatos",
            "sourcecode": "Visualizar Código",
            "preview": "Exibir",
            "viewside": "ViewSide",
            "insertCode": "Inserir Código",
            "linkText": "Exibir Texto",
            "linkTooltipLabel": "Título",
            "linkWebUrl": "Endereço Web",
            "linkTitle": "Entre com um título",
            "linkurl": "http://exemplo.com",
            "linkOpenInNewWindow": "Abrir Link em Nova Janela",
            "linkHeader": "Inserir Link",
            "dialogInsert": "Inserir",
            "dialogCancel": "Cancelar",
            "dialogUpdate": "Atualizar",
            "imageHeader": "Inserir Imagem",
            "imageLinkHeader": "Você pode proporcionar um link da web",
            "mdimageLink": "Favor proporcionar uma URL para sua imagem",
            "imageUploadMessage": "Solte a imagem aqui ou busque para o upload",
            "imageDeviceUploadMessage": "Clique aqui para o upload",
            "imageAlternateText": "Texto Alternativo",
            "alternateHeader": "Texto Alternativo",
            "browse": "Procurar",
            "imageUrl": "http://exemplo.com/imagem.png",
            "imageCaption": "Título",
            "imageSizeHeader": "Tamanho da Imagem",
            "imageHeight": "Altura",
            "imageWidth": "Largura",
            "textPlaceholder": "Entre com um Texto",
            "inserttablebtn": "Inserir Tabela",
            "tabledialogHeader": "Inserir Tabela",
            "tableWidth": "Largura",
            "cellpadding": "Espaçamento de célula",
            "cellspacing": "Espaçamento de célula",
            "columns": "Número de colunas",
            "rows": "Número de linhas",
            "tableRows": "Linhas da Tabela",
            "tableColumns": "Colunas da Tabela",
            "tableCellHorizontalAlign": "Alinhamento Horizontal da Célular",
            "tableCellVerticalAlign": "Alinhamento Vertical da Célular",
            "createTable": "Criar Tabela",
            "removeTable": "Remover Tabela",
            "tableHeader": "Cabeçalho da Tabela",
            "tableRemove": "Remover Tabela",
            "tableCellBackground": "Fundo da Célula",
            "tableEditProperties": "Editar Propriedades da Tabela",
            "styles": "Estilos",
            "insertColumnLeft": "Inserir Coluna à Esquerda",
            "insertColumnRight": "Inserir Coluna à Direita",
            "deleteColumn": "Apagar Coluna",
            "insertRowBefore": "Inserir Linha Antes",
            "insertRowAfter": "Inserir Linha Depois",
            "deleteRow": "Apagar Linha",
            "tableEditHeader": "Edita Tabela",
            "TableHeadingText": "Cabeçãlho",
            "TableColText": "Col",
            "imageInsertLinkHeader": "Inserir Link",
            "editImageHeader": "Edita Imagem",
            "alignmentsDropDownLeft": "Alinhar à Esquerda",
            "alignmentsDropDownCenter": "Centralizar",
            "alignmentsDropDownRight": "Alinhar à Direita",
            "alignmentsDropDownJustify": "Justificar",
            "imageDisplayDropDownInline": "Inline",
            "imageDisplayDropDownBreak": "Break",
            "tableInsertRowDropDownBefore": "Inserir linha antes",
            "tableInsertRowDropDownAfter": "Inserir linha depois",
            "tableInsertRowDropDownDelete": "Apagar linha",
            "tableInsertColumnDropDownLeft": "Inserir coluna à esquerda",
            "tableInsertColumnDropDownRight": "Inserir coluna à direita",
            "tableInsertColumnDropDownDelete": "Apagar Coluna",
            "tableVerticalAlignDropDownTop": "Alinhar no Topo",
            "tableVerticalAlignDropDownMiddle": "Alinhar no Meio",
            "tableVerticalAlignDropDownBottom": "Alinhar no Fundo",
            "tableStylesDropDownDashedBorder": "Bordas Pontilhadas",
            "tableStylesDropDownAlternateRows": "Linhas Alternadas",
            "pasteFormat": "Colar Formato",
            "pasteFormatContent": "Escolha a ação de formatação",
            "plainText": "Texto Simples",
            "cleanFormat": "Limpar",
            "keepFormat": "Manter",
            "formatsDropDownParagraph": "Parágrafo",
            "formatsDropDownCode": "Código",
            "formatsDropDownQuotation": "Citação",
            "formatsDropDownHeading1": "Cabeçalho 1",
            "formatsDropDownHeading2": "Cabeçalho 2",
            "formatsDropDownHeading3": "Cabeçalho 3",
            "formatsDropDownHeading4": "Cabeçalho 4",
            "fontNameSegoeUI": "SegoeUI",
            "fontNameArial": "Arial",
            "fontNameGeorgia": "Georgia",
            "fontNameImpact": "Impact",
            "fontNameTahoma": "Tahoma",
            "fontNameTimesNewRoman": "Times New Roman",
            "fontNameVerdana": "Verdana"
        }
    }
});

//Verifica se Data Final é menor que Data Inicial;
$("#txtDataFinal").focusout(function () {
    try {
        let DataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;
        let DataFinal = $("#txtDataFinal").val();
        if (DataFinal === '') {
            return;
        }
        if (DataFinal < DataInicial) {
            $("#txtDataFinal").val('');
            Swal.fire({
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup'
                },
                title: '⚠️ Atenção',
                text: 'A data final deve ser maior que a inicial!',
                icon: 'error',
                dangerMode: true,
                confirmButtonText: 'Ok',
                backdrop: true,
                // Ensures SweetAlert2 has a backdrop like a modal;
                heightAuto: false,
                // Prevent layout issues;
                didOpen: () => {
                    try {
                        // Ensure all modal-related backdrops and modals are hidden behind;
                        $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                        // Set z-index for SweetAlert2 container and backdrop;
                        $('.swal2-container').css({
                            'z-index': 9999,
                            // Highest possible z-index;
                            'position': 'fixed' // Ensure it's positioned correctly;
                        });
                        $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                        // Force focus to SweetAlert2 to prevent modals from interfering;
                        Swal.getPopup().focus();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didOpen", error);
                    }
                },
                didClose: () => {
                    try {
                        // Restore the Bootstrap backdrop after SweetAlert closes;
                        $('.modal-backdrop').css('z-index', '1040').show();

                        // Close the modal after success;
                        $("#modalAgendamento").hide();
                        $("body").removeClass("modal-open");
                        $("body").css("overflow", "auto");
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                    }
                }
            });
        }

        calcularDuracaoViagem();

    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

//Verifica se Data Inicial é maior que Data Final;
$("#txtDataInicial").focusout(function () {
    try {
        let DataInicial = document.getElementById("txtDataInicial").ej2_instances[0];
        let DataFinal = $("#txtDataFinal").val();
        if (DataInicial === '' || DataFinal === '') {
            return;
        }
        if (DataInicial > DataFinal) {
            $("#txtDataInicial").val('');
            Swal.fire({
                title: "Erro na Data",
                text: "A data inicial deve ser menor que a final!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            });
        }

        calcularDuracaoViagem();

    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

//Verifica se Hora Final é menor que Hora Inicial e se tem Data Final;
$("#txtHoraFinal").focusout(function () {
    try {
        let HoraInicial = $("#txtHoraInicial").val();
        let HoraFinal = $("#txtHoraFinal").val();
        let DataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;
        let DataFinal = $("#txtDataFinal").val();
        console.log(HoraInicial);
        console.log(HoraFinal);
        console.log(DataFinal);
        if (DataFinal === '') {
            $("#txtHoraFinal").val('');
            Swal.fire({
                title: "Erro na Hora Final",
                text: "Preencha a Data Final para poder preencher a Hora Final!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            });
        }
        if (HoraFinal < HoraInicial && DataInicial === DataFinal) {
            $("#txtHoraFinal").val('');
            Swal.fire({
                title: "Erro na Hora",
                text: "A hora final deve ser maior que a inicial!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            });
        }

        calcularDuracaoViagem();

    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

//Verifica se Hora inicial é maior que Hora final;
$("#txtHoraInicial").focusout(function () {
    try {
        let HoraInicial = $("#txtHoraInicial").val();
        let HoraFinal = $("#txtHoraFinal").val();
        console.log(HoraInicial);
        console.log(HoraFinal);
        if (HoraFinal === '') {
            return;
        }
        if (HoraInicial > HoraFinal) {
            $("#txtHoraInicial").val('');
            Swal.fire({
                title: "Erro na Hora",
                text: "A hora inicial deve ser menor que a final!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            });
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

$("#txtKmInicial").focusout(function () {
    try {
        const kmInicialStr = $("#txtKmInicial").val();
        const kmAtualStr = $("#txtKmAtual").val();

        if (!kmInicialStr || !kmAtualStr) {
            $('#txtKmPercorrido').val('');
            return;
        }

        const kmInicial = parseFloat(kmInicialStr.replace(',', '.'));
        const kmAtual = parseFloat(kmAtualStr.replace(',', '.'));

        if (isNaN(kmInicial) || isNaN(kmAtual)) {
            $('#txtKmPercorrido').val('');
            return;
        }

        if (kmInicial < 0) {
            $("#txtKmInicial").val('');
            $('#txtKmPercorrido').val('');
            Alerta.Erro("⚠️ Erro na Quilometragem", "A quilometragem <strong>inicial</strong> deve ser maior que <strong>zero</strong>!");
            return;
        }

        if (kmInicial < kmAtual) {
            $("#txtKmInicial").val('');
            $('#txtKmPercorrido').val('');
            Alerta.Erro("⚠️ Erro na Quilometragem", "A quilometragem <strong>inicial</strong> deve ser maior que a <strong>atual</strong>!");
            return;
        }

        // Chama a função modular
        calcularDistanciaViagem();

    } catch (error) {
        TratamentoErroComLinha("Viagem_050", "focusout.txtKmInicial", error);
    }
});

//Verifica se KM Final é menor que KM Inicial;
$("#txtKmFinal").focusout(function () {
    try {
        let kmInicial = parseInt($("#txtKmInicial").val());
        let kmFinal = parseInt($("#txtKmFinal").val());
        if (kmFinal < kmInicial) {
            $("#txtKmFinal").val('');
            Swal.fire({
                title: "Erro na Quilometragem",
                text: "A quilometragem final deve ser maior que a inicial!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            });
        }
        if (kmFinal - kmInicial > 100) {
            Swal.fire({
                title: "Alerta na Quilometragem",
                text: "A quilometragem final excede em 100km a inicial!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            });
        }

        calcularDistanciaViagem();

    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

//Verifica se KM Inicial é maior que KM Inicial;
$("#txtKmInicial").focusout(function () {
    try {
        let kmInicial = parseInt($("#txtKmInicial").val());
        let kmFinal = parseInt($("#txtKmFinal").val());
        if (kmInicial > kmFinal) {
            $("#txtKmInicial").val('');
            Swal.fire({
                title: "Erro na Quilometragem",
                text: "A quilometragem inicial deve ser menor que a final!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            });
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

//Verifica se KM Inicial é menor ou diferente de KM Atual;
$("#txtKmInicial").focusout(function () {
    try {
        if ($("#txtKmInicial").val() === '' || $("#txtKmInicial").val() === null) {
            return;
        }
        let kmInicial = parseInt($("#txtKmInicial").val());
        let kmAtual = parseInt($("#txtKmAtual").val());
        console.log(kmInicial);
        if (kmInicial < kmAtual) {
            $("#txtKmInicial").val('');
            Swal.fire({
                title: "Erro na Quilometragem",
                text: "A quilometragem inicial deve ser maior que a atual!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            });
            return;
        }
        if (kmInicial != kmAtual) {
            $("#txtKmInicial").val('');
            Swal.fire({
                title: "Erro na Quilometragem",
                text: "A quilometragem inicial não confere com a atual!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
                buttons: {
                    ok: "Ok"
                }
            });
            return;
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

// ===================================================================
// 🧠 Função: PreencheListaEventos
// 📌 Descrição: Preenche Lista de Eventos Após Inserção de um novo;
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: [Nenhuma função detectada]
// ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
// ===================================================================

function PreencheListaEventos() {
    try {
        $.ajax({
            url: "/Viagens/Upsert?handler=AJAXPreencheListaEventos",
            method: "GET",
            datatype: "json",
            success: function (res) {
                try {
                    var eventoid = res.data[0].eventoId;
                    var nome = res.data[0].nome;
                    console.log(eventoid + " " + nome);
                    let EventoList = [{
                        "EventoId": eventoid,
                        "Evento": nome
                    }];
                    for (var i = 1; i < res.data.length; ++i) {
                        console.log(res.data[i].eventoId + res.data[i].nome);
                        eventoid = res.data[i].eventoId;
                        nome = res.data[i].nome;
                        console.log(eventoid + " " + nome);
                        let evento = {
                            EventoId: eventoid,
                            Evento: nome
                        };
                        EventoList.push(evento);
                    }
                    console.log(EventoList);
                    document.getElementById("lstEventos").ej2_instances[0].fields.dataSource = EventoList;
                } catch (error) {
                    /* CATCH ORIGINAL:
                    console.error("An error occurred: ", error);
                     */
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                }
            }
        });
        document.getElementById("lstEventos").ej2_instances[0].refresh();
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'PreencheListaEventos', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "PreencheListaEventos", error);
    }
}

//
/**
 * TODO: Descrição para a função PreencheListaSetores.
 * Chamado de: localizar no fluxo principal (ex: btnConfirma click).
 */
// ===================================================================
// 🧠 Função: PreencheListaSetores
// 📌 Descrição: Preenche Lista de Setores Após Inserção de um novo;
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: [Nenhuma função detectada]
// ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
// ===================================================================

function PreencheListaSetores() {
    try {
        $.ajax({
            url: "/Viagens/Upsert?handler=AJAXPreencheListaSetores",
            method: "GET",
            datatype: "json",
            success: function (res) {
                try {
                    var setorSolicitanteId = res.data[0].setorSolicitanteId;
                    var setorPaiId = res.data[0].setorPaiId;
                    var nome = res.data[0].nome;
                    var hasChild = res.data[0].hasChild;
                    let SetorList = [{
                        "SetorSolicitanteId": setorSolicitanteId,
                        "SetorPaiId": setorPaiId,
                        "Nome": nome,
                        "HasChild": hasChild
                    }];
                    for (var i = 1; i < res.data.length; ++i) {
                        console.log(res.data[i].requisitanteId + res.data[i].requisitante);
                        setorSolicitanteId = res.data[i].setorSolicitanteId;
                        setorPaiId = res.data[i].setorPaiId;
                        nome = res.data[i].nome;
                        hasChild = res.data[i].hasChild;
                        let setor = {
                            "SetorSolicitanteId": setorSolicitanteId,
                            "SetorPaiId": setorPaiId,
                            "Nome": nome,
                            "HasChild": hasChild
                        };
                        SetorList.push(setor);
                    }
                    console.log(SetorList);
                    document.getElementById("ddtSetor").ej2_instances[0].fields.dataSource = SetorList;
                    //document.getElementById("ddtSetorPai").ej2_instances[0].fields.dataSource = SetorList;

                    document.getElementById("ddtSetorRequisitante").ej2_instances[0].fields.dataSource = SetorList;
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                }
            }
        });
        document.getElementById("ddtSetor").ej2_instances[0].refresh();
        //document.getElementById("ddtSetorPai").ej2_instances[0].refresh();

        document.getElementById("ddtSetorRequisitante").ej2_instances[0].refresh();
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'PreencheListaSetores', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "PreencheListaSetores", error);
    }
}

// Botão InserirEvento do Modal;
//===================================
$("#btnInserirEvento").click(async function (e) {
    try {
        e.preventDefault();
        if ($("#txtNomeDoEvento").val() === "") {
            Swal.fire({
                title: 'Atenção',
                text: "O Nome do Evento é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar"
                }
            });
            return;
        }
        if ($("#txtDescricao").val() === "") {
            Swal.fire({
                title: 'Atenção',
                text: "A Descrição do Evento é obrigatória!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar"
                }
            });
            return;
        }
        if ($("#txtDataInicialEvento").val() === "") {
            Swal.fire({
                title: 'Atenção',
                text: "A Data Inicial é obrigatória!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar"
                }
            });
            return;
        }
        if ($("#txtDataFinalEvento").val() === "") {
            Swal.fire({
                title: 'Atenção',
                text: "A Data Final é obrigatória!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar"
                }
            });
            return;
        }
        if ($("#txtQtdPessoas").val() === "") {
            Swal.fire({
                title: 'Atenção',
                text: "A Quantidade de Pessoas é obrigatória!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar"
                }
            });
            return;
        }
        var setores = document.getElementById('lstSetorRequisitanteEvento').ej2_instances[0];
        if (setores.value === null) {
            Swal.fire({
                title: 'Atenção',
                text: "O Setor do Requisitante é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar"
                }
            });
            return;
        }
        var setorSolicitanteId = setores.value.toString();
        var requisitantes = document.getElementById('lstRequisitanteEvento').ej2_instances[0];
        if (requisitantes.value === null) {
            Swal.fire({
                title: 'Atenção',
                text: "O Requisitante é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar"
                }
            });
            return;
        }
        var requisitanteId = requisitantes.value.toString();
        var objEvento = JSON.stringify({
            "Nome": $('#txtNomeDoEvento').val(),
            "Descricao": $('#txtDescricaoEvento').val(),
            "SetorSolicitanteId": setorSolicitanteId,
            "RequisitanteId": requisitanteId,
            "QtdParticipantes": $('#txtQtdPessoas').val(),
            "DataInicial": moment(document.getElementById('txtDataInicialEvento').value).format("MM-DD-YYYY"),
            "DataFinal": moment(document.getElementById('txtDataFinalEvento').value).format("MM-DD-YYYY"),
            "Status": "1"
        });
        console.log(objEvento);
        try {
            // Set the cursor to hourglass while waiting;
            document.body.style.cursor = 'wait';

            // Send AJAX request;
            await $.ajax({
                type: "post",
                url: "/api/Viagem/AdicionarEvento",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: objEvento,
                success: async function (data) {
                    try {
                        if (data.success) {
                            // Step 1: Wait for toastr to complete;
                            showToastrMessageSuccess(data.message);

                            // Step 2: Wait for PreencheListaEventos to complete if it's asynchronous
                            await PreencheListaEventos();

                            // Obtenha a instância do DropDownTree
                            var dropdownInstance = document.getElementById("lstEventos").ej2_instances[0];

                            // Crie um novo item seguindo a estrutura do DropDownTree
                            var newItem = {
                                id: data.eventoId,
                                name: data.eventoText
                            };

                            // Verifique se o dataSource já existe e é um array, caso contrário, inicialize como um array vazio
                            let updatedDataSource = Array.isArray(dropdownInstance.dataSource) ? dropdownInstance.dataSource : [];

                            // Adicione o novo item ao dataSource existente
                            updatedDataSource.push(newItem);

                            // Atualize o dataSource do DropDownTree
                            dropdownInstance.dataSource = updatedDataSource;

                            // Atualize o componente para refletir os novos dados
                            dropdownInstance.refresh();

                            // Atualize o valor para o item recém-adicionado após a atualização do dataSource
                            setTimeout(() => {
                                try {
                                    dropdownInstance.value = [String(newItem.id)];

                                    // Atualize o componente para garantir que as alterações sejam aplicadas
                                    dropdownInstance.dataBind();
                                } catch (error) {
                                    TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                                }
                            }, 500);

                            // Hide the accordion;
                            hideAccordionEvento();
                        } else {
                            // Step 1: Wait for toastr to complete;
                            showToastrMessageFailure(data.message);
                        }
                    } catch (error) {
                        /* CATCH ORIGINAL:
                        console.error("An error occurred during the success callback: ", error);
                         */
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                    }
                },
                error: function (data) {
                    try {
                        alert('error');
                        console.log(data);
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "error", error);
                    }
                }
            });
        } catch (error) {
            /* CATCH ORIGINAL:
            console.error("An error occurred: ", error);
             */
            TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
        } finally {
            // Restore the cursor after completion;
            document.body.style.cursor = 'default';
        }

        // ===================================================================
        // 🧠 Função: showToastrMessageSuccess
        // 📌 Descrição: Function to show toastr message and wait for it to complete;
        // 📤 Chama: [Nenhuma função chamada]
        // 📥 Chamado por: [Nenhuma função detectada]
        // ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
        // ===================================================================

        function showToastrMessageSuccess(message) {
            try {
                return new Promise(resolve => {
                    try {
                        toastr.success(message);
                        setTimeout(resolve, 2000); // Adjust timeout as needed;
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                    }
                });
            } catch (error) {
                /* CATCH ORIGINAL:
                TratamentoErroComLinha('agendamento_viagem<num>.js', 'showToastrMessageSuccess', error);
                 */
                TratamentoErroComLinha("agendamento_viagem<num>.js", "showToastrMessageSuccess", error);
            }
        }

        // ===================================================================
        // 🧠 Função: showToastrMessageFailure
        // 📌 Descrição: Função utilitária
        // 📤 Chama: [Nenhuma função chamada]
        // 📥 Chamado por: [Nenhuma função detectada]
        // ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
        // ===================================================================

        function showToastrMessageFailure(message) {
            try {
                return new Promise(resolve => {
                    try {
                        toastr.error(message);
                        setTimeout(resolve, 2000); // Adjust timeout as needed;
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                    }
                });
            } catch (error) {
                /* CATCH ORIGINAL:
                TratamentoErroComLinha('agendamento_viagem<num>.js', 'showToastrMessageFailure', error);
                 */
                TratamentoErroComLinha("agendamento_viagem<num>.js", "showToastrMessageFailure", error);
            }
        }
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'click', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

// Botão InserirRequisitante do Modal;
//===================================
$("#btnInserirRequisitante").click(function (e) {
    try {
        // if (InserindoRequisitante) {
        //     return;
        // } else {
        //     InserindoRequisitante = true;
        // }

        e.preventDefault();
        if ($("#txtPonto").val() === "") {
            Swal.fire({
                title: 'Atenção',
                text: "O Ponto do Requisitante é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar"
                }
            });
            return;
        }
        if ($("#txtNome").val() === "") {
            Swal.fire({
                title: 'Atenção',
                text: "O Nome do Requisitante é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar"
                }
            });
            return;
        }
        if ($("#txtRamal").val() === "") {
            Swal.fire({
                title: 'Atenção',
                text: "O Ramal do Requisitante é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar"
                }
            });
            return;
        }
        var setores = document.getElementById('ddtSetorRequisitante').ej2_instances[0];
        if (setores.value.toString() === '') {
            Swal.fire({
                title: 'Atenção',
                text: "O Setor do Requisitante é obrigatório!",
                icon: "error",
                buttons: true,
                dangerMode: true,
                buttons: {
                    close: "Fechar"
                }
            });
            return;
        }
        var setorSolicitanteId = setores.value.toString();
        var objRequisitante = JSON.stringify({
            "Nome": $('#txtNome').val(),
            "Ponto": $('#txtPonto').val(),
            "Ramal": $('#txtRamal').val(),
            "Email": $('#txtEmail').val(),
            "SetorSolicitanteId": setorSolicitanteId
        });

        //debugger;

        $.ajax({
            type: "post",
            url: "/api/Viagem/AdicionarRequisitante",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: objRequisitante,
            success: function (data) {
                try {
                    if (data.success) {
                        toastr.success(data.message);
                        document.getElementById("lstRequisitante").ej2_instances[0].addItem({
                            RequisitanteId: data.requisitanteid,
                            Requisitante: $('#txtNome').val() + " - " + $('#txtPonto').val()
                        }, 0);
                        hideAccordionRequisitante();
                        console.log("Passei por todas as etapas do Sucess do Adiciona Requisitante no AJAX");

                        // Access the ComboBox instance;
                        var comboBoxInstance = document.getElementById("lstRequisitante").ej2_instances[0];

                        // Set the desired value;
                        comboBoxInstance.value = data.requisitanteid; // Replace 'desiredValue' with the actual value;

                        // Refresh the ComboBox;
                        comboBoxInstance.dataBind();
                        console.log(data.requisitanteid);
                    } else {
                        toastr.error(data.message);
                    }
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "success", error);
                }
            },
            error: function (data) {
                try {
                    toastr.error("Já existe um requisitante com este ponto/nome");
                    console.log(data);
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "error", error);
                }
            }
        });
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'click', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

// Esconde o Accordion de Requisitante;
document.getElementById('btnFecharAccordionRequisitante').onclick = function () {
    try {
        hideAccordionRequisitante();
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
};

// Esconde o Accordion de Evento;
document.getElementById('btnFecharAccordionEvento').onclick = function () {
    try {
        hideAccordionEvento();
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
};
document.addEventListener("DOMContentLoaded", function () {
    try {
        // Initialize selectedDates array;
        let selectedDates = [];


        // ===================================================================
        // 🧠 Função: formatDate
        // 📌 Descrição: Function to format Date to dd/mm/yyyy;
        // 📤 Chama: [Nenhuma função chamada]
        // 📥 Chamado por: addDate, addDate
        // ✅ Status: Ativa
        // ===================================================================

        function formatDate(dateObj) {
            try {
                const day = ("0" + dateObj.getDate()).slice(-2);
                const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
                const year = dateObj.getFullYear();
                return `${day}/${month}/${year}`;
            } catch (error) {
                /* CATCH ORIGINAL:
                TratamentoErroComLinha('agendamento_viagem<num>.js', 'formatDate', error);
                 */
                TratamentoErroComLinha("agendamento_viagem<num>.js", "formatDate", error);
            }
        }

        // Initialize ListBox with a custom template;
        const listBox = new ej.dropdowns.ListBox({
            dataSource: selectedDates,
            height: "200px",
            itemTemplate: `
        <div class="normal-item" style="height: 50px; line-height: 50px; display: flex; align-items: center;">
            <button class="remove-btn" style="width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-left: 10px; background-color: red; border: none;" onclick="removeDate(\${Timestamp})">
                <i class="fas fa-trash-alt" style="font-size: 16px; color: white;"></i>
            </button>
            <span class="item-text" style="margin-left: 15px;">\${DateText}</span>
        </div>`,
            noRecordsTemplate: "Sem dias escolhidos.."
        });

        // Render the ListBox inside the #lstDiasCalendario element;
        listBox.appendTo("#lstDiasCalendario");


        // ===================================================================
        // 🧠 Função: addDate
        // 📌 Descrição: Function to add a date;
        // 📤 Chama: formatDate, updateBadge
        // 📥 Chamado por: [Nenhuma função detectada]
        // ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
        // ===================================================================

        function addDate(dateObj) {
            try {
                const timestamp = new Date(dateObj).setHours(0, 0, 0, 0); // Normalize time;
                if (!selectedDates.some(d => {
                    try {
                        return d.Timestamp === timestamp;
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                    }
                })) {
                    selectedDates.push({
                        Timestamp: timestamp,
                        DateText: formatDate(new Date(timestamp))
                    });
                    selectedDates.sort((a, b) => {
                        try {
                            return a.Timestamp - b.Timestamp;
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                        }
                    });
                    console.log("Adding date:", selectedDates); // Debugging statement;
                    listBox.dataSource = selectedDates;
                    listBox.dataBind(); // Update the ListBox;

                }
            } catch (error) {
                /* CATCH ORIGINAL:
                TratamentoErroComLinha('agendamento_viagem<num>.js', 'addDate', error);
                 */
                TratamentoErroComLinha("agendamento_viagem<num>.js", "addDate", error);
            }
        }

        // Initialize Calendar with multi-selection;
        const calendar = new ej.calendars.Calendar({
            showTodayconfirmButtonText: false,
            isMultiSelection: true,
            showTodayButton: false,
            isToday: false,
            values: selectedDates,
            change: onDateChange,
            min: new Date(),
            // Set minimum selectable date as the current date;
            // Set locale to Portuguese (Brazil)
            locale: "pt-BR",
            // Event handler for date selection;
            change: function (args) {
                try {
                    const selectedDatesArray = args.values;
                    selectedDates = [];
                    selectedDatesArray.forEach(d => {
                        try {
                            const normalizedTimestamp = new Date(d).setHours(0, 0, 0, 0);
                            selectedDates.push({
                                Timestamp: normalizedTimestamp,
                                DateText: formatDate(new Date(normalizedTimestamp))
                            });
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                        }
                    });
                    // Sort the selectedDates;
                    selectedDates.sort((a, b) => {
                        try {
                            return a.Timestamp - b.Timestamp;
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                        }
                    });
                    console.log("Selected dates changed:", selectedDates); // Debugging statement;
                    // Update ListBox dataSource;
                    listBox.dataSource = selectedDates;
                    listBox.dataBind();
                    // Update the Badge;
                    //updateBadge();

                    var totalItems = listBox.getDataList().length;

                    const badge1 = document.getElementById("itensBadge");
                    const badge2 = document.getElementById("itensBadgeHTML");

                    if (badge1) badge1.textContent = totalItems;
                    if (badge2) badge2.textContent = totalItems;

                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "change", error);
                }
            }
        });
        calendar.appendTo("#calDatasSelecionadas");
        var L10n = ej.base.L10n;
        L10n.load({
            "pt": {
                "calendar": {
                    "today": "Hoje"
                }
            }
        });
        calendar.locale = 'pt';

        // Function to remove a date;
        window.removeDate = function (timestamp) {
            try {
                selectedDates = selectedDates.filter(d => {
                    try {
                        return d.Timestamp !== timestamp;
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                    }
                });
                console.log("Removing date:", selectedDates); // Debugging statement;
                listBox.dataSource = selectedDates;
                listBox.dataBind();


                // Update Calendar selection;
                const calendarObj = document.getElementById("calDatasSelecionadas").ej2_instances[0];
                const dateToRemove = new Date(timestamp);

                // Get currently selected dates from calendar;
                let currentSelectedDates = calendarObj.values;

                // Remove the date from calendar if it exists;
                currentSelectedDates = currentSelectedDates.filter(date => {
                    try {
                        const normalizedDate = new Date(date).setHours(0, 0, 0, 0);
                        return normalizedDate !== timestamp;
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                    }
                });
                calendarObj.values = currentSelectedDates; // Set the updated list of selected dates;
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
            }
        };
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

// ===================================================================
// 🧠 Função: onDateChange
// 📌 Descrição: Função chamada quando há alteração nas datas selecionadas;
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: [Nenhuma função detectada]
// ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
// ===================================================================

function onDateChange(args) {
    try {
        // Atualiza a lista de datas selecionadas;
        selectedDates = args.values;
    } catch (error) {
        /* CATCH ORIGINAL:
        TratamentoErroComLinha('agendamento_viagem<num>.js', 'onDateChange', error);
         */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "onDateChange", error);
    }
}

// Create the data source;
var dataRecorrente = [{
    text: 'Sim',
    value: 'S'
}, {
    text: 'Não',
    value: 'N'
}];

// Initialize the DropDownList component;
var dropDownListRecorrente = new ej.dropdowns.DropDownList({
    // Set the data source;
    dataSource: dataRecorrente,
    // Map fields;
    fields: {
        text: 'text',
        value: 'value'
    },
    // Set the default value to "Não"
    value: 'N',
    // Optional: Add placeholder text;
    placeholder: 'Selecione uma opção',
    // Add the change event handler;
    change: function (e) {
        try {
            // Acessar o valor e o texto selecionados
            var selectedValue = e.value;
            var selectedText = '';

            // Verificar se itemData não é null antes de acessar a propriedade 'text'
            if (e.itemData && e.itemData.text != null) {
                selectedText = e.itemData.text;
            }

            // Perform your logic here;
            console.log('Selected Value:', selectedValue);
            console.log('Selected Text:', selectedText);
            document.getElementById("lstPeriodos").ej2_instances[0].value = "";
            document.getElementById("lstDias").ej2_instances[0].value = "";
            document.getElementById('txtFinalRecorrencia').value = '';
            document.getElementById('calDatasSelecionadas').ej2_instances[0].value = null;
            var listBox = document.getElementById("lstDiasCalendario").ej2_instances[0];
            listBox.dataSource = [];
            document.getElementById("itensBadge").textContent = 0;
            if (selectedValue === 'S') {

                //Verifica se não está carregando a tela
                if (document.getElementById("divTxtPeriodo").style.display != "block") {
                    document.getElementById("divPeriodo").style.display = "block";
                    document.getElementById("divDias").style.display = "none";
                    document.getElementById("divDiaMes").style.display = "none";
                    document.getElementById("divFinalRecorrencia").style.display = "none";
                    document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
                    var calendarContainer = document.getElementById("calendarContainer");
                    calendarContainer.style.display = "none";
                    var listboxContainer = document.getElementById("listboxContainer");
                    listboxContainer.style.display = "none";
                }
            } else {
                document.getElementById("divPeriodo").style.display = "none";
                document.getElementById("divDias").style.display = "none";
                document.getElementById("divDiaMes").style.display = "none";
                document.getElementById("divFinalRecorrencia").style.display = "none";
                document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
                var calendarContainer = document.getElementById("calendarContainer");
                calendarContainer.style.display = "none";
                var listboxContainer = document.getElementById("listboxContainer");
                listboxContainer.style.display = "none";
            }
        } catch (error) {
            TratamentoErroComLinha("agendamento_viagem<num>.js", "change", error);
        }
    }
});
// Render the DropDownList;
dropDownListRecorrente.appendTo('#lstRecorrente');

// Create the data source;
var data = [{
    text: 'Diário',
    value: 'D'
}, {
    text: 'Semanal',
    value: 'S'
}, {
    text: 'Quinzenal',
    value: 'Q'
}, {
    text: 'Mensal',
    value: 'M'
}, {
    text: 'Dias Variados',
    value: 'V'
}];

// Initialize the DropDownList component;
var dropDownListObject = new ej.dropdowns.DropDownList({
    // Set the data source;
    dataSource: data,
    // Map fields;
    fields: {
        text: 'text',
        value: 'value'
    },
    // Set the default value to null (no selection)
    value: null,
    // Add placeholder text;
    placeholder: 'Selecione um período',
    // Add the change event handler;
    change: function (e) {
        try {
            var selectedValue = e.value || ''; // Handle null or undefined values;

            document.getElementById("lstDias").ej2_instances[0].value = "";
            document.getElementById('txtFinalRecorrencia').ej2_instances[0].value = '';
            document.getElementById('calDatasSelecionadas').ej2_instances[0].value = null;
            var listBox = document.getElementById("lstDiasCalendario").ej2_instances[0];
            listBox.dataSource = [];
            document.getElementById("itensBadge").textContent = 0;
            if (document.getElementById("lstPeriodos").ej2_instances[0].enabled === true) {
                if (selectedValue === '') {
                    document.getElementById("divDias").style.display = "none";
                    document.getElementById("divDiaMes").style.display = "none";
                    document.getElementById("divFinalRecorrencia").style.display = "none";
                    document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
                    var calendarContainer = document.getElementById("calendarContainer");
                    calendarContainer.style.display = "none";
                    var listboxContainer = document.getElementById("listboxContainer");
                    listboxContainer.style.display = "none";
                } else if (selectedValue === 'V') {
                    var calendarContainer = document.getElementById("calendarContainer");
                    calendarContainer.style.display = "block";
                    var listboxContainer = document.getElementById("listboxContainer");
                    listboxContainer.style.display = "block";
                    document.getElementById("divDias").style.display = "none";
                    document.getElementById("divDiaMes").style.display = "none";
                    document.getElementById("divFinalRecorrencia").style.display = "none";
                    document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
                } else if (selectedValue === 'D') {
                    document.getElementById("divDias").style.display = "none";
                    document.getElementById("divDiaMes").style.display = "none";
                    document.getElementById("divFinalRecorrencia").style.display = "block";
                    document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
                    var calendarContainer = document.getElementById("calendarContainer");
                    calendarContainer.style.display = "none";
                    var listboxContainer = document.getElementById("listboxContainer");
                    listboxContainer.style.display = "none";
                } else if (selectedValue === 'M') {
                    document.getElementById("divDias").style.display = "none";
                    document.getElementById("divDiaMes").style.display = "block";
                    document.getElementById("divFinalRecorrencia").style.display = "block";
                    document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
                    var calendarContainer = document.getElementById("calendarContainer");
                    calendarContainer.style.display = "none";
                    var listboxContainer = document.getElementById("listboxContainer");
                    listboxContainer.style.display = "none";
                } else {
                    document.getElementById("divDias").style.display = "block";
                    document.getElementById("divDiaMes").style.display = "none";
                    document.getElementById("divFinalRecorrencia").style.display = "block";
                    document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
                    var calendarContainer = document.getElementById("calendarContainer");
                    calendarContainer.style.display = "none";
                    var listboxContainer = document.getElementById("listboxContainer");
                    listboxContainer.style.display = "none";
                }
            } else {
                // Initialize the Syncfusion TextBox component;
                var textbox = new ej.inputs.TextBox({
                    enabled: false // Desabilita o campo de entrada;
                });
                // Render the TextBox;
                textbox.appendTo('#txtDataFinalRecorrencia');
            }
        } catch (error) {
            TratamentoErroComLinha("agendamento_viagem<num>.js", "change", error);
        }
    }
});
// Render the DropDownList;
dropDownListObject.appendTo('#lstPeriodos');

/// Initialize the MultiSelect component;
document.addEventListener("DOMContentLoaded", function () {
    try {
        // Initialize the MultiSelect component after the DOM is ready;
        var multiSelect = new ej.dropdowns.MultiSelect({
            placeholder: 'Selecione os dias...',
            dataSource: [, {
                id: "Monday",
                name: "Segunda"
            }, {
                    id: "Tuesday",
                    name: "Terça"
                }, {
                    id: "Wednesday",
                    name: "Quarta"
                }, {
                    id: "Thursday",
                    name: "Quinta"
                }, {
                    id: "Friday",
                    name: "Sexta"
                }, {
                    id: "Saturday",
                    name: "Sábado"
                }, {
                    id: "Sunday",
                    name: "Domingo"
                }],
            fields: {
                text: 'name',
                value: 'id'
            },
            maximumSelectionLength: 7,
            change: function (args) {
                try {
                    let itemValue = args.item ? args.item.value : null;
                    if (itemValue && multiSelect.value.includes(itemValue)) {
                        multiSelect.value = multiSelect.value.filter(value => {
                            try {
                                return value !== itemValue;
                            } catch (error) {
                                TratamentoErroComLinha("agendamento_viagem<num>.js", "(arrow)", error);
                            }
                        });
                        multiSelect.dataBind(); // Apply the changes;
                    }
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "change", error);
                }
            }
        });
        // Append the MultiSelect component to the div with id lstDias;
        multiSelect.appendTo('#lstDias');
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

/// Inicializa o DatePicker da Syncfusion;
document.addEventListener("DOMContentLoaded", function () {
    try {
        // Obtendo a data atual;
        let hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        // Inicializando o DatePicker da Syncfusion;
        new ej.calendars.DatePicker({
            min: hoje,
            // Definindo a data mínima como a data atual;
            strictMode: false,
            format: 'dd/MM/yyyy',
            placeholder: ""
        }, '#txtFinalRecorrencia');

        // Inicializando o DatePicker da Syncfusion sem definir o valor inicial;
        let datePicker = new ej.calendars.DatePicker({
            min: hoje,
            // Definindo a data mínima como a data atual;
            format: 'dd/MM/yyyy',
            focus: function (event) {
                try {
                    console.log("DatePicker focused!");
                    console.log(event);
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "focus", error);
                }
            },
            change: function (event) {
                try {
                    // Obtendo a data selecionada no primeiro DatePicker
                    let dataSelecionada = event.value;

                    // Atualizando a data mínima do segundo DatePicker
                    datePickerFinal.min = dataSelecionada;
                } catch (error) {
                    TratamentoErroComLinha("agendamento_viagem<num>.js", "change", error);
                }
            }
        }, '#txtDataInicial');
        setTimeout(function () {
            try {
                datePicker.value = hoje;
            } catch (error) {
                TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
            }
        }, 100); // Ajuste o valor após 100 ms para garantir que o componente foi carregado

        // Definindo o valor após a inicialização;
        datePicker.value = hoje;

        // Inicializando o segundo DatePicker da Syncfusion
        let datePickerFinal = new ej.calendars.DatePicker({
            min: hoje,
            // Definindo a data mínima como a data atual;
            format: 'dd/MM/yyyy'
        }, '#txtDataFinal');

        // Inicializa o TextBox da Syncfusion;
        var textBox = new ej.inputs.TextBox({
            placeholder: 'Selecione a data' // Opcional: adicione um placeholder;
        });
        textBox.appendTo('#txtDataFinalRecorrencia');
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

//Editor de Texto;
let rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];

/// Adiciona o evento de paste ao editor;
rteDescricao.addEventListener('paste', function (event) {
    try {
        var clipboardData = event.clipboardData;

        // Verifica se há uma imagem no clipboard;
        if (clipboardData && clipboardData.items) {
            var items = clipboardData.items;

            // Itera sobre os itens do clipboard e verifica se há um item de imagem;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                // Verifica se o item é uma imagem (tipo de mídia "image/png" ou "image/jpeg")
                if (item.type.indexOf("image") !== -1) {
                    var blob = item.getAsFile();
                    var reader = new FileReader();

                    // Quando o FileReader terminar de ler a imagem, converta para Base64;
                    reader.onloadend = function () {
                        try {
                            // Obtém a string Base64 da imagem;
                            var base64Image = reader.result.split(',')[1];

                            // Construa o HTML com a imagem embutida em Base64;
                            var pastedHtml = `<img src="data:image/png;base64,${base64Image}" />`;

                            // Insira a imagem no editor usando o HTML formatado com Base64;
                            editor.insertHtml(pastedHtml); // Insere diretamente a imagem no editor;
                        } catch (error) {
                            TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
                        }
                    };

                    // Lê o arquivo como Base64;
                    reader.readAsDataURL(blob);
                    break; // Interrompe a iteração após encontrar a primeira imagem;
                }
            }
        }
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "(anonymous)", error);
    }
});

// Render the Syncfusion DropDownList control
var dias = [];
for (var i = 1; i <= 31; i++) {
    dias.push({
        text: i.toString(),
        value: i
    }); // Deixe value como inteiro
}

//// Create the data source for the DropDownList;
var dropdownObj = new ej.dropdowns.DropDownList({
    // Set the data source
    dataSource: dias,
    // Map text and value fields
    fields: {
        text: 'text',
        value: 'value'
    },
    // Set the float label type to "Always" for consistent label display
    floatLabelType: 'Always'
});
// Append the dropdown to the target element
dropdownObj.appendTo('#lstDiasMes');

// ===================================================================
// 🧠 Função: validarDatas
// 📌 Descrição: Valida dados do formulário ou regras de negócio
// 📤 Chama: parseDate
// 📥 Chamado por: ValidaCampos
// ✅ Status: Ativa
// ===================================================================

async function validarDatas() {
    try {
        const txtDataInicial = $('#txtDataInicial').val();
        const txtDataFinal = $('#txtDataFinal').val();

        if (!txtDataFinal || !txtDataInicial) return true;

        const dtInicial = parseDate(txtDataInicial);
        const dtFinal = parseDate(txtDataFinal);

        dtInicial.setHours(0, 0, 0, 0);
        dtFinal.setHours(0, 0, 0, 0);

        const diferenca = (dtFinal - dtInicial) / (1000 * 60 * 60 * 24);

        if (diferenca >= 5) {
            const result = await Swal.fire({
                title: '⚠️ Atenção',
                text: 'A Data Final está 5 dias ou mais após a Inicial. Tem certeza?',
                icon: 'warning',
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                showCancelButton: true,
                confirmButtonText: 'Tenho certeza! 💪🏼',
                cancelButtonText: 'Me enganei! 😟',
                customClass: { popup: 'custom-popup' },
                heightAuto: false,
                willOpen: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').hide();
                        $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                        $('.swal2-backdrop-show').css('z-index', 9998);
                        Swal.getPopup().focus();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "willOpen", error);
                    }
                },
                didClose: () => {
                    try {
                        $('.modal-backdrop').css('z-index', '1040').show();
                    } catch (error) {
                        TratamentoErroComLinha("agendamento_viagem<num>.js", "didClose", error);
                    }
                }
            });

            if (!result.isConfirmed) {
                $('#txtDataFinal').val('');
                $('#txtDataFinal').focus();
                return false;
            }
        }

        return true;
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "validarDatas", error);
        return false;
    }
}

// ===================================================================
// 🧠 Função: validarQuilometragem
// 📌 Descrição: Valida dados do formulário ou regras de negócio
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: ValidaCampos
// ✅ Status: Ativa
// ===================================================================

async function validarQuilometragem() {
    try {
        const txtKmInicialElement = document.getElementById("txtKmInicial");
        const txtKmFinalElement = document.getElementById("txtKmFinal");
        const txtKmInicial = txtKmInicialElement.value;
        const txtKmFinal = txtKmFinalElement.value;

        if (txtKmInicial === "") {
            await Swal.fire({
                title: "⚠️ Atenção",
                text: "A quilometragem inicial é obrigatória",
                icon: "error",
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: { popup: 'custom-popup' },
                confirmButtonText: 'OK',
                heightAuto: false,
                didOpen: () => {
                    $('.modal-backdrop').hide().css('z-index', '1040');
                    $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                    $('.swal2-backdrop-show').css('z-index', 9998);
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    $('.modal-backdrop').show().css('z-index', '1040');
                }
            });
            return false;
        }

        if (txtKmFinal !== "") {
            const kmInicial = parseFloat(txtKmInicial.replace(",", "."));
            const kmFinal = parseFloat(txtKmFinal.replace(",", "."));

            if (!isNaN(kmInicial) && !isNaN(kmFinal)) {
                const diferencaKm = kmFinal - kmInicial;
                if (diferencaKm >= 100) {
                    const result = await Swal.fire({
                        title: '⚠️ Atenção',
                        text: 'A quilometragem final está 100 km ou mais acima da inicial. Tem certeza?',
                        icon: 'warning',
                        iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                        showCancelButton: true,
                        confirmButtonText: 'Tenho certeza!',
                        cancelButtonText: 'Me enganei!',
                        customClass: { popup: 'custom-popup' },
                        heightAuto: false,
                        didOpen: () => {
                            $('.modal-backdrop').hide().css('z-index', '1040');
                            $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                            $('.swal2-backdrop-show').css('z-index', 9998);
                            Swal.getPopup().focus();
                        },
                        didClose: () => {
                            $('.modal-backdrop').show().css('z-index', '1040');
                        }
                    });

                    if (!result.isConfirmed) {
                        txtKmFinalElement.value = "";
                        txtKmFinalElement.focus();
                        return false;
                    }
                }
            }
        }

        return true;
    } catch (error) {
        TratamentoErroComLinha("agendamento_viagem<num>.js", "validarQuilometragem", error);
        return false;
    }
}

// ===================================================================
// 🧠 Função: parseDate
// 📌 Descrição: Função utilitária
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: validarDatas
// ✅ Status: Ativa
// ===================================================================

function parseDate(d) {
    try {
        if (!d) return null;

        // Se já for um objeto Date válido, retorna direto
        if (d instanceof Date && !isNaN(d)) {
            return d;
        }

        // Garante que seja string
        const s = String(d).trim();

        // Se vier no formato "dd/MM/yyyy"
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
            const [dia, mes, ano] = s.split('/');
            return new Date(Number(ano), Number(mes) - 1, Number(dia));
        }

        // Se vier no formato "yyyy-MM-dd"
        if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
            const [ano, mes, dia] = s.split('-');
            return new Date(Number(ano), Number(mes) - 1, Number(dia));
        }

        // Tenta parse genérico (ex.: "Thu May 22 2025 …")
        const parsed = Date.parse(s);
        if (!isNaN(parsed)) {
            return new Date(parsed);
        }

        return null; // formato desconhecido
    } catch (error) {
        /* CATCH ORIGINAL:
        // …código anterior comentado…
        */
        TratamentoErroComLinha("agendamento_viagem<num>.js", "parseDate", error);
        return null;
    }
}

// ===================================================================
// 🧠 Função: calcularDistanciaViagem
// 📌 Descrição: Função utilitária
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: ExibeViagem
// ✅ Status: Ativa
// ===================================================================

function calcularDistanciaViagem() {
    try {
        const kmInicialStr = $("#txtKmInicial").val();
        const kmFinalStr = $("#txtKmFinal").val();

        if (!kmInicialStr || !kmFinalStr) {
            $('#txtKmPercorrido').val('');
            return;
        }

        const kmInicial = parseFloat(kmInicialStr.replace(',', '.'));
        const kmFinal = parseFloat(kmFinalStr.replace(',', '.'));

        if (isNaN(kmInicial) || isNaN(kmFinal)) {
            $('#txtKmPercorrido').val('');
            return;
        }

        const kmPercorrido = Math.round(kmFinal - kmInicial);
        $('#txtQuilometragem').val(kmPercorrido);

        //    if (kmPercorrido > 100) {
        //        Alerta.Alerta("⚠️ Alerta na Quilometragem", "A quilometragem final excede em 100km a inicial!");
        //    }
    } catch (error) {
        TratamentoErroComLinha("Viagem_050", "calcularDistanciaViagem", error);
    }
}

$("#txtNoFichaVistoria").focusout(function () {
    try {
        let noFicha = $("#txtNoFichaVistoria").val();
        if (noFicha === '') return;

        $.ajax({
            url: "/Viagens/Upsert?handler=VerificaFicha",
            method: "GET",
            datatype: "json",
            data: { id: noFicha },
            success: function (res) {
                let maxFicha = parseInt(res.data);
                if (noFicha > maxFicha + 100 || noFicha < maxFicha - 100) {
                    swal({
                        title: "Alerta na Ficha de Vistoria",
                        text: "O número inserido difere em ±100 da última Ficha inserida!",
                        icon: "warning",
                        dangerMode: true,
                        buttons: { ok: "Ok" }
                    });
                }
            }
        });

        $.ajax({
            url: "/Viagens/Upsert?handler=FichaExistente",
            method: "GET",
            datatype: "json",
            data: { id: noFicha },
            success: function (res) {
                if (res.data === true) {
                    swal({
                        title: "Alerta na Ficha de Vistoria",
                        text: "Já existe uma Ficha inserida com esta numeração!",
                        icon: "warning",
                        dangerMode: true,
                        buttons: { ok: "Ok" }
                    });
                }
            }
        });

    } catch (error) {
        TratamentoErroComLinha("Viagem_050", "focusout.txtNoFichaVistoria", error);
    }
});

// ===================================================================
// 🧠 Função: validarDatasInicialFinal
// 📌 Descrição: Valida dados do formulário ou regras de negócio
// 📤 Chama: parseData
// 📥 Chamado por: [Nenhuma função detectada]
// ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
// ===================================================================

async function validarDatasInicialFinal(DataInicial, DataFinal) {
    try {
        //function parseData(data) {
        //    if (!data) return null;
        //    if (data instanceof Date) return new Date(data.getTime());

        //    // Se for string, trata os dois formatos
        //    if (typeof data === 'string') {
        //        if (data.includes('/')) {
        //            const [dia, mes, ano] = data.split('/');
        //            return new Date(Date.UTC(ano, mes - 1, dia));
        //        } else if (data.includes('-')) {
        //            const [ano, mes, dia] = data.split('-');
        //            return new Date(Date.UTC(ano, mes - 1, dia));
        //        }
        //    }
        //    return null;
        //}

        const dtIni = parseData(DataInicial);
        const dtFim = parseData(DataFinal);

        if (!dtIni || !dtFim || isNaN(dtIni) || isNaN(dtFim)) return true;

        const diff = (dtFim - dtIni) / (1000 * 60 * 60 * 24);

        if (diff >= 5) {
            const result = await Swal.fire({
                title: '⚠️ Atenção',
                text: 'A Data Final está 5 dias ou mais após a Inicial. Tem certeza?',
                icon: 'warning',
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                showCancelButton: true,
                confirmButtonText: 'Tenho certeza! 💪🏼',
                cancelButtonText: 'Me enganei! 😟',
                customClass: { popup: 'custom-popup' },
                heightAuto: false,
                didOpen: () => {
                    $('.modal-backdrop').hide().css('z-index', '1040');
                    $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                    $('.swal2-backdrop-show').css('z-index', 9998);
                    Swal.getPopup().focus();
                },
            });

            if (!result.isConfirmed) {
                const txtDataFinalElement = document.getElementById("txtDataFinal");
                txtDataFinalElement.value = null;
                txtDataFinalElement.focus();
                return false;
            }
        }

        return true;

    } catch (error) {
        TratamentoErroComLinha("ValidadorData", "validarDatasInicialFinal", error);
        return false;
    }
}

// ===================================================================
// 🧠 Função: validarKmInicialFinal
// 📌 Descrição: Valida dados do formulário ou regras de negócio
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: ValidaCampos
// ✅ Status: Ativa
// ===================================================================

async function validarKmInicialFinal() {
    try {
        const kmInicial = $('#txtKmInicial').val();
        const kmFinal = $('#txtKmFinal').val();

        if (!kmInicial || !kmFinal) return true;

        const ini = parseFloat(kmInicial.replace(",", "."));
        const fim = parseFloat(kmFinal.replace(",", "."));

        if (fim < ini) {
            Alerta.Erro("Erro", "A quilometragem final deve ser maior que a inicial.");
            return false;
        }

        const diff = fim - ini;
        if (diff > 100) {
            const confirmado = await Swal.fire({
                title: "Quilometragem Alta",
                html: "A quilometragem <strong>final</strong> excede em 100km a <strong>inicial</strong>. Tem certeza?",
                icon: 'warning',
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                showCancelButton: true,
                confirmButtonText: "Tenho certeza! 💪🏼",
                cancelButtonText: "Me enganei! 😟",
                customClass: { popup: 'custom-popup' },
                heightAuto: false,
                didOpen: () => {
                    $('.modal-backdrop').hide().css('z-index', '1040');
                    $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                    $('.swal2-backdrop-show').css('z-index', 9998);
                    Swal.getPopup().focus();
                }
            });

            if (!confirmado.isConfirmed) {
                const txtKmFinalElement = document.getElementById("txtKmFinal");
                txtKmFinalElement.value = null;
                txtKmFinalElement.focus();
                return false;
            }
        }

        return true;
    } catch (error) {
        TratamentoErroComLinha("Viagem_050", "validarKmInicialFinal", error);
        return false;
    }
}

// ===================================================================
// 🧠 Função: validarKmAtualFinal
// 📌 Descrição: Valida dados do formulário ou regras de negócio
// 📤 Chama: [Nenhuma função chamada]
// 📥 Chamado por: [Nenhuma função detectada]
// ⛔ Status: <<<<<< ⛔ FUNÇÃO EM DESUSO ⛔ >>>>>>
// ===================================================================

async function validarKmAtualFinal() {
    try {
        const kmInicial = $('#txtKmInicial').val();
        const kmAtual = $('#txtKmAtual').val();

        if (!kmInicial || !kmAtual) return true;

        const ini = parseFloat(kmAtual.replace(",", "."));
        const fim = parseFloat(kmFinal.replace(",", "."));

        if (fim < ini) {
            Alerta.Erro("Erro", "A quilometragem <strong>inicial</strong> deve ser maior que a <strong>atual</strong>.");
            return false;
        }

        const diff = fim - ini;
        if (diff > 100) {

            const confirmado = await Swal.fire({
                title: "Quilometragem Alta",
                html: "A quilometragem <strong>inicial</strong> excede em 100km a <strong>atual</strong>. Tem certeza?",
                icon: 'warning',
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                showCancelButton: true,
                confirmButtonText: "Tenho certeza! 💪🏼",
                cancelButtonText: "Me enganei! 😟'",
                customClass: { popup: 'custom-popup' },
                heightAuto: false,
                didOpen: () => {
                    $('.modal-backdrop').hide().css('z-index', '1040');
                    $('.swal2-container').css({ 'z-index': 9999, 'position': 'fixed' });
                    $('.swal2-backdrop-show').css('z-index', 9998);
                    Swal.getPopup().focus();
                }
            });

            if (!confirmado.isConfirmed) {
                const txtKmInicialElement = document.getElementById("txtKmInicial");
                txtKmInicialElement.value = null;
                txtKmInicialElement.focus();
                return false;
            }
        }

        return true;
    } catch (error) {
        TratamentoErroComLinha("Viagem_050", "validarKmAtualInicial", error);
        return false;
    }
}

// ===================================================================
// 🧠 Função: calcularDuracaoViagem
// 📌 Descrição: Função utilitária
// 📤 Chama: parseDataHora
// 📥 Chamado por: InitializeCalendar
// ✅ Status: Ativa
// ===================================================================

function calcularDuracaoViagem() {
    try {
        const dataInicialStr = $('#txtDataInicial').val();
        const horaInicialStr = $('#txtHoraInicial').val();
        const dataFinalStr = $('#txtDataFinal').val();
        const horaFinalStr = $('#txtHoraFinal').val();

        if (!dataInicialStr || !horaInicialStr || !dataFinalStr || !horaFinalStr) {
            $('#txtDuracao').val('');
            return;
        }

        const parseDataHora = (data, hora) => {
            if (data.includes('/')) {
                const [dia, mes, ano] = data.split('/');
                return new Date(`${ano}-${mes}-${dia}T${hora}`);
            } else if (data.includes('-')) {
                return new Date(`${data}T${hora}`);
            } else {
                return null;
            }
        };

        const dtInicial = parseDataHora(dataInicialStr, horaInicialStr);
        const dtFinal = parseDataHora(dataFinalStr, horaFinalStr);

        if (!dtInicial || !dtFinal || dtFinal <= dtInicial) {
            $('#txtDuracao').val('');
            return;
        }

        const diffMs = dtFinal - dtInicial;
        const diffHoras = (diffMs / (1000 * 60 * 60)).toFixed(2);

        $('#txtDuracao').val(Math.round(diffHoras));

    } catch (error) {
        TratamentoErroComLinha("CalculoDuracao", "calcularDuracaoViagem", error);
    }
}


