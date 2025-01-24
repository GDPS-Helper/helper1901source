<?php
session_start();
require_once '../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);

$nickname = htmlspecialchars($_GET['name'], ENT_QUOTES, 'UTF-8');

Users::setNickname($user->userId, $_GET['name']);

$user2 = Users::fetchById($user->userId);

echo $user2->getNickname();