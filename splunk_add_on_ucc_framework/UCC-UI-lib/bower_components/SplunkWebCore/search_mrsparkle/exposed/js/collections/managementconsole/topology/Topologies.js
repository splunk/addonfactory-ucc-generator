/**
 *  Topology collection
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/managementconsole/topology/Topology',
        'collections/SplunkDsBase'
    ],
    function(
        $,
        _,
        Backbone,
        TopologyModel,
        SplunkDsBaseCollection
    ) {
        return SplunkDsBaseCollection.extend({
                model: TopologyModel,
                url: '/services/dmc/topologies'
            }
        );
    }
);