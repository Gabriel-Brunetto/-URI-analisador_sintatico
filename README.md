<p align="center">
  <img
    src="https://www.fw.uri.br/storage/files/d8277bf7b7c40dcf4d11c32c900ed7ech_geral.png"
    alt="Logo URI"
    height="80"
  />
</p>

<br>
<br>

# Analisador Sintático LL(1)

> Parser preditivo descendente não recursivo tabular para expressões aritméticas.

Trabalho desenvolvido para a disciplina de **Compiladores** — URI Campus Erechim.
Professor: Fabio Zanin | TDE – Trabalho Discente Efetivo 2

---

## Como executar

Sem instalação. Sem dependências. Só abrir no navegador.

```
analisador/
├── index.html   ← abrir este
├── style.css
├── parser.js
└── README.md
```

1. Baixe os 4 arquivos na mesma pasta
2. Abra o `index.html` em qualquer navegador
3. Digite uma sentença ou clique em **Gerar**

---

## A Gramática

Reconhece **expressões aritméticas** com soma, multiplicação e parênteses.

```
E  →  T E'
E' →  + T E'  |  ε
T  →  F T'
T' →  * F T'  |  ε
F  →  ( E )   |  id
```

| Requisito                            | Atendido? |
|--------------------------------------|-----------|
| Mínimo 4 regras                      | ✅ 5 regras |
| 3 regras com 2+ produções            | ✅ E', T', F |
| Uma produção levando a ε             | ✅ E' → ε e T' → ε |
| Sem recursão à esquerda              | ✅ |
| Fatorada                             | ✅ |
| Não ambígua                          | ✅ |

---

## Conjuntos FIRST e FOLLOW

### Como calcular o FIRST

Para cada produção `A → α`, olha-se o primeiro símbolo de `α`:
- Se for **terminal** → entra direto no FIRST(A)
- Se for **não-terminal** → inclui o FIRST dele (sem o ε)
- Se esse símbolo pode derivar **ε** → passa para o próximo da produção
- Se **todos** podem derivar ε → ε entra no FIRST(A)

| NT | FIRST |
|----|-------|
| E  | `{ id, ( }` |
| E' | `{ +, ε }` |
| T  | `{ id, ( }` |
| T' | `{ *, ε }` |
| F  | `{ id, ( }` |

### Como calcular o FOLLOW

- O símbolo inicial sempre recebe `$` no FOLLOW
- Para `A → α B β`: FIRST(β) \ {ε} entra no FOLLOW(B)
- Se β pode derivar ε, ou B está no fim: FOLLOW(A) entra no FOLLOW(B)

| NT | FOLLOW |
|----|--------|
| E  | `{ ), $ }` |
| E' | `{ ), $ }` |
| T  | `{ +, ), $ }` |
| T' | `{ +, ), $ }` |
| F  | `{ *, +, ), $ }` |

---

## Tabela de Parsing

Construída a partir dos conjuntos FIRST e FOLLOW.

**Regra:** para cada produção `A → α`:
- Se `a ∈ FIRST(α)` → coloca `A → α` na célula `[A, a]`
- Se `ε ∈ FIRST(α)` → para cada `b ∈ FOLLOW(A)`, coloca `A → α` na célula `[A, b]`

|    | id       | +            | *            | (        | )      | $      |
|----|----------|--------------|--------------|----------|--------|--------|
| E  | E→TE'    |              |              | E→TE'    |        |        |
| E' |          | E'→+TE'      |              |          | E'→ε   | E'→ε   |
| T  | T→FT'    |              |              | T→FT'    |        |        |
| T' |          | T'→ε         | T'→*FT'      |          | T'→ε   | T'→ε   |
| F  | F→id     |              |              | F→(E)    |        |        |

Célula vazia = erro sintático.

---

## Como funciona o algoritmo

O parser usa uma **pilha** e lê os tokens da entrada um por um.

**Estado inicial:**
```
Pilha:    $ E        (topo = E, base = $)
Entrada:  id + id $
```

**A cada iteração:**

```
topo = pilha.peek()
token = entrada.atual()

se topo == "$" e token == "$"  →  ACEITO

se topo é terminal:
    se topo == token  →  pop na pilha + avança na entrada
    senão             →  ERRO

se topo é não-terminal:
    produção = tabela[topo][token]
    se produção existe  →  pop + empilha produção ao contrário (exceto ε)
    senão               →  ERRO
```

### Exemplo: `id + id`

| # | Pilha | Entrada | Ação |
|---|-------|---------|------|
| 1 | E $ | id + id $ | Aplicar: E → T E' |
| 2 | T E' $ | id + id $ | Aplicar: T → F T' |
| 3 | F T' E' $ | id + id $ | Aplicar: F → id |
| 4 | id T' E' $ | id + id $ | Casa terminal 'id' |
| 5 | T' E' $ | + id $ | Aplicar: T' → ε |
| 6 | E' $ | + id $ | Aplicar: E' → + T E' |
| 7 | + T E' $ | + id $ | Casa terminal '+' |
| 8 | T E' $ | id $ | Aplicar: T → F T' |
| 9 | F T' E' $ | id $ | Aplicar: F → id |
| 10 | id T' E' $ | id $ | Casa terminal 'id' |
| 11 | T' E' $ | $ | Aplicar: T' → ε |
| 12 | E' $ | $ | Aplicar: E' → ε |
| 13 | $ | $ | **ACEITO ✔** |

---

## Tokens válidos

| Token | Significado |
|-------|-------------|
| `id`  | identificador (variável genérica) |
| `+`   | operador de soma |
| `*`   | operador de multiplicação |
| `(`   | abre parêntese |
| `)`   | fecha parêntese |

Tokens separados por **espaço**.

---

## Exemplos

### Aceitas ✅
```
id
id + id
id * id
id + id * id
( id + id ) * id
id * ( id + id )
( id )
( id + id ) * ( id * id )
```

### Rejeitadas ❌
```
id + + id       → dois operadores seguidos
id id           → falta operador entre ids
* id            → começa com operador
( id            → parêntese sem fechar
id )            → parêntese sem abrir
```

---

## Estrutura dos arquivos

**`index.html`**
Estrutura da página: gramática, FIRST/FOLLOW e tabela de parsing em HTML estático. Contém também os elementos que o JS manipula — input, botões, tabela de passos e div de resultado.

**`style.css`**
Tema dark estilo terminal/IDE. Fonte JetBrains Mono para conteúdo técnico, Inter para labels. Inclui a animação de entrada das linhas da tabela de passos.

**`parser.js`**
Toda a lógica:
- `tabela` — tabela de parsing como objeto JS
- `analisar()` — loop principal da pilha LL(1)
- `mostrarPassos()` — monta a tabela de passos no DOM
- `mostrarResultado()` — exibe o card de aceito/rejeitado
- `gerarSentenca()` e helpers — geração aleatória recursiva
- `reiniciar()` / `limparResultado()` — limpeza da interface
