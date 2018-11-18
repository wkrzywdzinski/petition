var input = $("input");
var links = $("a");
var deletebutton = $("#deletebutton");
input.on("mousedown", function(e) {
  input.removeClass("selected");
  let inp = $(e.currentTarget);
  inp.addClass("selected");
});

input.on("mouseover", function(e) {
  input.removeClass("selected");
  let inp = $(e.currentTarget);
  inp.addClass("selected");
});
