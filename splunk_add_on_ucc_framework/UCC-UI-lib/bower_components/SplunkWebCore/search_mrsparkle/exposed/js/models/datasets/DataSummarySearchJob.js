define(
    [
        'models/search/Job',
        'models/datasets/Column'
    ],
    function(
        SearchJob,
        Column
    ) {
        return SearchJob.extend({
            initialize: function() {
                SearchJob.prototype.initialize.apply(this, arguments);
            },

            appendStatsToSearch: function(initialSearch, options) {
                options = options || {};
                var search = initialSearch,
                    statsForColumns = [];

                search += this.generateInitialPipes(options.columns);

                search += ' | stats ';

                if (options.columns) {
                    options.columns.each(function(column) {
                        statsForColumns = statsForColumns.concat(this.createStatsForColumn(column));
                    }, this);
                }

                search += statsForColumns.join(', ');

                search += this.generateAdditionalPipes(options.columns);

                return search;
            },

            // This method generates the search string that populates resultJsonRows in Data Summary (aka. metrics view's statistical values)
            createStatsForColumn: function(column) {
                var stats = [],
                    name = column.get('name'),
                    type = column.get('type');

                if (column.isEpochTime()) {

                    stats.push('count(eval(isnum(\'' + name + '\'))) as "' + name + ':MatchedType"');
                    stats.push('count(eval(!isnum(\'' + name + '\') AND !isnull(\'' + name + '\'))) as "' +  name + ':MismatchedType"');
                    stats.push(this.generateNullValuesStat(name, name));

                    stats.push('min("' + name + '") as "' + name + ':Earliest"');
                    stats.push('max("' + name + '") as "' + name + ':Latest"');

                } else if (type === Column.TYPES._RAW) {

                    stats.push('count(eval(!isnull(\'' + name + '\'))) as "' + name + ':MatchedType"');
                    stats.push('count(eval(isnull(\'' + name + '\'))) as "' + name + ':MismatchedType"');
                    stats.push(this.generateNullValuesStat(name, name));

                    stats.push('max("_linecount") as "' + name + ':MaxLineCount"');
                    stats.push('avg("_linecount") as "' + name + ':AverageLineCount"');
                    stats.push('min("_linecount") as "' + name + ':MinLineCount"');

                } else if (type === Column.TYPES.NUMBER) {

                    stats.push('count(eval(isnum(\'' + name + '\'))) as "' + name + ':MatchedType"');
                    stats.push('count(eval(!isnum(\'' + name + '\') AND !isnull(\'' + name + '\'))) as "' + name + ':MismatchedType"');
                    stats.push(this.generateNullValuesStat(name));

                    stats.push(this.generateSingleValueStat(name));

                    stats.push(this.generateNumericStat(name, 'max', 'Maximum'));
                    stats.push(this.generateNumericStat(name, 'min', 'Minimum'));
                    stats.push(this.generateNumericStat(name, 'avg', 'Average'));
                    stats.push(this.generateNumericStat(name, 'median', 'Median'));
                    stats.push(this.generateNumericStat(name, 'mode', 'Mode'));
                    stats.push(this.generateNumericStat(name, 'stdev', 'StandardDeviation'));

                } else if (type === Column.TYPES.STRING) {

                    stats.push('count(eval(isstr(\'' + name + '\'))) as "' + name + ':MatchedType"');
                    stats.push('count(eval(!isstr(\'' + name + '\') AND !isnull(\'' + name + '\'))) as "' + name + ':MismatchedType"');
                    stats.push(this.generateNullValuesStat(name));

                    stats.push(this.generateSingleValueStat(name));
                    stats.push('count(eval(mvcount(\'' + name + '\') > 1)) as "' + name + ':Multivalue"');
                    stats.push('max(eval(mvcount(\'' + name + '\'))) as "' + name + ':MaxValueCount"');
                    stats.push('min(eval(mvcount(\'' + name + '\'))) as "' + name + ':MinValueCount"');
                    stats.push('mode(eval(mvcount(\'' + name + '\'))) as "' + name + ':ModeValueCount"');
                    stats.push('median(eval(mvcount(\'' + name + '\'))) as "' + name + ':MedianValueCount"');
                    stats.push('avg(eval(mvcount(\'' + name + '\'))) as "' + name + ':AverageValueCount"');

                    stats.push(this.generateUniqueValuesStat(name));

                } else if (type === Column.TYPES.BOOLEAN) {

                    stats.push('count(eval(\'' + name + '\'="true" OR \'' + name + '\'="false")) as "' + name + ':MatchedType"');
                    stats.push('count(eval(\'' + name + '\'!="true" AND \'' + name + '\'!="false")) as "' + name + ':MismatchedType"');
                    stats.push(this.generateNullValuesStat(name));

                    stats.push('count(eval(\'' + name + '\'="true")) as "' + name + ':CountTrue"');
                    stats.push('count(eval(\'' + name + '\'="false")) as "' + name + ':CountFalse"');

                } else if (type === Column.TYPES.IPV4) {
                    stats.push('count(eval(match(\'' + name + '\',"^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$"))) as "' + name + ':MatchedType"');
                    stats.push('count(eval(!match(\'' + name + '\',"^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$") AND !isnull(\'' + name + '\'))) as "' + name + ':MismatchedType"');
                    stats.push(this.generateNullValuesStat(name));

                    stats.push(this.generateSingleValueStat(name));
                    stats.push('count(eval(mvcount(\'' + name + '\') > 1)) as "' + name + ':Multivalue"');
                    stats.push('max(eval(mvcount(\'' + name + '\'))) as "' + name + ':MaxValueCount"');
                    stats.push('min(eval(mvcount(\'' + name + '\'))) as "' + name + ':MinValueCount"');
                    stats.push('mode(eval(mvcount(\'' + name + '\'))) as "' + name + ':ModeValueCount"');
                    stats.push('median(eval(mvcount(\'' + name + '\'))) as "' + name + ':MedianValueCount"');
                    stats.push('avg(eval(mvcount(\'' + name + '\'))) as "' + name + ':AverageValueCount"');

                    stats.push(this.generateUniqueValuesStat(name));

                }

                return stats;
            },

            generateNumericStat: function(fieldName, command, metricName) {
                return command + '(eval(if(isnum(\'' + fieldName + '\'), \'' + fieldName + '\', null()))) as "' + fieldName + ':' + metricName + '"';
            },

            generateNullValuesStat: function(fieldName, newName) {
                return 'count(eval(isnull(\'' + fieldName + '\'))) as "' + (newName || fieldName) + ':NullValues"';
            },

            generateUniqueValuesStat: function(fieldName, newName) {
                return 'dc("' + fieldName + '") as "' + (newName || fieldName) + ':UniqueValues"';
            },

            generateSingleValueStat: function(name) {
                return 'count(eval(mvcount(\'' + name + '\') == 1)) as "' + name + ':SingleValue"';
            },

            generateInitialPipes: function(columns) {
                var initialPipes = '';
                columns.each(function(column) {
                    if (column.get('type') === Column.TYPES._RAW) {
                        // Setup to calculate line count
                        initialPipes += ' | eval "_linecount" = len(replace(\'_raw\', "[^\\n\\r]+", "")) + 1';
                    }
                }, this);
                return initialPipes;
            },

            // Some field types require additional processing in the search string (e.g. time formatting)
            generateAdditionalPipes: function(columns) {
                var additionalPipes = '',
                    fieldName;
                columns.each(function(column) {
                    if (column.isEpochTime()) {
                        fieldName = column.get('name');
                        additionalPipes += ' | eval "' + fieldName + ':Earliest"=strftime(\'' + fieldName + ':Earliest\', "%F %T")';
                        additionalPipes += ' | eval "' + fieldName + ':Latest"=strftime(\'' + fieldName + ':Latest\', "%F %T")';
                    }
                }, this);

                return additionalPipes;
            }
        });
    }
);