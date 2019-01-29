<?php

error_reporting(-1);
ini_set('display_errors', 'On');

$pdo = new \PDO('mysql:host=localhost;dbname=********', '********', '********');

$scan = json_decode($_POST["attack"], true);

$sql = "
  INSERT INTO
        `AttackPending`
        (`address`, `attackOrigin`, `attackArrival`, `attackReturn`, `isScriptAttack`)
    VALUES
        (:address, :origin, :arrival, :return, :isscript )
";

$statement = $pdo->prepare($sql);
if($statement->execute([
    "address" => $scan["address"],
    "origin" => $scan["origin"],
    "arrival" => $scan["arrival"],
    "return" => $scan["return"],
    "isscript" => $scan["isscript"]
    ]))
{
    print "Success";
}
else
{
    print "Error";
}

?>