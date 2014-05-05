var numberOfPostLikes = 0;
var numberOfCommentLikes = 0;
var totalLikes = 0;
var nbPL = 1;
var nbCL = 1;
var loop = 0;
var maxLoop = 15; // 25 seems to be a limit. Beyond that, FB starts throwing warnings.
var status = ' (y)';
var init = true;
var publishStatus = false;
var likePosts = true; // Does it have to like posts
var likeComments = true; //Does it have to like comments

// Retourne un entier aléatoire entre min et max
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

var casper = require('casper').create({
    clientScripts: [
        'include/jquery-1.10.2.min.js'
    ],
    logLevel: "debug", // Only "info" level messages will be logged
    verbose: false,
    viewportSize: {
        width: 1024,
        height: 768
    },
    waitTimeout: 10000
});

var fs = require('fs');

// Catch console messages from the browser
casper.on('remote.message', function(msg) {
    this.echo('remote message caught: ' + msg);
});

var takeScreenshot = function(){
    this.capture('fb' + (new Date()).toISOString().substr(0,19).replace(/:/g, '') + '.jpg', {
        top: 0,
        left: 0,
        width: 1024,
        height: 768
    });
    // this.capture('fb' + (new Date()).toISOString().substr(0,19).replace(/:/g, '') + '.jpg');
    this.echo('Screenshot taken');
}

var saveData = function(){
    var fileName = 'love-' + new Date().getFullYear() + '.txt';
    var data = {
        'date' : new Date().toJSON(),
        'likes' : totalLikes,
        'posts' : numberOfPostLikes,
        'comments' : numberOfCommentLikes
    };
    fs.write(fileName, JSON.stringify(data) + '\n', 'a');
}

var postStatus = function(){
    if ( !likePosts ){
        numberOfPostLikes--;    
    }
    if ( !likeComments ) {
        numberOfCommentLikes--;
    }
    // total
    totalLikes = numberOfPostLikes + numberOfCommentLikes;
    this.echo('Total likes : ' + totalLikes + '...');
    saveData();
    if( publishStatus && totalLikes > 0 ) {
        var messageToPost = totalLikes + status;
        this.echo('Publish status: ' + messageToPost );
        this.click('textarea[name="xhpc_message"]');
        this.echo('Clicked status box');

        this.waitWhileSelector('textarea[class="DOMControl_placeholder"]', function() {
            this.echo('Writting status');
            this.fill('form[action="/ajax/updatestatus.php"]', {
                'xhpc_message_text' : messageToPost
            }, false);
        });

        this.then(function(){
            this.click('form[action="/ajax/updatestatus.php"] button[type="submit"]');
        });

        this.waitWhileVisible('form[action="/ajax/updatestatus.php"] button[type="submit"]', function(){
            this.echo('status written');
            var date = new Date();
            takeScreenshot.call(this);
            this.exit();
        });    
    } else {
        this.echo('No status posted');
        takeScreenshot.call(this);
        this.exit();
    }
} 

