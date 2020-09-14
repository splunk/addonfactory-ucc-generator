// Windows Performance Monitoring log model input
// @author: rtran
define([
    'jquery',
    'underscore',
    'backbone',
    'models/managementconsole/inputs/Base',
    'views/managementconsole/utils/string_utils'
], function (
    $,
    _,
    Backbone,
    InputsBaseModel,
    string_utils
) {
    var additionalValueDecorators = {
        instances: function(field) {
            var instances = this.entry.content.get(field);
            if (_.isString(instances)) {
                return instances.split(',');
            }
            return InputsBaseModel.STRINGS.NOT_SET;
        }
    };

    var fwdObjects = ['Processor','LogicalDisk','Memory','Network','PhysicalDisk','Process','System'];

    var fwdAvailableCounters = {
        'Processor': ['% Processor Time','% User Time','% Privileged Time','Interrupts/sec','% DPC Time','% Interrupt Time','DPCs Queued/sec','DPC Rate','% Idle Time','% C1 Time','% C2 Time','% C3 Time','C1 Transitions/sec','C2 Transitions/sec','C3 Transitions/sec'],
        'LogicalDisk': ['% Free Space', 'Free Megabytes', 'Current Disk Queue Length', '% Disk Time', 'Avg. Disk Queue Length', '% Disk Read Time', 'Avg. Disk Read Queue Length', '% Disk Write Time', 'Avg. Disk Write Queue Length', 'Avg. Disk sec/Transfer', 'Avg. Disk sec/Read', 'Avg. Disk sec/Write', 'Disk Transfers/sec', 'Disk Reads/sec', 'Disk Writes/sec', 'Disk Bytes/sec', 'Disk Read Bytes/sec', 'Disk Write Bytes/sec', 'Avg. Disk Bytes/Transfer', 'Avg. Disk Bytes/Read', 'Avg. Disk Bytes/Write', '% Idle Time', 'Split IO/Sec'],
        'PhysicalDisk': ['Current Disk Queue Length', '% Disk Time', 'Avg. Disk Queue Length', '% Disk Read Time', 'Avg. Disk Read Queue Length', '% Disk Write Time', 'Avg. Disk Write Queue Length', 'Avg. Disk sec/Transfer', 'Avg. Disk sec/Read', 'Avg. Disk sec/Write', 'Disk Transfers/sec', 'Disk Reads/sec', 'Disk Writes/sec', 'Disk Bytes/sec', 'Disk Read Bytes/sec', 'Disk Write Bytes/sec', 'Avg. Disk Bytes/Transfer', 'Avg. Disk Bytes/Read', 'Avg. Disk Bytes/Write', '% Idle Time', 'Split IO/Sec'],
        'Memory': ['Page Faults/sec', 'Available Bytes', 'Committed Bytes', 'Commit Limit', 'Write Copies/sec', 'Transition Faults/sec', 'Cache Faults/sec', 'Demand Zero Faults/sec', 'Pages/sec', 'Pages Input/sec', 'Page Reads/sec', 'Pages Output/sec', 'Pool Paged Bytes', 'Pool Nonpaged Bytes', 'Page Writes/sec', 'Pool Paged Allocs', 'Pool Nonpaged Allocs', 'Free System Page Table Entries', 'Cache Bytes', 'Cache Bytes Peak', 'Pool Paged Resident Bytes', 'System Code Total Bytes', 'System Code Resident Bytes', 'System Driver Total Bytes', 'System Driver Resident Bytes', 'System Cache Resident Bytes', '% Committed Bytes In Use', 'Available KBytes', 'Available MBytes', 'Transition Pages RePurposed/sec', 'Free & Zero Page List Bytes', 'Modified Page List Bytes', 'Standby Cache Reserve Bytes', 'Standby Cache Normal Priority Bytes', 'Standby Cache Core Bytes', 'Long-Term Average Standby Cache Lifetime (s)'],
        'Network': ['Bytes Total/sec', 'Packets/sec', 'Packets Received/sec', 'Packets Sent/sec', 'Current Bandwidth', 'Bytes Received/sec', 'Packets Received Unicast/sec', 'Packets Received Non-Unicast/sec', 'Packets Received Discarded', 'Packets Received Errors', 'Packets Received Unknown', 'Bytes Sent/sec', 'Packets Sent Unicast/sec', 'Packets Sent Non-Unicast/sec', 'Packets Outbound Discarded', 'Packets Outbound Errors', 'Output Queue Length', 'Offloaded Connections', 'TCP Active RSC Connections', 'TCP RSC Coalesced Packets/sec', 'TCP RSC Exceptions/sec', 'TCP RSC Average Packet Size'],
        'Process': ['% Processor Time', '% User Time', '% Privileged Time', 'Virtual Bytes Peak', 'Virtual Bytes', 'Page Faults/sec', 'Working Set Peak', 'Working Set', 'Page File Bytes Peak', 'Page File Bytes', 'Private Bytes', 'Thread Count', 'Priority Base', 'Elapsed Time', 'ID Process', 'Creating Process ID', 'Pool Paged Bytes', 'Pool Nonpaged Bytes', 'Handle Count', 'IO Read Operations/sec', 'IO Write Operations/sec', 'IO Data Operations/sec', 'IO Other Operations/sec', 'IO Read Bytes/sec', 'IO Write Bytes/sec', 'IO Data Bytes/sec', 'IO Other Bytes/sec', 'Working Set - Private'],
        'System': ['File Read Operations/sec', 'File Write Operations/sec', 'File Control Operations/sec', 'File Read Bytes/sec', 'File Write Bytes/sec', 'File Control Bytes/sec', 'Context Switches/sec', 'System Calls/sec', 'File Data Operations/sec', 'System Up Time', 'Processor Queue Length', 'Processes', 'Threads', 'Alignment Fixups/sec', 'Exception Dispatches/sec', 'Floating Emulations/sec', '% Registry Quota In Use']
    };
    var currentStep = 0;

    var STANZA_NAME_PREFIX = 'perfmon://';

    var InputModel = InputsBaseModel.extend({
        url: '/perfmon',

        initialize: function() {
            InputsBaseModel.prototype.initialize.apply(this, arguments);
            this.valueDecorators = $.extend(true, {}, this.valueDecorators, additionalValueDecorators);

            this._documentationType = 'perfmon';
        },

        getStanzaName: function() {
            return STANZA_NAME_PREFIX + this.entry.get('name');
        },

        getReviewFields: function() {
            return [
                'name',
                'object',
                'counters',
                'instances',
                'interval',
                'index',
                'bundle'
            ];
        },

        getObjects: function() {
            return fwdObjects;
        },

        getCountersForObject: function(object) {
            return fwdAvailableCounters[object];
        },

        /**
         * Parse array of instance values to a comma separated string
         */
        parse: function(response) {
            if (!response.entry) return;
            var responseObj = response.entry[0];

            responseObj.content.instances = (_.has(responseObj.content, 'instances') && _.isArray(responseObj.content.instances)) ? responseObj.content.instances.join() : responseObj.content.instances; // need to join array for instances

            return InputsBaseModel.prototype.parse.call(this, response);
        },

        /**
         * Prepare data into the following format to be sent to the server:
         * instances - from comma delimited string to an array of values
         * interval - from string to integer (e.i. "10" -> 10)
         * @param postData
         * @returns {*}
         */
        formatDataToPOST: function(postData) {
            var convertStringToInteger = function(field) {
                var string = postData[field];
                return parseInt(string, 10);
            };

            var instances = postData['instances'];

            var transformedInterval = convertStringToInteger('interval');
            var transformedInstances = _.isString(instances) ? instances.split(',') : undefined;

            var setIfValid = function(field, value) {
                if (!_.isUndefined(value) && !_.isNaN(value)) {
                    postData[field] = value;
                }
            };

            setIfValid('interval', transformedInterval);
            setIfValid('instances', transformedInstances);

            return postData;
        },

        // saves the step # in model's outer scope
        setStep: function(step) {
            currentStep = step;
        }
    });

    InputModel.Entry = InputModel.Entry.extend({
        validation: {
            'name': [
                {
                    required: true,
                    msg: _('Collection name is required').t()
                }
            ]
        }
    });

    InputModel.Entry.Content = InputModel.Entry.Content.extend({
        validation: function() {
            if (currentStep === 0) {
                return {
                    'object': [
                        {
                            required: true,
                            msg: _('Object name is required.').t()
                        }
                    ],
                    'counters': [
                        {
                            required: true,
                            msg: _('Counters must be selected.').t()
                        }
                    ],
                    'interval': [
                        {
                            required: true,
                            msg: _('Interval is required.').t()
                        }
                    ]
                };
            } else if (currentStep === 1) {
                return {
                    'index': [
                        {
                            required: true,
                            msg: _('Index is required.').t()
                        }
                    ]
                };
            }
            return {};
        }
    });

    InputModel.Entry.ACL = InputModel.Entry.ACL.extend({
        validation: function () {
            if (currentStep === 2) {
                return {
                    'app': 'validateAclBundle'
                };
            }
            return {};
        }
    });

    return InputModel;
});
