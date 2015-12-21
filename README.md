# Local RSS/XML Feeds Displayer #

*Description:* Local RSS Feeds Displayer takes one or more local RSS/ XML files on your own server and displays their contents on your site in a single output. Sort the output by "date",  title", or "feed", and control which fields get shown and in what order. You can also curtail the number of characters that get output inside certain long fields such as the "description" field.

## Directions ##

*Step 1:* This script uses the following external files:

+ localrssdisplayer.js
+ xmlToJSON.js
+ jQuery (only required if showing feeds as as slider)

*Step 2:* Add the below code to the HEAD section of your page:

	<style>
	/* demo styles. Remove if desired */
	
	#rssdiv ul.rsswrapper li{
	  margin-bottom: 15px;
	}
	
	#rssdiv a{
	  font-weight: bold;
	  color: brown;
	}
	
	#rssdiv span.rssdate{
	  font: bold 14px Arial;
	}
	
	#rssdiv span.rsslabel{
	  font-size: 80%;
	  color: white;
	  background: steelblue;
	  padding: 3px;
	  border-radius: 2px;
	}
	
	#rssdiv2{
	  height: 100px;
		border: 1px solid orange;
	  overflow: hidden;
	}
	
	#rssdiv2 ul.rsswrapper li{
	  margin-bottom: 5px;
	}
	
	#rssdiv2 .rsstitle a{
	  text-decoration: none;
	}
	
	#rssdiv2 span.rssdate{
	  font: bold 12px Arial;
	}
	
	</style>
	
	<!-- jQuery file below optional if not displaying RSS feeds as a slider -->
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
	
	<script src="xmlToJSON.js"></script>
	<script src="localrssdisplayer.js">
	
	/***********************************************
	* Local RSS/XML Feeds Displayer- (c) Dynamic Drive DHTML code library (www.dynamicdrive.com)
	* Please keep this notice intact
	* Visit Dynamic Drive at http://www.dynamicdrive.com/ for this script and 100s more
	***********************************************/
	
	</script>


*Step 3:* Then, add the below sample markup to your page:

	<div id="rssdiv"></div>
	
	<div id="rssdiv2"></div>
	
	<script>
	
	//eg 1: initialize Local RSS Displayer after DIV markup
	
	var whatsnew = new localrssdisplay('rssdiv')
	whatsnew.addFeed('CSS', 'css.rss')
	whatsnew.addFeed('DD', 'dd.rss')
	whatsnew.sortby('title')
	whatsnew.definetemplate('{title} {date} {label}<br />{description}')
	whatsnew.striplimit('description', 100)
	whatsnew.setentriesperfeed(4)
	whatsnew.init()
	
	// eg 2: display RSS feed as a slider
	
	var whatsnew2 = new localrssdisplay('rssdiv2')
	whatsnew2.addFeed('CSS', 'css.rss')
	whatsnew2.definetemplate('{title} {date}')
	whatsnew2.setentriesperfeed(10)
	whatsnew2.setslider({
		rotate: 1,
		pause: 3000,
		cycles: 5
	})
	whatsnew2.init()
	
	</script>

## Local RSS/XML Feeds Displayer ##

See script project page for additional details on setup and documentation: <http://dynamicdrive.com/dynamicindex18/localrssdisplayer/index.htm>
