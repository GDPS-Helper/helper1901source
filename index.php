<?php $err = true;
$a = '<!DOCTYPE html><html><head>';
if (isset($_GET['gdps'])) {
    $id = $_GET['gdps'];
    require_once __DIR__.'/server/api/api.php';
    $gdps = content::fetchById($id,0);
    if ($gdps != null) {
        $err = false;
        $a.= "<meta property=\"og:title\" content=\"$gdps->title\">".
             "<meta property=\"og:description\" content=\"$gdps->description\">".
             "<meta property=\"og:image\" content=\"$gdps->img\">";
    }
}
if (isset($_GET['texture'])) {
    $id = $_GET['texture'];
    require_once __DIR__.'/server/api/api.php';
    $gdps = content::fetchById($id,1);
    if ($gdps != null) {
        $err = false;
        $a.= "<meta property=\"og:title\" content=\"$gdps->title\">".
             "<meta property=\"og:description\" content=\"$gdps->description\">".
             "<meta property=\"og:image\" content=\"$gdps->img\">";
    }
}
if (isset($_GET['newsC'])) {
    $id = stristr($_GET['newsC'],'.',true);
    if ($id !== false) {
        require_once __DIR__.'/server/api/api.php';
        $news = content::fetchById($id,2);
        if ($news != null) {
            $id2 = trim(stristr($_GET['newsC'],'.'),'.');
            $gdps = content::fetchById($id2,0);
            $err = false;
            $text = base64_decode($news->text);
            $a.= "<meta property=\"og:title\" content=\"$news->title\">".
                 "<meta property=\"og:description\" content=\"$text\">".
                 "<meta property=\"og:image\" content=\"$gdps->img\">";
        }
    }
}
if (isset($_GET['news'])) {
    $id = $_GET['news'];
    require_once __DIR__.'/server/api/api.php';
    $gdps = content::fetchById($id,0);
    if ($gdps != null) {
        $err = false;
        $a.= "<meta property=\"og:title\" content=\"Новости $gdps->title\">".
             "<meta property=\"og:description\" content=\"Прочитай их на GDPS Helper!\">".
             "<meta property=\"og:image\" content=\"$gdps->img\">";
    }
}
if ($err === true) {
    $a.= "<meta property=\"og:title\" content=\"GDPS Helper\">".
         "<meta property=\"og:description\" content=\"Удобный сервис для поиска приватных серверов по Geometry dash!\">".
         "<meta property=\"og:image\" content=\"https://www.gdpshelper.xyz/imgs/empty.png\">";
}
echo$a?><script src="https://js.hcaptcha.com/1/api.js?ver=1" async defer></script>
        <script defer src="newHelper.js?ver=19001"></script>
        <title>GDPS Helper</title>
        <meta name=viewport content="width=device-width,initial-scale=1.0">
        <meta charset=UTF-8>
        <link href="main.css?ver=19001" rel=stylesheet>
        <style id="stule">
            :root {
                --color-main:rgb(157,97,42);
                --color-light:rgb(255,134,0);
                --color-weekly:rgb(189,99,0);
                --color-weekly-alpha:rgba(189,99,0,.6);
                --color-black:rgb(29,28,22);
                --color-black-alpha:rgba(29,28,22,.6);
                --color-profile:rgb(32,31,24);
                --color-profile-alpha:rgb(32,31,24,.6);
            }
        </style>
    </head>
    <body style="background-color:rgb(12,12,3)">
        <div id=1st></div>
        <div id=4st style=display:none>
            <div id=2st class=h-captcha data-sitekey=c7d9485d-7199-4801-9301-4c0ead7ce01e style=display:none></div>
        </div>
    </body>
</html>