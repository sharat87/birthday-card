var cellFns = [
    // Circles
    function (g, pos) {
        return g.circle(this.size - 2).stroke('black').fill('none').cx(pos.cx).cy(pos.cy);
    },

    // Little squares
    function (g, pos) {
        var dim = this.size / 2;
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
        var cell = g.rect(this.size, this.size).stroke('black').cx(pos.cx).cy(pos.cy);
        if (this._rotation)
            cell.rotate(this._rotation);
        return cell;
    }
];

main();

function main() {
    var draw = SVG('drawing');

    var slots = gridBoxes(draw);
    for (var i = 0; i < slots.length; ++i) {
        patternGrid(draw, {
            fence: slots[i].fill('none').stroke('black'),
            cell: randomCell()
        }).back();
    }

    // var g = draw.group().move(100, 100);
    // for (var i = 10; i-- > 0;)
    //     g.rect(50, 50).fill('#f09').rotate(45).move(i * 60, 100);
}

function randomCell() {
    return {
        size: 15 + Math.round(Math.random() * 10),
        offsets: [Math.random() - .5, Math.random() - .5],
        fn: cellFns[Math.floor(Math.random() * cellFns.length)]
    };
}

function patternGrid(root, props) {
    var fence = props.fence;
    var pos = fence.rbox();
    var pattern = root.group().move(pos.x, pos.y).add(fence.move(0, 0));
    var cells = pattern.group().clipWith(fence.clone());

    var rowCount = fence.height() / props.cell.size + 1,
        colCount = fence.width() / props.cell.size + 1;

    var iStart = 0, jStart = 0;
    if (props.cell.offsets) {
        iStart = -props.cell.offsets[0];
        jStart = -props.cell.offsets[1];
    }

    for (var i = 0; i < colCount; i++) {
        for (var j = 0; j < rowCount; j++) {
            var cell = props.cell.fn.call(props.cell, cells, {
                i: i,
                j: j,
                cx: iStart + i * props.cell.size,
                cy: jStart + j * props.cell.size
            });
        }
    }

    return pattern;
}

function gridBoxes(svg) {
    window.svg = svg;
    var rbox = svg.rbox();
    var w = rbox.width, h = rbox.height;

    var debugMarks = false, latCount = 3, lonCount = 4;

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

    // Intersection points using expression from following wikipedia section:
    // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line
    for (i = 0; i < latCount; ++i) {
        var x1 = 0;
        var y1 = (leftEdge[i] *= h);
        var x2 = w;
        var y2 = (rightEdge[i] *= h);
        if (debugMarks)
            svg.line(x1, y1, x2, y2).stroke('#f09');
        for (j = 0; j < lonCount; ++j) {
            if (i === 0) {
                topEdge[j] *= w;
                botEdge[j] *= w;
            }
            var x3 = topEdge[j];
            var y3 = 0;
            var x4 = botEdge[j];
            var y4 = h;
            if (debugMarks && i === 0)
                svg.line(x3, y3, x4, y4).stroke('#f09');
            var xp = (((x1 * y2 - x2 * y1) * (x3 - x4)) - ((x3 * y4 - x4 * y3) * (x1 - x2))) /
                (((x1 - x2) * (y3 - y4)) - ((x3 - x4) * (y1 - y2)));
            var yp = (((x1 * y2 - x2 * y1) * (y3 - y4)) - ((x3 * y4 - x4 * y3) * (y1 - y2))) /
                (((x1 - x2) * (y3 - y4)) - ((x3 - x4) * (y1 - y2)));
            if (!intersections[i])
                intersections[i] = [];
            intersections[i][j] = [xp, yp];
            if (debugMarks)
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

            var shade = Math.round(Math.random() * 150);
            polygons.push(svg.polygon([topLeft, topRight, botRight, botLeft]));
            if (debugMarks)
                svg.plain(i + ':' + j).stroke('#f09').fill('#f09').move(topLeft[0], topLeft[1]);
        }
    }

    return polygons;
}
