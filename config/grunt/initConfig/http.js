module.exports = function (grunt) {
    return {
        reload: {
            options: {
                url: 'https://admin:<%= buildinfo.settings.adminPassword %>@localhost:8089/servicesNS/nobody/splunk_app_aws/apps/local/_reload',
                strictSSL: false
            }
        }
    };
};