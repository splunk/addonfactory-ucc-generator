#!/bin/sh

#  Jenkins UI integration script
#
#  EDIT WITH CAUTION!
#    This script impacts all of our CI runs. If you break it, expect pitchforks and flaming torches.
#
#  WHAT THIS DOES:
#    Prepares environment for JS/node scripts (npm install)
#    Hand over control to task runner (runs unit tests and linters)
#
#  INPUT/ENVIRONMENT:
#    No arguments
#    Working directory is $SPLUNK_SOURCE/web
#    Contrib installed in $SPLUNK_HOME/bin (might be cached)
#    Splunk is -not- compiled/installed/available
#    GNU parallel is available
#
#  OUTPUT:
#    Writes ci_ui_results.properties, setting UI_UNIT_JUNIT_FILES to a list of
#      JUnit-style XML files we want Jenkins to evaluate.

printf -v line '%*s\n' 78
line2="### %-70s ###\n"
echo ${line// /#}
printf "$line2" "Starting UI CI run - ci_ui_integration.sh"
echo ${line// /#}

fail_build() {
    echo ${line// /#}
    echo ${line// /#}
    printf "$line2" " FAILED $2"
    echo ${line// /#}
    echo ${line// /#}
    exit $1
}

# ensure contrib node/npm are used (not system)
# enable node to find shared libraries (ssl/zlib)
# install npm packages
# copy corejs_test and splunkjs_test directories (this will go away soon)
prepare() {
    echo ${line// /#}
    printf "$line2" "Setting LD_LIBRARY_PATH to splunk /lib"

    export LD_LIBRARY_PATH=$SPLUNK_HOME/lib
    printf "$line2" "LD_LIBRARY_PATH is now: $LD_LIBRARY_PATH"

    echo ${line// /#}
    printf "$line2" "Prepending splunk /bin to PATH"

    export PATH=$SPLUNK_HOME/bin:$PATH
    printf "$line2" "PATH is now: $PATH"

    echo ${line// /#}
    printf "$line2" "Run (with npm): install"

    $SPLUNK_HOME/bin/node $SPLUNK_HOME/bin/npm --tmp /tmp/npmtmp install
    EXIT_CODE=$?
    if [ $EXIT_CODE -ne 0 ] ; then
        printf "$line2" "UI preparation ERROR: npm install failed"
        fail_build $EXIT_CODE npm_install
    fi

    echo ${line// /#}
    printf "$line2" "Copy (to SPLUNK_HOME/etc/apps): corejs_test and splunkjs_test"

    mkdir -p $SPLUNK_HOME/etc/apps
    cp -R $SPLUNK_SOURCE/cfg/bundles/corejs_test $SPLUNK_HOME/etc/apps
    cp -R $SPLUNK_SOURCE/cfg/bundles/splunkjs_test $SPLUNK_HOME/etc/apps
    cp -R $SPLUNK_SOURCE/cfg/bundles/splunk_monitoring_console $SPLUNK_HOME/etc/apps
}

# run jshint and eslint
run_tasks() {
    echo ${line// /#}
    printf "$line2" "Run: node ci_ui_runner.js"

    $SPLUNK_HOME/bin/node ci_ui_runner.js
    EXIT_CODE=$?
    if [ $EXIT_CODE -ne 0 ] ; then
        printf "$line2" "UI tasks ERROR: ci_ui_runner.js: ${EXIT_CODE}"
        fail_build $EXIT_CODE ci_ui_tasks
    fi
}

# write list of xml output files
writeResults() {
    echo UI_UNIT_JUNIT_FILES=\
build-src/web/test/xml_output/corejs.xml,\
build-src/web/test/xml_output/corejs_views.xml,\
build-src/web/test/xml_output/corejs_views_shared.xml,\
build-src/web/test/xml_output/splunkjs.xml,\
build-src/web/test/xml_output/splunk_monitoring_console.xml,\
build-src/web/jshint.xml,\
build-src/web/eslint.xml\
 > ci_ui_results.properties
}

prepare
run_tasks
writeResults
