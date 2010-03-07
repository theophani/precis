<?php
if (isset($_GET['load'])) {
  // generate textile from html input
  require_once('html2textile.php');       // don't do any of this. GET TEXT FROM DB BASED ON ID
  $in = stripslashes($_POST['value']);   // 
  $detextile = new html2textile();       // 
  echo $detextile->detextile($in);       // 

} else {
  // generate html from textile input
  require_once('TextiLite.php');
  $textile = new TextiLite();
  $in = stripslashes($_POST['value']);
  echo $textile->textile($in);

// AND SAVE $textile TO DB BASED ON ID

}
?>