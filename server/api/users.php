<?php
require_once __DIR__.'/connection.php';

//!!LEGACY
abstract class Roles {
    const None = 0;
    const Manager = 1;
    const Admin = 2;
    const Owner = 3;

    public static function toString(int $role): string {
        return match ($role) {
            self::None => 'Нет',
            self::Manager => 'Менеджер',
            self::Admin => 'Админ',
            self::Owner => 'Фюрер'
        };
    }
}

define('ROLE_DEFAULT', Roles::None);

class User {
    public readonly int $userId;
    public string $username;
    public string $nickname;
    public string $password;
    public string $token;
    public int $priority;
    public int $activated;
    public string $mail;
    public int $code;


    public function verifyPassword(string $password) {
        return password_verify($password, $this->password);
    }

    function getNickname() {
        if ($this->nickname == '')
            return $this->username;
        return $this->nickname;
    }
    
    public static function checkActivate($userId): int {
        global $conn;
        $gdpses = $conn->prepare('SELECT * FROM `users` WHERE userId = ? AND activated = 1');
        $gdpses->execute([$userId]);
        if ($gdpses->fetch() != 0) return 1;
        else return 0;
    }
    
    public static function hasUsed(string $email, string $username) {
        global $conn;
        $user = $conn->prepare('SELECT * FROM `users` WHERE `mail` = ? OR `username` = ? LIMIT 1');
        $user->execute([$email, $username ]);
        return $user->fetchColumn();
    }
    
    public static function Webhook(string $webhookUrl, string $msg) {
        $message = 'BUILD_'.HELPER_VER.' '.$msg;
        $data = array('content' => $message);
        $jsonData = json_encode($data);
        $ch = curl_init($webhookUrl);

        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

        curl_exec($ch);
        curl_close($ch);
    }
}

class Users {
    static function fetchAll(): array {
        global $conn;
        $req = $conn->prepare('SELECT * FROM `users`');
        $req->execute();
        return $req->fetchAll(PDO::FETCH_CLASS, User::class);
    }

    static function fetchById(int $userId): ?User {
        global $conn;
        $req = $conn->prepare('SELECT * FROM `users` WHERE `userId` = ?');
        $req->execute([$userId]);
        return $req->fetchAll(PDO::FETCH_CLASS, User::class)[0];
    }
    
    static function fetchByUsername(string $username): ?User {
        global $conn;
        $req = $conn->prepare('SELECT * FROM `users` WHERE `username` = ?');
        $req->execute([$username]);
        return $req->fetchAll(PDO::FETCH_CLASS, User::class)[0];
    }
    
    static function fetchByEmail(string $email): ?User {
        global $conn;
        $req = $conn->prepare('SELECT * FROM `users` WHERE `mail` = ?');
        $req->execute([$email]);
        return $req->fetchAll(PDO::FETCH_CLASS, User::class)[0];
    }
    
    static function fetchByToken(string $token): ?User {
        global $conn;
        $req = $conn->prepare('SELECT * FROM `users` WHERE `token` = ?');
        $req->execute([$token]);
        return $req->fetchAll(PDO::FETCH_CLASS, User::class)[0];
    }

    public static function logJoin(int $gdpsId, int $userId, string $findKey) {
        global $conn;
        $conn->prepare('INSERT INTO `joinlog`(`gdpsId`, `userId`, `joinData`, `joinDate`) VALUES (?, ?, ?, ?)')
            ->execute([$gdpsId, $userId, $findKey, time()]);
    }

    static function setRoleToUser(int $userId, int $role): bool {
        global $conn;
        return $conn
            ->prepare('UPDATE users SET priority = ? WHERE userId = ?')
            ->execute([$role, $userId]);
    }

    static function setNickname(int $userId, string $name): bool {
        global $conn;
        $conn
            ->prepare('UPDATE gdpses SET username = ? WHERE author = ?')
            ->execute([$name, $userId]);
        $conn
            ->prepare('UPDATE texures SET username = ? WHERE author = ?')
            ->execute([$name, $userId]);
        return $conn
            ->prepare('UPDATE users SET nickname = ? WHERE userId = ?')
            ->execute([$name, $userId]);
    }
    
    static function randomString($length) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[random_int(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    static function refreshPassword(string $password, string $username, int $userId) {
        $token = hash('sha256', Users::randomString(16).$username);
        global $conn;
        if (!$conn
            ->prepare('UPDATE users SET code = 0, activated = 1, password = ?, token = ? WHERE userId = ?')
            ->execute([
                password_hash($password, PASSWORD_DEFAULT),
                $token,
                $userId
            ]))
            return null;
        return $token;
    }

    static function newUserToken(string $username, string $password, string $email, int $activated, string $token, $priority = ROLE_DEFAULT): ?string {
        global $conn;
        if (!$conn
            ->prepare('INSERT INTO users (username, password, mail, code, token, priority) VALUES (?, ?, ?, ?, ?, ?)')
            ->execute([
                $username,
                password_hash($password, PASSWORD_DEFAULT),
                $email,
                $activated,
                $token,
                $priority
            ]))
            return null;
        return $token;
    }

    public static function dropPassword(int $userId, string $email, string $password) {
        global $conn;
        $code = rand(100000000,2147483647);
        $conn->prepare('UPDATE users SET activated = 0, code = ?, password = ? WHERE userId = ?')
            ->execute([$code, password_hash($password, PASSWORD_DEFAULT), $userId, ]);

            $verificationLink = 'https://gdpshelper.xyz/refresh.php';
            $subject = 'Изменение пароля GDPS Helper';
            $body = 'Вы можете изменить пароль на GDPS Helper по ссылке '.$verificationLink.'
После введите следующий код в соответствующую строку:
'.$code.'
Если вы не запрашивали смену пароля то проигнорируйте это сообщение';
        mail($email, $subject, $body);
    }
    
    public static function sendMail(string $email, int $activated) {
        $verificationLink = 'https://gdpshelper.xyz/verify.php';
    
    $subject = 'Подтверждение аккаунта GDPS Helper';
    $body = 'Ваш адрес электронной почты был указан при регистрации на GDPS Helper
    
Нажмите на ссылку для подтверждения вашего аккаунта: '.$verificationLink.'
После введите следующий код в соответствующую строку:
    '.$activated.'
Если вы не регистрировались на сайте, то проигнорируйте это сообщение';
    mail($email, $subject, $body);
        }
    
    public static function verifyAcc(string $activated) {
        global $conn;
        $conn
            ->prepare('UPDATE `users` SET `activated` = 1 WHERE `code` = ?')
            ->execute([$activated]);
        return $conn
            ->prepare('UPDATE `users` SET `code` = 0 WHERE `code` = ?')
            ->execute([$activated]);
    }
}