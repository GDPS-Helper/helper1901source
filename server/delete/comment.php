<?php
session_start();
require_once '../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);
$comm = Comments::fetchById($_GET['ide']);
if ($comm->userId == $user->userId || $user->priority > 0) {
    User::Webhook($WHcomms, $GDPSuncomm1.$_GET['type'].' ID '.$_GET['ide']);

    $channel = content::liketype($_GET['type']);
    Comments::deleteComm($_GET['ide'], $channel[1], $channel[2]);
    echo $_GET['ide'];
} else echo '-1';