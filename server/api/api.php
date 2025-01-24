<?php
error_reporting(0);

define('HELPER_VER', 81);

require __DIR__ . '/users.php';
require __DIR__ . '/gdpses.php';
require __DIR__ . '/search.php';
require __DIR__ . '/alarms.php';
require __DIR__ . '/configs.php';

@header('Content-Type: text/html; charset=utf-8');
@header('Access-Control-Allow-Origin: *');

if (isset($_POST['token']))
    $_SESSION['user'] = $_POST['token'];

function loginT($token = '', bool $showToken = false) {
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

        if ($showToken) 
            $returnable .= ",\"$user->token\"";

        $returnable .= '],';
    } else {
        $returnable .= '[],';
    }
    $c = 1;
    $f = true;
    $returnable .= '{';
        $gdpses = NewGdpsFinder(3, 0);
        foreach ($gdpses as $gdps) {
            $c = $c + 1;
            $returnable .= $f ? $f = false : ',';
            $returnable .= $gdps->GDPSrenderLT();
            if ($c == 9) break;
        }
    $returnable .= '},';
    $c = 1;
    $f = true;
    $returnable .= '[';
    foreach (Guides::fetchNew() as $gdps) {
        $c = $c + 1;
        $returnable .= $f ? $f = false : ',';
        $returnable .= $gdps->renderGuideMini();
        if ($c == 5) break;
    }
    $returnable .= ']';
    if (isset($user)) {
        $returnable .= ',[
        ';
        $returnable .= '{';
        $gdpses = content::getMyContent($user->userId, 0);
        $guides = Guides::fetchMy($user->userId);

        $f = true;
        foreach ($gdpses[0] as $gdps2) {
            $gdps = content::fetchById($gdps2->ID, 0);
            if ($gdps->ID != null) {
                $returnable .= $f ? $f = false : ',';
                $returnable .= $gdps->GDPSrenderLT();
            }
        }

        $f = true;
        if ($gdpses[0] != [] && $gdpses[1] != []) $returnable .= ',';
        foreach ($gdpses[1] as $gdps2) {
            $gdps = content::fetchById($gdps2->gdpsId, 0);
            if ($gdps != null) {
                if ($gdps->ID != null) {
                    $returnable .= $f ? $f = false : ',';
                    $returnable .= $gdps->GDPSrenderLT();
                }
            }
        }
        $returnable .= '}';
        $gdpses = content::getMyContent($user->userId, 1);

        $returnable .= ',[';
        $f = true;
        foreach ($guides as $guid) {
            if ($guid != null) {
                $returnable .= $f ? $f = false : ',';
                $returnable .= $guid->renderGuideMini();
            }
        }
        $returnable .= ']';
        $returnable .= ']';
    }

$returnable .= ']';
$returnable = str_replace(
    [',}', ',]'],
    ['}', ']'],
    $returnable
);
echo $returnable;
}