<?php
$id = intval($_GET['id'], 10);
if ($id)
        Header('Location: /news/' . str_pad(strval($id), 3, '0', STR_PAD_LEFT));
else
        Header('Location: /news/');
?>
