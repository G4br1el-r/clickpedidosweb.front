import type { ConfiguracaoLoja, DiaSemana, HorarioFuncionamento } from "@/types/entidades"

// Valores do Seed.cs e do snapshot da loja. Diferença proposital: o controle automático de
// horário nasce desligado, senão o mock fica fechado fora das 10h às 22h e trava os testes.
export const lojaInicial: ConfiguracaoLoja = {
  nomeLoja: "Quiosque do Mineiro",
  slogan: "O Ponto do Pastel · Lanches e Açaí",
  telefone: "(12) 99707-3047",
  whatsApp: "12997073047",
  endereco: "Vila Carmem",
  horario: "Todos os dias, das 10h às 22h",
  lojaAberta: true,
  controleHorarioAutomatico: false,
  mensagemFechada: null,
  taxaEntrega: 5,
  pedidoMinimo: 15,
  tempoEntrega: "40–60 min",
  tempoRetirada: "20–30 min",
  cidadesAtendidas: "Cachoeira Paulista",
  aceitaEntrega: true,
  aceitaRetirada: true,
  aceitaPix: true,
  aceitaCartaoOnline: true,
  aceitaDinheiro: true,
  aceitaCartaoNaEntrega: true,
  nomeImpressoraTermica: "POS-80",
  impressaoAutomatica: false,
  cortarPapelImpressora: true,
  mercadoPagoAccessToken: null,
  mercadoPagoPublicKey: null,
}

export const horariosIniciais: HorarioFuncionamento[] = ([0, 1, 2, 3, 4, 5, 6] as DiaSemana[]).map(
  (diaSemana) => ({ diaSemana, aberto: true, abreAs: "10:00", fechaAs: "22:00" }),
)
