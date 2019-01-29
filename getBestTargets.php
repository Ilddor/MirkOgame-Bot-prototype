<?php

$fleetNames = [
    "MT",
    "DT",
    "LM",
    "CM",
    "KR",
    "OW",
    "SK",
    "RE",
    "SS",
    "BO",
    "SL",
    "NI",
    "GS",
    "PA"];

$defenseNames = [
    "WR",
    "LL",
    "CL",
    "DGA",
    "DJ",
    "DP",
    "MO",
    "DO",
    "AN",
    "RM"];

error_reporting(-1);
ini_set('display_errors', 'On');

$pdo = new \PDO('mysql:host=localhost;dbname=********', '********', '********');

//$planets = json_decode($_POST["data"], true);
$settings = json_decode($_POST["data"], true);
$limitRecords = $settings["limit"];
$minGalaxy = $settings["minGalaxy"];
$maxGalaxy = $settings["maxGalaxy"];
$minSystem = $settings["minSystem"];
$maxSystem = $settings["maxSystem"];
$inactiveOnly = $settings["inactiveOnly"];
$maxFleetCount = $settings["maxFleetCount"];
$maxDefenseCount = $settings["maxDefenseCount"];
$scansTime = $settings["scansTime"];
$hours = floor($scansTime);
$minutes = 60 * ($scansTime - $hours);
print $hours.":".$minutes."\n";
$limits = [];
foreach($fleetNames as $fleetName)
{
    $limits[$fleetName] = $settings["limit".$fleetName];
}
foreach($defenseNames as $defenseName)
{
    $limits[$defenseName] = $settings["limit".$defenseName];
}
$currentGalaxy = 2;
$currentSystem = 500;
$currentPlanet = 7;
$speedFactor = 30000;
if(isset($settings["currentGalaxy"]))
    $currentGalaxy = $settings["currentGalaxy"];

if(isset($settings["currentSystem"]))
    $currentSystem = $settings["currentSystem"];

if(isset($settings["currentPlanet"]))
    $currentPlanet = $settings["currentPlanet"];

if(isset($settings["speedFactor"]))
    $speedFactor = $settings["speedFactor"];

$showPartialScans = false;
if(isset($settings["showPartialScans"]))
    $showPartialScans = $settings["showPartialScans"];

$sql = "
SELECT DISTINCT
`Planets`.`ID` as planetID,
`Players`.`nick`,
`Players`.`inactive`,
`Players`.`alliance`,
`Players`.`lastUpdate`,
`Players`.`points`,
`Raports`.`galaxy`,
`Raports`.`system`,
`Raports`.`planet`,
`Raports`.`address`,
`Raports`.`planetName`,
`Raports`.`scanDate`,
`Raports`.`Metal`,
`Raports`.`Krysztal`,
`Raports`.`Deuter`,
`Raports`.`Energia`,
`Raports`.`shipsScanned`,
`Raports`.`defenseScanned`,
`Raports`.`buildingsScanned`,
`Raports`.`researchScanned`,
`Raports`.`MT`,
`Raports`.`DT`,
`Raports`.`LM`,
`Raports`.`CM`,
`Raports`.`KR`,
`Raports`.`OW`,
`Raports`.`SK`,
`Raports`.`RE`,
`Raports`.`SS`,
`Raports`.`BO`,
`Raports`.`SL`,
`Raports`.`NI`,
`Raports`.`GS`,
`Raports`.`PA`,
`Raports`.`DM`,
`Raports`.`SF`,
`Raports`.`AV`,
`Raports`.`GR`,
`Raports`.`ID`,
`Raports`.`WR`,
`Raports`.`LL`,
`Raports`.`CL`,
`Raports`.`DGA`,
`Raports`.`DJ`,
`Raports`.`DP`,
`Raports`.`MO`,
`Raports`.`DO`,
`Raports`.`AS`,
`Raports`.`DGR`,
`Raports`.`OPO`,
`Raports`.`AN`,
`Raports`.`RM`,
(`Raports`.`Metal` + `Raports`.`Krysztal` + `Raports`.`Deuter`) as resourcesToTake,
CASE
    WHEN `Raports`.`galaxy` != $currentGalaxy THEN (SQRT(ABS(`Raports`.`galaxy` - $currentGalaxy) * 20000000 / $speedFactor) * 350 + 10)
    WHEN `Raports`.`system` != $currentSystem THEN (SQRT((ABS(`Raports`.`system` - $currentSystem) * 95000 + 2700000)  / $speedFactor) * 350 + 10)
    WHEN `Raports`.`planet` != $currentPlanet THEN (SQRT((ABS(`Raports`.`planet` - $currentPlanet) * 5000 + 1000000)  / $speedFactor) * 350 + 10)
