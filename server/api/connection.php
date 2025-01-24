<?php
try {
    $conn = new PDO('mysql:host=localhost;port=3306;dbname=gdps_helper', 'miobomb', 'put_your_here', array(
        PDO::ATTR_PERSISTENT => true
    ));
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    exit(__DIR__."\\connection.php | Connection error: " . $e->getMessage());
}