<?php
require_once'../api.php';
error_reporting(E_ALL);

if ($_GET['start'] == 'yes') {

$whLOGS = 'https://discord.com/api/webhooks/1241759147704451204/9fe5mPH7MxzbDaU5z7iHKDF8WEu5KGfbaW1mnAYmJsPxpofOuCMyxxdbZzlO3DWPBKer';

User::Webhook($whLOGS,'Проверка статы - старт');

require_once'simple_html_dom.php';

$rt = $_SERVER['REQUEST_TIME'];

$drop = 0;

if (isset($_GET['drop'])) $drop = 1;

$gdpses = content::fetchAllVerified(0);
$v = 0;
$d = 0;
$t = 0;

//GDPSstat::insertStat($gdps->gdpsId, time(), $levels $accs);

echo 'Die link:<table><tr><th></th><th></th><th></th></tr>';

foreach ($gdpses as $gdps) {
    if (!str_contains($gdps->database, '/tools') &&
        !str_contains($gdps->database, 'fruit') &&
        !str_contains($gdps->database, 'space'))
    {
        echo '<tr><td>'.$gdps->title.'</td><td>'.$gdps->database.'</td><td>'.$gdps->link.'</td></tr>';
    }
}

echo '</table>';

echo '<h1>Cvolton</h1><table>'.
    '<tr>'.
    '<th>title'.
    '</th>'.
    '<th>link'.
    '</th>'.
    '<th>lvls'.
    '</th>'.
    '<th>accs'.
    '</th>'.
    '</tr>';

foreach ($gdpses as $gdps) {
    if (str_contains($gdps->database, '/tools')) {
        if (!str_contains($gdps->database, '.php')) {
            $html = file_get_contents($gdps->database.'/stats/stats.php');
        } else {
            $html = file_get_contents($gdps->database);
        }

        $mt = time() - $rt;

        if ($html == true) {
            echo '<tr><td>'.$gdps->title.'</td><td>'.$gdps->database.'/stats/stats.php</td>';
            
            $dom = new simple_html_dom();
            $dom->load($html);
            $table = $dom->find('table', 0);
            $headers = $table->find('tr', 0);
            $totalIndex = -1;
            foreach ($headers->find('th') as $index => $header) {
                if ($header->plaintext == 'Total' || $header->plaintext ==  'Количество') {
                    $totalIndex = $index;
                    break;
                }
            }
            $dataRow = $table->find('tr', 1);
            $totalCell = $dataRow->find('td', $totalIndex);
            $totalValue = $totalCell->plaintext;

            echo '<td>'.$totalValue.' '.$mt.'</td><td>_</td></tr>';
            $drop ? null : content::insertStat($gdps->ID, time(), $totalValue, 0);
            
            $v = $v + 1;
            $t = $t + 1;
        } else {
            echo '<tr><td>'.$gdps->title.' '.$mt.'</td><td>'.$gdps->database.'</td>';
            echo '<td>_</td><td>_</td></tr>';
            $d = $d + 1;
            $t = $t + 1;
        }
    }
}

echo '<tr><td>Cvolton tools</td><td>'.$v.'</td><td>'.$d.'</td></tr></table>';

$v = 0;
$d = 0;
echo '<table>'.
    '<tr>'.
    '<th>title'.
    '</th>'.
    '<th>link'.
    '</th>'.
    '<th>lvls'.
    '</th>'.
    '<th>accs'.
    '</th>'.
    '</tr>';

foreach ($gdpses as $gdps) {
    if (str_contains($gdps->database, 'fruit') || str_contains($gdps->database, 'space')) {
        $html = file_get_contents($gdps->database);
        
        $str = $gdps->database;
        $dbase = substr($str, -4);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.fruitspace.one/v2/fetch/gd/info/'.$dbase);
        curl_setopt($ch, CURLOPT_USERAGENT, 'SPAMMED BY TOPPAT CLAN, net blya denisc');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $st = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        $mt = time() - $rt;
        
        if ($st == 200) {
            echo '<tr><td>'.$gdps->title.' '.$mt.'</td><td>'.$gdps->database.'</td>';
            
            $start = strpos($html, '"level_count":');
            $start2 = strpos($html, '"user_count":');
            if ($start !== false) {
                $start += strlen('"level_count":');
                $end = strpos($html, ',', $start);
                
                $v = $v + 1;
                $t = $t + 1;
                
                if ($end !== false) {
                    $value = substr($html, $start, $end - $start);
                    //$value2 = substr($html, $start2, $end2 - $start2);
                    echo '<td>'.$value.'</td><td>_</td></tr>';
                    $drop ? null : content::insertStat($gdps->ID, time(), $value, 0);
                } else {
                    echo '<td>_</td><td>_</td></tr>';
                }
            }
        } else {
            echo '<tr><td>'.$gdps->title.' '.$mt.'</td><td>'.$gdps->database.'</td>';
            echo '<td>_</td><td>_</td></tr>';
            $d = $d + 1;
            $t = $t + 1;
        }
    }
}

echo '<tr><td>Fs</td><td>'.$v.'</td><td>'.$d.'</td></tr>';
echo '<tr><td></td><td>Fetched: '.$t.'</td><td>Total: '.count($gdpses).'</td></tr></table>';

$dom->clear();
unset($dom);
unset($html);
User::Webhook($whLOGS,$rt.' '.time());
} else {/////////////////////////////////////////////////////////////////////////////////////////////////

$gdpses = content::fetchAllVerified(0);
$v = 0;
$d = 0;
$t = 0;

echo 'Die link:<table><tr><th></th><th></th><th></th></tr>';

foreach ($gdpses as $gdps) {
    if (!str_contains($gdps->database, '/tools') &&
        !str_contains($gdps->database, 'fruit') &&
        !str_contains($gdps->database, 'space'))
    {
        echo '<tr><td>'.$gdps->title.'</td><td>'.$gdps->database.'</td><td>'.$gdps->link.'</td></tr>';
    }
}

echo '</table>';

echo '<h1>Cvolton</h1><table>'.
    '<tr>'.
    '<th>title'.
    '</th>'.
    '<th>link'.
    '</th>'.
    '<th>lvls'.
    '</th>'.
    '<th>accs'.
    '</th>'.
    '</tr>';

foreach ($gdpses as $gdps) {
    if (str_contains($gdps->database, '/tools')) {
        echo '<tr><td>'.$gdps->title.'</td><td>'.$gdps->database.'</td>';
        echo '<td>_</td><td>_</td></tr>';
    }
}

echo '<tr><td>Cvolton tools</td><td>'.$v.'</td><td>'.$d.'</td></tr></table>';

$v = 0;
$d = 0;
echo '<table>'.
    '<tr>'.
    '<th>title'.
    '</th>'.
    '<th>link'.
    '</th>'.
    '<th>lvls'.
    '</th>'.
    '<th>accs'.
    '</th>'.
    '</tr>';

foreach ($gdpses as $gdps) {
    if (str_contains($gdps->database, 'fruit') || str_contains($gdps->database, 'space')) {
        echo '<tr><td>'.$gdps->title.'</td><td>'.$gdps->database.'</td>';
        echo '<td>_</td><td>_</td></tr>';
    }
}

echo '<tr><td>Fs</td><td>'.$v.'</td><td>'.$d.'</td></tr>';
echo '<tr><td></td><td>Fetched: '.$t.'</td><td>Total: '.count($gdpses).'</td></tr></table>';

}