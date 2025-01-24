<?php
session_start();
if (!isset($_SESSION['user'])) {
    exit(-27);
}
require_once '../api/api.php';

$user = Users::fetchByToken($_SESSION['user']);

if ($user->activated == 0) {
    echo $_GET['id'];
    exit();
}

if ($user->activated == 0) {
    echo content::getValue('likes', $type[0], $_POST['ide']);
    exit();
}
if (isset($_POST['title'])) {
    $guidetitle = htmlspecialchars($_POST['title'], ENT_QUOTES, 'UTF-8');
    $language = htmlspecialchars($_POST['language'], ENT_QUOTES, 'UTF-8');
    $aftertext = htmlspecialchars($_POST['aftertext'], ENT_QUOTES, 'UTF-8');
    $subtitlePre = $_POST['subtitle'];
    $subtextPre = str_replace("\n", "\\n", $_POST['subtext']);
    $img = htmlspecialchars($_POST['img'], ENT_QUOTES, 'UTF-8');
    $guideinfo = '[';

    $count = count($subtitlePre) - 1;
    for ($i = 0; $i <= $count; $i++) {
        $subtitle = htmlspecialchars($subtitlePre[$i], ENT_QUOTES, 'UTF-8');
        $subtext = htmlspecialchars($subtextPre[$i], ENT_QUOTES, 'UTF-8');
        $guideinfo .= $i == 0 ? '' : ',';
        $guideinfo .= "[\"$subtitle\",\"$subtext\"]";
    }
    $guideinfo .= ']';
    
    echo Guides::uploadGuide($user->userId, $guidetitle, $aftertext, $guideinfo, $language, $img, time());
}