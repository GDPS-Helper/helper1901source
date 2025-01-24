<?php
session_start();
require_once '../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);

if (isset($_POST['password'])) {
    if ($user->verifyPassword($_POST['password'])) {
        echo "[\"$user->username\",\"$user->mail\"]";
    } else {
        echo "-1";
    }
}