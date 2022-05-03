<?php
    #region routing 
    $request = $_SERVER['REQUEST_URI'];
    $request = parse_url($request)['path'];

    switch ($request) {

        default:
            echo require_once __DIR__ . '/src/html/main.html';    
        break;
        
        case '/readZfile':
            // Recive msv file & return file data in readable json
            if( isset($_FILES) ) {  
                require_once('./masav/MsvZread.php');
                $msv = new  masav\MsvZfileRead();
                $res = $msv->returnFileData($_FILES["msvZfile"]);
        
                if ($res) {  
                    header("HTTP/1.1 200 OK");
                    header('Content-type: application/json');
                    echo $res;
                } else {
                $err = "<h4>שגיאה:</h4>";
                foreach ($msv->errorMsg as $error ) {
                    $err .= "<p> $error </p>";
                }
                header("HTTP/1.1 500 File type error");
                header('Content-type: application/json');
                echo $err;
                } 

            } else {
                echo "ERROR: No file!";
            }
            
        break;
        
        case '/writeZfile':
            // @@Recive data from client & create msv file.
            if(isset($_POST)) {

                $arr = array();

                //manupulate post data & organize in readable array (--> Need's to be done by client)
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
                require_once('./masav/MsvZwrite.php');
                $msv = new masav\MsvZfileWrite();
                $file = $msv->mkRawfile($msvZ);
                $downloadLink = "/fileDownload?name=" . pathinfo($file)['filename'];
                
                // Is this a safe way do to it???
                echo "<h1><a href='$downloadLink' id='downloadlink'>Download File</a></h1>";  
            }

        break;

        case '/fileDownload':
            if(isset($_GET["name"])) {
                $path = '/tmp//' . $_GET["name"] . ".txt";
                echo downloadFile($path);
            }
        break;

    }

   #endregion
   
    ///// FUNCTIONS /////

    function downloadFile($path) {
        $filePath = $path;
        $fileName = basename($filePath);
        if (empty($filePath)) {
            echo "File dosn't exsist!";
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