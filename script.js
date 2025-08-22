// Alphabetical Ordering Game - Cleaned and Robust Version
const wordSets = [
  ["cat", "bat", "rat"],
  ["sun", "fun", "run"],
  ["dog", "fog", "log"],
  ["pen", "hen", "men"],
  ["car", "bar", "jar"]
];
let currentSet = 0;
let draggedWord = null;
let draggedFrom = null; // 'left' or blank index
let placedWords = [];
let touchSelectedWord = null;
let touchSelectedFrom = null;
let touchGhost = null;

function renderWords(words) {
  const wordsDiv = document.getElementById("words");
  wordsDiv.innerHTML = "";
  words.forEach(word => {
    const div = document.createElement("div");
    div.className = "word";
    div.textContent = word;
    div.draggable = true;
    // Desktop drag
    div.addEventListener("dragstart", () => {
      draggedWord = word;
      draggedFrom = 'left';
      div.classList.add("dragging");
    });
    div.addEventListener("dragend", () => {
      draggedWord = null;
      draggedFrom = null;
      div.classList.remove("dragging");
    });
    // Mobile touch drag
    div.addEventListener("touchstart", (e) => {
      e.preventDefault();
      touchSelectedWord = word;
      touchSelectedFrom = 'left';
      div.classList.add("dragging");
      // Create ghost
      touchGhost = div.cloneNode(true);
      touchGhost.style.position = 'fixed';
      touchGhost.style.pointerEvents = 'none';
      touchGhost.style.opacity = '0.8';
      touchGhost.style.zIndex = '1002';
      touchGhost.classList.add('dragging');
      document.body.appendChild(touchGhost);
    });
    div.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touchGhost) {
        touchGhost.style.left = (touch.clientX - 80) + 'px';
        touchGhost.style.top = (touch.clientY - 40) + 'px';
        touchGhost.style.width = 'auto';
        touchGhost.style.maxWidth = '200px';
        touchGhost.style.height = 'auto';
        touchGhost.style.fontSize = '2rem';
      }
      // Highlight blank
      const dropIndex = getBlankIndexAtPoint(touch.clientX, touch.clientY);
      document.querySelectorAll('.blank').forEach((b, idx) => {
        if (dropIndex === idx) b.classList.add('highlight-drop');
        else b.classList.remove('highlight-drop');
      });
    });
    div.addEventListener("touchend", (e) => {
      e.preventDefault();
      div.classList.remove("dragging");
      if (touchGhost) {
        document.body.removeChild(touchGhost);
        touchGhost = null;
      }
      document.querySelectorAll('.blank').forEach(b => b.classList.remove('highlight-drop'));
      const touch = e.changedTouches[0];
      const dropIndex = getBlankIndexAtPoint(touch.clientX, touch.clientY);
      const firstEmpty = getFirstEmptyBlankIndex();
      if (dropIndex === firstEmpty && !placedWords[dropIndex]) {
        if (!canPlaceWord(word, dropIndex)) {
          showPopup("No no no, try again");
          touchSelectedWord = null;
          touchSelectedFrom = null;
          return;
        }
        let newPlaced = placedWords.slice();
        newPlaced[dropIndex] = word;
        newPlaced = newPlaced.filter(Boolean);
        placedWords = newPlaced;
        renderWords(wordSets[currentSet].filter(w => !placedWords.includes(w)));
        renderBlanks();
        showNextBtnIfReady();
      } else {
        showPopup("No no no, try again");
      }
      touchSelectedWord = null;
      touchSelectedFrom = null;
    });
    wordsDiv.appendChild(div);
  });
  // Touch: tap left pane to move selected word back
  wordsDiv.addEventListener("touchstart", (e) => {
    if (!touchSelectedWord || touchSelectedFrom === 'left') return;
    if (e.target !== wordsDiv) return;
    placedWords.splice(touchSelectedFrom, 1);
    clearTouchSelection();
    renderWords(wordSets[currentSet].filter(w => !placedWords.includes(w)));
    renderBlanks();
    document.getElementById("nextBtn").style.display = "none";
  });
}

