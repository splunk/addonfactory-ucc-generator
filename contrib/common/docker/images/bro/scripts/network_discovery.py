#!/usr/bin/python
import netifaces
import netaddr
import socket
import nmap

ifaces = netifaces.interfaces()
# => ['lo', 'eth0', 'eth1']

myiface = 'eth0'
addrs = netifaces.ifaddresses(myiface)
# {2: [{'addr': '192.168.1.150',
#             'broadcast': '192.168.1.255',
#             'netmask': '255.255.255.0'}],
#   10: [{'addr': 'fe80::21a:4bff:fe54:a246%eth0',
#                'netmask': 'ffff:ffff:ffff:ffff::'}],
#   17: [{'addr': '00:1a:4b:54:a2:46', 'broadcast': 'ff:ff:ff:ff:ff:ff'}]}

# Get ipv4 stuff
ipinfo = addrs[socket.AF_INET][0]
address = ipinfo['addr']
netmask = ipinfo['netmask']

# Create ip object and get
cidr = netaddr.IPNetwork('%s/%s' % (address, netmask))
# => IPNetwork('192.168.1.150/24')
network = cidr.network
# => IPAddress('192.168.1.0')

nm = nmap.PortScanner()
nm.scan(hosts=str(cidr), arguments='-F -T1')
