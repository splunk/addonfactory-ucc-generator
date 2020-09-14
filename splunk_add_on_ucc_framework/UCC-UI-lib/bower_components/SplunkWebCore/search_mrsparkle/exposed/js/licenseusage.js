define([
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "underscore",
    "jquery",
    "splunkjs/mvc/simplexml",
    "splunk.config",
    "splunk.util", 
    "util/splunkd_utils",
    "splunk.i18n",
    "uri/route"],
    
    function(mvc, utils, _, $, simpleXml, config, splunkUtils, splunkdUtils, i18n, route) {
        var root = (config.MRSPARKLE_ROOT_PATH.indexOf("/") == 0 ? config.MRSPARKLE_ROOT_PATH.substring(1) : config.MRSPARKLE_ROOT_PATH);
        var BASE_SUMMARY_SEARCH = "index=_internal [`set_local_host`] source=*license_usage.log* type=\"RolloverSummary\" earliest=-30d@d $PoolClause$";
        var BASE_USAGE_SEARCH = "index=_internal [`set_local_host`] source=*license_usage.log* type=\"Usage\" | eval h=if(len(h)=0 OR isnull(h),\"(SQUASHED)\",h) | eval s=if(len(s)=0 OR isnull(s),\"(SQUASHED)\",s) | eval idx=if(len(idx)=0 OR isnull(idx),\"(UNKNOWN)\",idx) | bin _time span=1d | stats sum(b) as b by _time, pool, s, st, h, idx $PoolClause$";
        var STACK_SIZE_SEARCH = splunkUtils.sprintf(" | join type=outer _time [search index=_internal [`set_local_host`] source=*license_usage.log* type=\"RolloverSummary\" earliest=-30d@d | eval _time=_time - 43200 | bin _time span=1d | stats latest(stacksz) AS \"%s\" by _time] | fields - _timediff ", _("stack size").t());
        var POOL_SIZE_SEARCH = splunkUtils.sprintf(" | join type=outer _time [search index=_internal [`set_local_host`] source=*license_usage.log* type=\"RolloverSummary\" earliest=-30d@d $PoolClause$ | eval _time=_time - 43200 | bin _time span=1d | stats latest(poolsz) AS  \"%s\" by _time] | fields - _timediff ", _("pool size").t());

        var GET_ALL_POOLS = "| rest splunk_server=local /services/licenser/pools | rename title AS pool | search [rest splunk_server=local /services/licenser/groups | search is_active=1 | eval stack_id=stack_ids | fields stack_id] | eval name=pool | eval value=\"pool=\\\"\". pool . \"\\\"\" | table name value";
        var TODAY_LICENSE_USAGE = "| rest splunk_server=local /services/licenser/pools | rename title AS Pool | search [rest splunk_server=local /services/licenser/groups | search is_active=1 | eval stack_id=stack_ids | fields stack_id] | join type=outer stack_id [rest splunk_server=local /services/licenser/stacks | eval stack_id=title | eval stack_quota=quota | fields stack_id stack_quota] | stats sum(used_bytes) as used max(stack_quota) as total | eval usedGB=round(used/1024/1024/1024,3) | eval totalGB=round(total/1024/1024/1024,3) | eval gauge_base=0 | eval gauge_danger=totalGB*0.8 | eval gauge_top=totalGB+0.001 | gauge usedGB gauge_base gauge_danger totalGB gauge_top";        
        var TODAY_LICENSE_USAGE_BY_POOL = splunkUtils.sprintf("| rest splunk_server=local /services/licenser/pools | rename title AS Pool | search [rest splunk_server=local /services/licenser/groups | search is_active=1 | eval stack_id=stack_ids | fields stack_id] | eval quota=if(isnull(effective_quota),quota,effective_quota) | eval \"%s\"=round(used_bytes/1024/1024/1024, 3) | eval \"%s\"=round(quota/1024/1024/1024, 3) | fields Pool \"%s\" \"%s\"", _("Used").t(), _("Quota").t(), _("Used").t(), _("Quota").t());
        var TODAY_LICENSE_USAGE_PCT = splunkUtils.sprintf("| rest splunk_server=local /services/licenser/pools | rename title AS Pool | search [rest splunk_server=local /services/licenser/groups | search is_active=1 | eval stack_id=stack_ids | fields stack_id] | eval quota=if(isnull(effective_quota),quota,effective_quota) | eval \"%s\"=round(used_bytes/quota*100,2) | fields Pool \"%s\"", _("% used").t(), _("% used").t());
        var POOL_WARNING = "| rest splunk_server=local /services/licenser/messages | where (category==\"license_window\" OR category==\"pool_over_quota\") AND create_time >= now() - (30 * 86400) | rename pool_id AS pool | eval warning_day=if(category==\"pool_over_quota\",\"(\".strftime(create_time,\"%B %e, %Y\").\")\",strftime(create_time-43200,\"%B %e, %Y\")) | fields pool warning_day | join outer pool [rest splunk_server=local /services/licenser/slaves | mvexpand active_pool_ids | eval slave_name=label | eval pool=active_pool_ids | fields pool slave_name | stats values(slave_name) as \"members\" by pool] | join outer pool [rest splunk_server=local /services/licenser/pools | eval pool=title | eval quota=if(isnull(effective_quota),quota,effective_quota) | eval quotaGB=round(quota/1024/1024/1024,3) | fields pool stack_id, quotaGB] |" + splunkUtils.sprintf("stats first(pool) as \"%s\" first(stack_id) as \"%s\" first(members) as \"%s\" first(quotaGB) as \"%s\" values(warning_day) AS \"%s\" by pool | fields - pool", _("Pool").t(), _("Stack ID").t(), _("Current Members").t(), _("Current Quota (GB)").t(), _("Warning Days - (Soft)/Hard").t());    
        var SLAVE_WARNING = splunkUtils.sprintf("| rest splunk_server=local /services/licenser/slaves | mvexpand active_pool_ids | where warning_count>0 | eval pool=active_pool_ids | join type=outer pool [rest splunk_server=local /services/licenser/pools | eval pool=title | fields pool stack_id] | eval in_violation=if(warning_count>4 OR (warning_count>2 AND stack_id==\"free\"),\"%s\",\"%s\") | fields label, title, pool, warning_count, in_violation | fields - _timediff | rename label as \"%s\" title as \"%s\" pool as \"%s\" warning_count as \"%s\" in_violation AS \"%s\"", _("yes").t(), _("no").t(), _("Slave").t(), _("GUID").t(), _("Pool").t(), _("Hard Warnings").t(), _("In Violation?").t());

        var LICENSE_USAGE_NOSPLIT =                         BASE_SUMMARY_SEARCH + splunkUtils.sprintf(" | eval _time=_time - 43200 | bin _time span=1d | stats latest(b) AS b by slave, pool, _time | timechart span=1d sum(b) AS \"%s\" fixedrange=false", _("volume").t()) + STACK_SIZE_SEARCH + " | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";
        var LICENSE_USAGE_NOSPLIT_POOL_SELECTED =           BASE_SUMMARY_SEARCH + splunkUtils.sprintf(" | eval _time=_time - 43200 | bin _time span=1d | stats latest(b) AS b by slave, pool, _time | timechart span=1d sum(b) AS \"%s\" fixedrange=false", _("volume").t()) + POOL_SIZE_SEARCH + " | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";        
        var LICENSE_USAGE_BY_POOL =                         BASE_SUMMARY_SEARCH + splunkUtils.sprintf(" | eval _time=_time - 43200 | bin _time span=1d | stats latest(b) AS b by slave, pool, _time | timechart span=1d sum(b) AS \"%s\" by pool fixedrange=false", _("volume").t()) + STACK_SIZE_SEARCH + " | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";
        var LICENSE_USAGE_BY_POOL_POOL_SELECTED =           BASE_SUMMARY_SEARCH + splunkUtils.sprintf(" | eval _time=_time - 43200 | bin _time span=1d | stats latest(b) AS b by slave, pool, _time | timechart span=1d sum(b) AS \"%s\" by pool fixedrange=false", _("volume").t()) + POOL_SIZE_SEARCH + " | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";
        var LICENSE_USAGE_BY_INDEXER =                      BASE_SUMMARY_SEARCH + splunkUtils.sprintf(" | eval _time=_time - 43200 | bin _time span=1d | stats latest(b) AS b by slave, pool, _time | eval slave_guid=slave | stats max(b) AS volume by slave_guid, _time | join type=outer slave_guid [rest splunk_server=local /services/licenser/slaves | rename label AS slave_name title AS slave_guid | table slave_guid slave_name] | eval slave_name = if(isnotnull(slave_name),slave_name,\"GUID: \".slave_guid) | timechart span=1d max(volume) AS \"%s\" by slave_name fixedrange=false", _("volume").t()) + STACK_SIZE_SEARCH + " | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";
        var LICENSE_USAGE_BY_INDEXER_POOL_SELECTED =        BASE_SUMMARY_SEARCH + splunkUtils.sprintf(" | eval _time=_time - 43200 | bin _time span=1d | stats latest(b) AS b by slave, pool, _time | eval slave_guid=slave | stats max(b) AS volume by slave_guid, _time | join type=outer slave_guid [rest splunk_server=local /services/licenser/slaves | rename label AS slave_name title AS slave_guid | table slave_guid slave_name] | eval slave_name = if(isnotnull(slave_name),slave_name,\"GUID: \".slave_guid) | timechart span=1d max(volume) AS \"%s\" by slave_name fixedrange=false", _("volume").t()) + POOL_SIZE_SEARCH + " | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";
        var LICENSE_USAGE_BY_SOURCETYPE =                   BASE_USAGE_SEARCH + " | timechart span=1d sum(b) AS volumeB by st fixedrange=false " + STACK_SIZE_SEARCH + " | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";
        var LICENSE_USAGE_BY_SOURCETYPE_POOL_SELECTED =     BASE_USAGE_SEARCH + " | timechart span=1d sum(b) AS volumeB by st fixedrange=false " + POOL_SIZE_SEARCH + " | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";
        var LICENSE_USAGE_BY_HOST =                         BASE_USAGE_SEARCH + " | timechart span=1d sum(b) AS volumeB by h fixedrange=false " + STACK_SIZE_SEARCH + " | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";
        var LICENSE_USAGE_BY_HOST_POOL_SELECTED =           BASE_USAGE_SEARCH + " | timechart span=1d sum(b) AS volumeB by h fixedrange=false " + POOL_SIZE_SEARCH + " | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";
        var LICENSE_USAGE_BY_SOURCE =                       BASE_USAGE_SEARCH + " | timechart span=1d sum(b) AS volumeB by s fixedrange=false " + STACK_SIZE_SEARCH + " | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";
        var LICENSE_USAGE_BY_SOURCE_POOL_SELECTED =         BASE_USAGE_SEARCH + " | timechart span=1d sum(b) AS volumeB by s fixedrange=false " + POOL_SIZE_SEARCH + " | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";
        var LICENSE_USAGE_BY_INDEX =                        BASE_USAGE_SEARCH + " | timechart span=1d sum(b) AS volumeB by idx fixedrange=false " + STACK_SIZE_SEARCH + " | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";
        var LICENSE_USAGE_BY_INDEX_POOL_SELECTED =          BASE_USAGE_SEARCH + " | timechart span=1d sum(b) AS volumeB by idx fixedrange=false " + POOL_SIZE_SEARCH + " | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";

        var LICENSE_USAGE_NOSPLIT_PCT =                     BASE_SUMMARY_SEARCH + splunkUtils.sprintf(" | eval _time=_time - 43200 | bin _time span=1d | stats latest(b) AS b latest(stacksz) AS stacksz by slave, pool, _time | stats sum(b) AS volumeB max(stacksz) AS stacksz by _time | eval pctused=round(volumeB/stacksz*100,2) | timechart span=1d max(pctused) AS \"%s\" fixedrange=false", _("% used").t());
        var LICENSE_USAGE_NOSPLIT_PCT_POOL_SELECTED =       BASE_SUMMARY_SEARCH + splunkUtils.sprintf(" | eval _time=_time - 43200 | bin _time span=1d | stats latest(b) AS b latest(poolsz) AS poolsz by slave, pool, _time | stats sum(b) AS volumeB max(poolsz) AS poolsz by _time | eval pctused=round(volumeB/poolsz*100,2) | timechart span=1d max(pctused) AS \"%s\" fixedrange=false", _("% used").t());            
        var LICENSE_USAGE_BY_POOL_PCT =                     BASE_SUMMARY_SEARCH + splunkUtils.sprintf(" | eval _time=_time - 43200 | bin _time span=1d | stats latest(b) AS b latest(stacksz) AS stacksz by slave, pool, _time | stats sum(b) AS volumeB max(stacksz) AS stacksz by pool, _time | eval pctused=round(volumeB/stacksz*100,2) | timechart span=1d max(pctused) AS \"%s\" by pool fixedrange=false", _("% used").t());         
        var LICENSE_USAGE_BY_POOL_PCT_POOL_SELECTED =       BASE_SUMMARY_SEARCH + splunkUtils.sprintf(" | eval _time=_time - 43200 | bin _time span=1d | stats latest(b) AS b latest(poolsz) AS poolsz by slave, pool, _time | stats sum(b) AS volumeB max(poolsz) AS poolsz by pool, _time | eval pctused=round(volumeB/poolsz*100,2) | timechart span=1d max(pctused) AS \"%s\" by pool fixedrange=false", _("% used").t());                         
        var LICENSE_USAGE_BY_INDEXER_PCT =                  BASE_SUMMARY_SEARCH + splunkUtils.sprintf(" | eval _time=_time - 43200 | bin _time span=1d | stats latest(b) AS b latest(stacksz) AS stacksz by slave, pool, _time | stats sum(b) AS volumeB max(stacksz) AS stacksz by slave, _time | eval pctused=round(volumeB/stacksz*100,2)| eval slave_guid=slave | join type=outer slave_guid [rest splunk_server=local /services/licenser/slaves | rename label AS slave_name title AS slave_guid | table slave_guid slave_name] | eval slave_name = if(isnotnull(slave_name),slave_name,\"GUID: \".slave_guid) | timechart span=1d max(pctused) AS \"%s\" by slave_name fixedrange=false", _("% used").t());
        var LICENSE_USAGE_BY_INDEXER_PCT_POOL_SELECTED =    BASE_SUMMARY_SEARCH + splunkUtils.sprintf(" | eval _time=_time - 43200 | bin _time span=1d | stats latest(b) AS b latest(poolsz) AS poolsz by slave, pool, _time | stats sum(b) AS volumeB max(poolsz) AS poolsz by slave, _time | eval pctused=round(volumeB/poolsz*100,2) | eval slave_guid=slave | join type=outer slave_guid [rest splunk_server=local /services/licenser/slaves | rename label AS slave_name title AS slave_guid | table slave_guid slave_name] | eval slave_name = if(isnotnull(slave_name),slave_name,\"GUID: \".slave_guid) | timechart span=1d max(pctused) AS \"%s\" by slave_name fixedrange=false", _("% used").t());
        var LICENSE_USAGE_BY_SOURCETYPE_PCT =               BASE_USAGE_SEARCH + " | join _time pool type=outer [search index=_internal source=*license_usage.log* type=\"RolloverSummary\" earliest=-30d@d | eval _time=_time - 43200 | bin _time span=1d | stats latest(stacksz) AS stacksz by slave, pool, _time | stats max(stacksz) AS stacksz by _time, pool] | stats sum(b) AS bytes_used max(stacksz) AS stacksz by st, _time | timechart span=1d max(eval(round(bytes_used/stacksz*100,2))) by st fixedrange=false"; 
        var LICENSE_USAGE_BY_SOURCETYPE_PCT_POOL_SELECTED = BASE_USAGE_SEARCH + " | join _time pool type=outer [search index=_internal source=*license_usage.log* type=\"RolloverSummary\" earliest=-30d@d | eval _time=_time - 43200 | bin _time span=1d | stats latest(poolsz) AS poolsz by slave, pool, _time | stats max(poolsz) AS poolsz by pool, _time] | stats sum(b) AS bytes_used max(poolsz) AS poolsz by st, _time | timechart span=1d max(eval(round(bytes_used/poolsz*100,2))) by st fixedrange=false";        
        var LICENSE_USAGE_BY_HOST_PCT =                     BASE_USAGE_SEARCH + " | join _time pool type=outer [search index=_internal source=*license_usage.log* type=\"RolloverSummary\" earliest=-30d@d | eval _time=_time - 43200 | bin _time span=1d | stats latest(stacksz) AS stacksz by slave, pool, _time | stats max(stacksz) AS stacksz by _time, pool] | stats sum(b) AS bytes_used max(stacksz) AS stacksz by h, _time | timechart span=1d max(eval(round(bytes_used/stacksz*100,2))) by h fixedrange=false"; 
        var LICENSE_USAGE_BY_HOST_PCT_POOL_SELECTED =       BASE_USAGE_SEARCH + " | join _time pool type=outer [search index=_internal source=*license_usage.log* type=\"RolloverSummary\" earliest=-30d@d | eval _time=_time - 43200 | bin _time span=1d | stats latest(poolsz) AS poolsz by slave, pool, _time | stats max(poolsz) AS poolsz by pool, _time] | stats sum(b) AS bytes_used max(poolsz) AS poolsz by h, _time | timechart span=1d max(eval(round(bytes_used/poolsz*100,2))) by h fixedrange=false";        
        var LICENSE_USAGE_BY_SOURCE_PCT =                   BASE_USAGE_SEARCH + " | join _time pool type=outer [search index=_internal source=*license_usage.log* type=\"RolloverSummary\" earliest=-30d@d | eval _time=_time - 43200 | bin _time span=1d | stats latest(stacksz) AS stacksz by slave, pool, _time | stats max(stacksz) AS stacksz by _time, pool] | stats sum(b) AS bytes_used max(stacksz) AS stacksz by s, _time | timechart span=1d max(eval(round(bytes_used/stacksz*100,2))) by s fixedrange=false"; 
        var LICENSE_USAGE_BY_SOURCE_PCT_POOL_SELECTED =     BASE_USAGE_SEARCH + " | join _time pool type=outer [search index=_internal source=*license_usage.log* type=\"RolloverSummary\" earliest=-30d@d | eval _time=_time - 43200 | bin _time span=1d | stats latest(poolsz) AS poolsz by slave, pool, _time | stats max(poolsz) AS poolsz by pool, _time] | stats sum(b) AS bytes_used max(poolsz) AS poolsz by s, _time | timechart span=1d max(eval(round(bytes_used/poolsz*100,2))) by s fixedrange=false";
        var LICENSE_USAGE_BY_INDEX_PCT =                    BASE_USAGE_SEARCH + " | join _time pool type=outer [search index=_internal source=*license_usage.log* type=\"RolloverSummary\" earliest=-30d@d | eval _time=_time - 43200 | bin _time span=1d | stats latest(stacksz) AS stacksz by slave, pool, _time | stats max(stacksz) AS stacksz by _time, pool] | stats sum(b) AS bytes_used max(stacksz) AS stacksz by idx, _time | timechart span=1d max(eval(round(bytes_used/stacksz*100,2))) by idx fixedrange=false"; 
        var LICENSE_USAGE_BY_INDEX_PCT_POOL_SELECTED =      BASE_USAGE_SEARCH + " | join _time pool type=outer [search index=_internal source=*license_usage.log* type=\"RolloverSummary\" earliest=-30d@d | eval _time=_time - 43200 | bin _time span=1d | stats latest(poolsz) AS poolsz by slave, pool, _time | stats max(poolsz) AS poolsz by pool, _time] | stats sum(b) AS bytes_used max(poolsz) AS poolsz by idx, _time | timechart span=1d max(eval(round(bytes_used/poolsz*100,2))) by idx fixedrange=false";
        
        var LICENSE_USAGE_NOSPLIT_MAXAVG =                  BASE_SUMMARY_SEARCH + splunkUtils.sprintf(" | eval _time=_time - 43200 | bin _time span=1d | stats latest(b) AS b by slave, pool, _time | stats sum(b) AS volume by _time | stats avg(volume) AS avgVolume max(volume) AS maxVolume  | eval maxVolumeGB=round(maxVolume/1024/1024/1024,3) | eval avgVolumeGB=round(avgVolume/1024/1024/1024,3) | rename avgVolumeGB AS \"%s\" maxVolumeGB AS \"%s\" | eval \"%s\" = \"\" | fields \"%s\", \"%s\", \"%s\"", _("average").t(), _("peak").t(), _("All Pools").t(), _("All Pools").t(), _("average").t(), _("peak").t());
        var LICENSE_USAGE_BY_POOL_MAXAVG =                  BASE_SUMMARY_SEARCH + splunkUtils.sprintf(" | eval _time=_time - 43200 | bin _time span=1d | stats latest(b) AS b by slave, pool, _time | stats sum(b) AS volume by pool, _time  | stats avg(volume) AS avgVolume max(volume) AS maxVolume by pool | eval maxVolumeGB=round(maxVolume/1024/1024/1024,3) | eval avgVolumeGB=round(avgVolume/1024/1024/1024,3) | rename avgVolumeGB AS \"%s\" maxVolumeGB AS \"%s\" pool as \"%s\" | fields \"%s\", \"%s\", \"%s\" | sort 5 - \"%s\"", _("average").t(), _("peak").t(), _("Pool").t(),  _("Pool").t(), _("average").t(), _("peak").t(), _("average").t());
        var LICENSE_USAGE_BY_INDEXER_MAXAVG =               BASE_SUMMARY_SEARCH + splunkUtils.sprintf(" | eval _time=_time - 43200 | bin _time span=1d | stats latest(b) AS b by slave, pool, _time | eval slave_guid=slave | stats sum(b) AS volume by slave_guid, _time | stats avg(volume) AS avgVolume max(volume) AS maxVolume by slave_guid | join type=outer slave_guid [rest splunk_server=local /services/licenser/slaves | rename label AS slave_name title AS slave_guid | table slave_guid slave_name] | eval slave_name = if(isnotnull(slave_name),slave_name,\"GUID: \".slave_guid) | foreach *Volume [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)] |  rename slave_name as \"%s\" avgVolume AS \"%s\" maxVolume AS \"%s\" | sort 5 - \"%s\" | fields \"%s\", \"%s\", \"%s\" | fields - _timediff, slave_guid", _("Indexer").t(), _("average").t(), _("peak").t(), _("average").t(), _("Indexer").t(), _("average").t(), _("peak").t());
        var LICENSE_USAGE_BY_SOURCETYPE_MAXAVG =            BASE_USAGE_SEARCH + splunkUtils.sprintf(" |  stats sum(b) AS volume by st, _time | stats avg(volume) AS avgVolume max(volume) AS maxVolume by st | eval avgVolumeGB=round(avgVolume/1024/1024/1024,3) | eval maxVolumeGB=round(maxVolume/1024/1024/1024,3) | fields st, avgVolumeGB, maxVolumeGB | rename avgVolumeGB AS \"%s\" maxVolumeGB AS \"%s\" st AS \"%s\" | sort 5 - \"%s\"", _("average").t(), _("peak").t(), _("Sourcetype").t(), _("average").t());
        var LICENSE_USAGE_BY_HOST_MAXAVG =                  BASE_USAGE_SEARCH + splunkUtils.sprintf(" |  stats sum(b) AS volume by h, _time | stats avg(volume) AS avgVolume max(volume) AS maxVolume by h | eval avgVolumeGB=round(avgVolume/1024/1024/1024,3) | eval maxVolumeGB=round(maxVolume/1024/1024/1024,3) | fields h, avgVolumeGB, maxVolumeGB | rename avgVolumeGB AS \"%s\" maxVolumeGB AS \"%s\" h AS \"%s\" | sort 5 - \"%s\"", _("average").t(), _("peak").t(), _("Host").t(), _("average").t());
        var LICENSE_USAGE_BY_SOURCE_MAXAVG =                BASE_USAGE_SEARCH + splunkUtils.sprintf(" |  stats sum(b) AS volume by s, _time | stats avg(volume) AS avgVolume max(volume) AS maxVolume by s | eval avgVolumeGB=round(avgVolume/1024/1024/1024,3) | eval maxVolumeGB=round(maxVolume/1024/1024/1024,3) | fields s, avgVolumeGB, maxVolumeGB | rename avgVolumeGB AS \"%s\" maxVolumeGB AS \"%s\" s AS \"%s\" | sort 5 - \"%s\"", _("average").t(), _("peak").t(), _("Source").t(), _("average").t());
        var LICENSE_USAGE_BY_INDEX_MAXAVG =                 BASE_USAGE_SEARCH + splunkUtils.sprintf(" |  stats sum(b) AS volume by idx, _time | stats avg(volume) AS avgVolume max(volume) AS maxVolume by idx | eval avgVolumeGB=round(avgVolume/1024/1024/1024,3) | eval maxVolumeGB=round(maxVolume/1024/1024/1024,3) | fields idx, avgVolumeGB, maxVolumeGB | rename avgVolumeGB AS \"%s\" maxVolumeGB AS \"%s\" idx AS \"%s\" | sort 5 - \"%s\"", _("average").t(), _("peak").t(), _("Index").t(), _("average").t());

        var REMOVE_STACK_SIZE = splunkUtils.sprintf(" | fields - \"%s\"", _("stack size").t());
        var REMOVE_POOL_SIZE = splunkUtils.sprintf(" | fields - \"%s\"", _("pool size").t());

        var AVGMAX_TITLE = _("Average and Peak Daily Volume").t();
        var AVGMAX_TOP5_TITLE = _("Top 5 by Average Daily Volume").t();
        var SAVED_SEARCH_NAME = "License Usage Data Cube";

        var SQUASHED_VALUE_MSG = splunkUtils.sprintf(_("You have selected \"%s\" or \"%s\" from the \"%s\" menu. You might see usage reported for a \"%s\" series. This is expected behavior if you have many unique hosts or sources.  <a href=\"%s\" target=\"_blank\" title=\"%s\">%s</a>").t(), _("host").t(), _("source").t(), _("Split by").t(), _("(SQUASHED)").t(), route.docHelp(root, config.LOCALE, "learnmore.license.usage_squashing"), _("Splunk help").t(), _("Learn more").t());        
        var UNKNOWN_VALUE_MSG = splunkUtils.sprintf(_("You have selected \"%s\" from the \"%s\" menu. If your license slaves are running a version of Splunk lower than 6.0, they will not report per index usage and you will see their usage labeled as \"%s\".").t(), _("index").t(), _("Split by").t(), _("(UNKNOWN)").t());

        var accelerationUrl = route.manager(root, config.LOCALE, "search", ["saved", "searches", "License Usage Data Cube"], {data:{action: "edit", ns: "search"}});
        var NO_SUMMARY_MSG = splunkUtils.sprintf(_("The report that powers these panels is not accelerated.  For faster performance, you might wish to <a href=\"%s\" target=\"_blank\" title=\"%s\">%s</a>. <a href=\"%s\" target=\"_blank\" title=\"%s\">%s</a>").t(), accelerationUrl, _("Search Acceleration").t(), _("turn on acceleration for this report").t(), route.docHelp(root, config.LOCALE, "learnmore.license.usage_acceleration"), _("Splunk help").t(), _("Learn more").t());

        var historicChartsCreated=false;
        var chartUsageToday = null;
        var chartUsagePerPoolToday = null;
        var chartPctUsagePerPoolToday = null;
        var chartUsage30days = null;
        var chartPctUsage30days = null;
        var chartAvgMaxUsage30days = null;

        var OverlayStyle = {
            NONE: 0,
            STACK: 1,
            POOL: 2
        };

        var HistoricSearches = {
           "license_usage_no_split" : {
               "pool" : {"overlay" : {"dailySearch" : LICENSE_USAGE_NOSPLIT_POOL_SELECTED }, "nooverlay" : {"dailySearch" : LICENSE_USAGE_NOSPLIT_POOL_SELECTED + REMOVE_POOL_SIZE}, "pctSearch" : LICENSE_USAGE_NOSPLIT_PCT_POOL_SELECTED},
               "nopool" : {"overlay" : {"dailySearch" : LICENSE_USAGE_NOSPLIT}, "nooverlay" : { "dailySearch" : LICENSE_USAGE_NOSPLIT + REMOVE_STACK_SIZE}, "pctSearch" : LICENSE_USAGE_NOSPLIT_PCT},
               "maxAvgSearch" : LICENSE_USAGE_NOSPLIT_MAXAVG
            },
            "license_usage_by_pool" : {
                  "pool" : {"overlay" : {"dailySearch" : LICENSE_USAGE_BY_POOL_POOL_SELECTED }, "nooverlay" : {"dailySearch" : LICENSE_USAGE_BY_POOL_POOL_SELECTED + REMOVE_POOL_SIZE}, "pctSearch" : LICENSE_USAGE_BY_POOL_PCT_POOL_SELECTED},
                  "nopool" : {"overlay" : {"dailySearch" : LICENSE_USAGE_BY_POOL}, "nooverlay" : { "dailySearch" : LICENSE_USAGE_BY_POOL + REMOVE_STACK_SIZE}, "pctSearch" : LICENSE_USAGE_BY_POOL_PCT},
                  "maxAvgSearch" : LICENSE_USAGE_BY_POOL_MAXAVG
            },
            "license_usage_by_indexer" : {
                "pool" : {"overlay" : {"dailySearch" : LICENSE_USAGE_BY_INDEXER_POOL_SELECTED }, "nooverlay" : {"dailySearch" : LICENSE_USAGE_BY_INDEXER_POOL_SELECTED + REMOVE_POOL_SIZE}, "pctSearch" : LICENSE_USAGE_BY_INDEXER_PCT_POOL_SELECTED},
                "nopool" : {"overlay" : {"dailySearch" : LICENSE_USAGE_BY_INDEXER}, "nooverlay" : { "dailySearch" : LICENSE_USAGE_BY_INDEXER + REMOVE_STACK_SIZE}, "pctSearch" : LICENSE_USAGE_BY_INDEXER_PCT},
                "maxAvgSearch" : LICENSE_USAGE_BY_INDEXER_MAXAVG
            },
            "license_usage_by_sourcetype" : {
                "pool" : {"overlay" : {"dailySearch" : LICENSE_USAGE_BY_SOURCETYPE_POOL_SELECTED }, "nooverlay" : {"dailySearch" : LICENSE_USAGE_BY_SOURCETYPE_POOL_SELECTED + REMOVE_POOL_SIZE}, "pctSearch" : LICENSE_USAGE_BY_SOURCETYPE_PCT_POOL_SELECTED},
                "nopool" : {"overlay" : {"dailySearch" : LICENSE_USAGE_BY_SOURCETYPE}, "nooverlay" : { "dailySearch" : LICENSE_USAGE_BY_SOURCETYPE + REMOVE_STACK_SIZE},"pctSearch" : LICENSE_USAGE_BY_SOURCETYPE_PCT},
                "maxAvgSearch" : LICENSE_USAGE_BY_SOURCETYPE_MAXAVG
            },
            "license_usage_by_host" : {
               "pool" : {"overlay" : {"dailySearch" : LICENSE_USAGE_BY_HOST_POOL_SELECTED }, "nooverlay" : {"dailySearch" : LICENSE_USAGE_BY_HOST_POOL_SELECTED + REMOVE_POOL_SIZE}, "pctSearch" : LICENSE_USAGE_BY_HOST_PCT_POOL_SELECTED},
               "nopool" : {"overlay" : {"dailySearch" : LICENSE_USAGE_BY_HOST}, "nooverlay" : { "dailySearch" : LICENSE_USAGE_BY_HOST + REMOVE_STACK_SIZE}, "pctSearch" : LICENSE_USAGE_BY_HOST_PCT},
               "maxAvgSearch" : LICENSE_USAGE_BY_HOST_MAXAVG
            },
            "license_usage_by_source" : {
               "pool" : {"overlay" : {"dailySearch" : LICENSE_USAGE_BY_SOURCE_POOL_SELECTED }, "nooverlay" : {"dailySearch" : LICENSE_USAGE_BY_SOURCE_POOL_SELECTED + REMOVE_POOL_SIZE}, "pctSearch" : LICENSE_USAGE_BY_SOURCE_PCT_POOL_SELECTED},
               "nopool" : {"overlay" : {"dailySearch" : LICENSE_USAGE_BY_SOURCE}, "nooverlay" : { "dailySearch" : LICENSE_USAGE_BY_SOURCE + REMOVE_STACK_SIZE}, "pctSearch" : LICENSE_USAGE_BY_SOURCE_PCT},
               "maxAvgSearch" : LICENSE_USAGE_BY_SOURCE_MAXAVG
            },
            "license_usage_by_index" : {
               "pool" : {"overlay" : {"dailySearch" : LICENSE_USAGE_BY_INDEX_POOL_SELECTED }, "nooverlay" : {"dailySearch" : LICENSE_USAGE_BY_INDEX_POOL_SELECTED + REMOVE_POOL_SIZE}, "pctSearch" : LICENSE_USAGE_BY_INDEX_PCT_POOL_SELECTED},
               "nopool" : {"overlay" : {"dailySearch" : LICENSE_USAGE_BY_INDEX}, "nooverlay" : { "dailySearch" : LICENSE_USAGE_BY_INDEX + REMOVE_STACK_SIZE}, "pctSearch" : LICENSE_USAGE_BY_INDEX_PCT},
               "maxAvgSearch" : LICENSE_USAGE_BY_INDEX_MAXAVG
            }
        };

        // Create charts on the 30-day tab (do it only first time this tab is selected)
        function createHistoricCharts() {
            if (historicChartsCreated)
                return;

            chartUsage30days = new ChartElement({
                "id": "element6",
                "charting.axisTitleX.text":_("Date").t(),
                "charting.gaugeAutoRanges": "1",
                "charting.legend.placement": "right",
                "charting.gaugeColors": "[\"84E900\",\"FFE800\",\"BF3030\"]",
                "charting.chart.stackMode": "stacked",
                "charting.axisY.scale": "linear",
                "charting.axisX.scale": "linear",
                "charting.chart.style": "shiny",
                "charting.chart.nullValueMode": "connect",
                "charting.chart": "column",
                "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
                "charting.drilldown": "1",
                "charting.axisTitleY.text":_("GB").t(),
                "charting.height": "300",
                "charting.chart.rangeValues": "[\"0\",\"30\",\"70\",\"100\"]",
                "charting.chart.overlayFields": "",
                "charting.lineDashStyle":"ShortDash",
                "managerid": "search6",
                "el": $('#element6')
            }).render();
       
            splunkjs.mvc.Components.get('element6').on("drilldown", function(e){
                e.defaultDrilldown();
            });
    
            chartPctUsage30days = new ChartElement({
                "id": "element7",
                "charting.axisTitleX.text": _("Date").t(),
                "charting.gaugeAutoRanges": "1",
                "charting.chart.rangeValues": "[\"0\",\"30\",\"70\",\"100\"]",
                "charting.gaugeColors": "[\"84E900\",\"FFE800\",\"BF3030\"]",
                "charting.chart.stackMode":"stacked",
                "charting.axisY.scale": "linear",
                "charting.chart.style": "shiny",
                "charting.axisX.scale": "linear",
                "charting.chart.nullValueMode": "gaps",
                "charting.chart": "column",
                "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
                "charting.drilldown": "1",
                "charting.axisTitleY.text": "%",
                "charting.height": "300",
                "charting.legend.placement": "right",
                "managerid": "search7",
                "el": $('#element7')
            }).render();
    
            splunkjs.mvc.Components.get('element7').on("drilldown", function(e){
                e.defaultDrilldown();
            });
    
            chartAvgMaxUsage30days = new ChartElement({
                "id": "element8",
                "charting.axisTitleX.text": " ",    // IB Change
                "charting.gaugeAutoRanges": "1",
                "charting.legend.placement": "right",
                "charting.gaugeColors": "[\"84E900\",\"FFE800\",\"BF3030\"]",
                "charting.chart.stackMode": "default",
                "charting.axisY.scale": "linear",
                "charting.axisX.scale": "linear",
                "charting.chart.style": "shiny",
                "charting.chart.nullValueMode": "gaps",
                "charting.chart": "column",
                "charting.legend.labelStyle.overflowMode": "ellipsisEnd",
                "charting.drilldown": "1",
                "charting.axisTitleY.text": _("GB").t(),
                "charting.height": "300",
                "charting.chart.rangeValues": "[\"0\",\"30\",\"70\",\"100\"]",
                "managerid": "search8",
                "el": $('#element8')
            }).render();
    
            splunkjs.mvc.Components.get('element8').on("drilldown", function(e){
                e.defaultDrilldown();
            });
    
            var poolSelected = poolDropdown.val().length > 1 ? true : false;
            setShowOverlay(poolSelected);
            
            historicChartsCreated = true;
        }

        // Create charts for lite
        function createHistoricChartsLite() {
            if (historicChartsCreated)
                return;
            chartUsage30days = new ChartElement({
                "id": "dailyUsageLite",
                "charting.axisTitleX.text":_("Date").t(),
                "charting.gaugeAutoRanges": "1",
                "charting.legend.placement": "right",
                "charting.gaugeColors": "[\"84E900\",\"FFE800\",\"BF3030\"]",
                "charting.chart.stackMode": "stacked",
                "charting.axisY.scale": "linear",
                "charting.axisX.scale": "linear",
                "charting.chart.style": "shiny",
                "charting.chart.nullValueMode": "connect",
                "charting.chart": "column",
                "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
                "charting.drilldown": "1",
                "charting.axisTitleY.text":_("GB").t(),
                "charting.height": "300",
                "charting.chart.rangeValues": "[\"0\",\"30\",\"70\",\"100\"]",
                "charting.chart.overlayFields": "",
                "charting.lineDashStyle":"ShortDash",
                "managerid": "search6",
                "el": $('#dailyUsageLite')
            }).render();
       
            splunkjs.mvc.Components.get('dailyUsageLite').on("drilldown", function(e){
                e.defaultDrilldown();
            });
    
            chartPctUsage30days = new ChartElement({
                "id": "percentageLite",
                "charting.axisTitleX.text": _("Date").t(),
                "charting.gaugeAutoRanges": "1",
                "charting.chart.rangeValues": "[\"0\",\"30\",\"70\",\"100\"]",
                "charting.gaugeColors": "[\"84E900\",\"FFE800\",\"BF3030\"]",
                "charting.chart.stackMode":"stacked",
                "charting.axisY.scale": "linear",
                "charting.chart.style": "shiny",
                "charting.axisX.scale": "linear",
                "charting.chart.nullValueMode": "gaps",
                "charting.chart": "column",
                "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
                "charting.drilldown": "1",
                "charting.axisTitleY.text": "%",
                "charting.height": "300",
                "charting.legend.placement": "right",
                "managerid": "search7",
                "el": $('#percentageLite')
            }).render();
    
            splunkjs.mvc.Components.get('percentageLite').on("drilldown", function(e){
                e.defaultDrilldown();
            });
    
            chartAvgMaxUsage30days = new ChartElement({
                "id": "avgMaxLite",
                "charting.axisTitleX.text": " ",    // IB Change
                "charting.gaugeAutoRanges": "1",
                "charting.legend.placement": "right",
                "charting.gaugeColors": "[\"84E900\",\"FFE800\",\"BF3030\"]",
                "charting.chart.stackMode": "default",
                "charting.axisY.scale": "linear",
                "charting.axisX.scale": "linear",
                "charting.chart.style": "shiny",
                "charting.chart.nullValueMode": "gaps",
                "charting.chart": "column",
                "charting.legend.labelStyle.overflowMode": "ellipsisEnd",
                "charting.drilldown": "1",
                "charting.axisTitleY.text": _("GB").t(),
                "charting.height": "300",
                "charting.chart.rangeValues": "[\"0\",\"30\",\"70\",\"100\"]",
                "managerid": "search8",
                "el": $('#avgMaxLite')
            }).render();
    
            splunkjs.mvc.Components.get('avgMaxLite').on("drilldown", function(e){
                e.defaultDrilldown();
            });
    
            var poolSelected = poolDropdown.val().length > 1 ? true : false;
            setShowOverlay(poolSelected);
            
            historicChartsCreated = true;
        }

        // Checks to see if usage search summary is enabled, then set info messages.
        function updateInfoMessages(splitDropdownVal) { 
            var savedSearch = require("models/services/saved/Search");
            
            isBaseUsageSearchSummarized = false;
            var model = new savedSearch();
            model.fetch({
               url: splunkdUtils.fullpath(model.url + "/" + SAVED_SEARCH_NAME),
               data: {
                   app: "search",
                   owner: "admin"
               },
               success: function(model, response) {
                    if (model && model.entry.content.get("auto_summarize"))
                        isBaseUsageSearchSummarized = true;
                    setInfoMessages(isBaseUsageSearchSummarized, splitDropdownVal);
               },
               error: function(model, response) {
                    console.log("Error fetching saved search");
                    setInfoMessages(isBaseUsageSearchSummarized, splitDropdownVal);
               }
            });
        }
    
    
        // Set information messages for the history tab
        function setInfoMessages(isBaseUsageSearchSummarized, splitDropdownVal) {
            var html = "";
                        
            if ((splitDropdownVal == "license_usage_by_source" || splitDropdownVal == "license_usage_by_host" ||
                splitDropdownVal == "license_usage_by_sourcetype" || splitDropdownVal == "license_usage_by_index") &&
                !isBaseUsageSearchSummarized && !isLite)
                html += '<div class="info-message alert alert-warning"><i class="icon-alert"></i>' + NO_SUMMARY_MSG + '</div>';
            
            if (splitDropdownVal == "license_usage_by_source" || splitDropdownVal == "license_usage_by_host" )
                html += '<div class="info-message alert alert-info"><i class="icon-alert"></i>' + SQUASHED_VALUE_MSG + '</div>';
            else if (splitDropdownVal == "license_usage_by_index")
                if (!isLite) {
                    html += '<div class="info-message alert alert-info"><i class="icon-alert"></i>' + UNKNOWN_VALUE_MSG + '</div>';
                }
            $('.info-messages').html(html);
        }
        
        // Adds split by pool option in the Split By dropdown only for "All Pools" selected in the Pool dropdown
        function setSplitByPool(poolDropdownVal, splitDropdownVal) {
            if (poolDropdownVal == " " && !isLite) {// All Pools 
               splitDropdown.settings.set("choices", [
                {"value": "license_usage_no_split", "label": _("No split").t()},
                {"value": "license_usage_by_pool", "label": _("Pool").t()},
                {"value": "license_usage_by_indexer", "label":_("Indexer").t()},
                {"value": "license_usage_by_sourcetype", "label": _("Source type").t()},
                {"value": "license_usage_by_host", "label": _("Host").t()},
                {"value": "license_usage_by_source", "label": _("Source").t()},
                {"value": "license_usage_by_index", "label": _("Index").t()}
               ]);
            }
            else {
               splitDropdown.settings.set("choices", [
                {"value": "license_usage_no_split", "label": _("No Split").t()},
                {"value": "license_usage_by_sourcetype", "label": _("Source type").t()},
                {"value": "license_usage_by_host", "label": _("Host").t()},
                {"value": "license_usage_by_source", "label": _("Source").t()},
                {"value": "license_usage_by_index", "label": _("Index").t()}
               ]);
               
               if (splitDropdownVal == "license_usage_by_pool")
                    splitDropdown.val('license_usage_no_split');
            }
        }

        // Change overlay field to stack size if no pool is selected, pool size if pool is selected
        function setDailyUsageOverlay(overlayStyle) {
            if (chartUsage30days) {
                chartUsage30days.getVisualization().done(function(viz) {
                    if (overlayStyle == OverlayStyle.NONE)
                        viz.settings.set({"charting.chart.overlayFields" : "\"\""}); 
                    else if (overlayStyle == OverlayStyle.POOL)
                        viz.settings.set({"charting.chart.overlayFields" : "\"" + _("pool size").t() + "\"",
                              "charting.fieldColors" : "{" + _("pool size").t() + ": 0xff0000}"
                        });
                    else
                        viz.settings.set({"charting.chart.overlayFields" : "\"" + _("stack size").t() + "\"",
                              "charting.fieldColors" : "{" + _("stack size").t() + ": 0xff0000}"
                        });
                });
            }
        }
        
        // Returns status (checked/unchecked) of "Show overlay" check box
        function isShowOverlay() {
            return (showHideOverlay.val()[0] == "overlay");
        }
        
        function setShowOverlay(poolSelected) {
            var toShowOverlay = isShowOverlay();
            if (toShowOverlay) {
                if (poolSelected)
                    setDailyUsageOverlay(OverlayStyle.POOL);
                else
                    setDailyUsageOverlay(OverlayStyle.STACK);
            }
            else {
                setDailyUsageOverlay(OverlayStyle.NONE);
            }
        }
        
        // Set searches based on the pooldowns selection
        function setHistoricSearches(poolDropdownVal, splitDropdownVal) {
           var poolSelected = poolDropdownVal.length > 1 ? true : false;
           var toShowOverlay = isShowOverlay();
           
           setShowOverlay(poolSelected);
           
           var poolSelectedKey = poolSelected ? "pool" : "nopool";
           var overlayKey = toShowOverlay ? "overlay" : "nooverlay";
           var search1 = HistoricSearches[splitDropdownVal][poolSelectedKey][overlayKey].dailySearch;
           var search2 = HistoricSearches[splitDropdownVal][poolSelectedKey].pctSearch;    
           var search3 = HistoricSearches[splitDropdownVal].maxAvgSearch;

           if (poolSelected && (splitDropdownVal == "license_usage_by_sourcetype" || splitDropdownVal == "license_usage_by_host" || 
                                splitDropdownVal == "license_usage_by_source" || splitDropdownVal == "license_usage_by_index"))
               poolDropdownVal = " | search " + poolDropdownVal;      
           dailyUsageSearch.set("search", search1.replace(/\$PoolClause\$/g, poolDropdownVal));
           dailyPctSearch.set("search", search2.replace(/\$PoolClause\$/g, poolDropdownVal));
           maxAvgSearch.set("search", search3.replace(/\$PoolClause\$/g, poolDropdownVal));
        }

        // Bootstrap tabs
        require(["bootstrap.tab"], function() {
            //$('#myTabs a:last').tab('show');
    
            $('#myTabs a[href=#todayTab]').click(function (e) {
                e.preventDefault();
                $('#help_30days').hide();
                $('#help_today').show();
                $(this).tab('show');
            });
    
            $('#myTabs a[href=#historyTab]').click(function (e) {
                createHistoricCharts();
                e.preventDefault();
                $('#help_today').hide();
                $('#help_30days').show();              
                $(this).tab('show');      
            });
        });

        // AUTO-COMPILED JAVASCRIPT
        //
        // Import required dependencies
        //
    
        var HeaderView = require("splunkjs/mvc/headerview");
        var FooterView = require("splunkjs/mvc/footerview");
        var Dashboard = require("splunkjs/mvc/simplexml/dashboardview");
        var ChartElement = require("splunkjs/mvc/simplexml/element/chart");
        var TableElement = require("splunkjs/mvc/simplexml/element/table");
        var DropdownInput = require("splunkjs/mvc/simpleform/input/dropdown");
        var CheckboxGroupInput = require("splunkjs/mvc/simpleform/input/checkboxgroup");
        var TextInput = require("splunkjs/mvc/simpleform/input/text");
        var SearchManager = require("splunkjs/mvc/searchmanager");
        var SavedSearchManager = require("splunkjs/mvc/savedsearchmanager");
    
        //
        // Create header and footer Splunk UI
        //
        new HeaderView({
            id: 'header',
            section: 'dashboards',
            el: $('.header'),
            // IB CHANGE
            appbar: false,
            litebar: isLite
        }).render();
    
        new FooterView({
            id: 'footer',
            el: $('.footer')
        }).render();
    
        new Dashboard({
            id: 'dashboard',
            el: $('.dashboard-body')
        }).render();
    
        //
        // Create components
        //
    
        chartUsageToday = new ChartElement({
            "id": "element1",
            "charting.gaugeAutoRanges": "1",
            "charting.legend.placement": "right",
            "charting.gaugeColors": "[\"84E900\",\"FFE800\",\"BF3030\"]",
            "charting.chart.stackMode": "default",
            "charting.axisY.scale": "linear",
            "charting.axisX.scale": "linear",
            "charting.chart.style": "shiny",
            "charting.chart.nullValueMode": "gaps",
            "charting.chart": "fillerGauge",
            "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
            "charting.drilldown": "1",
            "charting.height": "300",
            "managerid": "search1",
            "el": $('#element1')
        }).render();
    
        splunkjs.mvc.Components.get('element1').on("drilldown", function(e){
            e.defaultDrilldown();
        });
    
        chartUsagePerPoolToday = new ChartElement({
            "id": "element2",
            "charting.drilldown": "1",
            "charting.height": "300",
            "charting.chart": "bar",
            "charting.axisX.scale": "linear",
            "charting.chart.style": "shiny",
            "charting.axisTitleY.text": _("GB").t(),
            "charting.axisY.scale": "linear",
            "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
            "charting.legend.placement": "right",
            "charting.gaugeColors": "[\"84E900\",\"FFE800\",\"BF3030\"]",
            "charting.gaugeAutoRanges": "1",
            "charting.chart.nullValueMode": "gaps",
            "charting.chart.stackMode": "default",
            "charting.chart.rangeValues": "[\"0\",\"30\",\"70\",\"100\"]",
            "managerid": "search2",
            "el": $('#element2')
        }).render();
    
        splunkjs.mvc.Components.get('element2').on("drilldown", function(e){
            e.defaultDrilldown();
        });
    
        chartPctUsagePerPoolToday = new ChartElement({
            "id": "element3",
            "charting.gaugeAutoRanges": "1",
            "charting.legend.placement": "none",
            "charting.gaugeColors": "[\"84E900\",\"FFE800\",\"BF3030\"]",
            "charting.chart.stackMode": "default",
            "charting.axisY.scale": "log",
            "charting.axisX.scale": "linear",
            "charting.chart.style": "shiny",
            "charting.chart.nullValueMode": "gaps",
            "charting.chart": "bar",
            "charting.legend.labelStyle.overflowMode": "ellipsisMiddle",
            "charting.drilldown": "1",
            "charting.axisTitleY.text": "%",
            "charting.height": "300",
            "charting.chart.rangeValues": "[\"0\",\"30\",\"70\",\"100\"]",
            "managerid": "search3",
            "el": $('#element3')
        }).render();
    
        splunkjs.mvc.Components.get('element3').on("drilldown", function(e){
            e.defaultDrilldown();
        });
    
        new TableElement({
            "id": "element4",
            "managerid": "search4",
            "el": $('#element4')
        }).render();
    
        splunkjs.mvc.Components.get('element4').on("drilldown", function(e){
            e.defaultDrilldown();
        });
    
        new TableElement({
            "id": "element5",
            "managerid": "search5",
            "el": $('#element5')
        }).render();
    
        splunkjs.mvc.Components.get('element5').on("drilldown", function(e){
            e.defaultDrilldown();
        });
    
        // IB CHANGE
        // Moved element6, element7, and element8 into createHistoricCharts() above
    
        //
        // Create form inputs
        //
    
        // IB CHANGE
        var poolDropdown = new DropdownInput({
            "id": "field1",
            "choices": [
                {"value": " ", "label": _("All Pools").t()}
            ],
            "labelField": "name",
            "default": " ",
            "submitOnChange": false,
            "valueField": "value",
            // TODO: Fix URL-syncing behavior here. (SPL-70997)
            "token": "PoolClause",
            "managerid": "search9",
            "el": $('#field1'),
            // IB CHANGE
            "showClearButton": false
        }).render();
    
        new SearchManager({
            "id": "search9",
            "autostart": true,
            "search": GET_ALL_POOLS,
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": true,
            "timeFormat": "%s.%Q",
            "wait": 0
        });

        // IB CHANGE
        var splitChoices = [
            {"value": "license_usage_no_split", "label": _("No split").t()},
            {"value": "license_usage_by_pool", "label": _("By pool").t()},
            {"value": "license_usage_by_indexer", "label":_("By indexer").t()},
            {"value": "license_usage_by_sourcetype", "label": _("By source type").t()},
            {"value": "license_usage_by_host", "label": _("By host").t()},
            {"value": "license_usage_by_source", "label": _("By source").t()},
            {"value": "license_usage_by_index", "label": _("By index").t()}
        ];

        if (isLite) {
            splitChoices.splice(1, 1);
        }

        var splitDropdown = new DropdownInput({
            "id": "field2",
            "choices": splitChoices,
            "submitOnChange": false,
            "default": "license_usage_no_split",
            // TODO: Fix URL-syncing behavior here. (SPL-70997)
            "token": "LicUsageSearch",
            "el": $('#field2'),
            // IB CHANGE
            "showClearButton": false
        }).render();
    

        var showHideOverlay = new CheckboxGroupInput({
            "id": "field3",
            "choices": [{label: _("Show/hide stack/pool size overlay").t(), value: "overlay"}],
            "default": ["overlay"],
            "el": $('#field3')
        }).render();

        
        // Create searches
        //
        new SearchManager({
            "id": "search1",
            "earliest_time": null,
            "search": TODAY_LICENSE_USAGE,
            "latest_time": null,
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": true,
            "timeFormat": "%s.%Q",
            "wait": 0
        });
    
        new SearchManager({
            "id": "search2",
            "latest_time": null,
            "earliest_time": null,
            "search": TODAY_LICENSE_USAGE_BY_POOL,
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": true,
            "timeFormat": "%s.%Q",
            "wait": 0
        });
    
        new SearchManager({
            "id": "search3",
            "earliest_time": null,
            "search": TODAY_LICENSE_USAGE_PCT,
            "latest_time": null,
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": true,
            "timeFormat": "%s.%Q",
            "wait": 0
        });
    
        new SearchManager({
            "id": "search4",
            "earliest_time": null,
            "search": POOL_WARNING,
            "latest_time": null,
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": true,
            "timeFormat": "%s.%Q",
            "wait": 0
        });
    
        new SearchManager({
            "id": "search5",
            "earliest_time": null,
            "search": SLAVE_WARNING,
            "latest_time": null,
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": true,
            "timeFormat": "%s.%Q",
            "wait": 0
        });
    
        var dailyUsageSearch = new SearchManager({
            "id": "search6",
            "earliest_time": "-30d@d",
            "search":"",
            "latest_time": "-0d@d",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": true,
            "timeFormat": "%s.%Q",
            "wait": 0
        });
    
        var dailyPctSearch = new SearchManager({
            "id": "search7",
            "earliest_time": "-30d@d",
            "search":"",
            "latest_time": "-0d@d",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": true,
            "timeFormat": "%s.%Q",
            "wait": 0
        });
    
        var maxAvgSearch = new SearchManager({
            "id": "search8",
            "earliest_time": "-30d@d",
            "search":"",
            "latest_time": "-0d@d",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "status_buckets": 0,
            "preview": true,
            "timeFormat": "%s.%Q",
            "wait": 0
        });
    
        // END OF AUTO-COMPILED JAVASCRIPT

        poolDropdown.on("change", function(poolDropdownVal) {
           var splitDropdownVal = splitDropdown.val();

           updateInfoMessages(splitDropdownVal);
           setHistoricSearches(poolDropdownVal, splitDropdownVal);
           setSplitByPool(poolDropdownVal, splitDropdownVal);
        });

        splitDropdown.on("change", function(splitDropdownVal) {
            var poolDropdownVal = poolDropdown.val();
            if (splitDropdownVal == "license_usage_no_split")
                $('#avg-peak-chart-title').html(AVGMAX_TITLE);
            else
                $('#avg-peak-chart-title').html(AVGMAX_TOP5_TITLE);

            updateInfoMessages(splitDropdownVal);
            setHistoricSearches(poolDropdownVal, splitDropdownVal);
            setSplitByPool(poolDropdownVal, splitDropdownVal);
        });

        showHideOverlay.on("change", function(val) {
            setHistoricSearches(poolDropdown.val(), splitDropdown.val()); 
        });

        // Set initial searches for history tab
        setHistoricSearches(poolDropdown.val(), splitDropdown.val());
        
        if (isLite) {
            createHistoricChartsLite();
        }
    }
);
