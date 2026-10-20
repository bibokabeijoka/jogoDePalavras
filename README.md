# jogoDePalavras
repositorio do jogo de palavras

## Jogo

O jogo usa o conceito visual Lúdico, com um desafio diário, seis tentativas, teclado físico/virtual e progresso sem conta.

### Executar localmente

Requer Node.js 20 ou superior:

```sh
npm start
```

Abra `http://127.0.0.1:4173`. As partidas anônimas ficam em `var/` no servidor local. Para executar os testes, rode `npm test`.

`data/words.json` contém uma lista inicial curada para tornar o jogo funcional. Ela ainda não é um dicionário amplo de pt-BR nem possui uma fonte/licença lexical aprovada para produção; qualquer termo fora dessa lista será rejeitado até a seleção e importação de uma fonte adequada.

Consulte o [PRD](./docs/plans/2026-10-13-palavra-do-dia.md) e o [projeto técnico](./docs/projeto-tecnico.md) para requisitos, decisões em aberto e arquitetura proposta.
