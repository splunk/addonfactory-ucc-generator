define(['splunkjs/mvc/basesplunkview'],function(BaseView){

    var MockDashboardView = BaseView.extend({
        removeElement: sinon.spy(),
        getChildContainer: function(){
            return this.$el;
        }
    });

    return MockDashboardView;
});