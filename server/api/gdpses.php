<?php

class GDPS {
    public int $ID;
    public string $title;
    public string $database;
    public string $link;
    public string $img;
    public string $description;
    public string $text;
    public int $author;
    public int $userId;
    public string $username;
    public string $tags;
    public string $os;
    public int $checked;
    public int $likes;
    public int $sstatus;
    public int $status;
    public int $freejoin;
    public int $MC;
    public int $CC;
    public int $toppos;
    public int $points;
    public string $language;
    public int $levelsCount;
    public int $usersCount;
    public int $date;
    public int $gdpsId;

    public function GDPSrender() {
        $text = $this->description;
        echo 
        '"g'.$this->ID.'":['.
        $this->ID.',"'.
        $this->title.'",'.
        json_encode(mb_substr($text, 0, 121)).',"'.
        str_replace('"', '\\"', $this->tags).'","'.
        str_replace('"', '\\"', $this->os).'",'.
        $this->likes.','.
        $this->author.',"'.
        $this->username.'","'.
        urlencode($this->img).'",'.
        $this->freejoin.','.
        $this->status.','.
        $this->CC.','.
        $this->MC.',"'.
        $this->language.'",'.
        $this->points
        .']';
    }
    
    public function TEXTrender() {
        $text = $this->description;
        echo 
        '"t'.$this->ID.'":['.
        $this->ID.',"'.
        $this->title.'",'.
        json_encode(mb_substr($text, 0, 121)).',"'.
        str_replace('"', '\\"', $this->tags).'","'.
        str_replace('"', '\\"', $this->os).'",'.
        $this->likes.','.
        $this->author.',"'.
        $this->username.'","'.
        urlencode($this->img).'","'.
        urlencode($this->database).'","'.
        urlencode($this->link).'"'
        .']';
    }
    
    public function GDPSrenderLT() {
        $text = $this->description;
        return '"g'.$this->ID.'":['.
        $this->ID.',"'.
        $this->title.'",'.
        json_encode(mb_substr($text, 0, 121)).',"'.
        str_replace('"', '\\"', $this->tags).'","'.
        str_replace('"', '\\"', $this->os).'",'.
        $this->likes.','.
        $this->author.',"'.
        $this->username.'","'.
        urlencode($this->img).'",'.
        $this->freejoin.','.
        $this->status.','.
        $this->CC.','.
        $this->MC.',"'.
        $this->language.'",'.
        $this->points.','.
        $this->checked
        .']';
    }
    
    public function TEXTrenderLT() {
        $text = $this->description;
        return '"t'.$this->ID.'":['.
        $this->ID.',"'.
        $this->title.'",'.
        json_encode(mb_substr($text, 0, 121)).',"'.
        str_replace('"', '\\"', $this->tags).'","'.
        str_replace('"', '\\"', $this->os).'",'.
        $this->likes.','.
        $this->author.',"'.
        $this->username.'","'.
        urlencode($this->img).'","'.
        urlencode($this->database).'","'.
        urlencode($this->link).'",'.
        $this->checked
        .']';
    }
}

class Comments {
    public ?int $ID = null;
    public ?string $text = null;
    public ?string $title = null;
    public ?int $whereIz = null;
    public ?int $userId = null;
    public ?string $username = null;
    public ?int $date = null;
    public ?int $likes = null;
    public ?int $channel = null;

    public static function fetchById(int $ID): ?Comments {
        global $conn;
        $gdpses = $conn->prepare('SELECT * FROM `comments` WHERE `ID` = ?');
        $gdpses->execute([$ID]);
        $gdps = $gdpses->fetchObject(Comments::class);
        if ($gdps == false) {
            return null;
        }
        return $gdps;
    }
    
    public function COMMrender($user) {
        if (gettype($user) !== 'object')
            $user = (object) ['username' => '???', 'userId' => 0];
        echo '"c'.$this->ID.'":['.
        $this->ID.',"'.
        $user->getNickname().'",'.
        json_encode(base64_decode($this->text)).','.
        $this->userId.','.
        $user->priority.','.
        $this->likes.','.
        $this->date.']';
    }

