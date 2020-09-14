/**
 * @author jszeto
 * @date 5/28/14
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/dialogs/DialogBase'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        DialogBase
        ) {

        return DialogBase.extend({
            moduleId: module.id,
            className: "modal fade modal-wide",

            initialize: function(options) {
                DialogBase.prototype.initialize.call(this, options);

                this.bodyClassName = "modal-body-scrolling";

                this.settings.set("primaryButtonLabel", _("Open in Data Preview").t());
                this.settings.set("cancelButtonLabel", _("Close").t());
                this.settings.set("titleLabel", _("Preview File").t());
            },

            /**
             * Called when the save button is pressed
             */
            primaryButtonClicked: function() {
                DialogBase.prototype.primaryButtonClicked.apply(this, arguments);

                this.trigger("openInPreview");
            },

            renderBody : function($el) {
                //console.log("AddExtractedFieldsDialog.renderBody fieldTable",this.children.fieldTable);
                var html = _(this.bodyTemplate).template({});
                $el.html(html);
//                $el.find(".flash-messages-placeholder").append(this.children.flashMessagesView.render().el);
            },


            bodyTemplate: '\
            <div style="margin-bottom: 10px">\
                <button class="btn"><<</button>\
                Page <input type="text" value="1" style="width:30px; margin-bottom:0px"/> of 10\
                <button class="btn">>></button>\
            </div>\
            <p>This will show a portion of the file as text. There will be some buttons to page through the file.</p>\
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel suscipit nibh. Ut pulvinar ut quam ut viverra. Curabitur sed interdum lorem. Suspendisse euismod porta lorem, eget condimentum nulla tristique sit amet. Sed porttitor ornare mi, in varius libero viverra at. Integer eu metus id massa tincidunt laoreet. Maecenas ornare nisi non risus accumsan, ac porta quam iaculis. Curabitur turpis massa, ultricies eget tincidunt quis, suscipit in velit. Sed euismod at odio sed semper.</p>\
            <p>Etiam laoreet urna purus, a convallis sapien pellentesque in. Mauris nibh eros, scelerisque in dignissim et, pellentesque non mi. Cras ut tempor neque. Vivamus porttitor dignissim metus, ac porta odio sollicitudin vel. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam quis felis volutpat erat placerat ornare. Phasellus et eros magna. Donec vel urna id risus placerat cursus. Donec ut metus sed metus suscipit dignissim. Etiam eget fermentum neque, id accumsan lorem.</p>\
            <p>Mauris vestibulum, enim sed facilisis pharetra, est mauris scelerisque dui, at laoreet dui ligula et justo. Phasellus scelerisque porta ipsum sit amet tempus. Curabitur egestas, urna id pulvinar vestibulum, dui nisl vehicula nibh, quis pharetra augue tortor sed libero. Ut suscipit pellentesque lectus in placerat. Nullam et hendrerit sem. Suspendisse sodales purus in orci luctus condimentum. Nam rutrum vehicula lacus, id dignissim justo vestibulum vel. Cras vitae arcu feugiat, pretium purus eget, tincidunt nulla. Curabitur elementum dapibus ante sed malesuada. Phasellus interdum et nibh at aliquam. Maecenas eget nulla lectus. Integer vel turpis non erat varius commodo ac sit amet nibh. Vivamus sollicitudin metus arcu, facilisis sagittis felis elementum ut. Donec sit amet mollis lacus, in semper libero. Vestibulum ultricies, quam et tristique suscipit, mi urna tincidunt purus, et dignissim elit arcu sed ante. Ut in sagittis ante, ut mattis lacus.</p>\
            <p>Nam bibendum egestas odio, quis laoreet justo sollicitudin sed. Nam malesuada dignissim purus, nec rhoncus purus sollicitudin at. Duis sodales odio quis sollicitudin placerat. Phasellus sit amet volutpat risus. Aenean ut tempus elit. Quisque at dui purus. Aliquam tempus id nunc molestie pharetra. Vestibulum tincidunt imperdiet sodales. Phasellus a urna ac leo bibendum gravida in vel quam.</p>\
            <p>Suspendisse sodales, urna et convallis molestie, nibh neque placerat quam, ac pulvinar velit massa non turpis. Sed facilisis rutrum malesuada. Aliquam in mauris placerat, sagittis massa vel, condimentum arcu. Integer pretium consequat pharetra. Suspendisse vehicula tempor sapien quis scelerisque. Pellentesque aliquam vehicula nulla, ac pharetra erat consectetur vitae. Vivamus non porttitor tortor. Donec congue risus leo, ac luctus ante vehicula a. Nulla ac sapien quis magna fringilla fermentum. Duis lectus neque, malesuada a dui luctus, cursus placerat augue. Aenean elementum urna lorem. Proin malesuada eu dolor sed dictum. Maecenas aliquam rutrum mauris. Fusce eleifend justo a leo lobortis, quis luctus felis faucibus. Maecenas in est sed magna pulvinar dapibus vel vel libero.</p>\
        '
        });

    });

