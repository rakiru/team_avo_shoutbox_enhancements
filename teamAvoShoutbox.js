var shoutboxUtilities = (function () {
  //requestAnimationFrame polyfill
	(function () {
		var lastTime = 0,
        vendors = ['ms', 'moz', 'webkit', 'o'];

		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = 
			  window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
		}
	 
		if (!window.requestAnimationFrame)
			window.requestAnimationFrame = function(callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
				  timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
	 
		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
	}());
  
  //Prototype additions
  Array.prototype.includes = function(value) {
    for(var i = 0; i < this.length; i++) {
      if(this[i] === value) {
        return true;
      }
    }
    return false;
  };
	
	//instance variables
	var timer = 0,
		colorCycle = 0,
		helper = {},
		refresh = $('shoutbox-refresh-button');
	
	//generate DOM additions
	if(!shoutboxUtilities) {
		$('shoutbox-refresh-button').parentElement.insert({bottom : "<div style='display: inline-block' class='input_submit alt' id='shoutboxEx-autoRefresh'>Auto-Refresh</div><div style='display: inline-block; margin-left: 4px;' class='input_submit alt'>Height: <input value='' style='width: 35px; border: 1px solid #888; color: #CCC; background: #111' type='text' id='shoutboxEx-heightIn'></div><div style='display: inline-block; margin-left: 4px;' class='input_submit alt' id='shoutboxEx-rainbowText'>Reading Rainbow</div>"});
	
    //ipb overrides	
    ipb.shoutbox._updateShouts = ipb.shoutbox.updateShouts;
    
    ipb.shoutbox.updateShouts = function(response) {
      var titleCycler = 0,
          numCycles = 0;
      
      helper.originalPageTitle = helper.originalPageTitle || document.title;
      
      if(response) {
        clearInterval(titleCycler);
        titleCycler = setInterval(function() {
          if(document.title == helper.originalPageTitle) {
            document.title = "[New Message!]";
          } else {
            document.title = helper.originalPageTitle;
          }
          
          if((!document.hasFocus && numCycles > 4) || document.hasFocus()) {
            clearInterval(titleCycler);
            document.title = helper.originalPageTitle;
          }
          numCycles++;
        }, 5000);
      }
      
      ipb.shoutbox._updateShouts(response);
    };
    
    ipb.shoutbox._submitShout = ipb.shoutbox.submitShout;
    
    ipb.shoutbox.submitShout = function() {
      var shout = parseCommand(ipb.shoutbox.getShout());
      if(Object.keys(commands).includes(shout[0])) {
        ipb.shoutbox.clearShout();
        commands[shout[0]](shout.slice(1));
      } else {
        ipb.shoutbox._submitShout();
      }
    };
    
    ipb.shoutbox.produceError = function (error) {
      var errorDiv='app';if(ipb.shoutbox.global_on) {
        if(ipb.shoutbox.can_edit&&ipb.shoutbox.mod_in_action)
        {errorDiv='editShout';}
        else
        {errorDiv='glb';}
      }
      else if(ipb.shoutbox.in_prefs)
        {errorDiv='myprefs';}
      else if(ipb.shoutbox.in_mod)
        {errorDiv='moderator';}
      else if(ipb.shoutbox.in_archive)
        {errorDiv='archive';}
      if(ipb.shoutbox.errors[error])
        {error=ipb.shoutbox.errors[error];}
      if($('shoutbox-inline-error-'+errorDiv)) {
        $('shoutbox-inline-error-'+errorDiv).update(error).show();
        var timeToHide = 2000;
        if(error.match("Shout flooding is enabled.")) {
          var secondsTillPost = error.match(/\d+/)[0],
            countdownTimer = 0;
          
          countdownTimer = setInterval(function() {
            secondsTillPost--;
            $('shoutbox-inline-error-'+errorDiv).update(error.replace(/\d+/, secondsTillPost));
            if(secondsTillPost == 0) {
              clearInterval(countdownTimer);
            }
          }, 1000);
          
          timeToHide = secondsTillPost*1000;
        }
        setTimeout("$('shoutbox-inline-error-"+ errorDiv+"').hide()",timeToHide);
      }
      else
        {alert(error);}
    }
	}
	
	//set extension controls
	var autoRefresh = $('shoutboxEx-autoRefresh');
	
	autoRefresh.on('click', function() {
		if(timer == 0) {
			helper.startAutoRefresh();
		} else {
			helper.stopAutoRefresh();
		}
	});
	
	var rainbowButton = $('shoutboxEx-rainbowText');
	
	rainbowButton.on('click', function() {
		if(colorCycle == 0) {
			helper.startCyclingColor();
		} else {
			helper.stopCyclingColor();
		}
	});
	
	$("shoutboxEx-heightIn").setValue($('shoutbox-shouts').getStyle('height').replace(/\D/g, '')).on("keyup", function(e, el) {
		if(e.keyCode == Event.KEY_RETURN) {
			helper.setHeight(el.getValue());
		}
	});
	
	//helper core functions
	function runAnimations() {
		colorCycle = requestAnimationFrame(runAnimations);
		changeNameColors();
	};
	
	function changeNameColors() {
    var elementSelector = "#shoutbox-shouts .name span";
    
    if(helper.cycleChatColors) {
      elementSelector += ", #shoutbox-shouts .shoutbox_text";
    }
    
		for(var i = 0, nl = $$(elementSelector); i < nl.length; i++) {
			var el = nl[i];
			var rgb = el.getStyle('color').match(/rgb\((\d+),\s?(\d+),\s?(\d+)\)/);
			if(rgb && rgb.length == 4) {
				var index = 1;
				
				if(rgb[2] == 0 && rgb[3] != 0 && rgb[3] != 255) {
          index = 3;
				} else {
					for(var j = 1; j < 4; j++) {
						if(rgb[j] != 0) {
							index = j;
							break;
						}
					}
				}
        var colorDir = el.dataset.colorDir = el.dataset.colorDir || (Math.random() > 0.4 ? 1 : -1);
        
				
				if(index != 0) {
					colorDir > 0 ? rgb[index]-- : rgb[index]++;
					if(rgb[index] < 0) rgb[index] = 0;
					if(index == 3) index = 0;
          colorDir > 0 ? rgb[index+1]++ : rgb[index+1]--;
					if(rgb[index+1] > 255) rgb[index+1] = 255;
					
					el.setStyle({'color' : 'rgb('+rgb[1]+', '+rgb[2]+', '+rgb[3]+')'});
				} 
			} else {
        el.setStyle({'color' : 'rgb(255,255,255)'});
        console.log(el, "blah");
      }
		}
	};
  
  function parseCommand(shout) {
    if(!shout.match(/^\//)) {
      return false;
    }
    
    return shout.substring(1).split(" ");
  };
  
  helper.cycleChatColors = false;
	
	helper.setShadyOverrides = function() {
    ipb.shoutbox._displayInactivePrompt = ipb.shoutbox.displayInactivePrompt;
    ipb.shoutbox.displayInactivePrompt = function() {};
	};
	
	helper.setInterval = function(length) {
		ipb.shoutbox.shouts_refresh = length || ipb.shoutbox.shouts_refresh;
		if(timer != 0) {
			helper.startAutoRefresh();
		}
	};
	
	helper.startAutoRefresh = function() {
		if(timer != 0) {
			helper.stopAutoRefresh();
		}
		refresh.setStyle({'visibility' : 'hidden', 'position' : 'absolute'});
		timer = setInterval(function() { ipb.shoutbox.refreshShouts(); }, ipb.shoutbox.shouts_refresh);
		autoRefresh.setStyle({'color' : 'white'});
	};
	
	helper.stopAutoRefresh = function() {
		clearInterval(timer);
		refresh.setStyle({'visibility' : '', 'position' : ''});
		timer = 0;
		autoRefresh.setStyle({'color' : ''});
	};
	
	helper.setHeight = function(height) {
		height = height || 132;
		$('shoutbox-shouts').setStyle({'height' : height+'px'});
	};
	
	helper.startCyclingColor = function() {
		colorCycle = requestAnimationFrame(runAnimations);
		rainbowButton.setStyle({'color' : "white"});
	};
	
	helper.stopCyclingColor = function() {
		cancelAnimationFrame(colorCycle);
		colorCycle = 0;
			rainbowButton.setStyle({'color' : ""});
	};
  
  helper.postStatusMessage = function(message) {
    ipb.shoutbox._updateShouts("<tr class='row1'><td colspan=3>"+message+"</td></tr>");
  }; 
  
  //custom chat commands
  var commands = {
    noShow : ["noShow", "shadyoverrides"],
    
    help : function() {
      var helpMessage = "Current commands are:<ul style='list-style: square; padding-left: 20px;'>";
      for (var i = 0, keys = Object.keys(commands); i < keys.length; i++) {
        var key = keys[i];
        if(!commands.noShow.includes(key)) {
          helpMessage += "<li>/"+key+"</li>";
        }
      }
      helpMessage += "</ul>";
      
      helper.postStatusMessage(helpMessage);
    },
    /*rainbowtext : function(args) {
      var text = args.join(" ");
      if(args[0].match(/^-start/) {
        var colorStart = args[2];
        text = args.slice(3).join(" ");
      }
    }, */
    
    hardcoremode : function() {
      helper.cycleChatColors = !helper.cycleChatColors;
      helper.postStatusMessage("Hardcore Mode is now " + (helper.cycleChatColors ? "on" : "off"));
    },
    
    shadyoverrides : function() {
      helper.setShadyOverrides();
      helper.postStatusMessage("Shady overrides set.");
    }
  };
	
	return helper;
})();