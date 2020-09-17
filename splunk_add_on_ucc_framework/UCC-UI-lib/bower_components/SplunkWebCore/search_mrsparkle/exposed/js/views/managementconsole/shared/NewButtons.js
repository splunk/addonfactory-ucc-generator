define([
        'underscore',
        'views/shared/basemanager/NewButtons'
    ],
    function (
        _,
        NewButtons
    ) {

        // This class extends basemanager/NewButtons by additionally
        // hiding and showing the buttons based on whether its
        // collection of DMC Entities allow creation (based on the user's capabilities)
        return NewButtons.extend({
            initialize: function() {
                NewButtons.prototype.initialize.apply(this, arguments);

                this.determineTemplate();
                this.listenTo(this.collection.entities, 'sync', this.onEntitiesSync);
            },

            onEntitiesSync: function() {
                this.determineTemplate();
                this.debouncedRender();
            },

            determineTemplate: function() {
                this.compiledTemplate = _.template(
                    this.collection.entities.canCreate() ?
                        this.template : this.cannotCreateTemplate
                );
            },

            cannotCreateTemplate: ''
        });
    }
);

