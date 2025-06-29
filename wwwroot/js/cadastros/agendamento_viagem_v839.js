// Corrige a duplicação de registros no agendamento;

let viagemId_AJAX = '';
let viagemId = '';
let recorrenciaViagemId = '';
let recorrenciaViagemId_AJAX = '';
let dataInicial_List = '';
let dataInicial = '';
let agendamentosRecorrentes = [];
let editarTodosRecorrentes = false;
let transformandoEmViagem = false;

// Atualização na função btnConfirma para uso do arquivo v551 quando periodoRecorrente === 'V'
let isSubmitting = false;

$("#btnConfirma").off("click").on("click", async function (event) {
    event.preventDefault();
    dataInicial = moment(document.getElementById("txtDataInicial").ej2_instances[0].value).toISOString().split('T')[0]

    if ($(this).prop("disabled")) {
        console.log("Botão já desabilitado, evitando chamada duplicada.");
        return;
    }

    $(this).prop("disabled", true);
    const periodoRecorrente = document.getElementById("lstPeriodos").ej2_instances[0].value;

    try {
        if (!viagemId) {
            // Adicionar novo agendamento;
            if (periodoRecorrente === 'M') {
                // Correção: Ajustar lógica para evitar duplicação de datas
                const datasRecorrentes = ajustarDataInicialRecorrente(periodoRecorrente);
                const datasUnicas = [...new Set(datasRecorrentes)]; // Remover datas duplicadas
                await handleRecurrence(periodoRecorrente, datasUnicas);
                exibirMensagemSucesso();
            } else {
                // Lógica existente para outros tipos de recorrência
                const datasRecorrentes = ajustarDataInicialRecorrente(periodoRecorrente);
                await handleRecurrence(periodoRecorrente, datasRecorrentes);
                exibirMensagemSucesso();
            }
        }

        else if (viagemId != null && viagemId != '' && $("#btnConfirma").text() === 'Registra Viagem') {
            // Grava Viagem a Partir do Agendamento

            transformandoEmViagem = true;

            if (ValidaCampos(viagemId)) {

                try {
                    // Lógica para transformar o Agendamento em uma Viagem
                    const agendamentoUnicoAlterado = await recuperarViagemEdicao(viagemId);
                    let objViagem = criarAgendamentoViagem(agendamentoUnicoAlterado);
                    const response = await fetch('/api/Agenda/Agendamento', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(objViagem)
                    });

                    const data = await response.json();

                    if (data.novaViagem) {
                        toastr.success("Viagem Criada com Sucesso");
                    } else {
                        toastr.error("Erro ao Criar Viagem");
                    }

                    // SweetAlert chamado dentro do bloco try, após a edição ser bem-sucedida
                    Swal.fire({
                        iconHtml: '<img src="/images/barbudo.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                        customClass: {
                            popup: 'custom-popup',
                        },
                        title: 'Sucesso',
                        text: 'Viagem Criada com Sucesso.',
                        icon: 'success',
                        confirmButtonText: 'Ok',
                        backdrop: true,
                        heightAuto: false,
                        didOpen: () => {
                            $('.modal-backdrop').css('z-index', '1040').hide();
                            $('.swal2-container').css({
                                'z-index': 9999,
                                'position': 'fixed',
                            });
                            $('.swal2-backdrop-show').css('z-index', 9998);
                            Swal.getPopup().focus();
                        },
                        didClose: () => {
                            $('#modalViagens').modal('hide');
                            $('.modal-backdrop').css('z-index', '1040').show();
                        }
                    });

                } catch (error) {
                    console.error("Erro ao editar o agendamento:", error);
                    alert('something went wrong');
                }

            }

        }

        else
        {

            // Editar agendamento existente

            try {
                const objViagem = await recuperarViagemEdicao(viagemId);
                console.log(objViagem);

                if (objViagem.recorrente === "S") {

                    const result = await Swal.fire({
                        iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                        customClass: {
                            popup: 'custom-popup',
                        },
                        title: 'Editar Agendamento Recorrente',
                        text: 'Deseja aplicar as alterações a todos os agendamentos recorrentes ou apenas ao atual?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Todos',
                        cancelButtonText: 'Apenas Atual',
                        backdrop: true,
                        heightAuto: false,
                        didOpen: () => {
                            // Garantir que todos os backdrops e modais relacionados ao modal estejam ocultos;
                            $('.modal-backdrop').css('z-index', '1040').hide(); // Ocultar o backdrop do Bootstrap;

                            // Definir z-index para o container e backdrop do SweetAlert2;
                            $('.swal2-container').css({
                                'z-index': 9999, // Maior valor de z-index possível;
                                'position': 'fixed', // Garantir que esteja posicionado corretamente;
                            });

                            $('.swal2-backdrop-show').css('z-index', 9998); // Logo abaixo da janela de alerta;

                            // Focar no SweetAlert2 para evitar interferências dos modais;
                            Swal.getPopup().focus();
                        },
                        didClose: () => {
                            // Restaurar o backdrop do Bootstrap após o fechamento do SweetAlert;
                            $('.modal-backdrop').css('z-index', '1040').show();
                        }
                    });

                    //const result = await Swal.fire({
                    //    title: 'Editar agendamento',
                    //    text: 'Deseja editar apenas o agendamento atual ou todos os próximos?',
                    //    icon: 'question',
                    //    showCancelButton: true,
                    //    confirmButtonText: 'Apenas o atual',
                    //    cancelButtonText: 'Todos os próximos',
                    //});

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
                console.error('Erro ao recuperar viagem para edição:', error);
            }



        
        }
    } catch (error) {
        console.error("Erro ao processar agendamento:", error);
        Swal.fire({
            title: 'Erro',
            text: 'Erro ao processar o agendamento.',
            icon: 'error',
            confirmButtonText: 'Ok',
        });
    } finally {
        $(this).prop("disabled", false);
    }
});
//function obterAgendamento(viagemId) {
//    var url = '/api/Agenda/ObterAgendamento';
//    $.ajax({
//        url: url,
//        type: "GET",
//        data: { 'viagemId': viagemId },
//        contentType: "application/json; charset=utf-8",
//        dataType: "json",
//        success: function (data) {
//            if (data.success) {
//                toastr.success(data.message);
//            }
//            else {
//                toastr.error(data.message);
//            }
//            return data;
//        },
//        error: function (err) {
//            console.log(err)
//            alert('something went wrong')
//        }
//    });
//}

// Função para obter os agendamentos recorrentes, retornando uma Promise
async function obterAgendamentosRecorrenteInicial(viagemId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'api/Agenda/ObterAgendamentoEdicaoInicial',
            type: 'GET',
            contentType: 'application/json',
            data: { viagemId: viagemId },
            success: function (data) {
                console.log("Requisição AJAX bem-sucedida, dados recebidos:", data);
                resolve(data);
            },
            error: function (err) {
                console.error("Erro na requisição AJAX:", err);
                alert('Algo deu errado');
                reject(err);
            }
        });
    });
}

// Função para obter os agendamentos recorrentes, retornando uma Promise
async function obterAgendamentosRecorrentes(recorrenciaViagemId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'api/Agenda/ObterAgendamentoExclusao',
            type: 'GET',
            contentType: 'application/json',
            data: { recorrenciaViagemId: recorrenciaViagemId },
            success: function (data) {
                console.log("Requisição AJAX bem-sucedida, dados recebidos:", data);
                resolve(data);
            },
            error: function (err) {
                console.error("Erro na requisição AJAX:", err);
                alert('Algo deu errado');
                reject(err);
            }
        });
    });
}


async function editarAgendamentoRecorrente(viagemId, editaTodos, dataInicialRecorrencia, recorrenciaViagemId, editarAgendamentoRecorrente) {
    if (!viagemId) {
        throw new Error("ViagemId não fornecido.");
    }

    try {
        if (editaTodos) {
            // Lógica para editar todos os agendamentos recorrentes

            //Se for o primeiro registro da série
            if (recorrenciaViagemId === '00000000-0000-0000-0000-000000000000')
            {
                recorrenciaViagemId = viagemId

                const [agendamentoRecorrente = {}] = await obterAgendamentosRecorrenteInicial(viagemId);

                let objViagem = criarAgendamentoEdicao(agendamentoRecorrente);
                objViagem.editarTodosRecorrentes = true;
                objViagem.editarAPartirData = dataInicial;
                const response = await fetch('/api/Agenda/Agendamento', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(objViagem),
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

                if (agendamentoRecorrente.dataInicial >= dataInicialRecorrencia)
                {
                    let objViagem = criarAgendamentoEdicao(agendamentoRecorrente);
                    //objViagem.editarTodosRecorrentes = true;
                    //objViagem.editarAPartirData = dataInicial;
                    const response = await fetch('/api/Agenda/Agendamento', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(objViagem),
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
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(objViagem),
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
                popup: 'custom-popup',
            },
            title: 'Sucesso',
            text: 'Agendamento Editado com Sucesso.',
            icon: 'success',
            confirmButtonText: 'Ok',
            backdrop: true,
            heightAuto: false,
            didOpen: () => {
                $('.modal-backdrop').css('z-index', '1040').hide();
                $('.swal2-container').css({
                    'z-index': 9999,
                    'position': 'fixed',
                });
                $('.swal2-backdrop-show').css('z-index', 9998);
                Swal.getPopup().focus();
            },
            didClose: () => {
                $('#modalViagens').modal('hide');
                $('.modal-backdrop').css('z-index', '1040').show();
            },
        });

    } catch (error) {
        console.error("Erro ao editar o agendamento:", error);
        alert('something went wrong');
    }
}


async function editarAgendamento(viagemId) {
    if (!viagemId) {
        throw new Error("ViagemId não fornecido.");
    }

    try {
        // Lógica para editar apenas o agendamento atual
        const agendamentoUnicoAlterado = await recuperarViagemEdicao(viagemId);
        let objViagem = criarAgendamentoEdicao(agendamentoUnicoAlterado);
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

        // SweetAlert chamado dentro do bloco try, após a edição ser bem-sucedida
        Swal.fire({
            iconHtml: '<img src="/images/barbudo.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup',
            },
            title: 'Sucesso',
            text: 'Agendamento Editado com Sucesso.',
            icon: 'success',
            confirmButtonText: 'Ok',
            backdrop: true,
            heightAuto: false,
            didOpen: () => {
                $('.modal-backdrop').css('z-index', '1040').hide();
                $('.swal2-container').css({
                    'z-index': 9999,
                    'position': 'fixed',
                });
                $('.swal2-backdrop-show').css('z-index', 9998);
                Swal.getPopup().focus();
            },
            didClose: () => {
                $('#modalViagens').modal('hide');
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        });

    } catch (error) {
        console.error("Erro ao editar o agendamento:", error);
        alert('something went wrong');
    }
}

async function handleRecurrence(periodoRecorrente, datasRecorrentes) {
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
        console.error("Erro ao criar o primeiro agendamento:", error);
        throw error;
    }

    // Criar agendamentos subsequentes para as demais datas
    if (datasRecorrentes.length > 1) {
        for (let i = 1; i < datasRecorrentes.length; i++) {
            const agendamentoSubsequente = criarAgendamento(null, agendamentoObj.novaViagem.viagemId, datasRecorrentes[i]);
            try {
                await enviarNovoAgendamento(agendamentoSubsequente, i === datasRecorrentes.length - 1);
            } catch (error) {
                console.error(`Erro ao criar agendamento subsequente para ${datasRecorrentes[i]}:`, error);
            }
        }
    }
}

async function verificarAgendamentoExistente(data, viagemIdRecorrente) {
    try {
        // Faz a chamada AJAX para verificar se já existe um agendamento na data fornecida;
        const response = await $.ajax({
            url: '/api/Agenda/VerificarAgendamento',
            type: 'GET',
            data: {
                data, // A data que será verificada;
                viagemIdRecorrente // O ID da recorrência da viagem, caso exista;
            }
        });

        // Retorna true se o agendamento já existir;
        return response && response.existe;
    } catch (error) {
        console.error("Erro ao verificar agendamento existente:", error);
        return false;
    }
}

// Make this function async to use 'await' inside;
//async function editarAgendamentoRecorrente(viagemId, isSubsequente) {
//    let result;

//    if (!isSubsequente) {
//        result = await Swal.fire({
//            title: 'Editar agendamento recorrente',
//            text: "Você deseja editar apenas este agendamento ou todos os agendamentos desta série?",
//            icon: 'question',
//            showCancelButton: true,
//            confirmButtonText: 'Este apenas',
//            cancelButtonText: 'Todos da série',
//        });
//    } else {
//        result = await Swal.fire({
//            title: 'Editar agendamento recorrente',
//            text: "Você deseja editar apenas este agendamento ou todos os próximos agendamentos desta série?",
//            icon: 'question',
//            showCancelButton: true,
//            confirmButtonText: 'Este apenas',
//            cancelButtonText: 'Todos os próximos',
//        });
//    }

//    if (result.isConfirmed) {
//        await enviarAgendamentoComOpcao(viagemId, false, false);
//    } else {
//        await enviarAgendamentoComOpcao(viagemId, true, isSubsequente);
//    }
//}

// Separar a lógica de adição e edição;
async function enviarNovoAgendamento(agendamento, isUltimoAgendamento = true) {
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
        console.error("Erro ao criar novo agendamento:", error);
        handleAgendamentoError(error);
        throw error;  // Certifique-se de lançar o erro para lidar de forma apropriada;
    }
}

