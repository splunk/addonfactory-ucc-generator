FROM ubuntu:trusty

# Thanks Den for the original docker file
#MAINTAINER Denis Gladkikh <docker-splunk@denis.gladkikh.email>
MAINTAINER Caleb Cheung <ccheung@splunk.com>

ENV SPLUNK_HOME /opt/splunk
ENV SPLUNK_USERNAME admin
ENV SPLUNK_PASSWORD changeme

# install ssh server and supervisor and pip
RUN apt-get update && apt-get install -y wget supervisor python-dev \
    python-distribute python-pip nmap
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# copy over entrypoint sh and make sure it is executable
COPY entrypoint.py /sbin/entrypoint.py
RUN chmod +x /sbin/entrypoint.py

# Ports Splunk Web, Splunk Daemon, KVStore, Splunk Indexing Port, Network Input, HTTP Event Collector
EXPOSE 8000/tcp 8089/tcp 8191/tcp 9997/tcp 1514 8088/tcp

# install apppanda through pip (awesome!)
RUN pip install apppanda --index-url https://repo.splunk.com/artifactory/api/pypi/pypi-virtual/simple

# install splunk and apps through apppanda
ARG SPLUNK_BRANCH=current
ARG TA_BRO_VERSION=latest
RUN appPandaCLI.py --splunk_home ${SPLUNK_HOME} --branch ${SPLUNK_BRANCH} --apps TA-bro --app_versions ${TA_BRO_VERSION} --artifactory

# enable forwarding
RUN ${SPLUNK_HOME}/bin/splunk enable app SplunkForwarder --accept-license --answer-yes --no-prompt -auth ${SPLUNK_USERNAME}:${SPLUNK_PASSWORD}

# create bro log monitoring folder
RUN mkdir /bro

# install bro
RUN sh -c "echo 'deb http://download.opensuse.org/repositories/network:/bro/xUbuntu_14.04/ /' >> /etc/apt/sources.list.d/bro.list"
RUN wget -qO - http://download.opensuse.org/repositories/network:bro/xUbuntu_14.04/Release.key | apt-key add -
RUN apt-get update && apt-get install -y bro

# cleanup apt and remove extras
RUN apt-get purge -y --auto-remove wget && rm -rf /var/lib/apt/lists/*
RUN pip uninstall -y apppanda

# copy over network script
ADD scripts /sbin/
RUN chmod +x /sbin/*.py

# install network script dependencies
RUN pip install python-nmap netifaces netaddr

WORKDIR /opt/splunk

CMD ["/usr/bin/supervisord"]

# install local server settings
COPY local/* /opt/splunk/etc/system/local/

