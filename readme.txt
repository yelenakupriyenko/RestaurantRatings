when adding your own visualization you have to do the following:

1)  encapsule your visualization code like i did it in choropleth.js:

    // initilize the object
    // dataFilter is the most interesting thing here: in dataFilter.filteredData
    // you can allways find the current set of filteredData
    Choropleth = function(main, parent, geoJson, dataFilter) {
    ...
    };

    // create handlers for events here
    Choropleth.prototype.initListenerHandler = function() {
    ...
    };

    // initialize the visualization (happens only ones)
    Choropleth.prototype.initVisualization = function(geoJson) {
    ...
    };

    // create/update plot - this happens in the beginning and when ever
    // the filtered data changes
    Choropleth.prototype.visualize = function() {
    ...
    };

2)  add your visualizations at the end of main.js

3)  in filter_manager.js add your own filter function to subset the data
