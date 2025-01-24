<?php
session_start();
require_once '../api/api.php';

error_reporting(0);

$user = Users::fetchByToken($_SESSION['user']);



if (content::checkItem($user->userId, $_GET['gdps'], $_GET['type']) == 2) {
    $user2 = Users::fetchByUsername($_GET['user']);

    if ($user2->userId == null)
        $user2 = Users::fetchById($_GET['user']);

    content::addOwner($_GET['gdps'], $user2->userId, $_GET['type']);
    
    echo '["'.$user2->getNickname().'",'.$user2->userId.']';
} else {
    exit("-2");
}?>