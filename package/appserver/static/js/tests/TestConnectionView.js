define([
    'jquery',
    'backbone',
    'app/views/Configuration/Connection',
    'app/views/Component/EntityDialog',
    'app/collections/Connections',
    'app/util/Util',
    'app/models/appData',
    'app/config/ComponentMap',
    'jasmine',
    'splunkjs/mvc/simplexml/ready!'
], function (
    $,
    Backbone,
    ConnectionView,
    EntityDialog,
    Connections,
    Util,
    appData,
    ComponentMap
) {
    describe("Connection", function(){
        var connectionView, dlg, model;
        beforeEach(function (done) {
            connectionView = new ConnectionView();
            dlg = new EntityDialog({
                el: $(".dialog-placeholder"),
                collection: connectionView.connections,
                component: ComponentMap.connection
            });

            model =  new Backbone.Model({});
            model.set("name", "test1");
            model.set("lea_app_name", "test");
            model.set("lea_server_auth_port", "18184");
            model.set("lea_server_ip", "test");
            model.set("one_time_password", "test");
            model.set("fw_version", "R77");

            dlg.model = model;
        });

        it("should contain Log Server Object Name field when the server type is secondary", function(){
            model.set("lea_server_type", "secondary");
            dlg.saveModel();

            expect(dlg.real_model.validationError).toBe('Field "Log Server Object Name" is required');
        });

        it("should contain Log Server Object Name field when the server type is dedicated", function(){
            model.set("lea_server_type", "dedicated");
            dlg.saveModel();

            expect(dlg.real_model.validationError).toBe('Field "Log Server Object Name" is required');
        });
    });

    describe("Connection creation", function () {
        var connectionView, dlg;
        beforeEach(function (done) {
            connectionView = new ConnectionView();
            dlg = new EntityDialog({
                el: $(".dialog-placeholder"),
                collection: connectionView.connections,
                component: ComponentMap.connection
            });

            setTimeout(function () {
                var model = new Backbone.Model({});
                model.set("name", "test2");
                model.set("lea_app_name", "lynchtest2");
                model.set("lea_server_auth_port", "18184");
                model.set("lea_server_ip", "10.66.128.17");
                model.set("lea_server_type", "primary");
                model.set("one_time_password", "123456");
                model.set("fw_version", "R77");

                dlg.model = model;

                dlg.saveModel().done(function () {
                    done();
                });
            }, 3000);
        });

        it("should be done successfully when the info is correct", function (done) {
            expect(dlg.collection.models.length).toBe(1);
            done();
        });
    });

    describe("Connection deletion", function () {
        var connections;
        beforeEach(function (done) {
            delete_url = "/en-US/splunkd/__raw/servicesNS/nobody/Splunk_TA_citrix-netscaler/ta_opseclea/ta_opseclea_cert/test2?output_mode=json";

            $.ajax({
                url: delete_url,
                type: 'DELETE'
            }).done(function () {
                //Collection
                connections = new Connections([], {
                    appData: {app: appData.get("app"), owner: appData.get("owner")},
                    targetApp: Util.getAddonName(),
                    targetOwner: "nobody"
                });
                connections.fetch().done(function(){
                    done();
                });
            });

        });

        it("should be done successfully when the info is correct", function (done) {
            expect(connections.models.length).toBe(0);
            done();
        });
    });
});
