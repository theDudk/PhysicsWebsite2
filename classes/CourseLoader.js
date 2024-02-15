import { getUnitSrc } from "./Custom.js";

class CourseLoader{
    units = [];

    constructor(unitRoot) {
        this.unitRoot = unitRoot;
    }

    load(courseKey){
        fetch('courses/' + courseKey + '.json')
            .then((response) => response.json())
            .then((json) => this.loadItems(json));
    }
    loadItems(courseJson) {
        this.courseJson = courseJson;

        this.loadUnits();
    }
    loadUnits() {
        for(let idx = 0; idx < this.courseJson.units.length; idx++) {
            let i = this.courseJson.units[idx];
            this.units.push({name: i.name, link: getUnitSrc(this.courseJson.key, idx)})
        }

        this.generateHTML(this.units, this.unitRoot);
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

export default CourseLoader;