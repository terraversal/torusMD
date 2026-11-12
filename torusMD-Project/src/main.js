const { getCurrentWindow } = window.__TAURI__.window;

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

function comLight() {
  document.querySelector(".codeblock").style.backgroundColor = "rgb(198, 198, 198)";
  document.body.style.color = "black";
  document.body.style.backgroundColor = "rgb(223, 223, 223)";
}

function comDark() {
  document.querySelector(".codeblock").style.backgroundColor = "rgb(98, 98, 98)";
  document.body.style.color = "white";
  document.body.style.backgroundColor = "black";
}

function comSystem() {
  if (appWindow.theme === "light") {
    comLight();
  } else {
    comDark();
  }
}

function comEscape() {
  comsLine.blur();
  comsLine.textContent = "";
}

function comFileNew() {
  comsLine.textContent = "";
  comsLine.setAttribute("placeholder", "Type your desired file name (e.g., filename.js)");
}

function comFileOpen() {
  comsLine.textContent = "";
  comsLine.setAttribute("placeholder", "Type your desired file path (e.g., filename.js)");
}
const coms = {
  ":escape": comEscape,
  ":filenew": comFileNew,
  ":fileopen": comFileOpen,
  ":light": comLight,
  ":dark": comDark,
  ":system": comSystem,
};

const runCom = coms[comsLine.textContent.trim()];

window.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== comsLine) {
    isComMode = true;
    const activeTag = document.activeElement.tagName.toLowerCase();
    if (activeTag !== "input" && activeTag !== "textarea") {
      e.preventDefault();
      comsLine.focus();
    }
  }
});

document.addEventListener("mousemove", (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});

comsLine.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    trimmedComsLine = comsLine.textContent.trim();
    const runCom = coms[comsLine.textContent.trim()];
    comsLine.textContent = "";
    errorLine.textContent = "";

    if (!runCom) {
      if (
        trimmedComsLine.includes(".") &&
        !trimmedComsLine.endsWith(".md") &&
        !trimmedComsLine.endsWith(".js") &&
        !trimmedComsLine.endsWith(".txt")
      ) {
        italicText.append(
          "\u00A0Did you mean to create a file? If so, please have it end in ",
          makeCodeblock(".md"),
          ", ",
          makeCodeblock(".txt"),
          ", or ",
          makeCodeblock(".js")
        );
        errorLine.append(`Unknown com: ${trimmedComsLine} -- `, " ", italicText);

        return;
      } else if (!trimmedComsLine.includes(":filenew" && !trimmedComsLine.includes(":fileopen"))) {
        italicText.append(
          "\u00A0Did you mean to create a file? If so, please use either " +
            makeCodeblock(":fileopen"),
          ", or ",
          makeCodeblock(":filenew") + ", and do not enter the filename until you press Enter."
        );
        errorLine.append(`Unknown com: ${trimmedComsLine} -- `, " ", italicText);
      }
      errorLine.textContent = `Unknown com: ${trimmedComsLine}`;
      return;
    }
    runCom();
    errorLine.textContent = `Command ran successfully: ${trimmedComsLine}`;
  }
});
