<?php
session_start();
require_once __DIR__.'/../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);
$level = content::getLevel($_POST['levelid']);
$list = content::getList($level->listId);

if ($user->activated == 0) {
    exit('-45');
}

if (content::checkOwn($user->userId, $list->gdpsId))
    $a = content::addProgress($_POST['levelid'], $_POST['authorid'], $_POST['authorname'], $_POST['progress']);
else
    exit('-1');

$ID = $a[0];
$levelid = $a[1];
$gdUserId = $a[2];
$gdNickname = $a[3];
$progress = $a[4];

echo "[$ID,$levelid,\"$gdUserId\",\"$gdNickname\", \"$progress%\"]";