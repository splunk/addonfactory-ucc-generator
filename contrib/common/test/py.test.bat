@echo off

:: Get bamboo home
if [%BAMBOO_HOME%]==[] (
  SET BAMBOO_HOME=c:\bamboo
  SETLOCAL enabledelayedexpansion
  echo BAMBOO_HOME was set to %BAMBOO_HOME%
  ENDLOCAL
) ELSE (
  echo BAMBOO_HOME already set to %BAMBOO_HOME%
)

%SPLUNK_BOOT%\bin\splunk cmd python %SPLUNK_BOOT%\bin\py.test-script.py --junitxml=test-results.xml %1