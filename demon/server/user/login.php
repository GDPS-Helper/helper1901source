<?php
session_start();
require_once '../api/api.php';
$er = 0;

error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['h-captcha-response'])) {
        $data = array('secret' => $secretKey,'response' => $_POST['h-captcha-response']);
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://hcaptcha.com/siteverify");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $responseData = json_decode($response);
        if($responseData->success) {
            if (isset($_POST['username']) && isset($_POST['password'])) {
                $username = htmlspecialchars($_POST['username'], ENT_QUOTES, 'UTF-8');
                $password = htmlspecialchars($_POST['password'], ENT_QUOTES, 'UTF-8');
                $user = null;
                
                if (!filter_var($username, FILTER_VALIDATE_EMAIL))
                    $user = Users::fetchByUsername($username);
                else
                    $user = Users::fetchByEmail($username);

                if ($user != null) {
                    if ($user->verifyPassword($password)) {
                        $_SESSION['user'] = $user->token;
                    } else $er = '-1';
                } else $er = '-2';
            }
        } else {
            $er = '-3';
        }
    } else $er = '-3';
}
if ($er !== 0) 
    exit($er);

loginT($_SESSION['user'], true);