#!/bin/bash -i
shopt -s extglob;

# little helper to clear all tests in corejs_test, silently, without removing support files
# note: only tested on mac os x (extglob stuff), proceed with caution (there's a rm -rf in here!)
# TODO: delete this file after migration

cd $SPLUNK_SOURCE/cfg/bundles/corejs_test/appserver/test || { echo 'corejs_test directory not found' ; exit 1; }
rm -rf !(support|tutorial);
