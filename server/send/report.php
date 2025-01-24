<?php
session_start();
require_once '../api/api.php';

$gdps = content::fetchById($_POST['gdps'], 0);

$text = 'Жалоба на гдпс - '.$gdps->title.' ('.$_POST['gdps'].'). её текст:

```'.$_POST['text'].'```';

User::Webhook($WHreport, $text);