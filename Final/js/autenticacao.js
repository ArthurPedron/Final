
/*
 * Autenticação e fidelização demonstrativas.
 * Dados mantidos somente na memória da página.
 */

const usuariosDemonstrativos = [];

let usuarioAtual = null;

const modalAutenticacao =
    document.getElementById("modalAutenticacao");

const formLogin =
    document.getElementById("formLogin");

const formCadastro =
    document.getElementById("formCadastro");

const mensagemAutenticacao =
    document.getElementById("mensagemAutenticacao");


// RECOMPENSAS
const recompensas = [
    { id: 1, nome: "R$ 5,00 de desconto", pontos: 50, tipo: "desconto", valor: 5 },
    { id: 2, nome: "Suco grátis", pontos: 100, tipo: "suco" },
    { id: 3, nome: "R$ 20,00 de desconto", pontos: 200, tipo: "desconto", valor: 20 }
];

let recompensaSelecionada = null;


// ABRIR AUTENTICAÇÃO
function abrirAutenticacao() {

    mostrarFormularioAutenticacao("login");

    mensagemAutenticacao.textContent = "";

    if (!modalAutenticacao.open) {
        modalAutenticacao.showModal();
    }
}


// FECHAR AUTENTICAÇÃO
function fecharAutenticacao() {

    if (modalAutenticacao.open) {
        modalAutenticacao.close();
    }
}


// ALTERNAR FORMULÁRIOS
function mostrarFormularioAutenticacao(tipo) {

    const cadastro = tipo === "cadastro";

    formLogin.hidden = cadastro;
    formCadastro.hidden = !cadastro;

    document.getElementById("abaLogin")
        .classList.toggle("ativa", !cadastro);

    document.getElementById("abaCadastro")
        .classList.toggle("ativa", cadastro);

    mensagemAutenticacao.textContent = "";
}


// CADASTRAR CLIENTE
formCadastro.addEventListener("submit", function(event) {

    event.preventDefault();

    const nome = document
        .getElementById("nomeCadastro")
        .value.trim();

    const email = document
        .getElementById("emailCadastro")
        .value.trim()
        .toLowerCase();

    const senha = document
        .getElementById("senhaCadastro").value;

    const confirmacao = document
        .getElementById("confirmarSenhaCadastro").value;


    if (nome.length < 2) {
        mensagemAutenticacao.textContent =
            "Informe um nome válido.";
        return;
    }

    if (senha.length < 8) {
        mensagemAutenticacao.textContent =
            "A senha deve possuir pelo menos 8 caracteres.";
        return;
    }

    if (senha !== confirmacao) {
        mensagemAutenticacao.textContent =
            "As senhas não coincidem.";
        return;
    }

    if (usuariosDemonstrativos.some(
        usuario => usuario.email === email
    )) {
        mensagemAutenticacao.textContent =
            "Este e-mail já está cadastrado.";
        return;
    }

    usuariosDemonstrativos.push({
        id: usuariosDemonstrativos.length + 1,
        nome,
        email,
        senha,
        pontos: 0,
        recompensasResgatadas: []
    });

    formCadastro.reset();

    mostrarFormularioAutenticacao("login");

    document.getElementById("emailLogin").value = email;

    mensagemAutenticacao.textContent =
        "Cadastro realizado! Entre para acessar sua conta.";
});


// LOGIN
formLogin.addEventListener("submit", function(event) {

    event.preventDefault();

    const email = document
        .getElementById("emailLogin")
        .value.trim()
        .toLowerCase();

    const senha = document
        .getElementById("senhaLogin").value;

    const usuario = usuariosDemonstrativos.find(
        item => item.email === email &&
                item.senha === senha
    );

    if (!usuario) {

        mensagemAutenticacao.textContent =
            "E-mail ou senha inválidos.";

        return;
    }

    usuarioAtual = usuario;
    recompensaSelecionada = null;

    atualizarEstadoConta();
    atualizarFidelidade();
    atualizarRecompensasCheckout();
    if (typeof renderizarAcompanhamento === "function" &&
        !document.getElementById("modalAcompanhamento")?.hidden) {
        renderizarAcompanhamento();
    }

    formLogin.reset();

    mensagemAutenticacao.textContent =
        `Bem-vindo(a), ${usuarioAtual.nome}!`;

    window.setTimeout(fecharAutenticacao, 700);
});


