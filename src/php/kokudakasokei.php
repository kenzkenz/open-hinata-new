<?php
require_once "pwd.php";

$parameter = $_GET["parameter"];

$arr = explode(' ', $parameter);
$sql = '';
$counter = 0;
foreach($arr as $value) {
    if ($counter == 0) {
        $sql .= "CONCAT(KEY0,PREF_NAME,CITY_NAME,令制国,郡名,国郡名,村名,領分１,領分２,領分３,領分４,領分５,領分６,領分７,領分８,よみ,県) LIKE '%" . $value . "%'";
    } else {
        $sql .= "OR CONCAT(KEY0,PREF_NAME,CITY_NAME,令制国,郡名,国郡名,村名,領分１,領分２,領分３,領分４,領分５,領分６,領分７,領分８,よみ,県) LIKE '%" . $value . "%'";
    }
    $counter++;
}

$pdo->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);
//$mysql = "SELECT parameters FROM shorturl WHERE id = ?";

$mysql = "SELECT SUM(石高計) AS 石高総計 FROM `bakumatsu` WHERE " . $sql;

//$mysql = "aaa";
$stmt = $pdo->prepare($mysql);
$stmt->execute(array($parameter));
$count = $stmt->rowCount();
if ($count > 0) {
    foreach ($stmt as $row) {
        $response = $row['石高総計'];
        break;
    }
} else {
    //一致データなし
//    $response = array('error' => 'nodata');
}
echo json_encode($response);
?>
