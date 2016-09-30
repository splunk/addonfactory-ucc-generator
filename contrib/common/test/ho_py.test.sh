#!/usr/bin/env bash
# Wrapper to just call py.test using the splunk-boot instance on bamboo agents
# Most of the logging code ganked from panda-wrapper.sh
if [ "$BUILDKEY" -a "$BUILDNUMBER" ]; then
    export BUILD_NUMBER="$BUILDKEY-$BUILDNUMBER"
fi

function plogger() {
    # Wrapper for LOGGER(1), Linux and SunOS take different flags, that's why.
    if [ x$(uname) == 'xSunOS' ]; then
        logger -i -t $0 "$BUILD_NUMBER $1"
        echo $*
    else
        logger -sit $0 "$BUILD_NUMBER $1"
    fi
}

# Get Bamboo home
# If we're not running as user bamboo, lets use bamboo's home dir as our BAMBOO_HOME
# (this might happen if we're the default agent running as root... wtf does this?)
# Also, we're trying two different ways of mapping ~bamboo to keep SunOS happy
if [ -d "~bamboo" ]; then
    export BAMBOO_HOME="~bamboo"
fi
if [ -d ~bamboo ]; then
    export BAMBOO_HOME=~bamboo
fi
if [ ! "$BAMBOO_HOME" ]; then
    if [ -d "$HOME" ]; then
	export BAMBOO_HOME="$HOME"
    fi
fi
    plogger "Set BAMBOO_HOME=$BAMBOO_HOME"

# SPLUNK_BOOT is where we'll call the python that runs py.test
# Set it up if it's not already set
if [ ! "$SPLUNK_BOOT" ]; then
    export SPLUNK_BOOT="$BAMBOO_HOME/splunk-boot"
    plogger "Set SPLUNK_BOOT=$SPLUNK_BOOT"
else
    plogger "No change to SPLUNK_BOOT=$SPLUNK_BOOT"
fi

# Set up SOLN_ROOT, if it's not already set up
if [ ! "$SOLN_ROOT" ]; then
    export SOLN_ROOT="$BAMBOO_HOME/splunk/solutions"
    plogger "Set SOLN_ROOT=$SOLN_ROOT"
else
    plogger "No change to SOLN_ROOT=$SOLN_ROOT"
fi

# TODO: Set up PYTHONPATH, if it's not already set up

$SPLUNK_HOME/bin/splunk cmd python $SPLUNK_BOOT/bin/py.test --junitxml=test-result.xml $1
