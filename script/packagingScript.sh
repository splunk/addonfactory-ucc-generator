#!/bin/sh

echo "Initializing Packaging tool."

# mkdir -p packagingTool
# cd packagingTool
# repository="https://siddharthkhatsuriya-crest:05e35ca18a6c7d851d9ea30c88d50354552ff915@github.com/splunk/splunk-add-on-sdk-python.git"
# git clone "$repository"

# cd splunk-add-on-sdk-python
# git checkout test/python-module-branch-with-ucc-fix
# cd ..

echo " Checking for python 3"
if ! python3 -v &> /dev/null
then
    echo "Python3 could not be found"
    echo "Installing python 3"
    pwd_var=`pwd`
    # sudo yum -y install gcc openssl-devel bzip2-devel libffi-devel
    sudo apt-get -qq update
    sudo apt-get -qq install build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev curl libbz2-dev
    cd /usr/src
    sudo wget https://www.python.org/ftp/python/3.7.9/Python-3.7.9.tgz
    sudo tar xzf Python-3.7.9.tgz 
    cd Python-3.7.9 
    sudo ./configure --enable-optimizations 
    sudo make altinstall 
    sudo rm -f /usr/src/Python-3.7.9.tgz
    # sudo ln -s /usr/bin/python3.7 /usr/bin/python3
    # sudo ln -s /usr/bin/pip3.7 /usr/bin/pip3
    alias python3='python3.7'
    alias pip3='pip3.7'
    . ~/.bashrc
    if python3 -v &> /dev/null
    then
        echo "Python Installed"
    fi
    cd $pwd_var
fi

echo "Installing Virtual Environment"
pip3 install virtualenv
python3 -m virtualenv .venv -p python3
. .venv/bin/activate
echo "Virtual Environment Installed and Activated"

echo "Installing Dependencies"
# sudo yum -y install libxslt-devel libxml2-devel
sudo apt-get -qq install python-pip 
sudo apt-get -qq install -y libxml2-dev libxslt-dev lib32z1-dev python-lxml 
pip3 install poetry 

cd splunk-add-on-sdk-python
pip3 install -r splunk_add_on_ucc_framework/requirements.txt
# pip3 install solnlib
pip3 install future
# pip3 install mako
# pip3 install munch
# pip3 install lxml
# pip3 install jinja2

echo "Building package"

python3 -m poetry build
# python3 -m poetry run ucc-gen --source tests/package/Splunk_TA_UCCExample --config tests/data/globalConfig.json
python3 -m poetry run ucc-gen --source ../package/ --config ../package/appserver/static/js/build/globalConfig.json

cd ..

echo "Check output folder for the addon package."


echo "Extracting Appserver Files"
mkdir -p package/appserver/static/css
cp -r packagingTool/splunk-add-on-sdk-python/output/*/appserver/static/css/. package/appserver/static/css
mkdir -p package/appserver/static/styles
cp -r packagingTool/splunk-add-on-sdk-python/output/*/appserver/static/styles/. package/appserver/static/styles
mkdir -p package/appserver/static/js/build
cp -r packagingTool/splunk-add-on-sdk-python/output/*/appserver/static/js/build/*.js package/appserver/static/js/build
mkdir -p package/appserver/templates
cp -r packagingTool/splunk-add-on-sdk-python/output/*/appserver/templates/. package/appserver/templates

echo "Extracting User Interface"
mkdir -p package/default/data
cp -r packagingTool/splunk-add-on-sdk-python/output/*/default/data/. package/default/data

echo "Extracting Lib"
mkdir -p package/lib
cp -r packagingTool/splunk-add-on-sdk-python/output/*/lib/. package/lib

cat package/package_using_script