// Função para enviar agendamento com a opção de editar todos ou todos os próximos;
async function enviarAgendamentoComOpcao(viagemId, editarTodos, editarProximos, dataInicial = null, viagemIdRecorrente = null) {
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
                confirmButtonText: 'Ok',
            });
        }
    } catch (error) {
        console.error("Erro ao enviar agendamento:", error);
        Swal.fire({
            title: 'Erro',
            text: 'Erro ao atualizar o agendamento.',
            icon: 'error',
            confirmButtonText: 'Ok',
        });
    }
}

// Example usage in the complete function;
async function executarEdicao() {
    const viagemId = document.getElementById("txtViagemId").value;
    const periodoRecorrente = document.getElementById("lstPeriodos").ej2_instances[0].value;

    let editarTodosRecorrentes = await verificarEdicaoRecorrente(viagemId, periodoRecorrente);

    try {
        if (editarTodosRecorrentes) {
            console.log("Aplicar alterações a todos os agendamentos recorrentes.");
            const agendamento = criarAgendamento();
            agendamento.EditarTodos = true;

            const objViagem = await enviarAgendamento(agendamento);

            if (objViagem && objViagem.data) {
                Swal.fire({
                    title: 'Sucesso',
                    text: 'Todos os agendamentos recorrentes foram atualizados com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'Ok',
                });
            }
        } else {
            console.log("Aplicar alterações apenas ao agendamento atual.");
            const agendamento = criarAgendamento(viagemId, viagemIdRecorrente);
            agendamento.EditarTodos = false;

            const objViagem = await enviarAgendamento(agendamento);

            if (objViagem && objViagem.data) {
                Swal.fire({
                    title: 'Sucesso',
                    text: 'O agendamento foi atualizado com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'Ok',
                });
            }
        }
    } catch (error) {
        console.error("Erro ao enviar agendamento:", error);
        Swal.fire({
            title: 'Erro',
            text: 'Erro ao atualizar o agendamento.',
            icon: 'error',
            confirmButtonText: 'Ok',
        });
    }
}

// Função assíncrona para verificar se é edição de um agendamento recorrente existente;
async function verificarEdicaoRecorrente(viagemId, periodoRecorrente) {
    //let editarTodosRecorrentes = false;

    //if (viagemId && periodoRecorrente !== '') {
    //    const result = await Swal.fire({
    //        title: 'Editar Agendamento Recorrente',
    //        text: 'Deseja aplicar as alterações a todos os agendamentos recorrentes ou apenas ao atual?',
    //        icon: 'question',
    //        showCancelButton: true,
    //        confirmButtonText: 'Todos',
    //        cancelButtonText: 'Apenas Atual',
    //    });

    //    if (result.isConfirmed) {
    //        editarTodosRecorrentes = true;
    //    }
    //}

    let editarTodosRecorrentes = false;

    if (viagemId && periodoRecorrente !== '') {
        const result = await Swal.fire({
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup',
            },
            title: 'Editar Agendamento Recorrente',
            text: 'Deseja aplicar as alterações a todos os agendamentos recorrentes ou apenas ao atual?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Todos',
            cancelButtonText: 'Apenas Atual',
            backdrop: true,
            heightAuto: false,
            didOpen: () => {
                // Garantir que todos os backdrops e modais relacionados ao modal estejam ocultos;
                $('.modal-backdrop').css('z-index', '1040').hide(); // Ocultar o backdrop do Bootstrap;

                // Definir z-index para o container e backdrop do SweetAlert2;
                $('.swal2-container').css({
                    'z-index': 9999, // Maior valor de z-index possível;
                    'position': 'fixed', // Garantir que esteja posicionado corretamente;
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Logo abaixo da janela de alerta;

                // Focar no SweetAlert2 para evitar interferências dos modais;
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restaurar o backdrop do Bootstrap após o fechamento do SweetAlert;
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        });

        if (result.isConfirmed) {
            editarTodosRecorrentes = true;
        }
    }

    return editarTodosRecorrentes;
}


async function obterEDefinirDatasCalendario(viagem, viagemIdRecorrente) {
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
        console.error("Erro ao obter e definir datas no calendário:", error);
    }
}

async function getDatasIniciais(viagemId, recorrenciaViagemId) {
    console.log("Chamando getDatasIniciais com viagemId:", viagemId_AJAX, "e recorrenciaViagemId:", recorrenciaViagemId_AJAX);


    try {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: 'api/Agenda/GetDatasViagem',  // Mantenha o caminho correto para seu método no controller;
                type: 'GET',
                contentType: 'application/json',
                data: { viagemId: viagemId_AJAX, recorrenciaViagemId: recorrenciaViagemId_AJAX },  // Envie os GUIDs como parâmetros de consulta;
                success: function (data) {
                    console.log("Requisição AJAX bem-sucedida, dados recebidos:", data);
                    resolve(data);
                },
                error: function (err) {
                    console.error("Erro na requisição AJAX:", err);
                    alert('Algo deu errado');
                    reject(err);
                }
            });
        });
    } catch (error) {
        console.error("Erro ao fazer AJAX:", error);
        throw error;
    }
}

