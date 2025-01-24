<?php
session_start();
require_once './server/api/api.php';

$er = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['username']) && isset($_POST['password'])) {
        $username = $_POST['username'];
        $password = $_POST['password'];
        $user = Users::fetchByUsername($username);
        if ($user != null) {
            if ($user->verifyPassword($password) && $_POST['code'] !== 0) {
                $activated = $_POST['code'];
                Users::verifyAcc($activated);
                echo '<script>location.href = "./?profile";'.
                'localStorage.setItem("helperUser", "'.$user->token.
                '")</script>';
                exit();
            } else $er = 'Неправильный пароль!';
        }else $er = 'Такого пользователья не существует!';
    }
}

?><head>
    <title>GDPSh - Подтверждение аккаунта</title>
    <link href="./main.css" rel="stylesheet">
    <meta name=viewport content="width=device-width,initial-scale=1.0">
    <meta charset="UTF-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
</head>
<body style=background-color:rgb(12,12,3)>
<div class="frameprofile" style="width:92vw">
<h1>Для активации аккаунта войдите в него</h1>
<h3><?php echo $er?></h3>
<form method="post" action="./verify.php">
    <input type="text" placeholder="Имя пользователя" name="username" class="framelabel"><br><br>
    <input type="password" placeholder="Пароль" name="password" class="framelabel"><br><br>
    <input type="text" placeholder="Код подтверждения" name="code" class="framelabel"><br><br>
    <input type="submit" value="Подтвердить" class="loginbtn" align="center">
</form>
<a href="./">Отмена</a>
</div>
</body>