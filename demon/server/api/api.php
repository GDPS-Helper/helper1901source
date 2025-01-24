<?php
error_reporting(E_ALL);

define('HELPER_VER', 81);

require __DIR__ . '/../../../server/api/users.php';
require __DIR__ . '/demons.php';
require __DIR__ . '/../../../server/api/alarms.php';
require __DIR__ . '/../../../server/api/configs.php';

@header('Content-Type: text/html; charset=utf-8');
@header('Access-Control-Allow-Origin: *');

if (isset($_POST['token']))
    $_SESSION['user'] = $_POST['token'];

function loginT($token = '', bool $showToken = false) {
    $gdps = content::fetchGdpsById($_GET['g']);
    $returnable = '';
    $returnable .= '[';
    if ($token !== '') {
        $user = Users::fetchByToken($token);

        $returnable .= '[';

        if ($user != null) {
            $returnable .= '"'.$user->getNickname().'",'.
            $user->userId.','.
            $user->priority.','.
            $user->activated;
        }

        if (Alarms::checkAlarms($user->userId))
            $returnable .= ',1';
        else
            $returnable .= ',0';

        if (content::checkOwn($user->userId, $gdps->ID) == true)
            $returnable .= ','.$gdps->ID;
        else
            $returnable .= ',0';

        $returnable .= ',"'.$gdps->link.'"';
        $returnable .= ',"'.$gdps->title.'"';

        if ($showToken) 
            $returnable .= ",\"$user->token\"";

        $returnable .= '],';
    } else {
        $returnable .= '["???",0,0,0,0,0,"'.$gdps->link.'","'.$gdps->title.'"],';
    }
    $returnable .= '{';
        if (isset($_GET['l']))
            $demonlists = content::getList($_GET['l'])->gdpsId;
        else
            $demonlists = $gdps->ID ?? false;
        if ($demonlists !== false) {
            $c = 0;
            $f = true;
            $demonlists = content::getLists($demonlists, 0);
            foreach ($demonlists as $d) {
                $c++;
                $returnable .= $f ? $f = false : ',';
                $returnable .= $d->render();
                if ($c == 11) break;
            }
        }
    $returnable .= '},';
    $returnable .= '{';
        $demons = $_GET['l'] ?? false;
        if ($demons !== false) {
            $c = 0;
            $f = true;
            $demons = content::getDemons($demons, 0);
            foreach ($demons as $d) {
                $c++;
                $returnable .= $f ? $f = false : ',';
                $returnable .= $d->render();
                if ($c == 11) break;
            }
        }
    $returnable .= '}';
$returnable .= ']';
$returnable = str_replace(
    [',}', ',]'],
    ['}', ']'],
    $returnable
);
echo $returnable;
}