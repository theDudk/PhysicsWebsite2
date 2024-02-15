import Answer from "./Answer.js";
import {getCourseSrc, getUnitSrc, nextQuestion, onlyContainsNumbers} from "./Custom.js";

class QuestionLoader {
    /**
     * @param { Node } confirmBtn 
     */
    constructor(confirmBtn) {
        this.confirmBtn = confirmBtn;
    }

    /**
     * @param {string} courseKey - key for the course
     * @param {number} unitIdx - index of the unit
     * @param {number} questionIdx - index for the question
     * @param {Node} root - node where the question is to be loaded
     */
    load(courseKey, unitIdx, questionIdx, root){
        this.root = root;

        fetch('courses/' + courseKey + '.json')
            .then((response) => response.json())
            .then((json) => this.loadQuestion(json, unitIdx, questionIdx, root));
    }

    /**
     * @param {object} questionJson - json of the current question
     * @param {Node} root - node where the question is to be loaded
     */
    loadQuestion(courseJson, unitIdx, questionIdx, root) {
        console.log(nextQuestion(courseJson, unitIdx, questionIdx, 1)); // delete later
        console.log(nextQuestion(courseJson, unitIdx, questionIdx, 2)); // delete later

        // store the question information 
        this.courseJson = courseJson;
        this.unitIdx = unitIdx;
        this.questionIdx = questionIdx;

        // load the header links
        const courseLink = document.getElementById("course-link");
        const unitLink = document.getElementById("unit-link");
        courseLink.textContent = courseJson.name;
        unitLink.textContent = courseJson.units[unitIdx].name;
        courseLink.href = getCourseSrc(courseJson.key);
        unitLink.href = getUnitSrc(courseJson.key, unitIdx);

        // load the question
        let questionJson = courseJson.units[unitIdx].questions[questionIdx];

        document.getElementById("question-src").textContent = courseJson.name + " - " + courseJson.units[unitIdx].name;
        document.getElementById("question-title").textContent = questionJson.name;
        document.getElementById("question-desc").textContent = questionJson.text;

        // Load Inputs
        this.answerObj = new Answer(this.confirmBtn);
        
        for(let i of questionJson.inputs) {
            this.answerObj.addInput(i);
        }
        this.answerObj.setRoot(root);

        this.loadEventListeners();
    }

    /**
     * Loads the event listeners for all the components of the answer box
     */
    loadEventListeners() {
        // add event listeners for inputs
        for(let i of this.answerObj.getInputs()) {
            i.obj.addEventListeners(this.answerObj);
        }

        // add event listener to confirm button to check results
        const answerObj = this.answerObj;
        this.confirmBtn.addEventListener("click", function() {
            answerObj.confirmInputs();
        });

        // add event listeners to failure and success boxes
        let failureBox = document.getElementById("failure");
        document.getElementById("failure-try-again").addEventListener("click", function() {
            failureBox.classList.add("hidden");
            answerObj.updateConfirmBtn();
        });

        let courseJson = this.courseJson;
        let unitIdx = this.unitIdx;
        let questionIdx = this.questionIdx;
        let nextInput = document.getElementById("success-next-input");
        document.getElementById("success-next").addEventListener("click", function() {
            const val = nextInput.value;
            const amt = (val != null && onlyContainsNumbers(val) && parseInt(val) > 0) ? val : 1;
            window.location.href = nextQuestion(courseJson, unitIdx, questionIdx, amt);
        });

    }
}

export default QuestionLoader;