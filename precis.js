/*
 * précis
 *
 * Copyright (c) 2010 Tiffany Conroy, Sebastian Ohm, Kristin Hofstee
 *
 * Project home:
 *   http://www.precis-project.com
 *
 */

$(function() {

/* EDITABLE SETTINGS */
    var editable_settings = {
        tooltip : "Click to edit",
        placeholder: "Click to edit",
        event   : "click",
        type    : 'autogrow',
        method  : "put",
        submit  : 'OK',
        cancel  : 'Cancel',
        del     : 'Delete',
        onblur  : "ignore",
        islist  : false,
        data    : prep_input
    }

    var editable_settings_span = {
        tooltip : "Click to edit",
        placeholder: "Click to edit",
        event   : "click",
        method  : "put",
        islist  : false,
        style : 'display: inline; padding: 0 4px;',
        data    : prep_input
    }
/* EDITABLE SETTINGS END */

    $.fn.addPrecis = function() {
      $(this).each( function() {
        if ( $(this).attr("tagName").toLowerCase()=='img' ) {
          // skip!
        } else {
          if ( $(this).attr("tagName").toLowerCase()=='ul' || $(this).attr("tagName").toLowerCase()=='ol' ) {
            this_settings = $.extend({}, editable_settings, {islist:true});
          } else if ( $(this).attr("tagName").toLowerCase()=='span') {
            this_settings = editable_settings_span;
          } else if ( $(this).attr("tagName").toLowerCase()=='div') {
            this_settings = $.extend({}, editable_settings, {type:'textarea'});
          } else {
            this_settings = editable_settings;
          }
          $(this).editable( function(value,settings) { return parse_input(value, settings, this); }, this_settings );
          $(this).addClass('precis-control');
        }
      });
    }

    $('.container > *').addPrecis(); // these lines turn on and off the editing.

/* PRE EDIT */
    
    function prep_input(value, settings) {
     
      // this is all html to textile:
      var $content = $('<div>').html(value);
     
      if (settings.islist) {
        var newvalue = '';
        $content.find('li').each(function(){
          newvalue += $(this).html() + '\n\n';
        });
        $content = $('<div>').html($.trim(newvalue));
      }
        
      easyTags = {
        strong  : "*",
        b       : "*",
        em      : "_",
        i       : "_"
      }

      $.each(easyTags, function(k,v) {
        $content.find(k).each( function() {
          $(this).replaceWith(v + $(this).text() + v);
        });
      });

      $content.find('br').each( function() {
        $(this).replaceWith('\n');
      });

      $content.find('a').each( function() {
        $(this).replaceWith('"' + $(this).text() + '":' + $(this).attr('href') + '' );
      });
      
      return $content.text(); // the extra HTML is stripped from text()
    }
/* PRE EDIT END */
  
/* POST EDIT */
    function parse_input(value, settings, element) {
      if (value=='') {
        $(element).remove();
        return false;
      }
      // strips html tags
      value=value.replace(/<\S[^><]*>/g, "");
      // converts allowed tags
      value = superTextile(value,settings.islist);
      
      $(element).attr('revert',value);
      $.fn.precisPersist();
      
      return value;
    }
/* POST EDIT END */


  
/* ADD MENU */
  $('.precis_menu').remove();
  $precisMenu = $('<div class="precis_menu"><h1>Menu</h1></div>');
  $('body').append($precisMenu);
/* ADD MENU END */


/* ADD PERSIST BUTTON */

/** Tiffany's notes to self:
should be converted to a function that accepts the target and options, which is totally NOT the case now.
I have not yet decided:
the function should be applied to (1) the body, and all editable areas would be detected,
and each would get a persist action, that operates on save, or (2) allied to each editable
area. (I think just once on the body is best, which allows for a global persist status ...)
EITHER WAY: this version does not allow more than one editable area BECAUSE
the PUT does not accept an identifier of any type. I do not want to sumbit an entire
HTML body, since then I would have to "recontruct" the ENTIRE body within javascript
*/

  $persistLink = $('<span class="action persist">Persist</span>');
  
  $.fn.precisClone = function() {
    
    var tagType = $(this).attr("tagName").toLowerCase();
    if (tagType=='img') { // any "protected" nodes caught here
      return $(this).clone();
    }
    
    var e = document.createElement( tagType );

    if ($(this).attr("editing")) { // can this flag be always trusted? relying on plugin
      $(e).html($(this).attr("revert"));
    } else {
      $(e).html($(this).html());
    }
    
    //e.addClass( $(this).attr('class') ); // reassign any classes and styles
    
    return e;
  }
  
  $.fn.precisPersist = function() {
    
    $persistLink.addClass('processing').html('Saving ...');
    
    $content = $('<div>');
    $('.container > *').each(function(){
      $content.append($(this).precisClone());
    });

    //if (confirm('BUGGY! REVIEW html before continuing: '+$content.html())) {
      //Yes, PUT is not supported cross browser, I know.
      $.ajax({
        url: "/",
        type: "PUT",
        data: {
          content: $content.html()
        },
        success: function() {
          $persistLink.removeClass('processing').addClass('success').html('Saved');
          setTimeout(function(){
            $persistLink.removeClass('success').html('Persist');
    			}, 1500);
        }
      });
    //} else {
    //      $persistLink.html('Cancelled');
    //      setTimeout(function(){
    //       $persistLink.removeClass('processing').html('Persist');
    //			}, 1500);
    //}
  }

   $persistLink.click($.fn.precisPersist);
  
  $precisMenu.append($persistLink);
  
/* ADD PERSIST BUTTON END */


/* ADD SORTABLE LINK */
		$(".container").sortable({connectWith: '.connected'});
		$(".container").sortable('disable');

    $enableSortableLink = $('<span class="enable-sortable action">Change order of items</span>');
    $disableSortableLink = $('<span class="disable-sortable action">Resume editing</span>');

    $enableSortableLink.click( function() {
      $('body').addClass('precis-disabled');
      $(".container").sortable('enable');
      $('.precis-control').each( function() {
          $(this).editable('disable');
          $(this).attr('title','Drag and drop to rearrange');
      });
    });
    $disableSortableLink.click( function() {
      $.fn.precisPersist();
      $('body').removeClass('precis-disabled');
      $(".container").sortable('disable');
      $('.precis-control').each( function() {
          $(this).editable('enable');
          $(this).attr('title', editable_settings['tooltip']);
      });
    });
    
    $(".precis_menu").append($enableSortableLink);
    $(".precis_menu").append($disableSortableLink);
    
/* ADD SORTABLE LINK END */


/* ADD ITEMS LINK */

  $addItemsLink = $('<span class="element-select">Add new item<div><ul><li><em>p</em><span>paragraph</span></li><li><em>h1</em><span>heading 1</span></li><li><em>h2</em><span>heading 2</span></li><li><em>h3</em><span>heading 3</span></li><li><em>ul</em><span>bulleted list</span></li><li><em>ol</em><span>numbered list</span></li><li><em>blockquote</em><span></span></li></ul></div></span>');
  
  $addItemsLink.find('li').click( function () {
    var tagType = $(this).children('em').text().toLowerCase();
    var e = $( document.createElement( tagType ) );
    if (tagType=='ul' || tagType=='ol') {
      e.html('<li>Click to edit your new element</li>');
    } else {
      e.html('Click to edit your new element');
    }
    e.addPrecis();
    $('.container:first').append(e);
    $.fn.precisPersist();
  });
  
  $precisMenu.append($addItemsLink);
/* ADD ITEMS END */

/* ADD LOGOUT LINK */
  $logoutLink = $('<span class="action logout">Logout</span>');
  $logoutLink.click(function(){
    alert('Not working yet. BLARG!');
  });
  $precisMenu.append($logoutLink);
/* ADD LOGOUT LINK END */

/* ADD CLOSE, and TUCK */
    $.fn.precisTuck = function() {
      $(this).addClass('tucked').click( function() {
        if ($(this).hasClass('tucked')) {
          $(this).removeClass('tucked', 500, function() {
            if ($(window).height() < $(this).height() ) $(this).css('position','absolute');          
          });
        }
      });
      $parent = $(this);
      var $tucker = $('<span class="action">X Hide menu</span>');
      $tucker.click( function() {
          $(this).parent().addClass('tucked', 500);
      });
      $(this).append($tucker);
    }
    $precisMenu.precisTuck();
    $('.precis_login').precisTuck();
/* ADD CLOSE, and TUCK END */
    
});