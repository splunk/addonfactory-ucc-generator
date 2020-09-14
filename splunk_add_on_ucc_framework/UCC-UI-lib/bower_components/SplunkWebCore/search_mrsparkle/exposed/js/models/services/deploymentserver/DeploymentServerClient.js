define(
    [
        'models/SplunkDBase'
    ],
    function(SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
            url: "deployment/server/clients", 
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            },
            getPrettyOsName: function() {
                var os = this.entry.content.get('utsname');
                var prettyName = '';
                if (os.indexOf('windows') === 0) {
                    prettyName = 'WINDOWS';
                } else if (os.indexOf('linux') === 0) {
                    prettyName = 'LINUX';
                } else if (os.indexOf('darwin') === 0) {
                    prettyName = 'OS X';
                } else {
                    if (prettyName.indexOf('-')) {
                        prettyName = os.substring(0, os.indexOf('-')).toUpperCase();
                    } else {
                        prettyName = os.toUpperCase();
                    }
                }
                return prettyName;
            }
        });
    }
);
