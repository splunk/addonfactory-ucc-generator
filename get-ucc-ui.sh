
if [ -z ${1+x} ]; then source .ucc-ui-version; else VERSION=$1; fi

wget https://github.com/splunk/addonfactory-ucc-base-ui/releases/download/${VERSION}/splunk-ucc-ui.tgz
