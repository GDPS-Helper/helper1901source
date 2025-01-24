<?php
require_once '../api/api.php';

$news = content::fetchById($_GET['id'], 2);

if ($news == null) {
    exit('["NONE"]');
}

$user = Users::fetchById($news->userId);
$comms = Comments::getComments(3, $_GET['id'], 0);
$text = str_replace(PHP_EOL, '<br>', base64_decode($news->text));

echo '{'.
'"gdps":'.
    '{';
        $title2 = 'Неизвестный ГДПС';
        $gdps = content::fetchById($news->gdpsId, 0);
        if ($gdps->title != null)
            $title2 = $gdps->title;

        echo '"'.$news->ID.'":'.
        '['.
            $news->ID.',"'.
            $news->title.'",'.
            json_encode(str_replace(PHP_EOL, '<br>', $text)).','.
            $user->userId.',"'.
            $user->getNickname().'",'.
            $news->gdpsId.',"'.
            $title2.'",'.
            $news->date.','.
            $news->likes.
        ']'.
    '}'.
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