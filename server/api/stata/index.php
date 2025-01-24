<?php error_reporting(E_ALL);

if (isset($_GET['l'])) {
    if (!str_starts_with($_GET['l'], 'http')) {
        require_once '../api.php';
        //require_once './api/api.php';
        $gdps = content::fetchById($_GET['l'], 0);
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
            $value2 = substr($html, $start2, $end2 - $start2);
            echo $value.','.$value2;
            exit();
        }
    }

    $html = file_get_contents($_GET['l']);

    $start = strpos($html, '"level_count":'); // Находим позицию начала строки '"level_count":'
    if ($start !== false) {
        $start += strlen('"level_count":'); // Увеличиваем позицию начала на длину строки '"level_count":'
        $end = strpos($html, ',', $start); // Находим позицию запятой после двоеточия
        if ($end !== false) {
            $value = substr($html, $start, $end - $start); // Извлекаем значение между двоеточием и запятой
        }
    }
    exit ($value);
}?><form><input name=l /><input type=submit /></form>