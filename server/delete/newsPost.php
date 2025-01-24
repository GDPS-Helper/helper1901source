<?php
session_start();
require_once '../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);
$news = content::fetchById($_GET['ide'], 2);
if ($news->userId == $user->userId || content::checkItem($user->userId,$news->gdpsId,0) == 2  || $user->priority > 0) {
    User::Webhook($WHcomms, $GDPSuncomm2.' ID '.$_GET['ide']);

    Comments::deleteNews($_GET['ide']);
    echo $_GET['ide'];

    $comms = Comments::getAllComments(2, $_GET['ide']);

    foreach ($comms as $comm) {
        $commChannel = content::liketype(5);
        Comments::deleteComm($comm->ID, $commChannel[1], $commChannel[2]);
    }
} else echo '-1';