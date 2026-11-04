const comsLine = document.getElementById("coms-line");
const errorLine = document.getElementById("error-line");
const italicText = document.createElement("i");
const makeCodeblock = (codeBlockHTML) => {
  const codeBlockText = document.createElement("span");
  codeBlockText.className = "codeblock";
  codeBlockText.textContent = codeBlockHTML;
  return codeBlockText;
};

function comEscape() {
  comsLine.blur();
  comsLine.value = "";
}

function comFileNew() {
  comsLine.value = "";
  comsLine.setAttribute("placeholder", "Type your desired file name (e.g., filename.js");
}

const coms = {
  ":escape": comEscape,
  ":filenew": comFileNew,
};

const runCom = coms[comsLine.value.trim()];

window.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== comsLine) {
    isComMode = true;
    console.log(isComMode);
    const activeTag = document.activeElement.tagName.toLowerCase();
    if (activeTag !== "input" && activeTag !== "textarea") {
      e.preventDefault();
      comsLine.focus();
    }
  }
});

comsLine.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    trimmedComsLine = comsLine.value.trim();
    const runCom = coms[comsLine.value.trim()];
    comsLine.value = "";
    errorLine.textContent = "";

    if (!runCom) {
      if (trimmedComsLine.includes(".")) {
        italicText.append(
          "\u00A0Did you mean to create a file? If so, please have it end in ",
          makeCodeblock(".md"),
          ", ",
          makeCodeblock(".txt"),
          ", or ",
          makeCodeblock(".js")
        );
        errorLine.append(`Unknown com: ${trimmedComsLine}.`, " ", italicText);

        return;
      }
      errorLine.textContent = `Unknown com: ${trimmedComsLine}`;
      return;
    }
    runCom();
    errorLine.textContent = `Command: ran successfully: ${trimmedComsLine}`;
  }
});
