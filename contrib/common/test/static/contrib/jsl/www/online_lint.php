<!--
@template=__template__
@title=The Online Lint
-->

<?php require('_lint_front.inc') ?>

Online Lint
===========

All warnings except "option explicit" are enabled in this online edition, although certain warnings are displayed only once. For full control over which warnings are displayed, [download the JavaScript Lint software](/download.htm).

If you encounter any problems, please report them to Matthias Miller at Info&lt;at&gt;JavaScriptLint.com.


<form method="POST" action="">
<p>Paste your JavaScript, HTML, or URL into the box below:</p>
<p>
  <textarea name="script" rows="15" cols="75" style="width: 100%"><?php outputscript(); ?></textarea>
</p>
<p>
  <input type="submit" value="Lint"/>
</p>

<?php outputlint(); ?>

</form>
