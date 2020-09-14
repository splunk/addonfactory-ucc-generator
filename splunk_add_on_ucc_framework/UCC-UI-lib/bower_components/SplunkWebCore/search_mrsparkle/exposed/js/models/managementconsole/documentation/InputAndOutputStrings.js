define(['underscore', 'splunk.i18n'],
    function(_) {
        return {
            _shared: {
                sourcetype: {
                    label: _('Source type').t(),
                    tooltip: _('The source type tells Splunk software what kind of data you have, so that it can format the data intelligently during indexing.').t()
                },
                host: {
                    label: _('Host').t(),
                    tooltip: _('The host field value is the name of the physical device from which an event originates.').t()
                },
                index: {
                    label: _('Index').t(),
                    tooltip: _('The index is the repository for data ingested by Splunk software. Incoming data is transformed into events, which are stored in indexes.').t()
                },
                acceptFrom: {
                    label: _('Accept from').t(),
                    tooltip: _('A comma-separated list of networks or addresses to accept connections from. An entry can be a single IPv4 or IPv6 address, a CIDR block of addresses, a DNS name, or a single \'*\' which matches anything.').t(),
                    placeholder: _('optional').t(),
                    help: _('Example: 10.1.2.3, !badhost.splunk.com, *.splunk.com').t()
                },
                connection_host: {
                    label: _('Host name method').t(),
                    tooltip: _('Specify method for getting host field for events coming from this source.').t()
                },
                bundle: {
                    label: _('Context').t()
                }
            },
            inputs: {
                wineventlog: {
                    eventLogs: {
                        label: _('Event logs').t(),
                        tooltip: _('Windows event logs are collected from installed applications, services, and system processes.').t(),
                        help: _('Select the Windows Event Logs you want to index from this list').t()
                    }
                },
                perfmon: {
                    name: {
                        label: _('Collection Name').t(),
                        help: _('Specify a unique name for this input').t()
                    },
                    object: {
                        label: _('Object').t(),
                        tooltip: _('The built-in component generating the data.').t(),
                        help: _('Select an object').t()
                    },
                    counters: {
                        label: _('Counters').t(),
                        tooltip: _('Performance metrics for the selected object.').t(),
                        help: _('Choose from available counters').t()
                    },
                    instances: {
                        label: _('Instances').t(),
                        tooltip: _('The list of instances that this input will monitor.').t()
                    },
                    interval: {
                        label: _('Polling Interval').t(),
                        tooltip: _('How frequently this input polls for data.').t(),
                        help: _('Default: 300 sec').t()
                    }
                },
                script: {
                    name: {
                        label: _('Upload script').t(),
                        help: _('Select a file to upload').t()
                    },
                    scriptname: {
                        label: _('Script name').t()
                    },
                    intervalInput: {
                        label: _('Interval Type').t(),
                        tooltip: _('The interval can be defined in either seconds or a valid cron notation.').t()
                    },
                    interval: {
                        label: _('Interval').t(),
                        tooltip: _('Number of seconds to wait before running the command again, or a valid cron schedule.').t()
                    },
                    source: {
                        label: _('Source name override').t(),
                        tooltip: _('The source is the name of the file, stream, or other input from which the event originates. This value overrides the default source value for your script input.').t(),
                        placeholder: _('optional').t()
                    }
                },
                monitor: {
                    name: {
                        label: _('File or Directory').t(),
                        tooltip: _('A file or directory accessible from this Splunk installation. ' +
                            'Ensure that Splunk software has permission to access the data you want to collect.').t(),
                        help: _('On Windows: c:\\apache\\apache.error.log or \\\\hostname\\apache\\apache.error.log. On Unix: /var/log or /mnt/www01/var/log.').t()
                    },
                    whitelist: {
                        label: _('Whitelist').t(),
                        tooltip: _('A regular expression that files from this source must match in order to be monitored by Splunk software.').t(),
                        placeholder: _('optional').t()
                    },
                    blacklist: {
                        label: _('Blacklist').t(),
                        tooltip: _('A regular expression that files from this source must match in order to NOT be monitored by Splunk software.').t(),
                        placeholder: _('optional').t()
                    },
                    ignoreOlderThan: {
                        label: _('Ignore files older than').t(),
                        tooltip: _('A modtime value that Splunk software uses to determine which files to ignore. Files older than this modtime value will be ignored.').t(),
                        help: _('Example: 7d').t()
                    },
                    crcSalt: {
                        label: _('CRC Salt').t(),
                        tooltip: _('A cyclic redundancy check that Splunk software uses to determine which files have already been consumed.').t(),
                        help: _('Example: &lt;source&gt;').t()
                    },
                    initCrcLength: {
                        label: _('CRC Length').t(),
                        tooltip: _('An integer that Splunk software uses to determine how much of a file to read before declaring whether that file has already been read.').t()
                    },
                    recursive: {
                        label: _('Recursive').t(),
                        tooltip: _('Enabling this will include all subdirectories.').t()
                    }
                },
                http: {
                    name: {
                        label: _('Name').t(),
                        help: _('Specify the name of the token.').t()
                    },
                    source: {
                        label: _('Source name override').t(),
                        tooltip: _('This overrides the default source value of events generated from this token.').t(),
                        placeholder: _('optional').t()
                    },
                    description: {
                        label: _('Description').t(),
                        tooltip: _('A short description of this token.').t(),
                        placeholder: _('optional').t()
                    },
                    useACK: {
                        label: _('Indexer acknowledgement').t(),
                        tooltip: _('Verification from the indexer that events from this token are properly indexed. This is not the same as indexer acknowledgement for forwarders.').t()
                    },
                    index: {
                        label: _('Default index').t(),
                        help: _('Specify the default index that events will be indexed to').t()
                    },
                    indexes: {
                        label: _('Allowed indexes').t(),
                        help: _('Specify a comma-separated list of indexes allowed for use by this token').t()
                    }
                },
                tcp: {
                    name: {
                        label: _('TCP port').t(),
                        tooltip: _('The receiving port.').t(),
                        help: _('Example: 514').t()
                    },
                    source: {
                        label: _('Source name override').t(),
                        tooltip: _('This overrides the default source value for your TCP input.').t(),
                        help: _('host:port').t()
                    }
                },
                udp: {
                    name: {
                        label: _('UDP port').t(),
                        tooltip: _('The receiving port.').t(),
                        help: _('Example: 514').t()
                    },
                    source: {
                        label: _('Source name override').t(),
                        tooltip: _('This overrides the default source value for your UDP input.').t(),
                        help: _('host:port').t()
                    }
                }
            },
            outputs: {
                name: {
                    label: _('Group name').t(),
                    help: _('Pick a name for this group.').t()
                },
                server: {
                    label: _('Receivers').t(),
                    tooltip: _('Host name and receiving port of the indexers you want to add to this group.').t(),
                    help: _('Example: indexer1.example.com:9997, 10.10.20.100:9997.').t()
                },
                defaultGroup: {
                    label: _('Default on').t()
                },
                useACK: {
                    label: _('Indexer acknowledgement').t(),
                    tooltip: _('With indexer acknowledgment, the forwarder resends any data not acknowledged as "received" by the indexer.').t()
                },
                autoLBFrequency: {
                    label: _('Load balancing frequency').t(),
                    help: _('Enter a number in seconds. Default: 30.').t(),
                    placeholder: _('optional').t()
                },
                maxQueueSize: {
                    label: _('Max queue size').t(),
                    help: _('Max size of the forwarder\'s output queue.').t(),
                    placeholder: _('[ auto | <integer> | <integer>[KB|MB|GB] ]').t()
                }
            }
        };
    }
);
