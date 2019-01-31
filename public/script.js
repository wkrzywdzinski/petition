var input = $(".inputfield");
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
