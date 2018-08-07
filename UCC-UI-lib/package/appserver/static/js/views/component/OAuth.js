import _ from 'lodash';
import Backbone from 'backbone';

export default Backbone.View.extend({

	initialize: function (options, mode, model) {
		//initialize component with oauth options
		_.extend(this, options);
		this.options = options;
		this.mode = mode;
		this.model = model;
		if (!this.model.has("auth_type")) {
			let auth_type = ((this.options.auth_type.indexOf("basic") !== -1) ? "basic" : "oauth");
			this.model.set("auth_type", auth_type);
		}
		if (this.options.auth_type.indexOf("basic") !== -1) {
			this.options.basic.map((basic_fields) => {
				if(!this.model.has(basic_fields.field)) {
					this.model.set(basic_fields.field, "");
				}
			});
		}
		if (this.options.auth_type.indexOf("oauth") !== -1) {
			this.options.oauth.map((oauth_fields) => {
				if(!this.model.has(oauth_fields.field)) {
					this.model.set(oauth_fields.field, "");
				}
			});
		}
	},

	render: function () {
		// render component if 'auth_type' is defined in globalConfig.json
		// check provided auth types and render related controls
		// display related controls on the basis of selected auth type
		if (this.options.auth_type === undefined) {
			return false;
		}
		let body_content = "";
		if (this.options.auth_type.indexOf("basic") !== -1) {
			body_content += this.options.basic.map((basic_fields) => {
				basic_fields["auth_type"] = "basic";
				basic_fields["model"] = this.model;
				basic_fields["control_type"] = (basic_fields.encrypted) ? "password" : "text";
				return this._render_content(basic_fields);
			}).join("");
		}
		if (this.options.auth_type.indexOf("oauth") !== -1) {
			body_content += this.options.oauth.map((oauth_fields) => {
				oauth_fields["auth_type"] = "oauth";
				oauth_fields["model"] = this.model;
				oauth_fields["control_type"] = (oauth_fields.encrypted) ? "password" : "text";
				return (!(this.options.auth_type.indexOf("basic") !== -1 && oauth_fields.field === "account_name")) ? this._render_content(oauth_fields) : "";
			}).join("");
		}
		let content = {};
		content["body_content"] = body_content;
		content["auth_types"] = this.options.auth_type;
		content["model"] = this.model;
		this.$el.html(this._render_body(content));
		this._onAuthTypeChange();
		return this;
	},
	_render_body: function (content) {
		//get template of components
		return _.template(this._body_template)({
			"content": content
		});
	},
	_render_content: function (fields) {
		//get template of control
		return _.template(this._content_template)({
			"fields": fields
		});
	},
	//auth type change event binding
	events: {
		'change .auth_type': '_onAuthTypeChange'
	},
	_load_model: function(model) {
		model.set("auth_type", this.$(".auth_type").val());
		if (this.$(".auth_type").val() === "basic") {
			if (this.options.oauth) {
                this.options.oauth.map((oauth_fields) => {
                    model.set(oauth_fields.field, "")
	            });
			}
			this.options.basic.map((basic_fields) => {
				if (basic_fields.field === "account_name") {
					model.set(basic_fields.field, $(".input_auth."+basic_fields.field).val())
				}
				else { 
					model.set(basic_fields.field, $(".input_auth."+$(".auth_type").val()+"."+basic_fields.field).val())
				}
			});
	    }
	    if (this.$(".auth_type").val() === "oauth" ) {
            if (this.options.basic) {
                this.options.basic.map((basic_fields) => {
                    model.set(basic_fields.field, "")
                });
            }
            this.options.oauth.map((oauth_fields) =>{
				if (oauth_fields.field === "account_name") {
					model.set(oauth_fields.field, $(".input_auth."+oauth_fields.field).val())
            	} else {
					model.set(oauth_fields.field, $(".input_auth."+$(".auth_type").val()+"."+oauth_fields.field).val())
	        	}
            });
	    }
	},
	_onAuthTypeChange: function () {
		this.$(".auth").css("display","none");
		this.$("."+this.$(".auth_type").val()).css("display","block");
		this.$(".account_name").css("display","block");
	},
	_body_template: `
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
                            <% if (content.model.get("auth_type") !== undefined && auth_type === content.model.get("auth_type")) { %>
                                selected="selected"
                            <% } %> >
                                <%= auth_type %>
                            </option>
                        <% }); %>
                    </select>
                </div>
            </div>
        </div>
        <%= content.body_content %>`,
	_content_template: `
            <div class="form-horizontal form-small auth <%= fields.field %> <%= fields.auth_type %>"
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
                            <input type="<%= fields.control_type %>" class="input_auth <%= fields.auth_type %> <%= fields.field %>" value="<%= fields.model.get(fields.field) %>">
                        </div>
                        <span class="help-block">
                            <%= fields.help %>
                        </span>
                    </div>
                </div>
            </div>`
});
