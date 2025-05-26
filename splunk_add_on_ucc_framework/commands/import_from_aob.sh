#! /bin/bash

AOB_TA_DIR="$1"

#remove any trailing / from the dir name
AOB_TA_DIR=${AOB_TA_DIR%/}
AOB_TA_DIR_lowercase=$(echo "$AOB_TA_DIR" | tr '[:upper:]' '[:lower:]')

OUTPUT_UCC_TA_DIR="${AOB_TA_DIR}_ucc"
OUTPUT_UCC_TA_DIR_PACKAGE="${OUTPUT_UCC_TA_DIR}/package"

echo 
echo Converting "$AOB_TA_DIR"...
echo

# -------------------------------------------------------------------------------
#       Prepare this TA for ucc-gen
# -------------------------------------------------------------------------------

# -------------------------------------------------------------------------------
# create a 'package' directory and move all files from the existing TA into it
# -------------------------------------------------------------------------------
if [ -d ./$OUTPUT_UCC_TA_DIR_PACKAGE ]
then
    echo removing existing ./$OUTPUT_UCC_TA_DIR_PACKAGE directory
    rm -rf ./$OUTPUT_UCC_TA_DIR_PACKAGE
fi

echo Creating a new ./$OUTPUT_UCC_TA_DIR_PACKAGE directory 
echo 
mkdir -p $OUTPUT_UCC_TA_DIR_PACKAGE
cp -r ./$AOB_TA_DIR/* ./$OUTPUT_UCC_TA_DIR_PACKAGE



# -------------------------------------------------------------------------------
# copy the existing globalConfig.json file to the root directory and set the template type to use  (in our case, we'll use "input_with_helper" for all)
# -------------------------------------------------------------------------------
cp ./$OUTPUT_UCC_TA_DIR_PACKAGE/appserver/static/js/build/globalConfig.json $OUTPUT_UCC_TA_DIR

# check to see if this globalConfig.json file has the "template": attribute   (if it does, there's no need to do anything)
check_for_template=$(grep -c '"template":' $OUTPUT_UCC_TA_DIR/globalConfig.json)
if [[ $check_for_template -eq 0 ]]
then
    echo Updating $OUTPUT_UCC_TA_DIR/globalConfig.json.   Adding \"template\":\"input_with_helper\" to each \"service\" 
    # get the beginning section of the globalConfig.json file and save it for later
    global_config_part1=$(cat $OUTPUT_UCC_TA_DIR/globalConfig.json | sed -n  '/^            "services": \[/!p;//q')
    # get the services section of the json and add the template attribute to each input
    global_config_part2=$(cat $OUTPUT_UCC_TA_DIR/globalConfig.json | sed -n '/^            "services": \[/,$p' | sed -E 's/"name": "([^"]+)",/"template":"input_with_helper",@                    "name": "\1",/g' | tr '@' '\n')
    # now join both parts back together to recreate globalConfig.json
    echo "$global_config_part1"$'\n'"$global_config_part2" > $OUTPUT_UCC_TA_DIR/globalConfig.json
else
    # no need for anything - this has already had the template added
    echo template attribute already exists.  No changes to globalConfig required.
fi
echo 

# delete the reference to this being an AOB-TA in the app.conf file
sed -n '/^# this add-on is powered by splunk Add-on builder/d' ./$OUTPUT_UCC_TA_DIR_PACKAGE/default/app.conf


# -------------------------------------------------------------------------------
# ucc-based TA's will require the splunktaucclib library to be included in the build.  Add it here.
# -------------------------------------------------------------------------------
echo " -------------------------------------------"
echo "     Creating lib/requirements.txt file"
echo " -------------------------------------------"
mkdir -p ./$OUTPUT_UCC_TA_DIR_PACKAGE/lib
echo "splunktaucclib>=4.1.0" > ./$OUTPUT_UCC_TA_DIR_PACKAGE/lib/requirements.txt
echo "# " >> ./$OUTPUT_UCC_TA_DIR_PACKAGE/lib/requirements.txt
echo "#   The following list *may* also be required for your modular inputs to work.   " >> ./$OUTPUT_UCC_TA_DIR_PACKAGE/lib/requirements.txt
echo "#   Uncomment those that are required.   " >> ./$OUTPUT_UCC_TA_DIR_PACKAGE/lib/requirements.txt
echo "# " >> ./$OUTPUT_UCC_TA_DIR_PACKAGE/lib/requirements.txt 

# -------------------------------------------------------------------------------
# identify any additional imported libraries and add them to the requirements.txt file (exclude from xxx import yyy for now)
# -------------------------------------------------------------------------------
cat ./$OUTPUT_UCC_TA_DIR_PACKAGE/bin/input_module_*.py | grep import | grep -Ev '(from |import os|import sys|import time|import datetime|import json | import json, re)' | sed -n 's/.*import /#/p' | xargs -L1 | sort | uniq >>./$OUTPUT_UCC_TA_DIR_PACKAGE/lib/requirements.txt

# -------------------------------------------------------------------------------
#  for any 'import from' statements let's see if the library is included in the TA's /bin directory.    If NOT, let's add it to the requuirements.txt file
# -------------------------------------------------------------------------------
# let's work from the ./$OUTPUT_UCC_TA_DIR_PACKAGE/bin directory
cd ./$OUTPUT_UCC_TA_DIR_PACKAGE/bin

import_froms=$(cat ./input_module_*.py | grep import | grep from | sed -n 's/from //p' | xargs -L1 | sort | uniq | awk '{print $1}' | cut -d. -f1)
#echo "$import_froms"

included_dirs=$(ls -d */ | sed '/\./d;s%/$%%' )
#echo "$included_dirs"

