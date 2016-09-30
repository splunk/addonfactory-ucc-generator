#!/usr/bin/python
import nmap
import time

nm = nmap.PortScanner()
threat_list = [
    "1.33.230.158",
    "1.34.163.57",
    "5.2.56.182",
    "23.88.208.112",
    "37.59.111.192"
    ]

while (1):
    for threat in threat_list:
        nm.scan(threat, arguments='-sS')
    time.sleep(1800)

