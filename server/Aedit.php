<?php session_start();
require_once './api/api.php';

if (!isset($_SESSION['user']))
exit('Access denied');

$user = Users::fetchByToken($_SESSION['user']);

$uText = '; user- '.$user->userId;

if ($user->priority < 1)
exit('Access denied');

switch ($_GET['type']) {
    case 0:
        $where = 'gdpses';
        break;
    case 1:
        $where = 'texures';
        break;
}

$var = $conn->prepare('UPDATE `'.$where.'` SET `tags` = ?, `os` = ? WHERE `ID` = ?');
$var->execute([$_GET['tags'], $_GET['os'], $_GET['id']]);

User::Webhook($WHadmin, $where.' = '.$_GET['id'].$uText.'

TAGS = '.$_GET['tags'].'

OS = '.$_GET['os']);
echo $_GET['tags'].'<br>'.$_GET['os'];