function renderBlanks() {
  const blanksDiv = document.getElementById("blanks");
  blanksDiv.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const blank = document.createElement("div");
    blank.className = "blank";
    blank.dataset.index = i;
    if (i === placedWords.length) blank.classList.add("enabled");
    if (placedWords[i]) {
      blank.textContent = placedWords[i];
      blank.classList.add("filled");
      blank.draggable = true;
      blank.addEventListener("dragstart", () => {
        draggedWord = placedWords[i];
        draggedFrom = i;
        blank.classList.add("dragging");
      });
      blank.addEventListener("dragend", () => {
        draggedWord = null;
        draggedFrom = null;
        blank.classList.remove("dragging");
      });
      // Mobile touch drag for blanks
      blank.addEventListener("touchstart", (e) => {
        e.preventDefault();
        touchSelectedWord = placedWords[i];
        touchSelectedFrom = i;
        blank.classList.add("dragging");
        touchGhost = blank.cloneNode(true);
        touchGhost.style.position = 'fixed';
        touchGhost.style.pointerEvents = 'none';
        touchGhost.style.opacity = '0.8';
        touchGhost.style.zIndex = '1002';
        touchGhost.classList.add('dragging');
        document.body.appendChild(touchGhost);
      });
      blank.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        if (touchGhost) {
          touchGhost.style.left = (touch.clientX - 80) + 'px';
          touchGhost.style.top = (touch.clientY - 40) + 'px';
          touchGhost.style.width = 'auto';
          touchGhost.style.maxWidth = '200px';
          touchGhost.style.height = 'auto';
          touchGhost.style.fontSize = '2rem';
        }
        const dropIndex = getBlankIndexAtPoint(touch.clientX, touch.clientY);
        document.querySelectorAll('.blank').forEach((b, idx) => {
          if (dropIndex === idx) b.classList.add('highlight-drop');
          else b.classList.remove('highlight-drop');
        });
      });
      blank.addEventListener("touchend", (e) => {
        e.preventDefault();
        blank.classList.remove("dragging");
        if (touchGhost) {
          document.body.removeChild(touchGhost);
          touchGhost = null;
        }
        document.querySelectorAll('.blank').forEach(b => b.classList.remove('highlight-drop'));
        const touch = e.changedTouches[0];
        const dropIndex = getBlankIndexAtPoint(touch.clientX, touch.clientY);
        const firstEmpty = getFirstEmptyBlankIndex();
        if (dropIndex === firstEmpty && dropIndex !== i && !placedWords[dropIndex]) {
          if (!canPlaceWord(placedWords[i], dropIndex)) {
            showPopup("No no no, try again");
            touchSelectedWord = null;
            touchSelectedFrom = null;
            return;
          }
          let newPlaced = placedWords.slice();
          newPlaced.splice(i, 1);
          newPlaced[dropIndex] = placedWords[i];
          newPlaced = newPlaced.filter(Boolean);
          placedWords = newPlaced;
          renderWords(wordSets[currentSet].filter(w => !placedWords.includes(w)));
          renderBlanks();
          showNextBtnIfReady();
        } else if (isTouchInLeftPane(touch.clientX, touch.clientY)) {
          placedWords.splice(i, 1);
          renderWords(wordSets[currentSet].filter(w => !placedWords.includes(w)));
          renderBlanks();
          document.getElementById("nextBtn").style.display = "none";
        } else {
          showPopup("No no no, try again");
        }
        touchSelectedWord = null;
        touchSelectedFrom = null;
      });
    } else {
      blank.textContent = "";
    }
    blank.addEventListener("dragover", (e) => {
      if (!placedWords[i] && draggedWord) e.preventDefault();
    });
    blank.addEventListener("drop", () => {
      const firstEmpty = getFirstEmptyBlankIndex();
      if (placedWords[i] || !draggedWord || i !== firstEmpty) {
        showPopup("No no no, try again");
        return;
      }
      if (!canPlaceWord(draggedWord, i)) {
        showPopup("No no no, try again");
        return;
      }
      let newPlaced = placedWords.slice();
      if (draggedFrom === 'left') {
        newPlaced[i] = draggedWord;
      } else {
        newPlaced.splice(draggedFrom, 1);
        newPlaced.splice(i, 0, draggedWord);
      }
      newPlaced = newPlaced.filter(Boolean);
      placedWords = newPlaced;
      renderWords(wordSets[currentSet].filter(w => !placedWords.includes(w)));
      renderBlanks();
      showNextBtnIfReady();
    });
    blanksDiv.appendChild(blank);
  }
}

function isAlphabetical(arr) {
  let sorted = [...arr].sort();
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== sorted[i]) return false;
  }
  return true;
}

function getBlankIndexAtPoint(x, y) {
  const blanks = document.querySelectorAll('.blank');
  for (let i = 0; i < blanks.length; i++) {
    const rect = blanks[i].getBoundingClientRect();
    if (
      x >= rect.left - 40 && x <= rect.right + 40 &&
      y >= rect.top - 40 && y <= rect.bottom + 40
    ) {
      return i;
    }
  }
  return null;
}

function isTouchInLeftPane(x, y) {
  const leftPane = document.querySelector('.left');
  if (!leftPane) return false;
  const rect = leftPane.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function showNextBtnIfReady() {
  if (placedWords.length === 3) {
    document.getElementById("nextBtn").style.display = "flex";
  } else {
    document.getElementById("nextBtn").style.display = "none";
  }
}

function nextSet() {
  currentSet = (currentSet + 1) % wordSets.length;
  placedWords = [];
  renderWords(wordSets[currentSet]);
  renderBlanks();
  document.getElementById("nextBtn").style.display = "none";
}

document.getElementById("nextBtn").addEventListener("click", nextSet);

function highlightSelectedWord(element) {
  document.querySelectorAll('.word, .blank').forEach(el => {
    el.classList.remove('selected-touch');
  });
  element.classList.add('selected-touch');
}

function clearTouchSelection() {
  touchSelectedWord = null;
  touchSelectedFrom = null;
  document.querySelectorAll('.word, .blank').forEach(el => {
    el.classList.remove('selected-touch');
  });
}

function showPopup(message) {
  let popup = document.getElementById('popup-message');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'popup-message';
    popup.style.position = 'fixed';
    popup.style.top = '10%';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.background = '#ff5252';
    popup.style.color = 'white';
    popup.style.padding = '1rem 2rem';
    popup.style.borderRadius = '1rem';
    popup.style.fontSize = '1.5rem';
    popup.style.zIndex = '1000';
    popup.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
    document.body.appendChild(popup);
  }
  popup.textContent = message;
  popup.style.display = 'block';
  setTimeout(() => {
    popup.style.display = 'none';
  }, 2000);
}

function canPlaceWord(word, blankIndex) {
  // Only allow the correct word for this blank
  const sorted = wordSets[currentSet].slice().sort();
  return word === sorted[blankIndex];
}

function getFirstEmptyBlankIndex() {
  for (let i = 0; i < 3; i++) {
    if (!placedWords[i]) return i;
  }
  return null;
}

// Initial render
renderWords(wordSets[currentSet]);
renderBlanks();
