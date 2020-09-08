define(
    [
        'underscore',
        'models/services/data/inputs/BaseInputModel'
    ],
    function (
        _,
        BaseInputModel
    ) {
        return BaseInputModel.extend({
            url: "data/inputs/WinNetMon",
            validation: {
                'ui.name': [
                    {
                        required: true,
                        msg: _("Collection name is required.").t()
                    },
                    {
                        fn: 'checkInputExists'
                    }
                ],
                'ui.host': [
                    {
                        required: function() {
                            return this.wizard.get('currentStep') === 'inputsettings';
                        },
                        msg: _("Host value is required.").t()
                    }
                ]
            },
            initialize: function() {
                BaseInputModel.prototype.initialize.apply(this, arguments);

                this.on('change:ipv4 change:ipv6', function() {
                   var addressFamily = this.makeFlatList(['ipv4', 'ipv6']);
                   this.set('ui.addressFamily', addressFamily);
                }, this);

                this.on('change:connect change:accept change:transport', function() {
                    var packetType = this.makeFlatList(['connect', 'accept', 'transport']);
                    this.set('ui.packetType', packetType);
                }, this);

                this.on('change:inbound change:outbound', function() {
                    var direction = this.makeFlatList(['inbound', 'outbound']);
                    this.set('ui.direction', direction);
                }, this);

                this.on('change:tcp change:udp', function() {
                    var protocol = this.makeFlatList(['tcp', 'udp']);
                    this.set('ui.protocol', protocol);
                }, this);
            },

            makeFlatList: function(keys) {
                var res = [];
                _.each(keys, function(key) {
                    var val = this.get(key);
                    if (!_.isUndefined(val) && val === 1) {
                        res.push(key);
                    }
                }.bind(this));
                return res.join(';');
            }
        });
    }
);