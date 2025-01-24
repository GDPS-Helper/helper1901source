<?php
session_start();
require_once '../api/api.php';

if (isset($_SESSION['user'])) {
    $user = Users::fetchByToken($_SESSION['user']);
} else {
    exit('-1');
}

if ($user->priority == 0)
    exit('-1');

if (Alarms::removeAlarm($user->userId, $_GET['id'])) 
    echo '1';
else
    echo '-2';