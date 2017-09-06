main();

function main() {
    var draw = SVG('drawing');

    gridBoxes(draw);

    /*
     patternGrid(draw, {
     size: 20,
     fence: draw.rect(200, 200).fill('none').stroke('black'),
     cellFn: function (g, cell, self) {
     return g.circle(self.size - 2).stroke('black').fill('none');
     }
     }).move(10, 10);


     patternGrid(draw, {
     size: 20,
     fence: draw.rect(200, 200).fill('none').stroke('black'),
     cellFn: function (g, cell, self) {
     var dim = self.size / 2;
     return g.rect(dim, dim).stroke('black');
     }
     }).move(220, 10);


     patternGrid(draw, {
     size: 20,
     offsets: [.5, .5],
     fence: draw.rect(200, 200).fill('none').stroke('black'),
     cellFn: function (g, cell, self) {
     var isEmpty = cell.j % 2 === 0;
     if (cell.i % 2 === 0)
     isEmpty = !isEmpty;
     var dim = self.size;
     return isEmpty ? null : g.rect(dim, dim).stroke('black');
     }
     }).move(430, 10);
     */
}

function patternGrid(root, props) {
    var pattern = root.group().add(props.fence);
    var cells = pattern.group().clipWith(props.fence.clone());

    var rowCount = props.fence.height() / props.size + 1,
        colCount = props.fence.width() / props.size + 1;

    var iStart = 0, jStart = 0;
    if (props.offsets) {
        iStart = -props.offsets[0];
        jStart = -props.offsets[1];
    }

    for (var i = iStart; i < colCount; i++) {
        for (var j = jStart; j < rowCount; j++) {
            var cell = props.cellFn(cells, {i: i, j: j}, props);
            if (cell !== null)
                cell.center(i * props.size, j * props.size);
        }
    }

    return pattern;
}

function gridBoxes(svg) {
    window.svg = svg;
    var rbox = svg.rbox();
    var w = rbox.width, h = rbox.height;

    var latitudes = [
        [.2, .5],
        [.6, .6],
        [.9, .8]
    ], latCount = latitudes.length;

    var longitudes = [
        [.3, .2],
        [.4, .5],
        [.7, .9]
    ], lonCount = longitudes.length;

    var intersections = [];

    // Intersection points using expression from following wikipedia section:
    // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line
    for (var i = 0; i < latCount; ++i) {
        var x1 = 0; var y1 = (latitudes[i][0] *= h);
        var x2 = w; var y2 = (latitudes[i][1] *= h);
        svg.line(x1, y1, x2, y2).stroke('#f09');
        for(var j = 0; j < lonCount; ++j) {
            if (i === 0) {
                longitudes[j][0] *= w;
                longitudes[j][1] *= w;
            }
            var x3 = longitudes[j][0]; var y3 = 0;
            var x4 = longitudes[j][1]; var y4 = h;
            if (i === 0)
                svg.line(x3, y3, x4, y4).stroke('#f09');
            var xp = (((x1 * y2 - x2 * y1) * (x3 - x4)) - ((x3 * y4 - x4 * y3) * (x1 - x2))) /
                (((x1 - x2) * (y3 - y4)) - ((x3 - x4) * (y1 - y2)));
            var yp = (((x1 * y2 - x2 * y1) * (y3 - y4)) - ((x3 * y4 - x4 * y3) * (y1 - y2))) /
                (((x1 - x2) * (y3 - y4)) - ((x3 - x4) * (y1 - y2)));
            if (!intersections[i])
                intersections[i] = [];
            intersections[i][j] = [xp, yp];
            svg.circle(10).fill('#f09').center(xp, yp);
        }
    }

    /*
    svg.polygon([
        [0, 0], [0, latitudes[0][0]], intersections[0][0], [longitudes[0][0], 0]])
        .back();
        */

    for (i = 0; i <= latCount; ++i) {
        for (j = 0; j <= lonCount; ++j) {
            var topLeft = [], topRight = [], botLeft = [], botRight = [];

            if (i === 0 && j === 0) {
                topLeft = [0, 0];
            } else if (i === 0) {
                topLeft = [longitudes[j - 1][0], 0];
            } else if (j === 0) {
                topLeft = [0, latitudes[i - 1][0]];
            } else {
                topLeft = intersections[i - 1][j - 1];
            }

            if (i === 0 && j === lonCount) {
                topRight = [w, 0];
            } else if (i === 0) {
                topRight = [longitudes[j][0], 0];
            } else if (j === lonCount) {
                topRight = [w, latitudes[i - 1][1]];
            } else {
                topRight = intersections[i - 1][j];
            }

            if (i === latCount && j === 0) {
                botLeft = [0, h];
            } else if (i === latCount) {
                botLeft = [longitudes[j - 1][1], h];
            } else if (j === 0) {
                botLeft = [0, latitudes[i][0]];
            } else {
                botLeft = intersections[i][j - 1];
            }

            if (i === latCount && j === lonCount) {
                botRight = [w, h];
            } else if (i === latCount) {
                botRight = [longitudes[j][1], h];
            } else if (j === lonCount) {
                botRight = [w, latitudes[i][1]];
            } else {
                botRight = intersections[i][j];
            }

            var shade = Math.round(Math.random() * 150);
            svg.polygon([topLeft, topRight, botRight, botLeft])
                .fill({r: shade, g: shade, b: shade}).back();
            svg.plain(i + ':' + j).stroke('white').move(topLeft[0], topLeft[1]);
        }
    }
}
