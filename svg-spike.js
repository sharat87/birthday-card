var cellFns = [
    // Circles
    function (g, pos) {
        return g.circle(pos.size - 2).stroke('black').fill('none').cx(pos.cx).cy(pos.cy);
    },

    // Little squares
    function (g, pos) {
        var dim = pos.size / 2;
        return g.rect(dim, dim).stroke('black').cx(pos.cx).cy(pos.cy);
    },

    // Checkerboard
    function (g, pos) {
        if (this._rotation === undefined)
            this._rotation = Math.random() > .5 ? 0 : (Math.random() * 90);
        var isEmpty = pos.j % 2 === 0;
        if (pos.i % 2 === 0)
            isEmpty = !isEmpty;
        if (isEmpty)
            return null;
        var cell = g.rect(pos.size, pos.size).stroke('black').cx(pos.cx).cy(pos.cy);
        if (this._rotation)
            cell.rotate(this._rotation);
        return cell;
    }
];

window.onload = main;

function main() {
    var svg = SVG('drawing');

    var gridFns = [patternGrid, patternSprinkle];
    var slots = gridBoxes(svg);
    for (var i = slots.length; i-- > 0;) {
        var fence = slots[i].fill('none').stroke('black');
        randomChoice(gridFns)(svg, {fence: fence}).back();
    }

    /*
    patternSprinkle(svg, {
        fence: svg.rect(500, 200).move(50, 50).stroke('black').fill('none')
    });*/

    // var g = svg.group().move(100, 100);
    // for (var i = 10; i-- > 0;)
    //     g.rect(50, 50).fill('#f09').rotate(45).move(i * 60, 100);
}

function randomChoice(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function patternGrid(root, props) {
    var fence = props.fence;
    var pos = fence.rbox();
    var pattern = root.group().move(pos.x, pos.y).add(fence.move(0, 0));
    var cells = pattern.group().clipWith(fence.clone());

    var fn = randomChoice(cellFns);
    var size = 15 + Math.round(Math.random() * 10);
    var offsets = [Math.random() - .5, Math.random() - .5];
    var rowCount = fence.height() / size + 1,
        colCount = fence.width() / size + 1;

    var iStart = 0, jStart = 0;
    if (offsets) {
        iStart = -offsets[0];
        jStart = -offsets[1];
    }

    for (var i = 0; i < colCount; i++) {
        for (var j = 0; j < rowCount; j++) {
            fn(cells, {
                size: size,
                i: i,
                j: j,
                cx: iStart + i * size,
                cy: jStart + j * size
            });
        }
    }

    return pattern;
}

function patternSprinkle(root, props) {
    var fence = props.fence;
    var pos = fence.rbox();
    var pattern = root.group().move(pos.x, pos.y).add(fence.move(0, 0));
    var dots = pattern.group().clipWith(fence);

    var size = (.15 + .3 * Math.random()) * Math.min(pos.width, pos.height);
    var sizeDelta = Math.min(10, size * .7);
    var shape = Math.floor(Math.random() * 2);
    var isCycleShape = Math.random() < .6;
    var isRandomStrokeWidth = Math.random() < .7;

    var count = Math.ceil(4 * pos.width * pos.height / Math.pow(size, 2));
    for (var i = 0; i < count; ++i) {
        var dotSize = size + Math.random() * 2 * sizeDelta - sizeDelta;
        var dot = dots.group();
        if (isCycleShape)
            shape = (shape + 1) % 2;

        if (shape === 0) {
            dot.circle(dotSize);
        } else if (shape === 1) {
            dot.rect(dotSize, dotSize).rotate(Math.random() * 90);
        }

        dot.attr({
            fill: 'white',
            stroke: 'black',
            'stroke-width': isRandomStrokeWidth ? Math.ceil(Math.random() * 3) : 1
        });

        dot.center(Math.random() * pos.width, Math.random() * pos.height);
    }

    return dots;
}

function gridBoxes(svg, doMark) {
    var rBox = svg.rbox();
    var w = rBox.width, h = rBox.height;

    var latCount = 3, lonCount = 4;

    var leftEdge = [];
    var rightEdge = [];
    var topEdge = [];
    var botEdge = [];

    for (var i = 0; i < latCount; ++i) {
        leftEdge.push(Math.random());
        rightEdge.push(Math.random());
    }

    for (var j = 0; j < lonCount; ++j) {
        topEdge.push(Math.random());
        botEdge.push(Math.random());
    }

    leftEdge.sort();
    topEdge.sort();
    rightEdge.sort();
    botEdge.sort();

    var intersections = [];

    // Intersection points using expression from following Wikipedia section:
    // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line
    for (i = 0; i < latCount; ++i) {
        var y1 = (leftEdge[i] *= h);
        var y2 = (rightEdge[i] *= h);
        if (doMark)
            svg.line(0, y1, w, y2).stroke('#f09');
        for (j = 0; j < lonCount; ++j) {
            if (i === 0) {
                topEdge[j] *= w;
                botEdge[j] *= w;
            }
            var x3 = topEdge[j];
            var x4 = botEdge[j];
            if (doMark && i === 0)
                svg.line(x3, 0, x4, h).stroke('#f09');
            var denominator = w * h - (x3 - x4) * (y1 - y2);
            var xp = (h * x3 - y1 * (x3 - x4)) * w / denominator;
            var yp = (w * y1 - x3 * (y1 - y2)) * h / denominator;
            if (!intersections[i])
                intersections[i] = [];
            intersections[i][j] = [xp, yp];
            if (doMark)
                svg.circle(10).fill('#f09').center(xp, yp);
        }
    }

    var polygons = [];
    for (i = 0; i <= latCount; ++i) {
        for (j = 0; j <= lonCount; ++j) {
            var topLeft = [], topRight = [], botLeft = [], botRight = [];

            if (i === 0 && j === 0) {
                topLeft = [0, 0];
            } else if (i === 0) {
                topLeft = [topEdge[j - 1], 0];
            } else if (j === 0) {
                topLeft = [0, leftEdge[i - 1]];
            } else {
                topLeft = intersections[i - 1][j - 1];
            }

            if (i === 0 && j === lonCount) {
                topRight = [w, 0];
            } else if (i === 0) {
                topRight = [topEdge[j], 0];
            } else if (j === lonCount) {
                topRight = [w, rightEdge[i - 1]];
            } else {
                topRight = intersections[i - 1][j];
            }

            if (i === latCount && j === 0) {
                botLeft = [0, h];
            } else if (i === latCount) {
                botLeft = [botEdge[j - 1], h];
            } else if (j === 0) {
                botLeft = [0, leftEdge[i]];
            } else {
                botLeft = intersections[i][j - 1];
            }

            if (i === latCount && j === lonCount) {
                botRight = [w, h];
            } else if (i === latCount) {
                botRight = [botEdge[j], h];
            } else if (j === lonCount) {
                botRight = [w, rightEdge[i]];
            } else {
                botRight = intersections[i][j];
            }

            polygons.push(svg.polygon([topLeft, topRight, botRight, botLeft]));
            if (doMark)
                svg.plain(i + ':' + j).stroke('#f09').fill('#f09').move(topLeft[0], topLeft[1]);
        }
    }

    return polygons;
}
