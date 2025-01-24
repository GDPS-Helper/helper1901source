<?php
session_start();
require_once '../api/api.php';

$gdpses = content::getMyContent($_GET['id'], $_GET['type']);

$timeUser = Users::fetchById($_GET['id']);
echo '["'.$timeUser->getNickname().'",';
echo '{';

$f = true; 
foreach ($gdpses[0] as $gdps2) {
    $gdps = content::fetchById($gdps2->ID, $_GET['type']);
    if ($gdps->ID != null) {
        echo $f ? '' : ',';
        $f = false;
        $gdps->GDPSrender();
    }
}

echo '}]';