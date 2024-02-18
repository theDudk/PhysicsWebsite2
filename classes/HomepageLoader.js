import { stringToHTML, getCourseSrc, getNumQuestions, getNumFlashcards } from "./Custom.js";
import { getCoursePercentage } from "./Storage.js";

class HomepageLoader{
    courses = [];

    constructor(root) {
        this.root = root;
    }

    load(){
        fetch('course-list.json')
            .then((response) => response.json())
            .then((json) => this.loadCourses(json));
    }
    loadCourses(courseList){
        for(let i of courseList){
            this.generateHTML(i);
        }

        for(let i of courseList) {
            fetch("courses/" + i.key + '.json')
                .then((response) => response.json())
                .then((json) => this.updateHTML(json));
        }
    }

    generateHTML(course){
        let container = stringToHTML("<div class='card pos-rel'>");
        let name = document.createElement("h1");
        name.textContent = course.name;

        let numUnits = stringToHTML("<div><i class='fa-solid fa-box'></i> <span id='" + course.key + "--unit-count'>...</span> Units (<span id='" + course.key + "--question-count'>...</span> Questions)</div>");
        let numFlashcards = stringToHTML("<div><i class='fa-regular fa-note-sticky'></i> <span id='" + course.key + "--flashcard-count'>...</span> Flashcard sets (<span id='" + course.key + "--card-count'>...</span> Cards)</div>");

        let progressBar = stringToHTML('<div class="progress"><div id="' + course.key + '--progress-bar" class="progress-bar"></div></div>')
        let progressPercent = stringToHTML("<p><span id='" + course.key + "--progress-percent'>...</span> complete</p>")

        let button = stringToHTML("<button class='bottom-right'> Continue </button>");
        button.addEventListener("click", function(){
            window.location.href = getCourseSrc(course.key);
        })

        container.appendChild(name);
        container.appendChild(progressBar);
        container.appendChild(progressPercent);

        container.appendChild(numUnits);
        container.appendChild(numFlashcards);

        container.appendChild(button);
        this.root.appendChild(container);
    }
    updateHTML(courseJson) {
        let numUnits = document.getElementById(courseJson.key + "--unit-count");
        let numQuestions = document.getElementById(courseJson.key + "--question-count");
        let numFlashcardsSets= document.getElementById(courseJson.key + "--flashcard-count");
        let numFlashcards = document.getElementById(courseJson.key + "--card-count");

        let progressBar = document.getElementById(courseJson.key + '--progress-bar');
        let progressPercent = document.getElementById(courseJson.key + '--progress-percent');

        numUnits.textContent = courseJson.units.length;
        numQuestions.textContent = getNumQuestions(courseJson);
        numFlashcardsSets.textContent = courseJson.flashcards.length;
        numFlashcards.textContent = getNumFlashcards(courseJson);
        const coursePercent = getCoursePercentage(courseJson);
        progressBar.style.width = coursePercent + "%";
        progressPercent.textContent = Math.floor(coursePercent) + "%";
    }
}

export default HomepageLoader;