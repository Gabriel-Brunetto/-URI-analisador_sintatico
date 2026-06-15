// ==========================================
// ANÁLISE SINTÁTICA LL(1)
// Gabriel Brunetto
// Eduardo Ongaratto
// ==========================================

// Gramática:
//
// E  → T E'
// E' → + T E' | ε
// T  → F T'
// T' → * F T' | ε
// F  → ( E ) | id

// ==========================================
// TABELA DE PARSING
// ==========================================

var tabela = {

  "E": {
    "id": ["T", "E'"],
    "(": ["T", "E'"]
  },

  "E'": {
    "+": ["+", "T", "E'"],
    ")": ["ε"],
    "$": ["ε"]
  },

  "T": {
    "id": ["F", "T'"],
    "(": ["F", "T'"]
  },

  "T'": {
    "*": ["*", "F", "T'"],
    "+": ["ε"],
    ")": ["ε"],
    "$": ["ε"]
  },

  "F": {
    "id": ["id"],
    "(": ["(", "E", ")"]
  }

}

// ==========================================
// ANALISAR SENTENÇA
// ==========================================

function analisar() {

  var texto =
    document
      .getElementById("inputSentenca")
      .value
      .trim()

  if (texto == "") {

    alert("Digite uma sentença.")

    return
  }

  limparResultado()

  var tokens =
    texto.split(/\s+/)

  tokens.push("$")

  var pilha = []

  pilha.push("$")
  pilha.push("E")

  var passos = []

  var indiceEntrada = 0

  var aceito = false

  var mensagemErro = ""

  while (true) {

    var topo =
      pilha[pilha.length - 1]

    var tokenAtual =
      tokens[indiceEntrada]

    var pilhaStr =
      pilha
        .slice()
        .reverse()
        .join(" ")

    var entradaStr =
      tokens
        .slice(indiceEntrada)
        .join(" ")

    // =========================
    // ACEITAÇÃO
    // =========================

    if (
      topo == "$" &&
      tokenAtual == "$"
    ) {

      passos.push([
        pilhaStr,
        entradaStr,
        "ACEITO ✔"
      ])

      aceito = true

      break
    }

    // =========================
    // TERMINAL
    // =========================

    if (
      topo != "E" &&
      topo != "E'" &&
      topo != "T" &&
      topo != "T'" &&
      topo != "F"
    ) {

      if (topo == tokenAtual) {

        passos.push([
          pilhaStr,
          entradaStr,
          "Consumir terminal '" + topo + "'"
        ])

        pilha.pop()

        indiceEntrada++

      } else {

        passos.push([
          pilhaStr,
          entradaStr,
          "ERRO: esperado '" +
          topo +
          "', encontrado '" +
          tokenAtual +
          "'"
        ])

        mensagemErro =
          "Esperado '" +
          topo +
          "' mas encontrado '" +
          tokenAtual +
          "'."

        break
      }

    }

    // =========================
    // NÃO TERMINAL
    // =========================

    else {

      var producao =
        tabela[topo][tokenAtual]

      if (
        producao == undefined
      ) {

        passos.push([
          pilhaStr,
          entradaStr,
          "ERRO: sem produção para [" +
          topo +
          ", " +
          tokenAtual +
          "]"
        ])

        mensagemErro =
          "Não existe regra para [" +
          topo +
          ", " +
          tokenAtual +
          "]."

        break
      }

      pilha.pop()

      passos.push([
        pilhaStr,
        entradaStr,
        "Aplicar: " +
        topo +
        " → " +
        producao.join(" ")
      ])

      if (producao[0] != "ε") {

        for (
          var j = producao.length - 1;
          j >= 0;
          j--
        ) {

          pilha.push(
            producao[j]
          )
        }

      }

    }

  }

  mostrarPassos(passos)

  mostrarResultado(
    aceito,
    mensagemErro,
    texto
  )

  atualizarEstatisticas(
    passos.length,
    tokens.length - 1
  )

}

// ==========================================
// MOSTRAR PASSOS
// ==========================================

