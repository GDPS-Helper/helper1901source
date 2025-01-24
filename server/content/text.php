<?php
require_once '../api/api.php';

$gdps = content::fetchById($_GET['id'], 1);

if ($gdps == null) {
    exit('["NONE"]');
}

$user = Users::fetchById($gdps->author);

$comms = Comments::getComments(1, $_GET['id'], 0);
$text = str_replace(PHP_EOL, '<br>', $gdps->description);

echo '{'.
'"gdps":'.
    '['.
        $gdps->ID.',"'.
        $gdps->title.'",'.
        json_encode($text).',"'.
        str_replace('"', '\\"', $gdps->tags).'","'.
        str_replace('"', '\\"', $gdps->os).'",'.
        $gdps->likes.','.
        $user->userId.',"'.
        $user->getNickname().'","'.
        urlencode($gdps->img).'","'.
        urlencode($gdps->database).'","'.
        urlencode($gdps->link).'"'.
    ']'.
',"comments":'.
    '{';
        $first = true;
        foreach ($comms as $comm) {
            echo $first ? '' : ',';
            $first = false;
            $uder = Users::fetchById($comm->userId);
            $comm->COMMrender($uder);
        }
    echo '}';
echo '}';