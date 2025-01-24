<?php
require_once __DIR__.'/../api/api.php';

$list = content::getList($_GET['list']);

$returnable = '{"name":"'.$list->title.'"';
    $c = 0;
    $demons = content::getDemons($_GET['list'], $_GET['page']);
    foreach ($demons as $d) {
        $c++;
        $returnable .= ',';
        $returnable .= $d->render();
        if ($c == 11) break;
    }
$returnable .= '}';

echo $returnable;