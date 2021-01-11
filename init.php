<?php
    require_once('./src/modules.php');
    use masav\MsvZfileRead as ZmsvExtract;
    use masav\MsvZfileWrite as MsvZfileWrite;
    require_once('./src/funcs.php');


    
    #region routing 

    // @@Recive msv file & return file data in readable array
    if( isset($_GET["readFile"]) & isset($_FILES) ) {  //add here get value!!
                            
        $msv = new ZmsvExtract();
        //Validates that extention is 'txt' or '001'
        $validateName = $msv->validateFileType(strval($_FILES["msvZfile"]["name"]));   
        
        if ($validateName) {
            $msv->rawFile = $_FILES["msvZfile"]["tmp_name"];
            $res = $msv->designFileData();
            
            header("HTTP/1.1 200 OK");
            header('Content-type: application/json');
            echo json_encode(utf8ize($res), JSON_PRETTY_PRINT);
        }
    }


    // @@Recive data from client & create msv file.
    if(isset($_POST) & isset($_GET["fileCreate"])) {

        $arr = array();

        //manupulate post data & organize in readable array
        // extract all transactions.
        foreach($_POST as $key => $post){
            if (is_array($post)) {
                for ($i=0; $i < count($post); $i++) {
                    $arr[$i][$key] = $post[$i];
                }  
            }               
        }
        // new array with all necacery data
        $msvZ = array(
                "mosad" => array(
                    "codeMosad" => $_POST["codeMosad"],
                    "codeMosadSubject" => $_POST["codeMosadSubject"],
                    "mosadName" => $_POST["mosadName"]
                ),
                "pymtDetails" => array(
                    "pymtDate" => $_POST["pymtDate"],
                    "createDate" => $_POST["pymtDate"]  ////לא תקין
                    //"transactionsSum" => $_POST["codeMosadSubject"],
                    //"transactionsCount" => $_POST["codeMosadSubject"]
                ),
                "transactions" => $arr
            );

      
        //Create a file from posted data
        $msv = new MsvZfileWrite();
        $file = $msv->mkRawfile($msvZ);
        $downloadLink = "init.php?fileDownload=" . pathinfo($file)['filename'];
        
        //send file download back to browser  ---NOT SAFE..
        //echo "<a href='$downloadLink' download>Download File</a>";
        //safe??
        echo "<a href='$downloadLink' >Download File</a>";
 
    }
    #endregion


     // @@Download msv file from tmp
     if((isset($_GET["fileDownload"]))) {
        $attachment_location = dirname(__DIR__) . '/' .'tmp/' . $_GET["fileDownload"] . ".txt";
        if (file_exists($attachment_location)) {

            header('Content-Type: application/octet-stream');
            header("Content-Disposition: attachment; filename= $attachment_location");
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($attachment_location));
            readfile($attachment_location);
            exit;
        }
    } 
       
     
?>