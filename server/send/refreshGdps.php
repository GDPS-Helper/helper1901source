<?php
session_start();
require_once '../api/api.php';

$gdps = content::fetchById($_POST['gdps'], 0);
$user = Users::fetchByToken($_SESSION['user']);

if ($user->activated == 0) {
    echo $gdps->link;
    exit();
}

if (content::checkItem($user->userId,$gdps->ID,0) == false)
    exit('-2');

if (
    str_starts_with($gdps->link, 'https://discord.gg/') ||
    str_starts_with($gdps->link, 'https://discord.com/invite/')
    ) {
        echo content::refreshGdps($_POST['gdps'], $_POST['link']);
        $gdps = content::fetchById($_POST['gdps'], 0);
    } else {
        echo $gdps->link;
    }

$text = 'Обновлена ссылка на '.$gdps->title.' ('.$_POST['gdps'].'). содержание:
    
```'.$gdps->link.'```';
    
User::Webhook($WHcontent, $text);