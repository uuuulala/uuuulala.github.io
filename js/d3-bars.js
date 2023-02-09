initD3Bars();

function initD3Bars() {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const levels = ['top', 'middle', 'bottom'];
    const color = d3.scaleOrdinal(['#4FA7FF', '#3E4756', '#A2ACBD']);
    let svg, axis, grid, curve, bars = [];

    const svgSize = { w: 800, h: 350 };
    const animationDuration = 1000;

    let x = d3.scaleBand();
    let y = d3.scaleLinear();
    let xAxis = d3.axisBottom();
    let yAxis = d3.axisLeft().ticks(5);
    let stack = d3.stack().keys(levels);
    let curveFunc = d3.line().curve(d3.curveBasis)
        .x((d) => x(d.month))
        .y((d) => y(d.height));

    svg = d3.select('.d3-bars svg');
    drawChart(randomData());
    d3.interval(() => {
        updateChart(randomData());
        }, 1000);

    function drawChart(data) {
        // Apply svg canvas size and add some padding
        svg.attr('viewBox', '-80 -30 ' + (svgSize.w + 100) + ' ' + (svgSize.h + 80));

        // Set chart scales
        x
            .range([0, svgSize.w])
            .domain(months);
        y
            .range([svgSize.h, 0])
            .domain([0, d3.max(data.map((d) => d.height)) * 1.1]);

        xAxis.scale(x);
        yAxis.scale(y);

        // Append grid
        grid = svg
            .append('g')
            .attr('class', 'grid')
            .call(d3
                .axisLeft(y)
                .ticks(5)
                .tickSize(-svgSize.w)
                .tickFormat('')
            );

        // Append bars
        levels.forEach(function (key, idx) {
            bars[idx] = svg
                .selectAll('.bar .bar-' + key)
                .data(stack(data)[idx])
                .enter()
                .append('rect')
                .attr('class', 'bar bar-' + key)
                .attr('x', (d) => x(d.data.month) + .25 * x.bandwidth())
                .attr('y', (d) => y(d[1]))
                .attr('height', (d) => (y(d[0]) - y(d[1])))
                .attr('width', .5 * x.bandwidth())
                .attr('fill', color(key))
                .attr('opacity', 0.9)
                .attr('stroke-width', 3)
                .attr('stroke', '#fff');
        });

        // Append line chart
        curve = svg
            .append('path')
            .data(data)
            .attr('d', curveFunc(data))
            .attr('stroke-width', '6')
            .attr('stroke', '#FE005E')
            .attr('stroke-linecap', 'round')
            .attr('fill', 'none')
            .attr('transform', 'translate(' + x(months[1]) * 0.5 + ', 0)');

        // Append both axes
        svg
            .append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + svgSize.h + ')')
            .call(xAxis);
        axis = svg
            .append('g')
            .attr('class', 'y axis')
            .call(yAxis);
    }

    // Update chart: animate Y axis, grid and levels
    function updateChart(data) {
        y.domain([0, d3.max(data.map((d) => d.height)) * 1.1]);
        yAxis.scale(y);
        axis
            .transition()
            .duration(animationDuration)
            .call(yAxis);
        grid
            .transition()
            .duration(animationDuration)
            .call(d3
                .axisLeft(y)
                .ticks(5)
                .tickSize(-svgSize.w)
                .tickFormat('')
            );
        levels.forEach(function (key, idx) {
            bars[idx]
                .data(stack(data)[idx])
                .transition()
                .duration(animationDuration)
                .attr('y', (d) => y(d[1]))
                .attr('height', (d) => (y(d[0]) - y(d[1])));
        });
        curve
            .transition()
            .duration(animationDuration)
            .attr('d', curveFunc(data))
    }

    // Generate new set of data
    function randomData() {
        return months.map((month, monthIdx) => {
            let obj = {
                month: month,
                height: 0,
            };
            levels.forEach((bar, idx) => {
                const barHeight = 600 + Math.random() * 300 * monthIdx + Math.random() * 1000 * idx;
                obj[bar] = barHeight;
                obj.height += barHeight;
            });
            return obj;
        });
    }
}