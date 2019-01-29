// ==UserScript==
// @name         MirkOgame
// @namespace    https://ilddor.com/
// @version      2.2.12
// @updateURL    https://ilddor.com/download/MirkOgame/OneToRuleThemAll.js
// @downloadURL  https://ilddor.com/download/MirkOgame/OneToRuleThemAll.js
// @description  Kill them all!
// @author       Ilddor
// @match        https://mirkogame.pl/game.php*
// @include      https://www.mirkogame.pl/game.php*
// @connect      mirkogame.ilddor.com
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM_xmlHttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

// -----------------------------------------Overrides and extensions here--------------------------------------
let testing = false;

// To make firefox work also...
if (typeof (GM) === "undefined") {
    var GM = {};
    GM.xmlHttpRequest = GM_xmlhttpRequest;
    GM.setValue = GM_setValue;
    GM.getValue = GM_getValue;
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    }
    return decodeURI(results[1]) || 0;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

jQuery.extend
    (
        {
            getValues: function (url) {
                var result = null;
                $.ajax(
                    {
                        url: url,
                        type: 'get',
                        dataType: 'html',
                        async: false,
                        cache: false,
                        success: function (data) {
                            result = data;
                        }
                    });
                return result;
            }
        }
    );

jQuery.extend
    (
        {
            getValuesPostWeird: function (url, postData) {
                var convertThisShit = async function () {
                    var toSend = {};
                    for (var property in postData) {
                        toSend[property] = await postData[property];
                    }
                    return toSend;
                };

                return (async function () {
                    var dataToSend = await convertThisShit();
                    console.log(JSON.stringify(dataToSend));
                    return GM.xmlHttpRequest({
                        method: 'post',
                        url: url,
                        data: "data=" + JSON.stringify(dataToSend),
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        onload: function (response) {
                            console.log(response.responseText);
                        }
                    });
                })();
            }
        }
    );

jQuery.extend
    (
        {
            getValuesPost: function (url, postData) {
                console.log(JSON.stringify(postData));
                return GM.xmlHttpRequest({
                    method: 'post',
                    url: url,
                    data: postData,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    onload: function (response) {
                        console.log(response.responseText);
                    }
                });
            }
        }
    );