END as travelTime,
CASE
    WHEN `Raports`.`galaxy` != $currentGalaxy THEN (`Raports`.`Metal` + `Raports`.`Krysztal` + `Raports`.`Deuter`) / (SQRT(ABS(`Raports`.`galaxy` - $currentGalaxy) * 20000000 / $speedFactor) * 350 + 10)
    WHEN `Raports`.`system` != $currentSystem THEN (`Raports`.`Metal` + `Raports`.`Krysztal` + `Raports`.`Deuter`) / (SQRT((ABS(`Raports`.`system` - $currentSystem) * 95000 + 2700000)  / $speedFactor) * 350 + 10)
    WHEN `Raports`.`planet` != $currentPlanet THEN (`Raports`.`Metal` + `Raports`.`Krysztal` + `Raports`.`Deuter`) / (SQRT((ABS(`Raports`.`planet` - $currentPlanet) * 5000 + 1000000)  / $speedFactor) * 350 + 10)
END as resourcesPerSecond
FROM `Raports`
INNER JOIN
    (SELECT `Raports`.address, MAX(`Raports`.scanDate) as latestScanDate
        FROM `Raports`
        GROUP BY `Raports`.address) groupedRaports 
        ON
            (`Raports`.address = groupedRaports.address AND
            `Raports`.scanDate = groupedRaports.latestScanDate)
LEFT JOIN `Planets` ON
    (`Raports`.address = `Planets`.address)
LEFT JOIN `Players` ON
    (`Planets`.playerID = `Players`.ID)
WHERE 
    `Players`.`vacation` = 0 AND
    `Raports`.`scanDate` > DATE_SUB(NOW(), INTERVAL $hours.$minutes HOUR_MINUTE) AND
    `Raports`.`address` NOT IN (SELECT `AttackPending`.`address` FROM `AttackPending` WHERE `AttackPending`.`attackArrival` > NOW()) AND
    `Raports`.`address` NOT IN (SELECT
                                    attacks.address
                                FROM
                                    (
                                    SELECT
                                        `AttackPending`.`address` as address,
                                        COUNT(`AttackPending`.`attackArrival`) as attackCount
                                    FROM
                                        `AttackPending`
                                    WHERE
                                        `AttackPending`.`attackArrival` > DATE_SUB(NOW(), INTERVAL 24 HOUR)
                                        AND `AttackPending`.`attackOrigin` = '[$currentGalaxy:$currentSystem:$currentPlanet]'
                                    GROUP BY
                                        `AttackPending`.`address`
                                    ) as attacks
                                WHERE
                                    attacks.attackCount >= 6) AND
    `Raports`.`galaxy` <= $maxGalaxy AND
    `Raports`.`galaxy` >= $minGalaxy AND
    `Raports`.`system` <= $maxSystem AND
    `Raports`.`system` >= $minSystem
";

if($inactiveOnly)
{
    $sql .= " AND `Players`.`inactive` = 1
    ";
}

if(!$showPartialScans)
{
    $sql .= " AND `Raports`.`shipsScanned` = 1
    AND `Raports`.`defenseScanned` = 1
    ";
}

if(is_numeric($maxFleetCount))
{
    $fleetFields = $fleetNames;
    array_walk($fleetFields, function(&$value, $key) { $value = "`Raports`.`".$value."`"; } );
    $sql .= " AND (".implode("+", $fleetFields).") <= $maxFleetCount
    ";
}

if(is_numeric($maxDefenseCount))
{
    $defenseFields = $defenseNames;
    array_walk($defenseFields, function(&$value, $key) { $value = "`Raports`.`".$value."`"; } );
    $sql .= " AND (".implode("+", $defenseFields).") <= $maxDefenseCount
    ";
}

