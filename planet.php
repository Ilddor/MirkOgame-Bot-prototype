<?php

error_reporting(-1);
ini_set('display_errors', 'On');

$pdo = new \PDO('mysql:host=localhost;dbname=********', '********', '********');

$planets = json_decode($_POST["planets"], true);

$numInserted = 0;
$numDeletedPlanets = 0;
$numUpdatedPlanets = 0;

// Delete not present planets
$planetIDs = [];

foreach($planets as $planet)
{
    array_push($planetIDs, $planet["ID"]);
}
$arraySQL;
if(count($planetIDs)> 0)
{
    $arraySQL = str_repeat('?,', count($planetIDs) - 1).'?';
}
else
{
    $arraySQL = "'-'";
}

$sql = "
  SELECT
    `ID`
  FROM 
    `Planets`
  WHERE 
      `galaxy`= ?
    AND
      `system` = ?
    AND
      `ID` NOT IN (".$arraySQL.")
";

$statement = $pdo->prepare($sql);
print $_POST["galaxy"]."\n";
print $_POST["system"]."\n";
$parameters = array_merge(
    [$_POST["galaxy"],
    $_POST["system"]],
    $planetIDs);
$statement->execute($parameters);
print_r($parameters);
print_r($statement);
$results = $statement->fetchAll();
print_r($results);

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

if(count($results) > 0)
{
    foreach($results as $result)
    {
        $sql = "
        SELECT 
            *
        FROM `Players` 
        WHERE
            `mainPlanet` = :id OR
            `colony1` = :id OR
            `colony2` = :id OR
            `colony3` = :id OR
            `colony4` = :id OR
            `colony5` = :id OR
            `colony6` = :id OR
            `colony7` = :id OR
            `colony8` = :id OR
            `colony9` = :id OR
            `colony10` = :id OR
            `colony11` = :id
        ";
        $statement = $pdo->prepare($sql);
        print_r($statement);
        $statement->execute([ "id" => $result[0]]);
        $player = $statement->fetch();
        $planets = [];
        foreach($names as $name)
        {
            if($player[$name])
                array_push($planets, $player[$name]);
        }
        print_r($planets);
        unset($planets[array_search($result[0], $planets)]);
        sort($planets);
        print_r($planets);
        if(count($planets) > 0)
        {
            $sql = "UPDATE `Players` SET `numPlanets`=".count($planets).", ";
            for($i = 0; $i < count($names); $i++)
            {
                if(!isset($planets[$i]))
                {
                    $sql .= "`".$names[$i]."`=null, ";
                }
                else
                {
                    $sql .= "`".$names[$i]."`='".$planets[$i]."', ";
                }
            }
            $sql = substr($sql, 0, strlen($sql)-2)." WHERE `ID`='{$player["ID"]}'";
            $statement = $pdo->prepare($sql);
            print_r($statement);
            if(!$statement->execute())
            {
                print_r($statement->errorInfo());
            }
        }
        else
        {
            $sql = "DELETE FROM `Players` WHERE `ID`='{$player["ID"]}'";
            $statement = $pdo->prepare($sql);
            print_r($statement);
            if(!$statement->execute())
            {
                print_r($statement->errorInfo());
            }
        }

        $sql = "DELETE FROM `Planets` WHERE `ID`='{$result[0]}'";
        $statement = $pdo->prepare($sql);
        print_r($statement);
        if(!$statement->execute())
        {
            print_r($statement->errorInfo());
        }
        else
            $numDeletedPlanets++;
    }
}

// Insert new planets
foreach($planets as $planet)
{
    $sqlHead = "INSERT INTO `Planets` ";
    $sqlColumns = "(";
    $sqlValues = "VALUES (";
    
    foreach($planet as $key => $value)
    {
        if(!is_object($value))
        {
            $sqlColumns .= "`{$key}`, ";
            $sqlValues .= "?, ";
        }
    }
    $sqlColumns = substr($sqlColumns, 0, strlen($sqlColumns)-2).") ";
    $sqlValues = substr($sqlValues, 0, strlen($sqlValues)-2).")";

    $sql = $sqlHead.$sqlColumns.$sqlValues;
    $statement = $pdo->prepare($sql);
    print_r($statement);
    print_r(array_values($planet));
    if($planet["ID"] >= 0 && $statement->execute(array_values($planet)))
        $numInserted++;
    else
    {
        print_r($statement->errorInfo());
        $sql = "
        UPDATE `Planets`
        SET
            `name` = :name,
            `hasMoon` = :hasMoon,
            `moonName` = :moonName,
            `playerID` = :playerID
        WHERE
            `ID` = :ID
        ";
        $statement = $pdo->prepare($sql);
        if($statement->execute([
                "name" => $planet["name"],
                "hasMoon" => $planet["hasMoon"],
                "moonName" => $planet["moonName"],
                "playerID" => $planet["playerID"],
                "ID" => $planet["ID"]
            ]))
        {
            $numUpdatedPlanets++;
        }
        else
        {
            print_r($statement->errorInfo());
        }
    }
    print "<br/>";
}
print "Inserted $numInserted rows\n";
print "Deleted $numDeletedPlanets rows\n";
print "Updated $numUpdatedPlanets rows\n";

?>