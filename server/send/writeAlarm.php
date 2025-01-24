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

if (isset($_POST['title'])) {
    $title = $_POST['title'];
    $text = $_POST['text'];
    $userId = $_POST['user'];
    $date = time();
    $adminName = $user->getNickname();
    $adminId = $user->userId;

    Alarms::writeAlarm($title, $text, $userId, $date, $adminName, $adminId);
    echo 1;
}