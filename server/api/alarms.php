<?php

class Alarms {
    public static function checkAlarms(int $userId) {
        global $conn;
        $val = $conn->prepare('SELECT * FROM `alarms` WHERE `userId` = ? AND `public` = 1 LIMIT 1');
        $val->execute([$userId]);
        return $val->fetchColumn();
    }
    
    public static function getFullAlarm(int $ID) {
        global $conn;
        $alarm = $conn->prepare('SELECT * FROM `alarms` WHERE `ID` = ?');
        $alarm->execute([$ID]);
        return $alarm->fetchObject();
    }
    
    public static function getAlarmsList(int $userId, int $page) {
        $page2 = $page * 10;
        global $conn;
        $alarms = $conn->prepare('SELECT * FROM `alarms` WHERE `userId` = ? ORDER BY `date` DESC LIMIT 11 OFFSET 0');
        $alarms->execute([$userId]);
        return $alarms->fetchAll(PDO::FETCH_OBJ);
    }

    public static function removeAlarm(int $userId, int $ID) {
        $a = self::getFullAlarm($ID);
        if ($userId == $a->userId) {
            global $conn;
            $rem = $conn->prepare('UPDATE `alarms` SET `public` = 0 WHERE `ID` = ?');
            $rem->execute([$ID]);
            return true;
        } else
            return false;
    }

    public static function writeAlarm(string $title, string $text, int $userId, int $date, string $adminName, int $adminId) {
        global $conn;
        $alarm = $conn->prepare('INSERT INTO `alarms` (`title`, `text`, `userId`, `date`, `adminName`, `adminId`) VALUES (?, ?, ?, ?, ?, ?)');
        $alarm->execute([$title, $text, $userId, $date, $adminName, $adminId]);
        return true;
    }
}