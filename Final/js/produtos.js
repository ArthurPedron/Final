// Unidades e seus estoques são dados demonstrativos locais.
// Em uma aplicação real, essas informações viriam de uma API/backend.
const unidades = [
    {
        id: "recife-centro",
        nome: "Recife - Unidade Centro",
        descricao: "Unidade demonstrativa com cardápio regional e retirada no local."
    },
    {
        id: "recife-boa-viagem",
        nome: "Recife - Unidade Boa Viagem",
        descricao: "Unidade demonstrativa com disponibilidade própria de produtos."
    },
    {
        id: "caruaru-centro",
        nome: "Caruaru - Unidade Centro",
        descricao: "Unidade demonstrativa com estoque local independente."
    }
];

let unidadeSelecionada = "recife-centro";

const produtos = [
    {
        id: 1,
        nome: "Tapioca de queijo",
        categoria: "Tapiocas",
        preco: 12.00,
        imagem: "assets/Tapioca-de-queijo.jpg",
        estoquePorUnidade: {
            "recife-centro": 12,
            "recife-boa-viagem": 0,
            "caruaru-centro": 6
        }
    },
    {
        id: 2,
        nome: "Cuscuz recheado",
        categoria: "Cuscuz",
        preco: 18.00,
        imagem: "assets/Cuscuz-recheado.jpg",
        estoquePorUnidade: {
            "recife-centro": 5,
            "recife-boa-viagem": 8,
            "caruaru-centro": 0
        }
    },
    {
        id: 3,
        nome: "Bolo de macaxeira",
        categoria: "Bolos",
        preco: 8.00,
        imagem: "assets/Bolo-de-macaxeira.jpg",
        estoquePorUnidade: {
            "recife-centro": 0,
            "recife-boa-viagem": 4,
            "caruaru-centro": 10
        }
    },
    {
        id: 4,
        nome: "Suco de Cajá",
        categoria: "Bebidas",
        preco: 7.00,
        imagem: "assets/Suco-de-caja.jpg",
        estoquePorUnidade: {
            "recife-centro": 15,
            "recife-boa-viagem": 10,
            "caruaru-centro": 12
        }
    }
];

// Retorna o estoque do produto na unidade selecionada.
function obterEstoque(produto, unidadeId = unidadeSelecionada) {
    return produto?.estoquePorUnidade?.[unidadeId] ?? 0;
}
