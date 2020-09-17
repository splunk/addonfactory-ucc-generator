define(function(require){

    var Controller = require("./simplexml/controller");
    
    require("./simplexml/dashboardview");
    require("./simplexml/dashboard");
    require("./simplexml/dashboard/panelref");
    require("./simplexml/element/table");
    require("./simplexml/element/chart");
    require("./simplexml/element/event");
    require("./simplexml/element/single");
    require("./simplexml/element/map");
    require("./simplexml/element/list");
    require("./simplexml/element/html");
    require("./simplexml/element/visualization");
    require("./simplexml/urltokenmodel");
    require("./searchmanager");
    require("./savedsearchmanager");
    require("./postprocessmanager");
    require("./drilldown");
    require("./headerview");
    require("./footerview");
    require("./simpleform/formutils");
    require("./simplexml/eventhandler");
    require("./simplexml/searcheventhandler");
    require("./simpleform/input");
    require('./simpleform/input/submit');
    require('./simpleform/input/text');
    require('./simpleform/input/dropdown');
    require('./simpleform/input/radiogroup');
    require('./simpleform/input/linklist');
    require('./simpleform/input/timerange');
    require('./simpleform/input/checkboxgroup');
    require('./simpleform/input/multiselect');
    require("./utils");

    return Controller;
});