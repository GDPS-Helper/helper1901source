<?php
session_start();
require_once __DIR__.'/../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);

if ($user->activated == 0) {
    exit('-45');
}

if (content::checkOwn($user->userId, $_POST['gdps']))
    echo content::createList($_POST['gdps'], $_POST['title']);
else
    exit('-1');