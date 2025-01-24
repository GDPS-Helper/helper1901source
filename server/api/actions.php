<?php class Action {
    public const NEW_GDPS = 'new gdps';
    public const USER_ROLE_UPDATE = 'user role update';
    public const GDPS_DELETED = 'gdps deleted';
    public const GDPS_VERIFIED = 'gdps verified';
    public const GDPS_UNVERIFIED = 'gdps unverified';

    public readonly ?int $actionId;
    public readonly string $name;
    public readonly ?int $gdps;
    public readonly ?int $user;
    public readonly int $author;
    public readonly int $timestamp;

    public static function new(string $name, User $author, int $user = null, int $gdps = null) {
        $action = new Action();
        $action->name = $name;
        $action->author = $author->userId;
        $action->user = $user;
        $action->gdps = $gdps;
        $action->timestamp = time();
        return $action;
    }

    public function getHumanDate() {
        return date('Y-m-d H:i:s', $this->timestamp);
    }
}

class Actions {
    public static function getAllActions(): array {
        global $conn;
        $actions = $conn->query('SELECT * FROM actions ORDER BY timestamp DESC LIMIT 25');
        $actions->execute();
        return $actions->fetchAll(PDO::FETCH_CLASS, Action::class);
    }

    public static function uploadAction(Action $action): bool {
        global $conn;
        return $conn
            ->prepare('INSERT INTO actions (name, gdps, user, author, timestamp) VALUES (?, ?, ?, ?, ?)')
            ->execute([
                $action->name,
                $action->gdps,
                $action->user,
                $action->author,
                $action->timestamp
            ]);
    }
}