import _ from 'lodash';
import Backbone from 'backbone';

export default Backbone.View.extend({

	initialize: function (options, mode, attributes) {
		//initialize component with oauth options
		_.extend(this, options);
		this.options = options;
		this.mode = mode;
		this.attributes = attributes;
		if (this.attributes["auth_type"] === undefined) {
			this.attributes["auth_type"] = (this.options.auth_type.indexOf("basic") != -1) ? "basic" : "oauth";
		}
		var that = this;
		if (this.options.auth_type.indexOf("basic") !== -1) {
			this.options.basic.map(function (basic_fields) {
				if(this.attributes[basic_fields.field] === undefined) {
					this.attributes[basic_fields.field] = "";
				}
			}.bind(this));
		}
		if (this.options.auth_type.indexOf("oauth") !== -1) {
			this.options.oauth.map(function (oauth_fields) {
				if(this.attributes[oauth_fields.field] === undefined) {
					this.attributes[oauth_fields.field] = "";
				}
			}.bind(this));
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
		let basic_content = [];
		let oauth_content = [];

		if (this.options.auth_type.indexOf("basic") !== -1) {
			body_content += this.options.basic.map(function (basic_fields) {
				basic_fields["auth_type"] = "basic";
				basic_fields["attributes"] = this.attributes;
				basic_fields["control_type"] = (basic_fields.field === "password") ? "password" : "text";
				return this._render_content(basic_fields);
			}.bind(this)).join("");
		}
		if (this.options.auth_type.indexOf("oauth") !== -1) {

			body_content += this.options.oauth.map(function (oauth_fields) {
				oauth_fields["auth_type"] = "oauth";
				oauth_fields["attributes"] = this.attributes;
				oauth_fields["control_type"] = (oauth_fields.field === "client_secret") ? "password" : "text";
				return (!(this.options.auth_type.indexOf("basic") != -1 && oauth_fields.field === "account_name")) ? this._render_content(oauth_fields) : "";
			}.bind(this)).join("");
		}
		let content = [];
		content["body_content"] = body_content;
		content["auth_types"] = this.options.auth_type;
		content["attributes"] = this.attributes;
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
		model.set("auth_type",this.$(".auth_type").val());
		if (this.$(".auth_type").val() === "basic") {
			this.options.oauth.map(function (oauth_fields) {
                this.set(oauth_fields.field,"")
	        }.bind(model));
			this.options.basic.map(function (basic_fields) {
				if(basic_fields.field === "account_name"){
					this.set(basic_fields.field,$(".input_auth."+basic_fields.field).val())
				}
				else { 
					this.set(basic_fields.field,$(".input_auth."+$(".auth_type").val()+"."+basic_fields.field).val()) 
				}
			}.bind(model));
	    }
	    if (this.$(".auth_type").val() === "oauth" ) {
            this.options.basic.map(function (basic_fields) {
				this.set(basic_fields.field,"")
			}.bind(model));
            this.options.oauth.map(function (oauth_fields) {
            	if(oauth_fields.field === "account_name"){
            		this.set(oauth_fields.field,$(".input_auth."+oauth_fields.field).val())
            	} else {
	            	this.set(oauth_fields.field,$(".input_auth."+$(".auth_type").val()+"."+oauth_fields.field).val())
	        	}
            }.bind(model));
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
                            <% if (auth_type === content.attributes["auth_type"]) { %>
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
                            <input type="<%= fields.control_type %>" class="input_auth <%= fields.auth_type %> <%= fields.field %>" value="<%= fields.attributes[fields.field] %>">
                        </div>
                        <span class="help-block">
                            <%= fields.help %>
                        </span>
                    </div>
                </div>
            </div>`
});
