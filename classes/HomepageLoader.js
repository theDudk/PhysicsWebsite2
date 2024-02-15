import { stringToHTML, getCourseSrc } from "./Custom.js";

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
    }

    generateHTML(course){
        let container = stringToHTML("<div class = 'card'>");
        let name = document.createElement("h1");
        name.textContent = course.name;
        let button = stringToHTML("<button> Continue </button>");
        button.addEventListener("click", function(){
            window.location.href = getCourseSrc(course.key);
        })
        container.appendChild(name);
        container.appendChild(button);
        this.root.appendChild(container);
    }
}

export default HomepageLoader;