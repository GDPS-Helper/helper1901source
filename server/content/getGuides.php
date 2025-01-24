<?php require_once '../api/api.php';

$page = isset($_GET['page']) ? $_GET['page'] : 0;

$guides = Guides::fetchNew($page);

$return = '[';

$first = true;
foreach ($guides as $g) {
    $return .= $first ? '' : ',';
    $first = false;
    $return .= $g->renderGuideMini();
}

echo $return.']';