################################################################################
#
# Copyright (c) 2015 Splunk.Inc. All Rights Reserved
#
################################################################################
"""
This module provide config information

Author: Jing Shao(jshao@splunk.com)
Date:    2015/11/19 10:25:10
"""

CONFLUENCE_URL = "https://confluence.splunk.com/rpc/xmlrpc"

LABEL_CHOSE = "X"
LABEL_TODO = "TBD"
LABEL_PLACEHOLDER = " "

#The label in hmtl table is UNKNOWN
LABEL_UNKNOWN = "UNKNOWN"


STATUS_TRUE = 1
STATUS_FALSE = 0
STATUS_TODO = -1

COMMAND_DELIMITER = ';'

HTML_TEMPLATE = '''
<h2>Installation Locations and Limitations</h2><p><strong>Two basic questions:</strong></p><ol><li><span>Where does the add-on need to be installed?</span></li><li><span>What are the deployment options? (define limitations)</span></li></ol><p>&nbsp;</p><p>To make it easier, I have provided a table that you can copy and paste and include Xs to mark your answers:</p><table><tbody><tr><td>This&nbsp;<strong>add-on must be deployed to these tiers</strong>&nbsp;in order for all functionality included in the add-on to work.</td><td>UNKNOWN</td><td colspan="1"><span>UNKNOWN</span></td><td><span>UNKNOWN</span></td></tr><tr><th>&nbsp;</th><th>True</th><th>False</th><th>Comments</th></tr><tr><td>This add-on includes&nbsp;<strong>search-time operations</strong>&nbsp;(not counting prebuilt panels).</td><td><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td>&nbsp;</td></tr><tr><td>This add-on&nbsp;<strong>has been tested on a Search Head Cluster</strong>&nbsp;and been proven to work as expected. (Lack of testing does not imply lack of support, necessarily.)</td><td><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td>&nbsp;</td></tr><tr><td>This add-on includes&nbsp;<strong>index-time operations</strong>&nbsp;<strong></strong>.</td><td><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td>&nbsp;</td></tr><tr><td colspan="1">This add-on includes&nbsp;<strong>index-time operations, BUT those operations occur on the heavy forwarder so this add-on does NOT need to be on indexers if it is installed on heavy forwarders</strong>&nbsp;for data collection.</td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1">&nbsp;</td></tr><tr><td>If this add-on is installed on indexers, it&nbsp;<strong>supports</strong>&nbsp;<strong>indexer clusters</strong>.</td><td><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td>&nbsp;</td></tr><tr><td>This add-on includes a&nbsp;<strong>data collection component</strong>&nbsp;(generally installed on a forwarder in a distributed environment.)</td><td><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td>&nbsp;</td></tr><tr><td>The data collection&nbsp;<strong>should be configured via Splunk Web UI</strong>&nbsp;as a best practice. (Thus a heavy forwarder is strongly recommended or required in a distributed environment.)</td><td><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td>&nbsp;</td></tr><tr><td colspan="1">The data collection&nbsp;<strong>can be configured without using the Splunk Web UI</strong>, thus it is possible to use universal or light forwarders instead.</td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1">&nbsp;</td></tr><tr><td colspan="1">The forwarder or single-instance Splunk Enterprise doing the data collection&nbsp;<strong>must be installed directly on the machine running the software/technology (F5 server, Nagios Core, etc)</strong>.</td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1">&nbsp;</td></tr><tr><td colspan="1">The data collection component of the add-on&nbsp;<strong>requires Python</strong>, thus a heavy or light forwarder is required and the universal forwarder is not supported). (Although the customer can install a Python interpreter herself, this is not supported, so do not consider that option.)</td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1">&nbsp;</td></tr><tr><td colspan="1">This add-on&nbsp;<strong>requires the search head to be able to communicate to the forwarders</strong>&nbsp;(such as with the Splunk App for Stream) and thus is not supported for Splunk Cloud.</td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1">&nbsp;</td></tr><tr><td colspan="1">This add-on&nbsp;<strong>requires the search head to be able to communicate to the third-party software/technology</strong>&nbsp;(such as with a custom command or workflow action) and thus requires that the customer configure their credentials to the third-party technology on the search heads as well as on the forwarders.</td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1">&nbsp;</td></tr><tr><td colspan="1">This add-on&nbsp;<strong>depends on the credential vault to encrypt sensitive data</strong>, thus users cannot use a Deployment Server because of known issues propagating credentials across instances with unique client secrets.</td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1">&nbsp;</td></tr><tr><td colspan="1">This add-on uses the&nbsp;<strong>KV Store</strong>.</td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1">&nbsp;</td></tr><tr><td colspan="1">This add-on includes&nbsp;<strong>index definitions</strong>. (If a previous version used to include index definitions but this version does not, please note this in the migration guide section below even if no backwards compatibility is expected.)</td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1">&nbsp;</td></tr><tr><td colspan="1">This add-on&nbsp;<strong>retains state and checkpoint locally</strong>&nbsp;on the data ingestion node?&nbsp;<br />(This means that if you use a forwarder, that forwarder needs to be backed up, and that you cannot use a deployment server&nbsp;because of potential for duplication by running on multiple forwarders.)</td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1"><span>UNKNOWN</span></td><td colspan="1">&nbsp;</td></tr></tbody><thead><tr><th><div class="tablesorter-header-inner"><div class="tablesorter-header-inner">&nbsp;</div></div></th><th><div class="tablesorter-header-inner"><div class="tablesorter-header-inner">Search<br />Heads&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div></div></th><th colspan="1"><div class="tablesorter-header-inner"><div class="tablesorter-header-inner">Indexers&nbsp;&nbsp;</div></div></th><th><div class="tablesorter-header-inner"><div class="tablesorter-header-inner">Forwarders</div></div></th></tr></thead></table>
'''

