define([
    'underscore',
    './functions/math',
    './functions/string',
    './functions/time',
    './functions/conditional',
    './functions/type',
    './functions/multivalue',
    './functions/misc',
    './functions/unsupported'
], function(_, math, string, time, cond, type, mv, misc, unsupported) {

    return _.extend({}, math, string, time, cond, type, mv, misc, unsupported);
    
});
