<?php
session_start();
require_once '../api.php';

$user = Users::fetchByToken($_SESSION['user']);
if ($user !== null) {
    if ($user->priority == 3) {
        if (isset($_POST['user']) && isset($_POST['role'])) {
            if (!Users::setRoleToUser((int)$_POST['user'], (int)$_POST['role'])) {
                exit('Something went wrong...');
            }echo '<script defer>location.href = "userMaster.php";</script>';
            User::Webhook($WHadmin, $USERrole1.$_POST['user'].$USERrole2.$_POST['role']);
        }else{echo'Error!';}
    }else{echo'Acces denied';}
}else{echo'Acces denied';}?>