
let carrinho = [];

// Histórico temporário de pedidos
let pedidosDemonstrativos = [];

let sequenciaPedidos = 1;

// Etapas possíveis do pedido
const etapasPedido = [
    "Recebido",
    "Em preparação",
    "Pronto para retirada",
    "Entregue"
];

// Adicionar produto ao carrinho
function adicionarCarrinho(id) {

    const produto = produtos.find(p => p.id === id);

    if (!produto) return;

    const estoqueDisponivel = obterEstoque(produto);
    if (estoqueDisponivel <= 0) {
        alert("Este produto está indisponível na unidade selecionada.");
        return;
    }

    const itemExistente = carrinho.find(p => p.id === id);

    if (itemExistente) {
        if (itemExistente.quantidade >= estoqueDisponivel) {
            alert(`Estoque máximo disponível: ${estoqueDisponivel} unidade(s).`);
            return;
        }
        itemExistente.quantidade++;
    } else {
        carrinho.push({
            ...produto,
            quantidade: 1,
            unidadeId: unidadeSelecionada
        });
    }

    atualizarCarrinho();
}

// Remover produto do carrinho
function removerCarrinho(id) {

    carrinho = carrinho.filter(p => p.id !== id);

    atualizarCarrinho();
}

// Alterar quantidade
function alterarQuantidade(id, quantidade) {

    const item = carrinho.find(p => p.id === id);

    if (!item) return;

    if (quantidade > 0) {
        const produtoOriginal = produtos.find(p => p.id === id);
        const estoqueDisponivel = obterEstoque(produtoOriginal);
        if (item.quantidade >= estoqueDisponivel) {
            alert(`Estoque máximo disponível: ${estoqueDisponivel} unidade(s).`);
            return;
        }
    }

    item.quantidade += quantidade;

    if (item.quantidade <= 0) {
        removerCarrinho(id);
        return;
    }

    atualizarCarrinho();
}

// Calcular valor total
function calcularTotal() {

    return carrinho.reduce((total, produto) => {
        return total + (produto.preco * produto.quantidade);
    }, 0);

}

// Atualizar quantidade de itens
function atualizarCarrinho() {

    const quantidade = carrinho.reduce((total, produto) => {
        return total + produto.quantidade;
    }, 0);

    document.getElementById("quantidade").textContent = quantidade;

    mostrarCarrinho();
}

// Exibir produtos selecionados
function mostrarCarrinho() {

    const lista = document.getElementById("listaCarrinho");

    if (!lista) return;

    lista.innerHTML = "";

    carrinho.forEach(produto => {

        lista.innerHTML += `
            <div class="item-carrinho">

                <h3>${produto.nome}</h3>

                <p>R$ ${produto.preco.toFixed(2).replace(".", ",")}</p>
                <p>Disponível nesta unidade: ${obterEstoque(produtos.find(p => p.id === produto.id))}</p>

                <button onclick="alterarQuantidade(${produto.id}, -1)">
                    -
                </button>

                ${produto.quantidade}

                <button onclick="alterarQuantidade(${produto.id}, 1)">
                    +
                </button>

                <button onclick="removerCarrinho(${produto.id})">
                    Remover
                </button>

            </div>
        `;

    });

    document.getElementById("totalCarrinho").textContent =
        "R$ " + calcularTotal().toFixed(2).replace(".", ",");

}
function abrirCarrinho() {
    const painel = document.getElementById("areaCarrinho");
    const fundo = document.getElementById("fundoCarrinho");

    if (!painel || !fundo) {
        console.error("Painel ou fundo do carrinho não encontrado.");
        return;
    }

    painel.classList.add("ativo");
    fundo.classList.add("ativo");

    mostrarCarrinho();
}

function fecharCarrinho() {
    document.getElementById("areaCarrinho")?.classList.remove("ativo");
    document.getElementById("fundoCarrinho")?.classList.remove("ativo");
}

// Fechar utilizando a tecla ESC
document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        fecharCarrinho();
        fecharPrivacidade();
        fecharFinalizacao();
        fecharAcompanhamento();
    }

});

document.getElementById("areaCarrinho").addEventListener("click", function(event) {
    event.stopPropagation();
});

