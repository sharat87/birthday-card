main();

function main() {
    var two = new Two({type: Two.Types.svg, fullscreen: true, autostart: true})
        .appendTo(document.getElementById('draw-shapes'));

    var r1 = two.makeRectangle(300, 100, 20, 20);
    r1.stroke = 'black';
    var r2 = two.makeRectangle(292, 92, 4, 4);
    r2.stroke = 'red';
    console.log(r1.parent, r2.parent)

    patternCircles(two, {
        x: 300, y: 100, width: 180, height: 180,
    });

    patternChecks(two, {
        x: 100, y: 100, width: 180, height: 180,
    });

}

function patternChecks(two, info) {
    console.log('Drawing checks pattern.');
    info.x = info.x || 0;
    info.y = info.y || 0;

    var left = info.x - info.width / 2, top = info.y - info.height / 2;
    var circles = [];
    var inc = info.inc || 8, aligner = 0;

    var rect = two.makeRectangle(info.x, info.y, info.width, info.height);
    rect.stroke = 'black';
    rect.linewidth = 3;
    rect.noFill();

    var y = top + inc;
    while (y < top + info.height) {
        var x = left + inc + aligner;
        while (x < left + info.width + inc) {
            var c = two.makeRectangle(x, y, 2 * inc, 2 * inc);
            var col = Math.round(Math.random() * 200);
            c.fill = c.stroke = 'rgb(' + col + ', ' + col + ', ' + col + ')';
            circles.push(c);
            x += 4 * inc;
        }
        aligner = aligner ? 0 : 2 * inc;
        y += 2 * inc;
    }

    var grp = two.makeGroup(circles);
    grp.mask = rect.clone();
    rect.addTo(grp);
    return grp;
}

function patternCircles(two, info) {
    console.log('Drawing circles pattern.');
    info.x = info.x || 0;
    info.y = info.y || 0;

    var left = info.x - info.width / 2, top = info.y - info.height / 2;
    var circles = [];
    var inc = info.inc || 8, aligner = 0;

    var rect = two.makeRectangle(info.x, info.y, info.width, info.height);
    rect.stroke = 'black';
    rect.linewidth = 3;
    rect.noFill();

    var y = top + inc;
    while (y < top + info.height) {
        var x = left + inc - aligner;
        while (x < left + info.width + inc) {
            var c = two.makeCircle(x, y, inc - 1);
            c.noFill();
            c.stroke = 'black';
            circles.push(c);
            c = two.makeCircle(x, y, inc / 2);
            c.noFill();
            c.stroke = 'black';
            circles.push(c);
            x += 2 * inc;
        }
        aligner = aligner ? 0 : inc;
        y += 2 * inc;
    }

    var grp = two.makeGroup(circles);
    grp.mask = rect.clone();
    rect.addTo(grp);

    return grp;
}