for i in $import_froms
do
    included=false
    for x in $included_dirs
    do
        if [ "$i" == "$x" ] ; then
            included=true
        fi
    done
    if ! $included ; then
        echo "      Adding $i to requirements.txt"
        echo "#$i" >>../../package/lib/requirements.txt
    fi
done

if  grep -qinE base64 ../../package/lib/requirements.txt  ; then 
    echo "      Updating base64 to pybase64 in requirements.txt"
    sed -i.bak 's/base64/pybase64/g' ../../package/lib/requirements.txt
    echo 
fi
echo 
#  Remind the user to check for required libraries
echo "Please check ./$OUTPUT_UCC_TA_DIR_PACKAGE/lib/requirements.txt file for additional libraries you *may* need to include for your"
echo "modular inputs to work.  This script collects libraries that may or may not be needed and comments them all in "
echo "/$OUTPUT_UCC_TA_DIR_PACKAGE/lib/requirements.txt:"
cat ../../package/lib/requirements.txt
echo


# -------------------------------------------------------------------------------
#          Now let's start processing any alert actions
# -------------------------------------------------------------------------------
echo " ---------------------------------------"
echo "     Processing Alert Actions..."
echo " ---------------------------------------"
for MODALERT in $(ls ./*/modalert_*_helper.py 2>/dev/null | xargs -L1 | awk -v FS="(modalert_|_helper.py)" '{print $2}')
do
    echo Processing alert action named:   $MODALERT
    # -------------------------------------------------------------------------------
    # What do we need to do?
      # Copy the imports from the modalert_<name>_helper.py inot the <name>.py source code
      #    Change the import *_declare to import_declare_test
      #    Remove duplicate import statements  (lines 1-4 of <name>.py)
      # Remove the original process_event() function 
      # Copy the process_event() function from modalert_<name>_helper.py into the <name>.py source code  (and indent it)
      # Remove the import modalert_<name>_helper statement
      # Change the package name for alert_action_base to splunktaucclib.alert_action_base
      # Remove the helper directory     (dirs=(/testfolder/*/))
    # -------------------------------------------------------------------------------
    # Create variables to concatenate later
    IMPORT_STATIC="import import_declare_test"
    IMPORTS=$(cat ./*/modalert_${MODALERT}_helper.py | sed -n '1,/def process_event(/p' | sed '/import .*_declare/d' | sed '/# encoding = utf-8/d' | sed '$D' )
    PROCESS_EVENTS=$(cat ./*/modalert_${MODALERT}_helper.py |  sed -n '/def process_event(/,//p' | sed 's/^/    /' )

    # read in the old alert action file and remove the process_event function cocde
    alert_action=$(cat ${MODALERT}.py | sed '1,4d' | sed -e '/    def process_event(/,/if __name__ == "__main__"/{//!d;}')
    # concatenate the imports with the alert_action source
    alert_action="$IMPORT_STATIC"$'\n'"$IMPORTS"$'\n'"$alert_action"
    # add the process_events function
    alert_action=${alert_action/    def process_event(self, *args, **kwargs):/"$PROCESS_EVENTS"}
    # remove the reference to modalert_..._helper
    alert_action=$(echo "$alert_action" | sed '/import modalert_.*_helper/d')
    # change the pathing for alert_actions_base
    alert_action=$(echo "$alert_action" | sed 's/from alert_actions_base import ModularAlertBase/from splunktaucclib.alert_actions_base import ModularAlertBase/')
    # write out the new alert action file
    echo "$alert_action" > $MODALERT.py
    echo Done.   

