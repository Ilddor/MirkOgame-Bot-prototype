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
    "PA",
    "DM",
    "SF",
    "AV",
    "GR",
    "ID"];

$defenseNames = [
    "WR",
    "LL",
    "CL",
    "DGA",
    "DJ",
    "DP",
    "MO",
    "DO",
    "AS",
    "DGR",
    "OPO",
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
$usePotentialResources = 0;
if(isset($settings["currentGalaxy"]))
    $currentGalaxy = $settings["currentGalaxy"];

if(isset($settings["currentSystem"]))
    $currentSystem = $settings["currentSystem"];

if(isset($settings["currentPlanet"]))
    $currentPlanet = $settings["currentPlanet"];

if(isset($settings["speedFactor"]))
    $speedFactor = $settings["speedFactor"];

if(isset($settings["usePotentialResources"]))
{
    if($settings["usePotentialResources"])
        $usePotentialResources = 1;
}

$showPartialScans = false;
if(isset($settings["showPartialScans"]))
    $showPartialScans = $settings["showPartialScans"];


print $maxFleetCount;
print $maxDefenseCount;

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
`Raports`.`Energia`,
potentials.metal,
potentials.krysztal,
potentials.deuter,
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
(potentials.metal + potentials.krysztal + potentials.deuter) as resourcesToTake,
CASE
    WHEN `Raports`.`galaxy` != $currentGalaxy THEN (SQRT(ABS(`Raports`.`galaxy` - $currentGalaxy) * 20000000 / $speedFactor) * 350 + 10)
    WHEN `Raports`.`system` != $currentSystem THEN (SQRT((ABS(`Raports`.`system` - $currentSystem) * 95000 + 2700000)  / $speedFactor) * 350 + 10)
    WHEN `Raports`.`planet` != $currentPlanet THEN (SQRT((ABS(`Raports`.`planet` - $currentPlanet) * 5000 + 1000000)  / $speedFactor) * 350 + 10)
END as travelTime,
CASE
    WHEN `Raports`.`galaxy` != $currentGalaxy THEN (potentials.metal + potentials.krysztal + potentials.deuter) / (SQRT(ABS(`Raports`.`galaxy` - $currentGalaxy) * 20000000 / $speedFactor) * 350 + 10)
    WHEN `Raports`.`system` != $currentSystem THEN (potentials.metal + potentials.krysztal + potentials.deuter) / (SQRT((ABS(`Raports`.`system` - $currentSystem) * 95000 + 2700000)  / $speedFactor) * 350 + 10)
    WHEN `Raports`.`planet` != $currentPlanet THEN (potentials.metal + potentials.krysztal + potentials.deuter) / (SQRT((ABS(`Raports`.`planet` - $currentPlanet) * 5000 + 1000000)  / $speedFactor) * 350 + 10)
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
LEFT JOIN
    (SELECT
        innerPotentials.address,
        innerPotentials.scanDate,
        CASE
            WHEN NOT($usePotentialResources) THEN innerPotentials.`Metal`
            WHEN innerPotentials.potentialMetal < innerPotentials.maxMetalu THEN FLOOR(innerPotentials.potentialMetal)
            ELSE innerPotentials.maxMetalu
        END as metal,
        CASE
            WHEN NOT($usePotentialResources) THEN innerPotentials.`Krysztal`
            WHEN innerPotentials.potentialKrysztal < innerPotentials.maxKrysztalu THEN FLOOR(innerPotentials.potentialKrysztal)
            ELSE innerPotentials.maxKrysztalu
        END as krysztal,
        CASE
            WHEN NOT($usePotentialResources) THEN innerPotentials.`Deuter`
            WHEN innerPotentials.potentialDeuter < innerPotentials.maxDeuteru THEN FLOOR(innerPotentials.potentialDeuter)
            ELSE innerPotentials.maxDeuteru
        END as deuter
    FROM 
        (SELECT 
            `Raports`.`address`,
            `Raports`.`scanDate`,
            `Raports`.`Metal`,
            `Raports`.`Krysztal`,
            `Raports`.`Deuter`,
            CASE
                WHEN 
                    `Raports`.`buildingsScanned` = 1 
                    THEN `Raports`.`Metal` + (TIME_TO_SEC(TIMEDIFF(NOW(), `Raports`.`scanDate`)) / 3600.0) * (30 * `Raports`.`KopMetalu` * POW(1.1, `Raports`.`KopMetalu`) * 5) 
                ELSE `Raports`.`Metal`
            END as potentialMetal,
            CASE
                WHEN 
                    `Raports`.`buildingsScanned` = 1 
                    THEN `Raports`.`Krysztal` + (TIME_TO_SEC(TIMEDIFF(NOW(), `Raports`.`scanDate`)) / 3600.0) * (20 * `Raports`.`KopKrysztalu` * POW(1.1, `Raports`.`KopKrysztalu`) * 5) 
                ELSE `Raports`.`Krysztal`
            END as potentialKrysztal,
            CASE
                WHEN 
                    `Raports`.`buildingsScanned` = 1 
                    THEN `Raports`.`Deuter` + (TIME_TO_SEC(TIMEDIFF(NOW(), `Raports`.`scanDate`)) / 3600.0) * (10 * `Raports`.`KopDeuteru` * POW(1.1, `Raports`.`KopDeuteru`) * 0.6 * 5) 
                ELSE `Raports`.`Deuter`
            END as potentialDeuter,
            CASE 
                WHEN `Raports`.`MagMetalu` = 0 THEN 16000
                WHEN `Raports`.`MagMetalu` = 1 THEN 32000
                WHEN `Raports`.`MagMetalu` = 2 THEN 64000
                WHEN `Raports`.`MagMetalu` = 3 THEN 120000
                WHEN `Raports`.`MagMetalu` = 4 THEN 224000
                WHEN `Raports`.`MagMetalu` = 5 THEN 408000
                WHEN `Raports`.`MagMetalu` = 6 THEN 752000
                WHEN `Raports`.`MagMetalu` = 7 THEN 1384000
                WHEN `Raports`.`MagMetalu` = 8 THEN 2544000
                WHEN `Raports`.`MagMetalu` = 9 THEN 4672000
                WHEN `Raports`.`MagMetalu` = 10 THEN 8568000
                WHEN `Raports`.`MagMetalu` = 11 THEN 15712000
                WHEN `Raports`.`MagMetalu` = 12 THEN 28808000
                WHEN `Raports`.`MagMetalu` = 13 THEN 52808000
                WHEN `Raports`.`MagMetalu` = 14 THEN 96816000
                WHEN `Raports`.`MagMetalu` = 15 THEN 177480000
                WHEN `Raports`.`MagMetalu` = 16 THEN 325360000
            END as maxMetalu,
            CASE 
                WHEN `Raports`.`MagKrysztalu` = 0 THEN 16000
                WHEN `Raports`.`MagKrysztalu` = 1 THEN 32000
                WHEN `Raports`.`MagKrysztalu` = 2 THEN 64000
                WHEN `Raports`.`MagKrysztalu` = 3 THEN 120000
                WHEN `Raports`.`MagKrysztalu` = 4 THEN 224000
                WHEN `Raports`.`MagKrysztalu` = 5 THEN 408000
                WHEN `Raports`.`MagKrysztalu` = 6 THEN 752000
                WHEN `Raports`.`MagKrysztalu` = 7 THEN 1384000
                WHEN `Raports`.`MagKrysztalu` = 8 THEN 2544000
                WHEN `Raports`.`MagKrysztalu` = 9 THEN 4672000
                WHEN `Raports`.`MagKrysztalu` = 10 THEN 8568000
                WHEN `Raports`.`MagKrysztalu` = 11 THEN 15712000
                WHEN `Raports`.`MagKrysztalu` = 12 THEN 28808000
                WHEN `Raports`.`MagKrysztalu` = 13 THEN 52808000
                WHEN `Raports`.`MagKrysztalu` = 14 THEN 96816000
                WHEN `Raports`.`MagKrysztalu` = 15 THEN 177480000
                WHEN `Raports`.`MagKrysztalu` = 16 THEN 325360000
            END as maxKrysztalu,
            CASE 
                WHEN `Raports`.`MagDeuteru` = 0 THEN 16000
                WHEN `Raports`.`MagDeuteru` = 1 THEN 32000
                WHEN `Raports`.`MagDeuteru` = 2 THEN 64000
                WHEN `Raports`.`MagDeuteru` = 3 THEN 120000
                WHEN `Raports`.`MagDeuteru` = 4 THEN 224000
                WHEN `Raports`.`MagDeuteru` = 5 THEN 408000
                WHEN `Raports`.`MagDeuteru` = 6 THEN 752000
                WHEN `Raports`.`MagDeuteru` = 7 THEN 1384000
                WHEN `Raports`.`MagDeuteru` = 8 THEN 2544000
                WHEN `Raports`.`MagDeuteru` = 9 THEN 4672000
                WHEN `Raports`.`MagDeuteru` = 10 THEN 8568000
                WHEN `Raports`.`MagDeuteru` = 11 THEN 15712000
                WHEN `Raports`.`MagDeuteru` = 12 THEN 28808000
                WHEN `Raports`.`MagDeuteru` = 13 THEN 52808000
                WHEN `Raports`.`MagDeuteru` = 14 THEN 96816000
                WHEN `Raports`.`MagDeuteru` = 15 THEN 177480000
                WHEN `Raports`.`MagDeuteru` = 16 THEN 325360000
            END as maxDeuteru
        FROM `Raports`) innerPotentials) potentials
    ON
		(`Raports`.address = potentials.address AND
        `Raports`.scanDate = potentials.scanDate)
WHERE 
    `Players`.`vacation` = 0 AND
    `Raports`.`scanDate` < DATE_SUB(NOW(), INTERVAL $hours.$minutes HOUR_MINUTE) AND
    `Raports`.`address` NOT IN (SELECT `ScanPending`.`address` FROM `ScanPending`) AND
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
print "<table id='resultRescans'>\n";
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

        $resourcesAvailable = round(($result["metal"] + $result["krysztal"] + $result["deuter"])/2);
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

        if($result["inactive"])
            $nick .= " (i)";
        $txt = "<tr>
        <td>{$result["address"]}</td>
        <td>{$result["planetName"]}</td>
        <td>{$nick}</td>
        <td>{$sinceScan->format('%ad %H:%I:%S')}</td>
        <td>{$resourcesAvailable} <br/>({$transportersNeeded})</td>
        <td class='flightTime'>{$flightTimeStr}</td>
        <td class='resPerSec'>{$resourcesPerSecound}</td>
        <td>{$result["metal"]} <br/> {$result["krysztal"]} <br/> {$result["deuter"]}</td>
        <td><a class='tooltip_sticky' data-tooltip-content='{$fleetTooltip}'>{$fleet}</a></td>
        <td><a class='tooltip_sticky' data-tooltip-content='{$defenseTooltip}'>{$defense}</a></td>
        <td>{$result["planetID"]}</td>
        </tr>\n";
        print $txt;
    }
}
print "</table>";

?>