function waitForKeyElements(
    selectorTxt,    /* Required: The jQuery selector string that
                            specifies the desired element(s).
                        */
    actionFunction, /* Required: The code to run when elements are
                            found. It is passed a jNode to the matched
                            element.
                        */
    bWaitOnce,      /* Optional: If false, will continue to scan for
                            new elements even after the first match is
                            found.
                        */
    iframeSelector  /* Optional: If set, identifies the iframe to
                            search.
                        */
) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
        targetNodes = $(selectorTxt);
    else
        targetNodes = $(iframeSelector).contents()
            .find(selectorTxt);

    if(bWaitOnce)
    {
        targetNodes = $(targetNodes[0]);
    }

    if (targetNodes && targetNodes.length > 0) {
        btargetsFound = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each(function () {
            var jThis = $(this);
            var alreadyFound = jThis.data('alreadyFound') || false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound = actionFunction(jThis);
                if (cancelFound)
                    btargetsFound = false;
                else
                    jThis.data('alreadyFound', true);
            }
        });
    }
    else {
        btargetsFound = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj = waitForKeyElements.controlObj || {};
    var controlKey = selectorTxt.replace(/[^\w]/g, "_");
    var timeControl = controlObj[controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound && bWaitOnce && timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval(timeControl);
        delete controlObj[controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if (!timeControl) {
            timeControl = setInterval(function () {
                waitForKeyElements(selectorTxt,
                    actionFunction,
                    bWaitOnce,
                    iframeSelector
                );
            },
                300
            );
            controlObj[controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj = controlObj;
}
// -----------------------------------------End of Overrides and extensions------------------------------------

// ----------------------------------------------Classes here--------------------------------------------------
let Settings =
{
    fleetSave: GM.getValue("fleetSave", false),
    keepActive: GM.getValue("keepActive", false),
    autoscanGalaxy: GM.getValue("autoscanGalaxy", false),
    autoscanUniverse: GM.getValue("autoscanUniverse", false),
    scanAttack: GM.getValue("scanAttack", false),
    autorescan: GM.getValue("autorescan", false),
    autoscanInactive: GM.getValue("autoscanInactive", false),
    minGalaxy: GM.getValue("minGalaxy", 1),
    maxGalaxy: GM.getValue("maxGalaxy", 5),
    minSystem: GM.getValue("minSystem", 1),
    maxSystem: GM.getValue("maxSystem", 500),
    rescansLimit: GM.getValue("rescansLimit", 10),
    targetsLimit: GM.getValue("targetsLimit", 10),
    maxFleetCount: GM.getValue("maxFleetCount", "-"),
    maxDefenseCount: GM.getValue("maxDefenseCount", "-"),
    inactiveOnly: GM.getValue("inactiveOnly", false),
    autofarm: GM.getValue("autofarm", false),
    limitMT: GM.getValue("limitMT", "-"),
    limitDT: GM.getValue("limitDT", "-"),
    limitLM: GM.getValue("limitLM", "-"),
    limitCM: GM.getValue("limitCM", "-"),
    limitKR: GM.getValue("limitKR", "-"),
    limitOW: GM.getValue("limitOW", "-"),
    limitSK: GM.getValue("limitSK", "-"),
    limitRE: GM.getValue("limitRE", "-"),
    limitSS: GM.getValue("limitSS", "-"),
    limitBO: GM.getValue("limitBO", "-"),
    limitSL: GM.getValue("limitSL", "-"),
    limitNI: GM.getValue("limitNI", "-"),
    limitGS: GM.getValue("limitGS", "-"),
    limitPA: GM.getValue("limitPA", "-"),
    limitWR:    GM.getValue("limitWR",  "-"),
    limitLL:    GM.getValue("limitLL",  "-"),
    limitCL:    GM.getValue("limitCL",  "-"),
    limitDGA:   GM.getValue("limitDGA", "-"),
    limitDJ:    GM.getValue("limitDJ",  "-"),
    limitDP:    GM.getValue("limitDP",  "-"),
    limitMO:    GM.getValue("limitMO",  "-"),
    limitDO:    GM.getValue("limitDO",  "-"),
    limitAN:    GM.getValue("limitAN",  "-"),
    limitRM:    GM.getValue("limitRM",  "-"),
    additionalMT: GM.getValue("additionalMT", "-"),
    additionalDT: GM.getValue("additionalDT", "-"),
    additionalLM: GM.getValue("additionalLM", "-"),
    additionalCM: GM.getValue("additionalCM", "-"),
    additionalKR: GM.getValue("additionalKR", "-"),
    additionalOW: GM.getValue("additionalOW", "-"),
    additionalSK: GM.getValue("additionalSK", "-"),
    additionalRE: GM.getValue("additionalRE", "-"),
    additionalSS: GM.getValue("additionalSS", "-"),
    additionalBO: GM.getValue("additionalBO", "-"),
    additionalSL: GM.getValue("additionalSL", "-"),
    additionalNI: GM.getValue("additionalNI", "-"),
    additionalGS: GM.getValue("additionalGS", "-"),
    additionalPA: GM.getValue("additionalPA", "-"),
    useMT: GM.getValue("useMT", true),
    scansTime: GM.getValue("scansTime", 2),
    ultraFS: GM.getValue("ultraFS", false),
    aggresiveAutofarm: GM.getValue("aggresiveAutofarm", false),
    usePotentialResources: GM.getValue("usePotentialResources", false),
    checkGalaxy: GM.getValue("checkGalaxy", false),
    showPartialScans: GM.getValue("showPartialScans", false),

    setFleetSave: function (value) { return GM.setValue("fleetSave", value); },
    setKeepActive: function (value) { return GM.setValue("keepActive", value); },
    setAutoscanGalaxy: function (value) { return GM.setValue("autoscanGalaxy", value); },
    setAutoscanUniverse: function (value) { return GM.setValue("autoscanUniverse", value); },
    setScanAttack: function (value) { return GM.setValue("scanAttack", value); },
    setAutorescan: function (value) { return GM.setValue("autorescan", value); },
    setAutoscanInactive: function (value) { return GM.setValue("autoscanInactive", value); },
    setMinGalaxy: function (value) { return GM.setValue("minGalaxy", value); },
    setMaxGalaxy: function (value) { return GM.setValue("maxGalaxy", value); },
    setMinSystem: function (value) { return GM.setValue("minSystem", value); },
    setMaxSystem: function (value) { return GM.setValue("maxSystem", value); },
    setRescansLimit: function (value) { return GM.setValue("rescansLimit", value); },
    setTargetsLimit: function (value) { return GM.setValue("targetsLimit", value); },
    setMaxFleetCount: function (value) { return GM.setValue("maxFleetCount", value); },
    setMaxDefenseCount: function (value) { return GM.setValue("maxDefenseCount", value); },
    setInactiveOnly: function (value) { return GM.setValue("inactiveOnly", value); },
    setAutofarm: function (value) { return GM.setValue("autofarm", value); },
    setLimitMT:         function(value) { return GM.setValue("limitMT", value); },
    setLimitDT:         function(value) { return GM.setValue("limitDT", value); },
    setLimitLM:         function(value) { return GM.setValue("limitLM", value); },
    setLimitCM:         function(value) { return GM.setValue("limitCM", value); },
    setLimitKR:         function(value) { return GM.setValue("limitKR", value); },
    setLimitOW:         function(value) { return GM.setValue("limitOW", value); },
    setLimitSK:         function(value) { return GM.setValue("limitSK", value); },
    setLimitRE:         function(value) { return GM.setValue("limitRE", value); },
    setLimitSS:         function(value) { return GM.setValue("limitSS", value); },
    setLimitBO:         function(value) { return GM.setValue("limitBO", value); },
    setLimitSL:         function(value) { return GM.setValue("limitSL", value); },
    setLimitNI:         function(value) { return GM.setValue("limitNI", value); },
    setLimitGS:         function(value) { return GM.setValue("limitGS", value); },
    setLimitPA:         function(value) { return GM.setValue("limitPA", value); },
    setLimitWR:         function(value) { return GM.setValue("limitWR",  value); },
    setLimitLL:         function(value) { return GM.setValue("limitLL",  value); },
    setLimitCL:         function(value) { return GM.setValue("limitCL",  value); },
    setLimitDGA:        function(value) { return GM.setValue("limitDGA", value); },
    setLimitDJ:         function(value) { return GM.setValue("limitDJ",  value); },
    setLimitDP:         function(value) { return GM.setValue("limitDP",  value); },
    setLimitMO:         function(value) { return GM.setValue("limitMO",  value); },
    setLimitDO:         function(value) { return GM.setValue("limitDO",  value); },
    setLimitAN:         function(value) { return GM.setValue("limitAN",  value); },
    setLimitRM:         function(value) { return GM.setValue("limitRM",  value); },
    setAdditionalMT:    function(value) { return GM.setValue("additionalMT", value); },
    setAdditionalDT:    function(value) { return GM.setValue("additionalDT", value); },
    setAdditionalLM:    function(value) { return GM.setValue("additionalLM", value); },
    setAdditionalCM:    function(value) { return GM.setValue("additionalCM", value); },
    setAdditionalKR:    function(value) { return GM.setValue("additionalKR", value); },
    setAdditionalOW:    function(value) { return GM.setValue("additionalOW", value); },
    setAdditionalSK:    function(value) { return GM.setValue("additionalSK", value); },
    setAdditionalRE:    function(value) { return GM.setValue("additionalRE", value); },
    setAdditionalSS:    function(value) { return GM.setValue("additionalSS", value); },
    setAdditionalBO:    function(value) { return GM.setValue("additionalBO", value); },
    setAdditionalSL:    function(value) { return GM.setValue("additionalSL", value); },
    setAdditionalNI:    function(value) { return GM.setValue("additionalNI", value); },
    setAdditionalGS:    function(value) { return GM.setValue("additionalGS", value); },
    setAdditionalPA:    function(value) { return GM.setValue("additionalPA", value); },
    setUseMT: function(value) { return GM.setValue("useMT", value); },
    setScansTime: function(value) { return GM.setValue("scansTime", value); },
    setUltraFS: function(value) { return GM.setValue("ultraFS", value); },
    setAggresiveAutofarm: function(value) { return GM.setValue("aggresiveAutofarm", value); },
    setUsePotentialResources: function(value) { return GM.setValue("usePotentialResources", value); },
    setCheckGalaxy: function(value) { return GM.setValue("checkGalaxy", value); },
    setShowPartialScans: function(value) { return GM.setValue("showPartialScans", value); },
}



function AutofarmState() 
{
    this.scansToMake = 5;
    this.reportsLoaded = false;
    this.gotBackToFleet = false;
}

let Helpers =
{
    sleep: function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

let FleetNames = 
{
    MT: 202,
    DT: 203,
    LM: 204,
    CM: 205,
    KR: 206,
    OW: 207,
    SK: 208,
    RE: 209,
    SS: 210,
    BO: 211,
    SL: 212,
    NI: 213,
    GS: 214,
    PA: 215,
}

let DefenseNames =
{
    WR: 401,
    LL: 402,
    CL: 403,
    DGA: 404,
    DJ: 405,
    DP: 406,
    MO: 407,
    DO: 408,
    AN: 502,
    RM: 503,
}

let Dates =
{
    parseMonth: function (month) {
        switch (month) {
            case "Sty":
                return 0;
            case "Lut":
                return 1;
            case "Mar":
                return 2;
            case "Kwi":
                return 3;
            case "Maj":
                return 4;
            case "Cze":
                return 5;
            case "Lip":
                return 6;
            case "Sie":
                return 7;
            case "Wrz":
                return 8;
            case "Paź":
                return 9;
            case "Lis":
                return 10;
            case "Gru":
                return 11;
        }
    }
}

let RaportHelpers =
{
    getFieldAcronym: function (name) {
        switch (name) {
            // Resources
            case "Metal":
                return "Metal";
            case "Kryształ":
                return "Krysztal";
            case "Deuter":
                return "Deuter";
            // Ships
            case "Mały Transporter":
                return "MT";
            case "Duży Transporter":
                return "DT";
            case "Lekki Myśliwiec":
                return "LM";
            case "Ciężki Myśliwiec":
                return "CM";
            case "Krążownik":
                return "KR";
            case "Okręt Wojenny":
                return "OW";
            case "Statek Kolonizacyjny":
                return "SK";
            case "Recykler":
                return "RE";
            case "Sonda Szpiegowska":
                return "SS";
            case "Bombowiec":
                return "BO";
            case "Satelita Słoneczny":
                return "SL";
            case "Niszczyciel":
                return "NI";
            case "Gwiazda śmierci":
                return "GS";
            case "Pancernik":
                return "PA";
            case "Dark Moon":
                return "DM";
            case "Star Freighter":
                return "SF";
            case "Avatar":
                return "AV";
            case "Giga-Recykler":
            case "Giga-Recycler":
                return "GR";
            case "Inter. DM-Collector":
                return "ID";
            // Defense
            case "Wyrzutnia Rakiet":
                return "WR";
            case "Lekkie Działo Laserowe":
                return "LL";
            case "Ciężkie Działo Laserowe":
                return "CL";
            case "Działo Gaussa":
                return "DGA";
            case "Działo Jonowe":
                return "DJ";
            case "Działo Plazmowe":
                return "DP";
            case "Mała Powłoka Ochronna":
                return "MO";
            case "Duża Powłoka Ochronna":
                return "DO";
            case "Atmospheric Shield":
                return "AS";
            case "Działo Grawitonowe":
                return "DGR";
            case "Orbitalna Platforma Obronna":
                return "OPO";
            case "Przeciwrakieta":
                return "AN";
            case "Rakieta Międzyplanetarna":
                return "RM";
            // Buildings
            case "Kopalnia Metalu":
                return "KopMetalu";
            case "Kopalnia Kryształu":
                return "KopKrysztalu";
            case "Ekstraktor Deuteru":
                return "KopDeuteru";
            case "Elektrownia Słoneczna":
                return "EleSloneczna";
            case "Uniwersytet":
                return "Uniwersytet";
            case "Elektrownia Fuzyjna":
                return "EleFuzyjna";
            case "Fabryka Robotów":
                return "FabRobotow";
            case "Fabryka Nanitów":
                return "FabNanitow";
            case "Stocznia":
                return "Stocznia";
            case "Magazyn Metalu":
                return "MagMetalu";
            case "Magazyn Kryształu":
                return "MagKrysztalu";
            case "Zbiornik Deuteru":
                return "MagDeuteru";
            case "Laboratorium Badawcze":
                return "LabBadawcze";
            case "Terraformer":
                return "Terraformer";
            case "Depozyt sojuszniczy":
                return "DepSojuszniczy";
            case "Baza Księżycowa":
                return "BazKsiezycowa";
            case "Falanga":
                return "Falanga";
            case "Teleporter":
                return "Teleporter";
            case "Silos Rakietowy":
                return "SilRakietowy";
            // Research
            case "Technologia Szpiegowska":
                return "TechSzpiegowska";
            case "Technologia Komputerowa":
                return "TechKomputerowa";
            case "Technologia Bojowa":
                return "TechBojowa";
            case "Technologia Ochronna":
                return "TechOchronna";
            case "Technologia Opancerzenia":
                return "TechOpancerzenia";
            case "Technologia Energetyczna":
                return "TechEnergetyczna";
            case "Technologia Nadprzestrzenna":
                return "TechNadprzestrzenna";
            case "Napęd spalinowy":
            case "Napęd Spalinowy":
                return "NapSpalinowy";
            case "Napęd Impulsowy":
                return "NapImpulsowy";
            case "Napęd Nadprzestrzenny":
                return "NapNadprzestrzenny";
            case "Technologia Laserowa":
                return "TechLaserowa";
            case "Technologia Jonowa":
                return "TechJonowa";
            case "Technologia Plazmowa":
                return "TechPlazmowa";
            case "Międzygalaktyczna Sieć Badań":
                return "MSB";
            case "Astrofizyka":
                return "Astrofizyka";
            case "Technologia Produkcji Metalu":
                return "TechProdMetalu";
            case "Technologia Produkcji Kryształu":
                return "TechProdKrysztalu";
            case "Technologia Produkcji Deuterium":
                return "TechProdDeuterium";
            case "Rozwój Grawitonów":
                return "RozGrawitonow";
            default:
                return name;
        }
    }
}

let Misc =
{
    spyPlanet: function (missionID, planetID, onSuccess, onFailure, galaxy, system) {
        console.log("spyPlanet function start");
        $.getJSON("game.php?page=fleetAjax&ajax=1&mission=" + missionID + "&planetID=" + planetID, function (data) {
            console.log("spyPlanet return function");
            if (data.code == 600) {
                onSuccess();
            }
            else {
                onFailure(data.mess);
                //alert(data.mess + "\nKliknij w adres po lewej od przycisku skanuj aby odświeżyć informacje o tej planecie i użytkowniku");
            }
        });
    },

    maxShip: function (id) {
        if (document.getElementsByName(id)[0]) {
            var amount = document.getElementById(id + "_value").innerHTML;
            document.getElementsByName(id)[0].value = amount.replace(/\./g, "");
        }
    },

    maxShips: function () {
        $('input[name^="ship"]').each(function () {
            Misc.maxShip($(this).attr('name'));
        })
    },

    parseDate: function (dateString) {
        var day = dateString.substring(0, dateString.indexOf(". "));
        var monthStr = dateString.substring(dateString.indexOf(". ") + 2, dateString.indexOf(". ") + 5);
        var month = Dates.parseMonth(monthStr);
        var year = dateString.substring(dateString.indexOf(monthStr) + 4, dateString.indexOf(monthStr) + 8);
        var time = dateString.substring(dateString.indexOf(year) + 6, dateString.length);
        return new Date(year + "-" + (("0" + (month + 1)).slice(-2)) + "-" + day + "T" + time);
    },

    getCurrentPlanet: function() {
        var planetSelector = document.querySelector("#planetSelector");
        var currentPlanet = planetSelector.querySelector("option[value]:checked");
        var currentAddressGalaxy = currentPlanet.innerHTML.split("[")[1].split("]")[0];
        return currentAddressGalaxy.split(":");
    }
}

let Overview =
{
    createSeparateFlightReturnTables: function (table519) {
        var overviewTab = table519;
        var nowosciTR = overviewTab.querySelectorAll("tr")[4];

        var flights = overviewTab.querySelectorAll("span.flight");
        var returns = overviewTab.querySelectorAll("span.return");

        var flightReturnTR = document.createElement("tr");
        nowosciTR.after(flightReturnTR);

        var flightReturnTD = document.createElement("td");
        $(flightReturnTD).attr("colspan", "3");
        flightReturnTR.append(flightReturnTD);

        var flightReturnTable = document.createElement("table");
        flightReturnTD.append(flightReturnTable);

        var flightReturnFirstTR = document.createElement("tr");
        flightReturnTable.append(flightReturnFirstTR);

        // Flights
        var flightTD = document.createElement("td");
        flightReturnFirstTR.append(flightTD);

        var flightTable = document.createElement("table");
        flightTD.append(flightTable);
        flightTable.append(document.createElement("tr"));
        flightTable.lastChild.append(document.createElement("th"));
        $(flightTable.lastChild.lastChild).attr("colspan", 3);
        flightTable.lastChild.lastChild.append(document.createTextNode("Odloty"));
        flights.forEach(flight => {
            var tr = flight.parentElement.parentElement;
            tr.parentElement.removeChild(tr);
            flightTable.append(tr);

            var mission = flight.textContent.substring(flight.textContent.indexOf("Misja:"), flight.textContent.length);
            var As = flight.querySelectorAll("a");
            As[0].innerHTML = "Flota";
            if ($(flight).hasClass("attack") || $(flight).hasClass("espionage"))
                flight.innerHTML = As[0].outerHTML + " " + As[2].outerHTML + " --> " + As[3].outerHTML + " " + mission;
            else
                flight.innerHTML = As[0].outerHTML + " " + As[1].outerHTML + " --> " + As[2].outerHTML + " " + mission;
        });

        // Arrivals
        var returnTD = document.createElement("td");
        flightReturnFirstTR.append(returnTD);

        var returnTable = document.createElement("table");
        returnTD.append(returnTable);
        returnTable.append(document.createElement("tr"));
        returnTable.lastChild.append(document.createElement("th"));
        $(returnTable.lastChild.lastChild).attr("colspan", 3);
        returnTable.lastChild.lastChild.append(document.createTextNode("Przyloty"));
        returns.forEach(returnFlight => {
            var tr = returnFlight.parentElement.parentElement;
            tr.parentElement.removeChild(tr);
            returnTable.append(tr);

            var mission = returnFlight.textContent.substring(returnFlight.textContent.indexOf("Misja:"), returnFlight.textContent.length);
            var As = returnFlight.querySelectorAll("a");
            As[0].innerHTML = "Flota";
            if (As.length == 3) {
                returnFlight.innerHTML = As[0].outerHTML + " " + As[1].outerHTML + " --> " + As[2].outerHTML + " " + mission;
            }
            else {
                returnFlight.innerHTML = As[0].outerHTML + " " + As[1].outerHTML + " --> " + As[2].outerHTML + " Misja: " + As[3].outerHTML;
            }
        })
    },

    createSummaryInfo: function (table519) {
        var overviewTab = table519;
        overviewTab.style.setProperty("width", "auto", "important");
        var tooltips = overviewTab.querySelectorAll(".return a.tooltip");
        console.log(tooltips.length);
        var metal = 0;
        var crystal = 0;
        var deuterium = 0;
        var fleet = {};
        for (var i = 0; i < tooltips.length; i++) {
            if (tooltips[i].parentElement.innerHTML.indexOf("wraca") > 0) {
                var tooltipString = $(tooltips[i]).attr("data-tooltip-content");
                var parsed = new DOMParser().parseFromString(tooltipString, "text/xml");
                var resourcesTRs = parsed.querySelectorAll("tr");
                for (var j = 0; j < resourcesTRs.length; j++) {
                    var resourcesTDs = resourcesTRs[j].querySelectorAll("td");
                    if (resourcesTDs[0].innerHTML == "Metal") {
                        metal += parseInt(resourcesTDs[1].innerHTML.replaceAll(".", ""));
                    }
                    if (resourcesTDs[0].innerHTML == "Kryształ") {
                        crystal += parseInt(resourcesTDs[1].innerHTML.replaceAll(".", ""));
                    }
                    if (resourcesTDs[0].innerHTML == "Deuter") {
                        deuterium += parseInt(resourcesTDs[1].innerHTML.replaceAll(".", ""));
                    }
                }
            }
            if (tooltips[i].innerHTML == "Floty" && tooltips[i].parentElement.innerHTML.indexOf("wraca") > 0) {
                tooltipString = $(tooltips[i]).attr("data-tooltip-content");
                parsed = new DOMParser().parseFromString(tooltipString, "text/xml");
                var fleetNoTRs = parsed.querySelectorAll("tr");
                for (j = 0; j < fleetNoTRs.length; j++) {
                    var fleetTDs = fleetNoTRs[j].querySelectorAll("td");
                    if (fleet[fleetTDs[0].innerHTML] == null) {
                        fleet[fleetTDs[0].innerHTML] = 0;
                    }
                    fleet[fleetTDs[0].innerHTML] += parseInt(fleetTDs[1].innerHTML);
                }
            }
        }
        console.log(fleet);
        var fleetTRs = overviewTab.querySelectorAll("tr td div.fleets");
        var newTR = document.createElement("tr");
        newTR.append(document.createElement("td"));
        // Fleet
        var newTD = document.createElement("td");
        var newTab = document.createElement("table");
        for (i = 0; i < Object.values(fleet).length; i++) {
            var fleetTR = document.createElement("tr");
            var fleetTD = document.createElement("td");
            fleetTD.append(document.createTextNode(Object.keys(fleet)[i]));
            fleetTR.append(fleetTD);
            fleetTD = document.createElement("td");
            fleetTD.append(document.createTextNode(Object.values(fleet)[i]));
            fleetTR.append(fleetTD);
            newTab.append(fleetTR);
        }
        newTD.append(newTab);
        newTR.append(newTD);

        // Resources
        newTD = document.createElement("td");
        newTab = document.createElement("table");
        for (i = 0; i < 3; i++) {
            var resTR = document.createElement("tr");
            switch (i) {
                case 0:
                    var resTD = document.createElement("td");
                    resTD.append(document.createTextNode("Metal"));
                    resTR.append(resTD);
                    resTD = document.createElement("td");
                    resTD.append(document.createTextNode(metal));
                    resTR.append(resTD);
                    break;
                case 1:
                    resTD = document.createElement("td");
                    resTD.append(document.createTextNode("Kryształ"));
                    resTR.append(resTD);
                    resTD = document.createElement("td");
                    resTD.append(document.createTextNode(crystal));
                    resTR.append(resTD);
                    break;
                case 2:
                    resTD = document.createElement("td");
                    resTD.append(document.createTextNode("Deuter"));
                    resTR.append(resTD);
                    resTD = document.createElement("td");
                    resTD.append(document.createTextNode(deuterium));
                    resTR.append(resTD);
                    break;
            }
            newTab.append(resTR);
        }
        newTD.append(newTab);
        newTR.append(newTD);
        fleetTRs[fleetTRs.length - 1].parentElement.parentElement.after(newTR);
        console.log(metal);
        console.log(crystal);
        console.log(deuterium);
    }
}

let FleetSave =
{
    addFleetSaveButton: function () {
        var fleetButton = document.querySelector("a[href='game.php?page=changelog'").parentElement;
        var aSaveElement = document.createElement("a");
        var planetSelector = document.querySelector("#planetSelector");
        var currentPlanet = planetSelector.querySelector("option[value]:checked");
        var currentAddressGalaxy = currentPlanet.innerHTML.split("[")[1].substr(0, 2);
        var targetSave = document.evaluate("//option[contains(.,'" + currentAddressGalaxy + "') and not(@selected)]", planetSelector, null, XPathResult.ANY_TYPE, null).iterateNext();
        if (!targetSave) {
            targetSave = planetSelector.querySelector("option[value]:not(:checked)");
        }
        var address = targetSave.innerHTML.split("[")[1].replace("]", "").split(":");
        $(aSaveElement).attr("href", "game.php?page=fleetTable&galaxy=" + address[0] + "&system=" + address[1] + "&planet=" + address[2] + "&target_mission=4");
        $(aSaveElement).on("click", async function () { await Settings.setFleetSave(true); });
        aSaveElement.append(document.createTextNode("Ratuj flotę"));
        var saveFleetButton = document.createElement("div");
        saveFleetButton.append(aSaveElement);
        fleetButton.after(saveFleetButton);

        var aRestartElement = document.createElement("a");
        $(aRestartElement).attr("href", window.location);
        $(aRestartElement).on("click", async function () { await Settings.setFleetSave(false); });
        Settings.fleetSave.then(function (isFleetSave) {
            aRestartElement.append(document.createTextNode("Resetuj \"Ratuj flotę\" (" + isFleetSave + ")"));
        });
        var restartButton = document.createElement("div");
        restartButton.append(aRestartElement);
        saveFleetButton.after(restartButton);

        var keepActiveElement = $("<a/>").attr("href", window.location);
        Settings.keepActive.then(function (isKeepActive) {
            if (isKeepActive) {
                keepActiveElement.on("click", async function () { await Settings.setKeepActive(false); }).text("Wyłącz autoaktywność");
            }
            else {
                keepActiveElement.on("click", async function () { await Settings.setKeepActive(true); }).text("Włącz autoaktywność");
            }
        });
        keepActiveElement.wrap("<div/>");
        $(restartButton).after(keepActiveElement.parent());
    },

    fleetTable: function (table519) {
        Settings.fleetSave.then(function (isFleetSave) {
            if (isFleetSave) {
                var form = table519[0].parentElement;
                //$(form).attr("action", $(form).attr("action")+"&fleetSave=1");
                maxShips();
                console.log("Dziendobry");
                $(form).submit();
            }
        });

        Settings.setUltraFS(false);

        $(".fleets").each(function() {
            var buttonFS = $("<input type='button' class='fleetSave'/>").val("FleetSave");
            buttonFS.wrap("<form/>").parent().appendTo($($(this).parent().children().last()));
            var ships = $($(this).parent().children()[2]).find("a").attr("data-tooltip-content");
            var timer = $(this);
            console.log(ships);
            var parsedShips = new DOMParser().parseFromString(ships, "text/html");
            console.log(parsedShips);
            console.log(buttonFS[0]);

            // Why oh why do I need this fucking sleep, why isn't it working without it...
            Helpers.sleep(2000).then(function () {
                buttonFS.on("click", function() {
                    console.log("Hej");
                    var TRs = parsedShips.querySelectorAll("tr");
                    maxShips();
                    TRs.forEach(function (tr, index) {
                        if(index > 0)
                        {
                            var shipNameLong = $(tr).children()[0].innerHTML;
                            var ship = RaportHelpers.getFieldAcronym(shipNameLong.substring(0, shipNameLong.length-1));
                            var count = parseInt($(tr).children()[1].innerHTML);
                            var shipInput = $("#ship"+FleetNames[ship]+"_input");
                            console.log("Setting "+ship+" "+(parseInt(shipInput.val())+count));
                            shipInput.val(parseInt(shipInput.val())+count);
                        }
                    });
                    Settings.setUltraFS(parseInt(timer.attr("data-fleet-end-time"))).then(function () {
                        var form = table519[0].parentElement;
                        $(form).submit();
                    });
                });
            });
        });

        Object.keys(FleetNames).forEach(function(ship,index) {
            if($("#ship"+FleetNames[ship]+"_value").length == 0) 
            {
                var TR =  $("<tr hidden/>").appendTo($(table519[0]));
                TR.append($("<td/>").text(ship));
                TR.append($("<td id='ship"+FleetNames[ship]+"_value'/>").text("0"));
                TR.append($("<input name='ship"+FleetNames[ship]+"' id='ship"+FleetNames[ship]+"_input' value='0'/>").wrap("<td/>").parent());
            }
        }); 
    },

    fleetStep1: function (table519) {
        Settings.fleetSave.then(function (isFleetSave) {
            if (isFleetSave) {
                var speedParam = document.querySelector("#speed");
                $(speedParam).val("1");
                var form = table519[0].parentElement;
                $(form).submit();
            }
        });

        Settings.ultraFS.then(function(value) {
            if(value != false)
            {
                var storageTR = $("#storage").parent();

                var instruction = $("<td colspan='2'/>").attr("style", "color:red");
                instruction.text("Ustaw planete na którą chcesz uciec lecącą flotą, jeśli masz recykler - polecam wybrac pole zniszczeń na tej samej planecie, będzie taniej. Jak będziesz gotowy, przejdź dalej, tam ustawisz surowce do zabrania a skrypt zrobi reszte");
                storageTR.after(instruction.wrap("<tr/>"));

                var timerTR = $("<tr/>");
                instruction.after(timerTR);
                timerTR.append($("<td/>").text("Czas przylotu floty"));
                var arrivalDate = new Date(value*1000);
                timerTR.append($("<td/>").text(arrivalDate));

                var nowTR = $("<tr/>");
                timerTR.after(nowTR);
                nowTR.append($("<td/>").text("Aktualny czas"));
                var nowTD = $("<td/>").appendTo(nowTR);
                window.setInterval(function(){
                    nowTD.text(new Date());
                },10);
            }
        });
    },

    fleetStep2: function (table519) {
        Settings.fleetSave.then(function (isFleetSave) {
            if (isFleetSave) {
                var form = table519[0].parentElement;
                var a = document.querySelector("a[href='javascript:maxResources()']");
                a.innerHTML = "<p>" + a.innerHTML + "</p>";
                var p = $("a[href='javascript:maxResources()'] p");
                p.trigger("click");
                $(form).submit();
            }
        });

        Settings.ultraFS.then(function(value) {
            if(value != false)
            {
                var table = $(table519[0]);

                var instruction = $("<td colspan='2'/>").attr("style", "color:red");
                instruction.text("Ustaw typ misji, wybierz surowce do zabrania i czekaj aż licznik wybije odpowiedni czas, skrypt sam kliknie submit w 1.1s po przylocie floty (czyli 0.1 na serwerze bo flota liczona jest w kolejnej sekundzie).\nPowodzenia!");
                table.append(instruction.wrap("<tr/>"));

                var timerTR = $("<tr/>");
                table.append(timerTR);
                timerTR.append($("<td/>").text("Czas przylotu floty"));
                var arrivalDate = new Date(value*1000);
                timerTR.append($("<td/>").text(arrivalDate));

                var nowTR = $("<tr/>");
                timerTR.after(nowTR);
                nowTR.append($("<td/>").text("Aktualny czas"));
                var nowTD = $("<td/>").appendTo(nowTR);
                var submit = true;
                window.setInterval(function(){
                    var nowDate = new Date();
                    nowTD.text(nowDate);
                    if(nowDate.getTime() > (arrivalDate.getTime()+1100) && submit)
                    {
                        console.log("Co jest?");
                        table.parent().submit();
                        submit = false;
                    }
                },100);
            }
        });
    },

    fleetStep3: function (table519) {
        Settings.fleetSave.then(function (isFleetSave) {
            if (isFleetSave) {
                Settings.setFleetSave(false);
            }
        });
    }
}

let KeepActive =
{
    work: async function () {
        var pbox = document.querySelector("#pbox");
        var targetSave = document.evaluate(
            "//div[contains(concat(' ', @class, ' '), ' pbox ') and not(contains(@style,'background: #540202'))]",
            pbox,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null);

        Settings.keepActive.then(function (isKeepActive) {
            if (isKeepActive) {
                console.log("Autoaktywność włączona")
                setTimeout(function () {
                    console.log("Zmieniam planete!");
                    var tmp = targetSave.snapshotItem(Math.random() * targetSave.snapshotLength);
                    console.log(tmp);
                    $(tmp).click();
                    //window.location.reload(1);
                }, ((Math.random() * 10) + 10) * 1000);
            }
        });
    }
}

let Messages =
{
    parseResources: function (scan, cells) {
        scan.resources = {};
        for (var i = 0; i < cells.length; i += 2) {
            scan.resources[RaportHelpers.getFieldAcronym(cells[i].textContent)] = parseInt(cells[i + 1].innerHTML.replaceAll(".", ""));
        }
    },

    parseShips: function (scan, cells) {
        scan.ships = {};
        for (var i = 0; i < cells.length; i += 2) {
            scan.ships[RaportHelpers.getFieldAcronym(cells[i].textContent)] = parseInt(cells[i + 1].innerHTML.replaceAll(".", ""));
        }
    },

    parseDefense: function (scan, cells) {
        scan.defense = {};
        for (var i = 0; i < cells.length; i += 2) {
            scan.defense[RaportHelpers.getFieldAcronym(cells[i].textContent)] = parseInt(cells[i + 1].innerHTML.replaceAll(".", ""));
        }
    },

    parseBuildings: function (scan, cells) {
        scan.buildings = {};
        for (var i = 0; i < cells.length; i += 2) {
            scan.buildings[RaportHelpers.getFieldAcronym(cells[i].textContent)] = parseInt(cells[i + 1].innerHTML.replaceAll(".", ""));
        }
    },

    parseResearch: function (scan, cells) {
        scan.research = {};
        for (var i = 0; i < cells.length; i += 2) {
            scan.research[RaportHelpers.getFieldAcronym(cells[i].textContent)] = parseInt(cells[i + 1].innerHTML.replaceAll(".", ""));
        }
    },

    parseSpyRaport: function (raport) {
        var scan = {};
        console.log(raport);

        // Raport head: planet name, address, scan date
        var raportHeadStr = raport.querySelector(".spyRaportHead a").innerHTML;
        scan.address = raportHeadStr.substring(raportHeadStr.indexOf("["), raportHeadStr.indexOf("]") + 1);
        scan.planetName = raportHeadStr.substring(19, raportHeadStr.indexOf("(") - 1);
        var weirdFormatDate = raportHeadStr.substring(raportHeadStr.indexOf("] na ") + 5, raportHeadStr.length);
        var day = weirdFormatDate.substring(0, weirdFormatDate.indexOf(". "));
        var monthStr = weirdFormatDate.substring(weirdFormatDate.indexOf(". ") + 2, weirdFormatDate.indexOf(". ") + 5);
        var month = Dates.parseMonth(monthStr);
        var year = weirdFormatDate.substring(weirdFormatDate.indexOf(monthStr) + 4, weirdFormatDate.indexOf(monthStr) + 8);
        var time = weirdFormatDate.substring(weirdFormatDate.indexOf(year) + 6, weirdFormatDate.length);
        scan.scanDate = year + "-" + (("0" + (month + 1)).slice(-2)) + "-" + day + "T" + time;

        var raportContainers = raport.querySelectorAll(".spyRaportContainer");
        for (var i = 0; i < raportContainers.length; i++) {
            var container = raportContainers[i].querySelector(".spyRaportContainerHead").innerHTML;
            var containerCells = [];
            for (var j = 0; j < raportContainers[i].children.length; j++) {
                if ($(raportContainers[i].children[j]).is(".spyRaportContainerRow")) {
                    containerCells = containerCells.concat(...raportContainers[i].children[j].querySelectorAll(".spyRaportContainerRow .spyRaportContainerCell"));
                }
            }
            //var containerCells = raportContainers[i].querySelectorAll(".spyRaportContainerRow:not(.SpyRaportContainer) .spyRaportContainerCell");
            //console.log(containerCells);
            //console.log(container+" "+containerCells.length);
            switch (container) {
                case "Zasoby":
                    Messages.parseResources(scan, containerCells);
                    break;
                case "Statki":
                    Messages.parseShips(scan, containerCells);
                    break;
                case "Obrona Planetarna":
                    Messages.parseDefense(scan, containerCells);
                    break;
                case "Budynki":
                    Messages.parseBuildings(scan, containerCells);
                    break;
                case "Badania":
                    Messages.parseResearch(scan, containerCells);
                    break;
            }
            containerCells = [];
        }

        return scan;
    },

    addCopyAllButton: function (messagesTable) {
        var messages = messagesTable[0];
        var raports = document.querySelectorAll('.spyRaport');
        var scans = [];
        for (var i = 0; i < raports.length; i++) {
            scans.push(Messages.parseSpyRaport(raports[i]));
            var spyRaportTR = $(raports[i]).parent().parent();
            var messageID = spyRaportTR.attr("class").replace("messages_body ", "");
            $("#"+messageID).children().first().children().first().attr('checked','checked')
            console.log($("#"+messageID)[0]);
        }

        messages.innerHTML = "<input type=\"button\" id=\"copyAllBtn\" value=\"Copy All\" />" + messages.innerHTML;
        var copyAllBtn = document.querySelector("#copyAllBtn");
        if (copyAllBtn) {
            copyAllBtn.addEventListener("click", function () {
                //copyToClip(toCopy);
                console.log(scans);
                GM.xmlHttpRequest({
                    method: "POST",
                    url: "https://mirkogame.ilddor.com/scan.php",
                    data: "scan=" + JSON.stringify(scans),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    onload: function (response) {
                        console.log("Mysql:");
                        console.log(response.responseText);
                        $(copyAllBtn).attr("value", "Copied").attr("style", "color:lime");
                        
                        // Delete selected
                        $("select[name='actionTop']").val("deletemarked");
                        $("input[name='submitTop']").click();
                    }
                });
            }, false);
        }
    }
}

let Galaxy =
{
    makeRichView: function (table569) {
        var galaxyTab = table569;
        table569.style.setProperty("width", "auto", "important");
        var tooltips = galaxyTab.querySelectorAll(".tooltip_sticky");
        for (var i = 0; i < tooltips.length; i++) {
            var tooltipString = $(tooltips[i]).attr("data-tooltip-content");
            var parsed = new DOMParser().parseFromString(tooltipString, "text/html");
            var player = parsed.querySelector("th").innerHTML;
            if (player.indexOf("Gracz") == 0) {
                var playerIDMatch = tooltipString.match(/Playercard\([0-9]+\)/);
                var playerID = -1;
                if (playerIDMatch) {
                    playerID = parseInt(playerIDMatch[0].replace("Playercard(", "").replace(")"));
                }
                var playerCard = $.getValues('game.php?page=playerCard&id=' + playerID);
                var parsedPlayercard = new DOMParser().parseFromString(playerCard, "text/html");
                var trs = parsedPlayercard.querySelectorAll("tr");
                var fleet = -1;
                var def = -1;
                var tds;
                for (var j = 0; j < trs.length; j++) {
                    if (trs[j].innerHTML.indexOf("Flota") != -1) {
                        tds = trs[j].querySelectorAll("td");
                        fleet = parseInt(tds[1].innerHTML.replaceAll(".", ""));
                    }
                    if (trs[j].innerHTML.indexOf("Obrona") != -1) {
                        tds = trs[j].querySelectorAll("td");
                        def = parseInt(tds[1].innerHTML.replaceAll(".", ""));
                    }
                }
                var positionIndex = player.indexOf("pozycja w rankingu ") + 19;
                var position = player.substring(positionIndex, player.length);
                tooltips[i].innerHTML += "<br/>(P: " + position + " ID: " + playerID + " Fleet: " + fleet + " Def: " + def + ")";
            }
        }
    },

    addAutoscanButtons: function () {
        // Galaxy scan button
        var systemTab = document.querySelector("input[name='systemRight'").parentElement.parentElement.parentElement;

        var autoscanGalaxyTR = document.createElement("tr");
        systemTab.append(autoscanGalaxyTR);

        var autoscanGalaxyTD = document.createElement("td");
        $(autoscanGalaxyTD).attr("colspan", "3");
        autoscanGalaxyTR.append(autoscanGalaxyTD)

        var autoscanGalaxyButton = document.createElement("input");
        $(autoscanGalaxyButton).attr("type", "button");
        $(autoscanGalaxyButton).attr("value", "Autoskan galaktyki");
        $(autoscanGalaxyButton).on("click", async function () {
            var galaxyForm = document.querySelector("#galaxy_form");
            $(galaxyForm.querySelector("input[name='system']")).val(1);
            galaxyForm.submit();
            Settings.setAutoscanGalaxy(true);
            //await GM.setValue("autoscanGalaxy", true); 
        });
        autoscanGalaxyTD.append(autoscanGalaxyButton);

        console.log(systemTab);

        // Universe scan button
        var galaxyTab = document.querySelector("input[name='galaxyRight'").parentElement.parentElement.parentElement;

        var autoscanUniverseTR = document.createElement("tr");
        galaxyTab.append(autoscanUniverseTR);

        var autoscanUniverseTD = document.createElement("td");
        $(autoscanUniverseTD).attr("colspan", "3");
        autoscanUniverseTR.append(autoscanUniverseTD)

        var autoscanUniverseButton = document.createElement("input");
        $(autoscanUniverseButton).attr("type", "button");
        $(autoscanUniverseButton).attr("value", "Autoskan uniwersum");
        $(autoscanUniverseButton).on("click", async function () {
            var galaxyForm = document.querySelector("#galaxy_form");
            $(galaxyForm.querySelector("input[name='galaxy']")).val(1);
            $(galaxyForm.querySelector("input[name='system']")).val(1);
            galaxyForm.submit();
            Settings.setAutoscanUniverse(true);
            //await GM.setValue("autoscanUniverse", true); 
        });
        autoscanUniverseTD.append(autoscanUniverseButton);

        console.log(galaxyTab);
    },

    scanSystem: async function (table659) {
        var galaxyForm = document.querySelector("#galaxy_form");
        var galaxy = parseInt($(galaxyForm.querySelector("input[name='galaxy']")).val());
        var system = parseInt($(galaxyForm.querySelector("input[name='system']")).val());
        var galaxyTab = table659;
        var planetsTRs = galaxyTab.querySelectorAll("tr");
        var planets = [];
        var players = [];
        for (var i = 0; i < planetsTRs.length; i++) {
            // Planet
            var planet = {};
            if (planetsTRs[i].querySelectorAll(".tooltip_sticky").length == 0)
                continue;

            var TDs = planetsTRs[i].querySelectorAll("td");
            var planetID = -1;
            var spy = TDs[7].querySelector("a");
            if (spy) {
                planetID = parseInt($(spy).attr("href").split(",")[1]);
            }
            var planetNo = parseInt(TDs[0].textContent);
            var planetTooltip = $(TDs[1].querySelector(".tooltip_sticky")).attr("data-tooltip-content");
            var planetTooltipStr = new DOMParser().parseFromString(planetTooltip, "text/html").querySelector("th").textContent;
            var planetName = planetTooltipStr.substring(8, planetTooltipStr.indexOf(" ["));
            var hasMoon = TDs[3].querySelectorAll(".tooltip_sticky").length > 0;
            if (hasMoon)
                var moonName = $(TDs[3].querySelector("img")).attr("alt");
            console.log(`Found planet: ${planetID} ${galaxy}:${system}:${planetNo} ${planetName} ${hasMoon} ${moonName}`);
            planet.ID = planetID;
            planet.galaxy = galaxy;
            planet.system = system;
            planet.planet = planetNo;
            planet.address = `[${galaxy}:${system}:${planetNo}]`;
            planet.name = planetName;
            planet.hasMoon = hasMoon;
            if (hasMoon)
                planet.moonName = moonName;
            else
                planet.moonName = null;
            //if(planetID != -1)


            // Player
            if (planetID != -1) {
                var player = {};
                var playerID = -1;
                var playerTooltip = TDs[5].querySelector(".tooltip_sticky");
                if (playerTooltip) {
                    var tooltipString = $(playerTooltip).attr("data-tooltip-content");
                    //console.log(tooltipString);
                    //var parsed = new DOMParser().parseFromString(tooltipString, "text/xml");
                    var playerIDMatch = tooltipString.match(/Playercard\([0-9]+\)/);
                    var playerPoints = -1;
                    var playerPointsBuildings = -1;
                    var playerPointsResearch = -1;
                    var playerPointsFleet = -1;
                    var playerPointsDefense = -1;
                    if (playerIDMatch) {
                        playerID = parseInt(playerIDMatch[0].replace("Playercard(", "").replace(")", ""));

                        var playerCard = $.getValues("game.php?page=playerCard&id="+playerID);
                        var playerCardParsed = new DOMParser().parseFromString(playerCard, "text/html").querySelector("table");
                        $(playerCardParsed).find("tr").each(function() {
                            var cardTR = $(this);
                            switch($(cardTR.children()[0]).text())
                            {
                                case "Budynki":
                                    playerPointsBuildings = parseInt($(cardTR.children()[1]).text().replaceAll(".",""));
                                    break;
                                case "Badania":
                                    playerPointsResearch = parseInt($(cardTR.children()[1]).text().replaceAll(".",""));
                                    break;
                                case "Flota":
                                    playerPointsFleet = parseInt($(cardTR.children()[1]).text().replaceAll(".",""));
                                    break;
                                case "Obrona":
                                    playerPointsDefense = parseInt($(cardTR.children()[1]).text().replaceAll(".",""));
                                    break;
                                case "Łącznie":
                                    playerPoints = parseInt($(cardTR.children()[1]).text().replaceAll(".",""));
                                    break;
                            }
                        });
                        console.log(playerCardParsed);
                    }
                    var playerNick = playerTooltip.querySelector(".galaxy-username").textContent;
                    var isInactive = playerTooltip.querySelector(".galaxy-short-inactive") != null;
                    var isVacation = playerTooltip.querySelector(".galaxy-short-vacation") != null;
                    var allianceElement = TDs[6].querySelector(".galaxy-alliance");
                    if (allianceElement)
                        var alliance = allianceElement.textContent;

                    planet.playerID = playerID;
                    player.ID = playerID;
                    player.nick = playerNick;
                    player.inactive = isInactive;
                    player.vacation = isVacation;
                    if (allianceElement)
                        player.alliance = alliance;
                    player.lastUpdate = new Date();
                    player.mainPlanet = planetID;
                    player.points = playerPoints;
                    player.pointsBuildings = playerPointsBuildings;
                    player.pointsResearch = playerPointsResearch;
                    player.pointsFleet = playerPointsFleet;
                    player.pointsDefense = playerPointsDefense;

                    players.push(player);
                }
            }

            planets.push(planet);
        }

        //if(planets.length)
        var planetsPromise;
        {
            planetsPromise = GM.xmlHttpRequest({
                method: "POST",
                url: "https://mirkogame.ilddor.com/planet.php",
                data: "planets=" + JSON.stringify(planets) + "&galaxy=" + galaxy + "&system=" + system,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                onload: function (response) {
                    console.log("Planets Mysql:");
                    console.log(response.responseText);
                }
            });
        }

        var playersPromise;
        if (players.length) {
            //console.log(JSON.stringify(players));
            playersPromise = GM.xmlHttpRequest({
                method: "POST",
                url: "https://mirkogame.ilddor.com/player.php",
                data: "players=" + JSON.stringify(players),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                onload: function (response) {
                    console.log("Players Mysql:");
                    console.log(response.responseText);
                }
            });
        }

        await planetsPromise;
        await playersPromise;
        Settings.checkGalaxy.then(function(value) {
            if(value != false)
            {
                Settings.setCheckGalaxy(false);
                window.location = "game.php?page="+value;
            }
        });

        if (system < 500) {
            await Settings.autoscanGalaxy.then(async function (isAutoscanGalaxy) {
                if (isAutoscanGalaxy) {
                    console.log(`Trigger click next system on ${system}`);
                    await Helpers.sleep(5000);
                    $("input[name='systemRight']").trigger("click");
                }
            });
            await Settings.autoscanUniverse.then(async function (isAutoscanUniverse) {
                if (isAutoscanUniverse) {
                    console.log(`Trigger click next system on ${system}`);
                    await Helpers.sleep(5000);
                    $("input[name='systemRight']").trigger("click");
                }
            });
            /*if(await GM.getValue("autoscanGalaxy") == true || await GM.getValue("autoscanUniverse") == true)
            {
                console.log(`Trigger click next system on ${system}`);
                $("input[name='systemRight']").trigger("click");
            }*/
        }
        else if (system == 500) {
            Settings.autoscanGalaxy.then(function (isAutoscanGalaxy) {
                if (isAutoscanGalaxy) {
                    Settings.setAutoscanGalaxy(false);
                }
            });
            Settings.autoscanUniverse.then(function (isAutoscanUniverse) {
                if (isAutoscanUniverse && galaxy == 5) {
                    Settings.setAutoscanUniverse(false);
                }
            });
            Settings.autoscanUniverse.then(function (isAutoscanUniverse) {
                if (isAutoscanUniverse && !(galaxy == 5 && system == 500)) {
                    $("input[name='system']").val(1);
                    $("input[name='galaxyRight']").trigger("click");
                }
            });

            /*if(await GM.getValue("autoscanGalaxy") == true)
                await GM.setValue("autoscanGalaxy", false);
            if(galaxy == 5 && await GM.getValue("autoscanUniverse") == true)
            {
                await GM.setValue("autoscanUniverse", false);
            }
            if(await GM.getValue("autoscanUniverse") == true)
            {
                $("input[name='system']").val(1);
                $("input[name='galaxyRight']").trigger("click");
            }*/
        }
    }
}

let Statistics = 
{
    scanStatistics: function(table) {
        let players = [];
        table.find("tr").each(function() {
            var TR = $(this);
            var playercardString = $(TR.children()[2]).children().first().attr("onclick");
            if(typeof playercardString == "undefined")
                return;
            console.log(playercardString);
            var playerIDMatch = playercardString.match(/Playercard\([0-9]+\,/);

            var playerPoints = -1;
            var playerPointsBuildings = -1;
            var playerPointsResearch = -1;
            var playerPointsFleet = -1;
            var playerPointsDefense = -1;

            if (playerIDMatch) {
                let player = {};
                playerID = parseInt(playerIDMatch[0].replace("Playercard(", "").replace(",", ""));

                var playerCard = $.getValues("game.php?page=playerCard&id="+playerID);
                var playerCardParsed = new DOMParser().parseFromString(playerCard, "text/html").querySelector("table");
                $(playerCardParsed).find("tr").each(function() {
                    var cardTR = $(this);
                    switch($(cardTR.children()[0]).text())
                    {
                        case "Budynki":
                            playerPointsBuildings = parseInt($(cardTR.children()[1]).text().replaceAll(".",""));
                            break;
                        case "Badania":
                            playerPointsResearch = parseInt($(cardTR.children()[1]).text().replaceAll(".",""));
                            break;
                        case "Flota":
                            playerPointsFleet = parseInt($(cardTR.children()[1]).text().replaceAll(".",""));
                            break;
                        case "Obrona":
                            playerPointsDefense = parseInt($(cardTR.children()[1]).text().replaceAll(".",""));
                            break;
                        case "Łącznie":
                            playerPoints = parseInt($(cardTR.children()[1]).text().replaceAll(".",""));
                            break;
                    }
                });
                console.log(playerCardParsed);
                player.points = playerPoints;
                player.pointsBuildings = playerPointsBuildings;
                player.pointsResearch = playerPointsResearch;
                player.pointsFleet = playerPointsFleet;
                player.pointsDefense = playerPointsDefense;

                players.push(player);
            }

            
        });

        // Send players here
        console.log(players);
    }
}

let BattleSim =
{
    getSimulationFromServer: async function(form) {
        // TODO add simulating indicator
        console.log(form.serialize());
        var result = $.post('game.php?page=battleSimulator&mode=send', form.serialize(), function(data){
            try{ 
                data	= $.parseJSON(data);
                var simResult = $.getValues('CombatReport.php?raport='+data);
                var battleResult = {}
                battleResult.win = simResult.includes("Agresor wygrał bitwę");
                battleResult.lostResources = parseInt(simResult.match(/Agresor przegrał: ([0-9.]+) jednostki/)[1].replaceAll(".",""));
                return battleResult;
            } catch(e) {
                Dialog.alert(data);
            }
        });
        
        return result;
        //setTimeout(function(){$("#submit:hidden").removeAttr('style').hide().fadeIn();}, 10000);
        //setTimeout(function(){$("#wait:visible").removeAttr('style').hide().fadeOut();}, 10000);
    },

    prepareFormToSerialize: function() {
        var form = $("<form id='form' name='battlesim'/>");

        form.append($("<input name='slots' value='2'/>"));
        form.append($("<input name='battleinput[0][1][901]' value='100000'/>"));
        form.append($("<input name='battleinput[0][1][902]' value='200000'/>"));
        form.append($("<input name='battleinput[0][1][903]' value='300000'/>"));

        form.append($("<input name='battleinput[0][0][109]' value='2'/>"));
        form.append($("<input name='battleinput[0][0][110]' value='3'/>"));
        form.append($("<input name='battleinput[0][0][111]' value='4'/>"));

        form.append($("<input name='battleinput[0][1][109]' value='5'/>"));
        form.append($("<input name='battleinput[0][1][110]' value='6'/>"));
        form.append($("<input name='battleinput[0][1][111]' value='7'/>"));
        
        Object.keys(FleetNames).forEach(function(ship,index) {
            form.append($("<input name='battleinput[0][0]["+FleetNames[ship]+"]' value='20'/>"));
            form.append($("<input name='battleinput[0][1]["+FleetNames[ship]+"]' value='0'/>"));
        });

        Object.keys(DefenseNames).forEach(function(defense,index) {
            form.append($("<input name='battleinput[0][1]["+DefenseNames[defense]+"]' value='1'/>"));
        });

        BattleSim.getSimulationFromServer(form);
    }
}

let Fleet =
{
    modifyTargetTable: function (tableParsed) {
        var TRs = tableParsed.querySelectorAll("tr");
        TRs.forEach(function (tr, it) {
            if (it > 0) {
                var sendButton = $("<input/>");
                console.log($(tr).children().first().text());
                sendButton.attr("id", $(tr).children().first().text());
                sendButton.attr("value", "Wyślij");
                sendButton.attr("type", "submit");
                var addressFull = $(tr).children().first().text();
                var addressStr = addressFull.replace("[", "").replace("]", "");
                var address = addressStr.split(":");

                // Add ling to galaxy system
                $(tr).children().first().text("").append(
                    $("<a/>")
                        .attr("href", "game.php?page=galaxy&galaxy=" + address[0] + "&system=" + address[1])
                        .text(addressFull));

                (function () {
                    $(sendButton).on('click', function () {
                        Settings.setScanAttack(addressFull);
                        //GM.setValue("scanAttack", addressFull);

                        var addressStr = addressFull.replace("[", "").replace("]", "");
                        var address = addressStr.split(":");
                        console.log(address);
                        console.log(document.querySelector("input[name='galaxy']"));
                        $(document.querySelector("input[name='galaxy']")).val(address[0]);
                        $(document.querySelector("input[name='system']")).val(address[1]);
                        $(document.querySelector("input[name='planet']")).val(address[2]);
                        $(document.querySelector("input[name='target_mission']")).val(1);
                    });
                }());
                $(tr).append(sendButton.wrap("<td/>").parent());

                // Add fast sends for MT and DT
                var resources = $(tr).find("td:eq(4)");
                var resourcesText = resources.text();
                var numberMT = resourcesText.slice(resourcesText.indexOf("(") + 1, resourcesText.indexOf("/"));
                var numberDT = resourcesText.slice(resourcesText.indexOf("/") + 1, resourcesText.indexOf(")"));
                resources.text("");
                resources.append(resourcesText.slice(0, resourcesText.indexOf("(") + 1));
                // MT
                var linkSendMT = $("<a class='MTQuick'/>").text(numberMT);
                linkSendMT.on("click", function () {
                    Settings.setScanAttack(addressFull);

                    $("#ship202_input").val(numberMT);
                    var addressStr = addressFull.replace("[", "").replace("]", "");
                    var address = addressStr.split(":");
                    console.log(address);
                    console.log(document.querySelector("input[name='galaxy']"));
                    $(document.querySelector("input[name='galaxy']")).val(address[0]);
                    $(document.querySelector("input[name='system']")).val(address[1]);
                    $(document.querySelector("input[name='planet']")).val(address[2]);
                    $(document.querySelector("input[name='type']")).val(1);
                    $(document.querySelector("input[name='target_mission']")).val(1);
                    $("form").submit();
                });
                resources.append(linkSendMT);
                resources.append("/");
                // DT
                var linkSendDT = $("<a class='DTQuick'/>").text(numberDT);
                //resources[0].innerHTML = resources[0].innerHTML.replace(numberDT, linkSendDT[0].outerHTML);
                linkSendDT.on("click", function () {
                    Settings.setScanAttack(addressFull);
                    console.log("hejka");
                    $("#ship203_input").val(numberDT);
                    var addressStr = addressFull.replace("[", "").replace("]", "");
                    var address = addressStr.split(":");
                    console.log(address);
                    console.log(document.querySelector("input[name='galaxy']"));
                    $(document.querySelector("input[name='galaxy']")).val(address[0]);
                    $(document.querySelector("input[name='system']")).val(address[1]);
                    $(document.querySelector("input[name='planet']")).val(address[2]);
                    $(document.querySelector("input[name='type']")).val(1);
                    $(document.querySelector("input[name='target_mission']")).val(1);
                    $("form").submit();
                });
                resources.append(linkSendDT);
                resources.append(")");
                // Predefined fleet
                var linkPredefined = $("<input type='checkbox' class='PredefinedQuick' style='zoom: 0.9;transform: translateY(3px)'/>").text("P");
                linkPredefined.on("click", function () {
                    Settings.setScanAttack(addressFull);
                    console.log("hejka");
                    if($("#useMT").is(":checked"))
                        $("#ship202_input").val(numberMT);
                    else
                        $("#ship203_input").val(numberDT);

                    Object.keys(FleetNames).forEach(function(ship,index) {
                        var additionalValue = $("#additional"+ship).val();
                        if(isNumeric(additionalValue))
                        {
                            $("#ship"+FleetNames[ship]+"_input").val(
                                parseInt($("#ship"+FleetNames[ship]+"_input").val()) +
                                parseInt($("#additional"+ship).val()));
                        }
                    });
                    var addressStr = addressFull.replace("[", "").replace("]", "");
                    var address = addressStr.split(":");
                    console.log(address);
                    console.log(document.querySelector("input[name='galaxy']"));
                    $(document.querySelector("input[name='galaxy']")).val(address[0]);
                    $(document.querySelector("input[name='system']")).val(address[1]);
                    $(document.querySelector("input[name='planet']")).val(address[2]);
                    $(document.querySelector("input[name='type']")).val(1);
                    $(document.querySelector("input[name='target_mission']")).val(1);
                    $("form").submit();
                });
                resources.append(" ");
                resources.append(linkPredefined);
            }
            else {
                // Add autofarm button in header row
                var autorescanElement = $("<input type='button'/>")
                    .val("Autofarma")
                    .attr("title", "Uwaga! W tej chwili implementacja obejmuje tylko wysylanie MT dlatego zalecam ustawic limity na 0 obrony i floty");
                Settings.autofarm.then(function (isAutofarm) {
                    if (isAutofarm) {
                        autorescanElement.on("click", async function () {
                            await Settings.setAutofarm(false);
                            window.location.reload(1);
                        }).css('color', 'lime');//.text("Wyłącz autorescan");
                    }
                    else {
                        autorescanElement.on("click", async function () {
                            console.log(new AutofarmState());
                            await Settings.setAutofarm(new AutofarmState());
                            window.location.reload(1);
                        }).css('color', 'red');//.text("Włącz autorescan");
                    }
                });
                autorescanElement.wrap("<th/>");
                $(tr).append(autorescanElement.parent());
            }
        });

        /*var button = $("<input type='button'/>").val("Skanuj");
        button.on("click", function()
        {
            Push.create("Testujemy");
        });
        $(tableParsed).append(button);*/

        /*$(tableParsed).wrap("<div/>");
        var limit =
            $("<tr/>")
                .append($("<td/>")
                    .text("Limit"))
                .append(
                    $("<td/>")
                        .append(
                            $("<input id='limit'/>")
                                .attr("value","10")
                                .on("change",function(){
                                    GM.setValue("limit", $("#limit").val());
                                })));
        $(tableParsed).before(limit);
        GM.getValue("limit").then(function(cos) {
            $("#limit").attr("value",cos);
            $(tableParsed).before(cos);
        });*/

        return tableParsed;
    },

    modifyScanTable: function (tableParsed, setting) {
        var TRs = tableParsed.querySelectorAll("tr");
        TRs.forEach(function (tr, it) {
            if (it > 0) {
                var TDs = $(tr).find("td");
                var id = parseInt(TDs.last().text());
                TDs.last().remove();
                var button = $("<input type='button'/>").val("Skanuj").wrap("<td />");

                var addressFull = TDs.first().text();
                var addressStr = addressFull.replace("[", "").replace("]", "");
                var address = addressStr.split(":");
                TDs.first().text("").append(
                    $("<a/>")
                        .attr("href", "game.php?page=galaxy&galaxy=" + address[0] + "&system=" + address[1])
                        .text(addressFull));

                button.on("click", function () {

                    console.log("Scan inactive click " + address[0] + ":" + address[1]);
                    Misc.spyPlanet(6, id, function () {
                        // Insert info that target is scan pending to mysql {"210":"4"},
                        console.log("doit callback");
                        var scanData = {};
                        scanData.ID = id;
                        scanData.address = TDs.first().text();
                        GM.xmlHttpRequest({
                            method: "POST",
                            url: "https://mirkogame.ilddor.com/scanPending.php",
                            data: "scan=" + JSON.stringify(scanData),
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            onload: function (response) {
                                console.log("Scan pending:");
                                console.log(response.responseText);
                                window.location = "https://mirkogame.pl/game.php?page=fleetTable";
                            }
                        });
                    },
                    function (failureMessage) {
                        if(failureMessage.includes("gracz za słaby") ||
                            failureMessage.includes("planeta nie istnieje"))
                        {
                            //alert(failureMessage);
                            Settings.setCheckGalaxy("fleetTable");
                            window.location = "game.php?page=galaxy&galaxy=" + address[0] + "&system=" + address[1];
                        }
                        else
                        {
                            var sendError = $("#content").find("#sendError");
                            if(sendError.length)
                            {
                                sendError.text(failureMessage);
                            }
                            else
                            {
                                $("#content").prepend($("<span style='color:red' id='sendError'/>").text(failureMessage));
                            }
                        }
                    });
                });
                $(tr).append(button.parent());
            }
            else {
                // Add autoscan button in header row
                var autorescanElement = $("<input type='button'/>").val("Autoskan");//.attr("href", window.location);
                Settings[setting].then(function (isAutorescan) {
                    if (isAutorescan) {
                        autorescanElement.on("click", async function () {
                            await Settings["set" + setting.charAt(0).toUpperCase() + setting.slice(1)](false);
                            window.location.reload(1);
                        }).css('color', 'lime');//.text("Wyłącz autorescan");
                    }
                    else {
                        autorescanElement.on("click", async function () {
                            await Settings["set" + setting.charAt(0).toUpperCase() + setting.slice(1)](true);
                            window.location.reload(1);
                        }).css('color', 'red');//.text("Włącz autorescan");
                    }
                });
                autorescanElement.wrap("<th/>");
                $(tr).append(autorescanElement.parent());
            }
        });
        return tableParsed;
    },

    addBestTargets: function (parent) {
        var currentAddressGalaxy = Misc.getCurrentPlanet();
        console.log(currentAddressGalaxy);
        var parameters = {
            limit: Settings.targetsLimit,
            minGalaxy: Settings.minGalaxy,
            maxGalaxy: Settings.maxGalaxy,
            minSystem: Settings.minSystem,
            maxSystem: Settings.maxSystem,
            inactiveOnly: Settings.inactiveOnly,
            scansTime: Settings.scansTime,
            currentGalaxy: currentAddressGalaxy[0],
            currentSystem: currentAddressGalaxy[1],
            currentPlanet: currentAddressGalaxy[2],
            showPartialScans: Settings.showPartialScans,
        };
        Object.keys(FleetNames).forEach(function(ship,index) {
            parameters["limit"+ship] = Settings["limit"+ship];
        });
        Object.keys(DefenseNames).forEach(function(defense,index) {
            parameters["limit"+defense] = Settings["limit"+defense];
        });
        $.getValuesPostWeird("https://mirkogame.ilddor.com/getBestTargets.php", parameters).then(function (data) {
            var tableRead = data.responseText;
            var tableParsed = new DOMParser().parseFromString(tableRead, "text/html").querySelector("#result");

            parent.append(Fleet.modifyTargetTable(tableParsed));
            //Fleet.autofarmWork();
        });
        //var tableRead = (await $.getValuesPost("https://mirkogame.ilddor.com/getBestTargets.php", "limit=20")).responseText;
        //var tableParsed = new DOMParser().parseFromString(tableRead, "text/html").querySelector("#result");
        //return ModifyTargetTable(tableParsed);
    },

    addRescanTargets: function (parent) {
        var currentAddressGalaxy = Misc.getCurrentPlanet();
        console.log(currentAddressGalaxy);
        var parameters = {
            limit: Settings.targetsLimit,
            minGalaxy: Settings.minGalaxy,
            maxGalaxy: Settings.maxGalaxy,
            minSystem: Settings.minSystem,
            maxSystem: Settings.maxSystem,
            inactiveOnly: Settings.inactiveOnly,
            scansTime: Settings.scansTime,
            currentGalaxy: currentAddressGalaxy[0],
            currentSystem: currentAddressGalaxy[1],
            currentPlanet: currentAddressGalaxy[2],
            usePotentialResources: Settings.usePotentialResources,
            showPartialScans: Settings.showPartialScans,
        };
        Object.keys(FleetNames).forEach(function(ship,index) {
            parameters["limit"+ship] = Settings["limit"+ship];
        });
        Object.keys(DefenseNames).forEach(function(defense,index) {
            parameters["limit"+defense] = Settings["limit"+defense];
        });
        $.getValuesPostWeird("https://mirkogame.ilddor.com/getRescans.php", parameters).then(function (data) {
            var tableRead = data.responseText;
            var tableParsed = new DOMParser().parseFromString(tableRead, "text/html").querySelector("#resultRescans");
            console.log(tableParsed);
            parent.append(Fleet.modifyScanTable(tableParsed, "autorescan"));
            Fleet.checkFreeSlotRescans();
        });
        /*var tableRead = (await $.getValuesPost("https://mirkogame.ilddor.com/getRescans.php", "limit=20")).responseText;
        var tableParsed = new DOMParser().parseFromString(tableRead, "text/html").querySelector("#resultRescans");
        return ModifyScanTable(tableParsed);*/
    },

    addInactiveTargets: function (parent) {
        $.getValuesPostWeird("https://mirkogame.ilddor.com/getInactiveToScan.php", {
            limit: Settings.rescansLimit,
            minGalaxy: Settings.minGalaxy,
            maxGalaxy: Settings.maxGalaxy,
            minSystem: Settings.minSystem,
            maxSystem: Settings.maxSystem
        }).then(function (data) {
            var tableRead = data.responseText;
            var tableParsed = new DOMParser().parseFromString(tableRead, "text/html").querySelector("#resultInactive");

            parent.append(Fleet.modifyScanTable(tableParsed, "autoscanInactive"));
            Fleet.checkFreeSlotInactive();
        });
        /*var tableRead = (await $.getValuesPost("https://mirkogame.ilddor.com/getInactiveToScan.php", "limit=20")).responseText;
        var tableParsed = new DOMParser().parseFromString(tableRead, "text/html").querySelector("#resultInactive");

        return ModifyScanTable(tableParsed);*/
    },

    addParameters: function (parent) {
        var table = $("<table id='parameters'/>");

        // Reach
        $("<tr/>").append($("<th colspan='2'/>").text("Zasięg")).appendTo(table);
        var minGalaxy = $("<tr/>").appendTo(table);
        minGalaxy.append($("<td/>").text("Od galaktyki"));
        minGalaxy.append($("<input id='minGalaxy'/>").wrap("<td/>").parent());

        var maxGalaxy = $("<tr/>").appendTo(table);
        maxGalaxy.append($("<td/>").text("Do galaktyki"));
        maxGalaxy.append($("<input id='maxGalaxy'/>").wrap("<td/>").parent());

        var minSystem = $("<tr/>").appendTo(table);
        minSystem.append($("<td/>").text("Od systemu nr"));
        minSystem.append($("<input id='minSystem'/>").wrap("<td/>").parent());

        var maxSystem = $("<tr/>").appendTo(table);
        maxSystem.append($("<td/>").text("Do systemu nr"));
        maxSystem.append($("<input id='maxSystem'/>").wrap("<td/>").parent());

        // Limits
        $("<tr/>").append($("<th colspan='2'/>").text("Limity")).appendTo(table);
        var rescansLimit = $("<tr/>").appendTo(table);
        rescansLimit.append($("<td/>").text("Liczba pozycji w tabelach reskanów i skanów"));
        rescansLimit.append($("<input id='rescansLimit'/>").wrap("<td/>").parent());

        var targetsLimit = $("<tr/>").appendTo(table);
        targetsLimit.append($("<td/>").text("Liczba pozycji w tabeli targetów"));
        targetsLimit.append($("<input id='targetsLimit'/>").wrap("<td/>").parent());

        var scansTime = $("<tr/>").appendTo(table);
        scansTime.append($("<td/>").text("Skany z ostatnich X godzin"));
        scansTime.append($("<input id='scansTime'/>").wrap("<td/>").parent());

        var inactiveOnly = $("<tr/>").appendTo(table);
        inactiveOnly.append($("<td/>").text("Tylko nieaktywni"));
        inactiveOnly.append($("<input type='checkbox' id='inactiveOnly'/>").wrap("<td/>").parent());

        var aggresiveAutofarm = $("<tr/>").appendTo(table);
        aggresiveAutofarm.append($("<td/>").text("Użyj agresywnej autofarmy"));
        aggresiveAutofarm.append($("<input type='checkbox' id='aggresiveAutofarm'/>").wrap("<td/>").parent());

        var potentialRes = $("<tr/>").appendTo(table);
        potentialRes.append($("<td/>").text("Użyj potencjalnych surowców"));
        potentialRes.append($("<input type='checkbox' id='potentialRes'/>").wrap("<td/>").parent());

        var showPartialScans = $("<tr/>").appendTo(table);
        showPartialScans.append($("<td/>").text("Pokaż niepełne skany"));
        showPartialScans.append($("<input type='checkbox' id='showPartialScans'/>").wrap("<td/>").parent());

        var fleetAndDefenseDetailedLimits = $("<tr/>").appendTo(table);
        var tripleTableLimitAdditional = $("<tr/>").wrap("<table/>");
        tripleTableLimitAdditional.parent().wrap("<td colspan='2'/>");
        tripleTableLimitAdditional.parent().parent().appendTo(fleetAndDefenseDetailedLimits);


        // Fleet detailed limits
        var fleetDetailedLimits = $("<table/>").wrap("<td/>");
        fleetDetailedLimits.parent().attr("style","vertical-align:top").appendTo(tripleTableLimitAdditional);

        $("<tr/>").append($("<th colspan='2'/>").text("Limit floty")).appendTo(fleetDetailedLimits);
        var maxFleetCount = $("<tr/>").appendTo(fleetDetailedLimits);
        /*maxFleetCount.append($("<td/>").text("Flota"));
        maxFleetCount.append($("<input id='maxFleetCount' size='5'/>").wrap("<td/>").parent());*/

        /*var limitMT = $("<tr/>").appendTo(fleetDetailedLimits);
        limitMT.append($("<td/>").text("MT:"));
        limitMT.append($("<input id='limitMT' size='5'/>").wrap("<td/>").parent());*/

        Object.keys(FleetNames).forEach(function(ship,index) {
            var shipTR = $("<tr/>").appendTo(fleetDetailedLimits);
            shipTR.append($("<td/>").text(ship));
            shipTR.append($("<input id='limit"+ship+"' size='5'/>").wrap("<td/>").parent());
        });

        // Defense detailed limits
        var defenseDetailedLimits = $("<table/>").wrap("<td/>");
        defenseDetailedLimits.parent().attr("style","vertical-align:top").appendTo(tripleTableLimitAdditional);

        $("<tr/>").append($("<th colspan='2'/>").text("Limit obrony")).appendTo(defenseDetailedLimits);
        var maxDefenseCount = $("<tr/>").appendTo(defenseDetailedLimits);
        /*maxDefenseCount.append($("<td/>").text("Obrona"));
        maxDefenseCount.append($("<input id='maxDefenseCount' size='5'/>").wrap("<td/>").parent());*/

        Object.keys(DefenseNames).forEach(function(defense,index) {
            var defenseTR = $("<tr/>").appendTo(defenseDetailedLimits);
            defenseTR.append($("<td/>").text(defense));
            defenseTR.append($("<input id='limit"+defense+"' size='5'/>").wrap("<td/>").parent());
        });

        // Predefined attack fleet
        var predefinedFleet = $("<table/>").wrap("<td/>");
        predefinedFleet.parent().attr("style","vertical-align:top").appendTo(tripleTableLimitAdditional);

        $("<tr/>").append($("<th colspan='2'/>").text("Predefiniowana flota")).appendTo(predefinedFleet);
        predefinedFleet.append($("<td/>").text("MT/DT"));
        var radioTD = $("<td/>").appendTo(predefinedFleet);
        radioTD.append($("<input id='useMT' type='radio' name='useTransporters'/>"));
        radioTD.append($("<input id='useDT' type='radio' name='useTransporters'/>"));

        Object.keys(FleetNames).forEach(function(ship,index) {
            var shipTR = $("<tr/>").appendTo(predefinedFleet);
            shipTR.append($("<td/>").text(ship));
            shipTR.append($("<input id='additional"+ship+"' size='5'/>").wrap("<td/>").parent());
        });

        var setButton = $("<input type='button'/>").val("Ustaw").wrap("<td colspan='2'/>").parent().wrap("<tr/>").parent().appendTo(table);
        setButton.on("click", function () {
            Settings.setMinGalaxy($("#minGalaxy").val());
            Settings.setMaxGalaxy($("#maxGalaxy").val());
            Settings.setMinSystem($("#minSystem").val());
            Settings.setMaxSystem($("#maxSystem").val());
            Settings.setRescansLimit($("#rescansLimit").val());
            Settings.setTargetsLimit($("#targetsLimit").val());
            //Settings.setMaxFleetCount($("#maxFleetCount").val());
            //Settings.setMaxDefenseCount($("#maxDefenseCount").val());
            Settings.setScansTime($("#scansTime").val());
            Settings.setInactiveOnly($("#inactiveOnly").is(":checked"));
            Settings.setAggresiveAutofarm($("#aggresiveAutofarm").is(":checked"));
            Settings.setUsePotentialResources($("#potentialRes").is(":checked"));
            Settings.setShowPartialScans($("#showPartialScans").is(":checked"));

            Object.keys(FleetNames).forEach(function(ship,index) {
                Settings["setLimit"+ship]($("#limit"+ship).val());
                Settings["setAdditional"+ship]($("#additional"+ship).val());
            });
            Object.keys(DefenseNames).forEach(function(defense,index) {
                Settings["setLimit"+defense]($("#limit"+defense).val());
            });
            Settings.setUseMT($("#useMT").is(":checked"));

            window.location.reload(1);
        });

        // Setting values according to Settings class state
        Settings.minGalaxy.then(function (value) { $("#minGalaxy").val(value) });
        Settings.maxGalaxy.then(function (value) { $("#maxGalaxy").val(value) });
        Settings.minSystem.then(function (value) { $("#minSystem").val(value) });
        Settings.maxSystem.then(function (value) { $("#maxSystem").val(value) });
        Settings.rescansLimit.then(function (value) { $("#rescansLimit").val(value) });
        Settings.targetsLimit.then(function (value) { $("#targetsLimit").val(value) });
        Settings.scansTime.then(function (value) { $("#scansTime").val(value) });
        Settings.inactiveOnly.then(function (value) { $("#inactiveOnly").prop('checked', value); });
        Settings.aggresiveAutofarm.then(function (value) { $("#aggresiveAutofarm").prop('checked', value); });
        Settings.usePotentialResources.then(function (value) { $("#potentialRes").prop('checked', value); });
        Settings.showPartialScans.then(function (value) { $("#showPartialScans").prop('checked', value); });

        Object.keys(FleetNames).forEach(function(ship,index) {
            console.log("Filling "+ship);
            Settings["limit"+ship].then(function (value) { $("#limit"+ship).val(value); });
            Settings["additional"+ship].then(function (value) { $("#additional"+ship).val(value); });
        });

        Object.keys(DefenseNames).forEach(function(defense,index) {
            Settings["limit"+defense].then(function (value) { $("#limit"+defense).val(value); });
        });
        Settings.useMT.then(function (value) {
            if(value)
                $("#useMT").prop('checked', true);
            else
                $("#useDT").prop('checked', true);
        })

        //Settings.maxFleetCount.then(function (value) { $("#maxFleetCount").val(value) });
        //Settings.maxDefenseCount.then(function (value) { $("#maxDefenseCount").val(value) });

        parent.append(table);
    },

    enrichFleetView: function (fleetTab) {
        var trs = fleetTab.querySelectorAll("tr");
        for (var i = 0; i < trs.length; i++) {
            var tds = trs[i].querySelectorAll("td");
            if (tds.length > 0) {
                var a = tds[0].querySelector("a");
                if (a && $(a).attr("title")) {
                    a.innerHTML += " (" + $(a).attr("title").replace("Prędkość", "P") + ")";
                }
            }
        }
    },

    enrichFlightsSummary: function (fleetsTable) {
        var returnButtons = fleetsTable.find("input[value='Zawróć']");
        returnButtons.each(function(){
            $(this).addClass("returnButton");
            
        });

        window.setInterval(function(){
            var returnButtons = fleetsTable.find(".returnButton");
            returnButtons.each(function(){
                var arrivalTimeTxt = $($(this).parent().parent().parent().children()[4]).text();
                var returnTimeTxt = $($(this).parent().parent().parent().children()[6]).text();

                var arrivalTime = Misc.parseDate(arrivalTimeTxt);
                var returnTime = Misc.parseDate(returnTimeTxt);

                var flightTime = returnTime.getTime()-arrivalTime.getTime();
                var returnInterval = $($(this).parent().parent().parent().children()[7]).text();
                var returnSplit = returnInterval.split(":");
                var returnInMicroseconds = (parseInt(returnSplit[0]) * 3600 + parseInt(returnSplit[1]) * 60 + parseInt(returnSplit[2])) * 1000;


                var potentialReturn = new Date();
                potentialReturn = new Date(potentialReturn.getTime() + (flightTime * 2 - returnInMicroseconds));

                //console.log("Return "+potentialReturn);

                $(this).val("Zawróć "+potentialReturn.getHours()+":"+potentialReturn.getMinutes()+":"+potentialReturn.getSeconds());

                //$(this).parent().parent().parent().children()[8].innerHTML = $(this).parent().parent().parent().children()[8].innerHTML + potentialReturn;
                
                //var assumedReturn = 
            });
        }, 1000);
    },

    addTables: function (fleetTable) {
        var fleetForm = fleetTable.parent();
        var content = fleetForm.parent();
        var flightsTable = content.children().first();
        flightsTable.attr("style", "width:auto");
        Fleet.enrichFlightsSummary(flightsTable);

        // Add parameters next to flights table
        fleetForm.remove();
        flightsTable.remove();

        var wrapTable = $("<table/>").prependTo(content);
        wrapTable[0].style.setProperty("width", "auto", "important");
        var zeroTR = $("<tr/>").appendTo(wrapTable);
        var flightsTD = $("<td/>").attr("style", "vertical-align:top").append(flightsTable);
        zeroTR.append(flightsTD);

        fleetTable.remove();

        var parametersTD = $("<td rowspan='2'/>").attr("style", "vertical-align:top").appendTo(zeroTR);
        fleetForm.appendTo(parametersTD);
        fleetForm.append(fleetTable);


        Fleet.addBestTargets($("<div style='float:top'/>").appendTo(fleetForm));
        var halfTR = $("<tr/>").appendTo(parametersTD);
        Fleet.addParameters($("<td/>").appendTo(halfTR));
        Fleet.addInactiveTargets($("<td/>").attr("style", "vertical-align:top").appendTo(halfTR));

        // Create table to fit fleet table and rescans side by side
        //var wrapTable = $("<table />").appendTo(fleetForm);
        //wrapTable[0].style.setProperty("width", "auto", "important");

        // first row: rescans and inactive scans
        //var firstTR = $("<tr />").appendTo(wrapTable);

        // Rescans
        //var rescansTD = $("<td/>").attr("style", "vertical-align:top").appendTo(firstTR);
        Fleet.addRescanTargets(flightsTD);
    },

    harvestFleetInfo: function (fleetTable) {
        if ($.urlParam("page") == "fleetTable") {
            Settings.setScanAttack(false);
        }
        if ($.urlParam("page") == "fleetStep3") {
            //window.addEventListener("beforeunload", function() { debugger; }, false);
            var attack = {};

            var TRs = $(fleetTable).find("tr");

            console.log(TRs.length);
            console.log(TRs[1]);
            console.log($(TRs[1]).children().last().text());
            if ($(TRs[1]).children().last().text() == "Atak") {
                TRs.each(function () {
                    if ($(this).children().first().text() == "Od") {
                        attack.origin = "[" + $(this).children().last().text() + "]";
                    }
                    if ($(this).children().first().text() == "Przeznacznie") {
                        attack.address = "[" + $(this).children().last().text() + "]";
                    }
                    if ($(this).children().first().text() == "Czas dotarcia" ||
						$(this).children().first().text() == "Czas dolotu") {
                        var weirdFormatDate = $(this).children().last().text();
                        var day = weirdFormatDate.substring(0, weirdFormatDate.indexOf(". "));
                        var monthStr = weirdFormatDate.substring(weirdFormatDate.indexOf(". ") + 2, weirdFormatDate.indexOf(". ") + 5);
                        var month = Dates.parseMonth(monthStr);
                        var year = weirdFormatDate.substring(weirdFormatDate.indexOf(monthStr) + 4, weirdFormatDate.indexOf(monthStr) + 8);
                        var time = weirdFormatDate.substring(weirdFormatDate.indexOf(year) + 6, weirdFormatDate.length);
                        attack.arrival = year + "-" + (("0" + (month + 1)).slice(-2)) + "-" + day + "T" + time;
                    }
                    if ($(this).children().first().text() == "Czas powrotu") {
                        weirdFormatDate = $(this).children().last().text();
                        day = weirdFormatDate.substring(0, weirdFormatDate.indexOf(". "));
                        monthStr = weirdFormatDate.substring(weirdFormatDate.indexOf(". ") + 2, weirdFormatDate.indexOf(". ") + 5);
                        month = Dates.parseMonth(monthStr);
                        year = weirdFormatDate.substring(weirdFormatDate.indexOf(monthStr) + 4, weirdFormatDate.indexOf(monthStr) + 8);
                        time = weirdFormatDate.substring(weirdFormatDate.indexOf(year) + 6, weirdFormatDate.length);
                        attack.return = year + "-" + (("0" + (month + 1)).slice(-2)) + "-" + day + "T" + time;
                    }
                });
                /*if(await GM.getValue("scanAttack"))
                    attack.isscript = 1;
                else
                    attack.isscript = 0;*/

                Settings.scanAttack.then(function (isScanAttack) {
                    if (isScanAttack) {
                        attack.isscript = 1;
                        Settings.setScanAttack(false);
                    }
                    else
                        attack.isscript = 0;

                    console.log(JSON.stringify(attack));
                    $.getValuesPost("https://mirkogame.ilddor.com/attackPending.php", "attack=" + JSON.stringify(attack)).then(function () {
                        console.log("Zapisano informacje");
                    });
                });


            }
        }
    },

    checkAvailableFleets: function (leaveSlots) {
        var title = document.evaluate(
            "//th[@colspan=9]",
            pbox,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null);
        var fleetsStr = $(title.snapshotItem(0)).children().first().text();

        var fleetsPieces = fleetsStr.split(" ");

        //console.log(parseInt(fleetsPieces[3]) + " - " + parseInt(fleetsPieces[1]) + " - " + leaveSlots);

        var fleetsLeft = parseInt(fleetsPieces[3]) - parseInt(fleetsPieces[1]) - leaveSlots;
        //console.log("Fleets left: " + fleetsLeft);
        return fleetsLeft;
    },

    checkSpyRaportsDone: function() {
        var done = true;
        $('.fleets').each(function() {
            var s = $(this).data('fleet-time') - (serverTime.getTime() - startTime) / 1000;
            if(s > 0 && $($(this).parent().children()[1]).text().includes("Szpieguj"))
            {
                done = false;
            }
        });

        return done;
    },

    checkFreeSlotRescans: function () {
        window.setInterval(function () {
            Settings.autorescan.then(function (isAutorescan) {
                if (isAutorescan) {
                    if (Fleet.checkAvailableFleets(0) > 0) {
                        var input = $($("#resultRescans").children().children()[1]).find("input");
                        input.trigger("click");
                        return;
                    }

                    $('.fleets').each(function () {
                        var s = $(this).data('fleet-time') - (serverTime.getTime() - startTime) / 1000;
                        if (s <= 0) {
                            console.log("Yay!");
                            var input = $($("#resultRescans").children().children()[1]).find("input");
                            input.trigger("click");
                            return false;
                        }
                    });
                }
            });
        }, 1000);
    },

    checkFreeSlotInactive: function () {
        window.setInterval(function () {
            Settings.autoscanInactive.then(function (isAutoscanInactive) {
                if (isAutoscanInactive) {
                    if (Fleet.checkAvailableFleets(0) > 0) {
                        var input = $($("#resultInactive").children().children()[1]).find("input");
                        input.trigger("click");
                        return;
                    }

                    $('.fleets').each(function () {
                        var s = $(this).data('fleet-time') - (serverTime.getTime() - startTime) / 1000;
                        if (s <= 0) {
                            console.log("Yay!");
                            var input = $($("#resultInactive").children().children()[1]).find("input");
                            console.log(input);
                            input.trigger("click");
                            return false;
                        }
                    });
                }
            });
        }, 1000);
    },

    addButtonsMenu: function () {
        var menu = $("#menut1").children().first();

        var autorescanElement = $("<a/>").attr("href", window.location);
        Settings.autorescan.then(function (isAutorescan) {
            if (isAutorescan) {
                autorescanElement.on("click", async function () { await Settings.setAutorescan(false); }).text("Wyłącz autorescan");
            }
            else {
                autorescanElement.on("click", async function () { await Settings.setAutorescan(true); }).text("Włącz autorescan");
            }
        });
        autorescanElement.wrap("<div/>");
        menu.append(autorescanElement.parent());

        var autoscanInactiveElement = $("<a/>").attr("href", window.location);
        Settings.autoscanInactive.then(function (isAutoscanInactive) {
            if (isAutoscanInactive) {
                autoscanInactiveElement.on("click", async function () { await Settings.setAutoscanInactive(false); }).text("Wyłącz autoscan nieaktywnych");
            }
            else {
                autoscanInactiveElement.on("click", async function () { await Settings.setAutoscanInactive(true); }).text("Włącz autoscan nieaktywnych");
            }
        });
        autoscanInactiveElement.wrap("<div/>");
        menu.append(autoscanInactiveElement.parent());
    },

    autofarmWork: function(table) {
        //window.setInterval(function () {
            switch($.urlParam("page"))
            {
                case "fleetTable":
                    window.setInterval(function () {
                        Settings.autofarm.then(function(autofarm){
                            //console.log("Autofarm worker");
                            //console.log("Autofarm "+typeof autofarm);
                            if(autofarm)
                            {
                                //console.log("Autofarm after object");
                                //console.log("Autofarm " + autofarm.scansToMake);
                                if(autofarm.scansToMake)
                                {
                                    //console.log("Autofarm do scans");
                                    if (Fleet.checkAvailableFleets(0) > 0) {
                                        var input = $($("#resultRescans").children().children()[1]).find("input");
                                        autofarm.scansToMake--;
                                        Settings.setAutofarm(autofarm);
                                        input.trigger("click");
                                        return;
                                    }
                
                                    $('.fleets').each(function () {
                                        var s = $(this).data('fleet-time') - (serverTime.getTime() - startTime) / 1000;
                                        if (s <= 0) {
                                            //console.log("Yay!");
                                            var input = $($("#resultRescans").children().children()[1]).find("input");
                                            autofarm.scansToMake--;
                                            Settings.setAutofarm(autofarm);
                                            input.trigger("click");
                                            return false;
                                        }
                                    });
                                }
                                else
                                {
                                    //console.log("Autofarm check scans");
                                    if(Fleet.checkSpyRaportsDone() && !autofarm.reportsLoaded)
                                    {
                                        window.location = "game.php?page=messages";
                                    }
                                    else if(autofarm.reportsLoaded && Fleet.checkAvailableFleets(testing ? 0 : 1) > 0)
                                    {
                                        //console.log("Autofarm send fleet");
                                        waitForKeyElements("#result", async function(button){
                                            var bestTarget = $($("#result").children().children()[1]);
                                            var input;
                                            if(await Settings.aggresiveAutofarm && 
                                                bestTarget.find(".targetNick").text().includes("(i)") &&
                                                parseInt(bestTarget.find(".targetFleet").text()) == 0 &&
                                                parseInt(bestTarget.find(".targetDefense").text()) == 0)
                                            {
                                                input = bestTarget.find(".MTQuick");
                                            }
                                            else if(testing &&
                                                await Settings.aggresiveAutofarm && 
                                                bestTarget.find(".targetDefense").children().first().attr("data-tooltip-content").includes("DO"))
                                            {
                                                input = bestTarget.find(".PredefinedQuick");
                                                $("#ship207_input").val(parseInt($("#ship207_input").val()) + 5);
                                            }
                                            else
                                            {
                                                input = bestTarget.find(".PredefinedQuick");
                                            }
                                            input.trigger("click");
                                        });
                                    }
                                    else
                                    {
                                        console.log("Autofarm wait for fleet slot to attack");
                                        $('.fleets').each(function () {
                                            var s = $(this).data('fleet-time') - (serverTime.getTime() - startTime) / 1000;
                                            if (s <= 0) {
                                                window.location.reload(1);
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }, 1000);
                    break;
                case "messages":
                    Settings.autofarm.then(function(autofarm){
                        console.log("Autofarm worker");
                        console.log("Autofarm "+typeof autofarm);
                        if(autofarm)
                        {
                            console.log("Autofarm after object");
                            console.log("Autofarm " + autofarm.scansToMake);
                            if(autofarm.scansToMake == 0 && autofarm.reportsLoaded == false && autofarm.gotBackToFleet == false)
                            {
                                unsafeWindow.Message.getMessages(0);
                                waitForKeyElements("#copyAllBtn", function(button){
                                    console.log(button[0]);
                                    autofarm.reportsLoaded = true;
                                    Settings.setAutofarm(autofarm).then(function(){
                                        $(button[0]).trigger("click");
                                    });
                                });
                            }
                            else if(autofarm.scansToMake == 0 && autofarm.reportsLoaded == true && autofarm.gotBackToFleet == false)
                            {
                                unsafeWindow.Message.getMessages(0);
                                waitForKeyElements("#copyAllBtn", function(button){
                                    Helpers.sleep(2000).then(function(){
                                        autofarm.gotBackToFleet = true;
                                        Settings.setAutofarm(autofarm).then(function(){
                                            window.location = "game.php?page=fleetTable";
                                        });
									});
                                });
                            }
                        }
                    });
                    break;
                case "fleetStep1":
                    Settings.autofarm.then(function (autofarm) {
                        console.log("Autofarm fleetstep1");
                        waitForKeyElements("#form", function(form){
                            if (autofarm) {
                                console.log("Continue");
                                $(form[0]).submit();
                            }
                        });
                    });
                    break;
                case "fleetStep2":
                    Settings.autofarm.then(function (autofarm) {
                        console.log("Autofarm fleetstep2");
                        //waitForKeyElements("#form", function(form){
                            if (autofarm) {
                                console.log("Continue");
                                var form = table.parentElement;
                                console.log(form);
                                $(form).submit();
                            }
                        //});
                    });
                    break;
                case "fleetStep3":
                    Settings.autofarm.then(function (autofarm) {
                        console.log("Autofarm fleetstep3");
                        if (autofarm) {
                            console.log("Restart!");
                            autofarm.scansToMake = 5;
                            autofarm.reportsLoaded = false;
                            autofarm.gotBackToFleet = false;
                            Settings.setAutofarm(autofarm);
                        }
                    });
                    break;
            }
        //}, 1000);
    }
}

let Workers =
{
    table519Overview: function (table519Node) {
        Overview.createSummaryInfo(table519Node[0]);
        Overview.createSeparateFlightReturnTables(table519Node[0]);
    },

    table519FleetTable: function (table519Node) {
        FleetSave.fleetTable(table519Node);
        Fleet.addTables($(table519Node[0]));
        Fleet.enrichFleetView(table519Node[0]);
        Fleet.harvestFleetInfo(table519Node[0]);
        Fleet.autofarmWork(table519Node[0]);
    },

    table519FleetStep1: function (table519Node) {
        FleetSave.fleetStep1(table519Node);
        Fleet.autofarmWork(table519Node[0]);

        return false;
    },

    table519FleetStep2: function (table519Node) {
        FleetSave.fleetStep2(table519Node);
        Fleet.autofarmWork(table519Node[0]);
    },

    table519FleetStep3: function (table519Node) {
        FleetSave.fleetStep3(table519Node);
        Fleet.harvestFleetInfo(table519Node[0]);
        Fleet.autofarmWork(table519Node[0]);
    },

    table569Galaxy: function (table569Node) {
        Galaxy.makeRichView(table569Node[0]);
        Galaxy.addAutoscanButtons();
        Galaxy.scanSystem(table569Node[0]);
    },

    table519Statistics: function (table519Node) {
        //Statistics.scanStatistics(table519Node);
    },

    messagesTable: function(messagesTableNode) {
        Messages.addCopyAllButton(messagesTableNode);
    },

    allPages: function () {
        FleetSave.addFleetSaveButton();
        KeepActive.work();
        //Fleet.addButtonsMenu();
    },

    work: function () {
        switch ($.urlParam("page")) {
            case "overview":
                waitForKeyElements(".table519", Workers.table519Overview);
                break;
            case "fleetTable":
                waitForKeyElements(".table519", Workers.table519FleetTable);
                break;
            case "fleetStep1":
                waitForKeyElements(".table519", Workers.table519FleetStep1, true);
                break;
            case "fleetStep2":
                waitForKeyElements(".table519", Workers.table519FleetStep2);
                break;
            case "fleetStep3":
                waitForKeyElements(".table519", Workers.table519FleetStep3);
                break;
            case "messages":
                waitForKeyElements("#messagestable", Workers.messagesTable);
                Fleet.autofarmWork();
                break;
            case "galaxy":
                waitForKeyElements(".table569", Workers.table569Galaxy);
                break;
            case "statistics":
                waitForKeyElements(".table519", Workers.table519Statistics);
                break;
        }

        Workers.allPages();
    }
}
// ----------------------------------------------End of Classes------------------------------------------------

Workers.work();