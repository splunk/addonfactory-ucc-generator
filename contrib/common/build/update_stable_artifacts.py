#!/usr/bin/python

import re

from bs4 import BeautifulSoup
from confluence import Api

app_name_map = {
    "Add-on Builder": "splunk_app_addon-builder",
    "Akamai": "TA-akamai",
    "Amazon Web Services": "TA-aws",
    "AWS": "TA-aws",
    "Bit9": "TA-bit9-carbonblack",
    "Bluecoat Proxy SG": "TA-bluecoad-proxysg",
    "Box": "TA-box",
    "Box.com": "TA-box",
    "Bro IDS": "TA-bro",
    "Cisco ASA": "TA-cisco-asa",
    "Cisco ESA": "TA-cisco-esa",
    "Cisco IPS": "TA-cisco-ips",
    "Cisco ISE": "TA-cisco-ise",
    "Cisco Sourcefire": "TA-sourcefire",
    "Cisco UCS": "TA-cisco-ucs",
    "Cisco WSA": "TA-cisco-wsa",
    "Citrix NetScaler": "TA-citrix-netscaler",
    "CyberArk PIM": "TA-cyberark",
    "EMC VNX": "TA-emc-vnx",
    "F5 BIG-IP": "TA-f5-bigip",
    "Google Cloud Platform": "TA-google-cloudplatform",
    "Imperva SecureSphere WAF": "TA-imperva-waf",
    "Imperva WAF": "TA-imperva-waf",
    "Infoblox": "TA-infoblox",
    "IPFIX": "TA-ipfix",
    "ISC BIND": "TA-isc-bind",
    "ISC DHCP": "TA-isc-dhcp",
    "Java Management Extensions": "TA-jmx",
    "JBoss": "TA-jboss",
    "JMX": "TA-jmx",
    "Juniper": "TA-juniper",
    "Kafka": "TA-kafka",
    "McAfee": "TA-mcafee",
    "McAfee WG": "TA-mcafee-wg",
    "Microsoft SQL Server": "ta-microsoft-sqlserver",
    "MS PowerShell": "ta-powershell",
    "MS Hyper-V": "ta-microsoft-hyperv",
    "MS SCOM": "",
    "MS SQL Server": "",
    "MS SQL": "",
    "MySQL": "",
    "Nagios": "",
    "NetFlow": "TA-flowfix",
    "Nessus": "",
    "OKTA": "",
    "Okta": "",
    "Oracle DB Server": "",
    "OSSEC IDS": "",
    "Palo Alto Networks": "",
    "Qualys": "",
    "Remedy": "",
    "RSA DLP": "",
    "RSA SecurID": "",
    "ServiceNow": "",
    "Sophos": "",
    "Squid Proxy": "",
    "Symantec DLP": "",
    "Symantec Endpoint Protection": "",
    "Symantec EP": "",
    "Tomcat": "",
    "Websense CG": "",
    "Websense DLP": "",
    "WebSphere": "",
    "WebSphere CG": ""
}

def get_app_status():
    app_status_map = {}

    try:
        wiki_url = "https://confluence.splunk.com"
        user, pwd = ("jira_service", "jira_service")
        api = Api(wiki_url, user, pwd)
        content = api.getpagecontent("Add-on Factory Past Milestones", "PROD")
        soup = BeautifulSoup(content, 'html.parser')
        for row in soup.find_all('tr'):
            items = row.find_all('td')
            if len(items) >= 6:
                app_info = items[0].get_text().strip()
                m = re.match(r"(.+)(\d\.\d\.\d).*", app_info)
                print app_info
                if m:
                    app_name = m.group(1).strip()
                    app_status_map[app_name_map[app_name]] = m.group(2)
        print app_status_map
    except:
        print "Can't get the content of Add-on Factory Past Milestones page"
        exit(1)

get_app_status()
