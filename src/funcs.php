<?php
//// FUNCTIONS ///
        //echo json_encode(utf8ize($res), JSON_PRETTY_PRINT);  ----can be delete
    function utf8ize( $mixed ) {
        if (is_array($mixed)) {
            foreach ($mixed as $key => $value) {
                $mixed[$key] = utf8ize($value);
            }
        } elseif (is_string($mixed)) {
            return mb_convert_encoding($mixed, "UTF-8", "UTF-8");
        }
        return $mixed;
    }
  $arr = array( "A" => array(1,1,1),
                    "b" => array(2,2,2,2));

    echo count($arr["A"]);

//     $file = '../tmp/zikuim_21-01-06-17-02-56.txt';
//     $txt = file_get_contents($file);
   
//     echo $Ntxt = iconv('CSPC862LATINHEBREW', 'UTF-8', $txt )."\n";

//    $arr = explode(PHP_EOL, $txt);
//    foreach($arr as $l) { echo strlen($l)."\n";}
    //file_put_contents( '../tmp/Nfile.txt' ,iconv('UTF-8', 'CSPC862LATINHEBREW', $Ntxt ));

?>