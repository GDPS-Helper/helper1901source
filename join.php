<?php
session_start();
require_once './server/api/api.php';

if (isset($_SESSION['user'])) $user = Users::fetchByToken($_SESSION['user']);

$gdps = content::fetchById($_GET['id'], 0);

$findKey = $_SESSION['findKey'] ?? 'id='.$_GET['id'];
if ($_GET['m'] == 1)
    $findKey = 'mainPage';

if ($gdps->freejoin === 0) {
    header('Location: '.$gdps->link);
    isset($user) ? Users::logJoin($_GET['id'], $user->userId, $findKey)
    : Users::logJoin($_GET['id'], 0, $findKey);
    exit();
} else {
    isset($user) ? Users::logJoin($_GET['id'], $user->userId, $findKey)
    : null;
}

if (isset($_POST['username']) && isset($_POST['password'])) {
    $user = Users::fetchByUsername($_POST['username']);
    if ($user != null) {
        if ($user->verifyPassword($_POST['password'])) {
            header('Location: '.$gdps->link);
            Users::logJoin($_GET['id'], $user->userId, $findKey);
            exit();
        }
    }
}?><!DOCTYPE html>
<head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
    <link href="./styles/buttons.css" rel="stylesheet">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6907103686300152" crossorigin="anonymous"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GDPSh - Вход на сервер</title>
    <link href="./main.css" rel="stylesheet">
    <style>body{margin:200px 30%;}</style>
</head>
<div class="framelogin" style="width:30%;min-width:320px">
    <h1>Для входа на этот гдпс нужно войти в аккаунт</h1>
    <form method="post">
        <input type="text" placeholder="Имя пользователя" name="username" class="framelabel" maxlength="32" minlength="3" required><br><br>
        <input type="password" placeholder="Пароль" name="password" class="framelabel" required><br><br>
        <input type="submit" id="buttonlogin" value="Подтвердить"><br>
    </form>
    для входа в аккаунт вам надо выполнить это не здесь
    <br><br><a href="./">Отмена</a>
</div>