###  précis

## WTF:

précis adds in-place editing to configured* HTML files. The goal was to create a "micro CMS" for one page websites.

This repo can be seen in action here:
[dev.precis-project.com/test](http://dev.precis-project.com/test/)

## YTF:

The approach for a précis-powered one page website:
 - we create a simple one-page site design and code it in HTML/CSS
 - we serve that static page to site visitors
 - when the site owner visits http://sitelocation.com/edit they are prompted to login
 - after login the editing menu appears and the elements become editable in-place
 - i.e. the site owner can edit the page and save the edits online, with no special HTML knowledge

I say "configured" because presently, the HTML structure and classes much conform to précis' needs. As well, precis.config.css must contain form and control styling to match the page. I plan to remove (i.e abstract away) the need for the HTML to be so specifically formed.)

## LICENSE:

MIT [http://www.opensource.org/licenses/mit-license.php] (http://www.opensource.org/licenses/mit-license.php)

## SOME APOLOGIES:

Please use Chrome for testing. There are a few minor annoyances in FF still.

I hope it makes sense how to edit, add, remove and rearrange the items.

I don't expect anyone to understand how the flickr works since it is no where near done. I had big plans for this control. For now, to change the image, click the ID to edit it, change it to another valid flickr ID, and press enter.

In my original approach, I wanted to contain all the editing options within the HTML itself, in the form of classes and other attributes. i.e. I intentionally wanted each element to be the sole keeper of its current state including its options.

This approach started to breakdown when I added Twitter and flickr elements, since I needed additional options (e.g. user and tweet count). I added, as a temporary step, non-standard attributes to these items. I never intended to keep them that way.

The text areas use a reduced textile syntax.