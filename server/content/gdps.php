<?php
require_once '../api/api.php';

$gdps = content::fetchById($_GET['id'], 0);

if ($gdps == null) {
    exit('["NONE"]');
}

$stat = content::lastStats($_GET['id']);
$comms = Comments::getComments(0, $_GET['id'], 0);
$text = str_replace(PHP_EOL, '<br>', $gdps->description);

echo '{'.
    '"gdps":'.
    '['.
        $gdps->ID.',"'.
        $gdps->title.'",'.
        //'"","'.
        json_encode($text).',"'.
        str_replace('"', '\\"', $gdps->tags).'","'.
        str_replace('"', '\\"', $gdps->os).'",'.
        $gdps->likes.','.
        $gdps->author.',"'.
        $gdps->username.'","'.
        urlencode($gdps->img).'",'.
        $gdps->freejoin.','.
        $gdps->status.
    ']'.
',"gdpsstat":'.
    $stat.
',"comments":'.
    '{';
        $first = true;
        foreach ($comms as $comm) {
            echo $first ? '' : ',';
            $first = false;
            $uder = Users::fetchById($comm->userId);
            $comm->COMMrender($uder);
        }
    echo '}'.
',"news":'.
    '{';
        $first = true;
        $newz = content::fetchNews($_GET['id']);
        
        foreach ($newz as $news) {
            $user = Users::fetchById($news->userId);
            $text = base64_decode($news->text);
            $gdps = content::fetchById($news->gdpsId, 0);
            $title2 = '???';
            if ($gdps->title != null) $title2 = $gdps->title;
            
            echo $first ? '' : ',';
            $first = false;
            
            echo '"n'.$news->ID.'":['.
            $news->ID.',"'.
            $news->title.'",'.
            json_encode(str_replace(PHP_EOL, '<br>', $text)).','.
            $user->userId.',"'.
            $user->getNickname().'",'.
            $news->gdpsId.',"'.
            $title2.'",'.
            $news->date.','.
            $news->likes.']';
        }
    echo '}';
echo '}';