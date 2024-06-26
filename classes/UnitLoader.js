import { getQuestionSrc, getCourseSrc, stringToHTML, getUnitSrc } from "./Custom.js";
import { isQuestionComplete } from "./Storage.js";

class UnitLoader {
    questions = [];

    constructor(questionRoot) {
        this.questionRoot = questionRoot;
    }

    load(courseKey, unitIdx){
        fetch('courses/' + courseKey + '.json')
            .then((response) => response.json())
            .then((json) => this.loadItems(json, unitIdx));
    }
    loadItems(courseJson, unitIdx) {
        document.querySelector("[fill=unit-name]").textContent = courseJson.units[unitIdx].name;

        // store information
        this.courseJson = courseJson;
        this.unitIdx = unitIdx;
        this.unitJson = courseJson.units[unitIdx];

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

        // load the question nodes
        this.loadQuestions();
    }
    loadQuestions() {
        // create an array with information for each question
        let nonCompletedQuestions = [];
        let completedQuestions = [];
        for(let idx = 0; idx < this.unitJson.questions.length; idx++) {
            let i = this.unitJson.questions[idx];
            let item = {name: i.name, completed: isQuestionComplete(this.courseJson.key, this.unitIdx, idx), link: getQuestionSrc(this.courseJson.key, this.unitIdx, idx)};
            if(isQuestionComplete(this.courseJson.key, this.unitIdx, idx)) {
                completedQuestions.push(item);
                continue;
            }
            nonCompletedQuestions.push(item);
        }
        this.questions = nonCompletedQuestions.concat(completedQuestions);

        // generate the html elements for each question
        this.generateHTML(this.questions, this.questionRoot);
    }
    generateHTML(array, root) {
        root.innerHTML = "";

        for(let i of array) {
            root.appendChild(this.createItemNode(i));
        }
    }
    createItemNode(item) {
        let container = document.createElement("button");
        container.addEventListener("click", () => {
            window.location.href = item.link;
        })
        container.classList.add("btn");
        let name = document.createElement("span");
        name.innerHTML = item.name;
        
        if(item.completed) {
            container.appendChild(stringToHTML('<i class="fa-solid fa-circle-check"></i>'));
            container.classList.add("btn-success");
        } else{
            container.appendChild(stringToHTML('<i class="fa-solid fa-circle-question"></i>'));
        }

        container.appendChild(name);
        return container;
    }
}

export default UnitLoader;