// Função para atualizar o componente HTML ListBox com as datas selecionadas;
function atualizarListBoxHTMLComDatas(datas) {
    // Converte as datas recebidas para objetos de data e ordena;
    var listaDatas = datas.map(data => new Date(data)).sort((a, b) => a - b).map(data => data.toLocaleDateString());

    // Obtém a referência do ListBox HTML;
    let listBoxHTML = document.getElementById('lstDiasCalendarioHTML');

    if (listBoxHTML) {
        // Limpa o ListBox existente;
        listBoxHTML.innerHTML = '';

        // Obtém a data atual para comparação;
        const dataAtual = new Date().toLocaleDateString();

        // Adiciona cada data como um item de lista;
        datas.forEach(data => {
            let option = document.createElement('li');

            const dateString = dataInicial_List;

            // Create a Date object from the string;
            const date = new Date(dateString);

            // Format the date as 'dd/mm/yyyy'
            const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed;
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1;
            const year = date.getFullYear();

            const dateStringVetor = data;

            // Create a Date object from the string;
            const dateList = new Date(dateStringVetor);

            // Format the date as 'dd/mm/yyyy'
            const dayList = String(dateList.getDate()).padStart(2, '0'); // Add leading zero if needed;
            const monthList = String(dateList.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1;
            const yearList = dateList.getFullYear();

            const formattedDateList = `${dayList}/${monthList}/${yearList}`;
            const formattedDate = `${day}/${month}/${year}`;

            // Se a data for igual à data atual, aplica o estilo desejado;
            if (formattedDateList === formattedDate) {
                option.style.fontWeight = 'bold';
                option.style.color = 'darkblue';
            }

            option.textContent = formattedDateList;

            listBoxHTML.appendChild(option);

        });

        // Atualizar a quantidade de itens na DIV 'divDiasSelecionados'
        const quantidadeDeItens = listaDatas.length;
        const divDiasSelecionados = document.getElementById("divDiasSelecionados");
        if (divDiasSelecionados) {
            divDiasSelecionados.textContent = `Dias Selecionados (${quantidadeDeItens})`;
        }

    } else {
        console.error("ListBox HTML não encontrado!");
    }
}

function atualizarCalendarioExistente(datas) {
    var selectedDates = datas.map(data => new Date(data));

    let calendarObj = document.getElementById('calDatasSelecionadas').ej2_instances[0];

    if (calendarObj) {
        // Atualiza as datas selecionadas;
        calendarObj.values = selectedDates;

        // Desabilita a escolha de datas, mas permite a navegação entre meses;
        calendarObj.renderDayCell = function (args) {
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

            const isDateSelected = selectedDates.some(selectedDate =>
                args.date.getFullYear() === selectedDate.getFullYear() &&
                args.date.getMonth() === selectedDate.getMonth() &&
                args.date.getDate() === selectedDate.getDate()
            );

            if (isDateSelected) {
                // Desativa as datas que vieram do backend, mantendo-as selecionadas;
                args.isDisabled = true;
                args.element.classList.add('e-selected'); // Assegura que a data esteja visivelmente selecionada;
            }
        };

        // Bloquear a seleção/desseleção de datas pelo usuário;
        calendarObj.change = function (args) {
            // Impedir que o usuário desmarque qualquer data ou marque novas;
            calendarObj.values = selectedDates;
        };

        // Atualiza o calendário para aplicar as novas configurações;
        calendarObj.refresh();

        // Atualiza o ListBox também;
        atualizarListBoxHTMLComDatas(datas);
        //atualizarListBoxComDatas(datas);
    } else {
        console.error("Calendário não inicializado!");
    }
}

// Atualiza o calendário para refletir as datas selecionadas no agendamento.
function atualizarcalDatasSelecionadas() {
    const calDatasSelecionadasObj = document.getElementById('calDatasSelecionadas').ej2_instances[0];
    if (calDatasSelecionadasObj) {
        calDatasSelecionadasObj.refresh(); // Atualiza o calendário para refletir as mudanças;
    }
}

// Função para enviar agendamento ao backend;
async function enviarAgendamento(agendamento) {
    // Verificar se já há uma submissão em andamento;
    if (isSubmitting) {
        console.warn("Tentativa de enviar enquanto outra requisição está em andamento.");
        return;
    }

    isSubmitting = true;  // Sinalizar que estamos enviando um agendamento;
    $("#btnConfirma").prop("disabled", true);  // Desabilitar botão para evitar múltiplas requisições;

    try {
        // Enviar o agendamento para o backend;
        const response = await $.ajax({
            type: "POST",
            url: "/api/Agenda/Agendamento",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(agendamento),
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
        console.error("Erro ao enviar agendamento:", error);
        handleAgendamentoError(error);
        throw error;  // Lançar o erro para que a função chamadora possa tratar também;
    } finally {
        isSubmitting = false;  // Liberar a sinalização de envio em andamento;
        $("#btnConfirma").prop("disabled", false);  // Habilitar o botão novamente;
    }
}

async function enviarAgendamentoRecorrente(agendamentoRecorrente) {
    try {
        await enviarAgendamento(agendamentoRecorrente);
        console.log("Agendamento recorrente criado: " + agendamentoRecorrente.DataInicial);
    } catch (error) {
        console.error("Erro ao criar agendamento recorrente: " + error);
    }
}

// Lida com erros durante o processo de criação de agendamento, exibindo uma mensagem apropriada.
function handleAgendamentoError(error) {
    //if (error.responseJSON && error.responseJSON.message) {
    //    toastr.error(error.responseJSON.message, 'Erro', { "timeOut": "5000", "extendedTimeOut": "5000" });
    //} else {
    exibirErroAgendamento();
    //    }
}

// Finaliza a operação do agendamento, ocultando o modal e atualizando o calendário.
function finalizarAgendamento() {
    $("#modalAgendamento").hide();
    $("body").removeClass("modal-open");
    $("body").css("overflow", "auto");

    calendar.refetchEvents();
}

// Exibe uma mensagem de erro ao usuário se ocorrer um problema ao criar o agendamento.
function exibirErroAgendamento() {
    Swal.fire({
        iconHtml: '<img src="/images/assustado.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
        customClass: {
            popup: 'custom-popup',
        },
        title: 'Erro ao criar agendamento',
        text: 'Não foi possível criar o agendamento com os dados informados!',
        icon: 'error',
        confirmButtonText: 'Ok',
        backdrop: true,
        heightAuto: false,
        timer: 3000,
        didOpen: () => {
            // Garantir que todos os backdrops e modais relacionados ao modal estejam ocultos;
            $('.modal-backdrop').css('z-index', '1040').hide(); // Ocultar o backdrop do Bootstrap;

            // Definir z-index para o container e backdrop do SweetAlert2;
            $('.swal2-container').css({
                'z-index': 9999, // Maior valor de z-index possível;
                'position': 'fixed', // Garantir que esteja posicionado corretamente;
            });

            $('.swal2-backdrop-show').css('z-index', 9998); // Logo abaixo da janela de alerta;

            // Focar no SweetAlert2 para evitar interferências dos modais;
            Swal.getPopup().focus();
        },
        didClose: () => {
            // Restaurar o backdrop do Bootstrap após o fechamento do SweetAlert;
            $('.modal-backdrop').css('z-index', '1040').show();
        }
    });
}

// Função para ajustar datas iniciais para períodos recorrentes
function ajustarDataInicialRecorrente(tipoRecorrencia) {
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
        diasSelecionadosIndex = diasSelecionados.map(dia => ({
            "Sunday": 0,
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6
        }[dia]));
    }

    if (tipoRecorrencia === 'D') {
        gerarRecorrenciaDiaria(dataAtual, dataFinalFormatada, datas);
    } else if (tipoRecorrencia === 'M') {
        gerarRecorrenciaMensal(dataAtual, dataFinalFormatada, diasSelecionados, datas);
    } else {
        gerarRecorrenciaPorPeriodo(tipoRecorrencia, dataAtual, dataFinalFormatada, diasSelecionadosIndex, datas);
    }

    return datas.length > 0 ? datas : null;
}

function gerarRecorrenciaVariada(datas) {
    let calendarObj = document.getElementById('calDatasSelecionadas')?.ej2_instances?.[0];

    if (!calendarObj || !calendarObj.values || calendarObj.values.length === 0) {
        console.error("Nenhuma data selecionada no calendário para recorrência do tipo 'V'.");
        return;
    }

    // Adiciona cada data selecionada ao array de datas no formato 'YYYY-MM-DD'
    calendarObj.values.forEach(date => {
        if (date) {
            datas.push(moment(date).format('YYYY-MM-DD'));
        }
    });
}


function gerarRecorrenciaMensal(dataAtual, dataFinal, diasSelecionados, datas) {
    dataAtual = moment(dataAtual);
    dataFinal = moment(dataFinal);

    while (dataAtual.isSameOrBefore(dataFinal)) {
        diasSelecionados.forEach(dia => {
            let proximaData = moment(dataAtual).date(dia);

            // Certifique-se de que a data não seja anterior à data inicial
            if (proximaData.isBefore(dataAtual)) {
                return;
            }

            // Verifica se a data gerada está dentro do intervalo permitido e se corresponde ao padrão de recorrência
            if (proximaData.isSameOrBefore(dataFinal) && proximaData.isSameOrAfter(dataAtual.startOf('month'))) {
                datas.push(proximaData.format('YYYY-MM-DD'));
            }
        });

        // Incrementa para o próximo mês, sem ultrapassar a data final
        dataAtual.add(1, 'month').startOf('month');
        if (dataAtual.isAfter(dataFinal)) break;
    }
}

// Ajusta a data inicial quando o período selecionado é "Dias Variados", utilizando a primeira data selecionada.
function ajustarDataInicialVariado() {
    // This function handles the case when the selected period is "V" (Dias Variados)

    let calendarObj = document.getElementById('calDatasSelecionadas').ej2_instances[0];

    // Get the array of selected dates;
    let selectedDates = calendarObj.values;

    // Ensure there is at least one selected date;
    if (!selectedDates || selectedDates.length === 0) {
        console.error("No dates are selected. Please ensure that at least one day is selected in the calendar.");
        return null;
    }

    // Assuming we need to get the first selected date as the starting point;
    let primeiraData = moment(selectedDates[0]).toDate();

    return primeiraData.toISOString().split('T')[0];
}

function gerarRecorrenciaDiaria(dataAtual, dataFinal, datas) {
    dataAtual = moment(dataAtual);
    dataFinal = moment(dataFinal);

    while (dataAtual.isSameOrBefore(dataFinal)) {
        const dayOfWeek = dataAtual.isoWeekday();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Recorrência de segunda a sexta-feira
            datas.push(dataAtual.format('YYYY-MM-DD'));
        }
        dataAtual.add(1, 'days');
    }
}

function obterProximaDataDaSemana(dataReferencia, diaSelecionado) {
    // Obtém a próxima data correspondente ao dia da semana selecionado
    let proximaData = moment(dataReferencia).day(diaSelecionado);
    if (proximaData.isBefore(dataReferencia)) {
        proximaData.add(1, 'week');
    }
    return proximaData;
}

function isNextWeek(dataReferencia, dataVerificar) {
    // Define o início da próxima semana (segunda-feira)
    const inicioSemanaSeguinte = moment(dataReferencia).startOf('week').add(1, 'week').add(1, 'day'); // Pula para segunda-feira
    // Define o final da próxima semana (domingo)
    const fimSemanaSeguinte = moment(inicioSemanaSeguinte).add(6, 'days'); // Até domingo

    // Verifica se a data a ser verificada está dentro do intervalo de segunda a domingo da próxima semana
    return moment(dataVerificar).isBetween(inicioSemanaSeguinte, fimSemanaSeguinte, 'day', '[]');
}

function gerarRecorrenciaPorPeriodo(tipoRecorrencia, dataAtual, dataFinal, diasSelecionadosIndex, datas) {
    dataAtual = moment(dataAtual);
    dataFinal = moment(dataFinal);

    // Ajusta a dataAtual para a próxima segunda-feira quando a recorrência for quinzenal
    if (tipoRecorrencia === 'Q') {
        dataAtual = moment(dataAtual).day(8); // Define para a próxima segunda-feira
    }

    while (dataAtual.isSameOrBefore(dataFinal)) {
        diasSelecionadosIndex.forEach(diaSelecionado => {
            let proximaData = moment(dataAtual).day(diaSelecionado);
            if (proximaData.isBefore(dataAtual)) proximaData.add(1, 'week');

            if (proximaData.isSameOrBefore(dataFinal) && !datas.includes(proximaData.format('YYYY-MM-DD'))) {
                datas.push(proximaData.format('YYYY-MM-DD'));
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
}

function verificarIncrementoCorreto(dataAtual, dataFinal) {
    if (!moment(dataAtual).isBefore(dataFinal)) {
        console.error("Erro: A data atual não está progredindo corretamente, possível loop infinito.");
        return false;
    }
    return true;
}


// Exibe uma mensagem de sucesso após a criação dos agendamentos.
function exibirMensagemSucesso() {
    Swal.fire({
        iconHtml: '<img src="/images/barbudo.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
        customClass: {
            popup: 'custom-popup',
        },
        title: 'Sucesso',
        text: 'Agendamentos criados com sucesso para todas as datas selecionadas.',
        icon: 'success',
        confirmButtonText: 'Ok',
        backdrop: true,
        heightAuto: false,
        didOpen: () => {
            // Garantir que todos os backdrops e modais relacionados ao modal estejam ocultos;
            $('.modal-backdrop').css('z-index', '1040').hide(); // Ocultar o backdrop do Bootstrap;

            // Definir z-index para o container e backdrop do SweetAlert2;
            $('.swal2-container').css({
                'z-index': 9999, // Maior valor de z-index possível;
                'position': 'fixed', // Garantir que esteja posicionado corretamente;
            });

            $('.swal2-backdrop-show').css('z-index', 9998); // Logo abaixo da janela de alerta;

            // Focar no SweetAlert2 para evitar interferências dos modais;
            Swal.getPopup().focus();
        },
        didClose: () => {
            // Fechar o modal "modalViagens" após o fechamento do SweetAlert;
            $('#modalViagens').modal('hide');
            // Restaurar o backdrop do Bootstrap após o fechamento do SweetAlert;
            $('.modal-backdrop').css('z-index', '1040').show();
        }
    });
}

//Funções de Validação do Formulário;
//==================================
function ValidaCampos(viagemId) {
    console.log("Entrei na validação: " + viagemId);

    if (document.getElementById("txtDataInicial").ej2_instances[0].value === "") {
        Swal.fire({
            title: "Presta Atenção",
            text: "A Data Inicial é obrigatória",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok",
            }
        })

        return false;
    }

    if (document.getElementById("txtHoraInicial").value === "") {
        Swal.fire({
            title: "Presta Atenção",
            text: "A Hora Inicial é obrigatória",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok",
            }
        })

        return false;
    }

    //debugger;

    //var lstFinalidade = document.getElementById("lstFinalidade").ej2_instances[0].value[0];
    if (document.getElementById("lstFinalidade").ej2_instances[0].value === '') {
        Swal.fire({
            title: "Presta Atenção",
            text: "A Finalidade é obrigatória",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok",
            }
        })

        return false;
    }

    //Valida Campos na criação da Viagem;
    //===================================

    if (document.getElementById("txtOrigem").value === "") {
        Swal.fire({
            title: 'Presta Atenção',
            text: 'A Origem é obrigatória',
            icon: 'error', // Use a standard icon or customize as needed;
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup',
            },
            confirmButtonText: 'OK', // Use this to define button text;
            heightAuto: false, // Prevent layout issues;
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind;
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                // Set z-index for SweetAlert2 container and backdrop;
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index;
                    'position': 'fixed', // Ensure it's positioned correctly;
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                // Force focus to SweetAlert2 to prevent modals from interfering;
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes;
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        });

        // Ensure the element exists before focusing;
        const txtOrigem = document.getElementById("txtOrigem");
        if (txtOrigem) {
            txtOrigem.focus();
        }

        return false; // Ensure this is in the right context;
    }

    if (viagemId != null && viagemId != '' && ($("#btnConfirma").text() != 'Edita Agendamento')) {
        console.log("viagemId: " + viagemId);

        console.log("btnConfirma: " + $("#btnConfirma").text());

        if (document.getElementById("txtNoFichaVistoria").value === "") {
            Swal.fire({
                title: "Presta Atenção",
                text: "O Nº da Ficha de Vistoria é obrigatório!",
                icon: 'warning', // Use a standard icon or customize as needed;
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup',
                },
                confirmButtonText: 'OK', // Use this to define button text;
                heightAuto: false, // Prevent layout issues;
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind;
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                    // Set z-index for SweetAlert2 container and backdrop;
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index;
                        'position': 'fixed', // Ensure it's positioned correctly;
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                    // Force focus to SweetAlert2 to prevent modals from interfering;
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes;
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })

            return false;
        }

        var lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
        if (lstMotorista.value === null) {
            Swal.fire({
                title: "Presta Atenção",
                text: "O Motorista é obrigatório",
                icon: 'warning', // Use a standard icon or customize as needed;
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup',
                },
                confirmButtonText: 'OK', // Use this to define button text;
                heightAuto: false, // Prevent layout issues;
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind;
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                    // Set z-index for SweetAlert2 container and backdrop;
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index;
                        'position': 'fixed', // Ensure it's positioned correctly;
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                    // Force focus to SweetAlert2 to prevent modals from interfering;
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes;
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })

            return false;
        }

        var lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
        if (lstVeiculo.value === null) {
            Swal.fire({
                title: "Presta Atenção",
                text: "O Veículo é obrigatório",
                icon: 'warning', // Use a standard icon or customize as needed;
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup',
                },
                confirmButtonText: 'OK', // Use this to define button text;
                heightAuto: false, // Prevent layout issues;
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind;
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                    // Set z-index for SweetAlert2 container and backdrop;
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index;
                        'position': 'fixed', // Ensure it's positioned correctly;
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                    // Force focus to SweetAlert2 to prevent modals from interfering;
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes;
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })

            return false;
        }

        if (document.getElementById("txtKmInicial").value === "") {
            Swal.fire({
                title: "Presta Atenção",
                text: "A quilometragem inicial é obrigatória",
                icon: "error",
                icon: 'error', // Use a standard icon or customize as needed;
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup',
                },
                confirmButtonText: 'OK', // Use this to define button text;
                heightAuto: false, // Prevent layout issues;
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind;
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                    // Set z-index for SweetAlert2 container and backdrop;
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index;
                        'position': 'fixed', // Ensure it's positioned correctly;
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                    // Force focus to SweetAlert2 to prevent modals from interfering;
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes;
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })

            return false;
        }

        var ddtCombustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0];
        if (ddtCombustivelInicial.value === "") {
            Swal.fire({
                title: "Presta Atenção",
                text: "O Combustível Inicial é obrigatório!",
                icon: "error",
                icon: 'error', // Use a standard icon or customize as needed;
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup',
                },
                confirmButtonText: 'OK', // Use this to define button text;
                heightAuto: false, // Prevent layout issues;
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind;
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                    // Set z-index for SweetAlert2 container and backdrop;
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index;
                        'position': 'fixed', // Ensure it's positioned correctly;
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                    // Force focus to SweetAlert2 to prevent modals from interfering;
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes;
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })

            return false;
        }
    }

    var lstRequisitante = document.getElementById("lstRequisitante").ej2_instances[0];
    if (lstRequisitante.value === null || lstRequisitante.value === '') {
        Swal.fire({
            title: "Presta Atenção",
            text: "O Requisitante é obrigatório",
            icon: 'error', // Use a standard icon or customize as needed;
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup',
            },
            confirmButtonText: 'OK', // Use this to define button text;
            heightAuto: false, // Prevent layout issues;
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind;
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                // Set z-index for SweetAlert2 container and backdrop;
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index;
                    'position': 'fixed', // Ensure it's positioned correctly;
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                // Force focus to SweetAlert2 to prevent modals from interfering;
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes;
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        })

        return false;
    }

    if (document.getElementById("txtRamalRequisitante").value === "") {
        Swal.fire({
            title: "Presta Atenção",
            text: "O Ramal do Requisitante é obrigatório",
            icon: 'error', // Use a standard icon or customize as needed;
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup',
            },
            confirmButtonText: 'OK', // Use this to define button text;
            heightAuto: false, // Prevent layout issues;
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind;
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                // Set z-index for SweetAlert2 container and backdrop;
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index;
                    'position': 'fixed', // Ensure it's positioned correctly;
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                // Force focus to SweetAlert2 to prevent modals from interfering;
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes;
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        })

        return false;
    }

    var ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];
    if (ddtSetor.value === null) {
        Swal.fire({
            title: "Presta Atenção",
            text: "O Setor Solicitante é obrigatório",
            icon: 'error', // Use a standard icon or customize as needed;
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup',
            },
            confirmButtonText: 'OK', // Use this to define button text;
            heightAuto: false, // Prevent layout issues;
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind;
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                // Set z-index for SweetAlert2 container and backdrop;
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index;
                    'position': 'fixed', // Ensure it's positioned correctly;
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                // Force focus to SweetAlert2 to prevent modals from interfering;
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes;
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        })

        return false;
    }

    var lstFinalidade = document.getElementById("lstFinalidade").ej2_instances[0].value;
    if (document.getElementById("lstFinalidade").ej2_instances[0].value === '') {
        Swal.fire({
            title: "Presta Atenção",
            text: "A Finalidade é obrigatória",
            icon: 'error', // Use a standard icon or customize as needed;
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup',
            },
            confirmButtonText: 'OK', // Use this to define button text;
            heightAuto: false, // Prevent layout issues;
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind;
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                // Set z-index for SweetAlert2 container and backdrop;
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index;
                    'position': 'fixed', // Ensure it's positioned correctly;
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                // Force focus to SweetAlert2 to prevent modals from interfering;
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes;
                $('.modal-backdrop').css('z-index', '1040').show();
            }
        })

        return false;
    }
    else {
        if (document.getElementById("lstFinalidade").ej2_instances[0].value === 'Evento' && (document.getElementById("lstEventos").ej2_instances[0].value === "" || document.getElementById("lstEventos").ej2_instances[0].value === null)) {
            Swal.fire({
                title: "Presta Atenção",
                text: "o nome do evento é obrigatório",
                icon: 'error', // Use a standard icon or customize as needed;
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup',
                },
                confirmButtonText: 'OK', // Use this to define button text;
                heightAuto: false, // Prevent layout issues;
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind;
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                    // Set z-index for SweetAlert2 container and backdrop;
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index;
                        'position': 'fixed', // Ensure it's positioned correctly;
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                    // Force focus to SweetAlert2 to prevent modals from interfering;
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes;
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })

            return false;
        }
    }

    //Valida Seção da Recorrência;

    if (transformandoEmViagem = false)
    {

        if (document.getElementById("lstRecorrente").ej2_instances[0].value === 'S' && (document.getElementById("lstPeriodos").ej2_instances[0].value === '' || document.getElementById("lstPeriodos").ej2_instances[0].value === null)) {
            Swal.fire({
                title: "Presta Atenção",
                text: "Se o Agendamento é Recorrente, você precisa escolher o Período de Recorrência!",
                icon: 'error', // Use a standard icon or customize as needed;
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup',
                },
                confirmButtonText: 'OK', // Use this to define button text;
                heightAuto: false, // Prevent layout issues;
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind;
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                    // Set z-index for SweetAlert2 container and backdrop;
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index;
                        'position': 'fixed', // Ensure it's positioned correctly;
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                    // Force focus to SweetAlert2 to prevent modals from interfering;
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes;
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })

            return false;
        }

        //Dias da Semana;
        if ((document.getElementById("lstPeriodos").ej2_instances[0].value === 'S' || document.getElementById("lstPeriodos").ej2_instances[0].value === 'Q' || document.getElementById("lstPeriodos").ej2_instances[0].value === 'M') && (document.getElementById("lstDias").ej2_instances[0].value === '' || document.getElementById("lstDias").ej2_instances[0].value === null)) {
            Swal.fire({
                title: "Presta Atenção",
                text: "Se o período foi escolhido como semanal, quinzenal ou mensal, você precisa escolher os Dias da Semana!",
                icon: 'error', // Use a standard icon or customize as needed;
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup',
                },
                confirmButtonText: 'OK', // Use this to define button text;
                heightAuto: false, // Prevent layout issues;
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind;
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                    // Set z-index for SweetAlert2 container and backdrop;
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index;
                        'position': 'fixed', // Ensure it's positioned correctly;
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                    // Force focus to SweetAlert2 to prevent modals from interfering;
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes;
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })

            return false;
        }

        //Data Final;
        if ((document.getElementById("lstPeriodos").ej2_instances[0].value === 'D' || document.getElementById("lstPeriodos").ej2_instances[0].value === 'S' || document.getElementById("lstPeriodos").ej2_instances[0].value === 'Q' || document.getElementById("lstPeriodos").ej2_instances[0].value === 'M') && (document.getElementById("txtFinalRecorrencia").ej2_instances[0].value === '' || document.getElementById("txtFinalRecorrencia").ej2_instances[0].value === null)) {
            Swal.fire({
                title: "Presta Atenção",
                text: "Se o período foi escolhido como diário, semanal, quinzenal ou mensal, você precisa escolher a Data Final!",
                icon: 'error', // Use a standard icon or customize as needed;
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup',
                },
                confirmButtonText: 'OK', // Use this to define button text;
                heightAuto: false, // Prevent layout issues;
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind;
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                    // Set z-index for SweetAlert2 container and backdrop;
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index;
                        'position': 'fixed', // Ensure it's positioned correctly;
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                    // Force focus to SweetAlert2 to prevent modals from interfering;
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes;
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })

            return false;
        }

        let calendarObj = document.getElementById('calDatasSelecionadas').ej2_instances[0];

        // Get the array of selected dates;
        let selectedDates = calendarObj.values;

        // Get the number of selected dates;
        let numberOfSelectedDates = selectedDates ? selectedDates.length : 0;

        //Dias Variados;
        if ((document.getElementById("lstPeriodos").ej2_instances[0].value === 'V') && (numberOfSelectedDates === 0)) {
            Swal.fire({
                title: "Presta Atenção",
                text: "Se o período foi escolhido como Dias Variados, você precisa escolher ao menos um dia no Calendário!",
                icon: 'warning', // Use a standard icon or customize as needed;
                iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
                customClass: {
                    popup: 'custom-popup',
                },
                confirmButtonText: 'OK', // Use this to define button text;
                heightAuto: false, // Prevent layout issues;
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind;
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                    // Set z-index for SweetAlert2 container and backdrop;
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index;
                        'position': 'fixed', // Ensure it's positioned correctly;
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                    // Force focus to SweetAlert2 to prevent modals from interfering;
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes;
                    $('.modal-backdrop').css('z-index', '1040').show();
                }
            })

            return false;
        }

    }
    //Períodos;

    StatusViagem = "Aberta";

    //Verifica se está finalizando a viagem;
    //=====================================
    var ddtCombustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0];

    if ((document.getElementById("txtDataInicial").ej2_instances[0].value != "") && (document.getElementById("txtHoraFinal").value != "") && (document.getElementById("txtKmInicial").value != "") && (ddtCombustivelInicial.value != "")) {
        StatusViagem = "Realizada";
    }

    console.log("Terminei Validação!");
    return true;
}

