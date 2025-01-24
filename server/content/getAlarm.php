<?php
session_start();
require_once '../api/api.php';

if (isset($_SESSION['user'])) {
    $user = Users::fetchByToken($_SESSION['user']);
} else {
    exit(-1);
}

$alarm = Alarms::getFullAlarm($_GET['id']);


if ($user->userId == $alarm->userId) {
    if ($alarm->public == 1)
        echo '{'.
                '"ID":'.$alarm->ID.','.
                '"title":"'.$alarm->title.'",'.
                '"text":"'.$alarm->text.'",'.
                '"date":'.$alarm->date.','.
                '"adminName":"'.$alarm->adminName.'",'.
                '"adminId":'.$alarm->adminId.
            '}';
} else {
    echo '{}';
}