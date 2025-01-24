<?php
session_start();
require_once '../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);

if ($user->activated !== 0) {
    $text = htmlspecialchars($_POST['text'], ENT_QUOTES, 'UTF-8');

    Comments::addComment(
        $user->userId,
        $_POST['ide'],
        base64_encode($text),
        time(),
        $_POST['type']
    );

    User::Webhook($WHcomms, $GDPScomm1.$_POST['type'].' '.$_POST['ide'].$GDPScomm2.$_POST['text']);
}

echo '{';

$comms = Comments::getComments($_POST['type'], $_POST['ide'], 0);

$first = true;
foreach ($comms as $comm) {
    echo $first ? '' : ',';
    $first = false;
    $uder = Users::fetchById($comm->userId);
    $comm->COMMrender($uder);
}

echo '}';