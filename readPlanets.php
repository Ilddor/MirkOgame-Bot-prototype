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

$sql = 
"SELECT `Players`.*, 
    `Planet0`.address as `Planet0.address`,
    `Planet1`.address as `Planet1.address`,
    `Planet2`.address as `Planet2.address`,
    `Planet3`.address as `Planet3.address`,
    `Planet4`.address as `Planet4.address`,
    `Planet5`.address as `Planet5.address`,
    `Planet6`.address as `Planet6.address`,
    `Planet7`.address as `Planet7.address`,
    `Planet8`.address as `Planet8.address`,
    `Planet9`.address as `Planet9.address`,
    `Planet10`.address as `Planet10.address`,
    `Planet11`.address as `Planet11.address`
    FROM `Players` 
        LEFT JOIN `Planets` as `Planet0` ON (`Players`.mainPlanet = `Planet0`.ID) 
        LEFT JOIN `Planets` as `Planet1` ON (`Players`.colony1 = `Planet1`.ID)
        LEFT JOIN `Planets` as `Planet2` ON (`Players`.colony2 = `Planet2`.ID)
        LEFT JOIN `Planets` as `Planet3` ON (`Players`.colony3 = `Planet3`.ID)
        LEFT JOIN `Planets` as `Planet4` ON (`Players`.colony4 = `Planet4`.ID)
        LEFT JOIN `Planets` as `Planet5` ON (`Players`.colony5 = `Planet5`.ID)
        LEFT JOIN `Planets` as `Planet6` ON (`Players`.colony6 = `Planet6`.ID)
        LEFT JOIN `Planets` as `Planet7` ON (`Players`.colony7 = `Planet7`.ID)
        LEFT JOIN `Planets` as `Planet8` ON (`Players`.colony8 = `Planet8`.ID)
        LEFT JOIN `Planets` as `Planet9` ON (`Players`.colony9 = `Planet9`.ID)
        LEFT JOIN `Planets` as `Planet10` ON (`Players`.colony10 = `Planet10`.ID)
        LEFT JOIN `Planets` as `Planet11` ON (`Players`.colony11 = `Planet11`.ID)
    ORDER BY INACTIVE DESC, numPlanets DESC";
//print $sql."<br/>";
$result = $conn->query($sql);
if($result->num_rows > 0)
{
    //print "No dziendobry<br/>";
    echo "<table border='1'><tr><th>Gracze</th><th>Sojusz</th><th>Nieaktywny</th><th>Urlop</th>
    <th>Planeta 0</th>
    <th>Planeta 1</th>
    <th>Planeta 2</th>
    <th>Planeta 3</th>
    <th>Planeta 4</th>
    <th>Planeta 5</th>
    <th>Planeta 6</th>
    <th>Planeta 7</th>
    <th>Planeta 8</th>
    <th>Planeta 9</th>
    <th>Planeta 10</th>
    <th>Planeta 11</th></tr>";
    while($row = $result->fetch_assoc())
    {
        $txt = "<tr><td>".$row["nick"]."</td><td>".$row["alliance"]."</td><td>".$row["inactive"]."</td><td>".$row["vacation"]."</td>";
        for($i = 0; $i < 12; $i++)
        {
            $txt .= "<td>".$row["Planet$i.address"]."</td>";
        }
        $txt .= "</tr>";
        print $txt;
    }
    echo "</table>";
}
else
{
    print $conn->error;
}
print "<br/>";

?>