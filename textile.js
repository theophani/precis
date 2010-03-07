/*
* orginial function from Stuart Langridge at http://www.kryogenix.org/
* update function from Jeff Minard - http://www.jrm.cc/
* slash and burn (to limit support to only bold, italics and links) by Tiffany Conroy
*/
function superTextile(s,islist) {
    var r = s;
    // quick tags first
//    qtags = [['\\*', 'strong'],
//             ['\\?\\?', 'cite'],
//             ['\\+', 'ins'],  //fixed
//             ['~', 'sub'],   
//             ['\\^', 'sup'], // me
//             ['@', 'code']];

    qtags = [['\\*', 'strong']];

    for (var i=0;i<qtags.length;i++) {
        ttag = qtags[i][0]; htag = qtags[i][1];
        re = new RegExp(ttag+'\\b(.+?)\\b'+ttag,'g');
        r = r.replace(re,'<'+htag+'>'+'$1'+'</'+htag+'>');
    }
    // underscores count as part of a word, so do them separately
    re = new RegExp('\\b_(.+?)_\\b','g');
    r = r.replace(re,'<em>$1</em>');
	
	//jeff: so do dashes
//    re = new RegExp('[\s\n]-(.+?)-[\s\n]','g');
//    r = r.replace(re,'<del>$1</del>');

    // links
    re = new RegExp('"\\b(.+?)\\(\\b(.+?)\\b\\)":([^\\s]+)','g');
    //re = new RegExp('"\\b(.+?)\\(\\b(.+?)\\b\\)":([^\\s]+)','g');
    r = r.replace(re,'<a href="$3" title="$2">$1</a>');
    re = new RegExp('"\\b(.+?)\\b":([^\\s]+)','g');
    r = r.replace(re,'<a href="$2">$1</a>');

    // images
//    re = new RegExp('!\\b(.+?)\\(\\b(.+?)\\b\\)!','g');
//    r = r.replace(re,'<img src="$1" alt="$2">');
//    re = new RegExp('!\\b(.+?)\\b!','g');
//    r = r.replace(re,'<img src="$1">');
    
    // block level formatting
	
		// Jeff's hack to show single line breaks as they should.
		// insert breaks - but you get some....stupid ones
	    re = new RegExp('(.*)\n([^#\*\n].*)','g');
	    r = r.replace(re,'$1<br />$2');
		// remove the stupid breaks.
	    re = new RegExp('\n<br />','g');
	    r = r.replace(re,'\n');

    if(islist) {
      lines = r.split('\n');
      for (var i=0;i<lines.length;i++) {
        lines[i] = '<li>' + lines[i] + '</li>';
      }
      r = lines.join('\n');
    }
    
    return r;
}


function reloadPreviewDiv() { 
	var commentString = document.getElementById('message').value;
	var con = superTextile(commentString);
	document.getElementById('livecode').value = con;
	var c = document.getElementById('previewcomment');
	c.innerHTML = con;
}
