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

    if (!localStorage.hideBg) {
        var gridFns = [patternGrid, patternSprinkle, patternCrowd];
        var boxes = gridBoxes(svg);
        for (var i = boxes.length; i-- > 0;) {
            var fence = boxes[i].fill('none').stroke('black');
            randomChoice(gridFns)(svg, {fence: fence}).back();
        }
    }

    var width = svg.rbox().width, height = svg.rbox().height,
        minCoreRadius = 10, maxCoreRadius = 40,
        flowerCount = 5 * Math.sqrt(width * height) / (minCoreRadius + maxCoreRadius);
    console.log('Drawing', flowerCount, 'flowers');
    for (var r = flowerCount; r > 0;) {
        var rings = [];

        if (Math.random() < .3)
            rings.push({
                type: 'petal',
                length: Math.floor(rand(minCoreRadius, maxCoreRadius)),
                pullBack: Math.random(),
                wide: .5 * Math.random() - .1,
                overdraw: true
            });

        --r;
        rings.push({
            type: 'petal',
            length: Math.floor(rand(minCoreRadius, maxCoreRadius)),
            pullBack: Math.random(),
            wide: .5 * Math.random() - .1
        });

        if (Math.random() < .8) {
            rings.push({
                type: 'ring',
                padding: 10,
                width: 15
            });

            if (Math.random() < .5) {
                --r;
                rings.push({
                    type: 'petal',
                    length: Math.floor(rand(.75, 5) * Math.floor(rand(minCoreRadius, maxCoreRadius))),
                    pullBack: Math.random(),
                    wide: .5 * Math.random() - .1
                });
            }
        }

        flower(svg.group(), {
            coreRadius: Math.floor(rand(minCoreRadius, maxCoreRadius)),
            rings: rings
        }).center(Math.floor(rand(10, width - 10)), Math.floor(rand(10, height - 10))).stroke('#666');
    }
}

function flower(svg, props) {
    var coreRadius = props.coreRadius;

    // Central dot.
    svg.circle(Math.floor(.1 * coreRadius)).center(0, 0);

    // The radius to which drawing has been done.
    var filledRadius = coreRadius;

    // Draw the rings.
    for (var r = 0; r < props.rings.length; ++r) {
        var ring = props.rings[r];
        if (ring.type === 'petal') {
            var petal = ring;
            console.log('Drawing petal', petal);
            filledRadius += petal.padding || 0;
            svg.circle(2 * filledRadius).center(0, 0).fill('none');
            var petalPath = drawPetals(filledRadius, petal);
            svg.path(petalPath).fill('none');
            if (!petal.overdraw)
                filledRadius += petal.length + (petal.margin || 0);

        } else if (ring.type === 'ring') {
            filledRadius += ring.padding || 0;
            svg.circle(2 * filledRadius).center(0, 0).fill('none');
            svg.circle(2 * (filledRadius + ring.width)).center(0, 0).fill('none');
            var texture = svg.group(), style = ring.style || Math.random() * 5;

            var unit = texture.symbol();
            unit.viewbox(-ring.width / 2, -ring.width / 2, ring.width, ring.width);

            if (style < 1) {
                unit.circle('60%').center(0, 0);

            } else if (style < 2) {
                unit.rect(5, 5).center(0, 0);

            } else if (style < 4) {
                unit.polygon('0,-3 -2.5,1.2 2.5,1.2').center(0, 0);
                if (style < 3)
                    unit.last().flip('y');

            } else if (style < 5) {
                unit.line(0, 0, 0, -5);
                unit.line(0, 0, -5, 5);
                unit.line(0, 0, 5, 5);

            }

            var bubbleCount = Math.ceil(2 * Math.PI * filledRadius / ring.width);
            var interBubbleAngle = 2 * Math.PI / bubbleCount;
            var deltaAngleDeg = interBubbleAngle * 180 / Math.PI;
            var rotateMatrix = new SVG.Matrix();
            var c = texture.point(0, filledRadius + ring.width / 2);
            for (var s = 0; s < bubbleCount; ++s) {
                texture.use(unit).width(ring.width).height(ring.width).center(c.x, c.y).transform(rotateMatrix);
                rotateMatrix = rotateMatrix.rotate(deltaAngleDeg, 0, 0);
            }

            texture.fill('none');
            filledRadius += ring.width;
        }
    }

    // The background.
    var gradient = svg.gradient('radial', function (stop) {
        var dark = Math.floor(Math.random() * 30) + 220;
        stop.at(0, '#FFF');
        stop.at(1, 'rgb(' + [dark, dark, dark].join(',') + ');');
    });
    var border = svg.circle(2 * filledRadius).center(0, 0).fill(gradient).back();
    if (ring.type === 'ring')
        border.stroke('none');

    // Move the folower to have it's center at the origin.
    var box = svg.rbox();
    svg.set(svg.children()).dmove(box.width / 2, box.height / 2);

    // Finished.
    return svg;
}

