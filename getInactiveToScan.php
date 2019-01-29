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

//$limitRecords = 10;
//if(isset($_POST["limit"]))
$settings = json_decode($_POST["data"], true);
$limitRecords = $settings["limit"];
$minGalaxy = $settings["minGalaxy"];
$maxGalaxy = $settings["maxGalaxy"];
$minSystem = $settings["minSystem"];
$maxSystem = $settings["maxSystem"];

$sql = 
    "SELECT 
        Planets.address,
        Planets.name,
        Players.nick,
        Planets.ID
        FROM Planets 
        LEFT JOIN Players ON 
            (Planets.ID = Players.mainPlanet OR
            Planets.ID = Players.colony1 OR
            Planets.ID = Players.colony2 OR
            Planets.ID = Players.colony3 OR
            Planets.ID = Players.colony4 OR
            Planets.ID = Players.colony5 OR
            Planets.ID = Players.colony6 OR
            Planets.ID = Players.colony7 OR
            Planets.ID = Players.colony8 OR
            Planets.ID = Players.colony9)
        LEFT JOIN Raports ON (Planets.address = Raports.address)
        WHERE
            Players.inactive = 1 AND
            Raports.address IS NULL AND
            Planets.address NOT IN (SELECT ScanPending.address FROM ScanPending) AND
            Planets.galaxy <= $maxGalaxy AND
            Planets.galaxy >= $minGalaxy AND
            Planets.system <= $maxSystem AND
            Planets.system >= $minSystem
        ORDER BY
            Planets.galaxy,
            Planets.system,
            Planets.planet DESC
        LIMIT $limitRecords";
//print $sql."<br/>";
$result = $conn->query($sql);
if($result->num_rows > 0)
{
    //print "No dziendobry<br/>";
    echo "<table id='resultInactive' border='1'><tr><th>Address</th><th>Planeta</th><th>Nick</th></tr>";
    while($row = $result->fetch_assoc())
    {
        $txt = "<tr><td>".$row["address"]."</td><td>".$row["name"]."</td><td>".$row["nick"]."</td><td>".$row["ID"]."</td>";
        $txt .= "</tr>";
        print $txt;
    }
    echo "</table>";
}
else
{
    print $conn->error;
}

?>