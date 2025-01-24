<?php session_start();
require_once './api/api.php';

if (!isset($_SESSION['user']))
exit('Access denied');

$user = Users::fetchByToken($_SESSION['user']);

$uText = '; user- '.$user->userId;

if ($user->priority < 1)
exit('Access denied');

if (isset($_GET['weekly'])) {
    $kill = $conn->prepare('UPDATE `gdpses` SET `status` = 0');
    $kill->execute();

    $week = $conn->prepare('UPDATE `gdpses` SET `status` = 1 WHERE `ID` = ?');
    $week->execute([$_GET['weekly']]);
        
    User::Webhook($WHadmin, $GDPSweek.$_GET['weekly'].$uText);
    exit(2);
}

switch ($_GET['type']) {
    case 0:
        $where = 'gdpses';
        break;
    case 1:
        $where = 'texures';
        break;
    case 2:
        $where = 'guides';
        break;
}

switch ($_GET['action']) {
    case 'activate':
        $conn->query('UPDATE `'.$where.'` SET `checked` = 1 WHERE `'.$where.'`.`ID` = ' . (int)$_GET['id'])->execute();
        echo 1;
        if ($_GET['type'] == 0)
            User::Webhook($WHadmin, $GDPSunban.$_GET['id'].$uText);
        elseif ($_GET['type'] == 1)
            User::Webhook($WHadmin, $TEXTunban.$_GET['id'].$uText);
        else
            User::Webhook($WHadmin, $GUIDunban.$_GET['id'].$uText);
        break;
    case 'ban':
        $conn->query('UPDATE `'.$where.'` SET `checked` = -1 WHERE `'.$where.'`.`ID` = ' . (int)$_GET['id'])->execute();
        echo -1;
        if ($_GET['type'] == 0)
            User::Webhook($WHadmin, $GDPSban.$_GET['id'].$uText);
        elseif ($_GET['type'] == 1)
            User::Webhook($WHadmin, $TEXTban.$_GET['id'].$uText);
        else
            User::Webhook($WHadmin, $GUIDban.$_GET['id'].$uText);
        break;
    case 'delete':
        if ($user->priority < 2)
            exit('Access denied');
        $conn->query('DELETE FROM `'.$where.'` WHERE `'.$where.'`.`ID` = ' . (int)$_GET['id'])->execute();
        echo -2;
        if ($_GET['type'] == 0)
            User::Webhook($WHadmin, $GDPSdelete.$_GET['id'].$uText);
        elseif ($_GET['type'] == 1)
            User::Webhook($WHadmin, $TEXTdelete.$_GET['id'].$uText);
        else
            User::Webhook($WHadmin, $GUIDdelete.$_GET['id'].$uText);
        break;
}