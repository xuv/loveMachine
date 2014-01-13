var numberOfLikes = 0;
var nb = 1; 
var status = ' (y)';

var casper = require('casper').create({
    clientScripts: [
        'include/jquery-1.10.2.min.js'
    ],
    logLevel: "info",              // Only "info" level messages will be logged
    verbose: false,
    viewportSize: {
        width: 1024,
        height: 768
    }
});


casper.start('https://facebook.com', function() {
    casper.then(function(){
        if( casper.cli.get('email') === undefined || casper.cli.get('password') == undefined ) {
            this.echo('usage : casperjs loveMachine.js --email=<email-to-log-into-FB> --password=<your-FB-pass>');
            this.exit();
        }
    });
});

casper.then(function(){
    this.echo('Filling the login form');
    this.fill('form#login_form', {
        'email': casper.cli.get('email'),
        'pass': casper.cli.get('password')
    }, true);
});


// Catch console messages from the browser
casper.on('remote.message', function(msg) {
    this.echo('remote message caught: ' + msg);
});

// Wait for the login page to disappear and land on the homepage
casper.waitWhileSelector('form#login_form', function() {
    this.echo('Logged in ;)');
    //this.capture('fb' + (new Date()).toISOString().substr(0,19).replace(/:/g, '') + '.jpg');
});


casper.doSomeLove = function() {
    if (nb > 0 ){
        // Find all 'like' buttons, count them and mark them with a crafted id 
        this.echo('Starting to doSomeLove');
        this.evaluate(function(){
            window.done = false;
            $('a.UFILikeLink').each(function(){
                if($(this).text() === 'Like'){
                    $(this).attr('id', 'like' + window.nbLikes );
                    window.nbLikes++;
                }
            });
            window.done = true;
        }); 

        this.waitFor(function(){
            return this.evaluate(function(){
                return window.done;
            }) === true;
        }); 

        // Get the number of Likes to process
        nb = this.evaluate(function(){
            return window.nbLikes;
        }) - numberOfLikes;

        this.echo('Wave of likes : ' + nb);
        this.repeat(nb, function(){
            this.click('#like' + numberOfLikes);
            numberOfLikes++;
        });

        this.scrollToBottom();
        this.wait(1000);

        this.then(function(){
            this.doSomeLove();
        });

        this.then(function(){
            this.echo('Total likes : ' + numberOfLikes + '...');
        });
    }
}

casper.then(function(){
    this.evaluate(function(){
        window.nbLikes = 0;    
    });

    this.doSomeLove();
});


/*
casper.thenEvaluate(function(){
    window.nbLikes = 0;
    window.done = false;
    $('a.UFILikeLink').each(function(){
        if($(this).text() === 'Like'){
            $(this).attr('id', 'like' + window.nbLikes );
            window.nbLikes++;
        }
    });
    window.done = true;
});



casper.waitFor(function(){
    return this.evaluate(function(){
        return window.done;
    }) === true;
}); 

casper.then(function(){
    var nb = this.evaluate(function(){
        return window.nbLikes;
    });
    this.echo('First wave of likes : ' + nb);
    this.repeat(nb, function(){
        this.click('#like' + numberOfLikes);
        numberOfLikes++;
    });
    this.scrollToBottom();
});

casper.thenEvaluate(function(){
   window.done = false;
    $('a.UFILikeLink').each(function(){
        if($(this).text() === 'Like'){
            $(this).attr('id', 'like' + window.nbLikes );
            window.nbLikes++;
        }
    });
    window.done = true; 
});

casper.waitFor(function(){
    return this.evaluate(function(){
        return window.done;
    }) === true;
}); 

casper.then(function(){
    var nb = this.evaluate(function(){
        return window.nbLikes;
    }) - numberOfLikes ;
    this.echo('Second wave of likes: ' + nb );
    this.repeat(nb, function(){
        this.click('#like' + numberOfLikes);
        numberOfLikes++;
    });
    this.echo(numberOfLikes);
});
*/

/*
casper.then(function(){
    var likes = this.getElementsInfo('a.UFILikeLink');
    var i=0;
    this.repeat(likes.length, function(){
        this.echo(i + " : " + likes[i].html);
        this.echo(likes[i].attributes.id);
        if(likes[i].html === 'Like'){
            this.mouse.click(likes[i].x + 5, likes[i].y + 5);
            numberOfLikes++;
            this.wait(500, function(){
                this.echo(i + " : " + likes[i].html + ' (after wait)');
            });
        }

        i++;
    });
});
*/

casper.then(function(){
    if( numberOfLikes > 0 ) {

        casper.then(function() {
            this.echo('Publish status: ' + numberOfLikes + status );
            this.click('textarea[name="xhpc_message"]');
            this.echo('Clicked status box');
        });

        casper.waitWhileSelector('textarea[class="DOMControl_placeholder"]', function() {
            this.echo('Writting status');
            status = numberOfLikes + status;
            this.fill('form[action="/ajax/updatestatus.php"]', {
                'xhpc_message_text' : status
            }, false);
        });

        casper.then(function(){
            this.click('form[action="/ajax/updatestatus.php"] button[type="submit"]');
            this.echo('Clicked "submit"');
            // this.wait(1000);
        });

        // Précédent appel renvoie un : [warning] [remote] unable to submit form
        // Va peut-être falloir remplir à la main ?
        // ou cliquer sur le bouton "envoyer"

        // Évidemment, il voit tout de suite son texte dans la page vu qu'il est encore affiché dans la zone d'écriture du texte.
        casper.waitWhileVisible('form[action="/ajax/updatestatus.php"] button[type="submit"]', function(){
            this.echo('status written');
            var date = new Date();
            this.capture('fb' + (new Date()).toISOString().substr(0,19).replace(/:/g, '') + '.jpg');
            this.echo('Screenshot taken');
        });    
    }
});


casper.run();