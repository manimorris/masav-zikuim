<!DOCTYPE html>
<html dir="rtl">

    <head>
        <title>הפקת קובץ תשלומים למסב</title>
        <meta charset="utf8">
        <META HTTP-EQUIV="Content-language" CONTENT="he">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!--Bootstrap css-->
        <link rel="stylesheet" href="https://cdn.rtlcss.com/bootstrap/v4.5.3/css/bootstrap.min.css" integrity="sha384-JvExCACAZcHNJEc7156QaHXTnQL3hQBixvj5RV5buE7vgnNEzzskDtx9NQ4p6BJe" crossorigin="anonymous">
        <!--Custom stylesheet css-->
        <link rel="stylesheet" href="css/style.css" type="text/css">

        <!-- jQuery, Popper.js, and Bootstrap JS -->
        <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN" crossorigin="anonymous"></script>
        <script src="https://cdn.rtlcss.com/bootstrap/v4.5.3/js/bootstrap.min.js" integrity="sha384-VmD+lKnI0Y4FPvr6hvZRw6xvdt/QZoNHQ4h5k0RL30aGkR9ylHU56BzrE2UoohWK" crossorigin="anonymous"></script>
        
        
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    </head>
    <body >

        <div class="container-fluid pt-3 my-3 border">

            

            <div id="drop_zone" 
                ondrop="dropHandler(event);" 
                ondragover="dragOverHandler(event);" 
                class="jumbotron container text-center custom-border">

                <p>גרור את הקובץ לכאן. או..</p>

                <form id="read-file" enctype="multipart/form-data" action="#" method="post" class="needs-validation"  >
                    <div class="custom-file mb-3">
                        <label class="btn btn-primary" for="msvZfile" >בחר קובץ.. </label>
                        <input name="msvZfile" type="file" id="msvZfile" class="" hidden>
                        <p id="file-chosen">No file chosen</p>
                    </div>
                        
                   
                    <div class="invalid-feedback">Please fill out this field.</div>
                </form>

            </div>
        

        

         
            <div class="container-fluid border p-3">
                <form id="file-create" action="" method="post" class=" " >
                    <fieldset id="form-head" class="form-inline mb-5">
                        <div class="input-group mb-2 mr-sm-2 col-5">
                            <div class="input-group-prepend">
                            <div class="input-group-text">שם המוסד</div>
                            </div>
                            <input type="text" id="mosadName" name="mosadName" class="form-control" placeholder="שם המוסד המשלם" required>
                        </div>
                        
                        <div class="input-group mb-2 mr-sm-2 col-3">
                            <div class="input-group-prepend">
                            <div class="input-group-text">קוד מוסד מלא</div>
                            </div>
                            <input type="number" id="codeMosad" name="codeMosad" 
                                class="form-control" 
                                placeholder="קוד מוסד (8 ספרות)" 
                                title="נדרש להזין קוד מוסד מלא הכולל: קוד מוסד (5 ספרות) ונושא (3 ספרות)"
                                inputmode="numeric"
                                required>
                            </div>
                        
                        <div class="input-group mb-2 mr-sm-2 col-3">
                            <div class="input-group-prepend">
                            <div class="input-group-text">תאריך פרעון</div>
                            </div>
                            <input type="date" id="pymtDate" name="pymtDate" class="form-control" placeholder="dd.mm.yy" required>
                        </div>

                    </fieldset>
                    <table class="table table-striped table-hover">
                        <thead class="thead-dark">
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
                        <tbody id="fieldList" >
                            
                        </tbody>
                    </table>
                    <fieldset id="payeeRow"></fieldset>
                    <button id="addMore" class="btn btn-success col-2">הוסף שורה</button>
                    <button id="removeLast" class="btn btn-danger col-2"> מחק שורה אחרונה</button>
                    <br>
                    <br>
                    <input id="submit" value="שלח" class="btn btn-lg btn-success btn-block">
                </form>
            </div>
            

            <div id="result" class="container-fluid text-center">
            </div>

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
                                $('#result').html(data);  
                                // Reset forms
                                $('#read-file').trigger('reset');
                                $('#file-create').trigger('reset');
                                $('#fieldList tr').remove();
                                addPayeeRow();
                            }
                        });
                    }

                    
                });
            });


            //submit read file form
            function msvFileupload(file) {
                var data;
                data = new FormData();
                data.set( 'msvZfile', file);

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
                            $('#codeMosad').val(res.mosad.codeMosad + res.mosad.codeMosadSubject);
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
                
                            $('#fieldList').html(trans);
                        },
                        error: function (err) {
                            ///testing
                            $('#result').html( err.responseText );
                        }

                });                  
            }
            
             // Drag 'n' Drop file handlers
             function dropHandler(e) {
                console.log('File Droped');

                e.preventDefault();

                if (e.dataTransfer.items.length > 1) {
                    console.log('Load only one file at a time.');
                } else if (!e.dataTransfer.files) {
                    console.log('No file was loaded.');
                } else {
                    console.log('... file name = ' + e.dataTransfer.files[0].name );
                    msvFileupload(e.dataTransfer.files[0]);
                }
            }
            function dragOverHandler(e) {
                console.log('file in drop zone.');
                e.preventDefault();
            }
            
            // //file upload function
            $( '#msvZfile' ).change(function (files) {
                $('#file-create').trigger("reset");
                $('#fieldList tr').remove();
                addPayeeRow();

                var file =  $( '#msvZfile' )[0].files[0];
                console.log(file);
                msvFileupload(file);
                $('#file-chosen').html(file.name);
            });

            // Add payee rows in create new payment form
            function addPayeeRow(){
                trans = "<tr>";
                trans += `<td><input id="payeeName" name="payeeName[]" type="text" ></td>`;
                trans += `<td><input id="payeeID" name="payeeID[]" type="number" ></td>`;
                trans += `<td><input id="pymtSum" name="pymtSum[]" type="number"  ></td>`;
                trans += `<td><input id="payeeBank" name="payeeBank[]" type="number" ></td>`;
                trans += `<td><input id="payeeBranch" name="payeeBranch[]" type="number"  ></td>`;
                trans += `<td><input id="payeeAccount" name="payeeAccount[]" type="number" ></td>`;
                trans += `<td><input id="pymtPeriodfrom" name="pymtPeriodfrom[]" type="number"  ></td>`;
                trans += `<td><input id="pymtPeriodto" name="pymtPeriodto[]" type="number" ></td>`;
                trans += `<td><input id="pymtRefference" name="pymtRefference[]" type="number" ></td>`;
                trans += "</tr>";
        
                $('#fieldList').append(trans);
            }


            //ready function
            $(document).ready( function() {
                addPayeeRow();
            });
            
        
       </script>


    </body>
</html>