// Abrir tela de finalização
function finalizarPedido() {

    if (carrinho.length === 0) {
        alert("Adicione produtos ao carrinho antes de continuar.");
        return;
    }

    const modal = document.getElementById("modalFinalizacao");

    if (!modal) return;

    modal.hidden = false;

    document.getElementById("formularioPedido").hidden = false;
    document.getElementById("resultadoPedido").hidden = true;

    document.body.style.overflow = "hidden";

    fecharCarrinho();

    document.getElementById("nomeCliente").focus();
}

// Fechar tela de finalização
function fecharFinalizacao() {

    const modal = document.getElementById("modalFinalizacao");

    if (!modal) return;

    modal.hidden = true;

    // Limpa os dados pessoais da interface ao encerrar a tela.
    document.getElementById("formPedido")?.reset();
    document.getElementById("formularioPedido").hidden = false;
    document.getElementById("resultadoPedido").hidden = true;
    document.getElementById("resumoPedido").textContent = "";

    const privacidadeAberta = !document.getElementById("modalPrivacidade")?.hidden;
    document.body.style.overflow = privacidadeAberta ? "hidden" : "";

    document.getElementById("btnCarrinho")?.focus();
}

// Confirmar pedido demonstrativo
function confirmarPedido(event) {

    event.preventDefault();

    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio.");
        fecharFinalizacao();
        return;
    }

    const formulario = document.getElementById("formPedido");

    if (!formulario.reportValidity()) return;

    const nome = document.getElementById("nomeCliente").value.trim();
    const telefone = document.getElementById("telefoneCliente").value.trim();
    const endereco = document.getElementById("enderecoCliente").value.trim();

    if (!nome || !telefone || !endereco) {
        alert("Preencha todos os campos.");
        return;
    }

    if (!document.getElementById("leituraPrivacidade").checked) {
        alert("Leia e confirme as informações de privacidade.");
        return;
    }

    // Verifica novamente o estoque
    for (const item of carrinho) {

        const produtoOriginal = produtos.find(
            produto => produto.id === item.id
        );

        if (
            !produtoOriginal ||
            obterEstoque(produtoOriginal) < item.quantidade
        ) {
            alert(`Estoque insuficiente para ${item.nome}. Revise o carrinho.`);
            fecharFinalizacao();
            carregarProdutos();
            return;
        }
    }

    const unidadeDoPedido = unidades.find(
        unidade => unidade.id === unidadeSelecionada
    );

    const numeroPedido =
        `RN-${String(sequenciaPedidos).padStart(4, "0")}`;

    sequenciaPedidos++;

    const itensPedido = carrinho.map(item => ({
        id: item.id,
        nome: item.nome,
        preco: item.preco,
        quantidade: item.quantidade
    }));

    const totalPedido = calcularTotal();
    // Pontuação demonstrativa do cliente autenticado
    let pontosGanhos = 0;

    if (typeof adicionarPontosFidelidade === "function") {

        pontosGanhos = adicionarPontosFidelidade(totalPedido);

    }

    // Registro do pedido sem dados pessoais
    const pedido = {

        id: numeroPedido,

        unidade: unidadeDoPedido?.nome || "Unidade não identificada",

        unidadeId: unidadeSelecionada,

        itens: itensPedido,

        total: totalPedido,

        status: "Recebido",

        historico: [{
            status: "Recebido",
            horario: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            })
        }],

        estoqueRestaurado: false
    };

    pedidosDemonstrativos.unshift(pedido);

    // Baixa demonstrativa do estoque
    carrinho.forEach(item => {

        const produtoOriginal = produtos.find(
            produto => produto.id === item.id
        );

        produtoOriginal.estoquePorUnidade[unidadeSelecionada]
            -= item.quantidade;

    });

    // Monta o resumo da confirmação
    let resumo = `PEDIDO: ${numeroPedido}\n`;

    resumo += "UNIDADE: " + pedido.unidade + "\n";
    resumo += "CLIENTE: " + nome + "\n";
    resumo += "TELEFONE: " + telefone + "\n";
    resumo += "ENDEREÇO: " + endereco + "\n\n";

    resumo += "PRODUTOS:\n";

    itensPedido.forEach(item => {

        resumo += `${item.nome} - ${item.quantidade} unidade(s) - R$ ${
            (item.preco * item.quantidade)
                .toFixed(2)
                .replace(".", ",")
        }\n`;

    });

    resumo += "\nTOTAL: R$ " +
        totalPedido.toFixed(2).replace(".", ",");
    if (usuarioAtual) {

        resumo += "\nCLIENTE CADASTRADO: " +
            usuarioAtual.nome;

        resumo += "\nPONTOS GANHOS: " +
            pontosGanhos;

    } else {

        resumo += "\nPONTOS: Faça login para participar do programa de fidelidade.";

    }
    document.getElementById("resumoPedido").textContent = resumo;

    document.getElementById("formularioPedido").hidden = true;
    document.getElementById("resultadoPedido").hidden = false;

    // Limpa os campos pessoais do formulário
    formulario.reset();

    // Esvazia o carrinho
    carrinho = [];

    atualizarCarrinho();

    if (typeof carregarProdutos === "function") {
        carregarProdutos();
    }

    if (typeof atualizarPainelEstoque === "function") {
        atualizarPainelEstoque();
    }
}
// Evita inserção de HTML não confiável nos dados exibidos
function escaparTextoPedido(valor) {

    return String(valor).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);

}


