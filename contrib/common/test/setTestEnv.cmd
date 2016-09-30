:: $Id: //splunk/solutions/common/test/setTestEnv.cmd#1 $

@echo off

set SPLUNK_HOME=c:\progra~1\splunk
set SOLN_ROOT=C:\bamboo\splunk\solutions

if NOT DEFINED SPLUNK_HOME (
  echo Your SPLUNK_HOME isn't set. Please set the path to your Splunk installation before proceeding.
  goto EXIT_SCRIPT
)

FOR %%i IN (%SPLUNK_HOME%) DO IF NOT EXIST %%~si\NUL (
  echo Your SPLUNK_HOME %SPLUNK_HOME% isn't a directory. What gives?
  goto EXIT_SCRIPT
)

%SPLUNK_HOME%\bin\splunk.exe envvars > tmp.cmd
call tmp.cmd
del tmp.cmd

set TEST_LIB=%CD%\lib
set PYTHONPATH=%PYTHONPATH%;%CD%;%TEST_LIB%;%TEST_LIB%\web;%TEST_LIB%\pytest\plugin;%SOLN_ROOT%\common\test
set TEST_LIB=

:EXIT_SCRIPT
