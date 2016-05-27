Scatterplot = function(main, parent, dataFilter) {
    this.main = main;
    this.parent = parent;
    this.dataFilter = dataFilter;

    this.initListenerHandler();
    this.initVisualization();
    this.update();
};

Scatterplot.prototype.initListenerHandler = function() {
    var handler = function(e) {
        this.visualize()
    }.bind(this);

    SH.listenerMap['dataFiltered'].subscribe(handler);
};

Scatterplot.prototype.update = function() {};

Scatterplot.prototype.update = function() {
		if ($(parent).find('svg')) {
			$(parent).find('svg').remove():
		}

    (this.dataFilter.filteredData).forEach(function(d) {
        d.rating = parseFloat(d.rating);
        d.review_count = parseInt(d.review_count);
        d.district_id = parseInt(d.district_id);
    });

    var district_data = d3.nest()
        .key(function(d, i) {
            return d.district_id;
        })
        .entries(this.dataFilter.filteredData);

    console.log("Initial data", district_data);

    // grouping
    var grouped_data = d3.nest()
        .key(function(d, i) {
            if (d.review_count <= Math.ceil(d.review_count / 100) * 100 && d.review_count >=
                Math.floor(d.review_count / 100) * 100) {
                return Math.ceil(d.review_count / 100) * 100;
            }
        })
        .rollup(function(v) {
            return {
                avg_rating: Math.round((d3.mean(v, function(d) {
                    return d.rating;
                })) * 1000) / 1000,
                number_of_rest: v.length
            };
        })
        .entries(this.dataFilter.filteredData);
    console.log("Grouped data", grouped_data);

    // data that will be used for scatter plot: array of arrays
    var scatterplot_data = []
    for (i = 0; i < grouped_data.length; i++) {
        var val = grouped_data[i].values;
        scatterplot_data.push(
            [parseInt(grouped_data[i].key), val.avg_rating, val.number_of_rest])
    }
    console.log("Scatterplot data", scatterplot_data);

    // define svg width and height
    var w = $(this.parent).width();
    var h = $(this.parent).height();

    var margin = {
            top: 10,
            right: 100,
            bottom: 60,
            left: 60
        },
        width = w,
        height = h;

    var x = d3.scale.linear()
        .domain([0, d3.max(scatterplot_data, function(d) {
            return d[2];
        })])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, d3.max(scatterplot_data, function(d) {
            return d[0];
        })])
        .range([height, 0]);

    var chart = d3.select(this.parent)
        .append('svg:svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .attr('class', 'chart')

    var main = chart.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'main')

    // draw the x axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    main.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'main axis date')
        .call(xAxis)
        // add the label
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Number of Restaurants");

    // draw the y axis
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left').ticks(10).tickFormat(function(i, d) {
            return ['<100', '101-200', '201-300', '301-400', '401-500', '501-600', '601-700', '701-800', '801-900', '>900'][d];
        });

    main.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'main axis date')
        .call(yAxis)
        // add the label
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Number of reviews");

    var g = main.append("svg:g");

    g.selectAll("scatter-dots")
        .data(scatterplot_data)
        .enter().append("svg:circle")
        .attr("cx", function(d, i) {
            return x(d[2]);
        })
        .attr("cy", function(d) {
            return y(d[0]);
        })
        .attr("r", function(d) {
            return d[1];
        });
};

//$('svg circle').tipsy( {
//gravity: 'w',
//html: true,
//title: function() {
//       var d = this.__scatterplot_data__, d = d[2];
//         };