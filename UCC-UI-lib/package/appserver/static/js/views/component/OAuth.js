import _ from 'lodash';
import Backbone from 'backbone';

export default Backbone.View.extend({

    initialize: function (options) {
        //initialize component with oauth options
        _.extend(this, options);
        this.options = options;
    },

    render: function () {
        // render component if 'auth_type' is defined in globalConfig.json
        // check provided auth types and render related controls
        // display related controls on the basis of selected auth type
        if (this.options.auth_type) {
            let body_content = "",selected_auth_type="";
            if(this.options.auth_type.selected!=undefined) {
                selected_auth_type = this.options.auth_type.selected;
            }
            else {
                if (this.options.auth_type.indexOf("basic") != -1) {
                    selected_auth_type = "basic";
                } else {
                    selected_auth_type = "oauth";
                }
            }
            if (this.options.auth_type.indexOf("basic") != -1) {
                _.each(this.options.basic, (basic_fields) => {
                    basic_fields["auth_type"] = "basic";
                    basic_fields["selected_auth_type"] = selected_auth_type;
                    if(basic_fields.field ==="password")
                    {
                        basic_fields["control_type"] = "password";
                    } else {
                        basic_fields["control_type"] = "text";
                    }
                    body_content += this._render_content(basic_fields);
                });
            }
            if (this.options.auth_type.indexOf("oauth") != -1) {
                _.each(this.options.oauth, (oauth_fields) => {
                    oauth_fields["auth_type"] = "oauth";
                    oauth_fields["selected_auth_type"] = selected_auth_type;
                    if(oauth_fields.field ==="client_secret")
                    {
                        oauth_fields["control_type"] = "password";
                    } else {
                        oauth_fields["control_type"] = "text";
                    }
                    if (!(this.options.auth_type.indexOf("basic") != -1 && oauth_fields.field ==="account_name")) {
                        body_content += this._render_content(oauth_fields);
                    }
                });
            }
            let content = [];
            content["body_content"] = body_content;
            content["auth_types"] = this.options.auth_type;
            if(this.options.auth_type.selected!=undefined) {
                content["selected_auth_type"] = this.options.auth_type.selected;
            }
            else {
                if (this.options.auth_type.indexOf("basic") != -1) {
                    content["selected_auth_type"] = "basic";
                } else {
                    content["selected_auth_type"] = "oauth";
                }
            }
            this.$el.html(this._render_body(content));
        }
        return this;
    },
    _render_body: function (content) {
        //get template of components  
        return _.template(this._body_template)({ "content": content});
    },
    _render_content: function (fields) {
        //get template of control
        return _.template(this._content_template)({ "fields": fields});
    },
    //auth type change event binding 
    events: {
        'change .auth_type': '_onAuthTypeChange'
    },
    _onAuthTypeChange: function () { 
        console.log("Clicked: AuthTypeClick");
    },
    _body_template: `
    <div class="modal-body">
        <div class="form-horizontal form-small">
            <div class="form-group control-group">            
                <div class="control-label col-sm-2">
                    <p>
                        Auth Type <span class="required">*</span>
                    </p>
                </div>
                <div class="col-sm-10 controls control-placeholder">
                    <select class="control shared-controls-select control-default auth_type" name="auth_type">
                         <% _.each(content.auth_types, function(auth_type){ %>
                            <option value="<%= auth_type %>" 
                            <% if (auth_type === content.selected_auth_type) { %>
                                selected="selected"
                            <% } %> >
                                <%= auth_type %>
                            </option>
                        <% }); %>
                    </select>
                </div>
            </div>
        </div>
        <%= content.body_content %>
    </div>`,
    _content_template: `
            <div class="form-horizontal form-small <%= fields.field %> <%= fields.auth_type %>"
            <% if (fields.auth_type !== fields.selected_auth_type) { %>
                style="display:none"
            <% } %>>
                <div class="form-group control-group">
                    <div class="control-label col-sm-2">
                        <p>
                            <%= fields.label %>
                        </p>
                    </div>
                    <div class="col-sm-10 controls control-placeholder">
                        <div class="control shared-controls-textcontrol control-default" data-name="<%= fields.field %>">
                            <input type="<%= fields.control_type %>" name="<%= fields.field %>" class="<%= fields.auth_type %> <%= fields.field %>" value> 
                        </div>
                        <span class="help-block">
                            <%= fields.help %>
                        </span>
                    </div>
                </div>
            </div>`
});
