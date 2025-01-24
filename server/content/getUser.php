<?php
require_once '../api/api.php';

$user = Users::fetchById($_GET['id']);

echo '[';
    if ($user != null) {
        echo '"'.$user->getNickname().'",'.
        $user->userId.','.
        $user->priority.','.
        $user->activated;
    }
echo ']';