// Função de espera para adicionar atraso entre as requisições;
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function criarAgendamento(viagemId, viagemIdRecorrente, dataInicial) {
    // Validação rigorosa dos parâmetros antes de criar o agendamento;

    // Obter as datas selecionadas (para dias variados)
    //let datasSelecionadas = [];
    //const calendarObj = document.getElementById('calDatasSelecionadas').ej2_instances[0];
    //if (calendarObj && calendarObj.values) {
    //    datasSelecionadas = calendarObj.values.map(date => moment(date).format("YYYY-MM-DD"));
    //}

    // Editor de Texto para descrição;
    const rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];
    const rteDescricaoHtmlContent = rteDescricao.getHtml();  // Captura o conteúdo em HTML;

    // Verificar componentes para motorista, veículo e setor;
    const lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
    const lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
    const ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];

    // Captura da data final da recorrência;
    const dataFinalInput = document.getElementById("txtFinalRecorrencia").ej2_instances[0].value;
    const momentDate = moment(dataFinalInput);
    const DataFinalRecorrencia = momentDate.isValid() ? momentDate.format("YYYY-MM-DD") : null;

    // Definindo os dias da semana selecionados;
    const lstDias = document.getElementById("lstDias").ej2_instances[0].value;
    const diasSemana = {
        Monday: lstDias.includes("Monday"),
        Tuesday: lstDias.includes("Tuesday"),
        Wednesday: lstDias.includes("Wednesday"),
        Thursday: lstDias.includes("Thursday"),
        Friday: lstDias.includes("Friday"),
        Saturday: lstDias.includes("Saturday"),
        Sunday: lstDias.includes("Sunday"),
    };

    // Captura da data inicial;
    const dateObj = new Date(dataInicial);
    const dataInicialFormatada = dateObj.toISOString().split('T')[0];

    // Criação do objeto de agendamento;
    const agendamento = {
        ViagemId: "00000000-0000-0000-0000-000000000000",
        DataInicial: dataInicialFormatada,
        HoraInicio: $('#txtHoraInicial').val(),
        Finalidade: document.getElementById("lstFinalidade").ej2_instances[0].value[0],
        Origem: $('#txtOrigem').val(),
        Destino: $('#txtDestino').val() || null,
        MotoristaId: lstMotorista.value || null,
        VeiculoId: lstVeiculo.value || null,
        KmAtual: parseInt($('#txtKmAtual').val(), 10) || null,
        RequisitanteId: document.getElementById("lstRequisitante").ej2_instances[0].value || null,
        RamalRequisitante: $('#txtRamalRequisitante').val(),
        SetorSolicitanteId: ddtSetor.value[0] || null,
        Descricao: rteDescricaoHtmlContent,
        StatusAgendamento: true,
        Status: "Agendada",
        EventoId: document.getElementById("lstEventos").ej2_instances[0].value || null,
        Recorrente: document.getElementById("lstRecorrente").ej2_instances[0].value,
        RecorrenciaViagemId: viagemIdRecorrente || "00000000-0000-0000-0000-000000000000",
        DatasSelecionadas: null,
        Intervalo: document.getElementById("lstPeriodos").ej2_instances[0].value,
        DataFinalRecorrencia: DataFinalRecorrencia,
        Monday: diasSemana.Monday,
        Tuesday: diasSemana.Tuesday,
        Wednesday: diasSemana.Wednesday,
        Thursday: diasSemana.Thursday,
        Friday: diasSemana.Friday,
        Saturday: diasSemana.Saturday,
        Sunday: diasSemana.Sunday,
        DiaMesRecorrencia: document.getElementById("lstDiasMes").ej2_instances[0].value,
    };

    console.log("Agendamento criado:", agendamento);
    return agendamento;
}

async function recuperarViagemEdicao(viagemId) {
    try {
        const response = await $.ajax({
            url: '/api/Agenda/ObterAgendamentoEdicao',
            type: "GET",
            data: { viagemId: viagemId },
            dataType: "json" // Defina o tipo de dado esperado
        });

        console.log("Response: ", response);

        // Verifique se o tipo de resposta é um array ou objeto
        const objViagem = Array.isArray(response) ? response[0] : response;
        return objViagem;

    } catch (err) {
        console.error("Erro ao chamar API: ", err);
        alert('Something went wrong');
    }
}




function criarAgendamentoEdicao(agendamentoUnicoAlterado) {
    //objViagemId =
    // Editor de Texto para descrição;
    const rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];
    const rteDescricaoHtmlContent = rteDescricao.getHtml();  // Captura o conteúdo em HTML;

    // Verificar componentes para motorista, veículo e setor;
    const lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
    const lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
    const ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];

    let motoristaId = document.getElementById("lstMotorista").ej2_instances[0].value;
    let veiculoId = document.getElementById("lstVeiculo").ej2_instances[0].value;
    let eventoId = document.getElementById("lstEventos").ej2_instances[0].value;
    let setorId = document.getElementById("ddtSetor").ej2_instances[0].value[0];
    let ramal = $('#txtRamalRequisitante').val();
    let requisitanteId = document.getElementById("lstRequisitante").ej2_instances[0].value;
    let kmAtual = parseInt($('#txtKmAtual').val(), 10);
    let destino = $('#txtDestino').val();
    let origem = $('#txtOrigem').val();
    let finalidade = document.getElementById("lstFinalidade").ej2_instances[0].value[0];

    // Criação do objeto de agendamento;
    const agendamento = {
        ViagemId: agendamentoUnicoAlterado.viagemId,
        DataInicial: agendamentoUnicoAlterado.dataInicial,
        HoraInicio: agendamentoUnicoAlterado.horaInicio,
        Finalidade: finalidade,
        Origem: origem,
        Destino: destino,
        MotoristaId: motoristaId,
        VeiculoId: veiculoId,
        KmAtual: kmAtual,
        RequisitanteId: requisitanteId,
        RamalRequisitante: ramal,
        SetorSolicitanteId:  setorId,
        Descricao: rteDescricaoHtmlContent,
        StatusAgendamento: true,
        Status: "Agendada",
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
    };

    console.log("Agendamento criado:", agendamento);
    return agendamento;
}

function criarAgendamentoViagem(agendamentoUnicoAlterado) {
    //objViagemId =
    // Editor de Texto para descrição;
    const rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];
    const rteDescricaoHtmlContent = rteDescricao.getHtml();  // Captura o conteúdo em HTML;

    // Verificar componentes para motorista, veículo e setor;
    const lstMotorista = document.getElementById("lstMotorista").ej2_instances[0];
    const lstVeiculo = document.getElementById("lstVeiculo").ej2_instances[0];
    const ddtSetor = document.getElementById("ddtSetor").ej2_instances[0];

    let motoristaId = document.getElementById("lstMotorista").ej2_instances[0].value;
    let veiculoId = document.getElementById("lstVeiculo").ej2_instances[0].value;
    let eventoId = document.getElementById("lstEventos").ej2_instances[0].value;
    let setorId = document.getElementById("ddtSetor").ej2_instances[0].value[0];
    let ramal = $('#txtRamalRequisitante').val();
    let requisitanteId = document.getElementById("lstRequisitante").ej2_instances[0].value;
    let kmAtual = parseInt($('#txtKmAtual').val(), 10);
    let kmInicial = parseInt($('#txtKmInicial').val(), 10);
    let kmFinal= parseInt($('#txtKmFinal').val(), 10);
    let destino = $('#txtDestino').val();
    let origem = $('#txtOrigem').val();
    let finalidade = document.getElementById("lstFinalidade").ej2_instances[0].value[0];
    let combustivelInicial = document.getElementById("ddtCombustivelInicial").ej2_instances[0].value[0];
    let combustivelFinal = document.getElementById("ddtCombustivelFinal").ej2_instances[0].value[0]; 
    let dataFinal = moment(document.getElementById("txtDataFinal").ej2_instances[0].value).format('YYYY-MM-DD');
    let horaInicio = $('#txtHoraInicial').val();
    let horaFim = $('#txtHoraFinal').val();
    let statusAgendamento = "";
    let noFichaVistoria = document.getElementById("txtNoFichaVistoria").value

    if ((dataFinal != null || dataFinal != '') && (horaFim != null || horaFim != ''))
    {
        statusAgendamento = "Realizada"
    }
    else
    {
        statusAgendamento = "Aberta"
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
        Status: statusAgendamento,
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
    };

    console.log("Agendamento criado:", agendamento);
    return agendamento;
}

