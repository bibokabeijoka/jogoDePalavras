# Projeto técnico — Palavra do Dia

## 1. Objetivo

Este documento transforma o PRD em uma proposta implementável para um jogo casual web de adivinhação de palavras, usando a direção visual **Lúdica** do protótipo como base. A estética escura e expressiva deve continuar legível e utilizável para todos; acessibilidade não será tratada como um tema visual alternativo.

O escopo descrito é o MVP:

- um desafio novo por dia;
- uma resposta de cinco letras em português brasileiro;
- até seis tentativas;
- palpites sem acentos ou com acentos equivalentes à forma normalizada;
- respostas comuns, revisadas e sem colisões de acentuação;
- aceitação de qualquer palpite válido de cinco letras segundo o vocabulário selecionado;
- sem dicas, conta, compartilhamento, streaks ou monetização;
- progresso local neste dispositivo;
- web responsiva, mobile-first, com teclado virtual e físico.

O principal sinal de sucesso é a pessoa entender as regras e conseguir concluir a primeira partida.

## 2. Princípios técnicos

1. **A regra do jogo deve ser única e testável.** Comparação de letras, acentos, letras duplicadas e encerramento não devem ser reimplementados de maneiras diferentes na interface e no serviço.
2. **Uma tentativa inválida não consome jogada.** A interface explica o problema, preserva a entrada quando possível e mantém o foco no campo.
3. **O progresso deve sobreviver ao fechamento da aba.** A chave inclui a data/identificador do puzzle e uma versão do formato salvo.
4. **A resposta diária não deve ser enviada ao navegador antes do encerramento.** Por isso, a arquitetura proposta mantém a solução no serviço e devolve somente feedback por letra.
5. **Cor nunca é o único canal de informação.** Símbolos, texto acessível e rótulos complementam todas as cores dos estados.
6. **Conteúdo é produto.** A lista de palavras, a revisão editorial, as licenças e o calendário fazem parte da implementação, não são dados temporários de teste.
7. **Erros operacionais devem ser explícitos.** Falha de rede ou armazenamento local não pode parecer uma tentativa válida nem resultar em progresso perdido silenciosamente.

## 3. Direção visual Lúdica

### 3.1 Linguagem visual

- Fundo azul-noite e superfícies azul-arroxeadas, com cartões arredondados e sensação tátil.
- Tipografia sans-serif do sistema, títulos expressivos e letras de jogo grandes e pesadas.
- Acento amarelo quente para a identidade e para o estado “letra correta na posição certa”.
- Ameixa para “letra presente em outra posição” e ardósia clara para “letra ausente”.
- Transições breves para confirmação de entrada; nenhuma informação essencial depende de animação.
- Composição centralizada em telas largas; no celular, conteúdo em coluna única, sem rolagem horizontal.

### 3.2 Tokens de partida

Usar tokens semânticos CSS em vez de espalhar valores hexadecimais pelos componentes. Os valores abaixo dão partida no tema, mas os contrastes devem ser medidos no par real texto/fundo antes da implementação visual final.

| Token | Valor inicial | Uso |
|---|---|---|
| `--page` | `#20204A` | fundo da página |
| `--surface` | `#2C2B61` | cartão do jogo e painéis |
| `--surface-raised` | `#35346D` | casas vazias e superfícies elevadas |
| `--ink` | `#FFFDF4` | texto principal |
| `--muted` | `#D0CFEE` | texto secundário |
| `--line` | `#59588C` | bordas sobre superfície |
| `--brand` | `#FFCF4A` | marca, realces e controles principais |
| `--correct` | `#FFCF4A` | letra correta, com texto/símbolo escuro |
| `--present` | `#91459A` | letra presente em outra posição |
| `--absent` | `#71719A` | letra ausente |
| `--focus` | `#FFFFFF` | indicador de foco sobre fundo escuro |

Os estados do tabuleiro e teclado também terão símbolos: `✓` correto e posição certa, `↔` presente em outra posição, `×` ausente. Símbolos e rótulos de leitor de tela não devem depender do conteúdo do CSS. Verificar contraste de texto (mínimo WCAG 2.2 AA aplicável), contraste de componentes e foco em cada combinação; não assumir que uma cor adequada sobre o fundo principal também funciona sobre as casas coloridas.

### 3.3 Responsividade e movimento

