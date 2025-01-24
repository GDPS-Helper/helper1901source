<?php
require_once '../api/api.php';
$next = false;
$newz = content::fetchNews($_GET['id']);

echo '{';
    foreach ($newz as $news) {
        $user = Users::fetchById($news->userId);
        $text = base64_decode($news->text);
        $gdps = content::fetchById($news->gdpsId, 0);
        $title2 = '???';
        if ($gdps->title != null) $title2 = $gdps->title;

        echo $next ? ',' : '';
        $next = true;

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
        ']';
    }
echo '}';