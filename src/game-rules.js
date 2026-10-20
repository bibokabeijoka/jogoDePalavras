"use strict";

function normalizeWord(value) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleUpperCase("pt-BR");
}

function evaluateGuess(guess, answer) {
  if (guess.length !== answer.length) throw new Error("Palpite e resposta devem ter o mesmo tamanho.");
  const marks = Array(guess.length).fill("absent");
  const remaining = answer.split("");

  for (let index = 0; index < guess.length; index += 1) {
    if (guess[index] === answer[index]) {
      marks[index] = "correct";
      remaining[index] = null;
    }
  }

  for (let index = 0; index < guess.length; index += 1) {
    if (marks[index] === "correct") continue;
    const match = remaining.indexOf(guess[index]);
    if (match !== -1) {
      marks[index] = "present";
      remaining[match] = null;
    }
  }
  return marks;
}

module.exports = { evaluateGuess, normalizeWord };
