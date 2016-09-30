define([
    'jquery',
    'backbone',
    'app/views/Pages/InputsPage',
    'app/views/Component/EntityDialog',
    'app/collections/Inputs',
    'app/util/Util',
    'app/models/appData',
    'app/config/ComponentMap',
    'jasmine',
    'splunkjs/mvc/simplexml/ready!'
], function (
    $,
    Backbone,
    InputsPageView,
    EntityDialog,
    Inputs,
    Util,
    appData,
    ComponentMap
) {
    describe("Input", function(){
        var inputsView;
        beforeEach(function (done) {
            inputsView = new InputsPageView();
            inputsView.connections_deferred.done(function(){
                inputsView.render();
                setTimeout(function(){
                    done();
                }, 3000);
            });
        });

        it("should give prompt when there is no connection", function(done){
            if (inputsView.connections.models.length === 0) {
                expect(inputsView.$(".noConnection p").text()).toBe("No inputs. Create a connection before creating an input.");
                done();
            } else {
                expect(inputsView.$("#addInputBtn").text().trim()).toBe("Create New Input");
                done();
            }
        });
    });

    describe("Input model", function () {
        var inputsView, dlg, model;
        beforeEach(function (done) {
            inputsView = new InputsPageView();

            inputsView.render();
            setTimeout(function(){
                dlg = new EntityDialog({
                    el: $(".dialog-placeholder"),
                    collection: inputsView.inputs,
                    component: ComponentMap.input.services.input
                });

                model = new Backbone.Model({});
                model.set("name", "input_unit_test");
                model.set("connection", "test");
                model.set("data", "non_audit");
                model.set("index", "default");
                model.set("interval", "3600");
                model.set("mode", "offline");

                dlg.model = model;
                done();
            }, 3000);
        });

        it("should have valid start time format", function (done) {
            model.set("starttime", "20160501");
            dlg.saveModel();
            expect(dlg.real_model.validationError).toBe('Field "Start Time" is not in format: yyyyMMddHHmmss');
            done();
        });
    });

    describe("Input creation", function () {
        var inputsView, dlg;
        beforeEach(function (done) {
            inputsView = new InputsPageView();

            inputsView.render();
            setTimeout(function(){
                dlg = new EntityDialog({
                    el: $(".dialog-placeholder"),
                    collection: inputsView.inputs,
                    component: ComponentMap.input.services.input
                });

                var model = new Backbone.Model({});
                model.set("name", "input_unit_test");
                model.set("connection", "test");
                model.set("data", "non_audit");
                model.set("index", "default");
                model.set("interval", "3600");
                model.set("mode", "offline");

                dlg.model = model;

                var deferred = dlg.saveModel();
                deferred.done(function () {
                    done();
                });
            }, 3000);
        });

        it("should be done successfully with correct information", function (done) {
            expect(dlg.collection.models.length).toBe(1);
            done();
        });
    });

    describe("Input deletion", function () {
        var inputs;
        beforeEach(function (done) {
            delete_url = "/en-US/splunkd/__raw/servicesNS/nobody/Splunk_TA_citrix-netscaler/ta_opseclea/ta_opseclea_input/input_unit_test?output_mode=json";

            $.ajax({
                url: delete_url,
                type: 'DELETE'
            }).done(function () {
                //Collection
                inputs = new Inputs([], {
                    appData: {app: appData.get("app"), owner: appData.get("owner")},
                    targetApp: Util.getAddonName(),
                    targetOwner: "nobody"
                });
                inputs.fetch().done(function(){
                    done();
                });
            });
        });

        it("should be done successfully when the info is correct", function (done) {
            expect(inputs.models.length).toBe(0);
            done();
        });
    });
});