- A largura do tabuleiro é limitada para manter casas aproximadamente quadradas e evitar alargamento no desktop.
- Em telas pequenas, reduzir espaços externos e adaptar o teclado sem encolher letras ou alvos a ponto de dificultar o toque.
- Meta de alvo de toque: pelo menos 44 × 44 CSS px, respeitando o espaço disponível e as exceções WCAG pertinentes.
- A interface deve funcionar a partir de 320 CSS px, com zoom de 200% e texto ampliado, sem perda de controles ou rolagem horizontal.
- Respeitar `prefers-reduced-motion`; feedback permanece compreensível sem animação.
- Não fixar a altura do cartão ou do viewport; o teclado virtual do celular não deve cobrir a entrada.

## 4. Arquitetura proposta

**Estado desta implementação:** a interface foi implementada com HTML, CSS e JavaScript nativos, e o serviço usa `node:http` sem dependências externas. O servidor lê `data/words.json`, persiste partidas anônimas em `var/sessions.json` e serve apenas os três arquivos públicos permitidos. Esta escolha reduz instalação e torna o MVP executável com Node.js, mas **não é a infraestrutura final de produção**: o arquivo JSON local pressupõe uma única instância, não oferece transações distribuídas/backup gerenciado e o vocabulário inicial ainda não tem fonte/licença lexical aprovada. Antes de publicar, migrar sessões para persistência gerenciada e importar um vocabulário licenciado e revisado.

Para uma evolução com frontend tipado e implantação estática, a arquitetura proposta é:

### Cliente web

- **Vite + TypeScript**, com módulos pequenos e DOM sem framework no primeiro incremento; isso preserva uma interface leve e evita introduzir complexidade de estado de UI sem necessidade.
- HTML semântico e CSS próprio com tokens de tema Lúdico.
- Hospedagem estática em CDN.
- `localStorage` para tentativas, respostas de feedback já recebidas e estado do puzzle atual; não armazenar conta ou dado pessoal.
- Nenhuma dependência de analytics, anúncios, fontes remotas ou SDK externo no MVP.

### Serviço de jogo

- API HTTP pequena, executada como função/serverless ou serviço gerenciado, com endpoints versionados.
- Banco relacional gerenciado para calendário, respostas, vocabulário aceito, estado editorial e estado curto de partidas anônimas.
- A resposta secreta e o dicionário completo permanecem no serviço. A interface envia um palpite e recebe resultado por posição. A resposta é devolvida somente quando a partida termina.
- Sem conta ou autenticação de usuário. Um identificador aleatório de sessão, sem dados de identidade, permite ao serviço limitar seis tentativas e retomar o resultado após recarregar a página.
- Limitar frequência de requisições por IP/instância para reduzir abuso automatizado, sem bloquear jogadores legítimos em redes compartilhadas.

**Justificativa:** uma implementação inteiramente estática é mais simples e suficiente para validar o loop, mas a solução diária pode ser extraída do JavaScript ou das respostas de rede. Como a premissa é revelar a resposta somente no fim, a separação do serviço é a opção proposta para lançamento. Se for escolhido um protótipo público descartável sem exigência de ocultar a solução, a versão estática pode ser uma etapa anterior, explicitamente não competitiva.

**Ainda sem decisão:** provedor de hospedagem/API, banco, orçamento operacional, estratégia de backup e limite de requisições. A proposta não exige um fornecedor específico; comparar custo e simplicidade antes de criar infraestrutura.

### Diagrama lógico

```text
Navegador
  ├── UI acessível (tabuleiro, entrada, teclado)
  ├── controlador de partida / estado local
  ├── localStorage (progresso por data do puzzle)
  └── API de jogo
        ├── calendário de respostas aprovadas
        ├── vocabulário aceito e formas normalizadas
        ├── tentativas por sessão anônima, com expiração
        ├── avaliador determinístico de palpites
        └── feedback sem resposta antes do fim
```

### Organização sugerida do código

```text
src/
  app.ts
  game/
    game-controller.ts
    evaluate-guess.ts
    normalize-word.ts
    game-types.ts
    game-api.ts
    local-progress.ts
  ui/
    game-view.ts
    board.ts
    keyboard.ts
    announcements.ts
  styles/
    tokens.css
    game.css
    responsive.css
server/
  routes/
    today.ts
    guess.ts
  game/
    evaluate-guess.ts
    normalize-word.ts
  content/
    word-list-loader.ts
  editorial/
    import-puzzles.ts
data/
  words-approved.csv
  puzzles-calendar.csv
tests/
  unit/
  integration/
  e2e/
```

