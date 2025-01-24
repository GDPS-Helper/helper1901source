<?php
session_start();
require_once '../api/api.php';

if (isset($_SESSION['user'])) {
    $user = Users::fetchByToken($_SESSION['user']);
} else {
    exit(-1);
}

$alarms = Alarms::getAlarmsList($user->userId, $_GET['page']);

echo '[';
    $f = true;
    foreach ($alarms as $a) {
        if ($a->public == 1) {
            echo $f ? '' : ',';
            $f = false;
            echo '['.$a->ID.',"'.$a->title.'"]';
        }
    }
echo ']';