import { getCourseSrc, stringToHTML } from "./Custom.js";
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
            return returnArr.sort();
        },
    }

    static isValidSortMethod(method) {
        return sortMethods[method] != null;
    }
    /**
     * @param {string} courseKey - key for the course
     * @param {number} unitIdx - index of the unit
     * @param {number} questionIdx - index for the question
     * @param {Node} root - node where the question is to be loaded
     */
    static load(courseKey, flashcardIdx, root, sortMethod){
        this.root = root;
        this.getArr = this.sortMethods[sortMethod];

        fetch('courses/' + courseKey + '.json')
            .then((response) => response.json())
            .then((json) => this.loadFlashcards(json, flashcardIdx, root));
    }

    static loadFlashcards(courseJson, flashcardIdx, root) {
        this.flashcards = this.getArr(courseJson, flashcardIdx);

        // load the header links
        const courseLink = document.getElementById("course-link");
        courseLink.textContent = courseJson.name;
        courseLink.href = getCourseSrc(courseJson.key);

        // Add cards
        this.currCard = 0;
        this.updateField();

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
    }
    static updateField() {
        this.root.innerHTML = "";
        for(let i of this.getFlashcardHTML(this.flashcards[this.currCard])) {
            this.root.appendChild(i);
        }
        document.getElementById("flashcard-count").textContent = (this.currCard + 1) + "/" + this.flashcards.length;
    }
    static getFlashcardHTML(card) {
        let visibleSide = stringToHTML("<div>");
        let hiddenSide = stringToHTML("<div class='hidden'>");
        FancyStringLoader.addHTML(visibleSide, card.front);
        FancyStringLoader.addHTML(hiddenSide, card.back);

        return [visibleSide, hiddenSide];
    }
}

export default FlashcardLoader;