import { stringToHTML, toggleClass, getCourseSrc, getNumQuestions, getNumFlashcards } from "./Custom.js";
import { getCoursePercentage, isCoursePinned, togglePinCourse } from "./Storage.js";

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
        courseList.sort((c1, c2) => {
            // true = 1, false = 2
            return isCoursePinned(c1.key) && !isCoursePinned(c2.key) ? -1 : 1;
        })
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
        let container = stringToHTML("<div class='card pos-rel box card mt-3'>");
        let top = stringToHTML("<div class='box box-top row'></div>");
        let mid = stringToHTML("<div class='box box-thin p-2 box-no-border column'></div>");
        let bottom = stringToHTML("<div class='box box-end'></div>");

        let nameIcon = document.createElement("i");
        nameIcon.className = course.icon;
        
        let name = document.createElement("h1");
        name.appendChild(nameIcon);
        name.appendChild(document.createTextNode(course.name));

        let pinnedBtn = stringToHTML('<button id=' + course.key + '--pin class="btn btn-icon"><i class="fa-solid fa-thumbtack"></i></button>');
        pinnedBtn.addEventListener("click", () => {
            togglePinCourse(course.key);
            toggleClass(pinnedBtn, "btn-warning");
            document.getElementById("reload-to-update").classList.remove("hidden");
        })
        if(isCoursePinned(course.key)) pinnedBtn.classList.add("btn-warning");

        let numUnits = stringToHTML("<div><i class='fa-solid fa-box'></i> <span id='" + course.key + "--unit-count'>...</span> Units (<span id='" + course.key + "--question-count'>...</span> Questions)</div>");
        let numFlashcards = stringToHTML("<div><i class='fa-regular fa-note-sticky'></i> <span id='" + course.key + "--flashcard-count'>...</span> Flashcard sets (<span id='" + course.key + "--card-count'>...</span> Cards)</div>");

        let progressBar = stringToHTML('<div class="progress"><div id="' + course.key + '--progress-bar" class="progress-bar"></div></div>')
        let progressPercent = stringToHTML("<p><span id='" + course.key + "--progress-percent'>...</span> complete</p>")

        let button = stringToHTML("<button class='btn'><i class='fa-solid fa-play'></i> <span>Continue</span></button>");
        button.addEventListener("click", function(){
            window.location.href = getCourseSrc(course.key);
        })

        top.appendChild(name);
        top.appendChild(pinnedBtn);

        mid.appendChild(progressBar);
        mid.appendChild(progressPercent);
        mid.appendChild(numUnits);
        mid.appendChild(numFlashcards);

        bottom.appendChild(button);

        container.appendChild(top);
        container.appendChild(mid);
        container.appendChild(bottom);
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