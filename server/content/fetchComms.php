<?php
require_once '../api/api.php';

echo '{';

$comms = Comments::getComments($_GET['type'], $_GET['id'], $_GET['page']);

$first = true;
foreach ($comms as $comm) {
    echo $first ? '' : ',';
    $first = false;
    $uder = Users::fetchById($comm->userId);
    $comm->COMMrender($uder);
}

echo '}';