foreach($limits as $limit => $value)
{
    if(is_numeric($value))
    {
        $sql .= " AND {$limit} <= {$value}
        ";
    }
}

$sql .= " ORDER BY resourcesPerSecond DESC
LIMIT $limitRecords
";

$statement = $pdo->prepare($sql);
$statement->execute();
print_r($statement);
$results = $statement->fetchAll();

//print_r($results);
//print "<date>".$result[0]["scanDate"]."</date>";
print "<table id='result'>\n";
echo "<tr>
<th>Address</th>
<th>Planeta</th>
<th>Nick</th>
<th>Od skanu</th>
<th>Do zdobycia</th>
<th>Czas lotu</th>
<th>Surowiec/s</th>
<th>M/K/D</th>
<th>Flota</th>
<th>Obrona</th>
</tr>";
if(count($results) > 0)
{
    foreach($results as $result)
    {
        $sinceScan = date_diff(date_create($result["scanDate"]), new \DateTime());
        $nick = $result["nick"];

        $fleet = 0;
        $fleetTooltip = "<table>";
        foreach($fleetNames as $fleetName)
        {
            $fleet += $result[$fleetName];
            $val = intval($result[$fleetName]);
            if($result[$fleetName] > 0)
                $fleetTooltip .= "<tr><td>{$fleetName}</td><td>{$val}</td></tr>";
        }
        $fleetTooltip .= "</table>";

        $defense = 0;
        $defenseTooltip = "<table>";
        foreach($defenseNames as $defenseName)
        {
            if($defenseName != "AN" && $defenseName != "RM")
                $defense += $result[$defenseName];
            $val = intval($result[$defenseName]);
            if($result[$defenseName] > 0)
                $defenseTooltip .= "<tr><td>{$defenseName}</td><td>{$val}</td></tr>";
        }
        $defenseTooltip .= "</table>";

        $resourcesAvailable = round(($result["Metal"] + $result["Krysztal"] + $result["Deuter"])/2);
        $MTNeeded = ceil($resourcesAvailable/5000);
        $DTNeeded = ceil($resourcesAvailable/25000);
        $transportersNeeded = "{$MTNeeded}/{$DTNeeded}";

        $flightTime = $result["travelTime"];
        
        $flightTimeStr = sprintf('%02d', floor($flightTime / 3600));
        $flightTime %= 3600;
        $flightTimeStr .= ":".sprintf('%02d', floor($flightTime / 60));
        $flightTime %= 60;
        $flightTimeStr .= ":".sprintf('%02d', $flightTime);

        $resourcesPerSecound = round($result["resourcesPerSecond"], 2);

        $shipsScanned = "!!!";
        if($result["shipsScanned"])
            $shipsScanned = "";

        $defenseScanned = "!!!";
        if($result["defenseScanned"])
            $defenseScanned = "";

        if($result["inactive"])
            $nick .= " (i)";
        $txt = "<tr style='font-size:8px !important'>
        <td class='targetAddress'>{$result["address"]}</td>
        <td class='targetPlanetName'>{$result["planetName"]}</td>
        <td class='targetNick'>{$nick}</td>
        <td class='sinceScan'>{$sinceScan->format('%H:%I:%S')}</td>
        <td class='resourcesAvailable'>{$resourcesAvailable} <br/>({$transportersNeeded})</td>
        <td class='flightTime'>{$flightTimeStr}</td>
        <td class='resPerSec'>{$resourcesPerSecound}</td>
        <td class='targetMKD'>{$result["Metal"]} <br/> {$result["Krysztal"]} <br/> {$result["Deuter"]}</td>
        <td class='targetFleet'><a class='tooltip_sticky' data-tooltip-content='{$fleetTooltip}'>{$fleet} {$shipsScanned}</a></td>
        <td class='targetDefense'><a class='tooltip_sticky' data-tooltip-content='{$defenseTooltip}'>{$defense} {$defenseScanned}</a></td>
        </tr>\n";
        print $txt;
    }
}
print "</table>";

?>