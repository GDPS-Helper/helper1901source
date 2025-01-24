<?php session_start();
require_once './api/api.php';

if ( isset($_POST['token']) ) {
    loginT($_POST['token']);
    $_SESSION['user'] = $_POST['token'];
} else {
    loginT();
}