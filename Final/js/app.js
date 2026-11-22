const cardapio = document.getElementById("cardapio");
let categoriaAtual = "Todos";

function carregarProdutos(categoria = categoriaAtual) {
    categoriaAtual = categoria;
    cardapio.innerHTML = "";

    const lista = produtos.filter(produto =>
        categoria === "Todos" || produto.categoria === categoria
    );

    const cartoes = lista.map(produto => {
        const estoque = obterEstoque(produto);
        const disponivel = estoque > 0;
        const imagem = produto.imagem
            ? `<img src="${produto.imagem}" alt="${produto.nome}" width="640" height="480" loading="lazy" decoding="async">`
            : `<div class="imagem-placeholder" aria-label="Imagem ilustrativa não cadastrada">🥘</div>`;

        return `
            <article class="produto ${disponivel ? "" : "produto-indisponivel"}">
                ${imagem}
                <h3>${produto.nome}</h3>
                <p class="preco-produto">R$ ${produto.preco.toFixed(2).replace(".", ",")}</p>
                <p class="status-produto ${disponivel ? "disponivel" : "indisponivel"}">
                    ${disponivel ? `Disponível (${estoque} em estoque)` : "Indisponível nesta unidade"}
                </p>
                <button type="button" onclick="adicionarCarrinho(${produto.id})" ${disponivel ? "" : "disabled"}>
                    ${disponivel ? "Adicionar ao carrinho" : "Indisponível"}
                </button>
            </article>
        `;
    });

    cardapio.innerHTML = cartoes.join("");

    if (lista.length === 0) {
        cardapio.innerHTML = '<p class="sem-produtos">Nenhum produto encontrado nesta categoria.</p>';
    }
}

function filtrar(categoria) {
    carregarProdutos(categoria);
}

function atualizarInformacaoUnidade() {
    const unidade = unidades.find(item => item.id === unidadeSelecionada);
    const informacao = document.getElementById("informacaoUnidade");
    if (unidade && informacao) {
        informacao.textContent = `${unidade.nome}: ${unidade.descricao}`;
    }
}

function alterarUnidade(novaUnidadeId) {
    const unidadeExiste = unidades.some(unidade => unidade.id === novaUnidadeId);
    const seletor = document.getElementById("selectUnidade");
    if (!unidadeExiste) {
        seletor.value = unidadeSelecionada;
        return;
    }

    if (novaUnidadeId === unidadeSelecionada) return;

    if (typeof carrinho !== "undefined" && carrinho.length > 0) {
        const confirmou = confirm(
            "Trocar de unidade vai esvaziar o carrinho atual. Deseja continuar?"
        );

        if (!confirmou) {
            seletor.value = unidadeSelecionada;
            return;
        }

        carrinho = [];
        atualizarCarrinho();
    }

    unidadeSelecionada = novaUnidadeId;
    seletor.value = unidadeSelecionada;
    atualizarInformacaoUnidade();
    carregarProdutos(categoriaAtual);
    atualizarPainelEstoque();
}

function atualizarPainelEstoque() {
    const seletorProduto = document.getElementById("produtoEstoque");
    if (!seletorProduto) return;

    const valorAnterior = seletorProduto.value;
    seletorProduto.innerHTML = produtos.map(produto =>
        `<option value="${produto.id}">${produto.nome}</option>`
    ).join("");

    if (produtos.some(produto => String(produto.id) === valorAnterior)) {
        seletorProduto.value = valorAnterior;
    }

    preencherEstoqueAtual();
}

function preencherEstoqueAtual() {
    const seletorProduto = document.getElementById("produtoEstoque");
    const campoQuantidade = document.getElementById("quantidadeEstoque");
    if (!seletorProduto || !campoQuantidade) return;

    const produto = produtos.find(item => item.id === Number(seletorProduto.value));
    if (produto) campoQuantidade.value = obterEstoque(produto);
}

function salvarEstoqueDemonstrativo() {
    const produtoId = Number(document.getElementById("produtoEstoque").value);
    const campoQuantidade = document.getElementById("quantidadeEstoque");
    const mensagem = document.getElementById("mensagemEstoque");
    const produto = produtos.find(item => item.id === produtoId);
    const novaQuantidade = Number(campoQuantidade.value);

    if (!produto || !Number.isInteger(novaQuantidade) || novaQuantidade < 0 || novaQuantidade > 999) {
        mensagem.textContent = "Informe uma quantidade inteira entre 0 e 999.";
        return;
    }

    if (typeof carrinho !== "undefined") {
        const itemNoCarrinho = carrinho.find(item => item.id === produtoId);
        if (itemNoCarrinho && itemNoCarrinho.quantidade > novaQuantidade) {
            mensagem.textContent = "A quantidade não pode ficar abaixo do que já está no carrinho. Reduza o carrinho primeiro.";
            return;
        }
    }

    produto.estoquePorUnidade[unidadeSelecionada] = novaQuantidade;
    mensagem.textContent = `Estoque de ${produto.nome} atualizado para ${novaQuantidade} unidade(s) em ${unidades.find(item => item.id === unidadeSelecionada).nome}.`;
    carregarProdutos(categoriaAtual);
}

// Política de Privacidade
let elementoAnteriorPrivacidade = null;

function abrirPrivacidade() {
    const modal = document.getElementById("modalPrivacidade");
    if (!modal) return;
    elementoAnteriorPrivacidade = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".fechar")?.focus();
}

function fecharPrivacidade() {
    const modal = document.getElementById("modalPrivacidade");
    if (!modal) return;
    modal.hidden = true;

    const finalizacaoAberta = !document.getElementById("modalFinalizacao")?.hidden;
    const carrinhoAberto = document.getElementById("areaCarrinho")?.classList.contains("ativo");
    document.body.style.overflow = (finalizacaoAberta || carrinhoAberto) ? "hidden" : "";

    if (elementoAnteriorPrivacidade?.focus) {
        elementoAnteriorPrivacidade.focus();
    } else {
        document.getElementById("btnPrivacidade")?.focus();
    }
    elementoAnteriorPrivacidade = null;
}

document.getElementById("modalPrivacidade")?.addEventListener("click", function(event) {
    if (event.target === this) fecharPrivacidade();
});

// Inicialização
document.getElementById("selectUnidade").value = unidadeSelecionada;
atualizarInformacaoUnidade();
atualizarPainelEstoque();
carregarProdutos();
