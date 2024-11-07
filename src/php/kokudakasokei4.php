<?php
require_once "pwd.php";

$parameter = $_GET["parameter"];

$arr = explode(' ', $parameter);
$sql = '';
$counter = 0;
foreach($arr as $value) {
    if ($counter == 0) {
//        $sql .= "CONCAT(KEY0,PREF_NAME,CITY_NAME,令制国,CONCAT(令制国, '国' ),郡名,国郡名,村名,領分１,領分２,領分３,領分４,領分５,領分６,領分７,領分８,よみ,県) LIKE '%" . $value . "%'";
        $sql .= "CONCAT(KEY0,PREF_NAME,CITY_NAME,令制国,CONCAT(令制国, '国' ),郡名,国郡名,村名,領分１,よみ,県) LIKE '%" . $value . "%'";
    } else {
//        $sql .= "OR CONCAT(KEY0,PREF_NAME,CITY_NAME,令制国,CONCAT(令制国, '国' ),郡名,国郡名,村名,領分１,領分２,領分３,領分４,領分５,領分６,領分７,領分８,よみ,県) LIKE '%" . $value . "%'";
        $sql .= "OR CONCAT(KEY0,PREF_NAME,CITY_NAME,令制国,CONCAT(令制国, '国' ),郡名,国郡名,村名,領分１,よみ,県) LIKE '%" . $value . "%'";
    }
    $counter++;
}

$pdo->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);

//$mysql = "SELECT SUM(石高計) AS 石高総計, COUNT(石高計) AS 村数 FROM `bakumatsu` WHERE " . $sql;
$mysql = "SELECT SUM(石高計) AS 石高総計, SUM(村数) AS 村数 FROM `bakumatsu2` WHERE " . $sql;

//$mysql = "aaa";
$stmt = $pdo->prepare($mysql);
$stmt->execute();
$count = $stmt->rowCount();
if ($count > 0) {
    foreach ($stmt as $row) {
        $response = $row['石高総計'];
        $response = array('kokudaka'=>$row['石高総計'], 'sonsu'=>$row['村数']);
        break;
    }
} else {
    //一致データなし
//    $response = array('error' => 'nodata');
}
echo json_encode($response);
?>
