<?php
session_start();
if (!isset($_SESSION['user'])) {
    exit(-27);
}
require_once '../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);

if ($user->activated == 0) {
    exit();
}

if (isset($_POST['title']) && isset($_POST['description'])) {
    $title = htmlspecialchars($_POST['title'], ENT_QUOTES, 'UTF-8');
    $database = htmlspecialchars($_POST['database'], ENT_QUOTES, 'UTF-8');
    $link = htmlspecialchars($_POST['link'], ENT_QUOTES, 'UTF-8');
    $img = htmlspecialchars($_POST['img'], ENT_QUOTES, 'UTF-8');
    $description = htmlspecialchars($_POST['description'], ENT_QUOTES, 'UTF-8');
    $tags = json_encode($_POST['tags']);
    $os = json_encode($_POST['os']);
    $language  = htmlspecialchars($_POST['language'], ENT_QUOTES, 'UTF-8');

    $data = [0, $title, $database, $link, $img, $description, $tags, $os, $user->userId, $user->getNickname(), $language];

    if (!content::newItem($data)) {
        exit('-1');
    }
    User::Webhook($WHcontent, $GDPSadd.$title);
    loginT($_SESSION['user']);
    exit();
}