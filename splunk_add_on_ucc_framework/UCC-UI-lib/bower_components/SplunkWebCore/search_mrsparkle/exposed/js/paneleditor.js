//live to code, code to live...
var paneleditor = {};
(function(ns){
    /**
     * Control is a standard interface for binding UI controls.
     * Implement this class to varius UI controls (simple or complex) as needed.
     *
     * @param {Object} element The DOM element reference.
    */
    function Control(element) {
        //exit for extend
        if (!element) {
            return;
        }
        this.element = element;
        this.hasValueChanged = false;
        this.onValueChangeObserver;
        this.bindOnValueChange();
    }
    Control.prototype = {
        show: function() {
            this.element.style.display = 'inline';
        },
        hide: function() {
            this.element.style.display = 'none';
        },
        getValue: function() {
            return this.element.value;
        },
        setValue: function(value) {
            this.element.value = value;
        },
        setVisibility: function(show) {
            if (show) {
                this.show();
            } else {
                this.hide();
            }
        },
        addValueChangeListener: function(callback) {
            this.onValueChangeObserver = callback;
        },
        bindOnValueChange: function() {
            var that = this;
            $(this.element).bind('change', function(){
                that.hasValueChanged = true;
                if (that.onValueChangeObserver) {
                    that.onValueChangeObserver(that.getValue());
                }
            });
        }
    };

    //Select
    function SelectControl(element) {
        Control.call(this, element);
    }
    SelectControl.prototype = new Control();
    SelectControl.constructor = SelectControl;
    SelectControl.prototype.getValue = function() {
        return $(this.element).val();
    };
    SelectControl.prototype.setValue = function(value) {
        $(this.element).val(value);
    };

    //Table Row Select
    function TableRowSelectControl(element) {
        this.parentElement = $(element).parents('td').parent('tr')[0];
        SelectControl.call(this, element);
    }
    TableRowSelectControl.prototype = new SelectControl(null);
    TableRowSelectControl.constructor = TableRowSelectControl;
    TableRowSelectControl.prototype.show = function() {
        this.parentElement.style.display = '';
    };
    TableRowSelectControl.prototype.hide = function() {
        this.parentElement.style.display = 'none';
    };

    //Input Radio
    function InputRadioControl(element) {
        Control.call(this, element);
    }
    InputRadioControl.prototype = new Control(null);
    InputRadioControl.constructor = InputRadioControl;
    InputRadioControl.prototype.getValue = function() {
        for (var i=0, l=this.element.length; i < l; i++) {
            var item = $(this.element[i]);
            if (item.prop('checked')==true) {
                return item.val();
            }
        }
        return null;
    };
    InputRadioControl.prototype.setValue = function(value) {
        for (var i=0, l=this.element.length; i < l; i++) {
            var item = this.element[i];
            item.checked = (item.value==value) ? true : false;
        }
    };
    InputRadioControl.prototype.show = function() {
        for (var i=0, l=this.element.length; i < l; i++) {
            this.element[i].style.display = '';
        }
    };
    InputRadioControl.prototype.hide = function() {
        for (var i=0, l=this.element.length; i < l; i++) {
            this.element[i].style.display = 'none';
        }
    };

    /** Input Radio with children to show/hide based on value matching.
     *
     * @param {Array} children An array of object literals where when the value is matched
     *                         the corresponding element is either displayed or hidden.
     *                         Example: {value: 'blah', element: $('#foo')[0]}
     */
    function InputRadioWithChildrenControl(element, children) {
        Control.call(this, element);
        this.children = children;
        $(element).bind('change', function() {
            for (var i=0; i < children.length; i++) {
                var child = children[i];
                child.element.style.display = (this.value==child.value) ? '' : 'none';
            }
        });
    }
    InputRadioWithChildrenControl.prototype = new InputRadioControl(null);
    InputRadioWithChildrenControl.constructor = InputRadioWithChildrenControl;
    InputRadioWithChildrenControl.prototype.setValue = function(value) {
        InputRadioControl.prototype.setValue.call(this, value);
        this.value = value;
    };
    InputRadioWithChildrenControl.prototype.show = function() {
        InputRadioControl.prototype.show.call(this);
        for (var i=0, l=this.element.length; i < l; i++) {
            var item = this.element[i];
            item.checked = (item.value==this.value) ? true : false;
            for (var j=0; j < this.children.length; j++) {
                var child = this.children[j];
                if (child.value==item.value) {
                    child.element.style.display = (item.checked) ? '' : 'none';
                }
           }
        }
    };
    InputRadioWithChildrenControl.prototype.hide = function() {
        InputRadioControl.prototype.hide.call(this);
        for (var j=0; j<this.children.length; j++) {
            this.children[j].element.style.display = 'none';
        }
    };

    //Table Row Input Radio
    function TableRowInputRadioControl(element) {
        this.parentElement = $(element).parents('tr')[0];
        InputRadioControl.call(this, element);
    }
    TableRowInputRadioControl.prototype = new InputRadioControl(null);
    TableRowInputRadioControl.constructor = TableRowSelectControl;
    TableRowInputRadioControl.prototype.show = function() {
        this.parentElement.style.display = '';
    };
    TableRowInputRadioControl.prototype.hide = function() {
        this.parentElement.style.display = 'none';
    };

    //Table Row Input Text
    function TableRowInputControl(element){
        this.parentElement = $(element).parents('td').parent('tr')[0];
        Control.call(this, element);
    }
    TableRowInputControl.prototype = new Control();
    TableRowInputControl.constructor = TableRowInputControl;
    TableRowInputControl.prototype.show = function() {
        this.parentElement.style.display = '';
    };
    TableRowInputControl.prototype.hide = function() {
        this.parentElement.style.display = 'none';
    };

    //Table Row Input + Select
    function TableRowInputSelectControl(element){
        this.parentElement = $(element).parents('td').parent('tr')[0];
        Control.call(this, element);
    }
    TableRowInputSelectControl.prototype = new Control();
    TableRowInputSelectControl.constructor = TableRowInputControl;
    TableRowInputSelectControl.prototype.show = function() {
        this.parentElement.style.display = '';
    };
    TableRowInputSelectControl.prototype.hide = function() {
        this.parentElement.style.display = 'none';
    };
    TableRowInputSelectControl.prototype.getValue = function() {
        return this.element[0].value + $(this.element[1]).val();
    };
    TableRowInputSelectControl.prototype.setValue = function(values) {
        this.element[0].value = values[0];
        $(this.element[1]).val(values);
    };

    //Tabs
    function TabControl(element) {
        Control.call(this, element);
    }
    TabControl.prototype = new Control(null);
    TabControl.constructor = TabControl;
    TabControl.prototype.getValue = function() {
        return null;
    };
    TabControl.prototype.setValue = function(value){};
    TabControl.prototype.show = function() {
        this.element.style.display = 'block';
    };

    //Table Row
    function TableRowControl(element) {
        Control.call(this, element);
    }
    TableRowControl.prototype = new Control(null);
    TableRowControl.constructor = TableRowControl;
    TableRowControl.prototype.getValue = function() {
        return null;
    };
    TableRowControl.prototype.setValue = function() {};
    TableRowControl.prototype.show = function() {
        this.element.style.display = '';
    };

    // Widget Based Control
    function WidgetControl(element, widget) {
        this.parentElement = $(element).parents('tr')[0];
        this.widget = widget;
        Control.call(this, element);
    }
    WidgetControl.prototype = new Control(null);
    WidgetControl.constructor = WidgetControl;
    WidgetControl.prototype.show = function() {
        this.parentElement.style.display = '';
    };
    WidgetControl.prototype.hide = function() {
        this.parentElement.style.display = 'none';
    };
    WidgetControl.prototype.getValue = function() {
        return this.widget.getValue();
    };
    WidgetControl.prototype.setValue = function(value) {
        this.widget.setValue(value);
    };

    /**
     * ConstraintModulator is a simple object wrapper around primitive rule sets.
     *
     * @param {Object} schemas A simple schemas definition for properties belonging to
     *                  a specific chart type.
     * e.g.
     * var schemas = {
     *   table: [
     *       'drilldown',
     *       'title',
     *       'count',
     *       'displayRowNumbers'
     *   ]
     * };
     * @param {String} type The active schema type.
     */
    function ConstraintModulator(schemas, type){
        this.schemas = schemas;
        this.type = type;
    }
    ConstraintModulator.prototype = {
        hasProperty: function(attr) {
            if (this.schemas.hasOwnProperty(this.type)) {
                if (jQuery.inArray(attr, this.schemas[this.type])!=-1) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        /**
         * Validate the active schema type against an expression.
         *
         * @param {Object} expression An object literal of optional expression datastructures, Note: If both required and oneOf are passed,
         *                 required is evaluated first followed by oneOf.
         *                 @param {Array} required An array of required attributes for enabling the control.
         *                 @param {Array} oneOf An Array of at least one attribute for enabling the control.
         *
         * @type Boolean
         */
        isValid: function(expression) {
            var required = expression.required || [];
            var oneOf = expression.oneOf || [];
            var i, l;
            if (required.length > 0) {
                for (i=0, l=required.length; i < l; i++) {
                    if (this.hasProperty(required[i])) {
                        continue;
                    } else {
                        return false;
                    }
                }
                return true;
            }
            if (oneOf.length > 0) {
                for (i=0, l=oneOf.length; i < l; i++) {
                    if (this.hasProperty(oneOf[i])) {
                        return true;
                    } else {
                        continue;
                    }
                }
                return false;
            }
        }
    };

    /**
     * Very basic model abstraction layer for all panels derived from SimpleXML.
     *
     * @param {Object} fields The object literal conversion of SimpleXML.
     */
    function PanelModel(fields, resource){
        this.fields = PanelModel.unescapeChartingProperties(fields);
        this.resource = resource;
        this.errors = [];
    }
    /**
     * Derives the extended panel type (table, bar, pie) from the SimpleXML JSON format.
     */
    PanelModel.prototype = {
        getType: function() {
            var type = this.fields.type;
            if (type=='chart') {
                type = (this.fields.options && this.fields.options['charting.chart']) ? this.fields.options['charting.chart'] : 'column';
            }
            return type;
        },
        setType: function(type) {
            var types = ['chart', 'table', 'event', 'list', 'single'];
            var charts = ['bar', 'area', 'column', 'bubble', 'pie', 'scatter', 'line', 'radialGauge', 'fillerGauge', 'markerGauge'];
            if (jQuery.inArray(type, types)!=-1) {
                delete this.fields.options['charting.chart'];
                this.fields.type = type;
                return;
            }
            if (jQuery.inArray(type, charts)!=-1) {
                this.fields.type = 'chart';
                this.fields.options['charting.chart'] = type;
                return;
            }
        },
        getJSON: function() {
            return JSON.stringify(PanelModel.escapeChartingProperties(this.fields));
        },
        getErrors: function() {
            return this.errors;
        },
        save: function(callback) {
            var fieldsAreValid = this.validateFields();
            if(!fieldsAreValid) {
                callback(false);
                return;
            }
            var params = {
                url: this.resource,
                type: 'POST',
                timeout: 50000,
                data: this.getJSON(),
                contentType: 'application/json',
                complete: function(response) {
                    if (response.status==200) {
                        callback(true);
                    } else {
                        this.errors.push({
                            type: "ajax failure",
                            message: _("Error: Your panel changes could not be saved.")
                        });
                        callback(false);
                    }
                }.bind(this)
            };
            $.ajax(params);
        },
        validateFields: function() {
            this.errors = [];
            if(this.isAGauge()) {
                this.validateGaugeRanges();
            }
            if(this.hasYAxis()) {
                this.validateYAxisInputs();
            }
            return (this.errors.length === 0);
        },
        validateGaugeRanges: function() {
            var gaugeRanges = PanelModel.deserializeArrayAsFloats(this.fields.options['charting.chart.rangeValues']);
            if(gaugeRanges && gaugeRanges.length > 0) {
                if(isNaN(gaugeRanges[0])) {
                    this.errors.push({
                        type: 'gauge ranges incomplete',
                        message: _("All color ranges must be specified in manual mode")
                    });
                }
                else {
                    for(var i = 1; i < gaugeRanges.length; i++) {
                        if(isNaN(gaugeRanges[i])) {
                            this.errors.push({
                                type: 'gauge ranges incomplete',
                                message: _("All color ranges must be specified in manual mode")
                            });
                            break;
                        }
                        if(gaugeRanges[i] <= gaugeRanges[i - 1]) {
                            this.errors.push({
                                type: 'gauge range order',
                                message: _("Color ranges must be entered from the lowest to the highest")
                            });
                            break;
                        }
                    }
                }
            }
        },
        validateYAxisInputs: function() {
            var majorUnit = this.fields.options['charting.axisLabelsY.majorUnit'];
            if(majorUnit && majorUnit.length > 0 && !PanelModel.stringIsValidNumber(majorUnit)) {
                this.errors.push({
                    type: 'y-axis major unit',
                    message: _("Major Unit must be a valid number")
                });
            }
            var minValue = this.fields.options['charting.axisY.minimumNumber'];
            if(minValue && minValue.length > 0 && !PanelModel.stringIsValidNumber(minValue)) {
                this.errors.push({
                    type: 'y-axis min value',
                    message: _("Min Value must be a valid number")
                });
            }
            var maxValue = this.fields.options['charting.axisY.maximumNumber'];
            if(maxValue && maxValue.length > 0 && !PanelModel.stringIsValidNumber(maxValue)) {
                this.errors.push({
                    type: 'y-axis max value',
                    message: _("Max Value must be a valid number")
                });
            }
        },
        isAGauge: function() {
            var type = this.getType();
            return (type in {fillerGauge: true, radialGauge: true, markerGauge: true});
        },
        hasYAxis: function() {
            var type = this.getType();
            return (type in {bar: true, area: true, column: true, scatter: true, line: true});
        }
    };

    // class-level utility methods for the PanelModel

    // any charting property that starts with '#' or '@' must be escaped with a duplicate
    // of that character before saving to XML
    PanelModel.escapeChartingProperties = function(unescapedFields) {
        var fields = $.extend({}, unescapedFields),
            options = fields.options;
        for(var key in options) {
            if(options.hasOwnProperty(key) && PanelModel.isChartingProperty(key) && typeof options[key] === 'string') {
                fields.options[key] = options[key].replace(/^@/, '@@').replace(/^#/, '##');
            }
        }
        return fields;
    };

    PanelModel.unescapeChartingProperties = function(escapedFields) {
        var fields = $.extend({}, escapedFields),
            options = fields.options;
        for(var key in options) {
            if(options.hasOwnProperty(key) && PanelModel.isChartingProperty(key) && typeof options[key] === 'string') {
                fields.options[key] = options[key].replace(/^@@/, '@').replace(/^##/, '#');
            }
        }
        return fields;
    };

    // a property is considered a charting property if its name starts with 'charting.'
    // except for charting.chartTitle which is handled as a special case
    PanelModel.isChartingProperty = function(key) {
        return (key.substr(0, 9) === 'charting.' && key !== 'charting.chartTitle');
    };

    PanelModel.deserializeArray = function(arrayStr) {
        if(!arrayStr) {
            return false;
        }
        var strLen = arrayStr.length;

        if(arrayStr.charAt(0) !== '[' || arrayStr.charAt(strLen - 1) !== ']') {
            return false;
        }
        arrayStr = arrayStr.substring(1, strLen - 1);
        return Splunk.util.stringToFieldList(arrayStr);
    };

    // any string that parses to NaN will be left as such in the deserialized array
    PanelModel.deserializeArrayAsFloats = function(arrayStr) {
        var i, parsedFloat,
            array = PanelModel.deserializeArray(arrayStr);

        if(array === false) {
            return false;
        }
        for(i = 0; i < array.length; i++) {
            parsedFloat = parseFloat(array[i]);
            if(!isNaN(parsedFloat)) {
                array[i] = parsedFloat;
            }
        }
        return array;
    };

    PanelModel.serializeArray = function(array) {
        return '[' + Splunk.util.fieldListToString(array) + ']';
    };

    PanelModel.stringIsValidNumber = function(str) {
        return (/^[-+]?[0-9]*[.]?[0-9]*$/.test(str));
    };

    var widgets = {
        /**
         * A class that manages show/hiding of cotent associated with a tab.
         * By convention, the fragment identifier of the clicked div[class='tabs'] a element
         * maps back to the associated div[class='section'] having a matching id attribute value.
         *
         * @param {Boolean} enableFragmentID Enables/Disables fragment id dispatching/updating.
         * Not recommended when nested in IFrames as it will cause page skittish jumps.
         */
        Tabs: function(enableFragmentID) {
            //tab show/hide handler
            $('.tabs a').live('click', function() {
                if (!enableFragmentID) {
                    $(this).closest('li').click();
                    return false;
                }
            });
            $('.tabs li').live('click', function() {
                var that = this;
                var targetId = $(this).find('a').attr('href').replace('#', '');
                $('.tabs li').each(function() {
                    if (this==that) {
                        $(this).addClass('active');
                    } else {
                        $(this).removeClass('active');
                    }
                });
                $('.section').each(function() {
                    this.style.display = (this.id==targetId) ? 'block' : 'none';
                });
                if (enableFragmentID) {
                    window.location.hash = targetId;
                }
            });
            $(document).bind('ready', function() {
                if (enableFragmentID) {
                    var active = window.location.hash;
                    if (active) {
                        $('.tabs li a[href="'+active+'"]').click();
                    }
                }
            });
            this.set = function(type) {
                $('.tabs li a[href="' + type +'"]').closest('li').click();
            };
            this.displayError = function(type, errorMsg) {
                $('.tabs li a[href="' + type +'"]').closest('li').addClass("contains-error");
                $(type).prepend('<div class="tab-error-message">' + errorMsg + '</div>');
                this.set(type);
            };
            this.clearErrors = function() {
                $('.tabs li').removeClass('contains-error');
                $('.tab-error-message').remove();
            };
        },
        /**
         * Manages activation/deactivation of various visualizations.
         * This widget triggers an invalidviz and validviz event with respect to if the visualization is valid or not.
         * NOTE: This widget creates a synthetic dropdown based on a native select control.
         *
         * @param {String} activeValue The option[value='value'] to activate having a
         *                             matching value. Turns on the active state.
         * @param {Funtion} callback A function to call with the value of the new set
         *                           visualization control. The values are what is defined
         *                           in the option[value='value'] elements. Ensure they match
         *                           valid schemas types.
         */
        viz: function(value, callback){
            //initialize native control
            var $element = $('#viz-type');
            $element.val(value);
            //make invalid selection from previous save selectable allowing users to get back to previous state
            var selectedOption = $('option:selected', $element)[0];
            if (selectedOption.disabled) {
                selectedOption.disabled = false;
                $(document).trigger('invalidviz');
            }
            $element.bind('change', function(){
                callback($(this).val());
                var selectedOption = $('option:selected', this);
                if (selectedOption.hasClass('disabled')) {
                    $(document).trigger('invalidviz');
                } else {
                    $(document).trigger('validviz');
                }
            });
            //synthetic DHTML dropdown that proxies through native control
            $element.selectmenu({
                maxHeight: 'auto',
                style: 'dropdown',
                icons: [
                    {find: '.bg-img'}
                ],
                bgImage: function() {
                    return $(this).css("background-image");
                }
            });
        },

        /**
         * Constructor for gauge color picker widget
         */
        gaugeColorPicker: function(container, initialMode) {
            // private members
            var picker = this,
                activeColorElement,
                $swatchDialog,
                $container = $(container),
                mode = initialMode,
                $rangeTemplate = $('.rangeselecttemplate', $container).eq(0),
                $firstRange = $('.firstrange', $container).eq(0),
                numRanges = 1, // the first range is always there
                colorPickerHasBeenResized = false;

                initialize = function() {
                    initializeSwatchDialog();
                    // set up event handlers for the first element and the clone-able template
                    $('.removebutton', $rangeTemplate).click(function() {
                        $(this).parent().remove();
                        numRanges--;
                        broadcastChange();
                        return false;
                    });
                    $('input[name="rangestart"]', $firstRange).change(function() {
                        broadcastChange();
                    });
                    $('.rangecolorpicker', $container).click(function() {
                        var $this = $(this),
                            startColor = $('div', $this).eq(0).css('background-color'),
                            startColorString = Splunk.util.normalizeColor(startColor);

                        activeColorElement = this;
                        showSwatchDialog($this, startColorString);
                        // return false here because the swatch dialog might be listening for clicks
                        return false;
                    });
                    $('input[name="rangeend"]', $container).change(function() {
                        broadcastChange();
                    });
                    $('.addnewholder a', $(container)).click(function(e) {
                        addRange();
                        broadcastChange();
                        e.preventDefault();
                    });
                    $('.addnewholder', $(container)).show();
                };

                initializeSwatchDialog = function() {
                    $swatchDialog = $('#swatch-dialog');

                    var $swatchHolder = $('.swatch-holder', $swatchDialog),
                        $selectedColor = $('.selected-color', $swatchDialog),
                        $colorInput = $('.input-color', $swatchDialog),
                        $cancelButton = $('.cancel-button', $swatchDialog),
                        $applyButton = $('.apply-button', $swatchDialog);

                    $swatchHolder.delegate('.swatch', "hover", function() {
                        $(this).toggleClass("selected-swatch");
                    });
                    $swatchHolder.delegate('.swatch', "click", function() {
                        var colorStr = Splunk.util.normalizeColor($(this).css('background-color'));
                        setCurrentDialogColor(colorStr);
                    });
                    $colorInput.change(function() {
                        var colorVal = $(this).val();
                        if(colorVal.length === 6) {
                            $selectedColor.css('background-color', "#" + colorVal);
                        }
                    });
                    $cancelButton.click(function() {
                        $swatchDialog.hide();
                        return false;
                    });
                    $applyButton.click(function() {
                        var colorStr = Splunk.util.normalizeColor($selectedColor.css('background-color'));
                        $('div', $(activeColorElement)).css('background-color', colorStr);
                        broadcastChange();
                        $swatchDialog.hide();
                        return false;
                    });

                    $(document).click(function(event) {
                        if($swatchDialog.is(':visible')) {
                            // if the dialog is visible, check if the click is outside the dialog,
                            // in which case hide it
                            var parentFilter = "#swatch-dialog",
                                selectorParent = $(event.target).parents(parentFilter).length;

                            if(event.target !== $swatchDialog[0] && selectorParent === 0) {
                                $swatchDialog.hide();
                            }
                        }
                    });
                };

                getElementRangeInfo = function($element) {
                    var rawColor = $('.rangecolorpicker div', $element).eq(0).css('background-color');
                    return {
                        start: $('input[name="rangestart"]', $element).eq(0).val(),
                        color: Splunk.util.normalizeColor(rawColor).replace("#", "0x"),
                        end: $('input[name="rangeend"]', $element).eq(0).val()
                    };
                };

                setElementRangeInfo = function($element, rangeInfo) {
                    if(rangeInfo.start !== undefined && !isNaN(rangeInfo.start)) {
                        $('input[name="rangestart"]', $element).eq(0).val(rangeInfo.start);
                    }
                    if(rangeInfo.color !== undefined) {
                        $('.rangecolorpicker div', $element).eq(0).css('background-color', rangeInfo.color.replace("0x", "#"));
                    }
                    if(rangeInfo.end !== undefined && !isNaN(rangeInfo.end)) {
                        $('input[name="rangeend"]', $element).eq(0).val(rangeInfo.end);
                    }
                };

                getDefaultColorByIndex = function(index) {
                    switch(index) {
                        case 0: return '0x84E900';
                        case 1: return '0xFFE800';
                        default: return '0xBF3030';
                    }
                };

                addRange = function(rangeInfo) {
                    var $clone = $rangeTemplate.clone(true);

                    if(!rangeInfo) {
                        rangeInfo = {
                            color: getDefaultColorByIndex(numRanges),
                            end: ''
                        };
                    }
                    setElementRangeInfo($clone, rangeInfo);
                    $('input[name="rangeend"]', $clone).parent().addClass('padded');
                    $clone.removeClass('rangeselecttemplate').addClass('rangeselect').insertAfter($('.rangeselecttemplate, .rangeselect', $(container)).last()).show();
                    numRanges++;
                };

                removeAllRanges = function() {
                    $('.rangeselect', $(container)).not('.firstrange').remove();
                    numRanges = 1;
                };

                broadcastChange = function() {
                    $(container).trigger('change');
                };

                showSwatchDialog = function($owner, colorStr) {
                    setCurrentDialogColor(colorStr);
                    $swatchDialog.css({
                        top: $owner.offset().top + ($owner.outerHeight())
                    }).show();
                };

                setCurrentDialogColor = function(colorStr) {
                    var $selectedColor = $('.selected-color', $swatchDialog),
                        $colorInput = $('.input-color', $swatchDialog);

                    $selectedColor.css('background-color', colorStr);
                    $colorInput.val(colorStr.substr(1));
                };

            // public interface

            picker.getValue = function() {
                var loopRangeInfo,
                    firstRangeInfo = getElementRangeInfo($firstRange),
                    ranges = [firstRangeInfo.start, firstRangeInfo.end],
                    colors = [firstRangeInfo.color];

                $('.rangeselect').not('.firstrange').each(function(i, elem) {
                    loopRangeInfo = getElementRangeInfo(elem);
                    ranges.push(parseFloat(loopRangeInfo.end));
                    colors.push(loopRangeInfo.color);
                });
                return {
                    ranges: ranges,
                    colors: colors
                };
            };

            picker.setValue = function(value) {
                var i,
                    ranges = (value.ranges.length > 0) ? value.ranges : ['', '', '', ''],
                    colors = (value.colors.length > 0) ? value.colors : ["0x84E900", "0xFFE800", "0xBF3030"];

                removeAllRanges();
                setElementRangeInfo($firstRange, {
                    start: ranges[0],
                    color: colors[0],
                    end: (ranges.length > 1) ? ranges[1] : ''
                });
                for(i = 1; i < ranges.length - 1; i++) {
                    addRange({
                        color: (colors.length > i) ? colors[i] : getDefaultColorByIndex(i),
                        end: ranges[i + 1]
                    });
                }
            };

            picker.destroy = function() {
                removeAllRanges();
                $('input[name="rangestart"]', $firstRange).unbind('change');
                $('.rangecolorpicker', $container).unbind('click');
                $('.colorpicker').remove();
                $('input[name="rangeend"]', $container).unbind('change');
                $('.removebutton', $rangeTemplate).unbind('click');
                $('.addnewholder a', $(container)).unbind('click');
            };

            initialize();
            return picker;
        }
    };

    /**
     * Core application controller
     *
     * @param {Object} schemas A simple object definition of rules for various types of visualiations.
     * @param {String} session The application server session, required for making HTTP POSTS.
     * @param {String} resource The application server url path used for saving.
     * @param {Object} panelFields The raw object literal data struture for all panels derived from SimpleXML.
     * @param {Object} options A one-level deep object literal of options, see below:
     *                 {Boolean} enableFragmentID Controls whether the fragment identifier is used for tab changes.
     *                           Turn this off for IFrames as it will cause skitishness/jumps. Defaults to true.
     */
    function ApplicationController(schemas, session, resource, panelFields, options){
        var that = this;
        options = options || {};
        var enableFragmentID = options.hasOwnProperty('enableFragmentID') ? options.enableFragmentID : true;
        this.controls = {};
        this.schemas = schemas;
        this.session = session;
        this.resource = resource;
        this.panel = new PanelModel(panelFields, resource);
        this.gaugeColorPicker = false;
        this.tabs = new widgets.Tabs(enableFragmentID);
        var panelType = this.panel.getType();

        $(document).bind('invalidviz', function(event) {
            $(".invalidviz").show();
        });
        $(document).bind('validviz', function(event) {
            $(".invalidviz").hide();
        });
        $('button.splButton-primary').bind('click', function(){
            that.save();
        });
        widgets.viz(panelType, function(value) {
            that.tabs.set('#general');
            that.updateControls(value);
        });
        this.updateControls(panelType);
        // radio highlight needs to happen after update from backend
        $('.splRadio').splRadioInit();
    }
    ApplicationController.prototype = {
        /**
         * Controls are dependent on visualization type selection. This method is called to
         * update the what controls are shown/hidden for various visualization types.
         * @param {String} panelType The type of panel as per schema specification.
         */
        updateControls: function(panelType) {
            var that = this;
            var constraintModulator = new ConstraintModulator(this.schemas, panelType);
            this.panel.setType(panelType);
            //'General' tab
            //'Panel title' category
            this.controls.titleHeader = new TableRowControl($('#properties')[0]);
            this.controls.titleHeader.setVisibility(constraintModulator.isValid({oneOf: ['title']}));
            this.controls.title = new TableRowInputControl($('#title')[0]);
            this.controls.title.setValue(this.panel.fields.title);
            this.controls.title.setVisibility(constraintModulator.isValid({required: ['title']}));
            this.controls.title.addValueChangeListener(function(value) {
                // trim leading/trailing whitespace
                value = value.replace(/^\s*/, '').replace(/\s*$/, '');
                that.panel.fields.title = value;
            });
            //'Data' category
            this.controls.dataHeader = new TableRowControl($('#data')[0]);
            this.controls.dataHeader.setVisibility(constraintModulator.isValid({oneOf: ['stack', 'nullvalues', 'drilldown', 'drilldownchart', 'count', 'displayRowNumbers', 'dataOverlayMode', 'legendposition', 'gaugestyle']}));
            this.controls.drilldown = new TableRowInputRadioControl($('input[name="drilldown"]'));
            this.controls.drilldown.setValue(this.panel.fields.options.drilldown || 'row');
            this.controls.drilldown.setVisibility(constraintModulator.isValid({required: ['drilldown']}));
            // this.controls.drilldown.setVisibility(true);
            this.controls.drilldown.addValueChangeListener(function(value) {
                that.panel.fields.options.drilldown = value;
            });
            this.controls.drilldownChart = new TableRowInputRadioControl($('input[name="drilldownchart"]'));
            this.controls.drilldownChart.setValue(this.panel.fields.options.drilldown || 'all');
            this.controls.drilldownChart.setVisibility(constraintModulator.isValid({required: ['drilldownchart']}));
            this.controls.drilldownChart.addValueChangeListener(function(value) {
                that.panel.fields.options.drilldown = value;
            });
            this.controls.count = new TableRowSelectControl($('#count'));
            this.controls.count.setValue(this.panel.fields.options.count || '10');
            this.controls.count.setVisibility(constraintModulator.isValid({required: ['count']}));
            this.controls.count.addValueChangeListener(function(value) {
                that.panel.fields.options.count = value;
            });
            this.controls.displayRowNumbers = new TableRowInputRadioControl($('input[name="displayrownumbers"]'));
            this.controls.displayRowNumbers.setValue(this.panel.fields.options.displayRowNumbers || 'false');
            this.controls.displayRowNumbers.setVisibility(constraintModulator.isValid({required: ['displayRowNumbers']}));
            this.controls.displayRowNumbers.addValueChangeListener(function(value) {
                that.panel.fields.options.displayRowNumbers = value;
            });
            this.controls.dataOverlayMode = new TableRowSelectControl($('#dataoverlaymode')[0]);
            this.controls.dataOverlayMode.setValue(this.panel.fields.options.dataOverlayMode || 'none');
            this.controls.dataOverlayMode.setVisibility(constraintModulator.isValid({required: ['dataOverlayMode']}));
            this.controls.dataOverlayMode.addValueChangeListener(function(value) {
                that.panel.fields.options.dataOverlayMode = value;
            });
            this.controls.wrap = new TableRowInputRadioControl($('input[name="wrap"]'));
            this.controls.wrap.setValue((this.panel.fields.options.softWrap || 'false').toLowerCase());
            this.controls.wrap.setVisibility(constraintModulator.isValid({required: ['wrap']}));
            this.controls.wrap.addValueChangeListener(function(value) {
                that.panel.fields.options.softWrap = value;
            });
            this.controls.stack = new TableRowInputRadioControl($('input[name="stack"]'));
            this.controls.stack.setValue(this.panel.fields.options['charting.chart.stackMode'] || 'default');
            this.controls.stack.setVisibility(constraintModulator.isValid({required: ['stack']}));
            this.controls.stack.addValueChangeListener(function(value) {
                that.panel.fields.options['charting.chart.stackMode'] = value;
            });
            this.controls.nullValues = new TableRowInputRadioControl($('input[name="nullvalues"]'));
            this.controls.nullValues.setValue(this.panel.fields.options['charting.chart.nullValueMode'] || 'gaps');
            this.controls.nullValues.setVisibility(constraintModulator.isValid({required: ['nullvalues']}));
            this.controls.nullValues.addValueChangeListener(function(value) {
                that.panel.fields.options['charting.chart.nullValueMode'] = value;
            });

            // legend tab
            this.controls.legendTab = new TabControl($('a[href="#legend"]').parents('li')[0]);
            this.controls.legendTab.setVisibility(constraintModulator.isValid({oneOf: ['legendposition', 'legendtruncation']}));
            this.controls.legendPosition = new TableRowSelectControl($('#legendposition')[0]);
            this.controls.legendPosition.setValue(this.panel.fields.options['charting.legend.placement'] || 'right');
            this.controls.legendPosition.setVisibility(constraintModulator.isValid({required: ['legendposition']}));
            this.controls.legendPosition.addValueChangeListener(function(value) {
                that.panel.fields.options['charting.legend.placement'] = value;
            });
            this.controls.legendTruncation = new TableRowInputRadioControl($('input[name="legendtruncation"]'));
            // enforce that the legend truncation has to be 'default', 'ellipsisStart', 'ellipsisEnd', 'ellipsisMiddle', or 'ellipsisNone'
            var legendTruncation;
            if(this.panel.fields.options['charting.legend.labelStyle.overflowMode']
                    in { 'default': true, ellipsisStart: true, ellipsisEnd: true, ellipsisMiddle: true, ellipsisNone: true }) {
                legendTruncation = this.panel.fields.options['charting.legend.labelStyle.overflowMode'];
                // ellipsisStart is the same as default
                if(legendTruncation === 'ellipsisStart') {
                    legendTruncation = 'default';
                }
            }
            this.controls.legendTruncation.setValue(legendTruncation || 'ellipsisMiddle');
            this.controls.legendTruncation.setVisibility(constraintModulator.isValid({required: ['legendtruncation']}));
            this.controls.legendTruncation.addValueChangeListener(function(value) {
                that.panel.fields.options['charting.legend.labelStyle.overflowMode'] = value;
            });

            // color ranges tab
            this.controls.axisTab = new TabControl($('a[href="#ranges"]').parents('li')[0]);
            this.controls.axisTab.setVisibility(constraintModulator.isValid({oneOf: ['gaugecolors']}));
            this.controls.gaugeStyle = new TableRowInputRadioControl($('input[name="gaugestyle"]'));
            this.controls.gaugeStyle.setValue(this.panel.fields.options['charting.chart.style'] || 'shiny');
            this.controls.gaugeStyle.setVisibility(constraintModulator.isValid({required: ['gaugestyle']}));
            this.controls.gaugeStyle.addValueChangeListener(function(value) {
                that.panel.fields.options['charting.chart.style'] = value;
            });
            // automatic vs manual mode for gauge range selection
            this.controls.gaugeRangeSelectMode = new InputRadioWithChildrenControl($('input[name="rangeselectmode"]'), [
                {value: 'automatic', element: $('#automatic-mode-message')[0]},
                {value: 'manual', element: $('#gaugecolorpicker')[0]}
            ]);

            this.controls.gaugeRangeSelectMode.setValue(this.panel.fields.options['charting.chart.rangeValues'] ? 'manual' : 'automatic');
            this.controls.gaugeRangeSelectMode.setVisibility(constraintModulator.isValid({required: ['gaugecolors']}));
            this.controls.gaugeRangeSelectMode.addValueChangeListener(function(value) {
                if(value === 'automatic') {
                    // we are in automatic mode, so erase any range/color settings
                    delete that.panel.fields.options['charting.chart.rangeValues'];
                    delete that.panel.fields.options['charting.gaugeColors'];
                }
                else {
                    // if we are in manual mode, load in the gauge color picker's state
                    var gaugeValue = that.controls.gaugeColorPicker.getValue();
                    that.panel.fields.options['charting.chart.rangeValues'] = PanelModel.serializeArray(gaugeValue.ranges);
                    that.panel.fields.options['charting.gaugeColors'] = PanelModel.serializeArray(gaugeValue.colors);
                }
            });
            // gauge color range selector
            if(this.gaugeColorPicker) {
                this.gaugeColorPicker.destroy();
            }
            this.gaugeColorPicker = new widgets.gaugeColorPicker($('#gaugecolorpicker')[0]);
            this.controls.gaugeColorPicker = new WidgetControl($('#gaugecolorpicker')[0], this.gaugeColorPicker);
            this.controls.gaugeColorPicker.setVisibility(constraintModulator.isValid({required: ['gaugecolors']}));
            this.controls.gaugeColorPicker.setValue({
                ranges: PanelModel.deserializeArrayAsFloats(this.panel.fields.options['charting.chart.rangeValues']) || [],
                colors: PanelModel.deserializeArray(this.panel.fields.options['charting.gaugeColors']) || ["0x84E900", "0xFFE800", "0xBF3030"]
            });
            this.controls.gaugeColorPicker.addValueChangeListener(function(value) {
                that.panel.fields.options['charting.chart.rangeValues'] = PanelModel.serializeArray(value.ranges);
                that.panel.fields.options['charting.gaugeColors'] = PanelModel.serializeArray(value.colors);
            });

            // single value before and after labels
            this.controls.beforeLabel = new TableRowInputControl($('#singlevaluebefore')[0]);
            this.controls.beforeLabel.setValue(this.panel.fields.options['beforeLabel'] || '');
            this.controls.beforeLabel.setVisibility(constraintModulator.isValid({required: ['singlevaluebefore']}));
            this.controls.beforeLabel.addValueChangeListener(function(value) {
                that.panel.fields.options['beforeLabel'] = value || '';
            });

            this.controls.underLabel = new TableRowInputControl($('#singlevalueunder')[0]);
            this.controls.underLabel.setValue(this.panel.fields.options['underLabel'] || '');
            this.controls.underLabel.setVisibility(constraintModulator.isValid({required: ['singlevalueunder']}));
            this.controls.underLabel.addValueChangeListener(function(value) {
                that.panel.fields.options['underLabel'] = value || '';
            });
            this.controls.afterLabel = new TableRowInputControl($('#singlevalueafter')[0]);
            this.controls.afterLabel.setValue(this.panel.fields.options['afterLabel'] || '');
            this.controls.afterLabel.setVisibility(constraintModulator.isValid({required: ['singlevalueafter']}));
            this.controls.afterLabel.addValueChangeListener(function(value) {
                that.panel.fields.options['afterLabel'] = value || '';
            });

            //'X-Axis' category
            this.controls.axisTab = new TabControl($('a[href="#xaxis"]').parents('li')[0]);
            this.controls.axisTab.setVisibility(constraintModulator.isValid({oneOf: ['xaxistitle']}));
            this.controls.xaxisTitle = new TableRowInputControl($('#xaxistitle')[0]);
            this.controls.xaxisTitle.setValue(this.panel.fields.options['charting.axisTitleX.text'] || this.panel.fields.options['charting.primaryAxisTitle.text'] || '');
            this.controls.xaxisTitle.setVisibility(constraintModulator.isValid({required: ['xaxistitle']}));
            this.controls.xaxisTitle.addValueChangeListener(function(value) {
                // trim leading/trailing whitespace, unless the entire string is whitespace
                if(!/^\s*$/.test(value)) {
                    value = value.replace(/^\s*/, '').replace(/\s*$/, '');
                }
                // blank out the deprecated field so it doesn't reappear later
                that.panel.fields.options['charting.primaryAxisTitle.text'] = '';
                that.panel.fields.options['charting.axisTitleX.text'] = value || '';
            });

            //'Y-Axis' category
            this.controls.axisTab = new TabControl($('a[href="#yaxis"]').parents('li')[0]);
            this.controls.axisTab.setVisibility(constraintModulator.isValid({oneOf: ['yaxistitle']}));
            this.controls.yaxisTitle = new TableRowInputControl($('#yaxistitle')[0]);
            this.controls.yaxisTitle.setValue(this.panel.fields.options['charting.axisTitleY.text'] || this.panel.fields.options['charting.secondaryAxisTitle.text'] || '');
            this.controls.yaxisTitle.setVisibility(constraintModulator.isValid({required: ['yaxistitle']}));
            this.controls.yaxisTitle.addValueChangeListener(function(value) {
                // trim leading/trailing whitespace, unless the entire string is whitespace
                if(!/^\s*$/.test(value)) {
                    value = value.replace(/^\s*/, '').replace(/\s*$/, '');
                }
                // blank out the deprecated field so it doesn't reappear later
                that.panel.fields.options['charting.secondaryAxisTitle.text'] = '';
                that.panel.fields.options['charting.axisTitleY.text'] = value || '';
            });

            this.controls.yaxisMajorUnit = new TableRowInputControl($('#yaxismajorunit')[0]);
            this.controls.yaxisMajorUnit.setValue(this.panel.fields.options['charting.axisLabelsY.majorUnit'] || '');
            this.controls.yaxisMajorUnit.setVisibility(constraintModulator.isValid({required: ['yaxismajorunit']}));
            this.controls.yaxisMajorUnit.addValueChangeListener(function(value) {
                that.panel.fields.options['charting.axisLabelsY.majorUnit'] = value;
            });

            this.controls.unitScale = new TableRowInputRadioControl($('input[name="unitscale"]'));
            // SPL-48458: sometimes meaningless values like "" creep in here, have to be explicit in making sure we only accept 'log' or 'linear'
            var yAxisScale;
            if(this.panel.fields.options['charting.axisY.scale'] in { linear: true, log: true }) {
                yAxisScale = this.panel.fields.options['charting.axisY.scale'];
            }
            else if(this.panel.fields.options['charting.secondaryAxis.scale'] in { linear: true, log: true }) {
                yAxisScale = this.panel.fields.options['charting.secondaryAxis.scale'];
            }
            this.controls.unitScale.setValue(yAxisScale || 'linear');
            this.controls.unitScale.setVisibility(constraintModulator.isValid({required: ['unitscale']}));
            this.controls.unitScale.addValueChangeListener(function(value) {
                // set the deprecated field also so it doesn't cause a conflict later
                that.panel.fields.options['charting.secondaryAxis.scale'] = value;
                that.panel.fields.options['charting.axisY.scale'] = value;
            });

            this.controls.yaxisMinValue = new TableRowInputControl($('#yaxisminvalue')[0]);
            this.controls.yaxisMinValue.setValue(this.panel.fields.options['charting.axisY.minimumNumber'] || this.panel.fields.options['charting.secondaryAxis.minimumNumber'] || '');
            this.controls.yaxisMinValue.setVisibility(constraintModulator.isValid({required: ['yaxisminvalue']}));
            this.controls.yaxisMinValue.addValueChangeListener(function(value) {
                // blank out the deprecated field so it doesn't reappear later
                that.panel.fields.options['charting.secondaryAxis.minimumNumber'] = '';
                that.panel.fields.options['charting.axisY.minimumNumber'] = value;
            });

            this.controls.yaxisMaxValue = new TableRowInputControl($('#yaxismaxvalue')[0]);
            this.controls.yaxisMaxValue.setValue(this.panel.fields.options['charting.axisY.maximumNumber'] || this.panel.fields.options['charting.secondaryAxis.maximumNumber'] || '');
            this.controls.yaxisMaxValue.setVisibility(constraintModulator.isValid({required: ['yaxismaxvalue']}));
            this.controls.yaxisMaxValue.addValueChangeListener(function(value) {
                // blank out the deprecated field so it doesn't reappear later
                that.panel.fields.options['charting.secondaryAxis.maximumNumber'] = '';
                that.panel.fields.options['charting.axisY.maximumNumber'] = value;
            });
        },
        /**
         * Stores current UI state to backend.
         */

        save: function() {
            this.tabs.clearErrors();
            this.panel.save(function(saveSuccessful) {
                if(saveSuccessful) {
                    // iframe friendly custom events
                    parent.$(parent.document).trigger('panelsave');
                }
                else {
                    // iframe friendly custrom events
                    parent.$(parent.document).trigger('panelerror');
                    this.displayErrors();
                }
            }.bind(this));
        },

        displayErrors: function() {
            var errors = this.panel.getErrors();
            if(!errors || errors.length < 1) {
                return;
            }
            var firstError = errors[0];
            switch(firstError.type) {
                case 'ajax failure':
                    this.tabs.displayError('#general', firstError.message);
                    break;
                case 'gauge range order':
                case 'gauge ranges incomplete':
                    this.tabs.displayError('#ranges', firstError.message);
                    break;
                case 'y-axis major unit':
                case 'y-axis min value':
                    this.tabs.displayError('#yaxis', firstError.message);
                    break;
                case 'y-axis max value':
                    this.tabs.displayError('#yaxis', firstError.message);
                    break;
                default:
                    // TODO: how to handle errors with unexcpected types?
                    break;
            }
        }
    };
    ns.ApplicationController = ApplicationController;

    //schemas
    var schemas = {
        table: [
            'drilldown',
            'title',
            'count',
            'displayRowNumbers',
            'dataOverlayMode'
        ],
        event: [
            'title',
            'count',
            'displayRowNumbers',
            'wrap'
        ],
        bar: [
            'title',
            'drilldownchart',
            'xaxistitle',
            'yaxistitle',
            'legendposition',
            'legendtruncation',
            'stack',
            'yaxismajorunit',
            'unitscale',
            'yaxisminvalue',
            'yaxismaxvalue'
        ],
        area: [
            'title',
            'drilldownchart',
            'xaxistitle',
            'yaxistitle',
            'legendposition',
            'legendtruncation',
            'stack',
            'nullvalues',
            'yaxismajorunit',
            'unitscale',
            'yaxisminvalue',
            'yaxismaxvalue'
        ],
        column: [
            'title',
            'drilldownchart',
            'xaxistitle',
            'yaxistitle',
            'legendposition',
            'legendtruncation',
            'stack',
            'yaxismajorunit',
            'unitscale',
            'yaxisminvalue',
            'yaxismaxvalue'
        ],
        bubble: [
            'title',
            'drilldownchart',
            'xaxistitle',
            'yaxistitle',
            'legendposition',
            'legendtruncation',
            'stack',
            'yaxismajorunit',
            'unitscale',
            'yaxisminvalue',
            'yaxismaxvalue'
        ],
        pie: [
            'title',
            'drilldownchart',
            'yaxistitle'
        ],
        scatter: [
            'title',
            'drilldownchart',
            'xaxistitle',
            'yaxistitle',
            'legendposition',
            'legendtruncation',
            'yaxismajorunit',
            'unitscale',
            'yaxisminvalue',
            'yaxismaxvalue'
        ],
        line: [
            'title',
            'drilldownchart',
            'xaxistitle',
            'yaxistitle',
            'legendposition',
            'legendtruncation',
            'nullvalues',
            'yaxismajorunit',
            'unitscale',
            'yaxisminvalue',
            'yaxismaxvalue'
        ],
        single: [
            'title',
            'singlevaluebefore',
            'singlevalueafter',
            'singlevalueunder'
        ],
        radialGauge: [
            'title',
            'gaugestyle',
            'gaugecolors'
        ],
        fillerGauge: [
            'title',
            'gaugestyle',
            'gaugecolors'
        ],
        markerGauge: [
            'title',
            'gaugestyle',
            'gaugecolors'
        ]
    };
    ns.schemas = schemas;
})(paneleditor);

