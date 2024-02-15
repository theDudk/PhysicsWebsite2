import {stringToHTML} from "./classes/Custom.js";
import Answer from "./classes/Answer.js";

/**
 * @param { object } inputJson - structure of the input
 */
const getInput = (inputJson) => {
    switch(inputJson.type) {
        case "num":
            return new NumberInput(inputJson);
            break;
        case "sigdig":
            return new NumberInput(inputJson);
            break;
    }

    console.error("failed to find input matching type: " + inputJson.type);
}

// Inputs must have the following
// public toHTML(int idx)
// public isFilled(Node node)
// public addEventListeners(Answer answer)
// public setCompleted(boolean bool)
// public checkAnswer(string value)
// public toString()

class NumberInput{
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
        console.log(input)

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
        const val = parseInt(this.node.querySelector("input").value);
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
}

export default getInput;