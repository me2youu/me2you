var box = document.getElementById("box");
var cookie = document.getElementById("cookie");

var tlink = "https://twitter.com/intent/tweet/?text="
cookie.addEventListener('click', animate);
var anchor = document.querySelector("a");

function animate() {
  var quote = quotes[Math.floor(Math.random() * 119)].Field1;
  box.classList.toggle("box-animate");
  box.innerHTML = "<p>" + quote + "</p>"
anchor.setAttribute('href', tlink + quote);
}
