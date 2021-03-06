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

    $.fn.addPrecis = function() {
      
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
      
      function prep_input_count_select(value, settings) {
        return "{ '1':'Show the most recent tweet only', '2':'Show the 2 most recent tweets', '3':'Show the 3 most recent tweets', '4':'Show the 4 most recent tweets', '5':'Show the 5 most recent tweets', '6':'Show the 6 most recent tweets', '7':'Show the 7 most recent tweets', '8':'Show the 8 most recent tweets', '9':'Show the 9 most recent tweets', '10':'Show the 10 most recent tweets' }";
      }
    
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
        
        // just for flickr
        if ($(element).attr('parent-id')) {
          $('#'+$(element).attr('parent-id')).attr('photo_id',value);
          $('#'+$(element).attr('parent-id')).precisFlickr('reload');
        }
        
        $(element).attr('revert',value);
        // $.fn.precisPersist(); // in future, reintroduce as $.fn.precisPersist('temp')
        
        return value;
      }
      /* POST EDIT END */
      
      return $(this).each( function() {
        $(this).find('a').click(function(event){
          event.preventDefault();
        });
        if ( $(this).hasClass('no-precis') || $(this).hasClass('image') || $(this).attr("tagName").toLowerCase()=='img' ) {
          // skip!
          $(this).attr("title","This item is protected. It cannot be edited.");
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

    $('.container > *').addPrecis(); // apply ie. turn on the editing.


/* ADD MENU */
  $('.precis_menu').remove(); // get rid of no-javascript warning
  $precisMenu = $('<div class="precis_menu"><h1>Menu</h1></div>');
  $('body').append($precisMenu);
/* ADD MENU END */


/* ADD PERSIST BUTTON */

  $persistLink = $('<span class="action persist">Publish</span>');
  
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
          $persistLink.removeClass('success').html('Publish');
  			}, 1500);
      },
      error: function() {
        $persistLink.removeClass('processing').addClass('error').html('Unable to save');
        setTimeout(function(){
          $persistLink.removeClass('error').html('Publish');
  			}, 1500);
      }
    });

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
      $(".container > *").each(function(){
        if ( $(this).hasClass('precis-control') ) {
          $(this).editable('disable');
        }
        $(this).attr('old_title',$(this).attr('title'));
        $(this).attr('title','Drag and drop to rearrange');        
      });
    });
    $disableSortableLink.click( function() {
      //$.fn.precisPersist(); // in future, reintroduce as $.fn.precisPersist('temp')
      $('body').removeClass('precis-disabled');
      $(".container").sortable('disable');
      $(".container > *").each(function(){
        if ( $(this).hasClass('precis-control') ) {
          $(this).editable('enable');
        }
        $(this).attr('title', $(this).attr('old_title'));
        $(this).removeAttr('old_title');
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
    $('.newtarget:first').prepend(e);
    //$.fn.precisPersist(); // in future, reintroduce as $.fn.precisPersist('temp')
  });
  
  $precisMenu.append($addItemsLink);
/* ADD ITEMS END */

/* ADD HIGHLIGHT LINK */
//  $highlightLink = $('<span class="action highlight">Highlight editable areas</span>');
//  $highlightLink.click(function(){
//    if ($(this).hasClass('highlight')) {
//      $('.precis-control').addClass('precis-highlight');
//    } else {
//      $('.precis-control').removeClass('precis-highlight');
//    }
//  });
//  $precisMenu.append($highlightLink);
/* ADD HIGHLIGHT LINK END */

/* ADD LOGOUT LINK */
  $logoutLink = $('<span class="action logout">Logout</span>');
  $logoutLink.click(function(){
    alert('Not working yet. BLARG!');
    //  <a href="/admin/logout">Logout</a>
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


// twitter specifics
  precisTweet = function() {
    $('#twitter-control').addClass('loading');
    $.getJSON("http://twitter.com/statuses/user_timeline/"+$('#twitter-control').attr('user')+".json?callback=?",
      {
        count: $('#twitter-control').attr('count')
      },
      function (tweets) {
        $('#twitter-items li').remove();
        $(tweets).each(function(){
          $("<li/>").html(this.text+' <span class="date">'+prettyDate(this.created_at)+'</span>').appendTo("#twitter-items");
        });
        $('#twitter-control').removeClass('loading');
      });
  }
  precisTweet();

/* ADD CHANGE COUNT MENU */
  $changeTweetCount = $('<div class="element-select"><div><ul><li><span>Show</span><em>1</em><span>tweet only</span></li><li><span>Show</span><em>3</em><span>most recent</span></li><li><span>Show</span><em>5</em><span>most recent</span></li><li><span>Show</span><em>10</em><span>most recent</span></li></ul></div></div>');
  
  $changeTweetCount.find('li').click( function () {
    var tweetCount = $(this).children('em').text().toLowerCase();
    $('#twitter-control').attr('count',tweetCount);
    precisTweet();
  });
  
  $('#twitter-control').append($changeTweetCount);
/* ADD CHANGE COUNT MENU END */

  // flickr specifics
  $.fn.precisFlickr = function(option) {
    $(this).each(function(){
      var self = this;
      if (option=='reload') {
        $(self).addClass('loading');
        /* show the saving indicator */
        $.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&jsoncallback=?",
          {
            photo_id: $(self).attr('photo_id'),
            api_key: 'f70dc7c7597efd9e8a44f509df21c2ee'
          },
          function(data){
            if ( data.stat == 'ok' ) {
              var src = false;
              $(data.sizes['size']).each(function(){
                if (this.label=='Small' && parseInt(this.width) > 239) {
                  src = this.source;
                } else if (this.label=='Large' && src===false) {
                  src = this.source;
                }
              });
              if (src) {
                $(self).find('img').remove();
                $("<img/>").attr("src", src).attr("width", 240).prependTo(self);                
              }
            } else {
              // handle fail
            }
            $(self).removeClass('loading');
          });
          
      } else {
        var holder = $('<p class="prompt">This photo uses flickr id </p>');
        var container = $('<span class="container" />');
        var e = $( '<span parent-id="' + $(self).attr('id') + '">' + $(self).attr('photo_id') + '</span>' );
        e.addPrecis();
        container.append(e);
        holder.append(container);
        $(self).append(holder);
      } 
    });
    
  }
  $('.image').precisFlickr();

});