    public static function getComments(int $type, int $content, int $page) {
        switch ($type) {
            case 0:
                $ch = 0; // gdpses
                break;
            case 1:
                $ch = 1; // texures
                break;
            case 2:
                $ch = 2; // guides
                break;
            case 3:
                $ch = 3; // news
                break;
        }
        $page2 = $page * 10;

        global $conn;
        $query = 'SELECT * FROM `comments` WHERE `whereIz` = ? AND `channel` = ? ORDER BY `ID` DESC LIMIT 11';
        $query .= $page ? ' OFFSET ?' : '';

        $gdpses = $conn->prepare($query);
        $gdpses->bindValue(1, $content, PDO::PARAM_INT);
        $gdpses->bindValue(2, $ch, PDO::PARAM_INT);
        if ($page != 0) 
            $gdpses->bindValue(3, (int)$page2, PDO::PARAM_INT);
        $gdpses->execute();
        return $gdpses->fetchAll(PDO::FETCH_CLASS, Comments::class);
    }

    public static function getAllComments(int $type, int $content): array {
        switch ($type) {
            case 0:
                $ch = 0; // gdpses
                break;
            case 1:
                $ch = 1; // texures
                break;
            case 2:
                $ch = 2; // guides
                break;
            case 3:
                $ch = 3; // news
                break;
        }

        global $conn;
        $query = 'SELECT `ID` FROM `comments` WHERE `whereIz` = ? AND `channel` = ? ORDER BY `ID` DESC';

        $gdpses = $conn->prepare($query);
        $gdpses->bindValue(1, $content, PDO::PARAM_INT);
        $gdpses->bindValue(2, $ch, PDO::PARAM_INT);
        $gdpses->execute();
        return $gdpses->fetchAll(PDO::FETCH_CLASS, Comments::class);
    }

