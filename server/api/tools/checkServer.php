<?php
session_start();
require_once '../api.php';
error_reporting(E_ALL);

$whLOGS = 'https://discord.com/api/webhooks/1241759147704451204/9fe5mPH7MxzbDaU5z7iHKDF8WEu5KGfbaW1mnAYmJsPxpofOuCMyxxdbZzlO3DWPBKer';

User::Webhook($whLOGS,'Проверка - старт');

$rt = $_SERVER['REQUEST_TIME'];

//$user = Users::fetchByToken($_SESSION['user']);
//if ($user->priority < 2)exit('Acces denied');

    global $conn;
    $gdpse = $conn->prepare('SELECT * FROM `gdpses` WHERE `checked` = 1 ORDER BY ID DESC');
    $gdpse->execute();
    $gdpses = $gdpse->fetchAll(PDO::FETCH_CLASS);

    foreach($gdpses as $gdps) {
        if (str_contains($gdps->database, 'gofruit')) {
            $str = $gdps->database;
            $dbase = substr($str, -4);
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'http://rugd.gofruit.space/'.$dbase.'/db/getGJSongInfo.php');
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, "m41denISmchiden=true");
            curl_setopt($ch, CURLOPT_USERAGENT, '');//'SPAMMED BY TOPPAT CLAN, net blya denisc');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            $response = curl_exec($ch);

            $mt = time() - $rt;

            if (str_contains($response, '-1')) {
                echo '<p style="color:green">'.$gdps->database . ' ' . $mt . '</p>';
                $value = $conn->prepare('UPDATE `gdpses` SET `sstatus` = 1 WHERE `ID` = :ID');
                $value->execute([':ID' => $gdps->ID]);


        $html = file_get_contents($gdps->database);
        
        $str = $gdps->database;
        $dbase = substr($str, -4);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.fruitspace.one/v2/fetch/gd/info/'.$dbase);
        curl_setopt($ch, CURLOPT_USERAGENT, 'SPAMMED BY TOPPAT CLAN, net blya denisc');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $st = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
        $start = strpos($html, '"level_count":');
        $start2 = strpos($html, '"user_count":');
        if ($start !== false) {
            $start += strlen('"level_count":');
            $end = strpos($html, ',', $start);
            $start2 += strlen('"user_count":');
            $end2 = strpos($html, ',', $start2);
                
            $value = substr($html, $start, $end - $start);
            $a = $conn->query("UPDATE `gdpses` SET `levelsCount` = $value WHERE `ID` = ".$gdps->ID);
            $value2 = substr($html, $start2, $end2 - $start2);
            $b = $conn->query("UPDATE `gdpses` SET `usersCount` = $value2 WHERE `ID` = ".$gdps->ID);
            //echo $value.','.$value2;
        }


            } elseif (str_contains($response, '')) {
                echo '<p style="color:orange">'.$gdps->database . ' ' . $mt . '</p>';
                $value = $conn->prepare('UPDATE `gdpses` SET `sstatus` = -1 WHERE `ID` = :ID');
                $value->execute([':ID' => $gdps->ID]);
            } else {
                echo '<p style="color:red">'.$gdps->database . ' ' . $mt . '</p>';
                $value = $conn->prepare('UPDATE `gdpses` SET `sstatus` = -1 WHERE `ID` = :ID');
                $value->execute([':ID' => $gdps->ID]);
            }
        } else {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $gdps->database);
            curl_setopt($ch, CURLOPT_USERAGENT, 'SPAMMED BY TOPPAT CLAN, net blya denisc');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE); // Получить HTTP-код ответа

            curl_close($ch);

            if ($httpCode == 200) {
                echo '<p style="color:green">'.$gdps->database . '</p>';
                $value = $conn->prepare('UPDATE `gdpses` SET `sstatus` = 1 WHERE `ID` = :ID');
                $value->execute([':ID' => $gdps->ID]);
            } else {
                echo '<p style="color:red">'.$gdps->database . '</p>';
                $value = $conn->prepare('UPDATE `gdpses` SET `sstatus` = -1 WHERE `ID` = :ID');
                $value->execute([':ID' => $gdps->ID]);
            }
        }
    }
echo '<audio autoplay src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3">';?>

<?php echo $rt.' '.time();

User::Webhook($whLOGS,$rt.' '.time());
