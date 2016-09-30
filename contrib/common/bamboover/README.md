# Bamboover

This program helps moving Bamboo agents between servers. 

NOTE: This doesn't migrate the *plan*, only the agent. The Atlassian API currently doesn't support doing that.

## Usage

1. Before running the program, you will need to remove all the agents that you want to migrate from the server they are currently on.

2. Bamboover takes in the form of a CSV in the form "host_server,new_bamboo_server,bamboo_home", where host_server is the machine that the agent is located on and new_bamboo_server is the Bamboo server that the agent will get pointed to. bamboo_home is the location where the Bamboo agent is installed. It is typically /usr/local/bamboo/atlassian-bamboo-5.7.2, but may vary.

3. After the script is done running, you will need to go to the Bamboo servers that the agents now point to and approve access for the agents.


