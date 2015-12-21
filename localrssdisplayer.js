/* Local RSS/XML file Displayer
* Author: Dynamic Drive at http://www.dynamicdrive.com/
* Requires xmlToJSON: https://github.com/metatribal/xmlToJSON
* Requires jQuery if Slider mode enabled
*/

window.requestAnimationFrame = window.requestAnimationFrame
                               || window.mozRequestAnimationFrame
                               || window.webkitRequestAnimationFrame
                               || window.msRequestAnimationFrame
                               || function(f){return setTimeout(f, 1000/60)}

var localrssdisplay = (function(){


	var xmltojsonoptions = {
		mergeCDATA: true,   // extract cdata and merge with text nodes
		grokAttr: true,     // convert truthy attributes to boolean, etc
		grokText: true,     // convert truthy text/attr to boolean, etc
		normalize: true,    // collapse multiple spaces to single space
		xmlns: false,        // include namespaces as attributes in output
		namespaceKey: '_ns',    // tag name for namespace objects
		textKey: '_text',   // tag name for text nodes
		valueKey: '_value',     // tag name for attribute values
		attrKey: '_attr',   // tag for attr groups
		cdataKey: '_text',  // tag for cdata nodes (ignored if mergeCDATA is true)
		attrsAsObject: true,    // if false, key is used as prefix to name, set prefix to '' to merge children and attrs.
		stripAttrPrefix: true,  // remove namespace prefixes from attributes
		stripElemPrefix: true,  // for elements of same name in diff namespaces, you can enable namespaces and access the nskey property
		childrenAsArray: false   // force children into arrays
	}

	function ajaxcall(url, callback){
		var xmlhttp;
		// compatible with IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest()
		xmlhttp.onreadystatechange = function(){
			if (xmlhttp.readyState == 4){
				if (xmlhttp.status == 200){
					callback(xmlhttp.responseXML)
				}
				else{
					callback(xmlhttp.status)
				}
			}
		}
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	}

	function mergeobjects(source, options){ // merges two objects, modifying the source
	    for (k in options){
	        if (options.hasOwnProperty(k)){
	            source[k] = options[k]
	        }
	    }
	}

	function findprop(key, obj, callback){ // find prop inside nested object and return it as a param
		for (prop in obj){
			if (obj.hasOwnProperty(key)){
				callback(obj[key])
				return
			}
			else if (typeof obj[prop] == 'object'){
				findprop(key, obj[prop], callback)
			}
		}
	}

	function limitchars(thetext, limit){
		var baretext = thetext.replace(/(&nbsp;|<([^>]+)>)/ig, '') // strip html tags: http://stackoverflow.com/questions/1499889/remove-html-tags-in-javascript-with-regex
		return (thetext.length > limit)? baretext.substr(0, limit) + '...' : baretext
	}

////// Begin main localrssdisplay constructor function //////

	function localrssdisplay(id){
		var thisinst = this
		this.container = document.getElementById(id)
		this.feeds = []
		this.entries = []
		this.entriesperfeed = 10 // default entries per feed
		this.sortstr = 'date' // default sort field
		this.limiter = {field:null, maxchars:null}
		this.entrycontainertag = 'li'
		this.templatestr = '{title} {label} {date}<br />{description}' // default template str
		this.slidermode = {enabled:false, rotate:3, pause:1500, fxduration:500, cycles:3, timesrun:0, maxruns:null, finalrunmsgs: null, starttime:0, $rsswrapper: null} // default slider settings and vars
	}

	localrssdisplay.prototype = {

		addFeed: function(label, url){
			this.feeds.push([label, url])
		},

		setentriesperfeed: function(num){
			this.entriesperfeed = num
		},

		sortby: function(sortstr){
			this.sortstr = sortstr
		},

		striplimit: function(field, maxchars){
			this.limiter[field] = maxchars
		},

		setentrycontainertag:function(tag){
			this.entrycontainertag = tag
		},

		definetemplate:function(str){
			this.templatestr = str
		},

		setslider:function(options){
			mergeobjects(this.slidermode, options)
			this.slidermode.enabled = true
		},


		_slider: function(timestamp){
			var thisinst = this
			var slidermode = this.slidermode
			if (typeof timestamp == 'undefined'){ //if browsers don't support requestAnimationFrame, generate our own timestamp
				var timestamp = new Date().getTime()
			}
			if (slidermode.starttime === 0){ //requestAnimationFrame has been reset?
				slidermode.starttime = timestamp
			}
			if (slidermode.timesrun == slidermode.maxruns){
				return
			}
			var runtime = timestamp - slidermode.starttime

			if (slidermode.starttime != -1 && runtime >= slidermode.pause){ // starttime of -1 means requestAnimationFrame should be paused
				var $rsswrapper = slidermode.$rsswrapper
				var msgstorotate = (slidermode.timesrun != (slidermode.maxruns-1))? slidermode.rotate : slidermode.finalrunmsgs
				var $entriestodismiss = $rsswrapper.find(this.entrycontainertag).slice(0, msgstorotate)
				var $entrywrapper = $entriestodismiss.wrapAll('<div style="position:relative" />').parent()
				$entrywrapper.stop().animate({opacity:0}, slidermode.fxduration, function(){
					$(this).stop().animate({height:0}, slidermode.fxduration, function(){
						$entriestodismiss.unwrap().appendTo($rsswrapper)
						$entrywrapper = null
						thisinst.slidermode.starttime = 0
						thisinst.slidermode.timesrun += 1
						requestAnimationFrame(function(timestamp){thisinst._slider(timestamp)})
					})
				})
			}
			else{
				requestAnimationFrame(function(timestamp){thisinst._slider(timestamp)})
			}
		},


		_displayfeeds: function(outertag){
			var thisinst = this
			var output = ''
			for (var i=0; i<this.entries.length; i++){
				var entry = this.entries[i]
				var entryoutput = this.templatestr
				entryoutput = entryoutput.replace(/({title})|({url})|({label})|({date})|({description})/ig, function(m){ // template keywords and their replacements
					if (m == "{title}"){
						var titleval = entry.title[xmltojsonoptions.textKey]
						if (typeof thisinst.limiter['title'] == 'number'){ // limit title field?
							titleval = limitchars(titleval, thisinst.limiter['title'])
						}
						return '<span class="rsstitle"><a href="' + entry.link[xmltojsonoptions.textKey] + '">' + titleval + '</a></span>'
					}
					else if (m == "{url}"){
						return entry.link[xmltojsonoptions.textKey]
					}
					else if (m == "{label}"){
						return '<span class="rsslabel">' + entry._label + '</span>'
					}
					else if (m == "{date}"){
						return '<span class="rssdate">' + entry._pubdate.toLocaleDateString() + '</span>'
					}
					else if (m == "{description}"){
						var descval = entry.description[xmltojsonoptions.textKey]
						if (typeof thisinst.limiter['description'] == 'number'){ // limit desc field?
							descval = limitchars(descval, thisinst.limiter['description'])
						}
						return '<span class="rssdesc">' + descval + '</span>'
					}
				})
				entryoutput = '<' + outertag + ' class="rssentry">' + entryoutput + '</' + outertag + '>' // add tag from param around each entry
				output += entryoutput
			} // end for loop
			if (outertag.toLowerCase() == 'li'){
				output = '<ul class="rsswrapper">' + output + '</ul>'
			}
			else{
				output = '<div class="rsswrapper">' + output + '</div>'
			}
			this.container.innerHTML = output
		},

		_sortfeeds: function(){
			var arr = this.entries
			var sortstr = this.sortstr
			if (sortstr=="title" || sortstr=="label"){ //sort array by "title._text" or "_label" property of RSS feed entries[]
				arr.sort(function(a,b){
				var fielda = (sortstr == 'title')? a.title._text : a._ddlabel
				var fieldb = (sortstr == 'title')? b.title._text : b._ddlabel
				return (fielda<fieldb)? -1 : (fielda>fieldb)? 1 : 0
				})
			}
			else{ //else, sort by date
				try{
					arr.sort(function(a,b){return new Date(b._pubdate)-new Date(a._pubdate)})
				}
				catch(err){}
			}
		},

		_initslider: function(){
			var thisinst = this
			this.slidermode.$rsswrapper = $(this.container).find('.rsswrapper')
			
			$(this.container).on('mouseenter', function(){
				thisinst.slidermode.starttime = -1
			})
			$(this.container).on('mouseleave', function(){
				thisinst.slidermode.starttime = 0
			})
			requestAnimationFrame(function(timestamp){thisinst._slider(timestamp)})
		},
		
		init: function(){
			var thisinst = this
			var feedsloaded = 0
			for (var i=0; i<this.feeds.length; i++){
				var feedlabel = this.feeds[i][0]
				;(function(label){ // closure to capture feedlabel inside for loop
					ajaxcall(thisinst.feeds[i][1], function(r){ // async call to fetch feed
						var jsonfeed = xmlToJSON.parseXML(r, xmltojsonoptions)
						findprop('item', jsonfeed, function(result){
							var items = result
							var limit = Math.min(items.length, thisinst.entriesperfeed)
							for (var p = 0; p < limit; p++){
								items[p]._label = label
								items[p]._pubdate = new Date( ( items[p].pubDate? items[p].pubDate : items[p].date )._text )
								thisinst.entries.push(items[p])
							}
							feedsloaded++
							if (feedsloaded == thisinst.feeds.length){ // if all feeds loaded
								thisinst._sortfeeds()
								thisinst._displayfeeds(thisinst.entrycontainertag)
								if (thisinst.slidermode.enabled){
									if (!window.jQuery){
										alert('jQuery is required for the Slider component of script to work!')
										return
									}
									var entries_by_cycles = thisinst.entries.length * thisinst.slidermode.cycles
									thisinst.slidermode.maxruns = Math.ceil(entries_by_cycles / thisinst.slidermode.rotate) // calculate # of times messages should be removed
									thisinst.slidermode.finalrunmsgs = entries_by_cycles % thisinst.slidermode.rotate // number of messages to remove for final run
									if (thisinst.slidermode.finalrunmsgs == 0){
										thisinst.slidermode.finalrunmsgs = thisinst.slidermode.rotate
									}
									thisinst._initslider()
								}
							}
						})
					})
				})(feedlabel)
			}
		}
		
	}

	return localrssdisplay

})()