function mostrarPassos(passos) {

  document
    .getElementById("secaoPassos")
    .style.display = "block"

  var tabelaPassos =
    document.getElementById(
      "tabelaPassos"
    )

  tabelaPassos.innerHTML = ""

  for (
    var i = 0;
    i < passos.length;
    i++
  ) {

    var linha =
      document.createElement("tr")

    var coluna1 =
      document.createElement("td")

    coluna1.textContent =
      i + 1

    var coluna2 =
      document.createElement("td")

    coluna2.textContent =
      passos[i][0]

    var coluna3 =
      document.createElement("td")

    coluna3.textContent =
      passos[i][1]

    var coluna4 =
      document.createElement("td")

    coluna4.textContent =
      passos[i][2]

    if (
      passos[i][2]
        .indexOf("ERRO") != -1
    ) {

      linha.style.background =
        "#fee2e2"
    }

    if (
      passos[i][2]
        .indexOf("ACEITO") != -1
    ) {

      linha.style.background =
        "#dcfce7"
    }

    linha.appendChild(coluna1)
    linha.appendChild(coluna2)
    linha.appendChild(coluna3)
    linha.appendChild(coluna4)

    tabelaPassos.appendChild(
      linha
    )

  }

}

// ==========================================
// RESULTADO FINAL
// ==========================================

function mostrarResultado(
  aceito,
  erro,
  sentenca
) {

  var resultado =
    document.getElementById(
      "resultado"
    )

  if (aceito) {

    resultado.className =
      "aceito"

    resultado.textContent =
      "✓ SENTENÇA ACEITA: " +
      sentenca

  } else {

    resultado.className =
      "rejeitado"

    resultado.textContent =
      "✗ SENTENÇA REJEITADA: " +
      erro

  }

}

// ==========================================
// ESTATÍSTICAS
// ==========================================

function atualizarEstatisticas(
  passos,
  tokens
) {

  document
    .getElementById(
      "estatisticas"
    )
    .style.display = "block"

  document
    .getElementById(
      "qtPassos"
    )
    .textContent = passos

  document
    .getElementById(
      "qtTokens"
    )
    .textContent = tokens

}

// ==========================================
// GERADOR DE SENTENÇAS
// ==========================================

function gerarSentenca() {

  var sentenca =
    gerarE(0)

  sentenca =
    sentenca
      .replace(/\s+/g, " ")
      .trim()

  document
    .getElementById(
      "inputSentenca"
    )
    .value = sentenca

  limparResultado()

}

// ==========================================
// E
// ==========================================

function gerarE(prof) {

  return (
    gerarT(prof) +
    gerarELinha(prof)
  )

}

// ==========================================
// E'
// ==========================================

function gerarELinha(prof) {

  if (
    prof > 2 ||
    Math.random() < 0.5
  ) {

    return ""
  }

  return (
    " + " +
    gerarT(prof + 1) +
    gerarELinha(prof + 1)
  )

}

// ==========================================
// T
// ==========================================

function gerarT(prof) {

  return (
    gerarF(prof) +
    gerarTLinha(prof)
  )

}

// ==========================================
// T'
// ==========================================

function gerarTLinha(prof) {

  if (
    prof > 2 ||
    Math.random() < 0.5
  ) {

    return ""
  }

  return (
    " * " +
    gerarF(prof + 1) +
    gerarTLinha(prof + 1)
  )

}

// ==========================================
// F
// ==========================================

function gerarF(prof) {

  if (
    prof < 2 &&
    Math.random() < 0.35
  ) {

    return (
      "( " +
      gerarE(prof + 1) +
      " )"
    )
  }

  return "id"

}

// ==========================================
// REINICIAR
// ==========================================

function reiniciar() {

  document
    .getElementById(
      "inputSentenca"
    )
    .value = ""

  document
    .getElementById(
      "tabelaPassos"
    )
    .innerHTML = ""

  document
    .getElementById(
      "secaoPassos"
    )
    .style.display = "none"

  document
    .getElementById(
      "estatisticas"
    )
    .style.display = "none"

  limparResultado()

}

// ==========================================
// LIMPAR RESULTADO
// ==========================================

function limparResultado() {

  var resultado =
    document.getElementById(
      "resultado"
    )

  resultado.className = ""

  resultado.style.display =
    "none"

  resultado.textContent = ""

}