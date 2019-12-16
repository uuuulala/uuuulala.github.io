// using this thing instead of links
const btns = Array.from(document.querySelectorAll(".btn"));
btns.forEach(function (b) {
    b.onclick = function (e) {
        if (e.target.classList.contains("what-I-do")) {
            window.location.href="../what-I-do.html";
        } else if (e.target.classList.contains("who-I-am")) {
            window.location.href = "../who-I-am.html";
        } else if (e.target.classList.contains("hire-me")) {
            window.location.href = "../hire-me.html";
        }
    }
});