// Model for inputs meta
// This stores the display lable map
// for e.g. backend gives 'monitor' but we want to display 'files and directories'
// @author: nmistry
define([
    'jquery',
    'underscore',
    'backbone',
    'models/managementconsole/DmcBase'
], function (
    $,
    _,
    Backbone,
    DmcBaseModel
) {
    // This store information like rank & display title
    // for input types
    var META = {
        monitor:      { rank: 0, title: _('Files and directories').t(), description: _('Monitor files and directories.').t(), helpString: 'learnmore.fm.inputs.files' },
        tcp:          { rank: 1, title: _('TCP').t(), description: _('Configure a forwarder to listen on a TCP port for incoming data.').t(), helpString: 'learnmore.fm.inputs.tcp' },
        udp:          { rank: 2, title: _('UDP').t(), description: _('Configure a forwarder to listen on a UDP port for incoming data.').t(), helpString: 'learnmore.fm.inputs.udp' },
        http:         { rank: 3, title: _('HTTP Event Collector').t(), description: _('Configure a heavy forwarder to receive data over HTTP or HTTPS.').t(), helpString: 'learnmore.fm.inputs.httpec' },
        script:       { rank: 4, title: _('Scripted Input').t(), description: _('Get data from from any API, service, or database with a script installed on your forwarder.').t(), helpString: 'learnmore.fm.inputs.scripted' },
        wineventlog:  { rank: 5, title: _('Windows Event Logs').t(), description: _('Collect event logs from Windows forwarders.').t(), helpString: 'learnmore.fm.inputs.WEL' },
        perfmon:      { rank: 6, title: _('Windows Performance Monitoring').t(), description: _('Collect performance data from Windows forwarders.').t(), helpString: 'learnmore.fm.inputs.perfmon' }
    };
    var LARGERANK = 10000;
    return DmcBaseModel.extend({
        url: '/services/dmc/configs/inputs-meta',

        initialize: function () {
            DmcBaseModel.prototype.initialize.apply(this, arguments);
            this.setMeta();
            this.listenTo(this.entry, 'change:name', this.setMeta);
        },

        setMeta: function () {
            var id = this.getId();
            var meta = _.has(META, id) ? META[id] : { rank: LARGERANK++, title: id };
            this.set(meta, {silent: true});
        },

        getCount: function () {
            return this.entry.content.get('count');
        },

        getId: function () {
            return this.entry.get('name');
        },

        getDisplayName: function () {
            return this.get('title');
        },

        getHelpString: function () {
            return this.get('helpString');
        },

        getDescription: function () {
            return this.get('description');
        }
    });
});