O algoritmo de avaliação terá uma especificação compartilhada por testes de contrato. Evitar importar código do cliente como autoridade do servidor; o serviço valida a tentativa antes de aceitar e persistir o feedback.

## 5. Fluxo de jogo

1. A aplicação obtém a data civil do desafio e consulta o puzzle do dia.
2. Enquanto carrega, mostra um estado de carregamento que não permite enviar tentativas incompletas.
3. A interface recupera o progresso local associado exatamente àquele `puzzleId`.
4. O jogador digita no campo visível, usa o teclado na tela ou o teclado físico.
5. Ao enviar, validar localmente somente o tamanho/formato e impedir submissões duplicadas enquanto há requisição pendente. A validação de vocabulário autoritativa ocorre no serviço.
6. Se o palpite não for válido, mostrar a mensagem de erro, não gastar tentativa e preservar o texto digitado, quando aplicável.
7. Se for válido, o serviço devolve cinco estados. A interface acrescenta a tentativa ao tabuleiro e salva o progresso.
8. Em vitória ou sexta tentativa sem acerto, o serviço inclui a resposta com grafia editorial correta. A interface encerra a entrada, conserva o tabuleiro e salva o estado terminal.
9. Ao reabrir a página no mesmo dia, restaurar tentativas e resultado. No desafio de outro dia, carregar novo puzzle sem misturar estados.

### Estados explícitos

`loading` → `playing` → `submitting` → `playing | won | lost | network-error`

- `loading`: puzzle ainda não está disponível; controle de envio desabilitado.
- `playing`: entrada aberta e contagem de tentativas derivada de tentativas aceitas.
- `submitting`: uma requisição em andamento; bloquear envio repetido sem remover o conteúdo do campo.
- `network-error`: informar que não foi possível verificar o palpite; manter tentativa não enviada e oferecer “Tentar novamente”.
- `won` / `lost`: estado terminal; desabilitar o envio e apresentar a resposta final.

Não salvar como tentativa uma palavra rejeitada pelo vocabulário nem uma requisição sem resposta confirmada. Para evitar duplicação após interrupções, enviar um `requestId` idempotente e reutilizá-lo em uma repetição da mesma tentativa.

## 6. Regras linguísticas e algoritmo

### Normalização

Manter separadas:

- **forma editorial**, acentuada, como `LIMÃO`;
- **forma normalizada para comparação**, como `LIMAO`.

Normalização proposta:

1. normalização Unicode canônica `NFD`;
2. remoção de marcas diacríticas;
3. conversão consistente para maiúsculas em `pt-BR`;
4. validação de letras permitidas;
5. validação de exatamente cinco letras após normalização.

Exemplo conceitual em TypeScript:

```ts
function normalizeWord(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleUpperCase("pt-BR");
}
```

Não remover pontuação ou espaços silenciosamente: rejeitar entrada que contenha mais de uma palavra ou caracteres que não pertençam ao alfabeto permitido. Definir explicitamente como o `Ç` será tratado; na representação normalizada pode equivaler a `C`, mas a exibição e a lista editorial conservam a grafia portuguesa.

### Avaliação de letras repetidas

Para cada palpite:

1. inicializar as cinco posições como ausentes;
2. marcar primeiro as letras idênticas à resposta na posição exata e consumir essas ocorrências;
3. percorrer as demais letras do palpite; se a letra ainda existir entre as ocorrências não consumidas da resposta, marcar como presente em outra posição e consumir uma ocorrência;
4. deixar como ausente qualquer ocorrência excedente.

Essa ordem impede que uma letra duplicada receba feedback de presença além da quantidade existente na solução. O avaliador retorna cinco valores em ordem: `correct`, `present`, `absent`.

### Dicionário

O serviço mantém duas coleções com políticas distintas:

- **respostas:** conjunto menor, curado, com forma acentuada, normalização, data opcional de uso, justificativa editorial e revisão aprovada;
- **palpites válidos:** vocabulário amplo pt-BR de palavras de cinco letras, com formas normalizadas e variantes aprovadas.

Antes de selecionar uma resposta, validar:

- existência no vocabulário e familiaridade esperada;
- colisões causadas pela retirada dos acentos;
- ausência de nomes próprios e formas raras segundo a política do PRD;
- duplicata no calendário;
- adequação e revisão humana;
- licença e permissão de redistribuição da fonte lexical usada.

