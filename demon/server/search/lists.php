<?php
require_once __DIR__.'/../api/api.php';

$returnable = '{';
    $c = 0;
    $f = true;
    $demons = content::getLists($_GET['g'], $_GET['page']);
    foreach ($demons as $d) {
        $c++;
        $returnable .= $f ? $f = false : ',';
        $returnable .= $d->render();
        if ($c == 11) break;
    }
$returnable .= '}';

echo $returnable;