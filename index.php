<?php 

//// גם נדרש הוספת טופס ריק או טופס עם נתונים. ע"י קוד בצד לקוח או לשלוח טופס מוכן מPHP
   
?>
<html dir="rtl">

    <head>
        <meta charset="utf8">

        <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.22/css/jquery.dataTables.min.css">
        <link rel="stylesheet" type="text/css" href="http://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/css/jquery.dataTables.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

    </head>
    <body >

        <form id="read-file" enctype="multipart/form-data" action="#" method="post" >
            Choose a file:<br>
            <input name="msvZfile" type="file" id="msvZfile" required><br>
            <input id="submitf" type="submit" value="Send file">
        </form>

         

        <form id="file-create" action="" method="post">
            <label>*קוד מוסד</label>
            <input type="text" id="codeMosad" name="codeMosad" placeholder="קוד מוסד (5 ספרות)" required>
            <label>*קוד מוסד</label>
            <input type="text" id="codeMosadSubject" name="codeMosadSubject" placeholder="קוד מוסד -נושא (3 ספרות)" required>
            <br>
            <label>*שם המוסד המשלם</label>
            <input type="text" id="mosadName" name="mosadName" placeholder="שם המוסד המשלם" required>
            <br>
            <label>*תאריך ערך</label>
            <input type="date" id="pymtDate" name="pymtDate" placeholder="dd.mm.yy" required>
            <br>
            <table>
                <thead>
                    <tr>
                        <th>שם המקבל </th>
                        <th>ת.ז. המקבל</th>
                        <th>סכום התשלום</th>
                        <th>מספר בנק</th>
                        <th>מספר סניף</th>
                        <th>מספר חשבון</th>
                        <th>תקופת תשלום:</th>
                        <th>תקופת תשלום עד:</th>
                        <th>מספר אסמכתא</th>
                    </tr>
                </thead>
                <tbody id="fieldList">
                    
                </tbody>
            </table>
            <button id="addMore">Add more fields</button>
            <button id="removeLast">Remove last field</button>
            <br>
            <br>
            <input type="submit" id="submit">
        </form>

        <div id="result">
        </div>

    
        <script>
            //call row addition
            $(function() {
                $("#addMore").click(function(e) {
                    e.preventDefault();
                    addPayeeRow();
                });
            });

            //remove last field
            $(function() {
                $("#removeLast").click(function(e) {
                    e.preventDefault();
                    $('#fieldList tr:last').remove();
                });
            });


            //submit create file form 
            $(function() {
                $("#submit").click(function(e) {
                    e.preventDefault();
                    let valid = true;
                    $('[required]').each(function() {
                        if ($(this).is(':invalid') || !$(this).val()) valid = false;
                    })
                    if (!valid) {
                        alert("error please fill all fields!")
                    }else {
                        $.ajax({
                        type: "POST",
                        url: "init.php?fileCreate",
                        data: $("#file-create").serialize(),
                            beforeSend: function() {
                                $('#result').html($("#file-create").serialize());
                            },
                            success: function(data) {
                                $('#result').html(data);  ///NEED TO RESET FORM DATA
                                $("#result").attr('download', data);
                            }
                        });
                    }

                    
                });
            });


            //submit read file form
            $(function () {
                $( '#submitf' ).click(function ( e ) {
                    e.preventDefault();
                    var data;

                    data = new FormData();
                    data.append( 'msvZfile', $( '#msvZfile' )[0].files[0] );

                    $.ajax({
                        url: 'init.php?readFile=1',
                        data: data,
                        processData: false,
                        contentType: false,
                        dataTyp: 'json',
                        type: 'POST',
                            beforeSend: function() {
                                $('#result').html(data);
                            },
                            success: function ( res ) {
                                // Set form values
                                $('#codeMosad').val(res.mosad.codeMosad);
                                $('#codeMosadSubject').val(res.mosad.codeMosadSubject);
                                $('#mosadName').val(res.mosad.mosadName);
                                $('#pymtDate').val(res.pymtDetails.pymtDate);
                                
                                //insert transactions into form table
                                var trans = "";
                                $.each(res.transactions, function(i, payee) {
                                    trans += "<tr>";
                                    trans += `<td><input id="payeeName" name="payeeName[]" type="text" value="${payee.payeeName}" ></td>`;
                                    trans += `<td><input id="payeeID" name="payeeID[]" type="text" value="${payee.payeeID}" ></td>`;
                                    trans += `<td><input id="pymtSum" name="pymtSum[]" type="text" value="${payee.pymtSum}" ></td>`;
                                    trans += `<td><input id="payeeBank" name="payeeBank[]" type="text" value="${payee.payeeBank}" ></td>`;
                                    trans += `<td><input id="payeeBranch" name="payeeBranch[]" type="text" value="${payee.payeeBranch}" ></td>`;
                                    trans += `<td><input id="payeeAccount" name="payeeAccount[]" type="text" value="${payee.payeeAccount}" ></td>`;
                                    trans +=`<td><input id="pymtPeriodfrom" name="pymtPeriodfrom[]" type="text" value="${payee.pymtPeriodfrom}" ></td>`;
                                    trans += `<td><input id="pymtPeriodto" name="pymtPeriodto[]" type="text" value="${payee.pymtPeriodto}" ></td>`;
                                    trans += `<td><input id="pymtRefference" name="pymtRefference[]" type="text" value="${payee.pymtRefference}" ></td>`;
                                    trans += "</tr>";
                                });
                          
                                console.log(trans);
                                $('#fieldList').html(trans);
                            }
                    });                  
                });
            });
            
                
               

            //ready function
            $(document).ready( function() {
                addPayeeRow();
            });


            // Add payee rows in create new payment form
            function addPayeeRow(){
                trans = "<tr>";
                trans += `<td><input id="payeeName" name="payeeName[]" type="text" ></td>`;
                trans += `<td><input id="payeeID" name="payeeID[]" type="text" ></td>`;
                trans += `<td><input id="pymtSum" name="pymtSum[]" type="text"  ></td>`;
                trans += `<td><input id="payeeBank" name="payeeBank[]" type="text" ></td>`;
                trans += `<td><input id="payeeBranch" name="payeeBranch[]" type="text"  ></td>`;
                trans += `<td><input id="payeeAccount" name="payeeAccount[]" type="text" ></td>`;
                trans +=`<td><input id="pymtPeriodfrom" name="pymtPeriodfrom[]" type="text"  ></td>`;
                trans += `<td><input id="pymtPeriodto" name="pymtPeriodto[]" type="text" ></td>`;
                trans += `<td><input id="pymtRefference" name="pymtRefference[]" type="text" ></td>`;
                trans += "</tr>";
        
                $('#fieldList').append(trans);
            }
            
        
       </script>


    </body>
</html>