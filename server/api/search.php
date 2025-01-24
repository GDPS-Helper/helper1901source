<?php

function NewGdpsFinder(int $method, int $page, array $tags = null, array $oss = null, string $name = null) {

    $prep = "SELECT * FROM gdpses WHERE `checked` = 1";
    $exec = [];

    if ($name !== null) {
        $prep .= " AND LOWER(title) LIKE LOWER(?)";
        array_push($exec, "%$name%");
    }

    if ($tags !== null) {
        foreach ($tags as $tag) {
            $prep .= " AND `tags` LIKE ?";
            array_push($exec, "%\"$tag\"%");
        }
    }

    if ($oss !== null) {
        foreach ($oss as $os) {
            $prep .= " AND `os` LIKE ?";
            array_push($exec, "%\"$os\"%");
        }
    }

    switch ($method) {
        case 0: $prep .= ' ORDER BY `ID` DESC';                     break;
        case 1: $prep .= ' ORDER BY `likes` DESC';                  break;
        case 2: $prep .= ' ORDER BY `likes`';                       break;
        case 3: $prep .= ' ORDER BY `status` DESC,`points` DESC';   break;
        case 4: $prep .= ' AND `MC` = 1 ORDER BY `points` DESC';    break;
        case 5: $prep .= ' AND `CC` = 1 ORDER BY `points` DESC';    break;
    }

    $page = $page * 8;

    if (gettype($page) !== 'integer')
        exit('injection break');

    $prep .= " LIMIT 9";
    if ($page != 0) {
        $prep .= " OFFSET $page";
    }

    global $conn;
    $gdpsesPre = $conn->prepare($prep);
    $gdpsesPre->execute($exec);
    return $gdpsesPre->fetchAll(PDO::FETCH_CLASS, GDPS::class);
}