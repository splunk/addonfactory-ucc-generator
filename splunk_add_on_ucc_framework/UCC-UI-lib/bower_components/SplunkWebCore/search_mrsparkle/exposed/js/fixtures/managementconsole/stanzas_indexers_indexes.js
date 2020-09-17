// GET /services/dmc/stanzas/__indexers/indexes?count=3
define({
	"links": {
		"create": "/services/dmc/stanzas/__indexers/indexes/_new",
		"_reload": "/services/dmc/stanzas/__indexers/indexes/_reload", 
		"_acl": "/services/dmc/stanzas/__indexers/indexes/_acl"
	},
	"origin": "https://localhost:8089/services/dmc/stanzas/__indexers/indexes",
	"updated": "2015-09-11T07:14:52-07:00",
	"generator": {
		"build":"7965de29fa179a8294393362a38cd83876e78878",
		"version":"20150909"
	},
	"entry": [
		{
			"name":"_default",
			"id": "https://localhost:8089/services/dmc/stanzas/__indexers/indexes/_default",
			"updated": "2015-09-11T07:14:52-07:00",
			"links": {
				"alternate": "/services/dmc/stanzas/__indexers/indexes/_default",
				"list": "/services/dmc/stanzas/__indexers/indexes/_default",
				"_reload": "/services/dmc/stanzas/__indexers/indexes/_default/_reload",
				"edit": "/services/dmc/stanzas/__indexers/indexes/_default"
			},
			"author": "system",
			"acl": {
				"app": "",
				"can_list": true,
				"can_write": true,
				"modifiable": true,
				"owner": "nobody",
				"perms": { 
					"read": [ ],
					"write": [ "admin" ]
				},
				"removable": false,
				"sharing": "system"
			},
			"content": {
				"bundle": "__indexers",
				"type": "indexes",
				"isFile": false,
				"default": {
					"sync": "0",
					"indexThreads": "auto",
					"memPoolMB": "auto",
					"defaultDatabase": "main",
					"enableRealtimeSearch": "true",
					"suppressBannerList": "",
					"maxRunningProcessGroups": "8",
					"maxRunningProcessGroupsLowPriority": "1",
					"bucketRebuildMemoryHint": "auto",
					"serviceOnlyAsNeeded": "true",
					"serviceSubtaskTimingPeriod": "30",
					"maxBucketSizeCacheEntries": "0",
					"processTrackerServiceInterval": "1",
					"hotBucketTimeRefreshInterval": "10",
					"maxDataSize": "auto",
					"maxWarmDBCount": "300",
					"frozenTimePeriodInSecs": "188697600",
					"rotatePeriodInSecs": "60",
					"coldToFrozenScript": "",
					"coldToFrozenDir": "",
					"compressRawdata": "true",
					"maxTotalDataSizeMB": "500000",
					"maxMemMB": "5",
					"maxConcurrentOptimizes": "6",
					"maxHotSpanSecs": "7776000",
					"maxHotIdleSecs": "0",
					"maxHotBuckets": "3",
					"quarantinePastSecs": "77760000",
					"quarantineFutureSecs": "2592000",
					"rawChunkSizeBytes": "131072",
					"minRawFileSyncSecs": "disable",
					"assureUTF8": "false",
					"serviceMetaPeriod": "25",
					"partialServiceMetaPeriod": "0",
					"throttleCheckPeriod": "15",
					"syncMeta": "true",
					"maxMetaEntries": "1000000",
					"maxBloomBackfillBucketAge": "30d",
					"enableOnlineBucketRepair": "true",
					"enableDataIntegrityControl": "false",
					"maxTimeUnreplicatedWithAcks": "60",
					"maxTimeUnreplicatedNoAcks": "300",
					"minStreamGroupQueueSize": "2000",
					"warmToColdScrip": "",
					"tstatsHomePath": "volume:_splunk_summaries/$_index_name/datamodel_summary",
					"homePath.maxDataSizeMB": "0",
					"coldPath.maxDataSizeMB": "0",
					"streamingTargetTsidxSyncPeriodMsec": "5000",
					"journalCompression": "gzip",
					"repFactor": "0"
				},
				"local": {
					"repFactor": "1"
				}
			}
		},
		{
			"name":"example_index",
			"id": "https://localhost:8089/services/dmc/stanzas/__indexers/indexes/example_index",
			"updated": "2015-09-11T07:14:52-07:00",
			"links": {
				"alternate": "/services/dmc/stanzas/__indexers/indexes/example_index",
				"list": "/services/dmc/stanzas/__indexers/indexes/example_index",
				"_reload": "/services/dmc/stanzas/__indexers/indexes/example_index/_reload",
				"edit": "/services/dmc/stanzas/__indexers/indexes/example_index"
			},
			"author": "system",
			"acl": {
				"app": "",
				"can_list": true,
				"can_write": true,
				"modifiable": true,
				"owner": "nobody",
				"perms": { 
					"read": [ ],
					"write": [ "admin" ]
				},
				"removable": false,
				"sharing": "system"
			},
			"content": {
				"bundle": "__indexers",
				"type": "indexes",
				"isFile": false,
				"default": {
					"homePath": "$SPLUNK_DB/defaultdb/db",
					"maxHotBuckets": "10"
				},
				"local": {
					"homePath": "$SPLUNK_DB/customdb/db"
				}
			}
		},
		{
			"name":"volume:example_volume",
			"id": "https://localhost:8089/services/dmc/stanzas/__indexers/indexes/volume%3Aexample_volume",
			"updated": "2015-09-11T07:14:52-07:00",
			"links": {
				"alternate": "/services/dmc/stanzas/__indexers/indexes/volume%3Aexample_volume",
				"list": "/services/dmc/stanzas/__indexers/indexes/volume%3Aexample_volume",
				"_reload": "/services/dmc/stanzas/__indexers/indexes/volume%3Aexample_volume/_reload",
				"edit": "/services/dmc/stanzas/__indexers/indexes/volume%3Aexample_volume"
			},
			"author": "system",
			"acl": {
				"app": "",
				"can_list": true,
				"can_write": true,
				"modifiable": true,
				"owner": "nobody",
				"perms": { 
					"read": [ ],
					"write": [ "admin" ]
				},
				"removable": false,
				"sharing": "system"
			},
			"content": {
				"bundle": "__indexers",
				"type": "indexes",
				"isFile": false,
				"default": null,
				"local": {
					"path": "/path/to/volume",
					"maxVolumeDataSizeMB": "100"
				}
			}
		}
	],
	"paging": {
		"total": 17,
		"perPage": 3,
		"offset": 0
	},
	"messages": []
});