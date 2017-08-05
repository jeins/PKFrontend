<?php
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

$op = (isset($_GET['op']) ? $_GET['op'] : "noclue" );
$format = (isset($_GET['format']) ? $_GET['format'] : "noformat" );

if($op=="nlp2ll"){
    $NLP = $_GET["nlp"];
    $NLP=(string)$NLP;
    $koord=nlp2ll($NLP);
    $lo = $koord[0];
    $bo = $koord[1];
    $li = $koord[2];
    $bi = $koord[3];
    if ($format == "geojson"){
        cetakJSON($NLP,$lo,$bo,$li,$bi);
    }else{
        cetakKoord($NLP,$lo,$bo,$li,$bi);
    }
}elseif($op=="ll2nlp"){
    $lat = $_GET["lat"];
    $lon = $_GET["lon"];
    $skala = $_GET["skala"];
    if($lat<-12 or $lat>7){
        echo "error ll2nlp : latitude outside indonesia region";
    } elseif($lon<93 or $lon > 142){
        echo "error ll2nlp : longitude outside indonesia region";
    }else{
        if($skala == "10k"){
            $nlp=n10($lat,$lon); //function "n" converts lat,lon to NLP number
        }elseif($skala == "25k"){$nlp=n25($lat,$lon);
        }elseif($skala == "50k"){$nlp=n50($lat,$lon);
        }elseif($skala == "250k"){$nlp=n250($lat,$lon);
        }else {echo "error ll2nlp : the map scale is not BIG's standard";}

        $koord=nlp2ll($nlp);
        $lo = $koord[0];
        $bo = $koord[1];
        $li = $koord[2];
        $bi = $koord[3];
        if ($format == "geojson"){
            cetakJSON($nlp,$lo,$bo,$li,$bi);
        }else{
            cetakKoord($nlp,$lo,$bo,$li,$bi);
        }
    }
}else{
    echo '
<!DOCTYPE html>
	<html>
	<h1>Welcome to the NLP service!!!</h1>
	<p>This page dedicated to inform NLP (Nomor Lembar Peta) of BIG (national mapping agency of Indonesia).<br />
	You can retrieve NLP number (op=ll2nlp) from coordinates pair (lat, lon).<br /> 
	Or, you can get boundary of NLP (op=nlp2ll) by stating the NLP desired.<br/>
	Please send a request in a KVP format as the examples below.</p>

	<p><b><u>Example:</u></b></p>
	<p> lat lon to NLP request:<br/> <code>www.hariep.com/nlp?op=ll2nlp&lat=-6&lon=108.3&skala=25k</code> <br/> --> returns 1310-121</p>
	<p> NLP to lat lon request:<br/> <code>www.hariep.com/nlp?op=nlp2ll&nlp=1209-1237</code> <br/> --> returns coordinate [L0,B0,L1,B1], where (L0,B0) = Lower-left and (L1,B1) = Upper-right coordinates of the NLP boundary</p>
	
	<p><b><u>Optional parameter</u></b>: add "<code>&format=geojson</code>" in the end of request to return the result in GeoJSON polygon feature</p>
	
	<p>a glimpse of NLP to get sense of ll2nlp function can be seen <a href="visual.html">here</a></p><br/>
	
	<a href="/index.php">Back to main page</a>
	</html>
	';
}

//////////////////// FUNCTIONS ////////////////////////////////////////////////////////

function cetakKoord($NLP,$lo,$bo,$li,$bi){
    echo "

NLP : ".$NLP."<br/>
Lo  : ".$lo."<br/>
Bo  : ".$bo."<br/>
Li  : ".$li."<br/>
Bi  : ".$bi."<br/>
";

}

function cetakJSON($nlp,$lo,$bo,$li,$bi){
    echo '
	{"type": "Feature", "geometry":{"type": "Polygon", "coordinates": [[['.$bo.','.$lo.'],['.$bi.','.$lo.'],['.$bi.','.$li.'],['.$bo.','.$li.'],['.$bo.','.$lo.']]]},"properties":{"NLP":"'.$nlp.'"}}
	';
}

