#!/usr/bin/env bash

set -eE
set -v
BUILT_FOLDER=/tmp/ucc_built
mkdir -p $BUILT_FOLDER
tar -zxf dist/splunk_add_on_ucc_framework-0.0.0.tar.gz -C $BUILT_FOLDER
UCC_FOLDER=$BUILT_FOLDER/splunk_add_on_ucc_framework-0.0.0/splunk_add_on_ucc_framework
if [[ ! -d $UCC_FOLDER/package/ ]]
then
  echo "package/ folder does not exist"
  exit 1
fi
if [[ ! -d $UCC_FOLDER/schema/ ]]
then
  echo "schema/ folder does not exist"
  exit 1
fi
if [[ ! -f $UCC_FOLDER/THIRDPARTY ]]
then
  echo "THIRDPARTY file does not exist"
  exit 1
fi
if [[ ! -f $UCC_FOLDER/VERSION ]]
then
  echo "VERSION file does not exist"
  exit 1
fi
echo "UCC UI files are present"
