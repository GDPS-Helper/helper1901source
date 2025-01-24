<?php
session_start();
require_once '../api/api.php';
error_reporting(E_ALL);


$user = Users::fetchByToken($_SESSION['user']);

$g = content::checkItem($user->userId,$_GET['gdps'],$_GET['type']);

if ($g == 2) {
    content::deleteOwner($_GET['gdps'], $_GET['id'], $_GET['type']);
    echo '['.$g.']';
} else {
    echo '-2';
    exit();
}?>