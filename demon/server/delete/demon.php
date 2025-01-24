<?php
session_start();
require_once '../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);
$list = content::getList($_GET['list']);

if (content::checkOwn($user->userId,$list->gdpsId)) {
    echo content::deleteLevel($_GET['id']);
} else echo '-1';