O protótipo atual usa `LIMÃO` como resposta fixa e **não** implementa o vocabulário real. Ele não deve ser confundido com a lista editorial ou com um gerador de puzzles.

## 7. API proposta

Prefixo versionado: `/api/v1`.

### `GET /api/v1/puzzles/today`

Resposta:

```json
{
  "puzzleId": "2026-10-13",
  "date": "2026-10-13",
  "wordLength": 5,
  "maxAttempts": 6,
  "accentPolicy": "ignore-for-guess"
}
```

Não incluir resposta, formas normalizadas secretas, lista de candidatos nem pista não aprovada.

### Identificador de sessão anônima

O cliente gera um UUID aleatório criptograficamente seguro na primeira partida do dia e guarda-o junto ao progresso local. Esse valor identifica apenas uma partida naquele dispositivo; não deve incorporar IP, fingerprint, e-mail ou outro dado pessoal. O serviço associa `sessionId` e `puzzleId` a uma lista curta de tentativas e expira o registro após uma janela operacional definida.

Para restaurar/reconciliar uma partida, o cliente consulta `GET /api/v1/puzzles/{puzzleId}/state` com `sessionId`. O serviço retorna tentativas aceitas, estados por letra e status terminal; a resposta secreta só aparece em estado `won` ou `lost`. O identificador não é uma conta e não oferece sincronização entre dispositivos.

### `POST /api/v1/puzzles/{puzzleId}/guesses`

Corpo:

```json
{
  "sessionId": "uuid",
  "guess": "MANGA",
  "requestId": "uuid"
}
```

Sucesso:

```json
{
  "accepted": true,
  "marks": ["present", "present", "absent", "absent", "absent"],
  "attemptsUsed": 1,
  "attemptsRemaining": 5,
  "status": "playing"
}
```

Ao terminar, acrescentar `answer: "LIMÃO"` e retornar `status: "won"` ou `status: "lost"`. O servidor não deve revelar a resposta em estados não terminais.

Erros são respostas estruturadas e estáveis:

| HTTP | Código | Comportamento de interface |
|---|---|---|
| `400` | `INVALID_LENGTH` | “Digite 5 letras para tentar.” |
| `422` | `WORD_NOT_ALLOWED` | “Essa palavra não está na lista. Tente outra palavra.” |
| `404` | `PUZZLE_NOT_FOUND` | Informar que o desafio não está disponível e oferecer atualização/retorno mais tarde. |
| `409` | `GAME_FINISHED` | Reconciliar com o resultado terminal do desafio. |
| `429` | `RATE_LIMITED` | Informar que houve muitas tentativas e permitir nova tentativa depois. |
| `5xx` / falha de rede | `SERVICE_UNAVAILABLE` | Não consumir a jogada; manter o palpite e apresentar opção de repetir. |

Não devolver mensagem interna, stack trace, resposta secreta ou lista de palavras inválidas no corpo de erro.

## 8. Persistência e ciclo diário

### Progresso no navegador

Chave sugerida: `palavra-do-dia:progress:v1:{puzzleId}`.

```ts
interface LocalProgressV1 {
  version: 1;
  puzzleId: string;
  guesses: Array<{
    normalizedGuess: string;
    marks: Array<"correct" | "present" | "absent">;
  }>;
  status: "playing" | "won" | "lost";
  updatedAt: string;
}
```

- Validar tipo, versão, tamanho das listas, tamanho das palavras e status antes de restaurar dados.
- Rejeitar ou descartar apenas o registro malformado em questão; não falhar silenciosamente a partida sem mensagem.
- Salvar somente depois da confirmação do serviço.
- Tratar armazenamento indisponível: manter o estado em memória, notificar de forma compreensível que ele pode não persistir depois de fechar a aba.
- Não armazenar resposta antes de ela ser revelada.

### Data do desafio

Usar um identificador estável de puzzle para chave, API e calendário. A proposta inicial é a data local em `America/Sao_Paulo`, mas o fuso e o instante de virada ainda precisam ser aprovados. O cliente não deve escolher a resposta com base apenas no relógio local: consultar o identificador oficial ao serviço e exibir a data correspondente ao calendário do produto.

O serviço deve tratar mudança de data, relógio incorreto do dispositivo e requisição que chega perto da virada sem misturar tentativas de dois desafios. Não oferecer arquivo de puzzles anteriores no MVP.

### Conteúdo editorial e banco

Tabelas lógicas propostas:

