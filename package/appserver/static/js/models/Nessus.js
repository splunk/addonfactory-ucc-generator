// /*global define*/
// define([
//     'underscore',
//     'app/models/Base.Model',
//     'app/config/ContextMap'
// ], function (
//     _,
//     BaseModel,
//     ContextMap
// ) {
//     return BaseModel.extend({
//         url: [
//             ContextMap.restRoot,
//             ContextMap.nessus
//         ].join('/'),
//
//         initialize: function (attributes, options) {
//             options = options || {};
//             this.collection = options.collection;
//             BaseModel.prototype.initialize.call(this, attributes, options);
//             this.addValidation('url', this.validURL);
//             this.addValidation('metric', this.nonEmptyString);
//             this.addValidation('access_key', this.nonEmptyString);
//             this.addValidation('secret_key', this.nonEmptyString);
//             this.addValidation('start_date', this.validStartDate);
//             this.addValidation('batch_size', this.validBatchSize);
//             this.addValidation('index', this.nonEmptyString);
//             this.addValidation('interval', this.validInterval);
//         },
//
//         validURL: function (attr) {
//             var url = this.entry.content.get(attr);
//             if (!url || !url.match(/^https?\:\/\/[\w\-\./%\&\?]+(?::\d{1,5})?$/)) {
//                 return _('Field "Nessus Server URL" format is not correct').t();
//             }
//         },
//
//         validStartDate: function (attr) {
//             var startDate = this.entry.content.get(attr);
//             if (!startDate || !startDate.match(/^(19|20)\d\d\/(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])$/)) {
//                 return _('Field "Start Time" format is not correct').t();
//             }
//         },
//
//         validBatchSize: function (attr) {
//             var batchSize = this.entry.content.get(attr);
//             if (!batchSize) {
//                 return _('Field "Batch Size" format is not correct').t();
//             } else {
//                 batchSize = Number(batchSize);
//                 if (isNaN(batchSize) || batchSize != parseInt(batchSize, 10)) {
//                     return _('Field "Batch Size" is not valid').t();
//                 }else if (batchSize < 0) {
//                     return _('Field "Batch Size" should be positive number').t();
//                 } else if (batchSize!=0 && batchSize < 1000) {
//                     return _('Field "Batch Size" should be greater than or equal to 1000').t();
//                 }
//             }
//         },
//
//         validInterval: function (attr) {
//             var interval = this.entry.content.get(attr);
//             if (interval) {
//                 interval = Number(interval);
//                 if (isNaN(interval) || interval != parseInt(interval, 10)) {
//                     return _('Field "Interval" is not valid').t();
//                 } else if (interval <= 0) {
//                     return _('Field "Interval" should be positive number').t();
//                 }
//             } else {
//                 return _('Field "Interval" is required').t();
//             }
//         }
//     });
// });
