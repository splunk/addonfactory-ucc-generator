/**
 * @author jszeto
 * @date 5/27/14
 *
 * Represents the contents of a directory, including subdirectories and files
 *
 * For now, this model is faking the data. Once we integrate with the backend, we will be able
 * to provide the actual directory contents
 */
define([
    'jquery',
    'underscore',
    'models/Base'
],
    function(
        $,
        _,
        BaseModel
        ) {

        return BaseModel.extend({

            idAttribute: 'fullPath',
            defaults: {fullPath:"",
                rows:[],
                fields:[_("Type").t(), _("Name").t(), _("Size").t(), _("User").t(), _("Group").t(), _("Permissions").t(), _("Date").t()],
                pathArray:[]
            },
            isNew: function() {
                return false;
            },
            sync: function(method, model, options) {

                var resp,
                    state,
                    dfd = $.Deferred();
                options = options || {};

                if (method === 'read') {
                    resp = model.getDirectory();
                } else {
                    throw new Error('The DirectoryListing model is read-only: ' + method);
                }

                model.trigger('request', model, dfd, options);
                options.success(resp);
                return dfd.resolve().promise();
            },
            getDirectory: function() {
                var TOPDIR = {
                    fullPath:"",
                    pathArray:[],
                    rows: [
                        {Type:"dir", Name:".", Size:"", User:"jszeto", Group:"spectator", Permissions:"rwx------", Date:"2014-01-14 1:43"},
                        {Type:"dir", Name:"..", Size:"", User:"jszeto", Group:"spectator", Permissions:"rwx------", Date:"2014-08-30 12:01"},
                        {Type:"dir", Name:"user", Size:"", User:"jszeto", Group:"spectator", Permissions:"rwxrwx---", Date:"2014-05-27 12:01"}]
                };

                var USERDIR = {
                    fullPath:"user",
                    pathArray:["user"],
                    rows: [
                        {Type:"dir", Name:".", Size:"", User:"jszeto", Group:"spectator", Permissions:"rwx------", Date:"2014-01-14 1:43"},
                        {Type:"dir", Name:"..", Size:"", User:"jszeto", Group:"spectator", Permissions:"rwx------", Date:"2014-08-30 12:01"},
                        {Type:"dir", Name:"jszeto", Size:"", User:"jszeto", Group:"spectator", Permissions:"rwxrwx---", Date:"2014-05-27 12:01"}]
                };

                var JSZETODIR = {
                    fullPath:"user/jszeto",
                    pathArray:["user","jszeto"],
                    rows:[
                        {Type:"dir", Name:".", Size:"", User:"jszeto", Group:"spectator", Permissions:"rwx------", Date:"2014-01-14 1:43"},
                        {Type:"dir", Name:"..", Size:"", User:"jszeto", Group:"spectator", Permissions:"rwx------", Date:"2014-08-30 12:01"},
                        {Type:"dir", Name:"MLB", Size:"", User:"jszeto", Group:"spectator", Permissions:"rwxrwx---", Date:"2014-05-27 12:01"},
                        {Type:"dir", Name:"NBA", Size:"", User:"silver", Group:"commissioner", Permissions:"r--r--r--", Date:"2014-04-22 1:01"},
                        {Type:"dir", Name:"NFL", Size:"", User:"goodell", Group:"commissioner", Permissions:"rwx------", Date:"2014-11-07 4:31"},
                        {Type:"dir", Name:"NHL", Size:"", User:"jszeto", Group:"spectator", Permissions:"rwx------", Date:"2014-02-24 8:34"},
                        {Type:"file", Name:"leagueList.txt", Size:"12456", User:"jszeto", Group:"spectator", Permissions:"rwx------", Date:"2014-05-27 12:01"},
                        {Type:"file", Name:"salaryCap.txt", Size:"45748", User:"jszeto", Group:"spectator", Permissions:"rwx------", Date:"2012-10-27 12:01"}
                    ]
                };

                var LEAFDIR = {
                    fullPath:"user/jszeto/NBA",
                    pathArray:["user","jszeto","NBA"],
                    rows:[
                        {Type:"dir", Name:".", Size:"", User:"jszeto", Group:"spectator", Permissions:"rwx------", Date:"2014-01-14 1:43"},
                        {Type:"dir", Name:"..", Size:"", User:"jszeto", Group:"spectator", Permissions:"rwx------", Date:"2014-08-30 12:01"},
                        {Type:"file", Name:"roster.xls", Size:"2956", User:"jszeto", Group:"spectator", Permissions:"rwx------", Date:"2014-05-27 12:01"}]
                };

                var json;

                var dirID = this.get(this.idAttribute);

                switch(dirID) {
                    case "":
                        json = TOPDIR;
                        break;
                    case "user":
                        json = USERDIR;
                        break;
                    case "user/jszeto":
                        json = JSZETODIR;
                        break;
                    case "user/jszeto/NBA":
                        json = LEAFDIR;
                        break;
                    default:
                        json = LEAFDIR;
                }

                return json;
            }
        });
    });