function nlp2ll($NLP){
    $qqqqq=strlen($NLP);
    if($qqqqq==4){
        $skala="250k";
    }elseif($qqqqq==7){
        $skala = "50k";
    }elseif($qqqqq ==8){
        $skala = "25k";
    }elseif ($qqqqq ==9){
        $skala ="10k";
    }else{
        echo "map scale error";
    }
    if ($skala == "10k"){
        $o=k10($NLP); //function "k" returns lat & lon pairs of lower-left NLP
        $u=0.0416667; // $u is delta latitude of respective scale
        $a=0.0416667; // $a is delta longitude of respective scale
        $li = $o[0]+$u;
        $bi = $o[1]+$a;
        $lo = $o[0];
        $bo = $o[1];
    }elseif($skala == "25k"){
        $o=k25($NLP);
        $u=.125;
        $a=.125;
        $li = $o[0]+$u;
        $bi = $o[1]+$a;
        $lo = $o[0];
        $bo = $o[1];
    }elseif($skala == "50k"){
        $o=k50($NLP);
        $u=.25;
        $a=.25;
        $li = $o[0]+$u;
        $bi = $o[1]+$a;
        $lo = $o[0];
        $bo = $o[1];
    }elseif($skala == "250k"){
        $o=k250($NLP);
        $u=1;
        $a=1.5;
        $li = $o[0]+$u;
        $bi = $o[1]+$a;
        $lo = $o[0];
        $bo = $o[1];
    }else {echo "error nlp2ll : the map scale is not BIG's standard";}

    return array($lo,$bo,$li,$bi);
}

///////////////// n - function ////////////////////////////////////////

function n250($lat,$lon){
    $aa = floor((1+($lon-90)/1.5));
    $bb = floor($lat+11+5);
    $xx = (string)$aa;
    $yy = (string)$bb;
    if(strlen($xx)==1){$xx="0".$xx;}
    if(strlen($yy)==1){$yy="0".$yy;}
    $nlp250 = $xx.$yy;
    return $nlp250;
}

function n100($lat,$lon){
    //echo "<p><i>n100	</i></p>";
    $nlp250 = n250($lat,$lon);
    $LoBo250 = k250($nlp250);
    $Lo = $LoBo250[0];
    $Bo = $LoBo250[1];
    $Li = $lat-$Lo;
    $Bi = $lon-$Bo;
    if($Li>=0 and $Li<0.5){
        if($Bi<0.5){
            $i="1";
        }elseif($Bi>=1){
            $i="3";
        }else{$i="2";}
    }else{
        if($Bi<0.5){
            $i = "4";
        }elseif($Bi>=1){
            $i="6";
        }else{
            $i="5";
        }
    }
    return $nlp250."-".$i;
}


function n50($lat,$lon){
    $nlp100=n100($lat,$lon);
    $LoBo100 = k100($nlp100);
    $Lo = $LoBo100[0];
    $Bo = $LoBo100[1];
    $Li = $lat-$Lo;
    $Bi = $lon-$Bo;
    if($Li>=0 and $Li<0.25){
        if($Bi<0.25){
            $j = "1";
        }else{
            $j = "2";
        }
    }else{
        if($Bi<0.25){
            $j = "3";
        }else{
            $j = "4";
        }
    }
    return $nlp100.$j;
}

function n25($lat,$lon){
    $nlp50=n50($lat,$lon);
    $LoBo50 = k50($nlp50);
    $Lo = $LoBo50[0];
    $Bo = $LoBo50[1];
    $Li = $lat-$Lo;
    $Bi = $lon-$Bo;
    if($Li>=0 and $Li<0.125){
        if($Bi<0.125){
            $k = "1";
        }else{
            $k = "2";
        }
    }else{
        if($Bi<0.125){
            $k = "3";
        }else{
            $k = "4";
        }
    }
    return $nlp50.$k;
}

