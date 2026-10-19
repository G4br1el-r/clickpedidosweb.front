# Direção visual "Feira"

Adotamos a direção **Feira**: a barraca de pastel da feira, com o toldo listrado como elemento marcante, laranja-queimado da marca, amarelo-gema, verde de toldo e tinta azul-noite no lugar do preto, com Bricolage Grotesque nos títulos e Instrument Sans no texto. O usuário pediu para seguir com a recomendada e implementar tudo de uma vez. Ela tem a identidade mais própria do quiosque e funciona tanto na loja (apetitosa) quanto na operação (legível, com modo escuro na cozinha).

## Considered Options
- **Ladrilho** (azulejo colonial, cobalto, Fraunces) e **Balcão** (pedra e grafite, Archivo condensado) seguem na `/_design` para comparação.
- O plano original previa "Quitanda" (creme, serifa, terracota) e "Brasa" (preto com laranja vivo): descartadas por caírem em padrões genéricos de interface gerada.

## Consequences
Trocar de direção é barato enquanto tudo usar tokens: os valores do `:root` e do `.dark` em `src/index.css` vêm de `src/features/design/direcoes.css`.