////COMEÇO DO  REFATORADO PELO CODE PILOT;
////=====================================

// Global variable to hold the exposed criarAgendamento function;
//var criarAgendamento;

$(document).ready(function () {
    // Ajustar altura dos controles Syncfusion;
    document.getElementById('lstRecorrente').ej2_instances[0].setProperties({ height: '200px' });
    document.getElementById('lstPeriodos').ej2_instances[0].setProperties({ height: '200px' });
    document.getElementById('lstDias').ej2_instances[0].setProperties({ height: '200px' });
    document.getElementById('txtFinalRecorrencia').ej2_instances[0].setProperties({ height: '200px' });

    // Esconde os controles da Recorrência;
    document.getElementById("divPeriodo").style.display = "none";
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
        $('#modalViagens').hide();
        $("div").removeClass("modal-backdrop");

        $('body').removeClass('modal-open');
        $("body").css("overflow", "auto");
    });

    // Botão para fechar a Ficha de impressão;
    $('#btnFecharFicha').on('click', function () {
        $('#modalPrint').hide();
        $("div").removeClass("modal-backdrop");

        $('body').removeClass('modal-open');
        $("body").css("overflow", "auto");
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
        show: false,
    }).on("hide.bs.modal", function () {
        var setores = document.getElementById('ddtSetorRequisitante').ej2_instances[0];
        setores.value = "";
        $("#txtPonto").val('');
        $("#txtNome").val('');
        $("#txtRamal").val('');
        $("#txtEmail").val('');
    });

    // Configura a Exibição do Modal de Setores;
    $("#modalSetor").modal({
        keyboard: true,
        backdrop: "static",
        show: false,
    }).on("hide.bs.modal", function () {
        var setores = document.getElementById('ddtSetorPai').ej2_instances[0];
        setores.value = "";
        $("#txtSigla").val('');
        $("#txtNomeSetor").val('');
        $("#txtRamalSetor").val('');
    });
});

//EXIBE A VIAGEM NO MODAL (REFATORADO)
//====================================
function ExibeViagem(viagem) {
    // Habilita e Limpa Controles;
    StatusViagem = "Aberta";

    var childNodes = document.getElementById("divModal").getElementsByTagName('*');
    for (var node of childNodes) {
        node.disabled = false;
        node.value = "";
    }

    //$('#txtDataInicial').attr('type', 'date');
    //$('#txtDataFinal').attr('type', 'date');
    $('#txtHoraInicial').attr('type', 'time');
    $('#txtHoraFinal').attr('type', 'time');

    document.getElementById("divNoFichaVistoria").style.display = 'none';
    document.getElementById("divDataFinal").style.display = 'none';
    document.getElementById("divHoraFinal").style.display = 'none';
    document.getElementById("divKmAtual").style.display = 'none';
    document.getElementById("divKmInicial").style.display = 'none';
    document.getElementById("divKmFinal").style.display = 'none';

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

    $("#btnViagem").show();
    $("#btnImprime").show();
    $("#btnConfirma").show();
    $("#btnApaga").show();
    $("#btnCancela").show();

    document.getElementById("lblUsuarioCriacao").innerHTML = "";

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
        // Aqui você adiciona o comportamento desejado ao clique, ou simplesmente restaura o padrão
        console.log('Link clicado!'); // Exemplo de ação
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

        var datePicker = document.getElementById("txtDataInicial").ej2_instances[0];
        datePicker.value = moment(viagem.dataInicial).toDate(); // Ou use o método correto para definir o valor;
        datePicker.dataBind(); // Atualiza a interface;

        $('#txtHoraInicial').removeAttr("type");
        document.getElementById("txtHoraInicial").value = viagem.horaInicio.substring(11, 16);
        $('#txtHoraInicial').attr('type', 'time');

        document.getElementById("lstFinalidade").ej2_instances[0].value = [viagem.finalidade];
        document.getElementById("lstFinalidade").ej2_instances[0].text = viagem.finalidade;
        $("#txtOrigem").val(viagem.origem);
        $("#txtDestino").val(viagem.destino);

        if (viagem.eventoId != null) {
            lstEvento.enabled = true;
            lstEvento.value = [viagem.eventoId];
            document.getElementById("btnEvento").style.display = "block";
        }

        lstMotorista.value = viagem.motoristaId;
        lstVeiculo.value = viagem.veiculoId;
        document.getElementById("txtKmAtual").value = viagem.kmAtual;
        lstRequisitante.value = viagem.requisitanteId;
        document.getElementById("txtRamalRequisitante").value = viagem.ramalRequisitante;
        ddtSetor.value = [viagem.setorSolicitanteId];

        rte.value = viagem.descricao;

        //Recorrência;
        document.getElementById("lstRecorrente").ej2_instances[0].enabled = false;
        document.getElementById("lstRecorrente").ej2_instances[0].value = viagem.recorrente;

        if (viagem.recorrente === 'S') {
            document.getElementById("lstPeriodos").style.display = "block";
            document.getElementById("lstPeriodos").ej2_instances[0].enabled = false;
            document.getElementById("lstPeriodos").ej2_instances[0].value = viagem.intervalo;
        } else {
            document.getElementById("lstPeriodos").style.display = "none";
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
            multiSelect.dataSource = multiSelect.dataSource.filter(item => diasSelecionados.includes(item.id));
            multiSelect.dataBind(); // Aplica a nova lista de opções;

            // Define os valores selecionados no MultiSelect;
            multiSelect.value = diasSelecionados;
            multiSelect.dataBind(); // Aplica a seleção inicial;

            // Atualiza o texto exibido para o nome correspondente;
            const selectedTexts = diasSelecionados.map(val => {
                const item = multiSelect.dataSource.find(dsItem => dsItem.id === val);
                return item ? item.name : val;
            });
            multiSelect.inputElement.value = selectedTexts.join(', ');

            // Desabilita o MultiSelect completamente (impede edição)
            multiSelect.readonly = true;
            multiSelect.enabled = false;
        } else {
            document.getElementById("divDias").style.display = "none";
        }

        if (viagem.intervalo === 'M' )
        {
            document.getElementById("divDiaMes").style.display = "block";
            document.getElementById("lstDiasMes").ej2_instances[0].enabled = false;
            document.getElementById("lstDiasMes").ej2_instances[0].value = viagem.diaMesRecorrencia;
            document.getElementById("lstDiasMes").ej2_instances[0].text = viagem.diaMesRecorrencia;
        }
        else
        {
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
        } else {
            // Exibe detalhes da viagem;
            document.getElementById("Titulo").innerHTML = "<h3 class='modal-title'><i class='fad fa-route' aria-hidden='true'></i> Exibindo Viagem (Aberta) </h3>";


            document.getElementById("divNoFichaVistoria").style.display = 'block';
            document.getElementById("divDataFinal").style.display = 'block';
            document.getElementById("divHoraFinal").style.display = 'block';
            document.getElementById("divKmAtual").style.display = 'block';
            document.getElementById("divKmInicial").style.display = 'block';
            document.getElementById("divKmFinal").style.display = 'block';

            document.getElementById("txtNoFichaVistoria").value = viagem.noFichaVistoria;

            if (viagem.status === "Realizada") {

                document.getElementById("Titulo").innerHTML = "<h3 class='modal-title'><i class='fad fa-route' aria-hidden='true'></i> Exibindo Viagem (Realizada) </h3>";

                var childNodes = document.getElementById("divModal").getElementsByTagName('*');
                for (var node of childNodes) {
                    node.disabled = true;
                }

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

                const btnRequisitante = document.getElementById("btnRequisitante");
                // Adiciona uma classe indicando que está desabilitado
                btnRequisitante.classList.add('disabled');
                // Remove o comportamento de clique
                btnRequisitante.addEventListener('click', function (event) {
                    event.preventDefault();
                });

                //const btnAbrirNovoSetor = document.getElementById("btnAbrirNovoSetor");
                //// Adiciona uma classe indicando que está desabilitado
                //btnAbrirNovoSetor.classList.add('disabled');
                //// Remove o comportamento de clique
                //btnAbrirNovoSetor.addEventListener('click', function (event) {
                //    event.preventDefault();
                //});

                document.getElementById("txtKmInicial").value = viagem.kmInicial;
                document.getElementById("txtKmFinal").value = viagem.kmFinal;

                ddtCombustivelInicial.value = [viagem.combustivelInicial];
                if (viagem.combustivelFinal != null && viagem.combustivelFinal !== '') {
                    ddtCombustivelFinal.value = [viagem.combustivelFinal];
                }

                const DataFinalizacao = moment(viagem.dataCriacao).format("DD/MM/YYYY");
                const HoraFinalizacao = moment(viagem.dataCriacao).format("HH:mm");

                $.ajax({
                    url: '/api/Agenda/RecuperaUsuario',
                    type: "Get",
                    data: { id: viagem.usuarioIdFinalizacao },
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        let usuarioFinalizacao;
                        $.each(data, function (key, val) {
                            usuarioFinalizacao = val;
                        });
                        document.getElementById("lblUsuarioFinalizacao").innerHTML = " - Finalizada por " + usuarioFinalizacao + " em " + DataFinalizacao + " às " + HoraFinalizacao;
                    },
                    error: function (err) {
                        console.log(err);
                        alert('something went wrong');
                    }
                });
            }
        }
    }
}
//====================================

//var calendarEl = document.getElementById('agenda');

//var calendar = new FullCalendar.Calendar(calendarEl)

function InitializeCalendar(URL) {
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
            diaSemana: { buttonText: 'Dia', type: 'timeGridDay', weekends: true },
            listDay: { buttonText: 'Lista do dia', weekends: true },
            weekends: { buttonText: 'Fins de Semana', type: 'timeGridWeek', weekends: true, hiddenDays: [1, 2, 3, 4, 5] }
        },
        locale: "pt",
        selectable: true,
        editable: true,
        navLinks: true,
        events: function (fetchInfo, successCallback, failureCallback) {
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
                    var events = $.map(data.data, function (item) {
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
                    });

                    successCallback(events);
                },
                error: function () {
                    failureCallback();
                }
            });
        },
        eventClick: function (info) {
            var idViagem = info.event.id;
            console.log("ID: " + idViagem);

            info.jsEvent.preventDefault();

            $.ajax({
                type: "GET",
                url: '/api/Agenda/RecuperaViagem',
                data: { id: idViagem },
                contentType: "application/json",
                dataType: "json",
                success: function (response) {
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
                }
            });
            $('#modalViagens').modal('show');
        },
        eventDidMount: function (info) {
            var tooltip = new Tooltip(info.el, {
                title: info.event.extendedProps.description,
                placement: 'top',
                trigger: 'hover',
                container: 'body',
            });
        },
        loading: function (isLoading) {
            if (isLoading) {
                $(".example").show();
            }
            else {
                $(".example").hide();
            }
        },
        select: function (info) {
            const startStr = moment(info.start).format("YYYY-MM-DD");
            const HoraInicio = moment(info.start).format("HH:mm:ss");
            console.log(startStr);
            ExibeViagem("");
            CarregandoAgendamento = true;
            $('#modalViagens').modal('show');
            document.getElementById("txtDataInicial").ej2_instances[0].value = moment(startStr).format('DD/MM/YYYY');
            document.getElementById("txtHoraInicial").value = HoraInicio;
            CarregandoAgendamento = false;
        },
        selectOverlap: function (event) {
            return !event.block;
        },
    });

    calendar.render();
}

// Function to fetch events based on the date range;
let isFetching = false;

function fetchEvents(start, end, successCallback, failureCallback) {
    if (isFetching) return; // Prevent multiple calls;
    isFetching = true;

    console.log("Fetching events from", start, "to", end);

    // Simulating an async operation;
    setTimeout(() => {
        // Your event fetching logic...
        isFetching = false; // Reset flag after fetching;
        successCallback(); // Call success callback;
    }, 1000);
}

// Formata uma data em um formato de dia/mês/ano.
function formatDate(dateObj) {
    const day = ("0" + dateObj.getDate()).slice(-2);
    const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}

// Atualiza o contador de itens exibidos no componente de seleção múltipla.
function updateBadge() {
    document.getElementById("itemCount").textContent = $("#lstDias").data("kendoMultiSelect").dataSource.total();
}

//< !--JavaScript to initialize the accordion-- >

//REQUISITANTES;

// Initialize the Syncfusion Accordion;
var accordionRequisitante = new ej.navigations.Accordion({
    width: 600,
    height: 'auto',
    margintop: 100,
    marginleft: -300,
    expandMode: 'Single', // Allows only one item to be expanded at a time;
    animation: {
        expand: { effect: 'fadeIn', duration: 500 }, // Animation for expanding;
        collapse: { effect: 'fadeOut', duration: 500 } // Animation for collapsing;
    }
});

// Inicialize o accordion.
accordionRequisitante.appendTo('#accordionRequisitante');


// Show/Hide functionality;
var toggleAccordionBtnRequisitante = document.getElementById("btnRequisitante");
var accordionElementRequisitante = document.getElementById("accordionRequisitante");
// Inicialize o estado de visibilidade do elemento.
accordionElementRequisitante.style.display = "none";

//var toggleAccordionBtnSetores = document.getElementById("btnAbrirNovoSetor");
//var accordionElementSetores = document.getElementById("accordionSetor");

