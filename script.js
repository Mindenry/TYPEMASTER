// DOM Elements
const quoteDisplayElement = document.querySelector("#quoteDisplay");
const quoteInputElement = document.querySelector("#quoteInput");
const timerElement = document.querySelector("#timer");
const wordsPerMinuteElement = document.querySelector("#wpm");
const progressElement = document.querySelector("#progress");
const accuracyElement = document.querySelector("#accuracy");
const accuracyDetailedElement = document.querySelector("#accuracyDetailed");
const charactersElement = document.querySelector("#characters");
const restartButton = document.querySelector("#restart");
const newTestButton = document.querySelector("#newTest");
const resultElement = document.querySelector("#result");
const mainContentElement = document.querySelector(".main-content");
const resultWpmElement = document.querySelector("#resultWpm");
const resultAccuracyElement = document.querySelector("#resultAccuracy");
const resultCharsElement = document.querySelector("#resultChars");
const modeButtons = document.querySelectorAll(".mode-button");
const themeButtons = document.querySelectorAll(".theme-button");
const languageButtons = document.querySelectorAll(".language-button");
const timeButtons = document.querySelectorAll(".time-button");

// Settings
let currentMode = "quotes";
let currentLanguage = "english";
let currentTheme = "dark";
let timeLimit = 60; // Default 60 seconds
let timerRunning = false;
let testActive = false;

// Stats tracking
let currentIndex = 0;
let errors = 0;
let totalCharacters = 0;
let correctCharacters = 0;
let intervalId;
let startTime;
let endTime;

// Sample quotes to avoid API issues
const sampleQuotes = {
  english: [
    "The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow.",
    "Life is what happens when you're busy making other plans. Carpe diem, seize the day!",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "In the middle of difficulty lies opportunity. Be the change you wish to see in the world.",
    "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    "The future belongs to those who believe in the beauty of their dreams. Dream big!",
    "You miss 100% of the shots you don't take. The journey of a thousand miles begins with one step.",
    "It is during our darkest moments that we must focus to see the light. Hope springs eternal."
  ],
  thai: [
    "การเดินทางพันไมล์เริ่มต้นด้วยก้าวเดียว ความพยายามอยู่ที่ไหนความสำเร็จอยู่ที่นั่น",
    "น้ำขึ้นให้รีบตัก ไม่มีอะไรได้มาง่ายๆ ต้องใช้ความพยายามอย่างมาก",
    "อย่าเสียใจกับสิ่งที่เกิดขึ้นแล้ว จงเรียนรู้จากมันและก้าวต่อไป",
    "ความสำเร็จไม่ได้วัดที่ความร่ำรวย แต่วัดที่ความสุขที่คุณมี",
    "ชีวิตคือการเรียนรู้ ทุกวันมีบทเรียนใหม่ให้เราเสมอ",
    "จงทำวันนี้ให้ดีที่สุด เพราะเราไม่รู้ว่าพรุ่งนี้จะเป็นอย่างไร",
    "ความพยายามนำไปสู่ความสำเร็จ จงพยายามอย่างต่อเนื่อง",
    "การอ่านหนังสือคือการเดินทางที่ไม่ต้องออกจากบ้าน"
  ]
};

const sampleCode = [
  `function calculateArea(radius) {
// Calculate the area of a circle
const PI = 3.14159;
return PI * radius * radius;
}

// Example usage
const radius = 5;
const area = calculateArea(radius);
console.log("Area:", area);`,

  `class Person {
constructor(name, age) {
this.name = name;
this.age = age;
}

greet() {
return "Hello, my name is " + this.name;
}
}

const person = new Person("John", 30);
console.log(person.greet());`,

  `// Asynchronous function example
async function fetchData() {
try {
const response = await fetch('https://api.example.com/data');
const data = await response.json();
return data;
} catch (error) {
console.error('Error fetching data:', error);
}
}`
];

