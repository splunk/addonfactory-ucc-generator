#!/usr/bin/env bash

set -eE
set -v
BUILT_FOLDER=/tmp/ucc_built
# Creates folder for output folder.
mkdir -p $BUILT_FOLDER
# Gets the name of the archive after running `poetry build`.
ARCHIVE_NAME=$(find dist -name '*.tar.gz' -exec basename {} \;)
# Gets folder name from archive name. Removes .tar.gz ending from the archive name.
FOLDER_NAME=$(echo "$ARCHIVE_NAME" | sed -E "s/.tar.gz//")
# Extracts archive to $BUILT_FOLDER.
tar -zxf dist/"$ARCHIVE_NAME" -C $BUILT_FOLDER
# Builds a path to UCC to check UI files and folders.
UCC_FOLDER=$BUILT_FOLDER/$FOLDER_NAME/splunk_add_on_ucc_framework
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