// Abrir acompanhamento
function abrirAcompanhamento() {

    const modal = document.getElementById("modalAcompanhamento");

    if (!modal) return;

    const modalFinalizacao =
        document.getElementById("modalFinalizacao");

    // Se veio da confirmação, limpa o resumo com dados pessoais
    if (modalFinalizacao && !modalFinalizacao.hidden) {

        document.getElementById("resumoPedido").textContent = "";

        document.getElementById("formPedido")?.reset();

        document.getElementById("formularioPedido").hidden = false;

        document.getElementById("resultadoPedido").hidden = true;

        modalFinalizacao.hidden = true;
    }

    modal.hidden = false;

    document.body.style.overflow = "hidden";

    renderizarAcompanhamento();

    modal.querySelector(".fechar")?.focus();
}


// Fechar acompanhamento
function fecharAcompanhamento() {

    const modal = document.getElementById("modalAcompanhamento");

    if (!modal) return;

    modal.hidden = true;

    const outraModalAberta =
        !document.getElementById("modalFinalizacao")?.hidden ||
        !document.getElementById("modalPrivacidade")?.hidden;

    document.body.style.overflow =
        outraModalAberta ? "hidden" : "";

    document.getElementById("btnAcompanharPedido")?.focus();
}


// Mostrar pedidos
function renderizarAcompanhamento() {

    const lista = document.getElementById("listaPedidos");

    if (!lista) return;

    if (pedidosDemonstrativos.length === 0) {

        lista.innerHTML = `
            <p class="sem-pedidos">
                Nenhum pedido foi registrado nesta sessão.
                Faça um pedido demonstrativo para acompanhar seu andamento.
            </p>
        `;

        return;
    }

    lista.innerHTML = pedidosDemonstrativos.map(pedido => {

        const cancelado = pedido.status === "Cancelado";

        const entregue = pedido.status === "Entregue";

        const etapaAtual = etapasPedido.indexOf(pedido.status);

        // Monta as etapas
        const linhaEtapas = etapasPedido.map((etapa, indice) => {

            const concluida =
                !cancelado && indice <= etapaAtual;

            const atual =
                !cancelado && indice === etapaAtual;

            return `
                <div class="etapa-pedido
                    ${concluida ? "concluida" : ""}
                    ${atual ? "atual" : ""}">

                    <span class="marcador-etapa">
                        ${concluida ? "✓" : indice + 1}
                    </span>

                    <span>${etapa}</span>

                </div>
            `;

        }).join("");

        // Histórico
        const historico = pedido.historico.map(registro => `
            <li>
                <strong>${escaparTextoPedido(registro.status)}</strong>
                — ${escaparTextoPedido(registro.horario)}
            </li>
        `).join("");

        // Produtos
        const itens = pedido.itens.map(item => `
            <li>
                ${escaparTextoPedido(item.nome)}
                × ${item.quantidade}
            </li>
        `).join("");

        let botoes = "";

        if (!entregue && !cancelado) {

            botoes += `
                <button
                    type="button"
                    onclick="avancarStatusPedido('${pedido.id}')">
                    Simular próxima etapa
                </button>
            `;

            if (
                pedido.status === "Recebido" ||
                pedido.status === "Em preparação"
            ) {

                botoes += `
                    <button
                        type="button"
                        class="btn-cancelar-pedido"
                        onclick="cancelarPedidoDemonstrativo('${pedido.id}')">
                        Cancelar pedido
                    </button>
                `;
            }
        }

        return `
            <article class="cartao-pedido">

                <div class="topo-pedido">

                    <div>
                        <h3>${escaparTextoPedido(pedido.id)}</h3>

                        <p>
                            ${escaparTextoPedido(pedido.unidade)}
                        </p>
                    </div>

                    <span class="badge-status
                        ${cancelado ? "status-cancelado" : ""}
                        ${entregue ? "status-entregue" : ""}">

                        ${escaparTextoPedido(pedido.status)}

                    </span>

                </div>

                <div class="linha-etapas">

                    ${linhaEtapas}

                    ${cancelado ? `
                        <p class="aviso-cancelamento">
                            Este pedido foi cancelado.
                        </p>
                    ` : ""}

                </div>

                <details class="detalhes-pedido">

                    <summary>Ver itens e histórico</summary>

                    <ul>${itens}</ul>

                    <p>
                        <strong>Total:</strong>
                        R$ ${pedido.total.toFixed(2).replace(".", ",")}
                    </p>

                    <h4>Histórico de atualização</h4>

                    <ul>${historico}</ul>

                </details>

                <div class="acoes-pedido">
                    ${botoes}
                </div>

            </article>
        `;

    }).join("");
}


