<?php

class DemonList {
    public int $ID;
    public string $title;
    public int $gdpsId;
    public int $activated;

    public function render() {
        return '"l'.$this->ID.'":['.
        $this->ID.',"'.
        $this->title.'",'.
        $this->gdpsId.','.
        $this->activated
        .']';
    }
}

class Demon {
    public int $ID;
    public string $title;
    public string $link;
    public int $listId;
    public int $toppos;

    public function render() {
        return '"d'.$this->ID.'":['.
        $this->ID.',"'.
        $this->title.'","'.
        $this->link.'",'.
        $this->listId.','.
        $this->toppos
        .']';
    }

    public function renderLikeArray() {
        return '['.
        $this->ID.',"'.
        $this->title.'","'.
        $this->link.'",'.
        $this->listId.','.
        $this->toppos
        .']';
    }
}

class Record {
    public int $ID;
    public int $levelId;
    public int $gdUserId;
    public string $gdNickname;
    public string $progress;

    public function render() {
        return '"p'.$this->ID.'":['.
        $this->ID.','.
        $this->levelId.','.
        $this->gdUserId.',"'.
        $this->gdNickname.'","'.
        $this->progress.'%'
        .'"]';
    }
}

class content {
    public static function getLists(int $gdpsId, int $page = 0) {
        $prep = "SELECT * FROM `demonlist_gdpses` WHERE `activated` = 1 AND `gdpsId` = ?";
        $exec = [$gdpsId];
        global $conn;
        $gdpsesPre = $conn->prepare($prep);
        $gdpsesPre->execute($exec);
        return $gdpsesPre->fetchAll(PDO::FETCH_CLASS, DemonList::class);
    }
    
    public static function getDemons(int $listId, int $page) {
        $prep = "SELECT * FROM `demonlist_demons` WHERE `listId` = ? ORDER BY `toppos` ASC LIMIT 11";
        $exec = [$listId];
        if ($page != 0) {
            $prep .= " OFFSET ".($page * 10);
        }

        global $conn;
        $gdpsesPre = $conn->prepare($prep);
        $gdpsesPre->execute($exec);
        return $gdpsesPre->fetchAll(PDO::FETCH_CLASS, Demon::class);
    }

    public static function getList(int $listId) {
        global $conn;
        $gdpsesPre = $conn->prepare("SELECT * FROM `demonlist_gdpses` WHERE `ID` = ?");
        $gdpsesPre->execute([$listId]);
        return $gdpsesPre->fetchObject(DemonList::class);
    }

    public static function getLevel(int $level) {
        $prep = "SELECT * FROM `demonlist_demons` WHERE `ID` = ?";
        $exec = [$level];

        global $conn;
        $gdpsesPre = $conn->prepare($prep);
        $gdpsesPre->execute($exec);
        return $gdpsesPre->fetchObject(Demon::class);
    }

    public static function getRecords(int $level, int $page) {
        $prep = "SELECT * FROM `demonlist_records` WHERE `levelId` = ? ORDER BY `progress` ASC LIMIT 11";
        $exec = [$level];
        if ($page != 0) {
            $prep .= " OFFSET ".($page * 10);
        }

        global $conn;
        $gdpsesPre = $conn->prepare($prep);
        $gdpsesPre->execute($exec);
        return $gdpsesPre->fetchAll(PDO::FETCH_CLASS, Record::class);
    }

    public static function getRecordsAdmin(int $level) {
        global $conn;
        $gdpsesPre = $conn->prepare("SELECT * FROM `demonlist_records` WHERE `levelId` = ?");
        $gdpsesPre->execute([$level]);
        return $gdpsesPre->fetchAll(PDO::FETCH_CLASS, Record::class);
    }

    public static function createList(int $gdpsId, string $title) {
        global $conn;
        $gdpsesPre = $conn->prepare("INSERT INTO `demonlist_gdpses`(`gdpsId`, `title`, `activated`) VALUES (?, ?, 1)");
        $gdpsesPre->execute([$gdpsId, $title]);
        return $conn->lastInsertId();
    }