function drawPetals(coreRadius, petal) {
    var petalCount = petal.count || Math.floor(rand(5, 20));
    var petalSpan = petal.span || Math.floor(rand(1, Math.floor(petalCount / 2)));
    var form = petal.form || Math.random() * 5;

    var cuts = circleSliceCuts(0, 0, coreRadius, petalCount);
    var petalPath = ['M', cuts[0]];
    var outerRadius = coreRadius + petal.length;

    var splitAngleHalf = Math.PI / petalCount,
        spanAngleHalf = splitAngleHalf * petalSpan,
        spanLength = 2 * coreRadius * Math.sin(spanAngleHalf),
        factor = outerRadius / spanLength;

    // Find target point for the petal to aim.
    for (var i = 0; i < petalCount; ++i) {
        var p1 = cuts[i], p2 = cuts[(i + petalSpan) % cuts.length];
        var pm = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2],
            pd = [p2[0] - p1[0], p2[1] - p1[1]];
        var t = [factor * pd[1], factor * -pd[0]];

        if (form < 1) {
            petalPath.push('M', p1,
                'Q', orthogonalPoint(p1, t, .3, 12), t,
                'Q', orthogonalPoint(p2, t, .3, -12), p2);

        } else if (form < 2) {
            petalPath.push('M', p1, 'L', t, 'L', p2);

        } else if (form < 3) {
            petalPath.push('M', p1,
                'A', spanLength / 2, outerRadius / 2,
                Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180 / Math.PI, 1, 1, p2);

        } else if (form < 5) {
            var dx = t[0] - pm[0], dy = t[1] - pm[1];
            dx *= petal.pullBack; // pullBack: 0 - Triangle, 1 - Rectangle.
            dy *= petal.pullBack;

            var q1 = [p1[0] + dx, p1[1] + dy];
            var q2 = [p2[0] + dx, p2[1] + dy];
            var extraX = pd[0] * petal.wide;
            var extraY = pd[1] * petal.wide;
            q1[0] -= extraX;
            q1[1] -= extraY;
            q2[0] += extraX;
            q2[1] += extraY;

            if (form < 4) {
                petalPath.push('M', p1,
                    'L', q1,
                    'L', new SVG.Point(t),
                    'L', q2,
                    'L', p2);

            } else {
                petalPath.push('M', p1,
                    'Q', q1, t,
                    'Q', q2, p2);

            }

        }

    }

    return petalPath;
}

function circleSliceCuts(cx, cy, r, n) {
    // Returns an array of points as `[[x, y], ...]` that lie on the circle `{cx, cy, r}` and
    // cut the circle into n equal sized slices.
    var t = 2 * Math.PI / n, cuts = [];
    for (var i = 0; i < n; ++i)
        cuts.push([cx + r * Math.sin(i * t), cy - r * Math.cos(i * t)]);
    return cuts;
}

function patternCrowd(root, props) {
    var fence = props.fence;
    var pos = fence.rbox();
    var pattern = root.group().move(pos.x, pos.y).add(fence.move(0, 0));
    var crowd = pattern.group().clipWith(fence.clone());

    var radius = 10;
    for (var y = pos.height - radius; y >= 0; y -= 2 * radius - 5) {
        for (var x = pos.width - radius; x >= 0; x -= 2 * radius - 5) {
            crowd.circle(2 * radius + jitter(2)).stroke('black').fill('white')
                .center(x + jitter(.2 * radius), y + jitter(.2 * radius));
        }
    }

    return pattern;
}

function jitter(n) {
    // A random integer in [-n, n].
    return Math.floor(Math.random() * (2 * n + 1)) - n;
}

function orthogonalPoint(a, b, p, k) {
    // Returns a point as [x, y] on the line perpendicular to the line AB, intersecting at `a + p * (b - a)`,
    // such that it is `k` units away from the line AB.
    var deltaX = b[0] - a[0], deltaY = b[1] - a[1];
    var px = a[0] + p * (deltaX), py = a[1] + p * (deltaY);
    var hyp = k ? Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) : 1;
    return [px + k * deltaY / hyp, py - k * deltaX / hyp];
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

    // TODO: Return an SVG.Set instead of an array.
    return polygons;
}

function rand(min, max) {
    return min + Math.random() * (max - min);
}