var doSomeLove = function () {
    if( init ){
        // this.echo('Init...');
        this.evaluate(function(){
            window.likePosts = true;
            window.likeComments = true;
            window.nbPostLikes = 0; 
            window.nbCommentLikes = 0;   
        });
        init = false;
    }
    if ( (nbPL >0 || nbCL > 0) && loop < maxLoop ){
        // Find all 'like' buttons, count them and mark them with a crafted id 
        this.then(function(){
            console.log('Starting to doSomeLove');
            this.evaluate(function(){
                console.log('Enter evaluate');
                window.done = false;
                $('a.UFILikeLink').each(function(){
                    if($(this).text() === 'Like'){
                        if( $(this).attr('id') === undefined || $(this).attr('id') === "" ){
                            if ( window.likePosts && $(this).attr('title') === 'Like this' ){
                                $(this).attr('id', 'like' + window.nbPostLikes );
                                console.log('Creating id="#like' + window.nbPostLikes + '"' );
                                window.nbPostLikes++;    
                            }
                            if ( window.likeComments && $(this).attr('title') === 'Like this comment' ){
                                $(this).attr('id', 'commentLike' + window.nbCommentLikes );
                                console.log('Creating id="#commentLike' + window.nbCommentLikes + '"' );
                                window.nbCommentLikes++;    
                            }
                        } else {
                            console.log('Already has an ID: ' + $(this).attr('id') );
                        }
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
            if (likePosts) {
                nbPL = this.evaluate(function(){
                    return window.nbPostLikes;
                }) - numberOfPostLikes;
            } else {
                nbPL = 0;
            }

            if (likeComments){
                nbCL = this.evaluate(function(){
                    return window.nbCommentLikes;
                }) - numberOfCommentLikes;
            } else {
                nbCL = 0;
            }

            this.echo('Wave #' + loop + ' of likes (nbPL) : ' + nbPL + ' (nbCL) : ' + nbCL );
        });

        this.then(function(){
            if(likePosts && nbPL >0){
                this.repeat(nbPL, function(){
                    if (likePosts ){
                        this.then(function(){
                            var t = getRandomInt(1000, 10000);
                            this.echo('Will click #like' + numberOfPostLikes + ' in ' + t/1000 + ' sec');
                            this.wait( t , function(){
                                this.click('#like' + numberOfPostLikes);    
                                this.echo('Clicked #like' + numberOfPostLikes);
                                numberOfPostLikes++;
                            });
                            this.waitForSelector(
                                '.block_dialog', 
                                function() {
                                    likePosts = false;
                                    this.evaluate(function(){
                                        window.likePosts = false;
                                    });
                                    // this.captureSelector('block.png', '.block_dialog');
                                    this.echo('BLOCKED FROM LIKING');
                                    this.waitForSelector(
                                        '.uiLayer .layerCancel span',
                                        function() {
                                            this.click('.uiLayer .layerCancel span');
                                            this.echo('CLOSED -> .uiLayer .layerCancel span')
                                        },
                                        function() {
                                            this.echo('NO BUTTON -> .uiLayer .layerCancel span')
                                        },
                                        1000
                                    );
                                    this.click('.block_dialog input[name="close"]');
                                },
                                function() {
                                    this.echo('keep liking');
                                },
                                2000
                            );
                        });
                    }
                });    
            } else {
                this.echo('No looping click on posts');
            }    
        });

        this.then(function(){
            if(likeComments && nbCL >0){
                this.repeat(nbCL, function(){
                    this.then(function(){
                        var t = getRandomInt(1000, 10000);
                        this.echo('Will click #commentLike' + numberOfCommentLikes + ' in ' + t/1000 + ' sec');
                        this.wait( t , function(){
                            this.click('#commentLike' + numberOfCommentLikes);    
                            this.captureSelector('commentLike' + numberOfCommentLikes + '.png', '#commentLike' + numberOfCommentLikes);
                            this.echo('Clicked #commentLike' + numberOfCommentLikes);
                            numberOfCommentLikes++;
                        });
                    });
                });    
            } else {
                this.echo('No looping click on comments');
            }    
        });
        
        this.then(function(){
            //this.scrollToBottom();
            this.click('div[id^="more_pager_pagelet"] a');
            this.echo('Clicked for more (scroll bottom)');
        });

        this.wait(3000, function(){
            this.echo('waiting done');
        });

        this.then(function(){
            loop++;
            // this.echo('loop: ' + loop);
            // End of a love loop. Restart one.
            this.run(doSomeLove);    
        });
    } else {
        this.then(function(){
            // this.echo('Call postStatus');
            // Do no more loops. So call the post status and exit.
            postStatus.call(this);
        });
    }
}

// Start
casper.start('https://facebook.com', function() {
    casper.then(function(){
        // Check if login and password have been supplied
        if( casper.cli.get('email') === undefined || casper.cli.get('password') == undefined ) {
            this.echo('usage : casperjs loveMachine.js --email=<email-to-log-into-FB> --password=<your-FB-pass>');
            this.exit();
        }
    });
});

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

// Loop the love
casper.run(doSomeLove);