- `approved_words`: forma editorial, forma normalizada única, número de letras, classe editorial, fonte/licença, estado de revisão e data de aprovação;
- `valid_guesses`: forma normalizada, formas de exibição opcionais, fonte e estado de aceitação;
- `daily_puzzles`: `puzzle_id`, data/fuso, referência à resposta aprovada, estado editorial, revisor e timestamps de publicação;
- `idempotency_keys`: identificador da requisição, puzzle, resultado não sensível e expiração curta para repetir chamadas sem consumir jogadas em duplicidade.
- `game_sessions`: identificador aleatório da sessão, puzzle, tentativas normalizadas e seus feedbacks, status e expiração. Não contém nome ou perfil de usuário; aplicar TTL e limitar a retenção ao necessário para retomar a partida daquele dia.

Usuários e perfis não fazem parte do esquema do MVP. A persistência curta de `game_sessions` é estado de jogo sem login, não uma conta ou histórico de usuário. Uma pessoa ainda pode iniciar outra sessão e a arquitetura não é um mecanismo anti-cheat forte; seu objetivo é não entregar a resposta no bundle estático e manter as regras de cada sessão. Evitar gravar IP de forma persistente para rate limit; se o provedor exigir logs, definir retenção mínima e documentada.

## 9. Acessibilidade

Meta: conformidade WCAG 2.2 AA nos fluxos essenciais, sujeita a auditoria manual e automatizada.

- Idioma do documento: `pt-BR`.
- Usar `label` associado ao campo de palpite, formulário real e botão de envio nativo.
- O campo é a fonte única de entrada. Teclado físico, teclado virtual e botão “Apagar” atualizam o mesmo valor.
- Não capturar letras globalmente quando o foco estiver em outro controle; respeitar atalhos do navegador, modificadores e foco.
- Ordem de tabulação natural, foco visível em todos os controles e foco mantido no campo após uma tentativa aceita ou rejeitada.
- O tabuleiro tem estrutura semântica compreensível: tentativa 1–6; cada letra expõe letra, posição e resultado. O estado de resultado não é comunicado apenas por cor, ícone ou animação.
- Após uma tentativa aceita, anunciar uma única mensagem resumida em região `aria-live="polite"`; evitar que cada célula reescrita seja anunciada separadamente.
- Mensagens de erro são anunciadas e associadas ao campo; entrada incompleta não deve mover o foco para um elemento inesperado.
- Vitória e derrota são anunciadas; a resposta só é anunciada quando for legitimamente revelada no fim.
- Verificar contraste texto/fundo, estados do tabuleiro e teclado, contorno de foco e estados desabilitados.
- Incluir `Ç` no teclado virtual e suportar entrada acentuada do sistema; o campo desabilita correção automática, capitalização imprevisível e spellcheck.
- Não usar `aria-live` em elementos com conteúdo decorativo nem adicionar rótulos redundantes em cada tile se isso gerar leitura excessiva.
- Testar manualmente teclado, NVDA com Firefox/Chrome e VoiceOver com Safari/iOS, além de scanner automatizado.

## 10. Segurança, privacidade e operação

- TLS obrigatório; validar tamanho e caracteres tanto no cliente quanto no serviço.
- O serviço confia apenas na resposta do banco/calendário, nunca na resposta ou feedback enviados pelo navegador.
- Limitar payloads e frequência de requisições; respostas de API não refletem conteúdo interno nem o dicionário.
- Não incluir dados pessoais, identificadores publicitários ou rastreamento de terceiros no MVP.
- `localStorage` contém somente estado de jogo no aparelho e não deve ser usado como mecanismo de autorização.
- Aplicar cabeçalhos de segurança compatíveis com o host (CSP, `X-Content-Type-Options`, `Referrer-Policy`) e evitar HTML dinâmico de conteúdo editorial não escapado.
- Revisar licença do vocabulário, do banco e das fontes antes de distribuição.
- Produção editorial inclui backup e histórico de mudanças; correção de puzzle publicado precisa de procedimento explícito e mensagem de atualização ao jogador.
- Se a fonte lexical não puder ser redistribuída, contratar ou construir uma lista com direitos claros; não contornar termos de licença.

## 11. Testes

### Unitários

- normalização de acentos e combinações Unicode pré-compostas/decompostas;
- `Ç` e política para caracteres não permitidos;
- cinco letras depois da normalização;
- respostas e palpites inválidos;
- feedback com letras duplicadas, exatas e presentes em posições diferentes;
- vitória na primeira e sexta tentativa, derrota após seis erros;
- ordenação dos estados e precedência de melhor estado no teclado;
- seleção de puzzle na virada de data e chave local por identificador.

