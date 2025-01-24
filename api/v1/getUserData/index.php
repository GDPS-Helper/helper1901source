<?php
require_once '../../../server/api/api.php';

header('Content-Type: application/json'); 
header('Access-Control-Allow-Origin: *');

error_reporting(0);

$user = Users::fetchById($_GET['id']);

if ($user == null)
    exit('{
    "userId":0
}');

$gdpses = content::getMyContent($user->userId, 0);
$textures = content::getMyContent($user->userId, 1);
$gdpsesecho = '';
$texturesecho = '';
$f = true;
foreach ($gdpses[0] as $gdps2) {
    $gdps = content::fetchById($gdps2->ID, 0);
    $gdpsesecho .= $f ? '' : ',
';
    $f = false;

    if ($gdps->freejoin == 0) {
        $joinSt = 1;
    } else {
        $joinSt = 0;
    }

    $gdpsesecho .= '        "g'.$gdps->ID.'":
        {
            "gdpsId":'.$gdps->ID.',
            "title":"'.$gdps->title.'",
            "text":'.json_encode($gdps->description).',
            "tags":"'.str_replace('"', '\\"', $gdps->tags).'",
            "os":"'.str_replace('"', '\\"', $gdps->os).'",
            "likes":'.$gdps->likes.',
            "picture":"'.urlencode($gdps->img).'",
            "joinStatus":'.$joinSt.',
            "isWeekly":'.$gdps->status.',
            "language":"'.$gdps->language.'"
        }';
}
$f = true;
foreach ($textures[0] as $gdps2) {
    $gdps = content::fetchById($gdps2->ID, 1);
    $texturesecho .= $f ? '' : ',
';
    $f = false;

    if ($gdps->freejoin == 0) {
        $joinSt = 1;
    } else {
        $joinSt = 0;
    }

    $texturesecho .= '        "t'.$gdps->ID.'":
        {
            "gdpsId":'.$gdps->ID.',
            "title":"'.$gdps->title.'",
            "text":'.json_encode($gdps->description).',
            "tags":"'.str_replace('"', '\\"', $gdps->tags).'",
            "os":"'.str_replace('"', '\\"', $gdps->os).'",
            "likes":'.$gdps->likes.',
            "picture":"'.urlencode($gdps->img).'"
        }';
}

echo '{
    "userData":{
        "username":"'.$user->username.'",
        "userId":"'.$user->userId.'",
        "roleId":"'.$user->priority.'",
        "isActive":"'.$user->activated.'"
    },
    "gdpsData":{
'.$gdpsesecho.'
    },
    "textData":{
'.$texturesecho.'
    }
}';