toggleAccordionBtnRequisitante.addEventListener("click", function () {
    var displayValue = window.getComputedStyle(accordionElementRequisitante).display;
    if (displayValue === "none") {
        accordionElementRequisitante.style.display = "block";
    //    accordionElementSetores.style.display = "none";
    } else {
        accordionElementRequisitante.style.display = "none";
    }
});

//SETORES;

// Initialize the Syncfusion Accordion;
//var accordionSetor = new ej.navigations.Accordion({
//    width: 700,
//    height: 'auto',
//    margintop: 100,
//    marginleft: -1300,
//    expandMode: 'Single', // Allows only one item to be expanded at a time;
//    animation: {
//        expand: { effect: 'fadeIn', duration: 500 }, // Animation for expanding;
//        collapse: { effect: 'fadeOut', duration: 500 } // Animation for collapsing;
//    }
//});

//// Append the accordion to the specified HTML element;
//accordionSetor.appendTo('#accordionSetor');

//var accordionElementSetor = document.getElementById("accordionSetor");
//// Inicialize o estado de visibilidade do elemento.
//accordionElementSetor.style.display = "none";


//// Show/Hide functionality;
//toggleAccordionBtnSetores.addEventListener("click", function () {
//    if (accordionElementSetores.style.display === "none") {
//        accordionElementSetores.style.display = "block";
//        accordionElementRequisitante.style.display = "none";
//        // // toggleAccordionBtn.textContent = "Hide Accordion";
//    } else {
//        accordionElementSetores.style.display = "none";
//        // toggleAccordionBtn.textContent = "Show Accordion";
//    }
//});

//Eventos;

// Initialize the Syncfusion Accordion;
var accordionEvento = new ej.navigations.Accordion({
    width: 800,
    height: 'auto',
    margintop: 100,
    marginleft: -1300,
    expandMode: 'Single', // Allows only one item to be expanded at a time;
    animation: {
        expand: { effect: 'fadeIn', duration: 3000 }, // Animation for expanding;
        collapse: { effect: 'fadeOut', duration: 3000 } // Animation for collapsing;
    }
});

// Append the accordion to the specified HTML element;
accordionEvento.appendTo('#accordionEvento');

var toggleAccordionBtnEvento = document.getElementById("btnEvento");
var accordionElementEvento = document.getElementById("accordionEvento");

// Show/Hide functionality;

toggleAccordionBtnEvento.addEventListener("click", function () {
    if (accordionElementEvento.style.display === "none") {
        accordionElementEvento.style.display = "block";
        // // toggleAccordionBtn.textContent = "Hide Accordion";
    } else {
        accordionElementEvento.style.display = "none";
        // toggleAccordionBtn.textContent = "Show Accordion";
    }
});

// Botão InserirSetor do Modal;
//============================
$("#btnInserirSetor").click(function (e) {
    e.preventDefault();

    if ($("#txtNomeSetor").val() === "") {
        Swal.fire({
            title: 'Atenção',
            text: "O Nome do Setor é obrigatório!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar",
            }
        });
        return;
    };

    if ($("#txtRamalSetor").val() === "") {
        Swal.fire({
            title: 'Atenção',
            text: "O Ramal do Seor é obrigatório!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar",
            }
        });
        return;
    };

    var setorPai = document.getElementById('ddtSetorPai').ej2_instances[0];

    setorPaiId = null;

    if (document.getElementById('ddtSetorPai').ej2_instances[0].value != '' && document.getElementById('ddtSetorPai').ej2_instances[0].value != null) {
        setorPaiId = document.getElementById('ddtSetorPai').ej2_instances[0].value.toString();
    }

    if ((setorPaiId === null)) {
        var objSetor = JSON.stringify({ "Nome": $('#txtNomeSetor').val(), "Ramal": $('#txtRamalSetor').val(), "Sigla": $('#txtSigla').val() })
    }
    else {
        var objSetor = JSON.stringify({ "Nome": $('#txtNomeSetor').val(), "Ramal": $('#txtRamalSetor').val(), "Sigla": $('#txtSigla').val(), "SetorPaiId": setorPaiId })
    };

    console.log(objSetor);

    $.ajax({
        type: "post",
        url: "/api/Viagem/AdicionarSetor",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: objSetor,

        success: function (data) {
            if (data.success) {
                toastr.success(data.message);

                PreencheListaSetores();

                document.getElementById("accordionSetor").style.display = "none"; // Esconde a DIV;

                // Assuming you have a DropDownTree initialized;
                var dropdownTreeObj = document.getElementById('ddtSetorRequisitante').ej2_instances[0];

                // Set the desired value;
                dropdownTreeObj.value = [data.setorId]; // Replace 'desiredValue' with the actual value;

                // Refresh the ComboBox;
                dropdownTreeObj.dataBind();

                console.log(data.setorId);
            }
            else {
                toastr.error(data.message);
            }
        },
        error: function (data) {
            toastr.error(data.message);
        }
    });
});

let dialogRecorrencia = new ej.popups.Dialog({
    header: '<div style="display: flex; align-items: center; justify-content: space-between;">' +
        '<span style="font-size: 18px; color: #e74c3c; font-weight: bold;">Atenção ao Prazo</span>' +
        '<img src="./images/barbudo.jpg" alt="Warning Icon" style="width: 48px; height: 48px; margin-left: auto;">' +
        '</div>',
    content: '<div style="font-size: 16px; color: #333;">A data final não pode ser maior que 365 dias após a data inicial.</div>',
    position: { X: 'center', Y: 'center' },
    width: '350px',
    cssClass: 'custom-dialog-style', // Custom CSS class for applying additional styles;
    visible: false,  // Initializes as hidden;
    buttons: [{
        click: () => dialogRecorrencia.hide(),
        buttonModel: { content: 'OK', isPrimary: true, cssClass: 'custom-ok-button' }
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
                    popup: 'custom-popup',
                },
                title: 'Presta Atenção',
                text: 'A data final não pode ser maior que 365 dias após a data inicial.',
                icon: 'warning',
                confirmButtonText: 'Ok',
                backdrop: true, // Ensures SweetAlert2 has a backdrop like a modal;
                heightAuto: false, // Prevent layout issues;
                didOpen: () => {
                    // Ensure all modal-related backdrops and modals are hidden behind;
                    $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                    // Set z-index for SweetAlert2 container and backdrop;
                    $('.swal2-container').css({
                        'z-index': 9999, // Highest possible z-index;
                        'position': 'fixed', // Ensure it's positioned correctly;
                    });

                    $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                    // Force focus to SweetAlert2 to prevent modals from interfering;
                    Swal.getPopup().focus();
                },
                didClose: () => {
                    // Restore the Bootstrap backdrop after SweetAlert closes;
                    $('.modal-backdrop').css('z-index', '1040').show();

                    // Close the modal after success;
                    $("#modalAgendamento").hide();
                    $("body").removeClass("modal-open");
                    $("body").css("overflow", "auto");
                }
            });

            document.getElementById('txtFinalRecorrencia').value = '';
        }
    }
});

$(document).ready(function () {
    $('#btnFecha').on('click', function () {
        $('#modalViagens').hide();
        $("div").removeClass("modal-backdrop");

        $('body').removeClass('modal-open');
        $("body").css("overflow", "auto");
    });

    $('#btnFecharFicha').on('click', function () {
        $('#modalPrint').hide();
        $("div").removeClass("modal-backdrop");

        $('body').removeClass('modal-open');
        $("body").css("overflow", "auto");
    });

    var lstEvento = document.getElementById("lstEventos").ej2_instances[0];
    lstEvento.enabled = false; // To disable;

    document.getElementById("btnEvento").style.display = "none";

    InitializeCalendar("api/Agenda/CarregaViagens");
    PreencheListaSetores();
});

// Configura a Exibição do Modal de Viagens;
$('#modalViagens').on('shown.bs.modal', function (event) {
    //defaultRTE.refreshUI();
    $(document).off('focusin.modal');
    $("#btnConfirma").prop("disabled", false);

    var viagemId = document.getElementById("txtViagemId").value;
    var relatorioAsString = "";

    $.ajax({
        type: "GET",
        url: '/api/Agenda/RecuperaViagem',
        data: { id: viagemId },
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
            if (response.data.status == "Cancelada") {
                relatorioAsString = (response.data.finalidade != "Evento") ? "FichaCancelada.trdp" : "FichaEventoCancelado.trdp";
            } else if (response.data.finalidade == "Evento" && response.data.status != "Cancelada") {
                relatorioAsString = "FichaEvento.trdp";
            } else if (response.data.status == "Aberta" && response.data.finalidade != "Evento") {
                relatorioAsString = "FichaAberta.trdp";
            } else if (response.data.status == "Realizada") {
                relatorioAsString = (response.data.finalidade != "Evento") ? "FichaRealizada.trdp" : "FichaEventoRealizado.trdp";
            } else if (response.data.statusAgendamento == true) {
                relatorioAsString = (response.data.finalidade != "Evento") ? "FichaAgendamento.trdp" : "FichaEventoAgendado.trdp";
            }

            // Renderiza o relatório;
            $("#fichaReport")
                .telerik_ReportViewer({
                    serviceUrl: "/api/reports/",
                    reportSource: {
                        report: relatorioAsString,
                        parameters: { ViagemId: viagemId.toString().toUpperCase() }
                    },
                    viewMode: telerikReportViewer.ViewModes.PRINT_PREVIEW,
                    scaleMode: telerikReportViewer.ScaleModes.SPECIFIC,
                    scale: 1.0,
                    enableAccessibility: false,
                    sendEmail: { enabled: true }
                });

            ExibeViagem(response.data);
        }
    });

    const novaDataMinima = new Date();
    const datePickerElement = document.getElementById('txtDataInicial');
    const datePickerInstance = datePickerElement.ej2_instances[0]; // Acessando a instância;
    novaDataMinima.setDate(novaDataMinima.getDate() - 1); // Um dia antes de hoje;
    datePickerInstance.setProperties({ min: novaDataMinima });
    datePickerInstance.min = novaDataMinima;
    console.log("datePickerInstance");
}).on("hide.bs.modal", function (event) {
    // Remove o relatório e recria o container para o próximo uso;
    $("#fichaReport").remove();
    $("#ReportContainer").append("<div id='fichaReport' style='width:100%' class='pb-3'> Carregando... </div>");
    $("div").removeClass("modal-backdrop");
    $('body').removeClass('modal-open');
    location.reload();
});

var defaultRTE;
var StatusViagem = "Aberta";
var calendar;
var InserindoRequisitante = false;
var CarregandoAgendamento = false;

$.fn.modal.Constructor.prototype.enforceFocus = function () { };

function onCreate() {
    defaultRTE = this;
}

//Função necessária para o RTE;
function toolbarClick(e) {
    if (e.item.id == "rte_toolbar_Image") {
        var element = document.getElementById('rte_upload')
        element.ej2_instances[0].uploading = function upload(args) {
            args.currentRequest.setRequestHeader('XSRF-TOKEN', document.getElementsByName('__RequestVerificationToken')[0].value);
        }
    }
}

//Controla o Submit do Agendamento;
//================================
$("#btnViagem").click(function (event) {
    event.preventDefault()

    $("#btnViagem").hide();
    $("#btnConfirma").html("<i class='fa fa-save' aria-hidden='true'></i>Registra Viagem");

    document.getElementById("divNoFichaVistoria").style.display = 'block';
    document.getElementById("divDataFinal").style.display = 'block';
    document.getElementById("divHoraFinal").style.display = 'block';
    document.getElementById("divKmAtual").style.display = 'block';
    document.getElementById("divKmInicial").style.display = 'block';
    document.getElementById("divKmFinal").style.display = 'block';
    document.getElementById("divCombustivelInicial").style.display = 'block';
    document.getElementById("divCombustivelFinal").style.display = 'block';

    $("#txtStatusAgendamento").val(false);
});

//Controla o Apagar do Agendamento;
//================================
$("#btnApaga").click(async function (event) {
    var viagemId = document.getElementById("txtViagemId").value;
    var recorrenciaViagemId = document.getElementById("txtRecorrenciaViagemId").value;
    var rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];

    let titulo = ''

    if ((recorrenciaViagemId != null && recorrenciaViagemId != "") || recorrenciaViagemId != '00000000-0000-0000-0000-000000000000') {
        titulo = "Você gostaria de apagar todos os agendamentos recorrentes? Ou somente o atual?";
    }
    else {
        titulo = "Você gostaria de apagar este agendamento?";
    }


    const result = await Swal.fire({
        title: titulo,
        text: "Não será possível recuperar os dados eliminados!",
        icon: "warning",
        iconHtml: '<img src="/images/assustado.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
        customClass: {
            popup: 'custom-popup',
        },
        showCancelButton: true,
        confirmButtonText: 'Apagar Todos',
        cancelButtonText: 'Apenas Atual',
        dangerMode: true,
        heightAuto: false,
        showCloseButton: true,  // Habilita o botão de fechamento no canto superior direito
        didOpen: () => {
            $('.modal-backdrop').css('z-index', '1040').hide();
            $('.swal2-container').css({
                'z-index': 9999,
                'position': 'fixed'
            });
            $('.swal2-backdrop-show').css('z-index', 9998);
            Swal.getPopup().focus();
        },
        didClose: () => {
            $('.modal-backdrop').css('z-index', '1040').show();
        }
    });

    if (result.isConfirmed) {
        try {

            if (recorrenciaViagemId === '00000000-0000-0000-0000-000000000000')
            {
                await excluirAgendamento(viagemId);
                recorrenciaViagemId = viagemId
            }

            const agendamentosRecorrentes = await obterAgendamentosRecorrentes(recorrenciaViagemId);
            for (const agendamento of agendamentosRecorrentes) {
                await excluirAgendamento(agendamento.viagemId);
                await delay(200); // Adiciona um pequeno atraso para evitar problemas de múltiplas requisições.
            }
            toastr.success('Todos os agendamentos foram excluídos com sucesso!', { timeOut: 3000 });
            await delay(2000);
            $("#modalAgendamento").hide();
            $('body').removeClass('modal-open');
            $("body").css("overflow", "auto");
            location.reload();
        } catch (error) {
            console.error("Erro ao excluir agendamentos recorrentes:", error);
            toastr.error('Erro ao excluir os agendamentos recorrentes.');
        }
    } else {
        excluirAgendamento(viagemId);
        toastr.success('O agendamento foi excluído com sucesso!', { timeOut: 3000 });
        await delay(2000);
        $("#modalAgendamento").hide();
        $('body').removeClass('modal-open');
        $("body").css("overflow", "auto");
        location.reload();

    }
});

