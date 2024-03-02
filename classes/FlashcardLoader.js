import { getCourseSrc, getUnitSrc, getFlashcardSrc, shuffle, stringToHTML, selectOption } from "./Custom.js";
import FancyStringLoader from "./FancyStringLoader.js";

function nextFlashcard() {
    FlashcardLoader.currCard = FlashcardLoader.currCard + 1;
    if(FlashcardLoader.currCard == FlashcardLoader.flashcards.length) {
        FlashcardLoader.currCard = 0;
    }
    FlashcardLoader.updateField();
}
function backFlashcard() {
    FlashcardLoader.currCard = FlashcardLoader.currCard - 1;
    if(FlashcardLoader.currCard < 0) {
        FlashcardLoader.currCard = FlashcardLoader.flashcards.length - 1;
    }
    FlashcardLoader.updateField();
}

class FlashcardLoader{
    constructor() {
        throw Error('A static class cannot be instantiated.');
    }

    static sortMethods = {
        linear: (courseJson, flashcardIdx) => {
            return courseJson.flashcards[flashcardIdx].cards;
        },
        random: (courseJson, flashcardIdx) => {
            let returnArr = courseJson.flashcards[flashcardIdx].cards;
            return shuffle(returnArr);
        },
    }
    static orientations = {
        front: (front, back) => {
            back.classList.add("hidden");
        },
        back: (front, back) => {
            front.classList.add("hidden");
        },
        random: (front, back) => {
            if(Math.random() <= 0.5) {
                front.classList.add("hidden");
                return;
            }
            back.classList.add("hidden");
        },
    }

    static isValidSortMethod(method) {
        return method != null && this.sortMethods[method] != null;
    }
    static isValidOrientation(orientation) {
        return orientation != null && this.orientations[orientation] != null;
    }
    /**
     * @param {string} courseKey - key for the course
     * @param {number} unitIdx - index of the unit
     * @param {number} questionIdx - index for the question
     * @param {Node} root - node where the question is to be loaded
     */
    static load(courseKey, flashcardIdx, root, sortMethod, orientation){
        this.root = root;
        this.getArr = this.sortMethods[sortMethod];
        this.sortMethodVal = sortMethod;
        this.orientation = this.orientations[orientation];
        this.orientationVal = orientation;

        fetch('courses/' + courseKey + '.json')
            .then((response) => response.json())
            .then((json) => this.loadFlashcards(json, flashcardIdx, root));
    }

    static loadFlashcards(courseJson, flashcardIdx, root) {
        // Reset orientation if it's disabled for the current questions
        if(courseJson.flashcards[flashcardIdx]["no-orientation"] !== undefined) {
            document.getElementById("orientation-select").style.display = "none";
            this.orientation = this.orientations["front"];
            this.orientationVal = "front";
        }

        // Load page info
        this.flashcards = this.getArr(courseJson, flashcardIdx);

        document.getElementById("flashcard-src").textContent = courseJson.name;
        document.getElementById("flashcard-name").textContent = courseJson.flashcards[flashcardIdx].name;

        // load the header links
        const courseLink = document.getElementById("course-link");
        courseLink.textContent = courseJson.name;
        courseLink.onclick = () => {window.location.href = getCourseSrc(courseJson.key)};
                
        const flashcardLink = document.getElementById("flashcard-link");
        flashcardLink.textContent = courseJson.flashcards[flashcardIdx].name;
        flashcardLink.onclick = () => {window.location.href = getFlashcardSrc(courseJson.key, flashcardIdx)};

        // Add cards
        this.currCard = 0;
        this.updateField();

        selectOption(document.getElementById("sort-mode-select"), this.sortMethodVal);
        
        selectOption(document.getElementById("orientation-select"), this.orientationVal);

        // add event listener to root
        root.addEventListener("click", (event) => {
            if(event.target != root) return;

            for(let i of root.children) {
                if(i.classList.contains("hidden")) {
                    i.classList.remove("hidden");
                    continue;
                }
                i.classList.add("hidden");
            }
        });
        document.getElementById("flashcard-back").addEventListener("click", function() {
            backFlashcard();
        })
        document.getElementById("flashcard-next").addEventListener("click", function() {
            nextFlashcard();
        })

        document.getElementById("sort-mode-select").onchange = (event) => {
            window.location.href = getFlashcardSrc(courseJson.key, flashcardIdx, event.target.value, this.orientationVal);
        }
        document.getElementById("orientation-select").onchange = (event) => {
            window.location.href = getFlashcardSrc(courseJson.key, flashcardIdx, this.sortMethodVal, event.target.value);
        }
    }
    static updateField() {
        this.root.innerHTML = "";
        for(let i of this.getFlashcardHTML(this.flashcards[this.currCard])) {
            this.root.appendChild(i);
        }
        document.getElementById("flashcard-count").textContent = (this.currCard + 1) + "/" + this.flashcards.length;
    }
    static getFlashcardHTML(card) {
        let front = stringToHTML("<div>");
        let back = stringToHTML("<div>");
        FancyStringLoader.addHTML(front, card.front);
        FancyStringLoader.addHTML(back, card.back);

        this.orientation(front, back);

        return [front, back];
    }
}

export default FlashcardLoader;