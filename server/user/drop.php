<?php
session_start();
require_once '../api/api.php';

if($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $user = Users::fetchByUsername($username);
    $userId = $user->userId;
    if($user->mail == $email){
        $userId = $user->userId;
        Users::dropPassword($userId, $email, $password);
        echo '1';
        exit();
    }
    echo '-1';
    exit();
}?>