    public static function addComment(int $userId, int $ID, string $text, int $date = 0, int $channel = 0) {
        global $conn;
        $insert = $conn->prepare('INSERT INTO `comments` (`userId`, `whereIz`, `text`, `date`, `channel`)
        VALUES (?,?,?,?,?)');
        return $insert->execute([$userId, $ID, $text, $date, $channel]);
    }

    public static function GDPScomment(int $userId, int $ID, string $text, int $date = 0) {
        global $conn;
        $insert = $conn->prepare('INSERT INTO `comments` (`userId`, `whereIz`, `text`, `date`, `channel`)
        VALUES (?,?,?,?,0)');
        return $insert->execute([$userId, $ID, $text, $date]);
    }

    public static function TEXTcomment(int $userId, int $ID, string $text, int $date = 0) {
        global $conn;
        $insert = $conn->prepare('INSERT INTO `comments` (`userId`, `whereIz`, `text`, `date`, `channel`)
        VALUES (?,?,?,?,1)');
        return $insert->execute([$userId, $ID, $text, $date]);
    }

    public static function GUIDcomment(int $userId, int $ID, string $text, int $date = 0) {
        global $conn;
        $insert = $conn->prepare('INSERT INTO `comments` (`userId`, `whereIz`, `text`, `date`, `channel`)
        VALUES (?,?,?,?,2)');
        return $insert->execute([$userId, $ID, $text, $date]);
    }

    public static function NEWScomment(int $userId, int $ID, string $text, int $date = 0) {
        global $conn;
        $insert = $conn->prepare('INSERT INTO `comments` (`userId`, `whereIz`, `text`, `date`, `channel`)
        VALUES (?,?,?,?,3)');
        return $insert->execute([$userId, $ID, $text, $date]);
    }

    public static function NEWSpost(int $userId, int $ID, string $text, int $date = 0, string $title = '') {
        global $conn;
        $insert = $conn->prepare('INSERT INTO `news` (`userId`, `gdpsId`, `date`, `title`, `text`)
        VALUES (?,?,?,?,?)');
        return $insert->execute([$userId, $ID, $date, $title, $text]);
    }

    public static function deleteComm(int $ID, int $channel, int $likeChannel) {
        global $conn;
        $delete = $conn->prepare('DELETE FROM `comments` WHERE `ID` = ? AND `channel` = ?');
        $delete->execute([$ID, $channel]);

        $unlike = $conn->prepare('DELETE FROM `likes` WHERE `whereIz` = ? AND `channel` = ?');
        return $unlike->execute([$ID, $likeChannel]);
    }

    public static function deleteNews(int $ID) {
        global $conn;
        $delete = $conn->prepare('DELETE FROM `news` WHERE `ID` = ?');
        $delete->execute([$ID]);

        $unlike = $conn->prepare('DELETE FROM `likes` WHERE `whereIz` = ? AND `channel` = 6');
        return $unlike->execute([$ID]);
    }
}

class content {
    public static function fetchAll(int $type): array {
        switch ($type) {
            case 0:
                $where = 'gdpses`';
                break;
            case 1:
                $where = 'texures`';
                break;
            case 2:
                $where = 'news`';
                break;
            case 3:
                $where = 'comments` WHERE `channel` = 0';//gdpses
                break;
            case 4:
                $where = 'comments` WHERE `channel` = 1';//texures
                break;
            case 5:
                $where = 'comments` WHERE `channel` = 3';//news
                break;
            case 6:
                $where = 'comments` WHERE `channel` = 2';//guides
                break;
            case 7:
                $where = 'comments`';
                break;
            case 8:
                $where = 'joinlog`';
                break;
            case 9:
                $where = 'soowners`';
                break;
        }
        global $conn;
        $gdpses = $conn->prepare('SELECT * FROM `'.$where.' ORDER BY `ID` DESC');
        $gdpses->execute();
        return $gdpses->fetchAll(PDO::FETCH_OBJ);
    }

    public static function fetchAlls(int $type): array {
        switch ($type) {
            case 0:
                $where = 'gdpses`';
                break;
            case 1:
                $where = 'texures`';
                break;
            case 2:
                $where = 'guides`';
                break;
        }
        global $conn;
        $gdpses = $conn->prepare('SELECT * FROM `'.$where.' ORDER BY `ID` DESC');
        $gdpses->execute();
        return $gdpses->fetchAll(PDO::FETCH_OBJ);
    }

    public static function fetchNews(int $ID): array {
        global $conn;
        $gdpses = $conn->prepare('SELECT * FROM `news` WHERE `gdpsId` = ? ORDER BY `ID` DESC');
        $gdpses->execute([$ID]);
        return $gdpses->fetchAll(PDO::FETCH_OBJ);
    }

    public static function fetchById(int $ID, int $type): ?GDPS {
        switch ($type) {
            case 0:
                $where = 'gdpses';
                break;
            case 1:
                $where = 'texures';
                break;
            case 2:
                $where = 'news';
                break;
        }
        global $conn;
        $gdpses = $conn->prepare('SELECT * FROM `'.$where.'` WHERE `ID` = ?');
        $gdpses->execute([$ID]);
        $gdps = $gdpses->fetchObject(GDPS::class);
        if ($gdps == false) {
            return null;
        }
        return $gdps;
    }

    public static function fetchAllVerified(int $type): array {
        switch ($type) {
            case 0:
                $where = 'gdpses';
                break;
            case 1:
                $where = 'texures';
                break;
        }
        global $conn;
        $gdpses = $conn->prepare('SELECT * FROM `'.$where.'` WHERE `checked` = 1 ORDER BY `ID` DESC');
        $gdpses->execute();
        return $gdpses->fetchAll(PDO::FETCH_OBJ);
    }

    public static function fetchOwned(int $Id, int $type): array {
        $ch = '';
        switch ($type) {
            case 0:
                $where = 'gdpses';
                $auth = 'author';
                break;
            case 1:
                $where = 'texures';
                $auth = 'author';
                break;
            case 2:
                $where = 'joinlog';
                $auth = 'gdpsId';
                break;
            case 3:
                $where = 'soowners';
                $auth = 'gdpsId';
                $ch = 'AND `channel` = 0';
                break;
            case 4:
                $where = 'soowners';
                $auth = 'gdpsId';
                $ch = 'AND `channel` = 1';
                break;
        }
        global $conn;
        $gdpses = $conn->prepare('SELECT * FROM `'.$where.'` WHERE `'.$auth.'` = ? '.$ch.' ORDER BY `ID` DESC');
        $gdpses->execute([$Id]);
        return $gdpses->fetchAll(PDO::FETCH_OBJ);
    }

    public static function checkItem(int $userId, int $ID, int $type) {
        switch ($type) {
            case 0: $where = 'gdpses';      break;
            case 1: $where = 'texures';     break;
        }
        global $conn;
        
        $a = $conn->prepare('SELECT * FROM `'.$where.'` WHERE `ID` = ? AND `author` = ?');
        $a->execute([$ID, $userId]);
        if ($a->fetchColumn() == true)
            return 2;
        
        $b = $conn->prepare('SELECT * FROM `soowners` WHERE `gdpsId` = ? AND `userId` = ? AND `channel` = ?');
        $b->execute([$ID, $userId, $type]);
        if ($b->fetchColumn() == true)
            return 1;
        
        return 0;
    }
    
    public static function getValue(string $val, string $where, int $ID) {
        global $conn;
        $gdpses = $conn->prepare('SELECT `'.$val.'` FROM `'.$where.'` WHERE `ID` = ?');
        $gdpses->execute([$ID]);
        return $gdpses->fetch()[0];
    }

    public static function changeValue(string $val, string $where, int $type, int $ID) {
        if ($type == true) {
            $m = '+';
        } else {
            $m = '-';
        }
        global $conn;
        $gdpses = $conn->prepare(
        'UPDATE `'.$where.'` SET `'.$val.'` = `'.$val.'` '.$m.' 1 WHERE `ID` = ?');
        $gdpses->execute([$ID]);
    }

    public static function setPoint(int $gdpsId, int $date, int $currentDate): int {
        global $conn;
        $prepoint = $conn->prepare('SELECT * FROM `gdpses` WHERE `ID` = :gdpsId');
        $prepoint->execute([':gdpsId'=>$gdpsId]);
        $gdps = $prepoint->fetchObject();
        if ($gdps->checked != 1)
            return false;
        if (($gdps->points - $currentDate) > 0)
            return $gdps->points;
        $conn->prepare('UPDATE `gdpses` SET `points` = :date WHERE `gdpses`.`ID` = :gdpsId')
             ->execute([':date'=>$date, ':gdpsId'=>$gdpsId]);
        return $date;
    }

    public static function getMyContent(int $userId, int $type) {
        global $conn;
        switch ($type) {
            case 0:
                $where = 'gdpses';
                break;
            case 1:
                $where = 'texures';
                break;
        }
        
        $a = $conn->prepare('SELECT * FROM `'.$where.'` WHERE `author` = ?');
        $a->execute([$userId]);
        $b = $conn->prepare('SELECT * FROM `soowners` WHERE `userId` = ? AND `channel` = ?');
        $b->execute([$userId, $type]);
        return [$a->fetchAll(PDO::FETCH_OBJ), $b->fetchAll(PDO::FETCH_OBJ)];
    }

    public static function addOwner(int $gdpsId, int $userId, int $type) {
        switch ($type) {
            case 0:
                $what = 0;
                break;
            case 1:
                $what = 1;
                break;
        }
        global $conn;
        $gdpses = $conn->prepare('INSERT INTO `soowners` (`gdpsId`, `userId`, `channel`) VALUES (?,?,'.$what.')');
        $gdpses->execute([$gdpsId, $userId]);
    }

    public static function deleteOwner(int $gdpsId, int $userId, int $type) {
        global $conn;
        $gdpses = $conn->prepare('DELETE FROM `soowners` WHERE `gdpsId` = ? AND `userId` = ? AND `channel` = ?');
        $gdpses->execute([$gdpsId, $userId, $type]);
    }

    public static function newItem(array $data): bool {
        global $conn;
        if ($data[0] == 0) {
            return $conn
                ->prepare('INSERT INTO `gdpses` (`title`, `database`, `link`, `img`, `description`, `tags`, `os`, `author`, `username`, `language`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
                ->execute([$data[1], $data[2], $data[3], $data[4], $data[5], $data[6], $data[7], $data[8], $data[9], $data[10]]);
        } else {
            return $conn
                ->prepare('INSERT INTO `texures` (`title`, `database`, `link`, `img`, `description`, `tags`, `os`, `author`, `username`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
                ->execute([$data[1], $data[2], $data[3], $data[4], $data[5], $data[6], $data[7], $data[8], $data[9]]);
        }
    }

    public static function editItem(array $data): bool {
        global $conn;
        if ($data[0] == 0) {
            return $conn
                ->prepare('UPDATE `gdpses` SET `title` = ?, `database` = ?, `link` = ?, `img` = ?, `description` = ?, `tags` = ?, `os` = ?, `language` = ?, `checked` = 0 WHERE `gdpses`.`ID` = ?')
                ->execute([$data[1], $data[2], $data[3], $data[4], $data[5], $data[6], $data[7], $data[8], $data[9]]);
                //->execute([$title, $database, $link, $img, $description, $tags, $os, $language, $gdpsId]);
        } else {
            return $conn
                ->prepare('UPDATE `texures` SET `title` = ?, `database` = ?, `link` = ?, `img` = ?, `description` = ?, `tags` = ?, `os` = ?, `checked` = 0 WHERE `texures`.`ID` = ?')
                ->execute([$data[1], $data[2], $data[3], $data[4], $data[5], $data[6], $data[7], $data[8]]);
                //->execute([$title, $database, $link, $img, $description, $tags, $os, $gdpsId]);
        }
    }

    public static function insertStat(int $gdpsId, int $date, int $levels, int $accounts): bool {
        global $conn;
        return $conn
            ->prepare('INSERT INTO `gdpsstats` (`gdpsId`, `date`, `levels`, `accounts`) VALUES (?, ?, ?, ?)')
            ->execute([$gdpsId, $date, $levels, $accounts]);
    }

    public static function lastStats(int $gdpsId, int $pool = 0) {
        global $conn;
        $val = $conn
            ->prepare('SELECT `date`, `levels` FROM `gdpsstats` WHERE `gdpsId` = ? ORDER BY `date` DESC LIMIT 5');
        $val->execute([$gdpsId]);
        $data = $val->fetchAll(PDO::FETCH_ASSOC);
        if ($pool == true) return $data;
        return json_encode($data);
    }

    public static function liketype(int $type): array {
        switch ($type) {
            case 0:
                return ['gdpses',0,0];
            case 1:
                return ['texures',0,2];
            case 2:
                return ['news',0,6];
            case 3:
                return ['comments',0,1];//gdpses
            case 4:
                return ['comments',1,4];//texures
            case 5:
                return ['comments',3,6];//news
            case 6:
                return ['comments',2,5];//guidescomm
            case 7:
                return ['guides',0,7];
            default:
                return
                [
                    'table',
                    -1, // commentsChannel
                    -1  // likeChannel
                ];
            }
    }

    public static function likeSet(int $ID, int $type, int $rate, int $userId) {
        switch ($rate) {
            case 1:
                $r = '+1';
                $rr = -1;
                break;
            case -1:
                $r = '-1';
                $rr = 1;
                break;
        }
        
        $where = self::liketype($type);
        $c = '';
        
        if ($where[0] == 'comments') {
            $c = ' AND `channel` = ' . $where[1];
        }
        
        global $conn;
        
        $like = $conn->prepare('UPDATE `' . $where[0] . '` SET `likes` = `likes` ' . $r . ' WHERE `ID` = ?' . $c);
        $like->execute([$ID]);
        
        $conn->prepare('INSERT INTO `likes` (`whereIz`, `userId`, `type`, `channel`) VALUES (?, ?, ?, ?)')
             ->execute([$ID, $userId, $rr, $where[2]]);
    }

    public static function checkLike(int $ID, int $userId, int $channel = 0) {
        global $conn;
        $z = $conn->prepare('SELECT * FROM `likes` WHERE `whereIz` = ? AND `userId` = ? AND `channel` = ? LIMIT 1');
        $z->execute([$ID, $userId, $channel]);
        $resp = $z->fetchAll(PDO::FETCH_ASSOC);
        if (empty($resp)) 
            return false;
        else 
            return true;
    }

    public static function refreshGdps(int $gdpsId, string $link) {
        global $conn;
        $conn
            ->prepare('UPDATE `gdpses` SET `link` = ? WHERE `gdpses`.`ID` = ?')
            ->execute([$link, $gdpsId]);
        $newLink = $conn
            ->prepare('SELECT `link` FROM `gdpses` WHERE `gdpses`.`ID` = ?');
        $newLink->execute([$gdpsId]);
        return $newLink->fetch()[0];
    }
}

class Guides {
    public ?int $ID = null;
    public ?int $userId = null;
    public ?string $title = null;
    public ?string $aftertext = null;
    public ?string $guidetext = null;
    public ?string $language = null;
    public ?int $checked = null;
    public ?int $date = null;
    public ?int $likes = null;
    public ?string $img = null;

    public static function fetchNew(int $page = 0) {
        $page2 = $page * 4;
        global $conn;
        $query = 'SELECT * FROM `guides` WHERE `checked` = 1 ORDER BY `ID` DESC LIMIT 5';
        $query .= $page2 ? ' OFFSET ?' : '';
        $guides = $conn->prepare($query);
        if ($page2 != 0) 
            $guides->bindValue(1, (int)$page2, PDO::PARAM_INT);
        $guides->execute();
        return $guides->fetchAll(PDO::FETCH_CLASS, Guides::class);
    }

    public static function fetchMy(int $userId) {
        global $conn;
        $guides = $conn->prepare('SELECT * FROM `guides` WHERE `userId` = ? ORDER BY `ID` DESC LIMIT 5');
        $guides->execute([$userId]);
        return $guides->fetchAll(PDO::FETCH_CLASS, Guides::class);
    }

    public static function fetchById(int $ID) {
        global $conn;
        $gdpses = $conn->prepare('SELECT * FROM `guides` WHERE `ID` = ?');
        $gdpses->execute([$ID]);
        $gdps = $gdpses->fetchObject(Guides::class);
        if ($gdps == false) {
            return null;
        }
        return $gdps;
    }

    public static function uploadGuide(int $userId, string $title, string $aftertext, string $guidetext, string $language, string $img, int $date) {
        global $conn;
        $gdpses = $conn->prepare('INSERT INTO `guides` (`userId`, `title`, `aftertext`, `guidetext`, `language`, `date`, `img`) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $gdpses->execute([$userId, $title, $aftertext, $guidetext, $language, $date, $img]);
        return $conn->lastInsertId();
    }

    public static function editGuide(int $userId, string $title, string $aftertext, string $guidetext, string $language, string $img, int $guidID) {
        global $conn;
        $gdpses = $conn->prepare('UPDATE `guides` SET `checked` = 0, `userId` = ?, `title` = ?, `aftertext` = ?, `guidetext` = ?, `language` = ?, `img` = ? WHERE `ID` = ?');
        $gdpses->execute([$userId, $title, $aftertext, $guidetext, $language, $img, $guidID]);
        return $guidID;
    }

    function renderGuide() {
        $title = $this->title;
        $aftertext = $this->aftertext;
        $guidetext = $this->guidetext;
        $json = "{\"guideinfo\":[\"$this->ID\",\"$title\",\"$aftertext\",\"$this->language\"],\"guidedata\":$guidetext";
        return $json;
    }

    function renderGuideMini() {
        $title = $this->title;
        $json = "[\"$this->ID\",\"$title\",\"$this->language\",\"$this->date\",$this->likes,\"$this->img\",$this->userId]";
        return $json;
    }

    function renderGuideLT() {
        $title = $this->title;
        $aftertext = $this->aftertext;
        $guidetext = $this->guidetext;
        $json = "{\"guideinfo\":[\"$this->ID\",\"$title\",\"$aftertext\",\"$this->language\",\"$this->img\"],\"guidedata\":$guidetext";
        return $json;
    }
}