import {getInput} from "./Inputs.js";
import { markQuestionAsComplete } from "./Storage.js";

class Answer{
    #inputs = [];
    /**
     * 
     * @param { Node } confirmBtn 
     */
    constructor(confirmBtn, courseKey, unitIdx, questionIdx) {
        this.confirmBtn = confirmBtn;
        this.courseKey = courseKey;
        this.unitIdx = unitIdx;
        this.questionIdx = questionIdx;
    }
    /**
     * @param { object } inputJson - structure with input properties
     */
    addInput(inputJson) {
        const input = getInput(inputJson);
        const node = input.toHTML();
        this.#inputs.push({ obj: input, node: node, });
    }
    /**
     * 
     * @param { Node } root - root of the answer field
     */
    setRoot(root) {
        for(let i of this.#inputs) {
            root.appendChild(i.node);
        }
    }
    /**
     * Checks if all the fields are filled out
     * @returns boolean - whether every field is filled out
     */
    isFilled() {
        for(let i of this.#inputs) {
            if(!i.obj.isFilled()) return false;
        }

        return true;
    }
    confirmInputs() {
        let successBox = document.getElementById("success");
        let failureBox = document.getElementById("failure");
        if(!this.isFilled() || !successBox.classList.contains("hidden") || !failureBox.classList.contains("hidden")) return;

        this.#updateInputs();

        if(this.checkAnswer()) {
            document.getElementById("failure").classList.add("hidden");
            document.getElementById("success").classList.remove("hidden");
            markQuestionAsComplete(this.courseKey, this.unitIdx, this.questionIdx);
        } else {
            document.getElementById("success").classList.add("hidden");
            document.getElementById("failure").classList.remove("hidden");
        }
        this.updateConfirmBtn();
    }
    checkAnswer() {
        for(let i of this.#inputs) {
            if(!i.obj.checkAnswer()) return false;
        }
        return true;
    }
    #updateInputs() {
        for(let i of this.#inputs) {
            i.obj.setCompleted(i.obj.checkAnswer(this.courseKey, this.unitIdx, this.questionIdx));
        }
    }
    /**
     * updates the confirmBtn to add or remove the .disabled class depending on whether all the fields are filled out
     */
    updateConfirmBtn() {
        if(!this.isFilled() || !document.getElementById("success").classList.contains("hidden") || !document.getElementById("failure").classList.contains("hidden")) {
            this.confirmBtn.classList.add("disabled");
            return;
        }
        this.confirmBtn.classList.remove("disabled");
    }
    /**
     * @returns an array of structures containing an Input object and its node
     */
    getInputs() {
        return this.#inputs;
    }
    getAnswerString() {
        let str = "";
        for(let i of this.#inputs) {
            str += i.obj.toStr() + ", ";
        }
        str = str.substring(0, str.length - 2);

        return str;
    }
}

export default Answer;