var stage = new createjs.Stage("sketchpad");

window.onresize = function () {
    stage.canvas.width = document.body.offsetWidth;
    stage.canvas.height = document.body.offsetHeight;
};
window.onresize();

//Create a Shape DisplayObject.
var circle = new createjs.Shape();
circle.graphics.beginFill("red").drawCircle(0, 0, 40);

//Set position of Shape instance.
circle.x = circle.y = 50;

//Add Shape instance to stage display list.
stage.addChild(circle);

/*
 var box = new createjs.Shape();
 box.x = 100;
 box.y = 20;
 box.graphics.setStrokeStyle(1).beginStroke('black').rect(0, 0, 200, 100);
 box.graphics.beginFill('red').drawCircle(0, 0, 20);
 stage.addChild(box);

 var pat1 = new createjs.Container();
 pat1.x = box.x;
 pat1.y = box.y;
 pat1.mask = box;
 for (var y = 0; y < 10; y++) {
 for (var x = 0; x < 10; x++) {
 var c = new createjs.Shape();
 c.graphics.beginStroke('black').drawCircle(0, 0, 8);
 pat1.addChild(c);
 c.x = x * 20;
 c.y = y * 20;
 }
 }
 stage.addChild(pat1);
 */

function bubbleCellFn(info) {
    return function (graphics, cell) {
        var radius = (info.radiusDelta || 0) + cell.size / 2;
        if (info.randomSizes)
            radius -= cell.size * Math.random() / 4;
        if (info.stroke)
            graphics.beginStroke(info.stroke);
        graphics.drawCircle(
            cell.size / 2 + cell.size * cell.col,
            cell.size / 2 + cell.size * cell.row,
            radius);
    }
}

stage.addChild(repeatedCellPattern(
    {x: 100, y: 20, width: 200, height: 200, cellSize: 20},
    bubbleCellFn({stroke: 'black', randomSizes: true, radiusDelta: -1})
));

//Update stage will render next frame
stage.update();

function repeatedCellPattern(info, drawCell) {
    var box = new createjs.Shape();
    box.x = info.x;
    box.y = info.y;

    var rowCount = 10;
    var colCount = 10;

    var g = box.graphics;
    for (var i = 0; i < rowCount; i++) {
        for (var j = 0; j < colCount; j++) {
            drawCell(g, {size: info.cellSize, row: i, col: j});
        }
    }

    box.graphics.setStrokeStyle(1).beginStroke('black').rect(0, 0, info.width, info.height);
    box.mask = box;
    return box;
}
