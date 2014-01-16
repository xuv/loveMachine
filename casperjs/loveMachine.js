var numberOfLikes = 0;
var nb = 1;
var loop = 0;
var maxLoop = 15;
var status = ' (y)';
var init = true;

// Retourne un entier aléatoire entre min et max
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

var casper = require('casper').create({
    clientScripts: [
        'include/jquery-1.10.2.min.js'
    ],
    logLevel: "info",              // Only "info" level messages will be logged
    verbose: false,
    viewportSize: {
        width: 1024,
        height: 768
    },
    waitTimeout: 10000
});


casper.start('https://facebook.com', function() {
    casper.then(function(){
        if( casper.cli.get('email') === undefined || casper.cli.get('password') == undefined ) {
            this.echo('usage : casperjs loveMachine.js --email=<email-to-log-into-FB> --password=<your-FB-pass>');
            this.exit();
        }
    });
    this.echo('Starting...');
});

// Catch console messages from the browser
casper.on('remote.message', function(msg) {
    this.echo('remote message caught: ' + msg);
});

var postStatus = function(){
    this.echo('Total likes : ' + numberOfLikes + '...');
    if( numberOfLikes > 0 ) {
        this.echo('Publish status: ' + numberOfLikes + status );
        this.click('textarea[name="xhpc_message"]');
        this.echo('Clicked status box');

        this.waitWhileSelector('textarea[class="DOMControl_placeholder"]', function() {
            this.echo('Writting status');
            status = numberOfLikes + status;
            this.fill('form[action="/ajax/updatestatus.php"]', {
                'xhpc_message_text' : status
            }, false);
        });

        this.then(function(){
            this.click('form[action="/ajax/updatestatus.php"] button[type="submit"]');
            this.echo('Clicked "submit"');
            // this.wait(1000);
        });

        // Précédent appel renvoie un : [warning] [remote] unable to submit form
        // Va peut-être falloir remplir à la main ?
        // ou cliquer sur le bouton "envoyer"

        // Évidemment, il voit tout de suite son texte dans la page vu qu'il est encore affiché dans la zone d'écriture du texte.
        this.waitWhileVisible('form[action="/ajax/updatestatus.php"] button[type="submit"]', function(){
            this.echo('status written');
            var date = new Date();
            this.capture('fb' + (new Date()).toISOString().substr(0,19).replace(/:/g, '') + '.jpg');
            this.echo('Screenshot taken');
            this.exit();
        });    
    } else {
        this.echo('No status posted');
        this.exit();
    }
} 

var doSomeLove = function () {
    if( init ){
        this.echo('Init...');
        this.evaluate(function(){
            window.nbLikes = 0;    
        });
        init = false;
    } 
    if (nb > 0 && loop < maxLoop ){
        // Find all 'like' buttons, count them and mark them with a crafted id 
        this.then(function(){
            this.echo('Starting to doSomeLove');
            this.evaluate(function(){
                window.done = false;
                $('a.UFILikeLink').each(function(){
                    if($(this).text() === 'Like'){
                        $(this).attr('id', 'like' + window.nbLikes );
                        console.log('Creating id="#like' + window.nbLikes + '"' );
                        window.nbLikes++;
                    }
                });
                window.done = true;
            }); 
        });

        this.waitFor(function(){
            return this.evaluate(function(){
                return window.done;
            }) === true;
        }); 

        this.then(function(){
            // Get the number of Likes to process
            nb = this.evaluate(function(){
                return window.nbLikes;
            }) - numberOfLikes;

            this.echo('Wave of likes (nb) : ' + nb);
        });

        this.then(function(){
            if(nb >0){
                this.repeat(nb, function(){
                    this.then(function(){
                        this.wait(getRandomInt(1000, 10000), function(){
                            this.click('#like' + numberOfLikes);    
                        });
                        this.echo('Clicked #like' + numberOfLikes);
                        numberOfLikes++;
                    });
                });    
            } else {
                this.echo('Pas de loop click');
            }    
        });
        
        this.then(function(){
            this.scrollToBottom();
        });

        this.then(function(){
            loop++;
            this.echo('loop: ' + loop);
            this.run(doSomeLove);    
        });
        
    } else {
        this.then(function(){
            this.echo('Call postStatus');
            postStatus.call(this);
        });
    }

}

// Log into Facebook
casper.then(function(){
    this.echo('Filling the login form');
    this.fill('form#login_form', {
        'email': casper.cli.get('email'),
        'pass': casper.cli.get('password')
    }, true);
});

// Wait for the login page to disappear and land on the homepage
casper.waitWhileSelector('form#login_form', doSomeLove, function(){
    this.echo('Never reached homepage. Quitting.').exit();
});

casper.run(doSomeLove);