// ATUALIZAR CABEÇALHO
function atualizarEstadoConta() {

    const estado = document.getElementById("estadoConta");
    const botaoConta = document.getElementById("btnConta");
    const botaoSair = document.getElementById("btnSair");

    const areaFidelidade =
        document.getElementById("areaFidelidade");

    if (usuarioAtual) {

        estado.textContent =
            `Olá, ${usuarioAtual.nome}`;

        botaoConta.hidden = true;
        botaoSair.hidden = false;

        areaFidelidade.hidden = false;

    } else {

        estado.textContent = "Visitante";

        botaoConta.hidden = false;
        botaoSair.hidden = true;

        areaFidelidade.hidden = true;
    }
}


// SAIR DA CONTA
function sairDaConta() {

    usuarioAtual = null;
    recompensaSelecionada = null;

    atualizarEstadoConta();
    atualizarRecompensasCheckout();

    if (typeof renderizarAcompanhamento === "function" &&
        !document.getElementById("modalAcompanhamento")?.hidden) {
        renderizarAcompanhamento();
    }
}


// ADICIONAR PONTOS
function adicionarPontosFidelidade(valorPedido) {

    if (!usuarioAtual) {
        return 0;
    }

    const pontos = Math.floor(valorPedido);

    usuarioAtual.pontos += pontos;

    atualizarFidelidade();

    return pontos;
}


// ATUALIZAR PAINEL DE FIDELIDADE
function atualizarFidelidade() {

    if (!usuarioAtual) return;

    document.getElementById("nomeFidelidade")
        .textContent = usuarioAtual.nome;

    document.getElementById("saldoPontos")
        .textContent = usuarioAtual.pontos;

    mostrarRecompensas();
}


// EXIBIR RECOMPENSAS
function mostrarRecompensas() {

    const lista =
        document.getElementById("listaRecompensas");

    lista.innerHTML = "";

    recompensas.forEach(recompensa => {

        const disponivel =
            usuarioAtual.pontos >= recompensa.pontos;

        const item = document.createElement("article");

        item.className = "recompensa";

        const titulo = document.createElement("h4");
        titulo.textContent = recompensa.nome;

        const custo = document.createElement("p");
        custo.textContent =
            `${recompensa.pontos} pontos`;

        const botao = document.createElement("button");

        botao.type = "button";
        botao.textContent = disponivel
            ? "Resgatar recompensa"
            : "Pontos insuficientes";

        botao.disabled = !disponivel;

        botao.addEventListener("click", function() {
            resgatarRecompensa(recompensa.id);
        });

        item.append(titulo, custo, botao);

        lista.appendChild(item);
    });
}


// Seleciona a recompensa sem debitar pontos antes da confirmação.
function resgatarRecompensa(id) {
    selecionarRecompensaPedido(id);
}

function selecionarRecompensaPedido(id) {
    if (!usuarioAtual) return;
    const recompensa = recompensas.find(item => item.id === id);
    if (!recompensa) return;

    if (usuarioAtual.pontos < recompensa.pontos) {
        document.getElementById("mensagemFidelidade").textContent = "Você não possui pontos suficientes.";
        return;
    }

    if (usuarioAtual.recompensasResgatadas.some(item => item.id === id)) {
        document.getElementById("mensagemFidelidade").textContent = "Esta recompensa já foi utilizada nesta sessão.";
        return;
    }

    if (recompensa.tipo === "suco" && !existeSucoNoCarrinho()) {
        alert("Adicione um Suco de Cajá ao carrinho antes de selecionar esta recompensa.");
        return;
    }

    recompensaSelecionada = recompensa;
    atualizarRecompensasCheckout();
    atualizarFidelidade();
}