// Registrar mudança de status
function registrarHistoricoPedido(pedido, novoStatus) {

    pedido.status = novoStatus;

    pedido.historico.push({

        status: novoStatus,

        horario: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        })

    });
}


// Avançar para a próxima etapa
function avancarStatusPedido(pedidoId) {

    const pedido = pedidosDemonstrativos.find(
        item => item.id === pedidoId
    );

    if (!pedido) return;

    const indiceAtual = etapasPedido.indexOf(pedido.status);

    if (
        indiceAtual < 0 ||
        indiceAtual >= etapasPedido.length - 1
    ) {
        return;
    }

    registrarHistoricoPedido(
        pedido,
        etapasPedido[indiceAtual + 1]
    );

    renderizarAcompanhamento();
}


// Cancelar pedido
function cancelarPedidoDemonstrativo(pedidoId) {

    const pedido = pedidosDemonstrativos.find(
        item => item.id === pedidoId
    );

    if (!pedido) return;

    if (
        !["Recebido", "Em preparação"].includes(pedido.status)
    ) {
        return;
    }

    const confirmou = confirm(
        `Deseja cancelar o pedido ${pedido.id}?`
    );

    if (!confirmou) return;

    registrarHistoricoPedido(pedido, "Cancelado");

    // Devolve o estoque à unidade original do pedido
    if (!pedido.estoqueRestaurado) {

        pedido.itens.forEach(item => {

            const produtoOriginal = produtos.find(
                produto => produto.id === item.id
            );

            if (produtoOriginal) {

                const unidadeDoPedido = pedido.unidadeId;

                produtoOriginal.estoquePorUnidade[unidadeDoPedido] =
                    (produtoOriginal.estoquePorUnidade[unidadeDoPedido] || 0)
                    + item.quantidade;
            }

        });

        pedido.estoqueRestaurado = true;
    }

    if (typeof carregarProdutos === "function") {
        carregarProdutos();
    }

    if (typeof atualizarPainelEstoque === "function") {
        atualizarPainelEstoque();
    }

    renderizarAcompanhamento();
}


// Fechar acompanhamento clicando fora do conteúdo
document.getElementById("modalAcompanhamento")
    ?.addEventListener("click", function(event) {

        if (event.target === this) {
            fecharAcompanhamento();
        }

    });

// Fechar modal clicando fora do conteúdo
document.getElementById("modalFinalizacao")
    ?.addEventListener("click", function(event) {

        if (event.target === this) {
            fecharFinalizacao();
        }

    });
