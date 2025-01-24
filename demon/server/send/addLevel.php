<?php
session_start();
require_once __DIR__.'/../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);
$list = content::getList($_POST['list']);

if ($user->activated == 0) {
    exit('-45');
}

if (content::checkOwn($user->userId, $list->gdpsId))
    $a = content::addLevel($_POST['list'], $_POST['title'], $_POST['youtube']);
else
    exit('-1');

$list = $a[0];
$title = $a[1];
$youtube = $a[2];

echo "[$list,\"$title\",\"$youtube\"]";