<?php
session_start();
require_once '../api/api.php';
$er = 0;

error_reporting(0);

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
                $email = htmlspecialchars($_POST['email'], ENT_QUOTES, 'UTF-8');
                $activated = rand(100000000,2147483647);
                $token = hash('sha256', Users::randomString(12).$email);

                if (!User::hasUsed($email, $username)) {
                    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        $id = Users::newUserToken($username, $password, $email, $activated, $token);
                        $_SESSION['user'] = $id;
                        Users::sendMail($_POST['email'], $activated);
                    } else {
                        $er = '-3';
                    }
                } else {
                    $er = '-1';
                }
            }
        } else {
            $er = '-2';
        }
    } else $er = '-2';
}
if ($er !== 0) 
    exit($er);

loginT($_SESSION['user'], true);