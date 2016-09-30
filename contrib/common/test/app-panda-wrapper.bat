@echo off
SET MY_ZERO=app-panda-wrapper.bat

echo %MY_ZERO% We were called with: %*

SET log=echo

echo %MY_ZERO% Updating ourselves.
SET OLD_P4CLIENT=%P4CLIENT%
SET OLD_P4USER=%P4USER%
SET P4CLIENT=WINDOWS-panda
SET P4USER=bamboo
SET P4PASWD=symantec

FOR /F "tokens=*" %%A in ( 'C:\progra~1\perforce\p4.exe counter clean_panda' ) DO ( SET CLEAN_PANDA=%%A )
echo %MY_ZERO% Syncing panda to %CLEAN_PANDA%
"C:\progra~1\perforce\p4.exe" sync -f @%CLEAN_PANDA%
SET P4CLIENT=%OLD_P4CLIENT%
SET P4USER=%OLD_P4USER%
echo %MY_ZERO% Done updating.

if [%SPLUNK_HOME%]==[] SET SPLUNK_HOME=C:\progra~1\splunk
echo %MY_ZERO% SPLUNK_HOME=%SPLUNK_HOME%

if [%BAMBOO_WORKING_DIR%]==[] SET BAMBOO_WORKING_DIR=C:\bamboo
echo %MY_ZERO% BAMBOO_WORKING_DIR=%BAMBOO_WORKING_DIR%

if [%BAMBOO_WRAPPER_DIR%]==[] SET BAMBOO_WRAPPER_DIR=C:\bamboo\panda
echo %MY_ZERO% BAMBOO_WRAPPER_DIR=%BAMBOO_WRAPPER_DIR%

if [%SOLN_ROOT%]==[] SET SOLN_ROOT=C:\bamboo\solutions
echo %MY_ZERO% SOLN_ROOT=%SOLN_ROOT%

if [%P4USER%]==[] SET P4USER=bamboo
echo %MY_ZERO% P4USER=%P4USER%

if [%P4CLIENT%]==[] SET P4CLIENT=bamboo-panda-win-client
echo %MY_ZERO% P4CLIENT=%P4CLIENT%

echo %MY_ZERO% Calling: %SPLUNK_HOME%\bin\splunk.exe cmd python %SOLN_ROOT%\common\app-panda\app-panda-test.py %*
%SPLUNK_HOME%\bin\splunk.exe cmd python %SOLN_ROOT%\common\app-panda\app-panda-test.py %*
