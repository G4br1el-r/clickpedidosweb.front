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
| 8 | 2 | O checkout pede e-mail no Pix? | **Não**: igual ao checkout atual, só o CPF. O e-mail é preenchido pelo sistema (`cliente_<cpf>@clickpedidoweb.com.br`), como faz o backend. |
| 9 | 2 | Lembrar nome, WhatsApp e endereço do cliente? | **Sim**, só no navegador dele (`cp_cliente`), para o próximo pedido vir preenchido. É uma melhoria em relação ao sistema atual. |
| 10 | 2 | Sacola vazia no checkout redireciona para o cardápio? | Em vez de redirecionar, mostra "Sua sacola está vazia" com o botão "Ver o cardápio" (fica claro o que aconteceu). |
| 11 | 2 | Como simular o pagamento online sem gateway? | Pix tem QR e copia e cola de mentira e "paga sozinho" em **20 s** (ou no botão "Simular pagamento"). Cartão online mostra "Pagar com cartão (simulado)". Pendente há mais de 60 min é cancelado, como no backend. |
| 12 | 2 | De onde vêm os CEPs? | Tabela de teste em `src/mock/loja/ceps.ts` (ruas reais de Cachoeira Paulista, CEPs ilustrativos). Ex.: `12630-300` = Embaú (taxa R$ 15), `12600-000` = Lorena (não atendida). |
| 13 | 2 | Orçamento de 150 KB vale para todas as páginas da loja? | Vale para a **primeira** (cardápio: 140 KB gzip). Checkout (194 KB) e acompanhamento (162 KB) carregam depois; o modal, a sacola, o Motion e os avisos baixam sob demanda. |
| 14 | 3 | Como imprimir o cupom sem impressora no mock? | Pelo **diálogo do navegador** (iframe invisível com o cupom de 80 mm, igual ao último recurso do `fila.js`). Agente e spooler aparecem como "conectados (simulado)". Para imprimir sem confirmação: Chrome com `--kiosk-printing`. |
| 15 | 3 | A tela de login mostra o usuário e a senha de teste? | **Sim**, numa linha pequena ("Versão de teste: login admin, senha clickpedido"), para quem for testar. Some quando ligar no backend. |
| 16 | 3 | Atalhos de teclado na fila? | Por enquanto só o **teclado nativo** (Tab até o card, Enter no botão). Atalhos próprios (ex.: número do pedido + Enter) ficam para depois: diga se quer. |
| 17 | 3 | Versão do TanStack Table? | Fixei a **v8** (estável e conhecida). A v9 saiu com API nova; dá para migrar depois. |
| 18 | 3 | A coluna "Novos" mostra pedidos aguardando pagamento? | **Não**, igual ao sistema atual: Pix/cartão pendente aparece só na contagem do topo e entra na fila quando o pagamento cai. |
