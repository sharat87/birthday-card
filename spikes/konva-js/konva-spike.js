var stage = new Konva.Stage({
    container: document.body,
    width: window.innerWidth,
    height: window.innerHeight
});

var layer = new Konva.Layer();

var grp = new Konva.Group({
    clipFunc: function (ctx) {
        var r = new Konva.Rect({
            x: 20,
            y: 20,
            width: 200,
            height: 100,
            stroke: 'black',
            strokeWidth: 1
        });
        this.add(r);
        r.draw(ctx);
    }
});

for (var i = 0; i < 10; i++) {
    var circle = new Konva.Circle({
        x: i * 30,
        y: 20,
        radius: 20,
        stroke: 'black',
        strokeWidth: 1
    });
    grp.add(circle);
}

layer.add(grp);

grp = new Konva.Group({
    clipFunc: function (ctx) {
        var r = new Konva.Rect({
            x: 20,
            y: 140,
            width: 200,
            height: 100,
            stroke: '#f09',
            strokeWidth: 1
        });
        this.add(r);
        r.draw(ctx);
    }
});

for (i = 0; i < 10; i++) {
    circle = new Konva.Circle({
        x: i * 30,
        y: 140,
        radius: 20,
        stroke: '#f09',
        strokeWidth: 1
    });
    grp.add(circle);
}

layer.add(grp);

stage.add(layer);