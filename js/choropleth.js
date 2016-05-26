Choropleth = function(main, parent, geoJson, dataFilter) {
    this.main = main;
    this.parent = parent;
    this.geoJson = geoJson;
    this.dataFilter = dataFilter;

    this.initListenerHandler();
    this.initVisualization();
    this.visualize();
};

// create handler for listener
Choropleth.prototype.initListenerHandler = function() {
    var handler = function(e) {
        this.visualize()
    }.bind(this);

    SH.listenerMap['dataFiltered'].subscribe(handler);
};

Choropleth.prototype.initVisualization = function(geoJson) {
    // define margin
    var margin = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }

    // define svg width and height
    var width = $(this.parent).width();
    var height = $(this.parent).height();

    // create svg
    var svg = d3.select(this.parent)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create a unit projection
    // the projection maps coordinates into x,y-values for the svg element
    var projection = d3.geo.albers()
        .scale(1)
        .translate([0, 0]);

    // Create a path generator
    // the generator creates a SVG path from geoJson Items
    var path = d3.geo.path()
        .projection(projection);

    // Create scale for coloring districts according to data
    // the scale will map numeric values to one of the color values
    var color = d3.scale.quantize()
        .range([
            'rgb(247,252,245)', 'rgb(229,245,224)', 'rgb(199,233,192)',
          	'rgb(161,217,155)', 'rgb(116,196,118)', 'rgb(65,171,93)',
            'rgb(35,139,69)', 'rgb(0,109,44)', 'rgb(0,68,27)'
        ]);

    // Compute the bounds of the geoJson map, then derive scale & translate.
    var b = path.bounds(this.geoJson),
        s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    // Update the projection to use computed scale & translate.
    projection
        .scale(s)
        .translate(t);

    // Add paths to SVG element
    var paths = svg.selectAll('path')
        .data(this.geoJson.features)
        .enter()
        .append('path')

    // set path attributes
    paths
        .attr('d', path)
        .style('stroke', 'black')
        .style('stroke-width', '.1')

    // add interactivity
    paths
        .on('mouseover', function(d) {
            d3.select(this)
                .append('title')
                .text((d, i) => {
                    return 'ID: ' + d.id;
                });
        })
        .on('click', function(d) {
            SH.listenerMap['filterData'].fire({
                on: 'district',
                filter: d.id
            });
        });

    this.color = color;
    this.paths = paths;
};

Choropleth.prototype.visualize = function() {
    console.log("visualize");
    // calculate mean ratings for districts
    var meanRatings = d3.nest()
        .key(function(d) {
            return d.district_id;
        })
        .rollup(function(v) {
            return d3.mean(v, function(d) {
                return d.rating;
            });
        })
        .map(this.dataFilter.filteredData);

    // set the color scale's input domain
    minMeanRating = d3.min(d3.values(meanRatings))
    maxMeanRating = d3.max(d3.values(meanRatings))
    this.color.domain([minMeanRating, maxMeanRating]);

    // set path colors
    this.paths
        .attr('fill', (d, i) => {
            if (d.id in meanRatings) {
                return this.color(meanRatings[d.id]);
            } else {
                return '#ccc';
            }
        });
};
