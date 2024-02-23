import {stringToHTML, getSD} from "./Custom.js";
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

        container.appendChild(input);
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
        return val == this.inputJson.answer;
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
        return this.inputJson.answer;
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

        container.appendChild(input);
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
            if(val == this.#standardize(getSD(i.val, i.SD))) {
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
            str += getSD(i.val, i.SD) + " or ";
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

        container.appendChild(input);
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
    /**
     * @param { Node } node
     * @param { Answer } answer 
     */
    addEventListeners(answer) {
        this.node.addEventListener("change", function() {
            answer.updateConfirmBtn();
        })
    }
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

export {getInput};