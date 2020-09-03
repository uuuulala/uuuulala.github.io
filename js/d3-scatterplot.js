initD3Scatterplot();

function initD3Scatterplot() {
    // generate random data
    const maxX = 20, maxY = 20;
    const data = Array.from({length: 50}, () => {
        return {
            x: maxX * 0.1 + Math.random() * maxX * 0.8,
            y: maxY * 0.1 + Math.random() * maxY * 0.8,
            r: 6 + Math.random() * 20
        }
    });

    // set graphics parameters
    const
        svgSize = { w: 800, h: 350 },
        svgCenter = [ svgSize.w / 2, svgSize.h / 2 ],
        dottedLineThickness = 4,
        dottedLineSpacing = 3 * dottedLineThickness,
        labelPadding = { v: 5, h: 10 },
        btnSize = 55,
        btnPadding = 15,
        trimmedFormat = d3.format('.3~s');
    // zooming
    const zoomingDuration = 500,
        zoomBound = [1, 6];
    let zoomTransformData;
    // for dot selection
    let selectedDotIdx = 0;
    let xDotLabel, yDotLabel, labelLines = [];

    // create SVG
    let svg = d3
        .select('.d3-scatterplot svg')
        .attr('viewBox', '-80 -30 ' + (svgSize.w + 100) + ' ' + (svgSize.h + 80));

    // create scales
    let x = d3
        .scaleLinear()
        .range([0, svgSize.w])
        .domain([0, maxX]);
    let y = d3
        .scaleLinear()
        .range([svgSize.h, 0])
        .domain([0, maxY]);
    let rescaledX = x;
    let rescaledY = y;

    // append both axis
    let xAxis = d3.axisBottom().scale(x);
    let yAxis = d3.axisLeft().scale(y).ticks(6);
    let gX = svg.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + svgSize.h + ')')
        .call(xAxis);
    let gY = svg.append('g')
        .attr('class', 'axis axis--y')
        .call(yAxis);

    // create chart area and make it clipped (for zooming)
    svg.select('#scatterplot-area-clip')
        .append('rect')
        .attr('class', 'scatterplot-area-clip')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', svgSize.w + 10)
        .attr('height', svgSize.h);
    let chart = svg
        .append('g')
        .attr('clip-path', 'url(#scatterplot-area-clip)')
        .append('g')
        .attr('class', 'zoom');

    // draw labels & lines
    let labels = svg
        .append('g')
        .attr('class', 'labels');
    let labelLinesGroup = svg
        .append('g');
    drawSelectionLines();
    drawSelectionLabels();

    // append dots to the chart
    let dots = chart.append('g')
        .selectAll('dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('data-dot-id', (d, idx) => idx)
        .attr('class', 'dot')
        .attr('cx', (d) => x(d.x))
        .attr('cy', (d) => y(d.y))
        .attr('r', (d) => d.r)
        .on('mouseenter', function() {
            updateDotSelection(this);
        })
        .on('click', function() {
            updateDotSelection(this);
            zoomIn();
        });

    // select one dot
    chart
        .selectAll('.dot')
        .filter((d, idx) => (idx === selectedDotIdx))
        .classed('selected', true);

    // create zooming buttons
    let btns = svg.append('g').attr('class', 'btns');
    let zoomInBtn = drawBtn(btns, null, 'plus', 0)
        .on('click', zoomIn);
    let zoomOutBtn = drawBtn(btns, 'disabled', 'minus', 1)
        .on('click', zoomOut);
    let zoomResetBtn = drawBtn(btns, 'disabled', 'reset', 2)
        .on('click', zoomReset);

    // set the position of zooming buttons
    const btnsSize = btns.node().getBBox();
    btns.attr('transform', 'translate(' + (svgSize.w - btnsSize.width) + ', ' + (svgSize.h - 30 - btnsSize.height) + ')');

    // zoom-related data & defs
    zoomTransformData = d3.zoomTransform(chart);

    // update dot selection, redraw labels
    function updateDotSelection(dot) {
        svg.select('.selected').classed('selected', false);
        const d3Dot = d3.select(dot);
        d3Dot.classed('selected', true);
        selectedDotIdx = +d3Dot.attr('data-dot-id');
        updateLinesAndLabels(100);
    }

    // zooming buttons handlers
    function zoomIn() {
        if (!zoomInBtn.classed('disabled')) {
            zoomTransformData.k *= 2.5;
            zoomTransformData.k = Math.min(zoomTransformData.k, zoomBound[1]);
            centralizeZoom();
            focusOnPoint();
        }
    }
    function zoomOut() {
        if (!zoomOutBtn.classed('disabled')) {
            zoomTransformData.k /= 1.8;
            zoomTransformData.k = Math.max(zoomTransformData.k, zoomBound[0]);
            if (zoomTransformData.k === zoomBound[0]) {
                resetZoom();
            } else {
                centralizeZoom();
            }
            focusOnPoint();
        }
    }
    function zoomReset() {
        if (!zoomResetBtn.classed('disabled')) {
            resetZoom();
            focusOnPoint();
        }
    }

    // zooming transforms
    function resetZoom() {
        zoomTransformData.x = 0;
        zoomTransformData.y = 0;
        zoomTransformData.k = 1;
    }
    function centralizeZoom() {
        const selectedDot = chart.selectAll('.dot')
            .filter((d, idx) => (idx === selectedDotIdx));
        zoomTransformData.x = svgCenter[0] - selectedDot.attr('cx') * zoomTransformData.k;
        zoomTransformData.y = svgCenter[1] - selectedDot.attr('cy') * zoomTransformData.k;
    }

    // zoom to the point
    function focusOnPoint() {
        handleBtnsAvailibity();
        // make sure labels and lines have same style regardless zoom level
        dots
            .transition()
            .duration(zoomingDuration)
            .attr('r', (d) => (d.r / zoomTransformData.k));

        // apply zooming to chart area
        chart
            .transition()
            .duration(zoomingDuration)
            .attr('transform', zoomTransformData);
        // rescale for new bounds
        let newXAxis = xAxis.scale(zoomTransformData.rescaleX(x));
        let newYAxis = yAxis.scale(zoomTransformData.rescaleY(y));
        // apply rescaling to both axes
        gX
            .transition()
            .duration(zoomingDuration)
            .call(newXAxis);
        gY
            .transition()
            .duration(zoomingDuration)
            .call(newYAxis);

        // recalculate auxiliary x & y so tha labels could be transformed together with chart area
        rescaledX = d3
            .scaleLinear()
            .range([0, svgSize.w])
            .domain(newXAxis.scale().domain());
        rescaledY = d3
            .scaleLinear()
            .range([svgSize.h, 0])
            .domain(newYAxis.scale().domain());

        updateLinesAndLabels(zoomingDuration);
    }

    // control btns activated / deactivated state
    function handleBtnsAvailibity() {
        zoomInBtn.classed('disabled', false);
        zoomOutBtn.classed('disabled', false);
        zoomResetBtn.classed('disabled', false);
        if (zoomTransformData.k === zoomBound[0]) {
            zoomOutBtn.classed('disabled', true);
            if (zoomTransformData.x === 0 && zoomTransformData.y === 0) {
                zoomResetBtn.classed('disabled', true);
            }
        }
        if (zoomTransformData.k === zoomBound[1]) {
            zoomInBtn.classed('disabled', true);
        }
    }

    // draw buttons
    function drawBtn(parent, className, iconName, idx) {
        let btn = parent
            .append('g')
            .attr('class', 'btn ' + className)
            .attr('fill', '#dddddd');
        btn
            .append('rect')
            .attr('x', (btnPadding + btnSize) * idx)
            .attr('y', 0)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', btnSize)
            .attr('height', btnSize);
        btn
            .append('use')
            .attr('xlink:href', '#' + iconName)
            .attr('x', (btnPadding + btnSize) * idx)
            .attr('y', 0)
            .attr('width', btnSize)
            .attr('height', btnSize);
        return btn;
    }

    // draw lines from selected dot down to the axis
    function drawSelectionLines() {
        labelLines[0] = labelLinesGroup
            .append('line')
            .attr('x1', x(data[selectedDotIdx].x))
            .attr('y1', 0)
            .attr('x2', x(data[selectedDotIdx].x))
            .attr('y2', svgSize.h)
            .attr('stroke', '#ff5252')
            .attr('stroke-width', dottedLineThickness)
            .attr('stroke-dasharray', dottedLineSpacing + ' ' + dottedLineSpacing);
        labelLines[1] = labelLinesGroup
            .append('line')
            .attr('x1', svgSize.w)
            .attr('y1', y(data[selectedDotIdx].y))
            .attr('x2', 0)
            .attr('y2', y(data[selectedDotIdx].y))
            .attr('stroke', '#ff5252')
            .attr('stroke-width', dottedLineThickness)
            .attr('stroke-dasharray', dottedLineSpacing + ' ' + dottedLineSpacing);
    }

    // append labels to the both axis
    function drawSelectionLabels() {
        xDotLabel = labels.append('g');
        let back = appendBack(xDotLabel);
        let text = appendText(xDotLabel, trimmedFormat(data[selectedDotIdx].x));
        let bb = text.node().getBBox();
        let width = bb.width + labelPadding.h * 2;
        let height = bb.height + labelPadding.v * 2;
        setLabelSize(back, text, width, height);
        xDotLabel
            .attr('transform', 'translate( ' +
                (x(data[selectedDotIdx].x) - width * 0.5) + ', ' +
                (svgSize.h + 5.5) +
                ')');

        yDotLabel = labels.append('g');
        back = appendBack(yDotLabel);
        text = appendText(yDotLabel, trimmedFormat(data[selectedDotIdx].y));
        bb = text.node().getBBox();
        width = bb.width + labelPadding.h * 2;
        height = bb.height + labelPadding.v * 2;
        setLabelSize(back, text, width, height);
        yDotLabel
            .attr('transform', 'translate( ' +
                (-width - 6) + ', ' +
                (y(data[selectedDotIdx].y) - height * 0.5) +
                ')');
        function appendBack(parent) {
            return parent
                .append('rect')
                .attr('fill', '#ff5252')
                .attr('x', 0)
                .attr('y', 0)
                .attr('rx', 5)
                .attr('ry', 5);
        }
        function appendText(parent, text) {
            return parent
                .append('text')
                .attr('fill', '#ffffff')
                .attr('x', 0)
                .attr('y', 0)
                .attr('text-anchor', 'middle')
                .text(text);
        }
    }

    // change labels position for new selected point
    // (not for zooming, zooming adjustment is done within focusOnPoint())
    function updateLinesAndLabels(dur) {
        let text = xDotLabel
            .select('text')
            .text(trimmedFormat(data[selectedDotIdx].x));
        let back = xDotLabel
            .select('rect');
        let bb = text.node().getBBox();
        let width = bb.width + labelPadding.h * 2;
        let height = bb.height + labelPadding.v * 2;
        setLabelSize(back, text, width, height);
        xDotLabel
            .transition()
            .duration(dur)
            .attr('transform', 'translate( ' +
                (rescaledX(data[selectedDotIdx].x) - width * 0.5) + ', ' +
                (svgSize.h + 5.5) +
                ')');

        text = yDotLabel
            .select('text')
            .text(trimmedFormat(data[selectedDotIdx].y));
        back = yDotLabel
            .select('rect');
        bb = text.node().getBBox();
        width = bb.width + labelPadding.h * 2;
        height = bb.height + labelPadding.v * 2;
        setLabelSize(back, text, width, height);
        yDotLabel
            .transition()
            .duration(dur)
            .attr('transform', 'translate( ' +
                (-width - 6) + ', ' +
                (rescaledY(data[selectedDotIdx].y) - height * 0.5) +
                ')');

        labelLines[0]
            .transition()
            .duration(dur)
            .attr('x1', rescaledX(data[selectedDotIdx].x))
            .attr('x2', rescaledX(data[selectedDotIdx].x));

        labelLines[1]
            .transition()
            .duration(dur)
            .attr('y1', rescaledY(data[selectedDotIdx].y))
            .attr('y2', rescaledY(data[selectedDotIdx].y));
    }

    // little helper for both label-related functions
    function setLabelSize(back, text, width, height) {
        back
            .attr('width', width)
            .attr('height', height);
        text
            .attr('x', width * 0.5)
            .attr('y', height * 0.75);
    }
}