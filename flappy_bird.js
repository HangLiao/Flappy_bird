//source: https://code.sololearn.com/W1O96yrdL6aU/#html
//init
//pictures:
//background: http://s2js.com/img/etc/flappyback.png
//bird: http://s2js.com/img/etc/flappybird.png
//bottom_bar: http://s2js.com/img/etc/flappybottom.png
//pipe_piece: http://s2js.com/img/etc/flappypipe.png
//finish_line: http://s2js.com/img/etc/flappyend.png
//sounds:
//get_score
//flap
var ctx = myCanvas.getContext("2d"); 
var FPS = 40;
var jump_amount = -10;
var max_fall_speed= +10;
var acceleration = 1;
var pipe_speed = -2;
var mode = 'prestart';
var time_game_last_running;
var bottom_bar_offset = 0;
var pipes = [];
var score = 0;
var pipe_length = 100;
var first_pipe_x = 300;
var die_sound_played = false;
var page_updated = false;
update_HTML();
page_updated = false;


function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}

function play_wing_sound() {
  var click = wing_sound.cloneNode();
  click.play();
}

var die_sound = new sound("/static/sfx_die.wav");
var hit_sound = new sound("/static/sfx_hit.wav");
var score_sound = new sound("/static/sfx_point.wav");
var wing_sound = new Audio("/static/sfx_wing.wav");
wing_sound.preload = 'auto';
wing_sound.load();

function init_score() {
    ctx.font = "15px pixel";
    ctx.fillStyle = "white";
    ctx.fillText(score.toString(),155,75);
}
init_score();

var bird = new MySprite("http://s2js.com/img/etc/flappybird.png");
bird.x = myCanvas.width / 3;
bird.y = myCanvas.height / 2;

var bottom_bar = new Image();
bottom_bar.src = "http://s2js.com/img/etc/flappybottom.png";


function MySprite (img_url) {
    this.x = 0;
    this.y = 0; 
    this.visible= true;
    this.velocity_x = 0;
    this.velocity_y = 0;
    this.MyImg = new Image();
    this.MyImg.src = img_url || '';
    this.angle = 0;
    this.flipV = false;
    this.flipH = false;
}

MySprite.prototype.Do_Frame_Things = function() {
    ctx.save();
    ctx.translate(this.x + this.MyImg.width/2, this.y + this.MyImg.height/2);
    ctx.rotate(this.angle * Math.PI / 180);                       
    if (this.flipV) ctx.scale(1,-1);                              
    if (this.flipH) ctx.scale(-1,1);
    if (this.visible) ctx.drawImage(this.MyImg, -this.MyImg.width/2, -this.MyImg.height/2);
    this.x = this.x + this.velocity_x;
    this.y = this.y + this.velocity_y;                            
    ctx.restore();                                               
}

var pipe_piece = new Image();
pipe_piece.onload = add_all_my_pipes;                       
pipe_piece.src = "http://s2js.com/img/etc/flappypipe.png";

function add_all_my_pipes() {
    var x = first_pipe_x;
    for (var i = 0; i < pipe_length; i++) {
        x += 150 + Math.floor((Math.random() * 100) + 1);
        var top_of_gap = 5 + Math.floor((Math.random() * 300) + 1);
        var gap_width = 105 + Math.floor((Math.random() * 60) + 1);
        add_pipe(x, top_of_gap, gap_width);
    }

    var finish_line = new MySprite("http://s2js.com/img/etc/flappyend.png");
    finish_line.x = x + 300;
    finish_line.velocity_x = pipe_speed;
    pipes.push(finish_line);
}

function add_pipe(x_pos, top_of_gap, gap_width) {             
    var top_pipe = new MySprite();
    top_pipe.MyImg = pipe_piece;                              
    top_pipe.x = x_pos;                                       
    top_pipe.y = top_of_gap - pipe_piece.height;              
    top_pipe.velocity_x = pipe_speed;            
    pipes.push(top_pipe);         
    var bottom_pipe = new MySprite();
    bottom_pipe.MyImg = pipe_piece;
    bottom_pipe.flipV = true;                                
    bottom_pipe.x = x_pos;
    bottom_pipe.y = top_of_gap + gap_width;
    bottom_pipe.velocity_x = pipe_speed;
    pipes.push(bottom_pipe);
}

function show_the_pipes() {                          
    for (var i = 0; i < pipes.length; i++) {
        pipes[i].Do_Frame_Things(); 
    }
}

function display_bar_running_along_bottom() {
    if (bottom_bar_offset < -23) {
        bottom_bar_offset = 0;
    }
    ctx.drawImage(bottom_bar, bottom_bar_offset, myCanvas.height - bottom_bar.height);
}


