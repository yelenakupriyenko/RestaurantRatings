Wordle = function(main, parent, dataFilter) {
    this.main = main;
    this.parent = parent;
    this.dataFilter = dataFilter;

    this.initListenerHandler();
    this.initVisualization();
    this.update();
    
    
};

Wordle.prototype.initListenerHandler = function() {
    var handler = function(e) {
        this.update()
    }.bind(this);

    SH.listenerMap['dataFiltered'].subscribe(handler);
};



//function filter_region (data, region_id){
//            if (data.district_id == region_id){
//                return data.district_id;
//            }
//        }

 Wordle.prototype.initVisualization = function() {

    //--------------------------------------------------------------
    //                    DATA PREPROCESSING
    //--------------------------------------------------------------
    //console.log(this.dataFilter.filteredData)
    
    this.dataFilter.filteredData.forEach(function(d) {
        d.rating = parseFloat(d.rating);
        d.review_count = parseInt(d.review_count);
        d.district_id = parseInt(d.district_id);
      });

//            var data_fil = dataFilter.filter(function(d){if (d.district_id == 18){
//                    return d.district_id;
//                    }});

    var district_data = d3.nest()
        .key(function(d,i) {return d.district_id;})
        .entries(this.dataFilter.filteredData);

    console.log("Initial data", district_data);

    var data_to_use = []
    for (i=0; i< district_data.length;i++) {
        var distr = district_data[i];
        for (j=0; j<distr.values.length;j++) {
            var rest = distr.values[j]
            for (k= 0; k < rest.categories.length; k++ ){
                data_to_use.push({
                    type: rest.categories[k][0]
                })
            }
        }
    };

    var rest_type_number = d3.nest()
        .key(function(d){return d.type})
        .rollup(function(v){return v.length})
        .entries(data_to_use);

    var sort_data = function (a, b) {
                return b.values - a.values;
            };

    console.log("Restaurants of the region",rest_type_number);


    //--------------------------------------------------------------
    //                          WORDLE
    //--------------------------------------------------------------

    //Code for Wordle is partly adapted from http://julienrenaux.fr/2014/09/23/d3-js-responsive-word-cloud/
    //by Julien Renaux.

    // define svg width and height
     var w = $(this.parent).width();
     var h = $(this.parent).height()*0.7;

//    var w = window.innerWidth,
//        h = 0.7*window.innerHeight;

    var max,
        fontSize;

    var fill = d3.scale.category20b();
     
    
    var layout = d3.layout.cloud()
            .timeInterval(Infinity)
            .size([w, h])
            .fontSize(function(d) {
                return fontSize(+d.values);
            })
            .text(function(d) {
                return d.key;
            })
            .on("end", draw);

    this.layout = layout; 
     
    var svg = d3.select(this.parent).append("svg")
            .attr("width", w)
            .attr("height", h);

    var vis = svg.append("g").attr("transform", "translate(" + [w >> 1, h >> 1] + ")");
    
    this.vis = vis

    function update(){
        layout.font('impact').spiral('archimedean');
        fontSize = d3.scale['pow']().range([5, 50]);

        if (rest_type_number.length){
            fontSize.domain([d3.min(rest_type_number, function (d){return d.values}) ||
                             1, d3.max(rest_type_number, function (d){return d.values})]);
        }
        layout.stop().words(rest_type_number).start();
    }

    update();

    function draw(data, bounds) {

        //console.log(bounds)
        scale = bounds ? Math.min(
                w / Math.abs(bounds[1].x - w / 1.5),
                w / Math.abs(bounds[0].x - w / 1.5),
                h / Math.abs(bounds[1].y - h / 1.5),
                h / Math.abs(bounds[0].y - h / 1.5)) /1.5 : 1;

        var text = vis.selectAll("text")
            .data(data, function(d) { return d.text.toLowerCase();})

        text.transition()
            .duration(1000)
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";})
            .style("font-size", function(d) {return d.size + "px";});

        var text_drawn = text.enter().append("text")
            .attr("text-anchor", "middle")
            .attr("class", function (d,i){ return "word"+d.values+d.key.replace(/[^0-9a-zA-Z]+/g,'');})
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";})
            .style("font-size", function(d) {return d.size + "px";})
            .style("opacity", 1)
            .on("mouseover", hightlight_word)
            .on('mouseleave', dehightlight_word);

//                text_drawn.transition()
//                    .duration(1000)
//                    .style("opacity", 1);

        text.style("font-family", function(d) {return d.font;})
            .style("fill", function(d) {return fill(d.text.toLowerCase());})
            .text(function(d) {return d.text;});

        vis.transition().attr("transform", "translate(" + [w >> 1, h >> 1] + ")scale(" + scale + ")");
    }


    //--------------------------------------------------------------
    //                     HISTOGRAM
    //--------------------------------------------------------------

    var w_hist = $(this.parent).width(),
        h_hist = $(this.parent).height()*0.3,
        margin = {top: 20, bottom: 20, left:20, right:20},

        padding = 1

    var svg_hist = d3.select(this.parent).append("svg")
        .attr("width", w_hist)
        .attr("height", h_hist)

    var vis_hist = svg_hist.append("g")
        .attr("transform", "translate(" + [margin.left, margin.top] + ")");

    var yScale = d3.scale.linear()
        .domain([0, d3.max(rest_type_number, function (d){return d.values})])
        .range([h_hist- margin.top - margin.bottom, 0])

    var max_val = d3.max(rest_type_number, function (d){return d.values});

    //Cut down the tail of small values
    var fil_data = rest_type_number.sort(sort_data).filter(function (d){
            if (d.values >= 0.1*max_val)
                {return d;}})

    //console.log(fil_data)

    var bar_width = Math.floor((w_hist-margin.left - margin.right)/fil_data.length)

    var rec = vis_hist.selectAll("rect")
        .data(fil_data)
        .enter()
        .append("rect")
        .attr("class", function (d,i){return "rect"+d.values+d.key.replace(/[^0-9a-zA-Z]+/g,'');})
        .attr("x", function (d,i) {return i*bar_width;})
        .attr("y", function (d) {return yScale(d.values);})
        .attr("width", bar_width - padding)
        .attr("height", function (d){return (h_hist - margin.top - margin.bottom) - yScale(d.values);})
        .attr("fill", "#a3a3a3")
        .on("mouseover", hightlight_rec)
        .on('mouseleave', dehightlight_rec);
    
    rec.transition()
            .duration(2000)
            .style("opacity", 1)


    vis_hist.selectAll("text")
        .data(fil_data)
        .enter()
        .append("text")
        .attr("class", function (d,i){return "text"+d.values+d.key.replace(/[^0-9a-zA-Z]+/g,'');})
        .text(function (d){return d.values;})
        .attr("x", function (d,i){return i*bar_width + bar_width/10;})
        .attr("y", function (d) {return  yScale(d.values) -2})
        .attr("fill", "white")
        .attr("font-size", bar_width*0.7 + "px")


    //--------------------------------------------------------------
    //                   INTERACTION BETWEEN THEM
    //--------------------------------------------------------------

    function hightlight_word(e,i){
        //console.log(e)
        //console.log(".rect"+e.values+e.key.replace(/[^0-9a-zA-Z]+/g,''))

        d3.select(".rect"+e.values+e.key.replace(/[^0-9a-zA-Z]+/g,''))
            .attr("fill", "yellow")
            .attr('stroke-width', 5)
            .attr("stroke", "yellow");

        d3.select(".text"+e.values +e.key.replace(/[^0-9a-zA-Z]+/g,''))
            .attr("fill", "black")

        //console.log(this)
        d3.select(this)
            .style("font-size", function (e){return 1.5*e.size + "px";})
    }    

    function dehightlight_word(e,i){
        //console.log(e)

        d3.select(".rect"+e.values+e.key.replace(/[^0-9a-zA-Z]+/g,''))
            .attr("fill", this.style.fill)
            .attr('stroke-width', 0);

        //console.log(this)
        d3.select(this)
            .style("font-size", function (e){return e.size + "px";})
    }  

    function hightlight_rec(e,i){
        //console.log(e)
        //console.log(".rect"+e.values+e.key.replace(/[^0-9a-zA-Z]+/g,''))

        d3.select(".word"+e.values+e.key.replace(/[^0-9a-zA-Z]+/g,''))
            .style("font-size", function (e){return 1.5*e.size + "px";})

        d3.select(".text"+e.values +e.key.replace(/[^0-9a-zA-Z]+/g,''))
            .attr("fill", "black")

        //console.log(this)
        d3.select(this)
            .attr("fill", "yellow")
            .attr('stroke-width', 5)
            .attr("stroke", "yellow");
    }    

    function dehightlight_rec(e,i){
        //console.log(e)

        var word = d3.select(".word"+e.values+e.key.replace(/[^0-9a-zA-Z]+/g,''))

        word.style("font-size", function (e){return e.size + "px";})

        d3.select(this)
            .attr("fill", word[0][0].style.fill)
            .attr('stroke-width', 0);
    }
}

     //--------------------------------------------------------------
    //                   UPDATE FUNCTION
    //--------------------------------------------------------------
 
 
 Wordle.prototype.update = function(){
 
    }
 