done
echo Finished with Alert Actions


# -------------------------------------------------------------------------------
#          Now let's start processing any modular inputs
# -------------------------------------------------------------------------------
echo
echo " ---------------------------------------"
echo "     Processing Modular Inputs..."
echo " ---------------------------------------"
# -------------------------------------------------------------------------------
#    Remove any py files for any REST input that have an accompanying .cc.json file   -- ucc-gen will recreate the python file for us
# -------------------------------------------------------------------------------
for REST_API_INPUT in $(ls *.cc.json | sed -e 's/\.cc.json$//' 2> /dev/null)
do
    rm "input_module_$REST_API_INPUT".py 2> /dev/null
    rm "$REST_API_INPUT".py 2> /dev/null
done


#-----------------------------------------------------
# Check all *.py files for tab indentation errors
#-----------------------------------------------------
echo 
echo "Checking for potential issues with tabs and/or indentation.   (python3 doesn't like mixing tabs and spaces)"
got_tabs=$(grep -n '\t' input_module_*.py | wc -l)
if [ $got_tabs != "0" ] 
  then
    echo "****************************************************************"
    echo "  Issues Found.  These must be fixed before running ucc-gen. "
    echo "****************************************************************"
    grep -n '\t' input_module_*.py 
    echo "****************************************************************"
    read -p "Would you like to continue without fixing? (y/n)" yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) echo "Exiting"; exit;;
        * ) echo "Please answer y(es) or n(o).";;
    esac
  else
    echo "no tab/indentation issues found."
fi  
echo
echo

for OUTPUT in $(ls input_module_*.py | xargs -L1 | awk -F"input_module_" '{print $2}')
do
    echo Processing input named:   $OUTPUT
    # What do we need to do?
      # Copy the new imports and the input source code file into a variable
      #   -- It'll be easier to read the file into a variable and then process the variable (since the variable won't care about newline characters)
      # Remove the old AOB-required import statements
      # Change the package name for base_modinput.py
      # Add the /lib directory in the add-on's source code
      # Set Single Instance Mode to false  (or copy it from $OUTPUT)
      # Copy the validate_input code from AOB's template file (input_module_$OUTPUT)
      # Copy the collect_events code from AOB's template file (input_module_$OUTPUT)


    # -------------------------------------------------------------------------------
    #  split $OUTPUT file into header and footer  (pre-class() and post() statements)
    # -------------------------------------------------------------------------------

    # import_declare_test adds the ./lib directory to the path and needs to happen early
    sed -i.bak 's/^import modinput_wrapper\.base_modinput/import import_declare_test\nimport modinput_wrapper\.base_modinput\n/g' $OUTPUT

    # add all imports from imports.py to the file
    all_imports=$(cat $2)
    (echo "$all_imports" && cat $OUTPUT) > filename1 && mv filename1 $OUTPUT

    # Now let's go to work on the single source code
    # -------------------------------------------------------------------------------
    # Remove these:
    #   1. The old import $AOB_TA_DIR_lowercase_declare statement
    #   2. The old from solnlib.packages.splunklib import modularinput as smi  statement
    #   3. The old import modinput_wrapper.base_modinput statement
    #   4. The old "Do Not Edit" lines from AOB code generation
    # -------------------------------------------------------------------------------


    sed -i.bak '/^import .*_declare$/d' $OUTPUT
    sed -i.bak '/^from solnlib.packages.splunklib import modularinput as smi/d' $OUTPUT
    sed -i.bak '/import modinput_wrapper.base_modinput/d' $OUTPUT
    sed -i.bak '/Do not edit this file!!!/,/Add your modular input logic to file/d' $OUTPUT

    # -------------------------------------------------------------------------------
    # change the reference for base_modinput to use the name in the imports.py
    # -------------------------------------------------------------------------------
    sed -i.bak 's/(modinput_wrapper.base_modinput./(base_mi./' $OUTPUT

    # -------------------------------------------------------------------------------
    # set single instance mode to false and remove excess code from $OUTPUT
    # -------------------------------------------------------------------------------
    # Remove the if then logic and set the variable to False and fix the indentation

    sed -i.bak "/^        if 'use_single_instance_mode' /,/use_single_instance = False/{/use_single_instance = False/p;d;}" $OUTPUT
    sed -i.bak 's/^            use_single_instance = False/        use_single_instance = False/' $OUTPUT

    echo Done.