### Integração

- tentativa aceita devolve cinco marcas e não devolve resposta antes do encerramento;
- palavra fora do vocabulário não incrementa tentativas;
- erro de rede/servidor mantém entrada e não altera progresso;
- repetição com `requestId` não duplica tentativa;
- resposta terminal contém a forma editorial acentuada;
- calendário sem puzzle resulta em erro controlado e observável.

### Ponta a ponta e acessibilidade

- primeira visita, instruções, primeira tentativa, vitória e derrota;
- restauração de partida em refresh e isolamento ao mudar de dia;
- fluxo por teclado sem rato, incluindo foco e mensagens;
- teclado virtual em viewport estreito, incluindo `Ç`, apagar e enviar;
- zoom 200%, largura 320 CSS px e texto ampliado;
- leitores de tela e estados que não dependem de cor;
- `prefers-reduced-motion`;
- contraste automatizado como triagem e confirmação manual dos estados relevantes.

### Critérios de aceite do MVP

1. Uma sessão permite enviar até seis palpites válidos no puzzle diário.
2. Entrada inválida não consome tentativa e apresenta mensagem compreensível.
3. A comparação de acentos e letras repetidas segue os casos de teste aprovados.
4. A resposta não aparece em HTML/JavaScript/API até vitória ou fim das seis tentativas.
5. Refresh restaura o estado correto do dia sem exigir conta.
6. O tabuleiro é operável por toque e teclado físico; feedback é perceptível sem distinguir cores.
7. A interface suporta as larguras e critérios de acessibilidade definidos neste documento.
8. Quando a API falha, o jogador não perde silenciosamente o palpite nem uma tentativa.
9. A primeira partida pode ser entendida sem cadastro, pista ou tutorial longo.

## 12. Entrega incremental

### Fase 0 — conteúdo e decisões

- definir fuso e hora de troca;
- escolher e licenciar fonte lexical;
- fixar política para `Ç`, flexões, regionalismos, palavras ofensivas e variantes;
- aprovar palavras de resposta, processo de revisão e calendário inicial;
- validar protótipo Lúdico com pessoas em celular e desktop.

### Fase 1 — motor de jogo

- implementar normalização e avaliação com testes unitários;
- importar vocabulário e calendário de desenvolvimento;
- implementar endpoints e garantir não exposição da resposta;
- verificar casos de letras repetidas e colisões.

### Fase 2 — interface funcional

- migrar protótipo para módulos TypeScript e tokens Lúdicos;
- implementar estados, teclado virtual, formulário, recuperação local e mensagens de rede;
- aplicar semântica e anúncios acessíveis desde os primeiros componentes;
- validar layouts estreitos e desktop.

### Fase 3 — hardening e lançamento

- testes de integração/e2e, contraste e tecnologias assistivas;
- revisar logs, rate limits, CSP, licenças e política de privacidade;
- carregar e revisar calendário de produção;
- testar cenário de falha do serviço e virada do dia;
- publicar com monitoramento técnico mínimo sem analytics identificável.

## 13. Riscos e decisões pendentes

| Tema | Proposta neste documento | Decisão necessária |
|---|---|---|
| Proteção da resposta diária | API mantém solução no servidor; revelação apenas no fim | Confirmar que ocultar a resposta justifica operar um serviço |
| Fuso e virada diária | `America/Sao_Paulo` | Aprovar fuso e horário exato |
| Vocabulário | Lista pt-BR mais ampla que a lista de respostas | Selecionar fonte, licença, revisão e política para flexões |
| `Ç` e tamanho | Normalizar para comparação e contar letras após normalização | Aprovar regras para todos os caracteres admitidos |
| Persistência | `localStorage`, sem conta | Definir comportamento desejado quando o navegador bloqueia armazenamento |
| Infraestrutura | Vite/TypeScript, hospedagem estática, API serverless e banco relacional gerenciado | Escolher fornecedor, custo e manutenção |
| Métricas | Sem telemetria identificável no primeiro lançamento | Definir se são necessárias métricas agregadas e como obter consentimento |
| Contraste do tema | Manter paleta lúdica com tokens semânticos e validar cada combinação | Aprovar paleta final após auditoria de contraste |

Estas decisões devem ser fechadas antes de comprometer o calendário editorial ou publicar a primeira resposta real.