function existeSucoNoCarrinho() {
    return typeof carrinho !== "undefined" && carrinho.some(
        item => item.nome.toLowerCase().includes("suco") && item.quantidade > 0
    );
}

function calcularDescontoFidelidade(total) {
    if (!usuarioAtual || !recompensaSelecionada) return 0;
    if (recompensaSelecionada.tipo === "desconto") {
        return Math.min(recompensaSelecionada.valor, total);
    }
    if (recompensaSelecionada.tipo === "suco") {
        const suco = carrinho.find(item =>
            item.nome.toLowerCase().includes("suco") && item.quantidade > 0
        );
        return suco ? Math.min(suco.preco, total) : 0;
    }
    return 0;
}

function atualizarRecompensasCheckout() {
    const area = document.getElementById("opcoesRecompensasCheckout");
    const saldo = document.getElementById("pontosCheckout");
    const resumo = document.getElementById("resumoDescontoFidelidade");
    const descricao = document.getElementById("descricaoRecompensaAplicada");
    if (!area || !saldo || !resumo || !descricao) return;

    saldo.textContent = usuarioAtual ? usuarioAtual.pontos : 0;
    area.replaceChildren();

    if (!usuarioAtual) {
        area.textContent = "Entre na sua conta para utilizar suas recompensas.";
        resumo.hidden = true;
        return;
    }

    recompensas.forEach(recompensa => {
        const usada = usuarioAtual.recompensasResgatadas.some(item => item.id === recompensa.id);
        const selecionada = recompensaSelecionada?.id === recompensa.id;
        const card = document.createElement("article");
        card.className = "recompensa-checkout";
        const titulo = document.createElement("strong");
        titulo.textContent = recompensa.nome;
        const custo = document.createElement("p");
        custo.textContent = `${recompensa.pontos} pontos`;
        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = selecionada ? "Selecionada" : usada ? "Já utilizada" :
            usuarioAtual.pontos < recompensa.pontos ? "Pontos insuficientes" : "Usar recompensa";
        botao.disabled = selecionada || usada || usuarioAtual.pontos < recompensa.pontos;
        if (!botao.disabled) botao.addEventListener("click", () => selecionarRecompensaPedido(recompensa.id));
        card.append(titulo, custo, botao);
        area.appendChild(card);
    });

    if (recompensaSelecionada) {
        const desconto = calcularDescontoFidelidade(calcularTotal());
        descricao.textContent = `${recompensaSelecionada.nome} — desconto de R$ ${desconto.toFixed(2).replace(".", ",")}`;
        resumo.hidden = false;
    } else {
        resumo.hidden = true;
    }
}

function removerRecompensaPedido() {
    recompensaSelecionada = null;
    atualizarRecompensasCheckout();
}

function finalizarUsoRecompensa() {
    if (!usuarioAtual || !recompensaSelecionada) return;
    const recompensa = recompensaSelecionada;
    if (usuarioAtual.pontos < recompensa.pontos) {
        throw new Error("Saldo de pontos insuficiente para concluir o resgate.");
    }
    usuarioAtual.pontos -= recompensa.pontos;
    usuarioAtual.recompensasResgatadas.push({
        id: recompensa.id,
        nome: recompensa.nome,
        data: new Date().toLocaleDateString("pt-BR")
    });
    recompensaSelecionada = null;
    atualizarFidelidade();
    atualizarRecompensasCheckout();
}

// FECHAR AO CLICAR FORA
modalAutenticacao.addEventListener("click", function(event) {

    if (event.target === modalAutenticacao) {
        fecharAutenticacao();
    }
});


// ESTADO INICIAL
atualizarEstadoConta();
