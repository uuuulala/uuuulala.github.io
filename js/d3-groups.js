const d3Groups = document.querySelector('.d3-groups');
initD3Groups();

function initD3Groups() {
    const width = 500, height = 100, radius = 4;
    const center = { x: width / 2, y: height / 2 };
    const titles = d3.selectAll('.d3-groups .title');

    // generate random array of objects
    let nodes = Array.from({length: 50}, () => {
        return {
            radius: radius,
            side: Math.random() < 0.35 ? 'left' : 'right',
            x: 0.2 * width + Math.random() * 0.6 * width,
            y: 0.2 * height + Math.random() * 0.6 * height
        }
    });

    // create <svg> element and set its coordinates
    const svg = d3.select('.d3-groups svg')
        .attr('viewBox', '0 0 ' + width + ' ' + height);

    // generate circles
    let bubbles = svg
        .selectAll('.bubble')
        .data(nodes, (d) => d)
        .enter()
        .append('circle')
        .attr('r', 0)
        .attr('fill', (d) => {
            if (d.side === 'left') {
                return 'hsl(' + (Math.random() * 100) + ', 60%, 40%)'
            } else {
                return 'hsl(' + (100 + Math.random() * 100) + ', 60%, 40%)'
            }
        });

    // nodes appear animation (circles size from zero to final size)
    bubbles
        .transition().duration(500).attr('r', (d) => d.radius);

    // define force layout
    let simulation = d3.forceSimulation()
        .velocityDecay(0.23)
        .force('x', d3.forceX().strength(0.03).x(center.x))
        .force('y', d3.forceY().strength(0.03).y(center.y))
        .force('charge', d3.forceManyBody().strength(-1))
        .on('tick', () => {
            bubbles
                .attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y);
        })
        .nodes(nodes)
        .stop();

    // toggle layout functions
    function groupBubbles() {
        simulation.force('x', d3.forceX().strength(0.03).x(center.x));
        simulation.alpha(2).restart();
        titles.transition().duration(300).style('opacity', 0);
    }
    function splitBubbles() {
        simulation.force('x', d3.forceX().strength(0.03).x((d) => {
            return d.side === 'left' ? width * 0.25 : width * 0.75;
        }));
        simulation.alpha(2).restart();
        titles.transition().duration(300).style('opacity', 1);
    }

    // switch layout on click
    let grouped = true;
    d3Groups.onclick = () => {
        switchLayout();
    };

    gsap.timeline({
        scrollTrigger: {
            trigger: d3Groups,
            start: '0% 50%',
            end: '100% 50%',
            onEnter: () => {
                svg.style('opacity', 1);
                switchLayout();
            },
            onEnterBack: () => {
                svg.style('opacity', 1);
                switchLayout();
            }
        }
    });

    function switchLayout() {
        grouped = !grouped;
        if (grouped) {
            groupBubbles();
        } else {
            splitBubbles();
        }
    }
}
