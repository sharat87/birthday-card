window.onload = main;


function main() {
    var canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    paper.setup(canvas);

    var fence = paper.Shape.Rectangle(20, 20, 100, 100);
    fence.strokeColor = 'black';
    var pat = new paper.Group(fence, fence.clone());
    pat.clipped = true;
    for (var i = 0; i < 10; i++) {
        var c = new paper.Shape.Circle(new paper.Point(20 + i * 20, 20), 18);
        c.strokeColor = 'black';
        pat.addChild(c);
    }

    fence = paper.Shape.Rectangle(140, 20, 100, 100);
    fence.strokeColor = 'black';
    pat = new paper.Group(fence, fence.clone());
    pat.clipped = true;
    for (i = 0; i < 10; i++) {
        c = new paper.Shape.Circle(new paper.Point(20 + i * 20, 60), 18);
        c.strokeColor = 'black';
        pat.addChild(c);
    }

    paper.view.draw();
}