<?php
session_start();
require_once '../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);

$first = true;

$joins = content::fetchOwned($_GET['id'], 2);

$gdps = content::fetchById($_GET['id'], 0);

echo '[';

    echo '["'.$gdps->title.'","Microwave"]';

    foreach ($joins as $join) {
        echo ',';
        $first = false;
        if ($join->userId != 0) {
            $uder = Users::fetchById($join->userId);
            $username = $uder->getNickname();
        }
        else
            $username = '???';
        echo '["'.$username.'",'.$join->joinDate.',"'.$join->joinData.'"]';
    }

echo ']';