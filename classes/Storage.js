/**
 * Standards:
 * - courseKey/unitIdx/questionIdx = (true || false)
 */

// -- Retrieving data

/**
 * 
 */
const getCoursePercentage = (courseJson) => {
    let totalQuestions = 0;
    let totalComplete = 0;

    for(let i = 0; i < courseJson.units.length; i++) {
        for(let j = 0; j < courseJson.units[i].questions.length; j++) {
            totalQuestions++;
            if(isQuestionComplete(courseJson.key, i, j)){
                totalComplete++;
            }
        }
    }

    return totalComplete / totalQuestions * 100;
}

const isQuestionComplete = (courseKey, currUnit, currQuestion) => {
    return localStorage.getItem(courseKey + "/" + currUnit + "/" + currQuestion) === 'true';
}

// -- Manipulating data
const markQuestionAsComplete = (courseKey, currUnit, currQuestion) => {
    localStorage.setItem(courseKey + "/" + currUnit + "/" + currQuestion, "true");
}

export {
    getCoursePercentage,
    isQuestionComplete,

    markQuestionAsComplete,
}