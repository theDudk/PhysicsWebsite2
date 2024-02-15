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

function getQuestionSrc(courseKey, unitIdx, questionIdx) {
    return "question.html?c=" + courseKey + "&u=" + unitIdx + "&q=" + questionIdx;
}
function getUnitSrc(courseKey, unitIdx) {
    return "unit.html?c=" + courseKey + "&u=" + unitIdx;
}
function getCourseSrc(courseKey) {
    return "course.html?c=" + courseKey;
}

function nextQuestion(courseJson, unitIdx, questionIdx, amt) {
    // requested next question is within current unit
    const questionsTillUnitEnd = courseJson.units[unitIdx].questions.length - 1 - questionIdx;
    if(questionsTillUnitEnd - amt < 0) {
        const questionQuota = amt - questionsTillUnitEnd;

        let idx = 1;
        while(true) {
            const currUnit = courseJson.units[unitIdx + idx];
            if(currUnit == null) {
                return getCourseSrc(courseJson.key);
            }

            if(currUnit.questions.length - questionQuota >= 0) {
                break;
            }
            questionQuota -= currUnit.questions.length;

            idx++;
        }
        console.log(questionQuota)
        return getQuestionSrc(courseJson.key, unitIdx + idx, questionQuota - 1);
    }
    return getQuestionSrc(courseJson.key, unitIdx, questionIdx + amt);
}
// credit: https://pandaquests.medium.com/5-easy-ways-to-check-if-a-string-contains-only-numbers-in-javascript-305db38625e8
const onlyContainsNumbers = (str) => /^\d+$/.test(str);

export {
    stringToHTML,
    getQuestionSrc,
    getUnitSrc,
    getCourseSrc,
    nextQuestion,
    onlyContainsNumbers
};