async function excluirAgendamento(viagemId) {
    var objAgendamento = JSON.stringify({ "ViagemId": viagemId });

    $.ajax({
        type: "post",
        url: '/api/Agenda/ApagaAgendamento',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: objAgendamento,
        success: function(data) {
            if (data.success) {
                toastr.success(data.message);
            //    $("#modalAgendamento").hide();
            //    $('body').removeClass('modal-open');
            //    $("body").css("overflow", "auto");
            //    location.reload();
            } else {
                toastr.error(data.message);
            }
        },
        error: function(err) {
            console.log("Erro:  " + err.responseText);
            alert('something went wrong');
        }
    });
}



// Controla o Cancelar do Agendamento;
// ==================================
$("#btnCancela").click(async function(event) {
    var viagemId = document.getElementById("txtViagemId").value;
    var recorrenciaViagemId = document.getElementById("txtRecorrenciaViagemId").value;
    var rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];

    let titulo = ''

    if ((recorrenciaViagemId != null && recorrenciaViagemId != "") || recorrenciaViagemId != '00000000-0000-0000-0000-000000000000') {
        titulo = "Você gostaria de cancelar todos os agendamentos recorrentes? Ou somente o atual?";
    }
    else
    {
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
        showCloseButton: true,  // Habilita o botão de fechamento no canto superior direito
        didOpen: () => {
            $('.modal-backdrop').css('z-index', '1040').hide();
            $('.swal2-container').css({
                'z-index': 9999,
                'position': 'fixed'
            });
            $('.swal2-backdrop-show').css('z-index', 9998);
            Swal.getPopup().focus();
        },
        didClose: () => {
            $('.modal-backdrop').css('z-index', '1040').show();
        }
    });

    if (result.isConfirmed) {
        try {


            if (recorrenciaViagemId === '00000000-0000-0000-0000-000000000000') {
                await excluirAgendamento(viagemId);
                recorrenciaViagemId = viagemId
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
            console.error("Erro ao cancelar agendamentos recorrentes:", error);
            toastr.error('Erro ao cancelar os agendamentos recorrentes.');
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
});


async function cancelarAgendamento(viagemId, descricao) {
    var objAgendamento = JSON.stringify({ "ViagemId": viagemId, "Descricao": descricao });

    $.ajax({
        type: "post",
        url: '/api/Agenda/CancelaAgendamento',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: objAgendamento,
        success: function(data) {
            if (data.success) {
                toastr.success(data.message);
            } else {
                toastr.error(data.message);
            }
        },
        error: function(err) {
            console.log("Erro: " + err.responseText);
            alert('something went wrong');
        }
    });
}


//Controla o Imprimir do Agendamento;
//==================================
$("#btnImprime").click(function (event) {
    //Imprime a Ficha do Agendamento;
    var viagemId = document.getElementById("txtViagemId").value;

    $("#fichaReport")
        .telerik_ReportViewer({
            serviceUrl: "/api/reports/",
            reportSource: {
                report: 'Agendamento.trdp',
                parameters: { ViagemId: viagemId.toString().toUpperCase() }
            },
            viewMode: telerikReportViewer.ViewModes.PRINT_PREVIEW,
            scaleMode: telerikReportViewer.ScaleModes.SPECIFIC,
            scale: 1.0,
            enableAccessibility: false,
            sendEmail: { enabled: true }
        });
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
    let DataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;

    let DataFinal = $("#txtDataFinal").val();

    if (DataFinal === '') {
        return;
    }

    if ((DataFinal < DataInicial)) {
        $("#txtDataFinal").val('');

        Swal.fire({
            iconHtml: '<img src="/images/eyebrown.jpg" style="width: 50px; height: 50px; border-radius: 50%;">',
            customClass: {
                popup: 'custom-popup',
            },
            title: 'Presta Atenção',
            text: 'A data final deve ser maior que a inicial!',
            icon: 'error',
            dangerMode: true,
            confirmButtonText: 'Ok',
            backdrop: true, // Ensures SweetAlert2 has a backdrop like a modal;
            heightAuto: false, // Prevent layout issues;
            didOpen: () => {
                // Ensure all modal-related backdrops and modals are hidden behind;
                $('.modal-backdrop').css('z-index', '1040').hide(); // Hide Bootstrap backdrop;

                // Set z-index for SweetAlert2 container and backdrop;
                $('.swal2-container').css({
                    'z-index': 9999, // Highest possible z-index;
                    'position': 'fixed', // Ensure it's positioned correctly;
                });

                $('.swal2-backdrop-show').css('z-index', 9998); // Just below the alert window;

                // Force focus to SweetAlert2 to prevent modals from interfering;
                Swal.getPopup().focus();
            },
            didClose: () => {
                // Restore the Bootstrap backdrop after SweetAlert closes;
                $('.modal-backdrop').css('z-index', '1040').show();

                // Close the modal after success;
                $("#modalAgendamento").hide();
                $("body").removeClass("modal-open");
                $("body").css("overflow", "auto");
            }
        });
    }
});

//Verifica se Data Inicial é maior que Data Final;
$("#txtDataInicial").focusout(function () {
    let DataInicial = document.getElementById("txtDataInicial").ej2_instances[0].value;
    let DataFinal = $("#txtDataFinal").val();

    if (DataInicial === '' || DataFinal === '') {
        return;
    }

    if ((DataInicial > DataFinal)) {
        $("#txtDataInicial").val('');
        Swal.fire({
            title: "Erro na Data",
            text: "A data inicial deve ser menor que a final!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok",
            }
        })
    }
});

//Verifica se Hora Final é menor que Hora Inicial e se tem Data Final;
$("#txtHoraFinal").focusout(function () {
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
                ok: "Ok",
            }
        });
    }

    if ((HoraFinal < HoraInicial) && (DataInicial === DataFinal)) {
        $("#txtHoraFinal").val('');
        Swal.fire({
            title: "Erro na Hora",
            text: "A hora final deve ser maior que a inicial!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok",
            }
        });
    }
});

//Verifica se Hora inicial é maior que Hora final;
$("#txtHoraInicial").focusout(function () {
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
                ok: "Ok",
            }
        });
    }
});

//Verifica se KM Final é menor que KM Inicial;
$("#txtKmFinal").focusout(function () {
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
                ok: "Ok",
            }
        })
    }

    if ((kmFinal - kmInicial) > 100) {
        Swal.fire({
            title: "Alerta na Quilometragem",
            text: "A quilometragem final excede em 100km a inicial!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok",
            }
        })
    }
});

//Verifica se KM Inicial é maior que KM Inicial;
$("#txtKmInicial").focusout(function () {
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
                ok: "Ok",
            }
        })
    }
});

//Verifica se KM Inicial é menor ou diferente de KM Atual;
$("#txtKmInicial").focusout(function () {
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
                ok: "Ok",
            }
        })
        return;
    }

    if (kmInicial != kmAtual) {
        //$("#txtKmInicial").val('');
        Swal.fire({
            title: "Erro na Quilometragem",
            text: "A quilometragem inicial não confere com a atual!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
            buttons: {
                ok: "Ok",
            }
        })
        return;
    }
});

//Preenche Lista de Eventos Após Inserção de um novo;
function PreencheListaEventos() {
    $.ajax({
        url: "/Viagens/Upsert?handler=AJAXPreencheListaEventos",
        method: "GET",
        datatype: "json",
        success: function (res) {
            try {
                var eventoid = res.data[0].eventoId;
                var nome = res.data[0].nome;

                console.log(eventoid + " " + nome);

                let EventoList = [{ "EventoId": eventoid, "Evento": nome }];

                for (var i = 1; i < res.data.length; ++i) {
                    console.log(res.data[i].eventoId + res.data[i].nome);

                    eventoid = res.data[i].eventoId;
                    nome = res.data[i].nome;

                    console.log(eventoid + " " + nome);

                    let evento = { EventoId: eventoid, Evento: nome }
                    EventoList.push(evento);
                }

                console.log(EventoList);

                document.getElementById("lstEventos").ej2_instances[0].fields.dataSource = EventoList;
            } catch (error) {
                console.error("An error occurred: ", error);
            }
        }
    });

    document.getElementById("lstEventos").ej2_instances[0].refresh();
}

//Preenche Lista de Setores Após Inserção de um novo;
function PreencheListaSetores() {
    $.ajax({
        url: "/Viagens/Upsert?handler=AJAXPreencheListaSetores",
        method: "GET",
        datatype: "json",
        success: function (res) {
            var setorSolicitanteId = res.data[0].setorSolicitanteId;
            var setorPaiId = res.data[0].setorPaiId;
            var nome = res.data[0].nome;
            var hasChild = res.data[0].hasChild;

            let SetorList = [{ "SetorSolicitanteId": setorSolicitanteId, "SetorPaiId": setorPaiId, "Nome": nome, "HasChild": hasChild }];

            for (var i = 1; i < res.data.length; ++i) {
                console.log(res.data[i].requisitanteId + res.data[i].requisitante);

                setorSolicitanteId = res.data[i].setorSolicitanteId;
                setorPaiId = res.data[i].setorPaiId;
                nome = res.data[i].nome;
                hasChild = res.data[i].hasChild;

                let setor = { "SetorSolicitanteId": setorSolicitanteId, "SetorPaiId": setorPaiId, "Nome": nome, "HasChild": hasChild }
                SetorList.push(setor);
            }

            console.log(SetorList);

            document.getElementById("ddtSetor").ej2_instances[0].fields.dataSource = SetorList;
            document.getElementById("ddtSetorPai").ej2_instances[0].fields.dataSource = SetorList;

            document.getElementById("ddtSetorRequisitante").ej2_instances[0].fields.dataSource = SetorList;
        }
    })

    document.getElementById("ddtSetor").ej2_instances[0].refresh();
    document.getElementById("ddtSetorPai").ej2_instances[0].refresh();

    document.getElementById("ddtSetorRequisitante").ej2_instances[0].refresh();
}

// Botão InserirEvento do Modal;
//===================================
$("#btnInserirEvento").click(async function (e) {
    e.preventDefault();

    if ($("#txtNomeDoEvento").val() === "") {
        Swal.fire({
            title: 'Atenção',
            text: "O Nome do Evento é obrigatório!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar",
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
                close: "Fechar",
            }
        });
        return;
    }

    if ($("#txtDataInicialEvento").ej2_instances[0].value === "") {
        Swal.fire({
            title: 'Atenção',
            text: "A Data Inicial é obrigatória!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar",
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
                close: "Fechar",
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
                close: "Fechar",
            }
        });
        return;
    }

    var setores = document.getElementById('lstSetorRequisitanteEvento').ej2_instances[0];
    if ((setores.value === null)) {
        Swal.fire({
            title: 'Atenção',
            text: "O Setor do Requisitante é obrigatório!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar",
            }
        });
        return;
    }
    var setorSolicitanteId = setores.value.toString();

    var requisitantes = document.getElementById('lstRequisitanteEvento').ej2_instances[0];
    if ((requisitantes.value === null)) {
        Swal.fire({
            title: 'Atenção',
            text: "O Requisitante é obrigatório!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar",
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
                    // Step 1: Wait for toastr to complete;
                    showToastrMessage(data.message);

                    // Step 2: Wait for PreencheListaEventos to complete if it's asynchronous;
                    await PreencheListaEventos();

                    // Access the ComboBox instance;
                    var comboBoxInstance = document.getElementById("lstEventos").ej2_instances[0];

                    // Ensure the dataSource is initialized and is an array;
                    var currentDataSource = comboBoxInstance.dataSource || [];

                    // Update the data source to make sure it includes the newly added event;
                    var newEvent = { text: data.nomeDoEvento, value: data.eventoid };
                    var updatedDataSource = currentDataSource.concat([newEvent]);

                    // Assign the updated data source back to the ComboBox;
                    comboBoxInstance.dataSource = updatedDataSource;

                    // Refresh the ComboBox binding;
                    comboBoxInstance.dataBind();

                    // Set the desired value to the new event;
                    comboBoxInstance.value = data.eventoid;

                    // Refresh the ComboBox again to reflect the selected value;
                    comboBoxInstance.dataBind();

                    // Log for debugging;
                    console.log("eventoId: " + data.eventoid);

                    // Hide the modal;
                    $("#modalEvento").hide();

                    // Hide the accordion;
                    document.getElementById("accordionEvento").style.display = "none";
                } catch (error) {
                    console.error("An error occurred during the success callback: ", error);
                }
            },
            error: function (data) {
                alert('error');
                console.log(data);
            }
        });
    } catch (error) {
        console.error("An error occurred: ", error);
    } finally {
        // Restore the cursor after completion;
        document.body.style.cursor = 'default';
    }

    // Function to show toastr message and wait for it to complete;
    function showToastrMessage(message) {
        return new Promise((resolve) => {
            toastr.success(message);
            setTimeout(resolve, 2000); // Adjust timeout as needed;
        });
    }
});

