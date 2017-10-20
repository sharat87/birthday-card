var canvasEl = document.getElementById('canvas');
canvasEl.width = window.innerWidth;
canvasEl.height = window.innerHeight;

// create a wrapper around native canvas element (with id="c")
var canvas = new fabric.Canvas('canvas');

// create a rectangle object
var rect = new fabric.Rect({
    left: 20,
    top: 20,
    fill: null,
    stroke: 'black',
    width: 100,
    height: 100
});

// "add" rectangle onto canvas
//canvas.add(rect);

var cells = [];
var group = new fabric.Group();
for (var i = 0; i < 10; ++i) {
    var c = new fabric.Circle({
        left: 20 + i * 20, top: 10,
        radius: 10, fill: '#' + i + i + i
    });
    group.addWithUpdate(c);
}

group.clipTo = function(ctx) {
    //ctx.translate(-this.width/2, -this.height/2);
    ctx.rect(-this.width/2, 0, 300, 300);
};
canvas.add(rect);
canvas.add(group);
