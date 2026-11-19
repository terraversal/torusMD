const { getCurrentWindow } = window.__TAURI__.window;
const { open } = window.__TAURI__.dialog;
const { readTextFile } = window.__TAURI__.fs;
const { save } = window.__TAURI__.dialog;

const response = await fetch("resources/words.txt");
const text = await response.text();
const lines = text.split(/\r?\n/);
const wordHierarchy = lines.filter(Boolean).map((item, index) => {
  return { id: index, name: item };
});

const homescreen = document.getElementById("homescreen");
const currentPage = document.getElementById("current-page");
const openedContents = document.getElementById("opened-contents");

const comsLine = document.getElementById("coms-line");
const errorLine = document.getElementById("error-line");
const italicText = document.createElement("i");
const makeCodeblock = (codeBlockHTML) => {
  const codeBlockText = document.createElement("span");
  codeBlockText.className = "codeblock";
  codeBlockText.textContent = codeBlockHTML;
  return codeBlockText;
};
const cursor = document.getElementById("cursor");

const appWindow = getCurrentWindow();
const word1 = document.getElementById("word1");
const word2 = document.getElementById("word2");
const word3 = document.getElementById("word3");

const range = document.createRange();
const selection = window.getSelection();

const modes = {
  editMode: false,
  normalMode: false,
};

let path = "";

let isComMode = false;
let isSaved = false;

let comsHistory = [];
let isAutosuggest = true;
let zIndex = 1;

let isHomescreen = true;

let isSystem = false;

currentPage.style.display = "none";

async function readFile() {
  const selectedPath = await open({
    multiple: false,
    directory: false,
    filters: [
      {
        name: "Text Files",
        extensions: ["txt", "md", "js"],
      },
    ],
  });

  if (!selectedPath) {
    console.log("User canceled the dialog.");
    return;
  }

  try {
    isHomescreen = false;
    homescreen.style.display = "none";

    const contents = await readTextFile(selectedPath);
    const openedContents = document.createElement("pre");

    openedContents.textContent = contents;
    currentPage.style.display = "flex";
    currentPage.appendChild(openedContents);
  } catch (error) {
    errorLine.textContent = "Failed to read file: " + error;
    currentPage.style.display = "none";
    openedContents.display = "none";
    homescreen.style.display = "flex";
    isHomescreen = true;
  }
}

function predict(sentence = "") {
  let sentenceArr = sentence.split(" ");
  let predictWord = sentenceArr.at(-1);
  const rust = wordHierarchy
    .filter((item) => item.name.startsWith(predictWord))
    .slice(0, 3)
    .sort((a, b) => b.id - a.id)
    .map((item) => item.name);

  return rust;
}

function comLight() {
  if (!isSystem) {
    comsHistory.push(comsLine.textContent);
  }
  document.querySelectorAll(".codeblock").forEach((el) => {
    el.style.backgroundColor = "rgb(198, 198, 198)";
  });
  document.body.style.color = "black";
  document.body.style.backgroundColor = "rgb(210, 210, 210)";
  comsLine.textContent = "";
}

function comDark() {
  if (!isSystem) {
    comsHistory.push(comsLine.textContent);
  }
  document.querySelectorAll(".codeblock").forEach((el) => {
    el.style.backgroundColor = "rgb(98, 98, 98)";
  });
  document.body.style.color = "white";
  document.body.style.backgroundColor = "black";
  comsLine.textContent = "";
}

function comSystem() {
  isSystem = true;

  comsHistory.push(comsLine.textContent);
  if (appWindow.theme === "light") {
    comLight();
  } else {
    comDark();
  }
  comsLine.textContent = "";

  isSystem = false;
}

function comEscape() {
  comsLine.blur();
  comsHistory.push(comsLine.textContent);
  comsLine.textContent = "";
}

function comFileNew() {
  comsHistory.push(comsLine.textContent);
  comsLine.textContent = "";
}

function comFileOpen() {
  comsHistory.push(comsLine.textContent);
  readFile();
  comsLine.textContent = "";
}

function repeatAction1() {
  coms[comsHistory.at(-1)]();
  comsHistory.push(comsLine.textContent);
  comsLine.textContent = "";
}

function repeatAction2() {
  coms[comsHistory.at(-2)]();
  comsHistory.push(comsLine.textContent);
  comsLine.textContent = "";
}

function repeatAction3() {
  coms[comsHistory.at(-3)]();
  comsHistory.push(comsLine.textContent);
  comsLine.textContent = "";
}

function autosuggest() {
  comsHistory.push(comsLine.textContent);
  isAutosuggest = !isAutosuggest;

  if (!isAutosuggest) {
    document.getElementById("keyboard-autosuggest").style.display = "none";
  } else {
    document.getElementById("keyboard-autosuggest").style.display = "flex";
  }
}

