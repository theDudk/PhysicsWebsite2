import { getQuestionSrc, getCourseSrc } from "./Custom.js";

class UnitLoader {
    questions = [];
    flashcards = [];

    constructor(questionRoot, flashcardRoot) {
        this.questionRoot = questionRoot;
        this.flashcardRoot = flashcardRoot;
    }

    load(courseKey, unitIdx){
        fetch('courses/' + courseKey + '.json')
            .then((response) => response.json())
            .then((json) => this.loadItems(json, unitIdx));
    }
    loadItems(courseJson, unitIdx) {
        // store information
        this.courseJson = courseJson;
        this.unitIdx = unitIdx;
        this.unitJson = courseJson.units[unitIdx];

         // load the header links
         const courseLink = document.getElementById("course-link");
         courseLink.textContent = courseJson.name;
         courseLink.href = getCourseSrc(courseJson.key);

        // load the question nodes
        this.loadQuestions();
    }
    loadQuestions() {
        for(let idx = 0; idx < this.unitJson.questions.length; idx++) {
            let i = this.unitJson.questions[idx];
            this.questions.push({name: i.name, link: getQuestionSrc(this.courseJson.key, this.unitIdx, idx)})
        }

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
        container.classList.add("word-card");
        let name = document.createElement("h1");
        name.innerHTML = item.name;

        container.appendChild(name);
        return container;
    }
}

export default UnitLoader;