<?php
namespace masav;

    interface ImsvfileWrite {
        public function mkRawfile($inputData);
    }
   
    class MsvZfileWrite {
        public $designedData;
        public $rawFilePath;

    #region main-function
        public function mkRawfile($arr) {
            $mosad = $arr["mosad"];
            $transatcions = $arr["transactions"];
            $pymtDetails = $arr["pymtDetails"];
            // sum and count transaction
            $pymtDetails["transactionsSum"] = number_format(array_sum(array_column($transatcions, "pymtSum")), 2, '.', '');
            $pymtDetails["transactionsCount"] = count($transatcions);
            
            // Converting the data recived into three arrays:
            // first line (koteret), summary line, and all the transaction in the middle lines.
            $kot = $this->koteret($mosad, $pymtDetails);
            $middleLines = $this->transactions($transatcions, $kot);
            $lastLine = $this->summaryLine($pymtDetails, $kot);

            # load all data into raw text
            $fileContent = implode($kot);
            foreach( $middleLines as $line ) {
                $fileContent .= implode($line);
            }
            $fileContent .= implode($lastLine);
            $fileContent .= str_repeat('9', 127) . "\r\n";
            
            // Writing raw text to the file.
            $file = $this->mk_fileName();
            file_put_contents($file , trim($fileContent));
            return $file;
        }
    #endregion

    #region raw-file-contents 
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
                    "bankCode" => $this->zeroFiller(2 ,$pymt["payeeBank"]),
                    "branchCode" => $this->zeroFiller(3 ,$pymt["payeeBranch"]),
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

    #endregion

    #region Helper-functions
        private function zeroFiller($len, $input) {
            if (strlen($input) > $len) {
                $input = substr($input, - $len);
            }
            return str_repeat('0', ($len - strlen($input))) . $input;
        }

        #converting hebrew text into ascii heb encode. "csp862". 
        #reverting the text and adding filler space.
        private function hebText($len, $input) {
            $input = trim(strrev(iconv('UTF-8', 'CSPC862LATINHEBREW', $input)));
            if (strlen($input) > $len) {
                $input = substr($input, - $len);
            }
            return $input . str_repeat(' ', $len - strlen($input));
        }
        
        // Create a new txt file and name it
        private function mk_fileName() {
            $path = "/tmp";
            if (!is_dir($path)) {
                mkdir("tmp");
            }
            
            return $path . "/zikuim_" . date("y-m-d-H-i-s") . ".txt";
        }
    #endregion

    }


?>