define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'uri/route', 
        'util/searchassistant_utils', 
        'splunk.util' 
    ],
    function(
        $,
        _, 
        module, 
        Base, 
        route, 
        searchAssistantUtil, 
        splunkUtil 
    ) {
        return Base.extend({
            moduleId: module.id,
            /**
             * @param <Object> options {
             *     <Object> model: {
             *         sHelper: <models.search.SHelper>,
             *         application: <models.Application>
             *     }
             * }
             */
            className: 'intro-and-command-container',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.activate();
            },     
            startListening: function() {
                this.listenTo(this.model.sHelper, "change:showIntroText", this.debouncedRender);
                this.listenTo(this.model.sHelper.command, "change", this.debouncedRender);
            },
            events: {
                 'click .saMoreLink': function(e) {
                     e.preventDefault();
                     var $element = $(e.target);
                     if ($element.hasClass('saMoreLinkOpen')) {
                         $element.removeClass('saMoreLinkOpen')
                             .html(_.t('More &raquo;'));
                         $($element.attr('divToShow')).css('display','none');
                     } else {
                         $element.addClass('saMoreLinkOpen')
                             .html(_.t('&laquo; Less'));
                         $($element.attr('divToShow')).css('display', 'block');
                     }
                 }
            }, 
            
            render: function() {
                var template;
                if (splunkUtil.normalizeBoolean(this.model.sHelper.get('showIntroText'))) {
                    template = _.template(this.two_step_intro_template, {
                        _: _,
                        sprintf: splunkUtil.sprintf
                    });
                } else if (this.model.sHelper.command.get('syntax')) {
                    var commandHelpLink = route.docHelp(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        'search_app.assist.' + this.model.sHelper.command.get("name")
                    );

             
                    var details = searchAssistantUtil.removeWhiteSpaces(searchAssistantUtil.stylizeVariables(this.model.sHelper.command.get("details"))); 
                    var syntax = searchAssistantUtil.stylizeVariables(searchAssistantUtil.removeWhiteSpaces(this.model.sHelper.command.get("syntax"))); 
                    var shortDesc = searchAssistantUtil.removeWhiteSpaces(searchAssistantUtil.stylizeVariables(this.model.sHelper.command.get("shortdesc"))) || _('See details below').t(); 

                    template = _.template(this.command_template, {
                        _: _,
                        details: details, 
                        syntax: syntax, 
                        shortDesc: shortDesc, 
                        command: this.model.sHelper.command, 
                        commandHelpLink: commandHelpLink, 
                        sprintf: splunkUtil.sprintf
                    });
                } else {
                    template = _.template(this.using_search_commands_template, {
                        _: _,
                        sprintf: splunkUtil.sprintf
                    });
                }        
                this.$el.html(template);

                this.model.sHelper.trigger('childRendered');

                return this;
            },
            two_step_intro_template: '\
                <h5><%- _("How To Search").t() %></h5>\
                <span class="intro-and-command-steps"><%- _("Step 1: Retrieve Events").t() %></span>\
                <p><%- _("The simplest searches return events that match terms you type into the \
                    search bar:").t() %></p>\
                <table>\
                    <tbody>\
                        <tr>\
                            <td><%- _("terms:").t() %></td>\
                            <td><code>error login</code></td>\
                        </tr>\
                        <tr>\
                            <td><%- _("quoted phrases:").t() %></td>\
                            <td><code>"database error"</code></td>\
                        </tr>\
                        <tr>\
                            <td><%- _("boolean operators:").t() %></td>\
                            <td><code>login NOT (error OR fail)</code></td>\
                        </tr>\
                        <tr>\
                            <td><%- _("wildcards:").t() %></td>\
                            <td><code>fail*</code></td>\
                        </tr>\
                        <tr>\
                            <td><%- _("field values:").t() %></td>\
                            <td>\
                                <%= sprintf(_("%s, %s, or %s").t(), "<code>status=404</code>", \
                                "<code>status!=404</code>", \
                                "<code>status>200</code>") %>\
                            </td>\
                        </tr>\
                    </tbody>\
                </table>\
                <span class="intro-and-command-steps"><%- _("Step 2: Use Search Commands").t() %></span>\
                <p><%= sprintf(_("More advanced searches use commands to transform, filter, and report on \
                    the events you retrieved. Use the vertical bar %s , or pipe character, to apply \
                    a command to the retrieved events.").t(), \'<code>|</code>\') %>\
                </p>\
            ',
            using_search_commands_template:'\
                <h5><%- _("How To Search").t() %></h5>\
                <span class=intro-and-command-steps><%- _("Using Search Commands").t() %></span>\
                <%- _("More advanced searches use commands to transform, filter, and report on the events you retrieved.").t() %>\
                <ul>\
                    <li><%- _("Use the vertical bar, or pipe character, to apply a command to the retrieved events: ").t() %><br />\
                    <code>sourcetype=access_* error | top 20 uri</code></li>\
                    <li><%- _("Further refine or transform your search results with a additional commands: ").t() %><br />\
                    <code>sourcetype=access_* error | top 20 uri | search count>5</code></li>\
                </ul>\
                <%- _("Search assistant will suggest commands for you to use next and show you examples to help you build your search.").t() %>\
            ',
            command_template: '\
                <div class="intro-and-command-header">\
                    <h5><%- _(command.get("name")).t() %></h5>\
                    <a class="external" href="<%= commandHelpLink %>" target="_blank" title="<%- _(\"Splunk Help\").t() %>"><%- _("Help").t() %></a>\
                    <a class="saMoreLink" href="#" title="<%- _(\"See complete description\").t() %>" id="detailsLabel" divToShow="#detailsdiv"><%= _("More &raquo;").t() %></a>\
                </div>\
                <div class="intro-and-command-examples">\
                        <div><%= _(shortDesc).t() %></div>\
                        <dl id="detailsdiv" style="display: none">\
                            <dt>\
                                <h5><%- _("Details").t() %></h5>\
                            </dt>\
                            <dd>\
                                <%= _(details).t() %>\
                            </dd>\
                            <dt class="syntax-header">\
                                <h5><%-_("Syntax").t() %></h5>\
                                <a class="saMoreLink" href="#" title="See syntax description" divtoshow=".syntaxDetails"><%= _("More &raquo;").t() %></a>\
                            </dt>\
                            <dd>\
                                <%= _(syntax).t() %>\
                                <div class="syntaxDetails" style="display: none;">\
                                    <table>\
                                        <tbody>\
                                            <tr><th><%- _("Syntax").t() %></th><th><%- _("Description").t() %></th></tr>\
                                            <tr><td><code><i><%- _("term").t() %></i></code></td><td><%- _("variable").t() %></td></tr>\
                                            <tr><td><code><%- _("term").t() %></code></td><td><%- _("literal keyword").t() %></td></tr>\
                                            <tr><td><code>()</code></td><td><%- _("logical group").t() %></td></tr>\
                                            <tr><td><code>()?</code></td><td><%- _("optional group").t() %></td></tr>\
                                            <tr><td><code>()+</code></td><td><%- _("one or more group").t() %></td></tr>\
                                            <tr><td><code>()*</code></td><td><%- _("zero or more group").t() %></td></tr>\
                                            <tr><td><code>|</code></td><td><%- _("or").t() %></td></tr>\
                                        </tbody>\
                                    </table>\
                                </div>\
                            </dd>\
                            <dt>\
                                <h5><%- _("Related").t() %></h5>\
                            </dt>\
                            <dd>\
                                <%= _(command.get("related")).t() %>\
                            </dd>\
                        </dl>\
                        <% if (command.get("examples").length > 0) {%>\
                            <h5><%- _("Examples").t() %></h5>\
                            <dl>\
                            <%for(var i = 0; i < command.get("examples").length && i < 3; i++) {%>\
                                <dt><%- _(command.get("examples")[i][1]).t() %></dt>\
                                <dd><%- _(command.get("examples")[i][0]).t() %></dd>\
                            <%}%>\
                            </dl>\
                        <%}%>\
                </div>\
            '
        });
    }
);
