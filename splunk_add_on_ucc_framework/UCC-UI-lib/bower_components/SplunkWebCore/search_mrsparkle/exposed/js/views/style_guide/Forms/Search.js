define(
    [
        'underscore',
        'jquery',
        'module',
        'models/Base',
        'views/Base',
        'views/shared/FindInput',
        'views/shared/controls/ControlGroup',
       '../Master.pcss'
    ],
    function(
        _,
        $,
        module,
        BaseModel,
        BaseView,
        FindInputView,
        ControlGroup,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,
            events: {
                'click .content a': function(e) {
                    e.preventDefault();
                }
            },
            initialize: function() {
                // Dummy model
                this.model = new BaseModel({
                });
                this.children.searchingView = new ControlGroup({
                    className: 'form-horizontal',
                    controls: [
                        new FindInputView({
                            model: this.model,
                            modelAttribute: 'searchInput'
                        })
                    ],
                    label: _('Search Input').t()
                });
            },
            render: function() {
                // Renders each child view
                this.eachChild(function(view) {
                     view.render().appendTo(this.$el);
                },this);
                return this;
            }
        });
    }


);
