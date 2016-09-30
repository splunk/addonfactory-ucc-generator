<?php
    // Get the posted script/URL
    if (isset($_POST['script']))
        $_Script = stripslashes($_POST['script']);
    else
        $_Script = "";

    function _DownloadURL($url) {
        $cUrl = curl_init();
        curl_setopt($cUrl, CURLOPT_URL, $url);
        curl_setopt($cUrl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($cUrl, CURLOPT_TIMEOUT, 5);
        $PageContent = curl_exec($cUrl);
        if (curl_errno($cUrl))
            return false;
        return $PageContent;
    }

    function _OutputError($error) {
        echo '<p style="color: #F00; font-weight: bold">' . htmlentities($error) . '</p>';
    }

    function _isURL($url) {
        if (strstr($url, "\n") !== FALSE)
            return false;
        if (strstr($url, "\r\n") !== FALSE)
            return false;
        if (!preg_match('!^((ht|f)tps?\:\/\/)?([\w\-]+\.)+([\w]{2,5})((/(.*))?)$!i', $url))
            return false;
        return true;
    }

    function outputscript() {
        global $_Script;
        echo htmlentities($_Script);
    }

    function outputlint() {
        global $_Script;
        if (strlen($_Script) > 0) {
            // set up the new engine
            require_once("_jsl_online.inc");
            $engine = new JSLEngine('../jsl-cgi-bin/jsl', '../jsl-cgi-bin/jsl.server.conf');

            if (_isURL(trim($_Script))) {
                // Download and lint the URL
                $code = _DownloadURL(trim($_Script));
                if ($code !== false)
                    $result = $engine->Lint($code);
                else
                    $result = "The URL could not be downloaded: " . $_Script;
            }
            else
                $result = $engine->Lint($_Script);

            // output the results
            if ($result === true)
                OutputLintHTML($engine);
            else
                _OutputError($result);
        }
    }
?>

