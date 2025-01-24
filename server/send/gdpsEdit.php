<?php
session_start();
require_once '../api/api.php';

$gdps = content::fetchById($_GET['id'], 0);
$user = Users::fetchByToken($_SESSION['user']);

if (content::checkItem($user->userId,$_GET['id'],0) == false)
    exit('-2'); //нет прав

if (isset($_POST['title']) && isset($_POST['description'])) {
    if ($user->activated == 0) {
        echo $_GET['id'];
        exit('-45');
    }

    $title = htmlspecialchars($_POST['title'], ENT_QUOTES, 'UTF-8');
    $database = htmlspecialchars($_POST['database'], ENT_QUOTES, 'UTF-8');
    $link = htmlspecialchars($_POST['link'], ENT_QUOTES, 'UTF-8');
    $img = htmlspecialchars($_POST['img'], ENT_QUOTES, 'UTF-8');
    $description = htmlspecialchars($_POST['description'], ENT_QUOTES, 'UTF-8');
    $tags = $_POST['tags'];
    $os = $_POST['os'];
    $gdpsId = $_GET['id'];
    $language  = htmlspecialchars($_POST['language'], ENT_QUOTES, 'UTF-8');
    
    $data = [0, $title, $database, $link, $img, $description, json_encode($tags), json_encode($os), $language, $gdpsId];

    if (!content::editItem($data)) {
        exit('-1');
    }
    User::Webhook($WHcontent, $GDPSedit.$gdpsId);
    loginT($_SESSION['user']);
    exit();
}

$text = json_encode($gdps->description);
echo '["'.
        $gdps->title.'",'.
        $text.',"'.
        $gdps->database.'","'.
        $gdps->img.'","'.
        $gdps->link.'","'.
        str_replace('"', '\\"', $gdps->tags).'","'.
        str_replace('"', '\\"', $gdps->os).'","'.
        $gdps->language.'"'?>]