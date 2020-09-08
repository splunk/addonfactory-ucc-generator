define({
    "status": 0,
    "messages": [
        "utilities-1.0.0.source/utilities/default/app.conf, line 3: Undefined setting in app.conf, stanza [package]: version"
    ],
    "manifest": {
        "info": {
            "commonInformationModels": null,
            "license": {
                "name": "Splunk Software License Agreement",
                "text": "./app-license.html",
                "uri": "http://www.splunk.com/en_us/legal/splunk-software-license-agreement.html"
            },
            "id": {
                "name": "Splunk_TA_windows",
                "version": "4.7.5",
                "group": null
            },
            "author": [
                {
                    "name": "author",
                    "email": "dev@splunk.com",
                    "company": "Splunk, Inc."
                }
            ],
            "title": "Splunk Add-on for Microsoft Windows",
            "releaseDate": "10-22-2015",
            "description": "Splunk can be used to monitor your Windows machines for changes, performance over time, and important system information such as security audits and alerts. The Splunk Add-on for Windows is a collection of inputs and knowledge to accelerate your use of Splunk for common Windows monitoring tasks.",
            "classification": {
                "categories": [
                    "IT Operations",
                    "Application Management",
                    "Add-on"
                ],
                "developmentStatus": "Production/Stable",
                "intendedAudience": "System Administrators"
            },
            "releaseNotes": {
                "uri": "http://www.test.releasenotes.com"
            },
            "privacyPolicy": {
                "name": "Splunk Privacy Policy",
                "text": "./app-privacy.html",
                "uri": "http://www.splunk.com/en_us/legal/splunk-software-privacy-policy.html"
            }
        },
        "dependencies": {
            "utilities": {
                "package": "utilities-1.0.0.tar.gz",
                "version": "~1.0.0"
            }
        },
        "input_groups": {
            "Windows Host Monitor": {
                "requires": {},
                "inputs": [
                    "WinHostMon://Application",
                    "WinHostMon://Computer",
                    "WinHostMon://Disk",
                    "WinHostMon://Driver",
                    "WinHostMon://NetworkAdapter",
                    "WinHostMon://OperatingSystem",
                    "WinHostMon://Process",
                    "WinHostMon://Processor",
                    "WinHostMon://Roles",
                    "WinHostMon://Service"
                ]
            },
            "Windows Print Monitor": {
                "requires": {},
                "inputs": [
                    "WinPrintMon://driver",
                    "WinPrintMon://port",
                    "WinPrintMon://printer"
                ]
            },
            "Active Directory Domain Services": {
                "requires": {},
                "inputs": [
                    "admon://default"
                ]
            },
            "Windows Registry": {
                "requires": {},
                "inputs": [
                    "WinRegMon://default",
                    "WinRegMon://hkcu_run",
                    "WinRegMon://hklm_run"
                ]
            },
            "Windows Event Log": {
                "requires": {},
                "inputs": [
                    "WinEventLog://Application",
                    "WinEventLog://Security",
                    "WinEventLog://System"
                ]
            },
            "DHCP Server": {
                "requires": {},
                "inputs": [
                    "monitor://$WINDIR\\System32\\DHCP"
                ]
            },
            "Windows Performance Monitor": {
                "requires": {},
                "inputs": [
                    "perfmon://CPU",
                    "perfmon://LogicalDisk",
                    "perfmon://Memory",
                    "perfmon://Network",
                    "perfmon://PhysicalDisk",
                    "perfmon://Process",
                    "perfmon://System"
                ]
            },
            "Windows Network Monitor": {
                "requires": {},
                "inputs": [
                    "WinNetMon://inbound",
                    "WinNetMon://outbound"
                ]
            },
            "Windows Update Monitor": {
                "requires": {},
                "inputs": [
                    "monitor://$WINDIR\\WindowsUpdate.log"
                ]
            }
        }
    },
    "dependency_graph": "|-- Splunk_TA_windows@4.7.5\n|   |-- utilities@1.0.0 (accepting ~1.0.0)\n"
});
