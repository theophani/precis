<?php
if (isset($_GET['load'])) {
  // generate textile from html input
  require_once('html2textile.php');
  $in = stripslashes($_POST['value']);
  $detextile = new html2textile();
  echo $detextile->detextile($in);
} else {
  // generate html from textile input
  require_once('TextiLite.php');
  $textile = new TextiLite();
  $in = stripslashes($_POST['value']);
  echo $textile->textile($in);
}
?>