import {stringToHTML, toggleClass, getAllSD, prettyPrintEquation} from "./Custom.js";
import Answer from "./Answer.js";
import FancyStringLoader from "./FancyStringLoader.js";

/**
 * @param { object } inputJson - structure of the input
 */
function getInput(inputJson){
    switch(inputJson.type) {
        case "num":
            switch(inputJson["rounding-mode"]) {
                case "sci":
                    return new NumInput(inputJson, "sci"); 
                default:
                    return new NumInput(inputJson, "normal");
            }
        case "mc":
            return new MCInput(inputJson);
        case "checklist":
            return new ChecklistInput(inputJson);
        case "string":
            return new StringInput(inputJson);
        case "math-equation":
            return new MathEquationInput(inputJson);
        case "nuclear-notation":
            return new NuclearNotationInput(inputJson);
    }

    console.error("failed to find input matching type: " + inputJson.type);
}

function standardizeStrInput(str) {
    return str.replaceAll(" ", "");
}

// Inputs must have the following
// public toHTML(int idx)
// public isFilled(Node node)
// public addEventListeners(Answer answer)
// public setCompleted(boolean bool)
// public checkAnswer(string value)
// public toStr()

class NumInput{
    inputJson;
    /**
     * @param { object } inputJson - structure for the input
     */
    constructor(inputJson, roundingMode) {
        this.inputJson = inputJson;
        this.roundingMode = roundingMode;
    }
    /**
     * @returns { Node } Node object of the input
     */
    toHTML() {
        let container = stringToHTML("<div class='row box box-thin card card-input'>");
        let input = stringToHTML("<input placeholder='#' type='tel'>");

        if(this.roundingMode == "sci"){
            input.setAttribute("placeholder", "# sci")
        }

        if(this.inputJson["before-text"] != undefined) {
            // before text
            let beforeText = stringToHTML("<span class='px-2 background-accent nowrap'></span>");
            FancyStringLoader.addHTML(beforeText, this.inputJson["before-text"]);
            container.appendChild(beforeText);
        }
        container.appendChild(input);
        if(this.inputJson["after-text"] != undefined) {
            // after text
            let afterText = stringToHTML("<span class='px-2 background-accent nowrap'></span>");
            FancyStringLoader.addHTML(afterText, this.inputJson["after-text"]);
            container.appendChild(afterText);
        }
        container.appendChild(stringToHTML('<span class="check hidden card-item-no-border"><i class="fa-solid fa-circle-check icon-success"></i></span>'));

        this.node = container;

        return container;
    }
    /**
     * Checks if the node is filled out using the objects criteria
     * @param { Node } node - node representing the input
     */
    isFilled() {
        const inputField = this.node.querySelector("input");

        return inputField.value !== '';
    }
    setCompleted(bool) {
        if(bool) {
            this.node.querySelector(".check").classList.remove("hidden");
            return;
        }
        this.node.querySelector(".check").classList.add("hidden");
    }
    checkAnswer() {
        switch(this.roundingMode) {
            case "sci":
                return this.checkSciAnswer();
            default: // normal
                return this.checkNumAnswer();
        }
    }
    checkNumAnswer() {
        const val = this.node.querySelector("input").value;
        for(let i of this.inputJson.answers) {
            if(val == i.val) {
                return true;
            }
        }
        return false;
    }
    checkSciAnswer() {
        const val = standardizeStrInput(this.node.querySelector("input").value.toString());
        for(let i of this.inputJson.answers) {
            for(let j of getAllSD(i.val, i.sd)) {
                if(val == standardizeStrInput(j)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * @param { Node } node
     * @param { Answer } answer 
     */
    addEventListeners(answer) {
        this.node.addEventListener("input", function() {
            answer.updateConfirmBtn();
        })
    }
    toStr() {
        let str = "";
        for(let i of this.inputJson.answers) {
            str += i.val + " or ";
        }
        str = str.substring(0, str.length - 4);

        return str;
    }
}
class MCInput{
    inputJson;
    /**
     * @param { object } inputJson - structure for the input
     */
    constructor(inputJson) {
        this.inputJson = inputJson;
    }
    /**
     * @returns { Node } Node object of the input
     */
    toHTML() {
        let container = stringToHTML("<div class='row box box-thin card card-input'>");
        let selectWrapper = stringToHTML("<div class='select-wrapper'></div>")
        let input = stringToHTML("<select>");
        let idx= 0;
        for(let i of this.inputJson.answers) {
            let temp = document.createElement("option");
            temp.textContent = i.text;
            temp.value = idx;
            input.appendChild(temp);
            idx++;
        }

        if(this.inputJson["before-text"] != undefined) {
            // before text
            let beforeText = stringToHTML("<span class='px-2 background-accent nowrap'></span>");
            FancyStringLoader.addHTML(beforeText, this.inputJson["before-text"]);
            container.appendChild(beforeText)
        }
        selectWrapper.appendChild(input)
        container.appendChild(selectWrapper);
        if(this.inputJson["after-text"] != undefined) {
            // after text
            let afterText = stringToHTML("<span class='px-2 background-accent nowrap'></span>");
            FancyStringLoader.addHTML(afterText, this.inputJson["after-text"]);
            container.appendChild(afterText);
        }
        container.appendChild(stringToHTML('<span class="check hidden card-item-no-border"><i class="fa-solid fa-circle-check icon-success"></i></span>'));

        this.node = container;

        return container;
    }
    /**
     * Checks if the node is filled out using the objects criteria
     * @param { Node } node - node representing the input
     */
    isFilled() {
        return true;
    }
    setCompleted(bool) {
        if(bool) {
            this.node.querySelector(".check").classList.remove("hidden");
            return;
        }
        this.node.querySelector(".check").classList.add("hidden");
    }
    checkAnswer() {
        return this.inputJson.answers[this.node.querySelector("select").value].val;
    }
    addEventListeners() {return}
    toStr() {
        let str = "";
        for(let i of this.inputJson.answers) {
            if(i.val) {
                str += i.text + " or ";
            }
        }
        str = str.substring(0, str.length - 4);

        return str;
    }
}
class ChecklistInput{
    inputJson;
    /**
     * @param { object } inputJson - structure for the input
     */
    constructor(inputJson) {
        this.inputJson = inputJson;
    }
    /**
     * @returns { Node } Node object of the input
     */
    toHTML() {
        let container = stringToHTML("<div class='row box box-thin card card-input dropdown'>");
        let items = stringToHTML("<div class='dropdown-panel box box-thin column background hidden'>");

        let idx = 0;
        for(let i of this.inputJson.answers) {
            let temp = stringToHTML("<button class='row g2'></button>");
            temp.textContent = i.text;
            temp.appendChild(stringToHTML('<i class="fa-solid fa-check"></i>'));
            temp.setAttribute("idx", idx);
            items.appendChild(temp);
            idx++;
        }

        if(this.inputJson["before-text"] != undefined) {
            // before text
            let beforeText = stringToHTML("<span class='px-2 background-accent nowrap'></span>");
            FancyStringLoader.addHTML(beforeText, this.inputJson["before-text"]);
            container.appendChild(beforeText)
        }
        let btn = stringToHTML("<button class='dropdown-btn'><span fill='checklist-name'>loading</span> (<span fill='checklist-num-selected'>?</span>)</button>");
        container.appendChild(btn);
        btn.appendChild(items);
        if(this.inputJson["after-text"] != undefined) {
            // after text
            let afterText = stringToHTML("<span class='px-2 background-accent nowrap'></span>");
            FancyStringLoader.addHTML(afterText, this.inputJson["after-text"]);
            container.appendChild(afterText);
        }
        container.appendChild(stringToHTML('<span class="check hidden card-item-no-border"><i class="fa-solid fa-circle-check icon-success"></i></span>'));

        this.node = container;

        this.updateElements();

        return container;
    }
    /**
     * Checks if the node is filled out using the objects criteria
     * @param { Node } node - node representing the input
     */
    isFilled() {
        return true;
    }
    setCompleted(bool) {
        if(bool) {
            this.node.querySelector(".check").classList.remove("hidden");
            return;
        }
        this.node.querySelector(".check").classList.add("hidden");
    }
    checkAnswer() {
        for(let i of this.node.querySelectorAll(".dropdown-panel button")) {
            if(this.inputJson.answers[i.getAttribute("idx")].val !== i.classList.contains("selected")) {
                return false;
            }
        }
        return true;
    }
    updateElements() {
        this.node.querySelector("[fill=checklist-name]").textContent = this.inputJson.text;
        this.node.querySelector("[fill=checklist-num-selected]").textContent = this.#getNumSelected();
    }
    #getNumSelected() {
        let count = 0;
        for(let i of this.node.querySelectorAll(".dropdown-panel button")) {
            if(i.classList.contains("selected")) count++;
        }
        return count;
    }
    /**
     * @param { Answer } answer 
     */
    addEventListeners(answer) {
        document.addEventListener("click", (event) => {
            if(this.node.contains(event.target)) return;
            this.node.querySelector(".dropdown-panel").classList.add("hidden");
        })
        this.node.querySelector(".dropdown > button").addEventListener("click", (event) => {
            if(this.node.querySelector(".dropdown-panel").contains(event.target)) return;
            toggleClass(this.node.querySelector(".dropdown-panel"), "hidden");
        })

        for(let i of this.node.querySelectorAll(".dropdown-panel button")) {
            i.addEventListener("click", () => {
                toggleClass(i, "selected");
                this.updateElements();
            })
        }
    }
    toStr() {
        let str = "";
        for(let i of this.inputJson.answers) {
            if(i.val) {
                str += i.text + " and ";
            }
        }
        str = str.substring(0, str.length - 4);

        return str;
    }
}
class StringInput{
    inputJson;
    /**
     * @param { object } inputJson - structure for the input
     */
    constructor(inputJson) {
        this.inputJson = inputJson;
    }
    /**
     * @returns { Node } Node object of the input
     */
    toHTML() {
        let container = stringToHTML("<div class='row box box-thin card card-input'>");
        let input = stringToHTML("<input placeholder='str' type='text'>");

        if(this.inputJson["before-text"] != undefined) {
            // before text
            let beforeText = stringToHTML("<span class='px-2 background-accent nowrap'></span>");
            FancyStringLoader.addHTML(beforeText, this.inputJson["before-text"]);
            container.appendChild(beforeText);
        }
        container.appendChild(input);
        if(this.inputJson["after-text"] != undefined) {
            // after text
            let afterText = stringToHTML("<span class='px-2 background-accent nowrap'></span>");
            FancyStringLoader.addHTML(afterText, this.inputJson["after-text"]);
            container.appendChild(afterText);
        }
        container.appendChild(stringToHTML('<span class="check hidden card-item-no-border"><i class="fa-solid fa-circle-check icon-success"></i></span>'));

        this.node = container;

        return container;
    }
    /**
     * Checks if the node is filled out using the objects criteria
     * @param { Node } node - node representing the input
     */
    isFilled() {
        const inputField = this.node.querySelector("input");

        return inputField.value !== '';
    }
    setCompleted(bool) {
        if(bool) {
            this.node.querySelector(".check").classList.remove("hidden");
            return;
        }
        this.node.querySelector(".check").classList.add("hidden");
    }
    checkAnswer() {
        const val = standardizeStrInput(this.node.querySelector("input").value);
        for(let i of this.inputJson.answers) {
            if(val == standardizeStrInput(i.val)) {
                return true;
            }
        }
        return false;
    }
    /**
     * @param { Node } node
     * @param { Answer } answer 
     */
    addEventListeners(answer) {
        this.node.addEventListener("input", function() {
            answer.updateConfirmBtn();
        })
    }
    toStr() {
        let str = "";
        for(let i of this.inputJson.answers) {
            str += i.val + " or ";
        }
        str = str.substring(0, str.length - 4);

        return str;
    }
}

// Equations (WIP)
class MathEquationInput{
    inputJson;
    /**
     * @param { object } inputJson - structure for the input
     */
    constructor(inputJson) {
        this.inputJson = inputJson;
    }
    /**
     * @returns { Node } Node object of the input
     */
    toHTML() {
        let container = stringToHTML("<div class='row box box-thin card card-input'>");
        let input = stringToHTML("<input placeholder='str' type='text'>");
        let fancy = stringToHTML("<span class='px-2 nowrap background'>...</span>");

        if(this.inputJson["before-text"] != undefined) {
            // before text
            let beforeText = stringToHTML("<span class='px-2 background-accent nowrap'></span>");
            FancyStringLoader.addHTML(beforeText, this.inputJson["before-text"]);
            container.appendChild(beforeText);
        }
        container.appendChild(input);
        container.appendChild(stringToHTML("<span class='px-2 background-accent nowrap'>result:</span>"));
        container.appendChild(fancy);
        if(this.inputJson["after-text"] != undefined) {
            // after text
            let afterText = stringToHTML("<span class='px-2 background-accent nowrap'></span>");
            FancyStringLoader.addHTML(afterText, this.inputJson["after-text"]);
            container.appendChild(afterText);
        }
        container.appendChild(stringToHTML('<span class="check hidden card-item-no-border"><i class="fa-solid fa-circle-check icon-success"></i></span>'));

        this.node = container;
        this.input = input;
        this.fancy = fancy;

        return container;
    }
    /**
     * Checks if the node is filled out using the objects criteria
     * @param { Node } node - node representing the input
     */
    isFilled() {
        const inputField = this.node.querySelector("input");

        return inputField.value !== '';
    }
    setCompleted(bool) {
        if(bool) {
            this.node.querySelector(".check").classList.remove("hidden");
            return;
        }
        this.node.querySelector(".check").classList.add("hidden");
    }
    checkAnswer() {
        // for future improvement consider adding a input mode for checking symbolic equal
        const val = standardizeStrInput(this.node.querySelector("input").value);
        for(let i of this.inputJson.answers) {
            if(val == standardizeStrInput(i.val)) {
                return true;
            }
        }
        return false;
    }
    /**
     * @param { Node } node
     * @param { Answer } answer 
     */
    addEventListeners(answer) {
        let fancy = this.fancy;
        let input = this.input;
        
        this.node.addEventListener("input", function() {
            answer.updateConfirmBtn();
            if(!prettyPrintEquation(fancy, input.value)){
                fancy.classList.add("text-danger");
                return;
            }
            fancy.classList.remove("text-danger");
        })
    }
    toStr() {
        let str = "";
        for(let i of this.inputJson.answers) {
            str += i.val + " or ";
        }
        str = str.substring(0, str.length - 4);

        return str;
    }
}

// Diagrams (WIP)
class NuclearNotationInput{
    inputJson;
    /**
     * @param { object } inputJson - structure for the input
     */
    constructor(inputJson) {
        this.inputJson = inputJson;
    }
    /**
     * @returns { Node } Node object of the input
     */
    toHTML() {
        let container = stringToHTML("<div class='row box box-thin card card-input'>");

        container.appendChild(stringToHTML('<span class="px-2 background-accent nowrap flex"><i class="fa-solid fa-person-digging"></i> Diagrams coming soon</span>'));
        container.appendChild(stringToHTML('<span class="check hidden card-item-no-border"><i class="fa-solid fa-circle-check icon-success"></i></span>'));

        this.node = container;

        return container;
    }
    /**
     * Checks if the node is filled out using the objects criteria
     * @param { Node } node - node representing the input
     */
    isFilled() {
        return true;
    }
    setCompleted(bool) {
        if(bool) {
            this.node.querySelector(".check").classList.remove("hidden");
            return;
        }
        this.node.querySelector(".check").classList.add("hidden");
    }
    checkAnswer() {
        return true;
    }
    /**
     * @param { Node } node
     * @param { Answer } answer 
     */
    addEventListeners(answer) {}
    toStr() {
        return "WIP";
    }
}

export {getInput};