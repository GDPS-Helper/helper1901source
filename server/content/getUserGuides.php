<?php
session_start();
require_once '../api/api.php';

$guides = Guides::fetchMy($_GET['id']);

$timeUser = Users::fetchById($_GET['id']);
echo '["'.$timeUser->getNickname().'",';
echo '[';

$f = true;
foreach ($guides as $guid) {
    if ($guid != null) {
        echo $f ? '' : ',';
        $f = false;
        echo $guid->renderGuideMini();
    }
}

echo ']]';