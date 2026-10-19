// Tabela de CEPs do mock (no backend, a consulta vai ao ViaCEP). Ruas reais de Cachoeira
// Paulista, mas a relação CEP ↔ rua é ilustrativa: serve para testar o checkout.
export interface CepMock {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  uf: string
}

export const CEPS: CepMock[] = [
  { cep: "12630000", logradouro: "", bairro: "", cidade: "Cachoeira Paulista", uf: "SP" },
  {
    cep: "12630001",
    logradouro: "Rua Barão de Castro Lima",
    bairro: "Centro",
    cidade: "Cachoeira Paulista",
    uf: "SP",
  },
  {
    cep: "12630100",
    logradouro: "Rua Comendador Custódio Vieira",
    bairro: "Vila Carmen",
    cidade: "Cachoeira Paulista",
    uf: "SP",
  },
  {
    cep: "12630200",
    logradouro: "Rua Doutor Cícero Prado",
    bairro: "Jardim da Fonte",
    cidade: "Cachoeira Paulista",
    uf: "SP",
  },
  {
    cep: "12630300",
    logradouro: "Estrada do Embaú",
    bairro: "Embaú",
    cidade: "Cachoeira Paulista",
    uf: "SP",
  },
  {
    cep: "12630400",
    logradouro: "Rua São José",
    bairro: "São José",
    cidade: "Cachoeira Paulista",
    uf: "SP",
  },
  {
    cep: "12630500",
    logradouro: "Rua das Acácias",
    bairro: "Bairro Novo",
    cidade: "Cachoeira Paulista",
    uf: "SP",
  },
  { cep: "12600000", logradouro: "", bairro: "Centro", cidade: "Lorena", uf: "SP" },
  { cep: "12500000", logradouro: "", bairro: "Centro", cidade: "Guaratinguetá", uf: "SP" },
]
