import Answer from "./Answer.js";
import {getCourseSrc, getUnitSrc, getQuestionSrc, nextQuestion, onlyContainsNumbers, stringToHTML} from "./Custom.js";
import FancyStringLoader from "./FancyStringLoader.js";
import { isQuestionComplete, getLastPageSkips, setLastPageSkips } from "./Storage.js";

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
        // store the question information 
        this.courseJson = courseJson;
        this.unitIdx = unitIdx;
        this.questionIdx = questionIdx;

        // load the header links
        const courseLink = document.getElementById("course-link");
        courseLink.innerHTML = "";
        let courseText = document.createElement("span");
        courseText.textContent = courseJson.name;
        courseLink.appendChild(stringToHTML("<i class='" + courseJson.icon + "'>"));
        courseLink.appendChild(courseText);
        courseLink.onclick = function() {window.location.href = getCourseSrc(courseJson.key)};

        const unitLink = document.getElementById("unit-link");
        unitLink.innerHTML = "";
        let unitText = document.createElement("span");
        unitText.textContent = courseJson.units[unitIdx].name;
        unitLink.appendChild(stringToHTML("<i class='" + courseJson.units[unitIdx].icon + "'>"));
        unitLink.appendChild(unitText);
        unitLink.onclick = function() {window.location.href = getUnitSrc(courseJson.key, unitIdx)};

        const questionLink = document.getElementById("question-link");
        questionLink.innerHTML = "";
        let questionText = document.createElement("span");
        questionText.textContent = courseJson.units[unitIdx].questions[questionIdx].name;;
        questionLink.appendChild(stringToHTML('<i class="fa-solid fa-circle-question"></i>'));
        questionLink.appendChild(questionText);
        questionLink.onclick = function() {window.location.href = getQuestionSrc(courseJson.key, unitIdx, questionIdx)};

        // load the question
        let questionJson = courseJson.units[unitIdx].questions[questionIdx];

        document.getElementById("question-src").textContent = courseJson.name + " - " + courseJson.units[unitIdx].name;
        document.getElementById("question-title").innerHTML = "";
        if(isQuestionComplete(courseJson.key, unitIdx, questionIdx)) {
            document.getElementById("question-title").appendChild(stringToHTML('<i class="fa-solid fa-circle-check fa-sm i-m"></i>'));
        }
        document.getElementById("question-title").appendChild(document.createTextNode(questionJson.name));
        FancyStringLoader.addHTML(document.getElementById("question-desc"), questionJson.text);

        // Load Inputs
        this.answerObj = new Answer(this.confirmBtn, courseJson.key, unitIdx, questionIdx);
        
        for(let i of questionJson.inputs) {
            this.answerObj.addInput(i);
        }
        this.answerObj.setRoot(root);

        this.answerObj.updateConfirmBtn(); // update confirm button incase all inputs are filled by default

        // Load course files
        if(courseJson.files != undefined) {
            for(let i of courseJson.files) {
                let tab = stringToHTML("<button class='btn btn-warning'></button>");
                let icon = document.createElement("i");
                icon.setAttribute("class", i.icon);
                let text = document.createElement("span");
                text.textContent = i.text;
    
                tab.appendChild(icon);
                tab.appendChild(text);
                tab.onclick = () => {window.open(i.src, "_blank")};
                document.getElementById("question-resources").appendChild(tab);
            }
        }

        // Load question files
        if(questionJson.files != undefined) {
            for(let i of questionJson.files) {
                let tab = stringToHTML("<button class='btn'></button>");
                let icon = document.createElement("i");
                icon.setAttribute("class", i.icon);
                let text = document.createElement("span");
                text.textContent = i.text;
    
                tab.appendChild(icon);
                tab.appendChild(text);
                tab.onclick = () => {window.open(i.src, "_blank")};
                document.getElementById("question-resources").appendChild(tab);
            }
        }

        // update fill elements
        for(let i of document.querySelectorAll("[fill=answers]")) {
            i.textContent = this.answerObj.getAnswerString();
        }

        // Load Solutions
        if(getLastPageSkips() != null) {
            document.getElementById("success-next-input").setAttribute("value", getLastPageSkips());
        }
        if(questionJson.solution != null) {
            FancyStringLoader.addHTML(document.getElementById("solution-text"), questionJson.solution);
        } else {
            FancyStringLoader.addHTML(document.getElementById("solution-text"), "<dbox=Whoops! There doesn't seem to be a detailed solution for this question.>");
        }

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
            setLastPageSkips(amt);
            window.location.href = nextQuestion(courseJson, unitIdx, questionIdx, amt);
        });

        // Solutions window
        const solutionsWindow = document.getElementById("solution")
        for(let i of document.querySelectorAll(".e-solution-reveal")) {
            i.addEventListener("click", () => {
                solutionsWindow.classList.remove("hidden");
            })
        }

        document.getElementById("solution-close").addEventListener("click", () =>{
            solutionsWindow.classList.add("hidden");
        }) 
    }
}

export default QuestionLoader;