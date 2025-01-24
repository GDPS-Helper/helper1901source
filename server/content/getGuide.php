<?php require_once '../api/api.php';

$guide = Guides::fetchById($_GET['id']);

if ($guide == null) {
    exit('["NONE"]');
}

echo $guide->renderGuide();
    echo ',"comments":{';

    $comms = Comments::getComments(2, $_GET['id'], 0);
    
    $first = true;
    foreach ($comms as $comm) {
        echo $first ? '' : ',';
        $first = false;
        $uder = Users::fetchById($comm->userId);
        $comm->COMMrender($uder);
    }
    
    echo '}';
echo '}';