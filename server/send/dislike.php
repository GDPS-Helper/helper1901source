<?php
session_start();
require_once '../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);

$type = content::liketype($_POST['type']);

if ($user->activated == 0) {
    echo content::getValue('likes', $type[0], $_POST['ide']);
    exit();
}
if (!content::checkLike($_POST['ide'], $user->userId, $type[2])) {
    content::likeSet($_POST['ide'], $_POST['type'], -1, $user->userId);
}
echo content::getValue('likes', $type[0], $_POST['ide']);