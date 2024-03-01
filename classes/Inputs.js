import {stringToHTML, toggleClass, getSD, getAllSD} from "./Custom.js";
import Answer from "./Answer.js";

/**
 * @param { object } inputJson - structure of the input
 */
function getInput(inputJson){
    switch(inputJson.type) {
        case "num":
            return new NumInput(inputJson);
        case "sigdig":
            return new SDInput(inputJson);
        case "mc":
            return new MCInput(inputJson);
        case "checklist":
            return new ChecklistInput(inputJson);
    }

    console.error("failed to find input matching type: " + inputJson.type);
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
    constructor(inputJson) {
        this.inputJson = inputJson;
    }
    /**
     * @returns { Node } Node object of the input
     */
    toHTML() {
        let container = stringToHTML("<div class='input-div'>");
        let input = stringToHTML("<input type='tel'>");

        if(this.inputJson["before-text"] != undefined) {
            // before text
            let beforeText = stringToHTML("<span></span>");
            beforeText.textContent = this.inputJson["before-text"];
            container.appendChild(beforeText)
        }
        container.appendChild(input);
        if(this.inputJson["after-text"] != undefined) {
            // after text
            let afterText = stringToHTML("<span></span>");
            afterText.textContent = this.inputJson["after-text"];
            container.appendChild(afterText);
        }
        container.appendChild(stringToHTML('<i class="fa-solid fa-circle-check check hidden"></i>'));

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
        const val = this.node.querySelector("input").value;
        for(let i of this.inputJson.answers) {
            if(val == i) {
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
            str += i + " or ";
        }
        str = str.substring(0, str.length - 4);

        return str;
    }
}
class SDInput{
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
        let container = stringToHTML("<div class='input-div'>");
        let input = stringToHTML("<input type='text'>");

        if(this.inputJson["before-text"] != undefined) {
            // before text
            let beforeText = stringToHTML("<span></span>");
            beforeText.textContent = this.inputJson["before-text"];
            container.appendChild(beforeText)
        }
        container.appendChild(input);
        if(this.inputJson["after-text"] != undefined) {
            // after text
            let afterText = stringToHTML("<span></span>");
            afterText.textContent = this.inputJson["after-text"];
            container.appendChild(afterText);
        }
        container.appendChild(stringToHTML('<i class="fa-solid fa-circle-check check hidden"></i>'));

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
    #standardize(str) {
        return str.replaceAll(" ", "");
    }
    checkAnswer() {
        const val = this.#standardize(this.node.querySelector("input").value.toString());
        for(let i of this.inputJson.answers) {
            for(let j of getAllSD(i.val, i.sd)) {
                if(val == this.#standardize(j)) {
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
            str += getSD(i.val, i.sd) + " or ";
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
        let container = stringToHTML("<div class='input-div'>");
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
            let beforeText = stringToHTML("<span></span>");
            beforeText.textContent = this.inputJson["before-text"];
            container.appendChild(beforeText)
        }
        container.appendChild(input);
        if(this.inputJson["after-text"] != undefined) {
            // after text
            let afterText = stringToHTML("<span></span>");
            afterText.textContent = this.inputJson["after-text"];
            container.appendChild(afterText);
        }
        container.appendChild(stringToHTML('<i class="fa-solid fa-circle-check check hidden"></i>'));

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
        let container = stringToHTML("<div class='input-div dropdown'>");
        let items = stringToHTML("<div class='dropdown-panel'>");

        let idx = 0;
        for(let i of this.inputJson.answers) {
            let temp = document.createElement("button");
            temp.textContent = i.text;
            temp.appendChild(stringToHTML('<i class="fa-solid fa-check"></i>'));
            temp.setAttribute("idx", idx);
            items.appendChild(temp);
            idx++;
        }

        if(this.inputJson["before-text"] != undefined) {
            // before text
            let beforeText = stringToHTML("<span></span>");
            beforeText.textContent = this.inputJson["before-text"];
            container.appendChild(beforeText)
        }
        let btn = stringToHTML("<button><span fill='checklist-name'>loading</span> (<span fill='checklist-num-selected'>0</span>)</button>");
        container.appendChild(btn);
        btn.appendChild(items);
        if(this.inputJson["after-text"] != undefined) {
            // after text
            let afterText = stringToHTML("<span></span>");
            afterText.textContent = this.inputJson["after-text"];
            container.appendChild(afterText);
        }
        container.appendChild(stringToHTML('<i class="fa-solid fa-circle-check check hidden"></i>'));

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
            this.node.classList.remove("open");
        })
        this.node.querySelector(".dropdown > button").addEventListener("click", (event) => {
            if(this.node.querySelector(".dropdown-panel").contains(event.target)) return;
            toggleClass(this.node, "open");
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

export {getInput};