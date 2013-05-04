var metronome = function(opts) {
    //primary variables
    var l = typeof opts.len !== "undefined" ? opts.len : 200, // length of metronome arm
        r = typeof opts.angle !== "undefined" ? opts.angle : 20, //max angle from upright 
    	w = 2 * l * Math.cos(r),
        tick_func = typeof opts.tick !== "undefined" ? opts.tick : function() {}, //function to call with each tick
        end_func = typeof opts.complete !== "undefined" ? opts.complete : function() {}, //function to call on completion
        playSound = typeof opts.sound !== "undefined" ? opts.sound : true; 

	// initialize Raphael paper if need be        
    switch(typeof opts.paper) {
		case "string": paper = Raphael(opts.paper, w, l + 20); break;
        case "undefined": paper = Raphael(0, 0, w, l + 20); break;
    }

	// initialize audio if need be
    if (playSound && opts.audio) {
		// initialize audio
		var sound = document.createElement('audio');
		sound.setAttribute('src', opts.audio);
		sound.setAttribute('id', 'tick');
		document.body.appendChild(sound);
    }
    
    // derivative variables
    var y0 = l * Math.cos(Math.PI * r / 180),
        x0 = l * Math.sin(Math.PI * r / 180),    
        y = l + 10,
        x = x0 + 10,    
        tick_count = 0;
    
    var outline = paper.path("M"+x+","+y+"l-"+x0+",-"+y0+"a"+l+","+l+" "+2*r+" 0,1 "+2*x0+",0L"+x+","+y).attr({
        fill: "#EEF",
        'stroke-width': 0    
    });
    
    var arm = paper.path("M" + x + "," + (y + 5) + "v-" + (l - 5)).attr({
        'stroke-width': 5,
        stroke: "#999"
    }).data("id", "arm");
        
    var weight = paper.path("M" + x + "," + (y-100) + "h12l-3,18h-18l-3-18h12").attr({
        'stroke-width': 0,
        fill: '#666'
    }).data("id", "weight");

    var vertex = paper.circle(x, y, 7).attr({
        'stroke-width': 0,
        fill: '#CCC'
    }).data("id", "vertex");

    var label = paper.text(x, y + 20, "").attr({
        "text-anchor": "center",
        "font-size": 14
    });

    var mn = paper.set(arm, weight);
    
    Raphael.easing_formulas.sinoid = function(n) { return Math.sin(Math.PI * n / 2) };

    function tick(obj, repeats) {      
        //Raphael summons the callback on each of the three objects in the set, so we
        //have to only call the sound once per iteration by associating it with one of the objects.
        //doesn't matter which one
        if (obj.data("id") === "arm") {
            tick_count += 1;
            if (playSound) {    
                document.getElementById("tick").play();
            }
            tick_func(tick_count);            
            if (tick_count >= repeats) {
                mn.attr("transform", "R0 " + x + "," + y);    
                end_func();
            }    
        }
    }    

    return {
        start: function(tempo, repeats, tickf, donef) {
            if (tickf) {
                tick_func = tickf;
            }
            if (donef) {
                end_func = donef;
            }
            
            tick_count = 0;
            mn.attr("transform", "R-" + r + " " + x + "," + y);                
            
            //2 iterations per animation * 60000 ms per minute / tempo
            var interval = 120000 / tempo;

			var animationDone = function() { 
				tick(this, repeats); 
			};
			
            var ticktockAnimationParam = {
                "50%": { transform:"R" + r + " " + x + "," + y, easing: "sinoid", callback: animationDone },
                "100%": { transform:"R-" + r + " " + x + "," + y, easing: "sinoid", callback: animationDone }
            };
            
            //animation            
			var ticktock = Raphael.animation(ticktockAnimationParam, interval).repeat(repeats / 2);
			arm.animate(ticktock);
			weight.animateWith(arm, ticktockAnimationParam, ticktock); 
        },
        stop: function() {
            mn.stop();
            mn.attr("transform", "R0 " + x + "," + y);                
            end_func();
        },
        shapes: function() {
        	return {
        		outline: outline,
        		arm: arm,
        		weight: weight,
        		vertex: vertex        	
        	}
        },
        make_input: function(el) {
        	$("<div />", {
        		html: 	"<span>tempo: </span>" + 
        				"<input class='metr_input' type='text' id='tempo' value='100' />" +
						"<span>ticks: </span>" +
						"<input class='metr_input' type='text' id='ticks' value='8' />" +
						"<button id='startstop'>start</button>" +
						"<div id='count'>0</div>"
        	}).appendTo(el);
        	
			$('#startstop').click(function() {
				// start animation
				if ($(this).html() === "start") {
					$(this).html("stop");            
					
					//get values for tempo and ticks and restrict
					var tempo = parseInt($('#tempo').val(), 10);
					if (!tempo) { tempo = 60; }
					else if (tempo > 200) { tempo = 200; }
					else if (tempo < 30) { tempo = 30; }
					$("#tempo").val(tempo);
					
					var ticks = parseInt($('#ticks').val(), 10);
					if (!ticks) { ticks = 20; }
					else if (ticks > 60) { ticks = 60; }
					else if (ticks < 8) { ticks = 8; }
					$("#ticks").val(ticks); 
					
					m.start(tempo, ticks);
				} else {
					$(this).html("start");
					m.stop();
				}
			});        	      	        
        }
    };
};