done
echo Finished with Modular Inputs
echo

# OK, let's get back to the main directory
cd ../..

# create or update the README.txt file if it exists(required to pass appInspect)
if [ -f  ./package/README.txt ]; then
    sed -i.bak 's/This is an add-on powered by the Splunk Add-on Builder./This is an add-on powered by the Splunk Universal Configuration Console (UCC)./g' ./package/README.txt
else
   echo "This is an add-on powered by the Splunk Universal Configuration Console (UCC)." > ./package/README.txt
fi

# prepare app.manifest

# remove all lines starting with comment sign from original app.manifest
sed -i'.aob' -E '/^#/d' ./package/app.manifest


echo
echo " ----------------------------------------------------------------"
echo "     Cleaning Up... Removing files that are no longer needed "
echo " ----------------------------------------------------------------"
# remove AOB files and other things that will be automatically recreated with ucc-gen
rm ./package/default/addon_builder.conf
rm ./package/default/*_settings.conf
rm ./package/metadata/local.meta 2> /dev/null
rm ./package/bin/*.pyc 2> /dev/null
rm ./package/bin/__pycache__ 2> /dev/null
rm ./package/bin/*_rh*.py 2> /dev/null
rm ./package/aob_events_in_meta.json
rm ./package/default/app.conf
rm ./package/default/restmap.conf
rm ./package/default/web.conf
rm ./package/default/data/ui/views/configuration.xml
rm ./package/default/data/ui/views/inputs.xml
rm ./package/default/inputs.conf
rm ./package/app.manifest.aob

rm ./package/splunkbase.manifest

rm -rf ./package/locale
rm -rf ./package/bin/*/aob_py*/
rm -rf ./package/bin/*_declare.py
rm -rf ./package/appserver/static/js/build
rm -rf ./package/appserver/templates
rm -rf ./package/appserver/static/css
rm -rf ./package/appserver/static/img
rm -rf ./package/README
rm -rf ./package/*.aob_meta
rm ./package/README/addon_builder.conf.spec
rm ./package/bin/*/modalert_*_helper.py 2> /dev/null
rm ./package/bin/*/alert_actions_base.py 2> /dev/null
rm ./package/bin/*/cim_actions.py 2> /dev/null
rm ./package/bin/*/logging_helper.py 2> /dev/null
rm -rf ./package/default/data
find . -name "*.bak" -type f -delete     # remove sed temporary backup files
find ./package/bin/ -empty -type d -delete     # remove any empty directories from /bin
find ./package/ -empty -type d -delete     # remove any empty directories from / (assuming it is appserver only)
echo Done. 

#-----------------------------------------------------
# Check all *.py files for tab indentation errors
#-----------------------------------------------------
echo "Checking for potential issues with tabs and/or indentation.   (python3 doesn't like mixing tabs and spaces)"
got_tabs=$(grep -n '\t' ./package/bin/*.py | wc -l)
if [ $got_tabs != "0" ] 
  then
    echo "****************************************************************"
    echo "  Issues Found.  These must be fixed before running ucc-gen. "
    echo "****************************************************************"
    grep -n '\t' ./package/bin/*.py 
    echo "****************************************************************"
    echo "Exiting"
    exit
  else
    echo "no tab/indentation issues found."
fi  
echo
echo
