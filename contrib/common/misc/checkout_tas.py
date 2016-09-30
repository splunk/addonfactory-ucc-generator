#!/usr/bin/python
import sys
import os
import stashy

### arguments: username, password, directory to checkout to, clone/pull

if(len(sys.argv) < 5):
    print "To use this script you need 4 arguments:\n1. git username\n2. git password\n3. base directory to use\n4. to clone or to refresh"
    sys.exit()

stash = stashy.connect("http://git.splunk.com", sys.argv[1], sys.argv[2])
for repo in stash.projects['SOLN'].repos.list():
    repodir = sys.argv[3] + "/" + repo['name']
    for url in repo["links"]["clone"]:
        if (url["name"] == "ssh" and url["href"].find("ta-") != -1):
            if ((sys.argv[4]) == "clone"):
                os.system("git clone %s %s" % (url["href"], repodir))
                break
            else:
                print "Going to refresh %s in %s" % (repo['name'], repodir)
                os.chdir(repodir)
                os.system("git pull origin master")
                break
                