define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/delegates/Accordion',
        'util/string_utils',
        'splunk.i18n'
    ],
    function(
        $,
        _,
        module,
        Base,
        Accordion,
        stringUtils,
        i18n
    ){
        /**
         * @constructor
         * @memberOf views
         * @name ExecutionCostView
         * @description
         * @extends {Base}
         */
        return Base.extend(/** @lends views.Base.prototype */{
            moduleId: module.id,
            className: "job-execution-cost accordion",
            /**
             * @param {Object} options {
             *      model: {
             *         searchJob: <model.search.job>
             *      }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            
            /**
             * Based on the performance attributes from the search job model, 
             * creates data for displaying the execution cost chart.
             * @returns {Array} performanceData
             */
            constructPerformaceData: function() {
                var componentInfo, 
                    maxDuration = 0.0,
                    isNewBlock = false, //Flag to determine if a new component block is encountered. 
                    currentLevel = 0, //Keeps track of the current block's displayLevel.
                    subComponentStartIndex = 0, //Index at which the component block begins.
                    subComponentBlockPairs = [], //Array of component block's start and end index.
                    subComponentStack =[], //Array used to calculate displayLevel. 
                    performanceData = [];
                
                _.each(this.model.searchJob.entry.content.performance.attributes, function(compVal, compName) {
                    componentInfo = {
                        component: compName,
                        invocationCount: compVal.invocations ? parseInt(compVal.invocations, 10) : 0,
                        inputCount: compVal.input_count ? parseInt(compVal.input_count, 10) : 0,
                        outputCount: compVal.output_count ? parseInt(compVal.output_count, 10) : 0,
                        duration: compVal.duration_secs ? parseFloat(compVal.duration_secs) : 0.0,
                        displayLevel: 0
                    };
                    maxDuration = Math.max(maxDuration, componentInfo['duration']);
                    componentInfo['displayDuration'] = componentInfo['duration'];

                    /**
                     * Determine at what level the duration bar should begin.
                     * If the previous component name is a substring of the current component name, then 
                     * the current component should be indented below the previous component.
                     */
                    while ((subComponentStack.length > 0) && 
                        !(stringUtils.strStartsWith(compName, subComponentStack[subComponentStack.length - 1] + '.'))) {
                            subComponentStack.pop();
                    }
                    componentInfo['displayLevel'] = subComponentStack.length;
                    subComponentStack.push(compName);
                    
                    performanceData.push(componentInfo);
                });
                
                _.each(performanceData, function(data, index) {
                    if (maxDuration) {
                        //normalize all durations for rendering relative time bars.
                        data['displayDuration'] = data['displayDuration'] / maxDuration;
                    } else {
                        data['displayDuration'] = 0;
                    }
                    
                    //Creating blocks of components having same display level.
                    if (data['displayLevel'] !== currentLevel) {
                        if (isNewBlock) {
                            subComponentBlockPairs.push([subComponentStartIndex, index]);
                        } else {
                            subComponentStartIndex = index;
                        }
                        currentLevel = data['displayLevel'];
                        isNewBlock = !isNewBlock;
                    }
                });
                
                //For each component block created above, sort components based on maximum duration to minimum.
                _.each(subComponentBlockPairs, function(pair) {
                    var tempBlock = performanceData.slice(pair[0], pair[1]);
                    tempBlock.sort(function(a, b) { 
                        //Overriding the default compare function with one for comparing durations.
                        if (a.duration > b.duration) {
                            return -1;
                        }
                        if (a.duration < b.duration) {
                            return 1;
                        }
                        // a must have same duration as b.
                        return 0;
                    });
                    
                    //Put the sorted components back to the original performance array.
                    for (var i = pair[0], j = 0; i < pair[1]; i++, j++) {
                        performanceData[i] = tempBlock[j];
                    }
                });
                
                return performanceData;
            },
            
            render: function() {
                this.$el.html(this.compiledTemplate({
                    performance: this.constructPerformaceData(),
                    i18n: i18n
                }));

                this.accordion = new Accordion({
                    el: this.el,
                    collapsible: true
                });
                
                return this;
            },
            
            template: '\
                <div class="accordion-group">\
                    <div class="accordion-heading">\
                        <a class="accordion-toggle" href="#">\
                            <i class="icon-accordion-toggle"></i>\
                            <%- _("Execution costs").t() %>\
                        </a>\
                    </div>\
                    <div class="accordion-body">\
                        <table>\
                            <thead>\
                                <tr>\
                                    <th><%- _("Duration (seconds)").t() %></th>\
                                    <th></th>\
                                    <th><%- _("Component").t() %></th>\
                                    <th><%- _("Invocations").t() %></th>\
                                    <th><%- _("Input count").t() %></th>\
                                    <th><%- _("Output count").t() %></th>\
                                </tr>\
                            </thead>\
                            <tbody>\
                                <% _.each(performance, function(component) { %>\
                                    <tr class="<%- component.displayLevel ?  "sub" : ""  %>">\
                                        <td>\
                                            <img src="/static/img/skins/default/a.gif" width=<%- component.displayLevel * 15 %>px /> \
                                            <img src="/static/img/skins/default/a.gif" class="durationBar" \
                                                width=<%- Math.max(1, parseInt(component.displayDuration * 150)) %>px /> \
                                        </td>\
                                        <td class="numeric"><%- i18n.format_number(component.duration, "#,###,###.00") %></td>\
                                        <td>\
                                            <img src="/static/img/skins/default/a.gif" width=<%- component.displayLevel * 15 %>px /> \
                                            <%-component.component %>\
                                        </td>\
                                        <td class="numeric">\
                                            <% if(component.invocationCount) { %>\
                                                <%- i18n.format_number(component.invocationCount) %>\
                                            <% } else { %>\
                                                - \
                                            <% } %>\
                                        </td>\
                                        <td class="numeric">\
                                            <% if(component.inputCount) { %>\
                                                <%- i18n.format_number(component.inputCount) %>\
                                            <% } else { %>\
                                                - \
                                            <% } %>\
                                        </td>\
                                        <td class="numeric">\
                                            <% if(component.outputCount) { %>\
                                                <%- i18n.format_number(component.outputCount) %>\
                                            <% } else { %>\
                                                - \
                                            <% } %>\
                                        </td>\
                                    </tr>\
                                <% }) %>\
                            </tbody>\
                        </table>\
                    </div>\
                </div>\
            '
        });
    }
);