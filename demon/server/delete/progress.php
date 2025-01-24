<?php
session_start();
require_once '../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);
$level = content::getLevel($_GET['level']);
$list = content::getList($level->listId);

if (content::checkOwn($user->userId,$list->gdpsId)) {
    echo content::deleteProgress($_GET['id']);
} else echo '-1';