define({
    "paging": {
        "perPage": 30,
        "offset": 0,
        "total": 8
    },
    "entry": [
        {
            "name": "CPU",
            "@status": "deployed",
            "links": {
                "alternate": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/CPU",
                "delete": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/CPU",
                "edit": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/CPU",
                "enable": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/CPU/enable",
                "list": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/CPU",
                "move": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/CPU/move"
            },
            "acl": {
                "@bundleId": "Splunk_TA_windows",
                "app": "Splunk_TA_windows",
                "@bundleType": "app"
            },
            "content": {
                "index": "perfmon",
                "interval": "10",
                "useEnglishOnly": "true",
                "object": "Processor",
                "counters": "% Processor Time; % User Time; % Privileged Time; Interrupts/sec; % DPC Time; % Interrupt Time; DPCs Queued/sec; DPC Rate; % Idle Time; % C1 Time; % C2 Time; % C3 Time; C1 Transitions/sec; C2 Transitions/sec; C3 Transitions/sec",
                "disabled": "1",
                "instances": "*"
            }
        },
        {
            "name": "LogicalDisk",
            "@status": "deployed",
            "links": {
                "alternate": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/LogicalDisk",
                "delete": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/LogicalDisk",
                "edit": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/LogicalDisk",
                "enable": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/LogicalDisk/enable",
                "list": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/LogicalDisk",
                "move": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/LogicalDisk/move"
            },
            "acl": {
                "@bundleId": "Splunk_TA_windows",
                "app": "Splunk_TA_windows",
                "@bundleType": "app"
            },
            "content": {
                "index": "perfmon",
                "interval": "10",
                "useEnglishOnly": "true",
                "object": "LogicalDisk",
                "counters": "% Free Space; Free Megabytes; Current Disk Queue Length; % Disk Time; Avg. Disk Queue Length; % Disk Read Time; Avg. Disk Read Queue Length; % Disk Write Time; Avg. Disk Write Queue Length; Avg. Disk sec/Transfer; Avg. Disk sec/Read; Avg. Disk sec/Write; Disk Transfers/sec; Disk Reads/sec; Disk Writes/sec; Disk Bytes/sec; Disk Read Bytes/sec; Disk Write Bytes/sec; Avg. Disk Bytes/Transfer; Avg. Disk Bytes/Read; Avg. Disk Bytes/Write; % Idle Time; Split IO/Sec",
                "disabled": "1",
                "instances": "*"
            }
        },
        {
            "name": "Memory",
            "@status": "deployed",
            "links": {
                "alternate": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Memory",
                "delete": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Memory",
                "edit": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Memory",
                "enable": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Memory/enable",
                "list": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Memory",
                "move": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Memory/move"
            },
            "acl": {
                "@bundleId": "Splunk_TA_windows",
                "app": "Splunk_TA_windows",
                "@bundleType": "app"
            },
            "content": {
                "index": "perfmon",
                "interval": "10",
                "useEnglishOnly": "true",
                "object": "Memory",
                "disabled": "1",
                "counters": "Page Faults/sec; Available Bytes; Committed Bytes; Commit Limit; Write Copies/sec; Transition Faults/sec; Cache Faults/sec; Demand Zero Faults/sec; Pages/sec; Pages Input/sec; Page Reads/sec; Pages Output/sec; Pool Paged Bytes; Pool Nonpaged Bytes; Page Writes/sec; Pool Paged Allocs; Pool Nonpaged Allocs; Free System Page Table Entries; Cache Bytes; Cache Bytes Peak; Pool Paged Resident Bytes; System Code Total Bytes; System Code Resident Bytes; System Driver Total Bytes; System Driver Resident Bytes; System Cache Resident Bytes; % Committed Bytes In Use; Available KBytes; Available MBytes; Transition Pages RePurposed/sec; Free & Zero Page List Bytes; Modified Page List Bytes; Standby Cache Reserve Bytes; Standby Cache Normal Priority Bytes; Standby Cache Core Bytes; Long-Term Average Standby Cache Lifetime (s)"
            }
        },
        {
            "name": "Network",
            "@status": "deployed",
            "links": {
                "alternate": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Network",
                "delete": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Network",
                "edit": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Network",
                "enable": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Network/enable",
                "list": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Network",
                "move": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Network/move"
            },
            "acl": {
                "@bundleId": "Splunk_TA_windows",
                "app": "Splunk_TA_windows",
                "@bundleType": "app"
            },
            "content": {
                "index": "perfmon",
                "interval": "10",
                "useEnglishOnly": "true",
                "object": "Network Interface",
                "counters": "Bytes Total/sec; Packets/sec; Packets Received/sec; Packets Sent/sec; Current Bandwidth; Bytes Received/sec; Packets Received Unicast/sec; Packets Received Non-Unicast/sec; Packets Received Discarded; Packets Received Errors; Packets Received Unknown; Bytes Sent/sec; Packets Sent Unicast/sec; Packets Sent Non-Unicast/sec; Packets Outbound Discarded; Packets Outbound Errors; Output Queue Length; Offloaded Connections; TCP Active RSC Connections; TCP RSC Coalesced Packets/sec; TCP RSC Exceptions/sec; TCP RSC Average Packet Size",
                "disabled": "1",
                "instances": "*"
            }
        },
        {
            "name": "PhysicalDisk",
            "@status": "deployed",
            "links": {
                "alternate": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/PhysicalDisk",
                "delete": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/PhysicalDisk",
                "edit": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/PhysicalDisk",
                "enable": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/PhysicalDisk/enable",
                "list": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/PhysicalDisk",
                "move": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/PhysicalDisk/move"
            },
            "acl": {
                "@bundleId": "Splunk_TA_windows",
                "app": "Splunk_TA_windows",
                "@bundleType": "app"
            },
            "content": {
                "index": "perfmon",
                "interval": "10",
                "useEnglishOnly": "true",
                "object": "PhysicalDisk",
                "counters": "Current Disk Queue Length; % Disk Time; Avg. Disk Queue Length; % Disk Read Time; Avg. Disk Read Queue Length; % Disk Write Time; Avg. Disk Write Queue Length; Avg. Disk sec/Transfer; Avg. Disk sec/Read; Avg. Disk sec/Write; Disk Transfers/sec; Disk Reads/sec; Disk Writes/sec; Disk Bytes/sec; Disk Read Bytes/sec; Disk Write Bytes/sec; Avg. Disk Bytes/Transfer; Avg. Disk Bytes/Read; Avg. Disk Bytes/Write; % Idle Time; Split IO/Sec",
                "disabled": "1",
                "instances": "*"
            }
        },
        {
            "name": "Process",
            "@status": "deployed",
            "links": {
                "alternate": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Process",
                "delete": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Process",
                "edit": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Process",
                "enable": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Process/enable",
                "list": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Process",
                "move": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/Process/move"
            },
            "acl": {
                "@bundleId": "Splunk_TA_windows",
                "app": "Splunk_TA_windows",
                "@bundleType": "app"
            },
            "content": {
                "index": "perfmon",
                "interval": "10",
                "useEnglishOnly": "true",
                "object": "Process",
                "counters": "% Processor Time; % User Time; % Privileged Time; Virtual Bytes Peak; Virtual Bytes; Page Faults/sec; Working Set Peak; Working Set; Page File Bytes Peak; Page File Bytes; Private Bytes; Thread Count; Priority Base; Elapsed Time; ID Process; Creating Process ID; Pool Paged Bytes; Pool Nonpaged Bytes; Handle Count; IO Read Operations/sec; IO Write Operations/sec; IO Data Operations/sec; IO Other Operations/sec; IO Read Bytes/sec; IO Write Bytes/sec; IO Data Bytes/sec; IO Other Bytes/sec; Working Set - Private",
                "disabled": "1",
                "instances": "*"
            }
        },
        {
            "name": "System",
            "@status": "deployed",
            "links": {
                "alternate": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/System",
                "delete": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/System",
                "edit": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/System",
                "enable": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/System/enable",
                "list": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/System",
                "move": "/services/dmc/config/inputs/Splunk_TA_windows/perfmon/System/move"
            },
            "acl": {
                "@bundleId": "Splunk_TA_windows",
                "app": "Splunk_TA_windows",
                "@bundleType": "app"
            },
            "content": {
                "index": "perfmon",
                "interval": "10",
                "useEnglishOnly": "true",
                "object": "System",
                "counters": "File Read Operations/sec; File Write Operations/sec; File Control Operations/sec; File Read Bytes/sec; File Write Bytes/sec; File Control Bytes/sec; Context Switches/sec; System Calls/sec; File Data Operations/sec; System Up Time; Processor Queue Length; Processes; Threads; Alignment Fixups/sec; Exception Dispatches/sec; Floating Emulations/sec; % Registry Quota In Use",
                "disabled": "1",
                "instances": "*"
            }
        },
        {
            "name": "test1",
            "@status": "pending",
            "links": {
                "alternate": "/services/dmc/config/inputs/_server_class_1/perfmon/test1",
                "delete": "/services/dmc/config/inputs/_server_class_1/perfmon/test1",
                "edit": "/services/dmc/config/inputs/_server_class_1/perfmon/test1",
                "disable": "/services/dmc/config/inputs/_server_class_1/perfmon/test1/disable",
                "list": "/services/dmc/config/inputs/_server_class_1/perfmon/test1",
                "move": "/services/dmc/config/inputs/_server_class_1/perfmon/test1/move"
            },
            "acl": {
                "@bundleId": "server_class_1",
                "app": "_server_class_1",
                "@bundleType": "custom"
            },
            "content": {
                "interval": "100",
                "index": "mainIndex",
                "instances": "1;2;3;4;5;",
                "object": "Processor",
                "counters": "% C1 Time;% C2 Time;% C3 Time;% DPC Time;% Idle Time;% Interrupt Time;% Privileged Time;% Processor Time;% User Time;C1 Transitions/sec;C2 Transitions/sec;C3 Transitions/sec;DPC Rate;DPCs Queued/sec;Interrupts/sec;"
            }
        }
    ]
});

