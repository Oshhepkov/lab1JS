var request = require('request');
var address = 'http://www.rbc.ru';

var visitedUrls=[];
var foundEmails=[];
var emailsNumber = 0;
var limit = 10;

var emailRegex = /\b[\d\w_.+-]+@[\d\w-]+.[\d\w.]+/ig;
var reg1 = '<a href=[\'\"]';
var reg2 = '[:/.A-z?<_&\s=>0-9;-]+[\'\"]';
var linksRegex = new RegExp(reg1 + 
              escapeRegExp(address) + /* that was defined just now */
              reg2, "ig");

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function isUriImage(uri) {
    //make sure we remove any nasty GET params 
    uri = uri.split('?');
    if (typeof(uri) != "undefined" && uri) {
        uri = uri[0];
    }
    //moving on, split the uri into parts that had dots before them
    var parts = uri.split('.');
    //get the last part ( should be the extension )
    var extension = parts[parts.length-1];
    //define some image types to test against
    var imageTypes = ['jpg','jpeg','tiff','png','gif','bmp'];
    //check if the extension matches anything in the list.
    if(imageTypes.indexOf(extension) !== -1) {
        return true;   
    }
}

scrape(address,0);

function scrape(url, loop)
{
	loop+=1;
    request(url, function (err,res,body) 
    {
        if (err) {
            var c = err;
           //throw err;
        }
        else {
            var emails=body.match(emailRegex);
            if(typeof(emails)!= "undefined" && emails) {
                for (i = 0; i < emails.length; i++) {
                    if (foundEmails.indexOf(emails[i]) == -1) {
                        foundEmails.push(emails[i]);
                    }
                }
            }
            
            var links=body.match(linksRegex);
            if (typeof(links) != "undefined" && links) {
                for (i = 0; i < links.length; i++) {
                    links[i] = links[i].split('\"')[1].toLowerCase();
                }

                for(i=0; i<links.length; i++)
                {
                    if (visitedUrls.indexOf(links[i]) == -1 && loop<limit && !isUriImage(links[i])) {
                        var nextPage = links[i];
                        scrape(nextPage, loop);
                        visitedUrls.push(nextPage);
                        console.log(nextPage);
                    }
                }   
            }
        }
        
        if (emailsNumber < foundEmails.length) 
        {
            console.log("(" + foundEmails.length + ") Emails: " + foundEmails + "\n ---------");
            emailsNumber = foundEmails.length;
        }
    });
}