// Botão InserirRequisitante do Modal;
//===================================
$("#btnInserirRequisitante").click(function (e) {
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
                close: "Fechar",
            }
        });
        return;
    };

    if ($("#txtNome").val() === "") {
        Swal.fire({
            title: 'Atenção',
            text: "O Nome do Requisitante é obrigatório!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar",
            }
        });
        return;
    };

    if ($("#txtRamal").val() === "") {
        Swal.fire({
            title: 'Atenção',
            text: "O Ramal do Requisitante é obrigatório!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar",
            }
        });
        return;
    };

    var setores = document.getElementById('ddtSetorRequisitante').ej2_instances[0];
    if ((setores.value.toString() === '')) {
        Swal.fire({
            title: 'Atenção',
            text: "O Setor do Requisitante é obrigatório!",
            icon: "error",
            buttons: true,
            dangerMode: true,
            buttons: {
                close: "Fechar",
            }
        });
        return;
    };

    var setorSolicitanteId = setores.value.toString();

    var objRequisitante = JSON.stringify({ "Nome": $('#txtNome').val(), "Ponto": $('#txtPonto').val(), "Ramal": $('#txtRamal').val(), "Email": $('#txtEmail').val(), "SetorSolicitanteId": setorSolicitanteId })

    //debugger;

    $.ajax({
        type: "post",
        url: "/api/Viagem/AdicionarRequisitante",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: objRequisitante,

        success: function (data) {
            if (data.success) {
                toastr.success(data.message);
                document.getElementById("lstRequisitante").ej2_instances[0].addItem({ RequisitanteId: data.requisitanteid, Requisitante: $('#txtNome').val() + " - " + $('#txtPonto').val() }, 0);

                document.getElementById("accordionRequisitante").style.display = "none"; // Esconde a DIV;

                console.log("Passei por todas as etapas do Sucess do Adiciona Requisitante no AJAX");

                // Access the ComboBox instance;
                var comboBoxInstance = document.getElementById("lstRequisitante").ej2_instances[0];

                // Set the desired value;
                comboBoxInstance.value = data.requisitanteid; // Replace 'desiredValue' with the actual value;

                // Refresh the ComboBox;
                comboBoxInstance.dataBind();

                console.log(data.requisitanteid);
            }
            else {
                toastr.error(data.message);
            }
        },
        error: function (data) {
            toastr.error("Já existe um requisitante com este ponto/nome");
            console.log(data);
        }
    });
});

// Esconde o Accordion de Requisitante;
document.getElementById('btnFecharAccordionRequisitante').onclick = function () {
    document.getElementById("accordionRequisitante").style.display = "none"; // Esconde a DIV;
};

// Esconde o Accordion de Setor;
document.getElementById('btnFecharAccordionSetor').onclick = function () {
    document.getElementById("accordionSetor").style.display = "none"; // Esconde a DIV;
};

// Esconde o Accordion de Evento;
document.getElementById('btnFecharAccordionEvento').onclick = function () {
    document.getElementById("accordionEvento").style.display = "none"; // Esconde a DIV;
};

document.addEventListener("DOMContentLoaded", function () {
    // Initialize selectedDates array;
    let selectedDates = [];

    // Function to update the Badge (Bootstrap Badge)
    function updateBadge() {

        const selectedDatesHTML = document.querySelectorAll("#lstDiasCalendarioHTML li").length; // Supondo que os itens estão em uma lista

        const badge = document.getElementById("itensBadge");
        badge.textContent = selectedDates.length;

        const badgeHTML = document.getElementById("itensBadgeHTML");
        badgeHTML.textContent = selectedDatesHTML.length;
    }

    // Function to format Date to dd/mm/yyyy;
    function formatDate(dateObj) {
        const day = ("0" + dateObj.getDate()).slice(-2);
        const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
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
        noRecordsTemplate: "Sem dias escolhidos..",
    });

    // Render the ListBox inside the #lstDiasCalendario element;
    listBox.appendTo("#lstDiasCalendario");

    // Function to add a date;
    function addDate(dateObj) {
        const timestamp = new Date(dateObj).setHours(0, 0, 0, 0); // Normalize time;
        if (!selectedDates.some((d) => d.Timestamp === timestamp)) {
            selectedDates.push({
                Timestamp: timestamp,
                DateText: formatDate(new Date(timestamp)),
            });
            selectedDates.sort((a, b) => a.Timestamp - b.Timestamp);
            console.log("Adding date:", selectedDates); // Debugging statement;
            listBox.dataSource = selectedDates;
            listBox.dataBind(); // Update the ListBox;
            updateBadge();
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
        min: new Date(), // Set minimum selectable date as the current date;
        // Set locale to Portuguese (Brazil)
        locale: "pt-BR",
        // Event handler for date selection;
        change: function (args) {
            const selectedDatesArray = args.values;
            selectedDates = [];
            selectedDatesArray.forEach((d) => {
                const normalizedTimestamp = new Date(d).setHours(0, 0, 0, 0);
                selectedDates.push({
                    Timestamp: normalizedTimestamp,
                    DateText: formatDate(new Date(normalizedTimestamp)),
                });
            });
            // Sort the selectedDates;
            selectedDates.sort((a, b) => a.Timestamp - b.Timestamp);
            console.log("Selected dates changed:", selectedDates); // Debugging statement;
            // Update ListBox dataSource;
            listBox.dataSource = selectedDates;
            listBox.dataBind();
            // Update the Badge;
            updateBadge();
        },
    });

    calendar.appendTo("#calDatasSelecionadas");

    // Function to remove a date;
    window.removeDate = function (timestamp) {
        selectedDates = selectedDates.filter((d) => d.Timestamp !== timestamp);
        console.log("Removing date:", selectedDates); // Debugging statement;
        listBox.dataSource = selectedDates;
        listBox.dataBind();
        updateBadge();

        // Update Calendar selection;
        const calendarObj = document.getElementById("calDatasSelecionadas").ej2_instances[0];
        const dateToRemove = new Date(timestamp);

        // Get currently selected dates from calendar;
        let currentSelectedDates = calendarObj.values;

        // Remove the date from calendar if it exists;
        currentSelectedDates = currentSelectedDates.filter(date => {
            const normalizedDate = new Date(date).setHours(0, 0, 0, 0);
            return normalizedDate !== timestamp;
        });
        calendarObj.values = currentSelectedDates; // Set the updated list of selected dates;
    };
});

// Função chamada quando há alteração nas datas selecionadas;
function onDateChange(args) {
    // Atualiza a lista de datas selecionadas;
    selectedDates = args.values;
}

// Create the data source;
var dataRecorrente = [
    { text: 'Sim', value: 'S' },
    { text: 'Não', value: 'N' }
];

// Initialize the DropDownList component;
var dropDownListRecorrente = new ej.dropdowns.DropDownList({
    // Set the data source;
    dataSource: dataRecorrente,
    // Map fields;
    fields: { text: 'text', value: 'value' },
    // Set the default value to "Não"
    value: 'N',
    // Optional: Add placeholder text;
    placeholder: 'Selecione uma opção',
    // Add the change event handler;
    change: function (e) {
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
        else {
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
    }
});
// Render the DropDownList;
dropDownListRecorrente.appendTo('#lstRecorrente');

// Create the data source;
var data = [
    { text: 'Diário', value: 'D' },
    { text: 'Semanal', value: 'S' },
    { text: 'Quinzenal', value: 'Q' },
    { text: 'Mensal', value: 'M' },
    { text: 'Dias Variados', value: 'V' }
];

// Initialize the DropDownList component;
var dropDownListObject = new ej.dropdowns.DropDownList({
    // Set the data source;
    dataSource: data,
    // Map fields;
    fields: { text: 'text', value: 'value' },
    // Set the default value to null (no selection)
    value: null,
    // Add placeholder text;
    placeholder: 'Selecione um período',
    // Add the change event handler;
    change: function (e) {
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
            }
            else if (selectedValue === 'V') {
                var calendarContainer = document.getElementById("calendarContainer");
                calendarContainer.style.display = "block";

                var listboxContainer = document.getElementById("listboxContainer");
                listboxContainer.style.display = "block";

                document.getElementById("divDias").style.display = "none";
                document.getElementById("divFinalRecorrencia").style.display = "none";
                document.getElementById("divFinalFalsoRecorrencia").style.display = "none";
            }
            else if (selectedValue === 'D') {
                document.getElementById("divDias").style.display = "none";
                document.getElementById("divFinalRecorrencia").style.display = "block";
                document.getElementById("divFinalFalsoRecorrencia").style.display = "none";

                var calendarContainer = document.getElementById("calendarContainer");
                calendarContainer.style.display = "none";

                var listboxContainer = document.getElementById("listboxContainer");
                listboxContainer.style.display = "none";
            }
            else if(selectedValue === 'M')
            {
                document.getElementById("divDiaMes").style.display = "block";
                document.getElementById("divFinalRecorrencia").style.display = "block";
                document.getElementById("divFinalFalsoRecorrencia").style.display = "none";

                var calendarContainer = document.getElementById("calendarContainer");
                calendarContainer.style.display = "none";

                var listboxContainer = document.getElementById("listboxContainer");
                listboxContainer.style.display = "none";
            }
            else
            {  
                document.getElementById("divDias").style.display = "block";
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
    }
});
// Render the DropDownList;
dropDownListObject.appendTo('#lstPeriodos');

document.addEventListener("DOMContentLoaded", function () {
    // Initialize the MultiSelect component after the DOM is ready;
    var multiSelect = new ej.dropdowns.MultiSelect({
        placeholder: 'Selecione os dias...',
        dataSource: [,
            { id: "Monday", name: "Segunda" },
            { id: "Tuesday", name: "Terça" },
            { id: "Wednesday", name: "Quarta" },
            { id: "Thursday", name: "Quinta" },
            { id: "Friday", name: "Sexta" },
            { id: "Saturday", name: "Sábado" },
            { id: "Sunday", name: "Domingo" }
        ],
        fields: { text: 'name', value: 'id' },
        maximumSelectionLength: 7,
        change: function (args) {
            let itemValue = args.item ? args.item.value : null;
            if (itemValue && multiSelect.value.includes(itemValue)) {
                multiSelect.value = multiSelect.value.filter(value => value !== itemValue);
                multiSelect.dataBind(); // Apply the changes;
            }
        }
    });
    // Append the MultiSelect component to the div with id lstDias;
    multiSelect.appendTo('#lstDias');
});

document.addEventListener("DOMContentLoaded", function () {
    // Obtendo a data atual;
    let hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Inicializando o DatePicker da Syncfusion;
    new ej.calendars.DatePicker({
        min: hoje, // Definindo a data mínima como a data atual;
        strictMode: false,
        format: 'dd/MM/yyyy',
        placeholder: "",
    }, '#txtFinalRecorrencia');


    // Inicializando o DatePicker da Syncfusion sem definir o valor inicial;
    let datePicker = new ej.calendars.DatePicker({
        min: hoje, // Definindo a data mínima como a data atual;
        format: 'dd/MM/yyyy',
        focus: function (event) {
            console.log("DatePicker focused!");
            console.log(event);
        },
        change: function (event) {
            // Obtendo a data selecionada no primeiro DatePicker
            let dataSelecionada = event.value;

            // Atualizando a data mínima do segundo DatePicker
            datePickerFinal.min = dataSelecionada;
        }
    }, '#txtDataInicial');

    setTimeout(function () {
        datePicker.value = hoje;
    }, 100); // Ajuste o valor após 100 ms para garantir que o componente foi carregado

    // Definindo o valor após a inicialização;
    datePicker.value = hoje;

    // Inicializando o segundo DatePicker da Syncfusion
    let datePickerFinal = new ej.calendars.DatePicker({
        min: hoje, // Definindo a data mínima como a data atual;
        format: 'dd/MM/yyyy',
    }, '#txtDataFinal');

    // Inicializa o TextBox da Syncfusion;
    var textBox = new ej.inputs.TextBox({
        placeholder: 'Selecione a data', // Opcional: adicione um placeholder;
    });
    textBox.appendTo('#txtDataFinalRecorrencia');
});

//Editor de Texto;
let rteDescricao = document.getElementById("rteDescricao").ej2_instances[0];

rteDescricao.addEventListener('paste', function (event) {
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
                    // Obtém a string Base64 da imagem;
                    var base64Image = reader.result.split(',')[1];

                    // Construa o HTML com a imagem embutida em Base64;
                    var pastedHtml = `<img src="data:image/png;base64,${base64Image}" />`;

                    // Insira a imagem no editor usando o HTML formatado com Base64;
                    editor.insertHtml(pastedHtml);  // Insere diretamente a imagem no editor;
                };

                // Lê o arquivo como Base64;
                reader.readAsDataURL(blob);
                break;  // Interrompe a iteração após encontrar a primeira imagem;
            }
        }
    }
});

// Render the Syncfusion DropDownList control
var dias = [];
for (var i = 1; i <= 31; i++) {
    dias.push({ text: i.toString(), value: i }); // Deixe value como inteiro
}

var dropdownObj = new ej.dropdowns.DropDownList({
    // Set the data source
    dataSource: dias,
    // Map text and value fields
    fields: { text: 'text', value: 'value' },
    // Set the float label type to "Always" for consistent label display
    floatLabelType: 'Always'
});
// Append the dropdown to the target element
dropdownObj.appendTo('#lstDiasMes');
