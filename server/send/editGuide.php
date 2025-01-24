<?php 
session_start();
require_once '../api/api.php';

$guide = Guides::fetchById($_GET['id']);
$user = Users::fetchByToken($_SESSION['user']);

if ($user->userId != $guide->userId)
    exit('-2');

if (isset($_POST['title'])) {
    if ($user->activated == 0) {
        echo $_GET['id'];
        exit('-45');
    }

    $guidetitle = htmlspecialchars($_POST['title'], ENT_QUOTES, 'UTF-8');
    $language = htmlspecialchars($_POST['language'], ENT_QUOTES, 'UTF-8');
    $aftertext = htmlspecialchars($_POST['aftertext'], ENT_QUOTES, 'UTF-8');
    $subtitlePre = $_POST['subtitle'];
    $subtextPre = str_replace("\n", "\\n", $_POST['subtext']);
    $img = htmlspecialchars($_POST['img'], ENT_QUOTES, 'UTF-8');
    $guidId = $_POST['guidid'];
    $guideinfo = '[';

    $count = count($subtitlePre) - 1;
    for ($i = 0; $i <= $count; $i++) {
        $subtitle = htmlspecialchars($subtitlePre[$i], ENT_QUOTES, 'UTF-8');
        $subtext = htmlspecialchars($subtextPre[$i], ENT_QUOTES, 'UTF-8');
        $guideinfo .= $i == 0 ? '' : ',';
        $guideinfo .= "[\"$subtitle\",\"$subtext\"]";
    }
    $guideinfo .= ']';
    
    echo Guides::editGuide($user->userId, $guidetitle, $aftertext, $guideinfo, $language, $img, $guidId);
    exit();
}

if ($guide == null) {
    exit('["NONE"]');
}

echo $guide->renderGuideLT().'}';