QUESTIONS = [
     "This add-on must be deployed to these tiers in order for all functionality included in the add-on to work.",
     "This add-on includes search-time operations (not counting prebuilt panels).",
     "This add-on has been tested on a Search Head Cluster and been proven to work as expected. (Lack of testing does not imply lack of support, necessarily.)",
     "This add-on includes index-time operations.",
     "This add-on includes index-time operations, BUT those operations occur on the heavy forwarder so this add-on does NOT need to be on indexers if it is installed on heavy forwarders for data collection.",
     "If this add-on is installed on indexers, it supports indexer clusters.",
     "This add-on includes a data collection component (generally installed on a forwarder in a distributed environment.)",
     "The data collection should be configured via Splunk Web UI as a best practice. (Thus a heavy forwarder is strongly recommended or required in a distributed environment.)",
     "The data collection can be configured without using the Splunk Web UI, thus it is possible to use universal or light forwarders instead.",
     "The forwarder or single-instance Splunk Enterprise doing the data collection must be installed directly on the machine running the software/technology (F5 server, Nagios Core, etc).",
     "The data collection component of the add-on requires Python, thus a heavy or light forwarder is required and "
     "the universal forwarder is not supported). (Although the customer can install a Python interpreter herself, this is not supported, so do not consider that option.)",
     "This add-on requires the search head to be able to communicate to the forwarders (such as with the Splunk App for Stream) and thus is not supported for Splunk Cloud.",
     "This add-on requires the search head to be able to communicate to the third-party software/technology (such as with a custom command or workflow action) and thus requires that the customer configure their credentials to the third-party technology on the search heads as well as on the forwarders.",
     "This add-on depends on the credential vault to encrypt sensitive data, thus users cannot use a deployment server because of known issues propagating credentials across instances with unique client secrets.",
     "This add-on uses the KV Store.",
     "This add-on includes index definitions. (If a previous version used to include index definitions but this version does not, please note this in the migration guide section below even if no backwards compatibility is expected.)",
     "This add-on retains state and checkpoint locally on the data ingestion node?(This means that if you use a forwarder, that forwarder needs to be backed up, and that you cannot use a deployment server because of potential for duplication by running on multiple forwarders",
]
