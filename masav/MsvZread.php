<?php
namespace masav;

    interface ImsvfileRead {
        public function validateFileType($file);
        public function readRawfile();
        public function validateFileData();
        public function designFileData(); //returns designd data as JSON.
    }

      class MsvZfileRead implements ImsvfileRead {
        public $rawFile;
        public $ExtractedData; 
        public $errorMsg = array();


        function returnFileData($msv_file) {
            # Validate the file type
            $validateType = $this->validateFileType(strval($msv_file["name"])); 
            if (!$validateType) {
                return;
            }

            # set $this->rawFile to be the files path.
            $this->rawFile = $msv_file["tmp_name"];
            
             # First we check that the file is not empty.
             if (empty($this->rawFile)) {
                $this->errorMsg[] = "ERROR: no data found";
                return;
            }

            # Read file content and extract it into an array.
            $this->ExtractedData = $this->readRawfile($this->rawFile);

            # Do some data validations to make shure the file is accually a 'msv' designed file.
            $validatData = $this->validateFileData();
            if (!$validatData) {
                return;
            }

            # Return The data in a Readable array.
            $fileData = $this->designFileData();

            return json_encode($fileData);
        }


    #region //extract data from raw file and return it designed
        public function designFileData() {

            // Get raw data and set
            $rawData = $this->ExtractedData;

            // Transactions
            foreach ($rawData["tnout"] as $key => $payee) {
                $trans[] = array(
                    "payeeName" => $payee["payeeName"],
                    "payeeID" => $payee["payeeID"],
                    "pymtSum" => $this->str2float($payee["pymtSum"]),
                    "payeeBank" => (int)$payee["bankCode"],
                    "payeeBranch" => (int)$payee["branchCode"],
                    "payeeAccount" => (int)$payee["accountNumber"],
                    "pymtPeriodfrom" => substr($payee["pymtperiod"], 0, 4),
                    "pymtPeriodto" => substr($payee["pymtperiod"], 4, 4),
                    "pymtRefference" => (int)$payee["payeeRefrence"]
                );
            }
           
            // Title & Summary
            $desigendData = array(
                "mosad" => array(
                    "codeMosad" => $rawData["koteret"]["MosadSholeach"],
                    "codeMosadSubject" => substr($rawData["koteret"]["MosadTitle"], 5, 3),
                    "mosadName" => $rawData["koteret"]["MosadName"]
                ),
                "pymtDetails" => array(
                    "pymtDate" => date('Y-m-d', strtotime(implode("-",str_split($rawData["koteret"]["pymtDate"],2)))),
                    "createDate" => implode("/",str_split($rawData["koteret"]["createDate"],2)),  //Not showm to client..
                    "transactionsSum" => array_sum(array_column($trans, 'pymtSum')),
                    "transactionsCount" => count(array_column($trans, 'pymtSum'))
                ),
                "transactions" => $trans
            );

            return $desigendData;
        }
    #endregion

    #region raw-file-handling
        public function readRawfile() {
            $f = fopen($this->rawFile, 'r') or die('File not found');

            $lines = array();
            while(!feof($f)) {
                $line = fgets($f);
                if (!empty(trim($line))) {
                    $lines[] = $line;
                }
            }
            fclose($f);
            
            $linecount = count($lines);
            foreach ($lines as $index => $line) {
                switch ($index) {
                    case 0:
                        $firstLine = $this->firstLine($line);
                    break;
                    case $linecount -1:
                        $lastLine = $line;
                    break;
                    case  $linecount -2:
                        $summaryLine = $this->summaryLine($line);
                    break;
                    default:
                        $middleLines[] = $this->middleLines($line);
                }
            }
            //store file data in readable array
            $result = array(
                "koteret" => $firstLine,
                "tnout" => $middleLines,
                "summary" => $summaryLine,
                "endLine" => $lastLine
            );
            return $result;
        }


        private function firstLine($line) {
            $arr = array(
                "zihuiReshuma" => $line[0],
                "MosadTitle" => substr($line,1,8),
                "currence" => substr($line, 9, 2),
                "pymtDate" => substr($line, 11,6),
                "filler1" => substr($line, 17,1),
                "serialNum" => substr($line, 18,3),
                "filler2" => substr($line, 21,1),
                "createDate" => substr($line, 22,6),
                "MosadSholeach" => substr($line, 28, 5),
                "filler3" => substr($line, 33, 6),
                "MosadName" => trim(iconv('CSPC862LATINHEBREW', 'UTF-8', strrev(substr($line,39, 30)))), //ENCODING.. 
                "filler4" => substr($line, 69, 56),
                "zihiukoteret" => substr($line, 125,3)
            );
            return $arr;
        }

        private function middleLines($line) {
            $arr = array(
                "zihiuReshuma" => $line[0],
                "mosadSubject" => substr($line, 1, 8),
                "currency" => substr($line, 9, 2),
                "filler1" => substr($line, 11, 6),
                "bankCode" => substr($line, 17, 2),
                "branchCode" => substr($line, 19, 3),
                "accountType" => substr($line, 22, 4),
                "accountNumber" => substr($line, 26, 9),
                "filler2" => substr($line, 25, 1),
                "payeeID" => substr($line, 36, 9),
                "payeeName" => trim(iconv( 'CSPC862LATINHEBREW', 'UTF-8', strrev(substr($line, 45, 16)))),  
                "pymtSum" => substr($line, 61, 13),
                "payeeRefrence" => substr($line, 74, 20),
                "pymtperiod" => substr($line, 94, 8),
                "melelCode" => substr($line, 102, 3),
                "tnuaType" => substr($line, 105, 3),
                "filler3" => substr($line, 108, 18),
                "blankFiller" => substr($line, 126, 2)
            );
            return $arr;
        }

        private function summaryLine($line) {
            $arr = array(
                "zihiuReshuma" => $line[0],
                "MosadTitle" => substr($line,1,8),
                "currence" => substr($line, 9, 2),
                "pymtDate" => substr($line, 11,6),
                "filler1" => substr($line, 17,1),
                "serialNum" => substr($line, 18,3),
                "tnoutSummary" => substr($line, 21, 15),
                "filler2" => substr($line, 36, 15),
                "tnuotCount" => substr($line, 51, 7),
                "filler3" => substr($line, 58, 7),
                "blankFiller" => substr($line, 65, 63)
            );
            return $arr;
        }
        
    #endregion

    #region validations & functions

        # FILE first Check
        public function validateFileType($fileName) {
            $allowedExts = array("txt", "001");
            $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION)); 
            if (in_array($fileType, $allowedExts)) {
                return "File type is OK";        
            } else {
                $this->errorMsg[] = "The file must be a text file with Extention '.txt' or '.001'";
                return;
            }  
        }

        
        public function validateFileData() {
            $lineErr = $this->validateLastLine();
            $otherDataErr =  $this->validateOtherSpecs();
            $summaryErr = 0;//$this->validateTotals();

            if ($lineErr || $otherDataErr || $summaryErr ) {
                $this->errorMsg[] = "שגיאה בקריאת קובץ. נתוני הקובץ אינם תקינים.";
                return false;

            } else {
                return "File validate SUCCESS!";
            }
        }

        private function validateLastLine() {
            # Last line must be all 9's duplicate 127 times.
            $endLine = $this->ExtractedData["endLine"];
            if (strpos($endLine, str_repeat("9", 127))){
                return "Last line error. last line:" .  $this->ExtractedData["endLine"];
            }
        }

        private function validateOtherSpecs() {
            # The first line should start will the letter 'K'.
            $result = $this->ExtractedData["koteret"]["zihuiReshuma"] == "K" ? false : "Error1,";

            # The word 'KOT' is suppose to be in the first line in position 126-128
            $result .= $this->ExtractedData["koteret"]["zihiukoteret"] == "KOT" ?  false : "Error2,";

            # Each line of middle lines are suppose to start with the number '1'.
            foreach ($this->ExtractedData["tnout"]  as $trans) {
                $result .= $trans["zihiuReshuma"] == 1 ?  false :"Error3,";
            }

            # The sumarry line (one before the end) is suppose to start with the number '5'.
            $result .= $this->ExtractedData["summary"]["zihiuReshuma"] == 5 ?  false : "Error4,";

            # if $result is false then file data is valid.
            if ($result) {
                return $result;
            }
        }

        private function validateTotals() {
            # Check transaction (payee) lines sum = summary line @ position 22-36.
            # Check transaction (payee) lines count = summary line @ position 52-58.
            $result = false;
            $summaryL = $this->ExtractedData["summary"];
            $testSum = array_sum(array_column($this->ExtractedData["tnout"], 'pymtSum'));
            $testCount = count($this->ExtractedData["tnout"]);

            if ($testSum != $summaryL["tnoutSummary"]) {
                $this->errorMsg[] = "error: סכום התנועות ברשומת הסיכום שונה מסכום התנועות בקובץ";
                $result = "ERROR";                
            } 
            if ($testCount != $summaryL["tnuotCount"]) {
                $this->errorMsg[] = "מספר התנועות ברשומת הסיכום שונה ממספר התנועות בקובץ";
                $result = "ERROR";  
            } 
            
            return $result;
        }
        
        public function str2float($str) {
            return number_format((float)$str/100, 2, '.', '');
        }
        
        
    #endregion


    }

    
   
?>