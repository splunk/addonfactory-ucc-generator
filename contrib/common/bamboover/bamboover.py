#!/usr/bin/env python
import argparse
import csv
import logging
import paramiko
import os

parser = argparse.ArgumentParser('Move Bamboo agent from one server to another.')
parser.add_argument('file', help='CSV file containing "host_server,new_bamboo_server,bamboo_home"')

args = parser.parse_args()

logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

if not os.path.exists(args.file):
    print 'CSV file `{}` not found'.format(args.file)
    exit()

with open(args.file) as f:
    reader = csv.DictReader(f)

    for row in reader:
        host, server, home = row['host_server'], row['new_bamboo_server'], row['bamboo_home']
        wrapper_conf = os.path.join(home, 'conf', 'wrapper.conf')

        try:
            client = paramiko.SSHClient()
            # This policy will probably need to be changed later
            client.load_system_host_keys()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            logger.info('Connecting to ' + host)
            client.connect(host, username='bamboo', password='bamboo')

            logger.info('Modifying wrapper.conf')

            logger.info('Setting wrapper.app.parameter.2 to ' + server)
            command = "sed -i '/wrapper.app.parameter.2=/s#=.*#=https://{}/agentServer/#' {}".format(server, wrapper_conf)
            _, stdout, _ = client.exec_command(command)
            if stdout.channel.recv_exit_status() != 0:
                raise Exception('sed command failed')

            logger.info('Restarting bamboo agent')
            _, stdout, _ = client.exec_command(os.path.join(home, 'bin', 'bamboo-agent.sh') + ' restart')
            if stdout.channel.recv_exit_status() != 0:
                raise Exception('restarting bamboo agent failed')
        except Exception, err:
            logger.error(err)
            continue
        finally:
            client.close()
