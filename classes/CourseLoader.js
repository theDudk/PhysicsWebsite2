import { stringToHTML, getCourseSrc, getUnitSrc, getFlashcardSrc } from "./Custom.js";

class CourseLoader{
    units = [];
    flashcards = [];

    constructor(unitRoot, flashcardRoot) {
        this.unitRoot = unitRoot;
        this.flashcardRoot = flashcardRoot;
    }

    load(courseKey){
        fetch('courses/' + courseKey + '.json')
            .then((response) => response.json())
            .then((json) => this.loadItems(json));
    }
    loadItems(courseJson) {
        // load the header links
        // load the header links
        const courseLink = document.getElementById("course-link");
        courseLink.innerHTML = "";
        let courseText = document.createElement("span");
        courseText.textContent = courseJson.name;
        courseLink.appendChild(stringToHTML("<i class='" + courseJson.icon + "'>"));
        courseLink.appendChild(courseText);
        courseLink.onclick = function() {window.location.href = getCourseSrc(courseJson.key)};

        // load the units
        this.courseJson = courseJson;

        this.loadUnits();
    }
    loadUnits() {
        for(let idx = 0; idx < this.courseJson.units.length; idx++) {
            let i = this.courseJson.units[idx];
            this.units.push({name: i.name, link: getUnitSrc(this.courseJson.key, idx), icon: i.icon})
        }
        for(let idx = 0; idx < this.courseJson.flashcards.length; idx++) {
            let i = this.courseJson.flashcards[idx];
            this.flashcards.push({name: i.name, link: getFlashcardSrc(this.courseJson.key, idx), icon: i.icon})
        }

        this.generateHTML(this.units, this.unitRoot);
        this.generateHTML(this.flashcards, this.flashcardRoot);
    }
    generateHTML(array, root) {
        root.innerHTML = "";

        for(let i of array) {
            root.appendChild(this.createItemNode(i));
        }
    }
    createItemNode(item) {
        console.log(item)
        let container = document.createElement("button");
        container.addEventListener("click", () => {
            window.location.href = item.link;
        })
        container.classList.add("btn");
        let name = document.createElement("span");
        name.innerHTML = item.name;
        let icon = document.createElement("i");
        icon.className = item.icon;

        container.appendChild(icon);
        container.appendChild(name);
        return container;
    }
}

export default CourseLoader;