set NODE_PATH=%SPLUNK_HOME%\lib\node_modules
if exist %SPLUNK_HOME%\bin\node.exe (
    %SPLUNK_HOME%\bin\node.exe %* 
) else (
    %SPLUNK_HOME%\x86\bin\node.exe %* 
)
