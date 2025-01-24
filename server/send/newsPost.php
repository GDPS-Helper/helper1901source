<?php
session_start();
require_once '../api/api.php';
error_reporting(E_ALL);

$user = Users::fetchByToken($_SESSION['user']);

if ($user->activated == 0) {
    echo content::getValue('likes', $type[0], $_POST['ide']);
    exit();
}
User::Webhook($WHcomms, $GDPScomm3.$_POST['gdps'].$GDPScomm2.$_POST['text']);

if(isset($_POST['text']) && isset($_POST['title'])) {
    if (content::checkItem($user->userId, $_POST['gdps'], 0) == true) {
        $text2 = htmlspecialchars($_POST['text'], ENT_QUOTES);
        $text = base64_encode($text2);
        $title = htmlspecialchars($_POST['title'], ENT_QUOTES);
        $date = time();
        echo Comments::NEWSpost($user->userId, $_POST['gdps'], $text, $date, $title);
    }
}