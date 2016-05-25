DataFilter = function(data) {
    // deep copy data to 'data' and 'filteredData'
    this.data = jQuery.extend(true, [], data);
    this.filteredData = jQuery.extend(true, [], data);
    this.initListenerHandler();
};

DataFilter.prototype.initListenerHandler = function() {
    var handler = function(e) {
        switch (e.on) {
            case 'district':
                this.filterOnDistrict(e.filter);
                break;
            case 'category':
                this.filterOnCategory(e.filter);
                break;
            default:
                // do nothing
        }
    }.bind(this);

    SH.listenerMap['filterData'].subscribe(handler);
};

DataFilter.prototype.filterOnDistrict = function(districtId) {
    this.filteredData = this.filteredData.filter(function(item) {
        return item.district_id == districtId;
    });
    SH.listenerMap['dataFiltered'].fire();
};

DataFilter.prototype.filterOnCategory = function(category) {
    this.filteredData = this.filteredData.filter(function(item) {
        return category in item.categories;
    });
    SH.listenerMap['dataFiltered'].fire();
};