// Initialize event listeners
function init() {
  // Mode buttons
  modeButtons.forEach(button => {
    button.addEventListener("click", () => {
      const mode = button.getAttribute("data-mode");
      setMode(mode);
      modeButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });
  
  // Theme buttons
  themeButtons.forEach(button => {
    button.addEventListener("click", () => {
      const theme = button.getAttribute("data-theme");
      setTheme(theme);
      themeButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });
  
  // Language buttons
  languageButtons.forEach(button => {
    button.addEventListener("click", () => {
      const lang = button.getAttribute("data-lang");
      setLanguage(lang);
      languageButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });
  
  // Time buttons
  timeButtons.forEach(button => {
    button.addEventListener("click", () => {
      timeLimit = parseInt(button.getAttribute("data-time"));
      timeButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      resetTest();
    });
  });
  
  // Input event
  quoteInputElement.addEventListener("input", handleInput);
  
  // Restart buttons
  restartButton.addEventListener("click", resetTest);
  newTestButton.addEventListener("click", resetTest);
  
  // Keyboard shortcuts
  document.addEventListener("keydown", event => {
    if (event.key === "Tab") {
      event.preventDefault();
      resetTest();
    } else if (event.key === "Escape") {
      stopTest();
    }
  });
  
  // Initial quote
  getNextQuote();
  quoteInputElement.focus();
}

function setMode(mode) {
  currentMode = mode;
  document.body.classList.remove("mode-quotes", "mode-code");
  document.body.classList.add(`mode-${mode}`);
  resetTest();
}

function setTheme(theme) {
  currentTheme = theme;
  if (theme === "light") {
    document.documentElement.style.setProperty('--background', '#f0f0f0');
    document.documentElement.style.setProperty('--secondary', '#ffffff');
    document.documentElement.style.setProperty('--text', '#333333');
    document.documentElement.style.setProperty('--text-dark', '#666666');
    document.documentElement.style.setProperty('--card', '#e9e9e9');
    document.documentElement.style.setProperty('--neutral', '#d0d0d0');
    document.documentElement.style.setProperty('--hover', '#c0c0c0');
  } else {
    document.documentElement.style.setProperty('--background', '#1b1c1e');
    document.documentElement.style.setProperty('--secondary', '#232427');
    document.documentElement.style.setProperty('--text', '#e9e9e9');
    document.documentElement.style.setProperty('--text-dark', '#646669');
    document.documentElement.style.setProperty('--card', '#2c2e31');
    document.documentElement.style.setProperty('--neutral', '#3a3c3f');
    document.documentElement.style.setProperty('--hover', '#4a4c4f');
  }
}

function setLanguage(language) {
  currentLanguage = language;
  resetTest();
}

function handleInput() {
  if (!timerRunning && quoteInputElement.value.length > 0) {
    startTimer();
    timerRunning = true;
    testActive = true;
  }
  
  const quoteArray = quoteDisplayElement.querySelectorAll("span");
  const valueArray = quoteInputElement.value.split("");
  let correct = true;
  
  // Remove 'current' class from all spans
  quoteArray.forEach(span => {
    span.classList.remove("current");
  });
  
  // Reset count for accuracy calculation
  correctCharacters = 0;
  errors = 0;
  
  quoteArray.forEach((characterSpan, i) => {
    const character = valueArray[i];
    
    if (character == null) {
      characterSpan.classList.remove("right");
      characterSpan.classList.remove("wrong");
      correct = false;
      
      // Add current indicator to the next character
      if (i === valueArray.length) {
        characterSpan.classList.add("current");
      }
    } else if (character === characterSpan.textContent) {
      characterSpan.classList.add("right");
      characterSpan.classList.remove("wrong");
      correctCharacters++;
    } else {
      characterSpan.classList.remove("right");
      characterSpan.classList.add("wrong");
      correct = false;
      errors++;
    }
  });
  
  // Calculate progress percentage
  const progress = (valueArray.length / quoteArray.length) * 100;
  progressElement.style.width = `${progress}%`;
  
  // Update characters count
  charactersElement.textContent = `${correctCharacters}/${quoteArray.length}`;
  
  // Calculate WPM - assuming 5 characters per word
  const timeElapsed = getTimerTime();
  if (timeElapsed > 0) {
    const wpm = Math.round((correctCharacters / 5) / (timeElapsed / 60));
    wordsPerMinuteElement.textContent = wpm;
  }
  
  // Calculate accuracy
  if (valueArray.length > 0) {
    const accuracy = Math.max(0, Math.round(100 - (errors / valueArray.length * 100)));
    accuracyElement.textContent = accuracy;
    accuracyDetailedElement.textContent = `${accuracy}%`;
  }
  
  // แก้ไขส่วนนี้: ถ้าพิมพ์ครบทุกตัวอักษรและถูกต้องทั้งหมด ให้สิ้นสุดการทดสอบ
  if (correct && valueArray.length === quoteArray.length) {
    // หยุดการทดสอบและแสดงผลคะแนน
    stopTest();
  }
}

function getRandomQuote() {
  if (currentMode === "code") {
    return sampleCode[Math.floor(Math.random() * sampleCode.length)];
  } else {
    return sampleQuotes[currentLanguage][Math.floor(Math.random() * sampleQuotes[currentLanguage].length)];
  }
}

function formatCode(code) {
  // This is a simple formatter for demonstration
  // In a real app, you might want to use a syntax highlighting library
  quoteDisplayElement.innerHTML = "";
  
  const lines = code.split("\n");
  
  lines.forEach((line, lineIndex) => {
    // Simple syntax highlighting
    let highlightedLine = line
      .replace(/\/\/.*/g, match => `<span class="code-comment">${match}</span>`)
      .replace(/(".*?"|'.*?')/g, match => `<span class="code-string">${match}</span>`)
      .replace(/\b(function|class|const|let|var|return|if|else|try|catch|await|async)\b/g, match => `<span class="code-keyword">${match}</span>`)
      .replace(/\b([a-zA-Z]+)(?=\()/g, match => `<span class="code-function">${match}</span>`);
      
    // Create line container
    const lineDiv = document.createElement("div");
    
    // Split highlighted line into characters
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = highlightedLine;
    const textContent = tempDiv.textContent;
    
    let charIndex = 0;
    let inTag = false;
    let currentSpanClass = "";
    
    for (let i = 0; i < highlightedLine.length; i++) {
      if (highlightedLine[i] === '<') {
        inTag = true;
        const match = highlightedLine.slice(i).match(/<span class="([^"]+)">/);
        if (match) {
          currentSpanClass = match[1];
        }
        continue;
      }
      
      if (inTag && highlightedLine[i] === '>') {
        inTag = false;
        continue;
      }
      
      if (!inTag) {
        const span = document.createElement("span");
        span.textContent = highlightedLine[i];
        if (currentSpanClass) {
          span.classList.add(currentSpanClass);
        }
        lineDiv.appendChild(span);
        charIndex++;
      }
    }
    
    // Add line break at the end
    if (lineIndex < lines.length - 1) {
      const lineBreak = document.createElement("span");
      lineBreak.textContent = "\n";
      lineDiv.appendChild(lineBreak);
    }
    
    quoteDisplayElement.appendChild(lineDiv);
  });
}

async function getNextQuote() {
    const quote = getRandomQuote();
    
    if (currentMode === "code") {
      formatCode(quote);
    } else {
      quoteDisplayElement.innerHTML = "";
      
      // Create span for each character
      quote.split("").forEach(character => {
        const characterSpan = document.createElement("span");
        characterSpan.textContent = character;
        quoteDisplayElement.appendChild(characterSpan);
      });
    }
    
    // Set the first character as current - FIXED VERSION
    // Make sure elements exist before trying to access them
    const firstSpan = quoteDisplayElement.querySelector("span");
    if (firstSpan) {
      firstSpan.classList.add("current");
    }
    
    // Reset tracking variables
    quoteInputElement.value = "";  // Changed from null to empty string
    progressElement.style.width = "0%";
    accuracyDetailedElement.textContent = "100%";
    currentIndex = 0;
    errors = 0;
    correctCharacters = 0;
    totalCharacters = quote.length;
    
    // Update characters count
    charactersElement.textContent = `0/${totalCharacters}`;
    
    // Focus on input element
    quoteInputElement.focus();
  }

function startTimer() {
  // Clear any existing intervals
  if (intervalId) {
    clearInterval(intervalId);
  }
  
  timerElement.textContent = timeLimit;
  startTime = new Date();
  
  intervalId = setInterval(() => {
    const timeElapsed = getTimerTime();
    const timeRemaining = timeLimit - timeElapsed;
    
    if (timeRemaining <= 0) {
      stopTest();
      return;
    }
    
    timerElement.textContent = timeRemaining;
  }, 1000);
}

function getTimerTime() {
  return Math.floor((new Date() - startTime) / 1000);
}

function stopTest() {
    clearInterval(intervalId);
    intervalId = null;
    timerRunning = false;
    testActive = false;
    endTime = new Date();
    
    // Calculate final stats
    const totalTime = Math.floor((endTime - startTime) / 1000);
    const characters = quoteDisplayElement.querySelectorAll("span").length;
    
    // Calculate words per minute
    const wpm = Math.round((correctCharacters / 5) / (totalTime / 60));
    
    // Calculate accuracy
    let accuracy = 100;
    if (correctCharacters + errors > 0) {
      accuracy = Math.max(0, Math.round(100 - (errors / (correctCharacters + errors) * 100)));
    }
    
    // Update result elements
    resultWpmElement.textContent = wpm;
    resultAccuracyElement.textContent = `${accuracy}%`;
    resultCharsElement.textContent = correctCharacters;
    
    // บันทึกคะแนนก่อนแสดงผล
    saveScore(wpm, accuracy);
    
    // Show result screen
    mainContentElement.style.display = "none";
    resultElement.style.display = "block";
    restartButton.style.display = "none";
  }
  
  function resetTest() {
    // Clear timer
    clearInterval(intervalId);
    intervalId = null;
    timerRunning = false;
    testActive = false;
    
    // Reset stats
    timerElement.textContent = timeLimit;
    wordsPerMinuteElement.textContent = "0";
    accuracyElement.textContent = "100";
    
    // Reset display
    mainContentElement.style.display = "block";
    resultElement.style.display = "none";
    restartButton.style.display = "block";
    progressElement.style.width = "0%";
    
    // Get new quote
    getNextQuote();
    quoteInputElement.focus();
  }
  
  // Save high scores to local storage
  function saveScore(wpm, accuracy) {
    const scores = JSON.parse(localStorage.getItem('typingScores')) || [];
    
    scores.push({
      date: new Date().toISOString(),
      wpm,
      accuracy,
      mode: currentMode,
      language: currentLanguage,
      timeLimit
    });
    
    // Sort by WPM descending and keep only top 10
    scores.sort((a, b) => b.wpm - a.wpm);
    const topScores = scores.slice(0, 10);
    
    localStorage.setItem('typingScores', JSON.stringify(topScores));
  }
  
  // Export results (optional feature)
  function exportResults() {
    const wpm = resultWpmElement.textContent;
    const accuracy = resultAccuracyElement.textContent;
    const chars = resultCharsElement.textContent;
    
    const text = `TYPEMASTER RESULTS\n\nWPM: ${wpm}\nAccuracy: ${accuracy}\nCharacters: ${chars}\nMode: ${currentMode}\nLanguage: ${currentLanguage}\nTime: ${timeLimit}s\nDate: ${new Date().toLocaleString()}`;
    
    // Create a blob and download link
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `typemaster-results-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // Add export button functionality
  document.querySelector(".export-button")?.addEventListener("click", exportResults);
  
  // Add keyboard sound effects (optional)
  const keySound = new Audio();
  keySound.volume = 0.2;
  
  function playKeySound() {
    // You can use different sounds for correct/incorrect typing
    keySound.src = "https://assets.mixkit.co/active_storage/sfx/2008/2008-preview.mp3";
    keySound.currentTime = 0;
    keySound.play().catch(err => console.error("Error playing sound:", err));
  }
  
  // Optional: Add sound toggle
  function setupSoundToggle() {
    const soundToggle = document.createElement("button");
    soundToggle.className = "theme-button";
    soundToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
    soundToggle.setAttribute("data-sound", "on");
    
    soundToggle.addEventListener("click", () => {
      const currentSoundState = soundToggle.getAttribute("data-sound");
      if (currentSoundState === "on") {
        soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
        soundToggle.setAttribute("data-sound", "off");
        keySound.volume = 0;
      } else {
        soundToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
        soundToggle.setAttribute("data-sound", "on");
        keySound.volume = 0.2;
      }
    });
    
    const soundGroup = document.createElement("div");
    soundGroup.className = "option-group";
    
    const soundLabel = document.createElement("div");
    soundLabel.className = "option-label";
    soundLabel.textContent = "Sound";
    
    soundGroup.appendChild(soundLabel);
    soundGroup.appendChild(soundToggle);
    
    document.querySelector(".options").appendChild(soundGroup);
  }
  
  // Add key sound effect to input
  quoteInputElement.addEventListener("input", () => {
    if (keySound.volume > 0) {
      playKeySound();
    }
  });
  
  // Add feature to track typing speed history
  function trackTypingHistory() {
    const typingData = [];
    let lastInput = "";
    
    quoteInputElement.addEventListener("input", () => {
      if (!testActive) return;
      
      const currentTime = new Date().getTime();
      const elapsedSeconds = (currentTime - startTime) / 1000;
      const currentInput = quoteInputElement.value;
      
      // Only track when a new character is added
      if (currentInput.length > lastInput.length) {
        typingData.push({
          time: elapsedSeconds,
          charactersTyped: currentInput.length,
          wpm: Math.round((correctCharacters / 5) / (elapsedSeconds / 60))
        });
      }
      
      lastInput = currentInput;
    });
    
    return typingData;
  }
  
  // Statistics page (optional)
  function setupStatsPage() {
    // Create stats button
    const statsButton = document.createElement("button");
    statsButton.className = "restart-button";
    statsButton.innerHTML = '<i class="fas fa-chart-line"></i> Stats';
    
    statsButton.addEventListener("click", showStatsPage);
    
    document.querySelector(".action-buttons").appendChild(statsButton);
    
    // Create stats page container
    const statsPage = document.createElement("div");
    statsPage.className = "typing-result";
    statsPage.id = "statsPage";
    statsPage.style.display = "none";
    
    statsPage.innerHTML = `
      <div class="result-title">Your Typing Statistics</div>
      <div id="statsContent" class="stats-content">
        <p>Loading statistics...</p>
      </div>
      <div class="action-buttons">
        <button class="restart-button" id="backButton">
          <i class="fas fa-arrow-left"></i> Back
        </button>
      </div>
    `;
    
    document.querySelector(".container").appendChild(statsPage);
    
    // Add back button functionality
    statsPage.querySelector("#backButton").addEventListener("click", () => {
      statsPage.style.display = "none";
      mainContentElement.style.display = "block";
      restartButton.style.display = "block";
    });
  }
  
  function showStatsPage() {
    const scores = JSON.parse(localStorage.getItem('typingScores')) || [];
    const statsContent = document.querySelector("#statsContent");
    
    mainContentElement.style.display = "none";
    resultElement.style.display = "none";
    restartButton.style.display = "none";
    document.querySelector("#statsPage").style.display = "block";
    
    if (scores.length === 0) {
      statsContent.innerHTML = "<p>No typing tests completed yet. Complete a test to see your statistics!</p>";
      return;
    }
    
    // Calculate average WPM and highest WPM
    const totalWpm = scores.reduce((sum, score) => sum + score.wpm, 0);
    const avgWpm = Math.round(totalWpm / scores.length);
    const highestWpm = Math.max(...scores.map(score => score.wpm));
    
    // Generate HTML for stats display
    let statsHtml = `
      <div class="result-stats">
        <div class="result-stat">
          <div class="result-value">${highestWpm}</div>
          <div class="result-label">Highest WPM</div>
        </div>
        <div class="result-stat">
          <div class="result-value">${avgWpm}</div>
          <div class="result-label">Average WPM</div>
        </div>
        <div class="result-stat">
          <div class="result-value">${scores.length}</div>
          <div class="result-label">Tests Taken</div>
        </div>
      </div>
      
      <h3 style="margin-top: 2rem; margin-bottom: 1rem; color: var(--primary);">Recent Scores</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid var(--neutral);">
            <th style="text-align: left; padding: 0.5rem;">Date</th>
            <th style="text-align: right; padding: 0.5rem;">WPM</th>
            <th style="text-align: right; padding: 0.5rem;">Accuracy</th>
            <th style="text-align: right; padding: 0.5rem;">Mode</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    // Sort scores by date, newest first
    scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add top 5 recent scores
    scores.slice(0, 5).forEach(score => {
      const date = new Date(score.date).toLocaleDateString();
      statsHtml += `
        <tr style="border-bottom: 1px solid var(--neutral);">
          <td style="padding: 0.5rem;">${date}</td>
          <td style="text-align: right; padding: 0.5rem; color: var(--primary); font-weight: bold;">${score.wpm}</td>
          <td style="text-align: right; padding: 0.5rem;">${score.accuracy}%</td>
          <td style="text-align: right; padding: 0.5rem;">${score.mode}${score.language !== 'english' ? ' - ' + score.language : ''}</td>
        </tr>
      `;
    });
    
    statsHtml += `
        </tbody>
      </table>
    `;
    
    statsContent.innerHTML = statsHtml;
  }
  
  // เพิ่มปุ่ม Export
  function addExportButton() {
    if (!document.querySelector(".export-button")) {
      const exportButton = document.createElement("button");
      exportButton.className = "restart-button export-button";
      exportButton.innerHTML = '<i class="fas fa-file-download"></i> Export';
      exportButton.addEventListener("click", exportResults);
      
      // เพิ่มปุ่มเข้าไปในหน้าผลลัพธ์
      const actionButtons = document.querySelector("#result .action-buttons");
      if (actionButtons) {
        actionButtons.appendChild(exportButton);
      }
    }
  }
  
  // ปรับปรุงการเริ่มต้นแอปพลิเคชัน
  document.addEventListener("DOMContentLoaded", () => {
    init();
    setupSoundToggle();
    setupStatsPage();
    addExportButton();
    
    // Initialize typing history tracking
    const typingHistory = trackTypingHistory();
    
    // ไม่ต้องบันทึกคะแนนซ้ำที่นี่ เพราะเราเพิ่มแล้วในฟังก์ชัน stopTest()
    document.querySelector("#newTest").addEventListener("click", resetTest);
  });