metronome
=========

A Raphael-powered metronome

## Dependencies
RaphaelJs
jQuery (for demo only)

## Setup
Include the ```metronome.js``` script in your page

## Usage


You initialize the metronome with a few parameters to set the size and angle of the animation. You can also attach custom functions to the tick event and the event that fires on the final tick. In the above example, I attach two functions that write updates to the screen.

    function tick(t) {
        $("<div />").html(t%2 === 1 ? "Tick":"Tock").appendTo(".status");
    	$("#count").html(t);    
    }
    
    function done() {
        $("<div />").html("Done!").appendTo(".status");
        $("#startstop").html("start");
    }
    
    var m = metronome({
        len: 200,
        angle: 20,
        paper: "metronome_container",
        tick: tick,
        complete: done,
        path: ""
    });

These are not actual Javascript events, though they probably should be.

The metronome has two functions, `.start()` and `.stop()`. The first takes two arguments, a tempo (expressed as beats per minute, like your piano teacher taught you) and a number of ticks:

    m.start(120, 50);

You can interrupt the execution with:

    m.stop()

At fast tempos, the weight occasionally gets disconnected from the metronome's arm. I addressed this issue with Raphael's ```.animateWith()``` function [on Stack Overflow][2], but I'm not convinced the accepted answer is complete.