function comHomescreen() {
  if (currentPage.style.display === "flex") {
    errorLine.textContent = "Cannot enter homescreen";
    return;
  }

  isHomescreen = !isHomescreen;

  if (isHomescreen) {
    homescreen.style.display = "flex";
    currentPage.display = "none";
  } else {
    homescreen.style.display = "none";
  }
  comsLine.textContent = "";
}
const coms = {
  ":escape": comEscape,
  ":filenew": comFileNew,
  ":fileopen": comFileOpen,
  ":light": comLight,
  ":dark": comDark,
  ":system": comSystem,
  "gj": repeatAction1,
  "gjgj": repeatAction2,
  "gjgjgj": repeatAction3,
  ":autosuggest": autosuggest,
  ":homescreen": comHomescreen,
  //  ":browser": comBrowser,
};

const runCom = () => coms[comsLine.textContent.trim()];

window.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== comsLine) {
    isComMode = true;
    const activeTag = document.activeElement.tagName.toLowerCase();
    if (activeTag !== "p" && activeTag !== "textarea") {
      e.preventDefault();
      comsLine.focus();
    }
  }
});

document.addEventListener("mousemove", (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});

comsLine.addEventListener("input", (e) => {
  //it took this long to just figure out that it wasn't working because it's supposed to be .textcontent and not .value.
  [word2.textContent, word1.textContent, word3.textContent] = predict(e.target.textContent);

  let lastWord = e.target.textContent.trimEnd().split(" ").at(-1);

  if (word1.textContent === "") {
    word1.textContent = `"${lastWord.toLowerCase()}"`;
  }
  if (word2.textContent === "") {
    word2.textContent = `"${lastWord}"`;
  }
  if (word3.textContent === "") {
    word3.textContent = `"${lastWord.toUpperCase()}"`;
  }

  [word1, word2, word3].forEach((word) => {
    const len = word.textContent.length;

    if (len >= 12) {
      word.textContent = word.textContent.slice(0, 4) + "...";
    } else if (len >= 5) {
      const size = 1 - (len - 4) * 0.05;
      word.style.fontSize = `${size.toFixed(2)}rem`;
    } else {
      word.style.fontSize = "1rem";
    }
  });
});

comsLine.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const trimmedComsLine = comsLine.textContent.trim();
    const runCom = coms[trimmedComsLine];

    if (!runCom) {
      if (trimmedComsLine.startsWith(":fileopen=")) {
        path = trimmedComsLine.replace(":fileopen=", "").trim();

        async function readFileType() {
          try {
            homescreen.style.display = "none";

            const contents = await readTextFile(path);
            const openedContents = document.createElement("pre");
            openedContents.textContent = "";
            openedContents.textContent = contents;
            currentPage.style.display = "flex";
            currentPage.replaceChildren();
            currentPage.appendChild(openedContents);
          } catch (error) {
            errorLine.textContent = "Failed to read file:" + error;
          }
        }

        readFileType();
        errorLine.textContent = `Opened file: ${path}`;

        return;
      }
      errorLine.textContent = "Unknown com: " + comsLine.textContent;
      return;
    } else {
      errorLine.textContent = `Com ran successfully: ${trimmedComsLine}`;
    }

    runCom();
    errorLine.textContent = "";
    errorLine.textContent = `Com ran successfully: ${trimmedComsLine}`;
  } else if (e.altKey && e.code === "KeyU") {
    e.preventDefault();
    let trimmedComsLine = comsLine.textContent.trim();

    const comsLineArr = trimmedComsLine.split(" ");
    comsLineArr.length -= 1;
    const comsLineStr = comsLineArr.join(" ");
    comsLine.textContent = comsLineStr + " " + word1.textContent;

    range.selectNodeContents(comsLine);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  } else if (e.altKey && e.code === "KeyI") {
    e.preventDefault();
    let trimmedComsLine = comsLine.textContent.trim();

    const comsLineArr = trimmedComsLine.split(" ");
    comsLineArr.length -= 1;
    const comsLineStr = comsLineArr.join(" ");
    comsLine.textContent = comsLineStr + " " + word2.textContent;

    range.selectNodeContents(comsLine);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  } else if (e.altKey && e.code === "KeyO") {
    e.preventDefault();
    let trimmedComsLine = comsLine.textContent.trim();

    const comsLineArr = trimmedComsLine.split(" ");
    comsLineArr.length -= 1;
    const comsLineStr = comsLineArr.join(" ");
    comsLine.textContent = comsLineStr + " " + word3.textContent;

    range.selectNodeContents(comsLine);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
});

window.addEventListener("keydown", (e) => {
  if (e.code === "KeyE" && isComMode === true) {
  }
});
