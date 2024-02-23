/**
 * NEVER INPUT USER INPUT. Doing so will allow javascript code to be injected into the webite
 * @param { string } string - html string
 * @returns { node }
 */
function stringToHTML(string) {
    let temp = document.createElement("div");
    temp.innerHTML = string;
    return temp.children[0];
}

function selectOption(select, optionValue) {
    for(let i of select.children) {
        i.removeAttribute("selected");
        if(i.value == optionValue) {
            i.setAttribute("selected", "true");
        }
    }
}

function getQuestionSrc(courseKey, unitIdx, questionIdx) {
    return "question.html?c=" + courseKey + "&u=" + unitIdx + "&q=" + questionIdx;
}
function getUnitSrc(courseKey, unitIdx) {
    return "unit.html?c=" + courseKey + "&u=" + unitIdx;
}
function getCourseSrc(courseKey) {
    return "course.html?c=" + courseKey;
}
function getFlashcardSrc(courseKey, flashcardIdx, sortMode, orientation) {
    let src = "flashcards.html?c=" + courseKey + "&f=" + flashcardIdx;
    if(sortMode !== undefined) {
        src += "&s=" + sortMode;
    }
    if(orientation !== undefined) {
        src += '&o=' + orientation;
    }
    return src;
}

function getNumQuestions(courseJson) {
    let total = 0;
    for(let i of courseJson.units) {
        total += i.questions.length;
    }
    return total;
}
function getNumFlashcards(courseJson) {
    let total = 0;
    for(let i of courseJson.flashcards) {
        total += i.cards.length;
    }
    return total;
}

// credit: https://www.freecodecamp.org/news/how-to-shuffle-an-array-of-items-using-javascript-or-typescript/
const shuffle = (array) => { 
    for (let i = array.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1)); 
        [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array; 
};   

/**
 * Returns the link to the next question
 * @param { struct } courseJson - structure representing the current course
 * @param { int } unitIdx - index of the unit
 * @param { int } questionIdx - index of the question
 * @param { int } amt - number of questions to skip (not including completed questions)
 */
function nextQuestion(courseJson, unitIdx, questionIdx, amt) {
    let amtLeft = amt;

    let currUnit = unitIdx;
    let currQuestion = questionIdx;
    while(true) {
        currQuestion++;
        if(courseJson.units[currUnit].questions[currQuestion] == null) {
            currUnit++;
            currQuestion = 0;
        }

        if(courseJson.units[currUnit] == null) {
            return getCourseSrc(courseJson.key);
        }

        if(localStorage.getItem(courseJson.key + "/" + currUnit + "/" + currQuestion) == null) {
            amtLeft--;
        }

        if(amtLeft == 0) {
            return getQuestionSrc(courseJson.key, currUnit, currQuestion);
        }
    }
}

/**
 * returns the scientific notation form of the number with correct number of sigdigs
 * @param {Number} num - number to convert to scientific notation
 * @param {Number} sd - number of sigdigs
 * @param {undefined || string} mode - optional mode override (exp)
 * @returns string
 */
function getSD(num, sd, mode) {
    switch(mode) {
        case "exp": return num.toPrecision(sd);
        default: return num.toPrecision(sd).replaceAll("e+", " * 10^");
    }
}

// credit: https://pandaquests.medium.com/5-easy-ways-to-check-if-a-string-contains-only-numbers-in-javascript-305db38625e8
const onlyContainsNumbers = (str) => /^\d+$/.test(str);

export {
    stringToHTML,
    selectOption,
    getSD,
    
    getQuestionSrc,
    getUnitSrc,
    getCourseSrc,
    getFlashcardSrc,

    getNumQuestions,
    getNumFlashcards,

    shuffle,
    onlyContainsNumbers,
    
    nextQuestion,
};