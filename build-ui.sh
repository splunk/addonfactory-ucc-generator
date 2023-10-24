#!/bin/bash

cd ui && yarn run setup
cd ..

cp -n --recursive ui/dist/build/ splunk_add_on_ucc_framework/package/appserver/static/js/build/
