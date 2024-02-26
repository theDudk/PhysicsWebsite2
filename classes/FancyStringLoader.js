import { stringToHTML, getIndicesOf } from "./Custom.js";

class FancyStringLoader{
    constructor() {
        throw Error('A static class cannot be instantiated.');
    }

    static notation = {
        b: (text) => {
            let node = stringToHTML("<b>");
            node.textContent = text;

            return node;
        },
        i: (text) =>{
            let node = stringToHTML("<i>");
            node.textContent = text;

            return node;
        },
        sub: (text) =>{
            let node = stringToHTML("<sub>");
            node.textContent = text;

            return node;
        },
        sup: (text) =>{
            let node = stringToHTML("<sup>");
            node.textContent = text;

            return node;
        },
        img: (src) => {
            let node = stringToHTML("<img class='fs-img'>");
            node.src = src;

            return node;
        },
        s: (type) => {
            let node = stringToHTML("<span>");
            switch(type){
                case "delta":
                    node.textContent = "Δ";
                    break;
                case "l-delta":
                    node.textContent = "δ";
                    break;
            }
            return node;
        },
        c: (text) => {
            let node = stringToHTML("<span>");
            if(text.indexOf("=") == -1) {
                return document.createTextNode(text);
            }

            let color = text.substring(0, text.indexOf("="));
            const textContent = text.substring(text.indexOf("=") + 1);

            // switch default colors to custom defaults
            switch(color) {
                case "red":
                    color = "blue";
                    break;
            }

            node.style.color = color;
            node.textContent = textContent;
            return node;
        },
        a: (text) => {
            let node = stringToHTML("<a>");
            if(text.indexOf("=") == -1) {
                return document.createTextNode(text);
            }

            let href = text.substring(0, text.indexOf("="));
            const textContent = text.substring(text.indexOf("=") + 1);

            node.href = href;
            node.textContent = textContent;

            return node;
        },
        br: () => {
            return document.createElement("br");
        },
        table: (str) => {
            let data = str.split("=");

            let rows = data[0];
            let columns = data[1];
            data.splice(0,2);

            let table = document.createElement("table");
            for(let i = 0; i < rows; i++) {
                const currRow = document.createElement("tr");
                for(let j = 0; j < columns; j++) {
                    let currData = document.createElement("td");
                    currData.textContent = data[i * columns + j];
                    currRow.appendChild(currData);
                }
                table.appendChild(currRow);
            }

            return table;
        },
        list: (items) => {
            let data = items.split("=");

            let type = data[0];
            data.splice(0,1);
            let list;

            switch(type) {
                case "ul":
                case "dot":
                    list = document.createElement("ul");
                    break;

                case "ol":
                case "num":
                    list = document.createElement("ol");
                    break;

                default:
                    console.error("Invalid list type given: " + type);
                    return document.createTextNode(items);
            }

            for(let i of data) {
                let li = document.createElement("li");
                li.textContent = i;
                list.appendChild(li);
            }

            return list;
        },
        spoiler: (text) => {
            let spoiler = stringToHTML("<span class='fs-spoiler'>");
            spoiler.textContent = text;

            return spoiler;
        }
    }
    
    static addHTML(root, str) {
        root.innerHTML = "";
        for(let i of this.#getHTML(str)) {
            root.appendChild(i);
        }
    }
    /**
     * 
     * @param { string } str - FancyString to be converted into html
     * @returns { Node } container div
     */
    static toHTML(str) {
        let container = stringToHTML("<div>");
        for(let i of this.#getHTML(str)) {
            container.appendChild(i);
        }

        return container;
    }
    /**
     * 
     * @param {*} str 
     * @returns { Node[] } list of html Nodes
     */
    static #getHTML(str) {
        // -- finds the first node in the string
        let node = {
            start: str.indexOf("<"),
            end: str.indexOf(">"),
            break: str.indexOf("="),
            type: null,
            text: null,
        }
        // check if there are no codes
        if(node.start == -1 || node.break == -1 || node.end == -1) {
            return [document.createTextNode(str)];
        }
        if(node.break < node.start || node.break > node.end) {
            let returnNodes = [];
            returnNodes.push(document.createTextNode(str.substring(0, node.start)));
            for(let i of this.#getHTML(str.substring(node.start))) {
                returnNodes.push(i);
            }
            return returnNodes;
        }
        // finds the text and type
        node.type = str.substring(node.start + 1, node.break);
        node.text = str.substring(node.break + 1, node.end);

        // return if the type is invalid
        if(this.notation[node.type] == null)  {
            let returnNodes = [];
            returnNodes.push(document.createTextNode(str.substring(0, node.end + 1)));
            for(let i of this.#getHTML(str.substring(node.end + 1))) {
                returnNodes.push(i);
            }
            return returnNodes;
        }

        let returnNodes = [];
        returnNodes.push(document.createTextNode(str.substring(0, node.start)));
        returnNodes.push(this.notation[node.type](node.text));
        for(let i of this.#getHTML(str.substring(node.end + 1))) {
            returnNodes.push(i);
        }

        return returnNodes;
    }
}

export default FancyStringLoader;