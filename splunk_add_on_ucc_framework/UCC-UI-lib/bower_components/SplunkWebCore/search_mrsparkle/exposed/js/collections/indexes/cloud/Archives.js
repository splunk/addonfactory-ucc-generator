/**
 * @author jszeto
 * @date 3/18/15
 *
 * Represents a list of Archives
 *
 * Cloud-specific endpoint that is only available if the Cloud Administration app has been installed
 * (https://github.com/SplunkStorm/cloud_apps)
 *
 * The response format should be a subset of the response from  the services/data/indexes endpoint
 */
define(
    [
        "underscore",
        "models/indexes/cloud/Archive",
        "collections/SplunkDsBase"
        //"collections/services/data/Archives"
    ],
    function(
        _,
        ArchiveModel,
        SplunkDsBaseCollection
    ) {
        return SplunkDsBaseCollection.extend({
            model: ArchiveModel,
            url: 'cluster_blaster_archives/sh_providers_manager',
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },

            generateArchives: function() {

                var archiveModels = [];
                var archives = [{name:"sales_backup", "s3.bucket.path":"s3://mysalesbackup", sourceIndexes:["salesEMEA", "salesNA"], archivedGBs:"9433", disabled:false, "s3.access.key":"YWhdsn9RbiQ1mqfHAvA0Ab4tHVknl1Emie3AzFv", "s3.secret.key": "h6IPlNSPOtuG3fc/X5l3u63ynjVJU3c5g9P9TJ", lastArchiveDate:new Date(2015,4,17,12,43,2)},
                    {name:"main", "s3.bucket.path":"s3://splunkmainbackup", sourceIndexes:["main"], archivedGBs:"32333", disabled:false, "s3.access.key":"YWhdsn9RbiQ1mqfHAvA0Ab4tHVknl1Emie3AzFv", "s3.secret.key": "h6IPlNSPOtuG3fc/X5l3u63ynjVJU3c5g9P9TJ",lastArchiveDate:new Date(2015,4,19,11,40,21)},
                    {name:"web_archive", "s3.bucket.path":"s3://webdatabackup", sourceIndexes:["weblogs","network"], archivedGBs:"3233", disabled:false, "s3.access.key":"YWhdsn9RbiQ1mqfHAvA0Ab4tHVknl1Emie3AzFv", "s3.secret.key": "h6IPlNSPOtuG3fc/X5l3u63ynjVJU3c5g9P9TJ",lastArchiveDate:new Date(2014,9,29,21,120,21)},
                    {name:"another_archive", "s3.bucket.path":"s3://splunkmainbackup", sourceIndexes:["security"], archivedGBs:"8733", disabled:true, "s3.access.key":"YWhdsn9RbiQ1mqfHAvA0Ab4tHVknl1Emie3AzFv", "s3.secret.key": "h6IPlNSPOtuG3fc/X5l3u63ynjVJU3c5g9P9TJ",lastArchiveDate:new Date(2015,4,3,11,10,21)},
                    {name:"backup_of_the_backup", "s3.bucket.path":"s3://backupsbackup", sourceIndexes:["marketing"], archivedGBs:"633", disabled:false, "s3.access.key":"YWhdsn9RbiQ1mqfHAvA0Ab4tHVknl1Emie3AzFv", "s3.secret.key": "h6IPlNSPOtuG3fc/X5l3u63ynjVJU3c5g9P9TJ", lastArchiveDate:new Date(2015,4,19,11,40,21)}
                ];

                _(archives).each(function(archive) {
                    var archiveModel = new ArchiveModel();
                    archiveModel.entry.content.set(archive);
                    archiveModel.entry.set("name",archive.name);
                    archiveModel.set("id", archive.name);
                    archiveModels.push(archiveModel);
                }, this);

                return archiveModels;
            }

        });
    }
);
