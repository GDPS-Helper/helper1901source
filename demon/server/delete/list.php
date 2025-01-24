<?php
session_start();
require_once '../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);
$list = content::getList($_GET['list']);

if (content::checkOwn($user->userId,$list->gdpsId)) {
    echo content::deleteList($_GET['list']);
} else echo '-1';