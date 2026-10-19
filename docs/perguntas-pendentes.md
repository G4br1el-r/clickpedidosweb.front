# Perguntas pendentes

Dúvidas que surgiram durante a implementação. Para não parar o trabalho, cada uma recebeu uma **decisão padrão**, já aplicada. Revise quando quiser: é só dizer qual mudar.

| # | Fase | Pergunta | Decisão padrão aplicada |
|---|---|---|---|
| 1 | 0 | O mock deve fechar a loja sozinho fora do horário (10h às 22h), como em produção? | Não por padrão: o controle automático nasce **desligado** para dar para testar a qualquer hora. Dá para ligar em Configurações. |
| 2 | 0 | Qual direção visual seguir? | **Feira** adotada (você pediu para seguir com a recomendada). Ladrilho e Balcão continuam na `/_design` para comparar: é só dizer qual prefere. |
| 3 | 0 | Os nomes "Quitanda" e "Brasa" do plano podem mudar? | Troquei por **Feira**, **Ladrilho** e **Balcão**: as duas primeiras caíam em visuais genéricos (creme + serifa + terracota; preto + laranja). |
| 4 | 0 | Quais fontes usar? | Bricolage Grotesque (títulos) + Instrument Sans (texto) na Feira; Fraunces e Archivo só na `/_design`. Todas servidas pelo app (sem Google Fonts). |
| 5 | 0 | Login de teste do admin mockado? | `admin` / `clickpedido` (está no README). Não é a senha do sistema real. |
| 6 | 0 | O cardápio dos mocks vem do Seed.cs ou do banco real? | Do **banco real** (snapshot de `GET /api/cardapio`): o Seed.cs está desatualizado em relação à loja. |
| 7 | 0 | A meta de cobertura de branches (100%) pode ser corrigida? | Sim: os 100% eram artefato do setup (0 de 0 branches). Metas atualizadas para o medido na Fase 0 (statements 72, branches 76, functions 54, lines 71). Statements e lines subiram. |
