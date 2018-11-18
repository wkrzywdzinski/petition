var input = $("input");
var links = $("a");
var catnip = $("#catnip");
var deletebutton = $("#deletebutton");
input.on("mousedown", function(e) {
  input.removeClass("selected");
  let inp = $(e.currentTarget);
  inp.addClass("selected");
});
catnip.on("mousedown", function(e) {
  console.log("druck");
  let inp = $(e.currentTarget);
  $("#cover").css("zIndex", -100);
});

input.on("mouseover", function(e) {
  input.removeClass("selected");
  let inp = $(e.currentTarget);
  inp.addClass("selected");
});
