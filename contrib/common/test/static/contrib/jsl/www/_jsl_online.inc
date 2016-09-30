<?php
    /* This script assumes the following configuration settings:
     *   +output-format __LINE__,__COL__,__ERROR_NAME__,__ERROR_PREFIX__,__ERROR_MSGENC__
	 *
     * Example Code:
     *      require_once("_jsl_online.php");
     *      $engine = new JSLEngine('.priv/jsl', '.priv/jsl.server.conf');
     *      $result = $engine->Lint($g_sScript);
     *      if ($result === true)
     *          OutputLintHTML($engine);
     *      else
     *          echo '<b>' . htmlentities($result) . '</b>';
     *
     * Suggestions or revisions can be sent to Info@JavaScriptLint.com
     */

    class JSLMessage {
        var $_line;
        var $_char;
        var $_errname;
        var $_type;
        var $_message;

        function JSLMessage($line) {
            $info = explode(",", $line);
            if (count($info) >= 4) {
                $this->_line = ($info[0]*1);
                $this->_char = is_numeric($info[1]) ? ($info[1]*1) : -1;
                $this->_errname = $info[2];
                $this->_type = $info[3];
                $this->_message = implode(",", array_slice($info, 4));
            }
        }

        function getLine()      { return $this->_line; }
        function getChar()      { return $this->_char; }
        function getErrName()   { return $this->_errname; }
        function getType()      { return $this->_type; }
        function getMessage()   { return $this->_message; }
    }

    class JSLEngine {
        var $_binarypath, $_confpath;
        var $_scriptlines, $_scriptmsgsGeneral, $_scriptmsgsSpecific;

        function JSLEngine($binarypath, $confpath) {
            $this->_binarypath = $binarypath;
            $this->_confpath = $confpath;

            $this->_scriptlines = Array();
            $this->_scriptmsgsGeneral = Array();
            $this->_scriptmsgsSpecific = Array();
        }

        /* returns error on failure; returns true on success */
        function Lint($code, $maxCodeLengthKB=128) {
            if (strlen($code) > $maxCodeLengthKB*1024)
                return 'Please limit scripts to ' . $maxCodeLengthKB . 'KB';

            if (!$this->_launchLintBinary($code, $output))
                return 'The JavaScript Lint online service is currently unavailable.';

            /* parse the script */
            $this->_scriptlines = explode("\n", str_replace("\r\n", "\n", $code));

            /* parse the output */
            $output_lines = explode("\n", str_replace("\r\n", "\n", $output));
            foreach ($output_lines as $line) {
                /* skip blank lines */
                if (strlen($line) > 0) {
                    /* store in associative array by 0-based line number */
                    $msg = new JSLMessage($line);

                    if ($msg->getChar() == -1)
                        $this->_scriptmsgsGeneral[$msg->getLine()-1][] = $msg;
                    else
                        $this->_scriptmsgsSpecific[$msg->getLine()-1][] = $msg;
                }
            }

            return true;
        }

        function getNumLines() {
            return count($this->_scriptlines);
        }

        function getLineText($i) {
            return $this->_scriptlines[$i];
        }

        function getLineMessages($i) {
            /* messages that do not point to a specific character should come first */
            if (isset($this->_scriptmsgsGeneral[$i]) &&
                isset($this->_scriptmsgsSpecific[$i])) {
                return array_merge($this->_scriptmsgsGeneral[$i], $this->_scriptmsgsSpecific[$i]);
            }

            if (isset($this->_scriptmsgsGeneral[$i]))
                return $this->_scriptmsgsGeneral[$i];

            if (isset($this->_scriptmsgsSpecific[$i]))
                return $this->_scriptmsgsSpecific[$i];

            return Array();
        }

        /* assumes path and that SERVER_SOFTWARE env is set */
        function _launchLintBinary($input, &$output) {
            $descriptorspec = array(
                0 => array("pipe", "r"),  // stdin is a pipe that the child will read from
                1 => array("pipe", "w"),  // stdout is a pipe that the child will write to
                2 => array("pipe", "w")
            );

            /* launch process */
            $path = escapeshellcmd($this->_binarypath) . ' --nologo --nosummary --stdin -context --conf ' . escapeshellarg($this->_confpath);
            $process = proc_open($path, $descriptorspec, $pipes);
            if (!is_resource($process))
                return false;

            // $pipes now looks like this:
            // 0 => writeable handle connected to child stdin
            // 1 => readable handle connected to child stdout
            // 2 => readable handle connected to child stdout
            fwrite($pipes[0], $input);
            fclose($pipes[0]);

            $output = '';
            while (!feof($pipes[1]))
               $output .= fgets($pipes[1], 1024);
            fclose($pipes[1]);
            fclose($pipes[2]);

            // It is important that you close any pipes before calling
            // proc_close in order to avoid a deadlock
            $return_value = proc_close($process);
            return true;
        }
    };

    function getEncodedText($text)
    {
        $enc = htmlentities($text);
        $enc = str_replace("\n", '<br/>', $enc);
        $enc = str_replace(' ', '&nbsp;', $enc);
        return $enc;
    }

    function expandTabs($text)
    {
        return str_replace("\t", str_pad("", 4/*tab width*/, " "), $text);
    }

    function OutputLintHTML($engine)
    {
?>
        <style type="text/css">
        div#code
        {
            color: #999;
            font-family: monospace;
        }
        div#code div
        {
            color: black;
            background-color: #EEE;
        }
        div#code div span
        {
            font-weight: bold;
            font-family: Arial;
            white-space: auto;
            font-size: .9em;
            color: #F00;
        }
        </style>
<?php

        /* output script */
        $hasWarnedSemicolon = false;
       
        $numlines = $engine->getNumLines();
        $widthOfLineNo = strlen($numlines);
        $lineNoSpacer = str_pad("", $widthOfLineNo, " ") . '  ';

        echo '<div id="code">';
        for ($lineno = 0; $lineno < $numlines; $lineno++)
        {
            /* format code */
            $text = $engine->getLineText($lineno);
            $text = expandTabs($text);
            echo getEncodedText(str_pad($lineno+1, $widthOfLineNo, " ", STR_PAD_LEFT) . '  ' . $text . "\n");

            /* show errors */
            $errors = $engine->getLineMessages($lineno);
            foreach ($errors as $Error) {
                /* only show this warning once */
                if (strcasecmp($Error->getErrName(), "missing_semicolon") == 0) {
                    if ($hasWarnedSemicolon)
                        continue;
                    $hasWarnedSemicolon = true;
                }

                echo '<div>';

                /* point to the error position, if available */
                if ($Error->getChar() > -1)
                {
                    $indent = $engine->getLineText($lineno);
                    $indent = substr($indent, 0, max(0, $Error->getChar()-1));
                    $indent = expandTabs($indent);
                    $indent = str_pad("", strlen($indent), "=");
                    echo getEncodedText($lineNoSpacer . $indent . "^\n");
                }

                /* output error type/message */
                echo getEncodedText($lineNoSpacer) . '<span>';
                if ($Error->getType())
                    echo getEncodedText($Error->getType() . ': ');
                echo getEncodedText($Error->getMessage());
                echo '</span>' . getEncodedText("\n");

                echo '</div>';
            }

            if ($lineno % 1000 == 0)
                flush();
        }
        echo '</div>';
    }
?>
