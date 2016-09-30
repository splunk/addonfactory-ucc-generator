#!/usr/bin/env bash
# Wrapper to just call py.test using the new_test with helmut libraries on bamboo agents
# Similar to ho_py.test.sh except using new_test pytest instead of splunk-boot pytest
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

# HELMUT_TESTDIR is where we call the pyhton that run the py.test
# Need to call setTestEnv first
if [ ! "$HELMUT_TESTDIR"]; then
	export HELMUT_TESTDIR="$BAMBOO_HOME/src/splunk/current/new_test"
	plogger "Set HELMUT_TESTDIR=$HELMUT_TESTDIR"
else
	plogger "No change to HELMUT_TESTDIR=$HELMUT_TESTDIR"
fi

#calling SetTestEnv
cd $HELMUT_TESTDIR
source setTestEnv

$SPLUNK_HOME/bin/splunk cmd python $HELMUT_TESTDIR/bin/pytest/pytest.py $1