//------------------------------------------------------------------------------

// need change for the case where bird flies too high
function ImagesTouching(thing1, thing2) {
    if (!thing1.visible  || !thing2.visible) {
        return false;         
    }
    if (thing1.x >= thing2.x + thing2.MyImg.width || thing1.x + thing1.MyImg.width <= thing2.x) {
        return false;  
    }
    if (thing1.y >= 0 && (thing1.y >= thing2.y + thing2.MyImg.height || thing1.y + thing1.MyImg.height <= thing2.y)) { 
        return false;
    }
    hit_sound.play();
    return true;
}

function check_for_end_game() {
    if (ImagesTouching(bird, pipes[2 * score]) || ImagesTouching(bird, pipes[2 * score + 1])) {
        mode = "over";   
    }
    if (score >= 1 && (ImagesTouching(bird, pipes[2 * score - 2]) || ImagesTouching(bird, pipes[2 * score - 1]))) {
        mode = "over";
    }
}

function update_score () {
    if (pipes[2 * score].x < bird.x) {
        score = score + 1;     // two pipes
        score_sound.play();       
    }
    ctx.font = "15px pixel";
    ctx.fillStyle = "white";
    ctx.fillText(score.toString(),155,75);
}

function display_game_over() {
    if (die_sound_played == false) {
        die_sound.play();
    }
    die_sound_played = true;

    ctx.font = "20px pixel";
    ctx.fillStyle = "black";
    ctx.fillText("GAME OVER",75,200);
}

function Got_Player_Input(MyEvent) {
    if (MyEvent.keyCode == 32) {
        switch (mode) {
            case 'prestart': {
                mode = 'running';
                break;
                
            }
            case 'running': {
                bird.velocity_y = jump_amount;
                play_wing_sound();
                break;
            }
            case 'over': 
                if (new Date() - time_game_last_running > 1000) {
                    reset_game();
                    mode = 'running';
                    break;
                }
        }
    }
    MyEvent.preventDefault();
}
 
addEventListener("keydown", Got_Player_Input); 

function make_bird_slow_and_fall() {
    if (bird.velocity_y < max_fall_speed) {
        bird.velocity_y = bird.velocity_y + acceleration;    
    }  
    if (bird.y > myCanvas.height - bird.MyImg.height)  {      
        bird.velocity_y = 0;
        mode = 'over';
    }
}

function make_bird_tilt_appropriately() {
    if (bird.velocity_y < 0) {
        bird.angle= -15;                   
    }
    else if (bird.angle < 70) {                   
        bird.angle = bird.angle + 4;        
    }
}


function update_HTML() {
    if (page_updated == false) {

        var xhttp = new XMLHttpRequest();
        var score_str = score.toString();
        for (var i = 0; i < 3 - score.toString().length; i++) {
            score_str = "0" + score_str;
        }

        var parameter = "?score=" + score_str; //str with 0
        xhttp.open("GET", "/updateScore/" + parameter, true);
        xhttp.send();

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                var response = JSON.parse(xhttp.responseText);
                document.getElementById("name1").innerText = response[0]["Name"];
                document.getElementById("score1").innerText = response[0]["Score"];
                document.getElementById("name2").innerText = response[1]["Name"];
                document.getElementById("score2").innerText = response[1]["Score"];
                document.getElementById("name3").innerText = response[2]["Name"];
                document.getElementById("score3").innerText = response[2]["Score"];
                document.getElementById("name4").innerText = response[3]["Name"];
                document.getElementById("score4").innerText = response[3]["Score"];
                document.getElementById("name5").innerText = response[4]["Name"];
                document.getElementById("score5").innerText = response[4]["Score"];
            }
        }
    }
    page_updated = true;
}


function Do_a_Frame() {
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);   
    bird.Do_Frame_Things(); 
    display_bar_running_along_bottom();
    switch (mode) {
        case 'running': {
            time_game_last_running = new Date(); 
            bottom_bar_offset = bottom_bar_offset + pipe_speed; 
            show_the_pipes();
            make_bird_tilt_appropriately();
            make_bird_slow_and_fall();
            check_for_end_game();
            update_score();
            break;
        }
        case 'over': {
            update_score();
            make_bird_slow_and_fall();
            display_game_over();
            update_HTML();
            break;
        } 
    }
}


function reset_game() {
    bird.y = myCanvas.height / 3;
    bird.angle = 0;
    score = 0;
    init_score();
    pipes = [];                           // erase all the pipes from the array
    add_all_my_pipes();                 // and load them back in their starting positions 
    die_sound_played = false;
    page_updated = false;
}

//------------------------------------------------------------------------------

setInterval(Do_a_Frame, 1000/FPS);  