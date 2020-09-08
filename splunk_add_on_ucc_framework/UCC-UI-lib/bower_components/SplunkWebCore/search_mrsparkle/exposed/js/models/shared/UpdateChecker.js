define(
    [
        'jquery',
        'underscore',
        'backbone',
        'uri/route',
        'models/Base'
    ],
    function($, _, Backbone, route, BaseModel){
        var Model = BaseModel.extend(
            {
                windowVariableName: 'spotParams',
                windowCallbackName: 'displaySpot',
                url: '',
                initialize: function() {
                    BaseModel.prototype.initialize.apply(this, arguments);
                    if (!window[this.windowCallbackName]) {
                        window[this.windowCallbackName] = function(){};
                    }
                },
                sync: function(method, model, options) {
                    if (method!=='read') {
                        throw new Error('invalid method: ' + method);
                    }
                    options = options || {};
                    var defaults = {
                            data: {},
                            dataType: 'script'
                        },
                        url = _.result(model, 'url') || model.id;
                    defaults.url = url;
                    $.extend(true, defaults, options);
                    return Backbone.sync.call(this, method, model, defaults);
                },
                parse: function(response, options) {
                    response = window[this.windowVariableName] || {};
                    return response;
                },
                fetchHelper: function(serverInfoModel, webConfModel, applicationModel, userModel, checkerLocation, uid, options) {
                    options = options || {};

                    var licenseLabels,
                        licenseDesc = 'pro',
                        roles = (userModel.entry.content.get('roles')) ? userModel.entry.content.get('roles').join(',') : 'unknown',
                        licenseGroup = serverInfoModel.entry.content.get('activeLicenseGroup') || 'unknown',
                        userCapabilities = userModel.entry.content.get('capabilities') || '',
                        roleAdminEquivalent = (userCapabilities.indexOf('admin_all_objects') > -1),
                        licenseGuids = (serverInfoModel.entry.content.get('licenseKeys')) ? serverInfoModel.entry.content.get('licenseKeys').join(',') : 'unknown',
                        guid = serverInfoModel.entry.content.get('guid'),
                        masterGuid = serverInfoModel.entry.content.get('master_guid'),
                        isFree = serverInfoModel.isFreeLicense(),
                        isTrial = serverInfoModel.isTrial(),

                        defaults = {
                            url: route.updateChecker(
                                webConfModel.entry.content.get('updateCheckerBaseURL'), 
                                isFree,
                                serverInfoModel.getVersion(),
                                checkerLocation,
                                isTrial,
                                guid,
                                masterGuid
                            ),
                            data: {
                                locale: applicationModel.get('locale'),
                                cpu_arch: serverInfoModel.entry.content.get('cpu_arch'),
                                os_name: serverInfoModel.entry.content.get('os_name'),
                                guid: serverInfoModel.entry.content.get('guid'),
                                product: serverInfoModel.entry.content.get('product_type'),
                                uid: uid,
                                instance_type: serverInfoModel.entry.content.get('instance_type') || 'download',
                                roles: roles,
                                license_group: licenseGroup,
                                role_admin_equivalent: roleAdminEquivalent,
                                license_guids: licenseGuids,
                                splunk_version: serverInfoModel.entry.content.get('version')
                            }
                        };

                    if (isFree) {
                        licenseDesc = 'free';
                    } else if (!isTrial && guid === masterGuid) {
                        licenseLabels = _.uniq(serverInfoModel.entry.content.get('license_labels') || []).slice(0,3);
                        if (licenseLabels.length) {
                            licenseDesc = licenseLabels.join(',');
                        }
                    }
                    defaults.data.license_desc = licenseDesc;
                    return this.fetch($.extend(true, defaults, options));
                }
            }
        );
        return Model;
    }
);
