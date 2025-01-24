<?php
session_start();
require_once '../api.php';
if(isset($_SESSION['user'])){$user = Users::fetchByToken($_SESSION['user']);
    global $conn;
    if($user->priority > 2){
    echo '<link href="admin.css" rel="stylesheet">';
    echo '<style>body{margin:200px 20%}</style>';
    echo '<div class="framemain">';
        
        echo '<h1>Owner tools</h1>';
            ?>
            <form action="./userManagement.php" method="POST">
                <label>User:</label>
                <select name="user" required>
                    <?php
                    foreach (Users::fetchAll() as $user) {
                        echo '<option value="' . $user->userId . '">' . $user->username . '</option>';
                    }
                    ?>
                </select><br>
                <label>Role:</label>
                <select name="role" required>
                    <?php
                    for ($i = 0; $i < Roles::Owner + 1; ++$i) {
                        echo '<option value="' . $i . '">' . Roles::toString($i) . '</option>';
                    }
                    ?>
                </select><br>
                <input type="submit" value="Setup">
            </form>
            <a href="./">Back</a></div>
        <?php
    }else{echo'Acces denied';}
}else{echo'Acces denied';}?>