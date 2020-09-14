define([], function() {
    return {
        chart: {
            getView: function() { return require('splunkjs/mvc/chartview'); },
            editable: true
        },
        table: {
            getView: function() { return require('splunkjs/mvc/tableview'); },
            editable: true
        },
        single: {
            getView: function() { return require('splunkjs/mvc/singleview'); },
            editable: true
        },
        map: {
            getView: function() { return require('splunkjs/mvc/splunkmapview'); },
            editable: true
        },
        event: {
            managerDefaults: {
                status_buckets: 300
            },
            getView: function() { return require('splunkjs/mvc/eventsviewerview'); },
            editable: true
        },
        viz: {
            getView: function() { return require('splunkjs/mvc/visualizationview'); },
            editable: true
        }
    };
});
