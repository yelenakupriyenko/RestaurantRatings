VisTwo = function(main, data) {
    this.main = main;
    this.data = data;
};

VisTwo.prototype.visualize = function(parent) {
    // define margin
    var margin = {
        top: 20,
        bottom: 30,
        left: 30,
        right: 20
    }

    // define svg width and height
    var width = 650;
    var height = 300;

    // create svg
    var svg = d3.select(parent)
        .append('svg')
        .attr("width", width)
        .attr("height", height)
        .style("background-color", "#000000")
        .append("g")
        .attr("transform", "translate(" + [margin.left, margin.top] + ")");

    // define scales
    var xScale = d3.scale.linear()
        .domain([0, 100])
        .range([0, width - margin.left - margin.right]);

    var yScale = d3.scale.linear()
        .domain([0, 100])
        .range([height - margin.top - margin.bottom, 0]);


    // draw scatterplot
    var circles = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", function(d, i) { /* EXTENSION FOR BRUSHING & LINKING */
            return "dottwo_" + d.c + " dottwo_" + d.id;
        })
        .attr("cx", function(d) {
            return xScale(d.x);
        })
        .attr("cy", function(d) {
            return yScale(d.y);
        })
        .attr("r", "5")
        .attr("fill", "orange")
        .attr("opacity", 0.5);

    // define the axes
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    // draw axes
    svg.append("g").attr("class", "axis")
        .attr("transform", "translate(" + [0, height - margin.top - margin.bottom] + ")")
        .call(xAxis)
        .append("text")
        .attr("x", width - margin.left - margin.right)
        .attr("y", -5)
        .style("text-anchor", "end")
        .text("X-Axis");

    svg.append("g").attr("class", "axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "translate(10, 0)rotate(-90)")
        .style("text-anchor", "end")
        .text("Y-Axis");

    // colormap for the dots
    var color = d3.scale.ordinal()
        .domain(classes)
        .range(["orange", "magenta", "cyan", "lime"]);

    // apply fill
    circles.attr("fill", function(d) {
        return color(d.c);
    });

    // add mouse over interaction
    circles.on("mouseover", function(e) {
        d3.select(this)
            .attr("fill", "white")
            .attr("r", "10");
        
        /* BRUSHING + LINKING via Listener */
        SH.listenerMap['test'].fire({hover: true, obj: e});
        
    }).on("mouseout", function(e) {
        d3.select(this)
            .attr("fill", color(e.c))
            .attr("r", "5");
        
        /* BRUSHING + LINKING via Listener */
        SH.listenerMap['test'].fire({hover: false, obj: e});
    });

    // click interaction
    circles.on("click", function(e) {
        alert("Selected Class: " + e.c);
    });
};