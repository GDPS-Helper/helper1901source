<?php
require_once __DIR__.'/../api/api.php';

$level = content::getLevel($_GET['level']);

$returnable = '{"name":"'.$level->title.'"';
    if (isset($_GET['admin']))
        $demons = content::getRecordsAdmin($_GET['level']);
    else
        $demons = content::getRecords($_GET['level'], $_GET['page']);

    $c = 0;
    foreach ($demons as $d) {
        $c++;
        $returnable .= ',';
        $returnable .= $d->render();
        if ($c == 11 && !isset($_GET['admin'])) break;
    }
$returnable .= '}';

echo $returnable;