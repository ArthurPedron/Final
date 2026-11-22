
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
    {
        id: 1,
        nome: "R$ 5,00 de desconto",
        pontos: 50
    },
    {
        id: 2,
        nome: "Suco grátis",
        pontos: 100
    },
    {
        id: 3,
        nome: "R$ 20,00 de desconto",
        pontos: 200
    }
];


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

    atualizarEstadoConta();
    atualizarFidelidade();

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

    atualizarEstadoConta();
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


// RESGATAR RECOMPENSA
function resgatarRecompensa(id) {

    if (!usuarioAtual) return;

    const recompensa = recompensas.find(
        item => item.id === id
    );

    if (!recompensa) return;

    const mensagem =
        document.getElementById("mensagemFidelidade");

    if (usuarioAtual.pontos < recompensa.pontos) {

        mensagem.textContent =
            "Você não possui pontos suficientes.";

        return;
    }

    const confirmou = confirm(
        `Deseja resgatar ${recompensa.nome} por ${recompensa.pontos} pontos?`
    );

    if (!confirmou) return;

    usuarioAtual.pontos -= recompensa.pontos;

    usuarioAtual.recompensasResgatadas.push({
        nome: recompensa.nome,
        data: new Date().toLocaleDateString("pt-BR")
    });

    mensagem.textContent =
        `Recompensa "${recompensa.nome}" resgatada com sucesso!`;

    atualizarFidelidade();
}


// FECHAR AO CLICAR FORA
modalAutenticacao.addEventListener("click", function(event) {

    if (event.target === modalAutenticacao) {
        fecharAutenticacao();
    }
});


// ESTADO INICIAL
atualizarEstadoConta();
