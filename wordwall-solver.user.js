// ==UserScript==
// @name         Wordwall Solver
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Solves Wordwall questions
// @author       scar17off
// @match        https://wordwall.net/*
// @icon         https://wordwall.net/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const originalFillText = CanvasRenderingContext2D.prototype.fillText;

  window.data = { score: null, maxScore: null };
  let gameOverDetected = false;
  let scoreExtracted = false;
  let slashDetected = false;
  let slashX = 0;
  let slashY = 0;

  CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
    if (!gameOverDetected && text === 'ЗАВЕРШЕНА') {
      gameOverDetected = true;
      console.log('Game Over detected');
    }

    // Only start extracting scores after game over is detected
    if (gameOverDetected && !scoreExtracted && typeof text === 'string') {
      if (text === '/') {
        slashDetected = true;
        slashX = x;
        slashY = y;
      } else if (!slashDetected) {
        // Before slash
        const scoreMatch = text.match(/^(\d+)$/);
        if (scoreMatch) {
          data.score = scoreMatch[1];
        }
      } else {
        // After slashe
        const maxScoreMatch = text.match(/^(\d+)$/);
        if (maxScoreMatch) {
          data.maxScore = maxScoreMatch[1];
          scoreExtracted = true;
          console.log('Extracted scores:', data);
        }
      }
    }

    // If this text is the score, replace it with maxScore and use slash position
    if (text === data.score && data.maxScore !== null) {
      text = data.maxScore;
      x = slashX - 40;
      y = slashY;
    }

    originalFillText.call(this, text, x, y, maxWidth);
  };
})();