function n10($lat,$lon){
    $nlp25 = n25($lat,$lon);
    $LoBo25 = k25($nlp25);
    $Lo = $LoBo25[0];
    $Bo = $LoBo25[1];
    $Li = $lat-$Lo;
    $Bi = $lon-$Bo;
    if($Li>=0 and $Li<0.0416667){
        if($Bi<0.0416667){
            $l="1";
        }elseif($Bi>=0.0833333){
            $l="3";
        }else{
            $l="2";
        }
    }elseif($Li>=0.0833333){
        if($Bi<0.0416667){
            $l="7";
        }elseif($Bi>=0.0833333){
            $l="9";
        }else{
            $l="8";
        }
    }else{
        if($Bi<0.0416667){
            $l="4";
        }elseif($Bi>=0.0833333){
            $l="6";
        }else{
            $l="5";
        }
    }
    return $nlp25.$l;
}
///////////////////////////////// k - functions ////////////////////////////////////

function k250($nlp){
    $nlp =(string)$nlp;
    $y = substr($nlp,0,2);
    $x = substr($nlp,2,2);
    $aa = (float)$y;
    $bb = (float)$x;
    $Bo = 90+($aa-1)*1.5;
    $Lo = $bb - 5 - 11;
    return array($Lo,$Bo);
}

function k100($nlp){
    $nlp = (string)$nlp;
    $aabb = substr($nlp,0,4); //	echo "<p>k100   $aabb</p>";
    $LB250 = k250($aabb);
    $Lo = $LB250[0];
    $Bo = $LB250[1];
    $w = substr($nlp,5,1);
    $w = (int)$w;
    if($w == 2 or $w == 5){
        $b = 0.5;
    }elseif($w == 3 or $w == 6){
        $b = 1;
    }else{
        $b =0;
    }

    if($w > 3){
        $l = 0.5;
    }else{
        $l = 0;
    }
    $Li = $Lo+$l;
    $Bi = $Bo+$b;
    return array($Li,$Bi);
}

function k50($nlp){
    $nlp = (string)$nlp;
    $aabbc = substr($nlp,0,6);
    $LB100 = k100($aabbc);
    $Lo = $LB100[0];
    $Bo = $LB100[1];
    $w = substr($nlp,6,1);
    $w = (int)$w;
    if($w == 2 or $w == 4){
        $b =0.25;
    }else{
        $b=0;
    }

    if($w ==3 or $w == 4){
        $l = 0.25;
    }else{
        $l = 0;
    }
    $Li = $Lo+$l;
    $Bi = $Bo+$b;
    return array($Li,$Bi);
}

function k25($nlp){
    $nlp = (string)$nlp;
    $aabbcd = substr($nlp,0,7);
    $LB50 = k50($aabbcd);
    $Lo = $LB50[0];
    $Bo = $LB50[1];
    $w = substr($nlp,7,1);
    $w = (int)$w;
    if($w == 2 or $w == 4){
        $b =0.125;
    }else{
        $b=0;
    }

    if($w ==3 or $w == 4){
        $l = 0.125;
    }else{
        $l = 0;
    }
    $Li = $Lo+$l;
    $Bi = $Bo+$b;
    return array($Li,$Bi);
}

function k10($nlp){
    $nlp = (string)$nlp;
    $aabbcde = substr($nlp,0,8);
    $LB25 = k25($aabbcde);
    $Lo = $LB25[0];
    $Bo = $LB25[1];
    $w = substr($nlp,8,1);
    $w = (int)$w;
    if($w == 9 or $w == 6 or $w == 3){
        $b =0.0833333;
    }elseif($w == 8 or $w == 5 or $w == 2){
        $b = 0.0416667;
    }else{
        $b=0;
    }

    if($w == 9 or $w == 8 or $w == 7){
        $l =0.0833333;
    }elseif($w == 4 or $w == 5 or $w == 6){
        $l = 0.0416667;
    }else{
        $l=0;
    }
    $Li = $Lo+$l;
    $Bi = $Bo+$b;
    return array($Li,$Bi);
}
?>