    public static function deleteList(int $listId) {
        global $conn;
        $gdpsesPre = $conn->prepare("DELETE FROM `demonlist_gdpses` WHERE `ID` = ?");
        $gdpsesPre->execute([$listId]);
        return $listId;
    }

    public static function addLevel(int $listId, string $title, string $youtube) {
        global $conn;
        $gdpsesPre = $conn->prepare("INSERT INTO `demonlist_demons`(`listId`, `title`, `link`) VALUES (?, ?, ?)");
        $gdpsesPre->execute([$listId, $title, $youtube]);
        return [
            $conn->lastInsertId(),
            $title,
            $youtube
        ];
    }

    public static function addProgress(int $levelId, int $gdUserId, string $gdNickname, string $progress) {
        global $conn;
        $gdpsesPre = $conn->prepare("INSERT INTO `demonlist_records`(`levelId`, `gdUserId`, `gdNickname`, `progress`) VALUES (?, ?, ?, ?)");
        $gdpsesPre->execute([$levelId, $gdUserId, $gdNickname, $progress]);
        return [
            $conn->lastInsertId(),
            $levelId,
            $gdUserId,
            $gdNickname,
            "$progress%"
        ];
    }

    public static function editTop(int $demonId, int $topValue) {
        global $conn;
        $gdpsesPre = $conn->prepare("UPDATE `demonlist_demons` SET `toppos` = ? WHERE `ID` = ?");
        $gdpsesPre->execute(params: [$topValue, $demonId]);
        $ret = $conn->prepare("SELECT `toppos` FROM `demonlist_demons` WHERE `ID` = ?");
        $ret->execute([$demonId]);
        return $ret->fetch()[0];
    }

    public static function editYoutube(int $demonId, string $ytLink) {
        global $conn;
        $gdpsesPre = $conn->prepare("UPDATE `demonlist_demons` SET `link` = ? WHERE `ID` = ?");
        $gdpsesPre->execute(params: [$ytLink, $demonId]);
        $ret = $conn->prepare("SELECT `link` FROM `demonlist_demons` WHERE `ID` = ?");
        $ret->execute([$demonId]);
        return $ret->fetch()[0];
    }

    public static function editTitle(int $demonId, string $title) {
        global $conn;
        $gdpsesPre = $conn->prepare("UPDATE `demonlist_demons` SET `title` = ? WHERE `ID` = ?");
        $gdpsesPre->execute(params: [$title, $demonId]);
        $ret = $conn->prepare("SELECT `title` FROM `demonlist_demons` WHERE `ID` = ?");
        $ret->execute([$demonId]);
        return $ret->fetch()[0];
    }

    public static function deleteLevel(int $ID) {
        global $conn;
        $gdpsesPre = $conn->prepare("DELETE FROM `demonlist_demons` WHERE `ID` = ?");
        $gdpsesPre->execute([$ID]);
        return $ID;
    }

    public static function deleteProgress(int $ID) {
        global $conn;
        $gdpsesPre = $conn->prepare("DELETE FROM `demonlist_records` WHERE `ID` = ?");
        $gdpsesPre->execute([$ID]);
        return $ID;
    }

    public static function checkOwn(int $userId, int $ID) {
        global $conn;
        
        $a = $conn->prepare('SELECT * FROM `gdpses` WHERE `ID` = ? AND `author` = ?');
        $a->execute([$ID, $userId]);
        if ($a->fetchColumn() == true)
            return 2;
        
        $b = $conn->prepare('SELECT * FROM `soowners` WHERE `gdpsId` = ? AND `userId` = ? AND `channel` = 0');
        $b->execute([$ID, $userId]);
        if ($b->fetchColumn() == true)
            return 1;
        
        return 0;
    }
    
    public static function fetchGdpsById(int $ID) {
        global $conn;
        $gdpses = $conn->prepare('SELECT * FROM `gdpses` WHERE `ID` = ?');
        $gdpses->execute([$ID]);
        $gdps = $gdpses->fetchObject();
        if ($gdps == false) {
            return null;
        }
        return $gdps;
    }
}