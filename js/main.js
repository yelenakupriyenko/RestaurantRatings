// load json files
// when done: call ready function
var geoJsonFile = 'data/districts.geojson'
var yelpDataFile = 'data/yelp_preprocessed.json'
d3_queue.queue()
    .defer(d3.json, geoJsonFile)
    .defer(d3.json, yelpDataFile)
    .await(ready);

function ready(error, geoJson, yelpData) {
    // create listener 'filterData' to signal the need to filter data
    // firing the listener can look something like this:
    // SH.listenerMap['filterData'].fire({on: 'district', filter: d.id});
    new SH.Listener('filterData');

    // create listener 'dataFiltered' to signal that data has been filtered
    new SH.Listener('dataFiltered');

    // create new DataFilter - see file: filter_manager.js
    // has the attribute filteredData - there you can
    // find the current subset of data
    var dataFilter = new DataFilter(yelpData);

    // create visualizations
    var choropleth = new Choropleth(this, '#vis1', geoJson, dataFilter);
    var wordCloud = new Wordle(this, '#vis2', dataFilter);
    var scatterPlot = new Scatterplot(this, '#vis3', dataFilter);
    
}
