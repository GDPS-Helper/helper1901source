<?php session_start();
require_once './api/api.php';

if (!isset($_SESSION['user']))
exit('Access denied');

$user = Users::fetchByToken($_SESSION['user']);

if ($user->priority == 0)
exit('Access denied');

error_reporting(0);

$f = false;

echo '[';

echo '[';
$gdpses = content::fetchAlls(0);
foreach ($gdpses as $gdps) {
    echo $f ? ',' : '';
    $f = true;;
        $text = $gdps->description;
//"g'.$gdps->ID.'"
        echo '
['.
        $gdps->ID.',"'.
        $gdps->title.'","'.
        str_replace('"', '\\"', $gdps->tags).'","'.
        str_replace('"', '\\"', $gdps->os).'","'.
        urlencode($gdps->database).'","'.
        urlencode($gdps->link).'",'.
        $gdps->checked.','.
        $gdps->author
        .']';
}
echo '],[';

$f = false;

foreach (content::fetchAlls(1) as $gdps) {
    echo $f ? ',' : '';
    $f = true;
        $text = $gdps->description;
        echo '
['.
        $gdps->ID.',"'.
        $gdps->title.'","'.
        str_replace('"', '\\"', $gdps->tags).'","'.
        str_replace('"', '\\"', $gdps->os).'","'.
        urlencode($gdps->database).'","'.
        urlencode($gdps->link).'",'.
        $gdps->checked.','.
        $gdps->author
        .']';
}

echo '],[';

$f = false;

foreach (content::fetchAlls(2) as $gdps) {
    echo $f ? ',' : '';
    $f = true;
        $text = $gdps->description;
        echo '
['.
        $gdps->ID.',"'.
        $gdps->title.'","'.
        urlencode($gdps->img).'",'.
        'null'.','.
        'null'.','.
        'null'.','.
        $gdps->checked.','.
        $gdps->userId
        .']';

        $gdps->ID.',"'.
        $gdps->title.'","'.
        urlencode($gdps->img).'",'.
        $gdps->checked.','.
        $gdps->userId
        .']';
}

echo ']]';