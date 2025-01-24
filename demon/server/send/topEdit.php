<?php
session_start();
require_once '../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);
$list = content::getList($_GET['list']);

if ($user->activated == 0) {
    exit('-45');
}

if (content::checkOwn($user->userId,$list->gdpsId)) {
    echo content::editTop($_GET['demon'], $_GET['topvalue']);
} else echo '-1';