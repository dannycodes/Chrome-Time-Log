var storageId = "Pages";
var bkg = chrome.extension.getBackgroundPage();

document.addEventListener("DOMContentLoaded", function (e)
{
	// Grab their data from storage
	chrome.storage.sync.get("Pages", function (p)
	{
		var rows = [];
		var table = document.getElementById('table');
		Pages = p[storageId];
		// iterate over all the sites they've been to
		Object.keys(Pages).forEach( function (key)
		{
			var timeObjs = Pages[key];
			var total_day = 0;
			// iterate over each time they were in on each page
			timeObjs.forEach(function (timeObj)
			{
				// only grab data from today (for now)
				var beginToday = new Date();
				beginToday.setHours(0,0,0,0);

				var ellapsed_time = timeObj.ellapsed_time;
				total_day += ellapsed_time;
			});	
			console.log(total_day);
			var human_readable_time = convertToRealTime(total_day);
			rows.push( {time: total_day, timestamp : human_readable_time, site: key });

			console.log(key + " for a total time of " + human_readable_time);
		})
		rows.sort(function (a, b)
		{
			if (a.time > b.time) 
			{
				return -1
			}
			if (a.time < b.time)
			{
				return 1
			}
			return 0
		});
		rows.forEach(function (row)
		{
			makeDOM(row.site, row.timestamp)
		})
	})
})

function convertToRealTime (sec)
{
	if (sec < 60)
	{
		text = sec.toString() + " seconds.";
		console.log(text);
		return text
	} else if (sec < 3600) {
		mins = parseInt(sec / 60)
		secs = sec % 60;
		text = mins.toString() + " minutes and " + secs.toString() + " seconds.";
		return text
	} else {
		secs = sec % 3600;
		hours  = parseInt(sec / 3600);
		if (secs > 60)
		{
			mins = parseInt(sec / 60);
			seconds = secs % 60;
		} else {
			seconds = sec % 3600 ;
		}
		text = hours.toString() + " hours, " + mins.toString() + " minutes, and " + seconds.toString() + " seconds.";
		return text
	}
}

function makeDOM (key, ellapsed_time)
{
	var row = document.createElement('tr');
	var tdLeft = document.createElement('td');
	tdLeft.textContent = key
	var tdRight = document.createElement('td');
	tdRight.textContent = ellapsed_time
	row.appendChild(tdLeft);
	row.appendChild(tdRight);
	table.appendChild(row)
}