<?php
require_once '../../../server/api/api.php';

header('Content-Type: application/json'); 
header('Access-Control-Allow-Origin: *');

error_reporting(E_ALL);

$gdps = content::fetchById($_GET['id'], 1);

if ($gdps->ID == null)
    exit('{
    "gdpsId":0
}');

$gdpsesecho = '';
    $gdpsesecho .= '{
    "gdpsId":'.$gdps->ID.',
    "title":"'.$gdps->title.'",
    "text":'.json_encode($gdps->description).',
    "tags":"'.str_replace('"', '\\"', $gdps->tags).'",
    "os":"'.str_replace('"', '\\"', $gdps->os).'",
    "likes":'.$gdps->likes.',
    "picture":"'.urlencode($gdps->img).'",
    "Android":"'.urlencode($gdps->database).'",
    "PC":"'.urlencode($gdps->link).'",
    "username":"'.$gdps->username.'",
    "userId":"'.$gdps->author.'"
}';

echo $gdpsesecho;