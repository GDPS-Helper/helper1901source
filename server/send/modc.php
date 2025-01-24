<?php
session_start();
require_once '../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);

if ($user->activated == 0) {
    $val = content::getValue('MC', 'gdpses', $_GET['id']);
    switch ($val) {
        case 0: 
            $val2 = 1;
            echo 'CCfalse';
            break;
        case 1:
            $val2 = 0;
            echo 'CCtrue';
            break;
    }
    exit();
}

if (content::checkItem($user->userId,$_GET['id'],0) == true) {
    $val = content::getValue('MC', 'gdpses', $_GET['id']);
    switch ($val) {
        case 0: 
            $val2 = 1;
            echo 'CCtrue';
            break;
        case 1:
            $val2 = 0;
            echo 'CCfalse';
            break;
    }
    content::ChangeValue('MC', 'gdpses', $val2, $_GET['id']);
} else {
    exit('-2');
}?>