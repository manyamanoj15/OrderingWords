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

function renderWords(words) {
  const wordsDiv = document.getElementById("words");
  wordsDiv.innerHTML = "";
  words.forEach(word => {
    const div = document.createElement("div");
    div.className = "word";
    div.textContent = word;
    div.draggable = true;
    div.addEventListener("dragstart", (e) => {
      draggedWord = word;
      draggedFrom = 'left';
      div.classList.add("dragging");
    });
    div.addEventListener("dragend", (e) => {
      draggedWord = null;
      draggedFrom = null;
      div.classList.remove("dragging");
    });
    wordsDiv.appendChild(div);
  });
  // Allow dropping words back to left pane
  wordsDiv.addEventListener("dragover", (e) => {
    if (draggedWord && draggedFrom !== 'left') e.preventDefault();
  });
  wordsDiv.addEventListener("drop", (e) => {
    if (draggedWord && draggedFrom !== 'left') {
      // Remove from placedWords
      placedWords.splice(draggedFrom, 1);
      renderWords(wordSets[currentSet].filter(w => !placedWords.includes(w)));
      renderBlanks();
      document.getElementById("nextBtn").style.display = "none";
    }
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
      blank.addEventListener("dragstart", (e) => {
        draggedWord = placedWords[i];
        draggedFrom = i;
        blank.classList.add("dragging");
      });
      blank.addEventListener("dragend", (e) => {
        draggedWord = null;
        draggedFrom = null;
        blank.classList.remove("dragging");
      });
    } else {
      blank.textContent = "";
    }
    blank.addEventListener("dragover", (e) => {
      // Allow drop if blank is empty and either from left or another blank
      if (!placedWords[i] && draggedWord) e.preventDefault();
    });
    blank.addEventListener("drop", (e) => {
      if (placedWords[i] || !draggedWord) return;
      // Determine new placedWords
      let newPlaced = placedWords.slice();
      if (draggedFrom === 'left') {
        newPlaced[i] = draggedWord;
      } else {
        // Moving between blanks
        newPlaced.splice(draggedFrom, 1);
        newPlaced.splice(i, 0, draggedWord);
      }
      // Remove undefined
      newPlaced = newPlaced.filter(Boolean);
      // Check if the word is in the correct alphabetical position
      let correctOrder = wordSets[currentSet].slice().sort();
      let isCorrect = true;
      for (let j = 0; j < newPlaced.length; j++) {
        if (newPlaced[j] !== correctOrder[j]) {
          isCorrect = false;
          break;
        }
      }
      if (!isCorrect) {
        showPopup("No no no, try again");
        return;
      }
      placedWords = newPlaced;
      renderWords(wordSets[currentSet].filter(w => !placedWords.includes(w)));
      renderBlanks();
      if (placedWords.length === 3) {
        document.getElementById("nextBtn").style.display = "flex";
      } else {
        document.getElementById("nextBtn").style.display = "none";
      }
    });
    blanksDiv.appendChild(blank);
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

// Initial render

// Popup function
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

renderWords(wordSets[currentSet]);
renderBlanks();
