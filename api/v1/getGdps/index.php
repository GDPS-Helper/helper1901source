<?php
require_once '../../../server/api/api.php';

header('Content-Type: application/json'); 
header('Access-Control-Allow-Origin: *');

error_reporting(E_ALL);

$gdps = content::fetchById($_GET['id'], 0);

if ($gdps->ID == null)
    exit('{
    "gdpsId":0
}');

if ($gdps->freejoin == 0) {
    $joinSt = 1;
} else {
    $joinSt = 0;
}

$gdpsesecho = '';
    $gdpsesecho .= '{
    "gdpsId":'.$gdps->ID.',
    "title":"'.$gdps->title.'",
    "text":'.json_encode($gdps->description).',
    "tags":"'.str_replace('"', '\\"', $gdps->tags).'",
    "os":"'.str_replace('"', '\\"', $gdps->os).'",
    "likes":'.$gdps->likes.',
    "picture":"'.urlencode($gdps->img).'",
    "joinStatus":'.$joinSt.',
    "isWeekly":'.$gdps->status.',
    "language":"'.$gdps->language.'",
    "username":"'.$gdps->username.'",
    "userId":"'.$gdps->author.'",
    "gdpsStats":
    {
        "levels":'.$gdps->levelsCount.',
        "users":'.$gdps->usersCount.'
    }
}';

echo $gdpsesecho;