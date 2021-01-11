<?php
namespace masav;


    class MsvZfileRead {
        public $rawFile; 
        public $newRawfile; 
        

        #region //extract data from raw file and return it designed
        public function designFileData() {
            if (empty($this->rawFile)) {
                return "ERROR: no data found";
            }
            // Get raw data and set
            $rawData = $this->readRawfile($this->rawFile);

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

           ////testing  ---MOVE OUT OF HERE ///////////////////////////////////////////////////////
            $test = array_sum(array_column($desigendData["transactions"], 'pymtSum'));
            if ($test - $desigendData["pymtDetails"]["transactionsSum"] != 0) {
                return "Error: " .($test - $desigendData["pymtDetails"]["transactionsSum"]) ." is not good...";
            }
            ///////////////////////////////////////////////////////////////////////////////
            return $desigendData;
        }
        #endregion

        #region ///raw file handling
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

        #region //validationsv & functions
        public function validateFileType($fileName) {
            $allowedExts = array("txt", "001");
            $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION)); 
            if (in_array($fileType, $allowedExts)) {
                return true;        
            } else {
                return false;
            }  
        }
        
        public function str2float($str) {
            return number_format((float)$str/100, 2, '.', '');
        }
        
        
        #endregion


    }

    
    class MsvZfileWrite {
        public $designedData;
        public $rawFilePath;

        public function mkRawfile($arr) {
            $mosad = $arr["mosad"];
            $transatcions = $arr["transactions"];
            $pymtDetails = $arr["pymtDetails"];
            // sum and count transaction
            $pymtDetails["transactionsSum"] = number_format(array_sum(array_column($transatcions, "pymtSum")), 2, '.', '');
            $pymtDetails["transactionsCount"] = count($transatcions);
            

            $kot = $this->koteret($mosad, $pymtDetails);
            $middleLines = $this->transactions($transatcions, $kot);
            $lastLine = $this->summaryLine($pymtDetails, $kot);

            $fileContent = implode($kot);
            foreach( $middleLines as $line ) {
                $fileContent .= implode($line);
            }
            $fileContent .= implode($lastLine);
            $fileContent .= str_repeat('9', 127) . "\r\n";
            

            $file = $this->mk_fileName();
            file_put_contents($file , trim($fileContent));
            return $file;
        }

        public function koteret($mosad, $pymtDetails) {
            $arr = array(
                "zihuiReshuma" => "K",
                "MosadTitle" => $this->zeroFiller(8, $mosad["codeMosad"].$mosad["codeMosadSubject"]),
                "currence" => "00",
                "pymtDate" => substr(str_replace("-", "", $pymtDetails["pymtDate"]), -6),  ///dangeros way!!!
                "filler1" => "0",
                "serialNum" => "001",
                "filler2" => "0",
                "createDate" => substr(str_replace("-", "", $pymtDetails["pymtDate"]), -6),
                "MosadSholeach" => $this->zeroFiller(5, $mosad["codeMosad"]),
                "filler3" => $this->zeroFiller(6,''),
                "MosadName" => $this->hebText(30, $mosad["mosadName"]),
                "filler4" => str_repeat(' ', 56),
                "zihiukoteret" => "KOT",
                'EOL' => "\r\n"
            );
            return $arr;
        }

        public function transactions ($payments, $kot) {
            $transatcions = array();
            foreach($payments as $pymt) {
                $transatcions[] = array(
                    "zihiuReshuma" => "1",
                    "mosadSubject" => $kot["MosadTitle"],
                    "currency" => $kot["currence"],
                    "filler1" => $this->zeroFiller(6,''),
                    "bankCode" => $pymt["payeeBank"],
                    "branchCode" => $pymt["payeeBranch"],
                    "accountType" => "0000",
                    "accountNumber" => $this->zeroFiller(9, $pymt["payeeAccount"]),
                    "filler2" => "0",
                    "payeeID" => $this->zeroFiller(9, $pymt["payeeID"]),
                    "payeeName" => $this->hebText(16, $pymt["payeeName"]),
                    "pymtSum" => $this->zeroFiller(13, str_replace(".", '',$pymt["pymtSum"])),
                    "payeeRefrence" => $this->zeroFiller(20, $pymt["pymtRefference"]),
                    "pymtperiod" =>  $this->zeroFiller(8, $pymt["pymtPeriodfrom"].$pymt["pymtPeriodto"]),
                    "melelCode" => "000",
                    "tnuaType" => "006",
                    "filler3" => $this->zeroFiller(18, ''),
                    "blankFiller" => str_repeat(' ', 2),
                    "CRLF" => "\r\n"
                );
            }
            return $transatcions;
        }

        public function summaryLine($pymtDetails, $kot) {
            $arr = array(
                "zihiuReshuma" => "5",
                "MosadTitle" => $kot["MosadTitle"],
                "currence" => $kot["currence"],
                "pymtDate" => $kot["pymtDate"],
                "filler1" => "0",
                "serialNum" => $kot["serialNum"],
                "tnoutSummary" => $this->zeroFiller(15, str_replace(".", '',$pymtDetails["transactionsSum"])),
                "filler2" => $this->zeroFiller(15, ''),
                "tnuotCount" =>  $this->zeroFiller(7,  $pymtDetails["transactionsCount"]),
                "filler3" => $this->zeroFiller(7, ''),
                "blankFiller" => str_repeat(' ', 63),
                "CRLF" => "\r\n"
            );
            return $arr;
        }



        /// FUNCTIONS ///
        private function zeroFiller($len, $input) {
            if (strlen($input) > $len) {
                $input = substr($input, - $len);
            }
            return str_repeat('0', ($len - strlen($input))) . $input;
        }

        private function hebText($len, $input) {
            //$input = mb_convert_encoding (strrev(trim($input)) , 'UTF-8');
            $input = trim(strrev(iconv('UTF-8', 'CSPC862LATINHEBREW', $input)));
            if (strlen($input) > $len) {
                $input = substr($input, - $len);
            }
            
            return $input . str_repeat(' ', $len - strlen($input));
        }
        
        private function mk_fileName() {
            return dirname(__DIR__) . "/tmp/zikuim_" . date("y-m-d-H-i-s") . ".txt";
        }
    }

?>