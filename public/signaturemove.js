var canvas = $("#signaturebox")
var hiddenbox = $("#hiddenbox")
var ctx = canvas[0].getContext("2d")
ctx.strokeStyle = "blue";
canvas.on("mousedown", function(e) {
  let x = e.offsetX
  let y = e.offsetY
      ctx.beginPath()
      ctx.moveTo(x, y)
  canvas.on("mousemove", function(e) {
    let x = e.offsetX
    let y = e.offsetY
    ctx.lineTo(x, y)
          ctx.stroke()


  });

    e.preventDefault();

});

$(document).on("mouseup", function() {
  // console.log(canvas[0].toDataURL())
  // hiddenbox.val("davido")
  hiddenbox.val(canvas[0].toDataURL())
  console.log(hiddenbox.val())
  canvas.off("mousemove");


});
