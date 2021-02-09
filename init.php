<?php
    require_once('./src/modules.php');
    use masav\MsvZfileRead as MsvZfileRead;
    use masav\MsvZfileWrite as MsvZfileWrite;


    
    #region routing 

    // @@Recive msv file & return file data in readable json
    if( isset($_GET["readFile"]) & isset($_FILES) ) {  
        
        $msv = new MsvZfileRead();
        $res = $msv->returnFileData($_FILES["msvZfile"]);

        if ($res) {  
            header("HTTP/1.1 200 OK");
            header('Content-type: application/json');
            echo json_encode($res);
        } else {
        $err = "<h4>שגיאה:</h4>";
        foreach ($msv->errorMsg as $error ) {
            $err .= "<p> $error </p>";
        }
        header("HTTP/1.1 500 File type error");
        header('Content-type: application/json');
        echo $err;
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
                    "codeMosad" => substr($_POST["codeMosad"], 0, 5),
                    "codeMosadSubject" => substr($_POST["codeMosad"], 5, 3),
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
        
        
        // Is this a safe way do to it???
        echo "<h1><a href='$downloadLink' >Download File</a></h1>";  
            
 
    }
    #endregion


     // @@Download msv file from tmp
     if((isset($_GET["fileDownload"]))) {

        $path = dirname(__DIR__) . '/' .'masavZikuim/tmp/' . $_GET["fileDownload"] . ".txt";
        echo downloadFile($path);
    } 
       
     
    //@ Add payee row to form API  ---NOT IN USE YET
    if (isset($_GET["payeeRow"])) {
        $row = file_get_contents("src/html/payeeRow.html");
        echo $row;
    }


    ///// FUNCTIONS /////

    function downloadFile($path) {
        $filePath = $path;
        $fileName = basename($filePath);
        if (empty($filePath)) {
            echo "'path' cannot be empty";
            exit;
        }

        if (!file_exists($filePath)) {
            echo "'$filePath' does not exist";
            exit;
        }

        header("Content-disposition: attachment; filename=" . $fileName);
        header("Content-type: " . mime_content_type($filePath));
        readfile($filePath);

    }
?>