<?php

error_reporting(-1);
ini_set('display_errors', 'On');

$pdo = new \PDO('mysql:host=localhost;dbname=********', '********', '********');

$scan = json_decode($_POST["scan"], true);

$sql = "
  INSERT INTO
        `ScanPending`
        (`ID`, `address`)
    VALUES
        (:id, :address )
";

$statement = $pdo->prepare($sql);
if($statement->execute([
    "id" => $scan["ID"],
    "address" => $scan["address"],
    ]))
{
    print "Success";
}
else
{
    print "Error";
}

?>