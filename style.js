for(let i of document.querySelectorAll(".dropdown-panel button")) {
    i.addEventListener('click', (event) => {
        if(i.classList.contains("active")) {
            i.classList.remove("active");
            return;
        }
        i.classList.add("active");
    })
}