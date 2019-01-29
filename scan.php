<?php

error_reporting(-1);
ini_set('display_errors', 'On');

$servername = "localhost";
$username = "********";
$password = "********";
$dbname = "********";

function json_response($message = null, $code = 200)
{
    // clear the old headers
    header_remove();
    // set the actual code
    http_response_code($code);
    // set the header to make sure cache is forced
    header("Cache-Control: no-transform,public,max-age=300,s-maxage=900");
    // treat this as json
    header('Content-Type: application/json');
    $status = array(
        200 => '200 OK',
        400 => '400 Bad Request',
        422 => 'Unprocessable Entity',
        500 => '500 Internal Server Error'
        );
    // ok, validation error, or failure
    header('Status: '.$status[$code]);
    // return the encoded json
    return json_encode(array(
        'status' => $code < 300, // success or not?
        'message' => $message
        ));
}

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error)
{
    die("Connection failed: " . $conn->connect_error);
} 
echo "Connected successfully<br/>";


//$txt = '[{"address":"[1:190:5]","planetName":"lakukaracza_","scanDate":"2018-12-29T20:26:50.000Z","resources":{"Metal":120000,"Krysztal":64000,"Deuter":52454,"Energia":2184},"ships":{},"defense":{"LL":12},"buildings":{"KopMetalu":18,"KopKrysztalu":17,"KopDeuteru":12,"EleSloneczna":18,"EleFuzyjna":4,"FabRobotow":2,"Stocznia":3,"MagMetalu":3,"MagKrysztalu":2,"MagDeuteru":2,"LabBadawcze":5},"research":{"TechSzpiegowska":3,"TechKomputerowa":3,"TechBojowa":3,"TechOchronna":6,"TechOpancerzenia":3,"TechEnergetyczna":6,"TechNadprzestrzenna":1,"NapSpalinowy":6,"NapImpulsowy":4,"TechLaserowa":6,"TechJonowa":2,"Astrofizyka":1}}]';
$scans = json_decode($_POST["scan"]);
//$scans = json_decode($txt);

$numInserted = 0;
$addresses = [];
foreach($scans as $scan)
{
    $address = $scan->address;
    $address = str_replace(["[","]"], ["",""], $address);
    $address = explode(":", $address);
    print $address[0]." ".$address[1]." ".$address[2];
    $sqlHead = "INSERT INTO `Raports` ";
    $sqlColumns = "(`galaxy`, `system`, `planet`, ";
    $sqlValues = "VALUES ('$address[0]', '$address[1]', '$address[2]', ";
    $scanned = ["ships", "defense", "buildings", "research"];
    array_push($addresses, $scan->address);
    foreach($scanned as $container)
    {
        $sqlColumns .= "`".$container."Scanned`, ";
        if(isset($scan->$container))
            $sqlValues .= "'1', ";
        else
            $sqlValues .= "'0', ";
    }
    foreach($scan as $key => $value)
    {
        if(!is_object($value))
        {
            $sqlColumns .= "`$key`, ";
            $sqlValues .= "'$value', ";
            print "$key => $value<br/>";
        }
        else
        {
            foreach($value as $subKey => $subValue)
            {
                $sqlColumns .= "`$subKey`, ";
                $sqlValues .= "'$subValue', ";
                print "$key.$subKey => $subValue<br/>";
            }
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
        print $conn->error;
    }
    print "\n";
}
print "Inserted $numInserted rows\n";

$pdo = new \PDO('mysql:host=localhost;dbname=********', '********', '********');

// Clearing pending scans
$arraySQL = str_repeat('?,', count($addresses) - 1).'?';
$sql = "
    DELETE FROM
        `ScanPending`
    WHERE
        `address` IN (".$arraySQL.")
";

$statement = $pdo->prepare($sql);
if($statement->execute($addresses))
{
    print "Cleared pending scans\n";
}
else
{
    print "Error clearing pending scans\n";
}

// Clearing pending attacks
/*$arraySQL = str_repeat('?,', count($addresses) - 1).'?';
$sql = "
    DELETE FROM
        `AttackPending`
    WHERE
        `address` IN (".$arraySQL.")
";

$statement = $pdo->prepare($sql);
if($statement->execute($addresses))
{
    print "Cleared pending attacks\n";
}
else
{
    print "Error clearing pending attacks\n";
}*/

//echo json_response(200);
?>