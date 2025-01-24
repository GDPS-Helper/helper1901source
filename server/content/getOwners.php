<?php
session_start();
require_once '../api/api.php';

$first = true;
$user = Users::fetchByToken($_SESSION['user']);
$joins = content::fetchOwned($_GET['id'], $_GET['type']);
if ($_GET['type'] == 3)
    $gdps = content::fetchById($_GET['id'], 0);
elseif ($_GET['type'] == 4)
    $gdps = content::fetchById($_GET['id'], 1);

echo '[';
    echo '["'.$gdps->title.'"],'.
    '[';
        foreach ($joins as $join) {
            echo $first ? '' : ',';
            $first = false;
            if ($join->userId != 0) {
                $uder = Users::fetchById($join->userId);
                $username = $uder->getNickname();
            }
            else
                $username = '???';
            echo '["'.$username.'",'.$uder->userId.']';
        }
    echo ']';
echo ']';