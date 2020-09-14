define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/Modal'
],
    function(
        $,
        _,
        Backbone,
        module,
        Modal
        ) {
        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME,
            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
                this.model.wizard.on('uploadSaveFileProgress', function(progress) {
                    this.updateProgressBar(progress, progress+'%', false);
                }, this);
            },
            render: function() {
                this.$el.html(this.compiledTemplate({}));
                return this;
            },
            updateProgressBar: function(progress, text, spin){
                if (progress === 100) {
                    text = _('Processing...').t();
                    spin = true;
                }
                var $bar = this.$('.progress-bar').css('width', progress+'%');
                $bar.find('.sr-only').html(text);

                if (spin === true) {
                    $bar.addClass('progress-striped active');
                } else if(spin === false) {
                    $bar.removeClass('progress-striped active');
                }
            },
            template: '<div class="uploadProgressDialog" style="padding:20px;"> \
                <h3>'+ _('Uploading File').t() +'</h3> \
                <div class="progress" style="width:100%"> \
                    <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">\
                        <span class="sr-only"></span>\
                    </div>\
                </div> \
            </div>'
        });
    });
