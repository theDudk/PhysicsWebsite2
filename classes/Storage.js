/**
 * Standards:
 * - courseKey/unitIdx/questionIdx = ('1' || null)
 * - pinned/courseKey = ('1' || null)
 */

// -- Retrieving data

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
    return localStorage.getItem(courseKey + "/" + currUnit + "/" + currQuestion) !== null;
}
const isCoursePinned = (courseKey) => {
    return localStorage.getItem("pinned/" + courseKey) !== null;
}

// -- Manipulating data
const markQuestionAsComplete = (courseKey, currUnit, currQuestion) => {
    localStorage.setItem(courseKey + "/" + currUnit + "/" + currQuestion, "");
}
const togglePinCourse = (courseKey) =>{
    if(!isCoursePinned(courseKey)) {
        localStorage.setItem("pinned/" + courseKey, "");
        return;
    }
    localStorage.removeItem("pinned/" + courseKey);
}

export {
    getCoursePercentage,
    isQuestionComplete,
    isCoursePinned,

    markQuestionAsComplete,
    togglePinCourse,
}