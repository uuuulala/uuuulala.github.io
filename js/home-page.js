// using this thing instead of links
const btns = Array.from(document.querySelectorAll(".btn"));
btns.forEach(function (b) {
    b.onclick = function (e) {
        console.log(e.target);
        if (e.target.classList.contains("what-I-do")) {
            window.location.href="../what-I-do.html";
        } else if (e.target.classList.contains("who-I-am")) {
            window.location.href = "../who-I-am.html";
        } else if (e.target.classList.contains("hire-me")) {
            window.location.href = "../hire-me.html";
        } else if (e.target.classList.contains("instagram") || e.target.parentNode.classList.contains("instagram")) {
            window.location.href = "https://www.instagram.com/ksenia_it_is/";
        } else if (e.target.classList.contains("upwork") || e.target.parentNode.classList.contains("upwork")) {
            window.location.href = "https://www.upwork.com/o/profiles/users/_~01d7272896b74a4413/";
        } else if (e.target.classList.contains("linkedIn") || e.target.parentNode.classList.contains("linkedIn")) {
            window.location.href = "https://www.linkedin.com/in/ksenia-kondrashova/";
        }
    }
});