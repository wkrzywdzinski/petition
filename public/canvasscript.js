var canvas = $("#signaturebox");
var hiddenbox = $("#hiddenbox");
var ctx = canvas[0].getContext("2d");
ctx.strokeStyle = "black";
ctx.lineWidth = 4;
canvas.on("mousedown", function(e) {
  const offset = canvas.offset();
  let x = e.pageX - offset.left;
  let y = e.pageY - offset.top;
  ctx.beginPath();
  ctx.moveTo(x, y);
  canvas.on("mousemove", function(e) {
    x = e.pageX - offset.left;
    y = e.pageY - offset.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  e.preventDefault();
});

$(document).on("mouseup", function() {
  hiddenbox.val(canvas[0].toDataURL());
  canvas.off("mousemove");
});
