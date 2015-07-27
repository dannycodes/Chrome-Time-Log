
// Page Loads and we run this

onPageLoad();

// Since we stop the main clock when we leave the page, we have
// two options, we can either timestamp start and end times
// or we can count the seconds while we are off-page.
// I elect for the latter.

var off_page_counter;
var time_counter;
var page_load_time;
var ellapsed_time = 0;
var off_page_count = 0;

// this is the amount of time ellapsed on that site since
// the beginning of the day.
var prev_time = 0;

function onPageLoad()
{
	console.log('page has loaded.');
	page_load_time = new Date(); // create a Date that is now. 
	
	// since we don't really care about a second or two of error
	// lets just do the asnyc call here
	chrome.runtime.sendMessage(
	{
		 intent: 'get_time',
		 url: (new URL(window.location.href)).hostname
	}, function (response)
	{
		console.info(response);
		if (response.time)
		{
			console.log(response.time)
			prev_time = response.time
			timeCount(prev_time);
		} else {

			err = "no response.time obj from sendMessage callback";
			console.warn(err);
			timeCount(prev_time)
		}
	})

	//  Only called when we leave the page
	window.onblur = function() 
	{ 
		clearInterval(off_page_counter);
		clearInterval(time_counter);

		console.log('window blur');

		// instantiate a time interval for when off-page
		offPageCount()
	}

	// only called when we return to the page
	window.onfocus = function() 
	{ 
		clearInterval(off_page_counter);
		clearInterval(time_counter);

		console.log('window focused');
		console.info(time_counter);

		timeCount(prev_time);
	}
	
	// when page is closed, store the ellapsed time.
	window.onunload = function(){ storeTime() }
}

// send start timestamp, ellapsed time, time off page to bg page
function storeTime()
{
	var url = window.location.href;
	chrome.runtime.sendMessage( 
		{
			intent: 'store_time',
			start_time: +page_load_time,
			ellapsed_time: ellapsed_time, 
			off_page_time: off_page_count,
			url: url 
		}, function(response) {
		console.log(response.success);
	});
}

function timeCount (prev_time)
{	
	time_counter = setInterval(function () 
	{
		ellapsed_time += 1;
		if ((ellapsed_time + prev_time) > (60*15))
		{
			notification()
		}
	}, 1000)
}

function offPageCount ()
{
	off_page_counter = setInterval(function()
	{
		off_page_count += 1
	}, 1000)
}

// Not completed, just a test function.
// We need to include the rest of the time
// spent on FB today.
function notification ()
{
	console.log('creating notification');
	chrome.runtime.sendMessage(
	{
			intent: 'notification',
			TemplateType : "basic", 
			iconUrl : "./clock.png",
			title : "You've spent 15 minutes on " + (new URL(window.location.href)).hostname,
			message: "You said you were only going to spend 10 minutes a day on " + (new URL(window.location.href)).hostname
	})
	return false
}