<?php

error_reporting(-1);
ini_set('display_errors', 'On');

$servername = "localhost";
$username = "********";
$password = "********";
$dbname = "********";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error)
{
    die("Connection failed: " . $conn->connect_error);
} 
echo "Connected successfully<br/>";

$players = json_decode($_POST["players"]);

$numInserted = 0;
$numUpdated = 0;
foreach($players as $player)
{
    $sqlHead = "INSERT INTO `Players` ";
    $sqlColumns = "(";
    $sqlValues = "VALUES (";
    foreach($player as $key => $value)
    {
        if(!is_object($value))
        {
            $sqlColumns .= "`$key`, ";
            $sqlValues .= "'$value', ";
        }
    }
    $sqlColumns = substr($sqlColumns, 0, strlen($sqlColumns)-2).") ";
    $sqlValues = substr($sqlValues, 0, strlen($sqlValues)-2).")";

    $sql = $sqlHead.$sqlColumns.$sqlValues;
    print $sql."<br/>";
    if($conn->query($sql) === true)
    {
        $numInserted++;
    }
    else
    {
        $sql = "SELECT * FROM `Players` WHERE `ID`='$player->ID'";
        $planets = [$player->mainPlanet];
        $names = [
            'mainPlanet',
            'colony1',
            'colony2',
            'colony3',
            'colony4',
            'colony5',
            'colony6',
            'colony7',
            'colony8',
            'colony9',
            'colony10',
            'colony11' ];
        $result = $conn->query($sql);
        if($result->num_rows == 1)
        {
            $row = $result->fetch_assoc();
            foreach($names as $name)
            {
                if($row[$name])
                    array_push($planets, $row[$name]);
            }
            $planets = array_unique($planets);
            sort($planets);
            print_r($planets);
            $sql = "UPDATE `Players` SET `numPlanets`=".count($planets).", ";
            foreach($player as $key => $value)
            {
                if(!is_object($value) && $key != "ID" && $key != "mainPlanet")
                {
                    $sql .= "`$key`='$value', ";
                }
            }
            for($i = 0; $i < count($names); $i++)
            {
                if(!isset($planets[$i]))
                    break;
                $sql .= "`".$names[$i]."`='".$planets[$i]."', ";
            }
            $sql = substr($sql, 0, strlen($sql)-2)." WHERE `ID`='$player->ID'";
            print $sql."<br/>";
            if($conn->query($sql) === true)
            {
                $numUpdated++;
            }
            else
            {
                print $conn->error."<br/>";
            }
        }
    }
    print "<br/>";
}
print "Inserted $numInserted rows<br/>";
print "Updated $numUpdated rows<br/>";

?>